import asyncio
import json
from datetime import date, datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models.daily_evaluation import DailyEvaluation

router = APIRouter(prefix="/api/evaluations", tags=["Daily Evaluation (FIT-57)"])

WIB = timezone(timedelta(hours=7))
_auto_triggered_dates: set[str] = set()


def get_wib_now() -> datetime:
    return datetime.now(WIB)


class ManualEvaluationRequest(BaseModel):
    id_user: int = 1
    tanggal: Optional[str] = None  # Format YYYY-MM-DD (opsional, default hari ini WIB)
    # Opsional: override nilai aktual untuk keperluan pengujian skenario (tercapai / kurang / berlebih)
    aktual_energi: Optional[float] = None
    aktual_protein: Optional[float] = None
    aktual_karbo: Optional[float] = None
    aktual_lemak: Optional[float] = None
    aktual_air: Optional[float] = None
    kalori_olahraga: Optional[float] = None


def _ambil_agregasi_log_harian(db: Session, id_user: int, target_date: date) -> dict:
    """
    Mengambil total asupan makanan, aktivitas olahraga, dan konsumsi air dari tabel log.
    Jika tabel log belum terisi untuk tanggal tersebut, gunakan nilai default representatif.
    """
    data = {
        "aktual_energi": None,
        "aktual_protein": None,
        "aktual_karbo": None,
        "aktual_lemak": None,
        "jumlah_log_makan": 0,
        "kalori_olahraga": None,
        "durasi_olahraga": 0,
        "jumlah_log_aktivitas": 0,
        "aktual_air": None,
        "jumlah_log_air": 0,
    }

    # 1. Cek log makanan (food_logs)
    try:
        row_food = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS cnt,
                    COALESCE(SUM(kalori), 0) AS total_kalori,
                    COALESCE(SUM(protein), 0) AS total_protein,
                    COALESCE(SUM(karbohidrat), 0) AS total_karbo,
                    COALESCE(SUM(lemak), 0) AS total_lemak
                FROM food_logs
                WHERE id_user = :uid AND DATE(tanggal) = :tgl
                """
            ),
            {"uid": id_user, "tgl": target_date},
        ).fetchone()
        if row_food and row_food[0] > 0:
            data["jumlah_log_makan"] = int(row_food[0])
            data["aktual_energi"] = float(row_food[1])
            data["aktual_protein"] = float(row_food[2])
            data["aktual_karbo"] = float(row_food[3])
            data["aktual_lemak"] = float(row_food[4])
    except Exception:
        db.rollback()

    # 2. Cek log aktivitas olahraga (activity_logs)
    try:
        row_act = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS cnt,
                    COALESCE(SUM(kalori_terbakar), 0) AS total_kalori,
                    COALESCE(SUM(durasi_menit), 0) AS total_durasi
                FROM activity_logs
                WHERE id_user = :uid AND DATE(tanggal) = :tgl
                """
            ),
            {"uid": id_user, "tgl": target_date},
        ).fetchone()
        if row_act and row_act[0] > 0:
            data["jumlah_log_aktivitas"] = int(row_act[0])
            data["kalori_olahraga"] = float(row_act[1])
            data["durasi_olahraga"] = int(row_act[2])
    except Exception:
        db.rollback()

    # 3. Cek log hidrasi (water_logs)
    try:
        row_water = db.execute(
            text(
                """
                SELECT
                    COUNT(*) AS cnt,
                    COALESCE(SUM(volume_ml), 0) AS total_ml
                FROM water_logs
                WHERE id_user = :uid AND DATE(tanggal) = :tgl
                """
            ),
            {"uid": id_user, "tgl": target_date},
        ).fetchone()
        if row_water and row_water[0] > 0:
            data["jumlah_log_air"] = int(row_water[0])
            data["aktual_air"] = float(row_water[1])
    except Exception:
        db.rollback()

    return data


def _generate_saran_korektif(
    status_energi: str,
    aktual_energi: float,
    target_energi: float,
    aktual_protein: float,
    target_protein: float,
    aktual_karbo: float,
    target_karbo: float,
    aktual_air: float,
    target_air: float,
    kalori_olahraga: float,
) -> list[dict]:
    """Men-generate catatan pendamping sehat (saran korektif untuk besok)."""
    saran = []

    # Evaluasi Energi
    if status_energi == "kurang":
        selisih = round(target_energi - aktual_energi)
        saran.append(
            f"Asupan energi hari ini masih kurang sekitar {selisih:,} kkal dari target. "
            "Tambahkan porsi karbohidrat kompleks atau camilan sehat di sela waktu makan besok."
        )
    elif status_energi == "berlebih":
        selisih = round(aktual_energi - target_energi)
        saran.append(
            f"Asupan energi melebihi target sekitar {selisih:,} kkal. "
            "Besok coba kurangi porsi gorengan atau minuman manis dan perbanyak sayur berserat."
        )

    # Evaluasi Protein
    if aktual_protein >= target_protein:
        saran.append(
            "Protein sudah tercukupi. Coba bagi lauk sumber protein lebih merata "
            "antara sarapan, siang, dan malam."
        )
    else:
        kurang_p = round(target_protein - aktual_protein)
        saran.append(
            f"Asupan protein masih kurang {kurang_p} g dari sasaran harian. "
            "Sertakan telur, ikan, dada ayam, atau tempe pada setiap jam makan utama besok."
        )

    # Evaluasi Hidrasi
    if aktual_air >= target_air:
        if kalori_olahraga > 0:
            saran.append(
                "Air mencapai target, termasuk bonus olahraga. Siapkan botol sebelum "
                "beraktivitas agar kebiasaan ini lebih mudah diulang."
            )
        else:
            saran.append(
                "Target hidrasi harianmu tercapai penuh. Pertahankan ritme minum segelas air "
                "setiap 2 jam mulai pagi hari."
            )
    else:
        kurang_air = round(target_air - aktual_air)
        saran.append(
            f"Hidrasi hari ini masih kurang {kurang_air:,} ml dari target. "
            "Letakkan botol minum di meja kerja dan aktifkan pengingat minum air setiap 2 jam."
        )

    # Evaluasi Karbohidrat jika belum ada 2 saran
    if len(saran) < 2 and aktual_karbo > target_karbo * 1.1:
        saran.append(
            "Porsi karbohidrat sedikit di atas sasaran. Ganti sebagian nasi putih dengan "
            "nasi merah atau oat agar kenyang lebih tahan lama."
        )

    return [{"nomor": f"{idx + 1:02d}", "teks": teks} for idx, teks in enumerate(saran[:3])]


def _kirim_notifikasi_evaluasi(
    db: Session,
    id_user: int,
    skor_kepatuhan: int,
    status_energi: str,
    waktu_wib: datetime,
) -> dict:
    """Menyimpan notifikasi laporan evaluasi malam ke tabel notification (FIT-60)."""
    jam_str = waktu_wib.strftime("%H.%M")
    judul = "Evaluasi Malam siap dilihat"
    pesan = (
        f"Skor kepatuhan hari ini {skor_kepatuhan}/100 (Energi {status_energi}). "
        f"Lihat ringkasan & catatan pendampingmu • {jam_str} WIB"
    )
    waktu_kirim = f"Hari ini • {jam_str} WIB"
    tautan = "/jurnal-evaluasi"

    try:
        db.execute(
            text(
                """
                INSERT INTO notification
                    (id_user, kategori, judul, pesan, waktu_kirim, tautan_tujuan, sudah_dibaca)
                VALUES
                    (:uid, :kategori, :judul, :pesan, :waktu_kirim, :tautan, :dibaca)
                """
            ),
            {
                "uid": id_user,
                "kategori": "evaluasi_malam",
                "judul": judul,
                "pesan": pesan,
                "waktu_kirim": waktu_kirim,
                "tautan": tautan,
                "dibaca": False,
            },
        )
        db.commit()
    except Exception as err:
        db.rollback()
        print(f"[INFO] Tabel notification belum tersedia / dilewati: {err}")

    return {
        "kategori": "evaluasi_malam",
        "judul": judul,
        "pesan": pesan,
        "waktu_kirim": waktu_kirim,
        "tautan_tujuan": tautan,
    }


def _format_evaluation_response(record: DailyEvaluation) -> dict:
    """Memformat record database menjadi struktur JSON siap pakai oleh frontend."""
    tone_map = {"tercapai": "good", "kurang": "low", "berlebih": "high"}
    status_tone = tone_map.get(record.status_energi, "good")

    diff_protein = round(record.aktual_protein - record.target_protein)
    diff_karbo = round(record.aktual_karbo - record.target_karbo)
    diff_lemak = round(record.aktual_lemak - record.target_lemak)
    pct_air = round((record.aktual_air / record.target_air) * 100) if record.target_air > 0 else 100

    saran_list = json.loads(record.saran_korektif) if record.saran_korektif else []

    return {
        "id_evaluation": record.id_evaluation,
        "id_user": record.id_user,
        "tanggal_evaluasi": record.tanggal_evaluasi.isoformat(),
        "skor_kepatuhan": record.skor_kepatuhan,
        "status_energi": record.status_energi,
        "status_tone": status_tone,
        "persentase_energi": record.persentase_energi,
        "tipe_pemicu": record.tipe_pemicu,
        "waktu_evaluasi": record.waktu_evaluasi.strftime("%H.%M WIB"),
        "ringkasan_tabel": [
            {
                "komponen": "Energi",
                "target": f"{int(record.target_energi):,}".replace(",", ".") + " kkal",
                "aktual": f"{int(record.aktual_energi):,}".replace(",", ".") + " kkal",
                "ringkasan": f"{record.persentase_energi}% · {record.status_energi}",
                "tone": status_tone,
            },
            {
                "komponen": "Protein",
                "target": f"{int(record.target_protein)} g",
                "aktual": f"{int(record.aktual_protein)} g",
                "ringkasan": f"{'+' if diff_protein >= 0 else ''}{diff_protein} g",
                "tone": "good" if diff_protein >= 0 else "low",
            },
            {
                "komponen": "Karbohidrat",
                "target": f"{int(record.target_karbo)} g",
                "aktual": f"{int(record.aktual_karbo)} g",
                "ringkasan": f"{'+' if diff_karbo >= 0 else ''}{diff_karbo} g",
                "tone": "good" if abs(diff_karbo) <= 20 else "low",
            },
            {
                "komponen": "Lemak",
                "target": f"{int(record.target_lemak)} g",
                "aktual": f"{int(record.aktual_lemak)} g",
                "ringkasan": f"{'+' if diff_lemak >= 0 else '−'}{abs(diff_lemak)} g",
                "tone": "neutral",
            },
            {
                "komponen": "Air minum",
                "target": f"{int(record.target_air):,}".replace(",", ".") + " ml",
                "aktual": f"{int(record.aktual_air):,}".replace(",", ".") + " ml",
                "ringkasan": f"{pct_air}% · {'tercapai' if pct_air >= 90 else 'kurang'}",
                "tone": "water" if pct_air >= 90 else "low",
            },
        ],
        "detail": {
            "target_energi_dasar": record.target_energi_dasar,
            "kalori_olahraga": record.kalori_olahraga,
            "target_energi": record.target_energi,
            "aktual_energi": record.aktual_energi,
            "target_air_dasar": record.target_air_dasar,
            "bonus_air_olahraga": record.bonus_air_olahraga,
            "target_air": record.target_air,
            "aktual_air": record.aktual_air,
            "jumlah_log_makan": record.jumlah_log_makan,
            "jumlah_log_aktivitas": record.jumlah_log_aktivitas,
            "durasi_olahraga": record.durasi_olahraga,
            "jumlah_log_air": record.jumlah_log_air,
        },
        "saran_korektif": saran_list,
    }


def evaluasiMalam(
    db: Session,
    id_user: int = 1,
    target_date: Optional[date] = None,
    tipe_pemicu: str = "manual",
    overrides: Optional[dict] = None,
    kirim_notifikasi: bool = True,
) -> dict:
    """
    FIT-59: Fungsi utama evaluasiMalam() untuk:
    1. Menghitung pencapaian harian (Energi, Protein, Karbohidrat, Lemak, Air Minum & Skor Kepatuhan)
    2. Menentukan status energi ('tercapai' 90-110%, 'kurang' <90%, 'berlebih' >110%)
    3. Men-generate saran korektif untuk esok hari
    4. Menyimpan hasil evaluasi ke tabel daily_evaluation
    5. Mengirim notifikasi laporan evaluasi ke tabel notification (FIT-60)
    """
    now_wib = get_wib_now()
    eval_date = target_date or now_wib.date()
    overrides = overrides or {}

    agregasi = _ambil_agregasi_log_harian(db, id_user, eval_date)

    # Target dasar harian
    target_energi_dasar = 1700.0
    target_protein = 100.0
    target_karbo = 190.0
    target_lemak = 60.0
    target_air_dasar = 2240.0

    # Nilai aktual & olahraga (prioritas: parameter override -> hasil query DB -> nilai default contoh)
    kalori_olahraga = (
        overrides["kalori_olahraga"]
        if overrides.get("kalori_olahraga") is not None
        else (agregasi["kalori_olahraga"] if agregasi["kalori_olahraga"] is not None else 258.0)
    )
    bonus_air_olahraga = 400.0 if kalori_olahraga > 0 else 0.0

    target_energi = target_energi_dasar + kalori_olahraga
    target_air = target_air_dasar + bonus_air_olahraga

    aktual_energi = (
        overrides["aktual_energi"]
        if overrides.get("aktual_energi") is not None
        else (agregasi["aktual_energi"] if agregasi["aktual_energi"] is not None else 1800.0)
    )
    aktual_protein = (
        overrides["aktual_protein"]
        if overrides.get("aktual_protein") is not None
        else (agregasi["aktual_protein"] if agregasi["aktual_protein"] is not None else 110.0)
    )
    aktual_karbo = (
        overrides["aktual_karbo"]
        if overrides.get("aktual_karbo") is not None
        else (agregasi["aktual_karbo"] if agregasi["aktual_karbo"] is not None else 210.0)
    )
    aktual_lemak = (
        overrides["aktual_lemak"]
        if overrides.get("aktual_lemak") is not None
        else (agregasi["aktual_lemak"] if agregasi["aktual_lemak"] is not None else 58.0)
    )
    aktual_air = (
        overrides["aktual_air"]
        if overrides.get("aktual_air") is not None
        else (agregasi["aktual_air"] if agregasi["aktual_air"] is not None else 2640.0)
    )

    # 1. Hitung persentase energi & skor kepatuhan (rerata rasio 5 komponen, max 100% per komponen)
    persentase_energi = round((aktual_energi / target_energi) * 100) if target_energi > 0 else 0

    rasio_energi = min(aktual_energi / target_energi, 1.0) if target_energi > 0 else 0.0
    rasio_protein = min(aktual_protein / target_protein, 1.0) if target_protein > 0 else 0.0
    rasio_karbo = min(aktual_karbo / target_karbo, 1.0) if target_karbo > 0 else 0.0
    rasio_lemak = min(aktual_lemak / target_lemak, 1.0) if target_lemak > 0 else 0.0
    rasio_air = min(aktual_air / target_air, 1.0) if target_air > 0 else 0.0

    skor_kepatuhan = round(
        ((rasio_energi + rasio_protein + rasio_karbo + rasio_lemak + rasio_air) / 5.0) * 100
    )

    # 2. Tentukan status energi sesuai aturan UI FitBite (90-110% tercapai, <90% kurang, >110% berlebih)
    if persentase_energi < 90:
        status_energi = "kurang"
    elif persentase_energi > 110:
        status_energi = "berlebih"
    else:
        status_energi = "tercapai"

    # 3. Generate saran korektif
    saran_list = _generate_saran_korektif(
        status_energi=status_energi,
        aktual_energi=aktual_energi,
        target_energi=target_energi,
        aktual_protein=aktual_protein,
        target_protein=target_protein,
        aktual_karbo=aktual_karbo,
        target_karbo=target_karbo,
        aktual_air=aktual_air,
        target_air=target_air,
        kalori_olahraga=kalori_olahraga,
    )

    # 4. Simpan atau perbarui (Upsert) ke tabel daily_evaluation
    existing = (
        db.query(DailyEvaluation)
        .filter(
            DailyEvaluation.id_user == id_user,
            DailyEvaluation.tanggal_evaluasi == eval_date,
        )
        .first()
    )

    jumlah_makan = agregasi["jumlah_log_makan"] or 4
    jumlah_aktivitas = agregasi["jumlah_log_aktivitas"] or (2 if kalori_olahraga > 0 else 0)
    durasi_olahraga = agregasi["durasi_olahraga"] or (50 if kalori_olahraga > 0 else 0)
    jumlah_air = agregasi["jumlah_log_air"] or 7

    if existing:
        existing.skor_kepatuhan = skor_kepatuhan
        existing.status_energi = status_energi
        existing.persentase_energi = persentase_energi
        existing.target_energi_dasar = target_energi_dasar
        existing.kalori_olahraga = kalori_olahraga
        existing.target_energi = target_energi
        existing.aktual_energi = aktual_energi
        existing.target_protein = target_protein
        existing.aktual_protein = aktual_protein
        existing.target_karbo = target_karbo
        existing.aktual_karbo = aktual_karbo
        existing.target_lemak = target_lemak
        existing.aktual_lemak = aktual_lemak
        existing.target_air_dasar = target_air_dasar
        existing.bonus_air_olahraga = bonus_air_olahraga
        existing.target_air = target_air
        existing.aktual_air = aktual_air
        existing.jumlah_log_makan = jumlah_makan
        existing.jumlah_log_aktivitas = jumlah_aktivitas
        existing.durasi_olahraga = durasi_olahraga
        existing.jumlah_log_air = jumlah_air
        existing.saran_korektif = json.dumps(saran_list, ensure_ascii=False)
        existing.tipe_pemicu = tipe_pemicu
        existing.waktu_evaluasi = now_wib.replace(tzinfo=None)
        record = existing
    else:
        record = DailyEvaluation(
            id_user=id_user,
            tanggal_evaluasi=eval_date,
            skor_kepatuhan=skor_kepatuhan,
            status_energi=status_energi,
            persentase_energi=persentase_energi,
            target_energi_dasar=target_energi_dasar,
            kalori_olahraga=kalori_olahraga,
            target_energi=target_energi,
            aktual_energi=aktual_energi,
            target_protein=target_protein,
            aktual_protein=aktual_protein,
            target_karbo=target_karbo,
            aktual_karbo=aktual_karbo,
            target_lemak=target_lemak,
            aktual_lemak=aktual_lemak,
            target_air_dasar=target_air_dasar,
            bonus_air_olahraga=bonus_air_olahraga,
            target_air=target_air,
            aktual_air=aktual_air,
            jumlah_log_makan=jumlah_makan,
            jumlah_log_aktivitas=jumlah_aktivitas,
            durasi_olahraga=durasi_olahraga,
            jumlah_log_air=jumlah_air,
            saran_korektif=json.dumps(saran_list, ensure_ascii=False),
            tipe_pemicu=tipe_pemicu,
            waktu_evaluasi=now_wib.replace(tzinfo=None),
        )
        db.add(record)

    db.commit()
    db.refresh(record)

    # 5. Kirim notifikasi laporan evaluasi ke tabel notification (FIT-60)
    notif_info = None
    if kirim_notifikasi:
        notif_info = _kirim_notifikasi_evaluasi(
            db=db,
            id_user=id_user,
            skor_kepatuhan=skor_kepatuhan,
            status_energi=status_energi,
            waktu_wib=now_wib,
        )

    return {
        "evaluasi": _format_evaluation_response(record),
        "notifikasi": notif_info,
    }


# =====================================================================
# ENDPOINTS REST API (FIT-59 & FIT-60)
# =====================================================================


@router.post("/evaluasi-malam")
@router.post("/trigger")
def trigger_evaluasi_malam_manual(
    payload: ManualEvaluationRequest,
    db: Session = Depends(get_db),
):
    """
    FIT-59 & FIT-60: Endpoint pemicu evaluasi malam secara manual.
    Menjalankan evaluasiMalam(), menyimpan ke daily_evaluation, dan membuat notifikasi laporan.
    """
    parsed_date = None
    if payload.tanggal:
        try:
            parsed_date = date.fromisoformat(payload.tanggal)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Format tanggal harus YYYY-MM-DD (contoh: 2026-10-18).",
            )

    overrides = {
        "aktual_energi": payload.aktual_energi,
        "aktual_protein": payload.aktual_protein,
        "aktual_karbo": payload.aktual_karbo,
        "aktual_lemak": payload.aktual_lemak,
        "aktual_air": payload.aktual_air,
        "kalori_olahraga": payload.kalori_olahraga,
    }

    hasil = evaluasiMalam(
        db=db,
        id_user=payload.id_user,
        target_date=parsed_date,
        tipe_pemicu="manual",
        overrides=overrides,
        kirim_notifikasi=True,
    )

    return {
        "status": "success",
        "message": "Evaluasi malam berhasil dihitung, disimpan ke daily_evaluation, dan notifikasi laporan dikirim.",
        "data": hasil["evaluasi"],
        "notifikasi": hasil["notifikasi"],
    }


@router.get("/{id_user}/calendar")
def get_calendar_evaluations(
    id_user: int,
    year: int = 2026,
    month: int = 10,
    db: Session = Depends(get_db),
):
    """Mengambil status warna kalender bulanan dari tabel daily_evaluation."""
    records = (
        db.query(DailyEvaluation)
        .filter(DailyEvaluation.id_user == id_user)
        .all()
    )

    tone_map = {"tercapai": "good", "kurang": "low", "berlebih": "high"}
    days_map = {}
    for rec in records:
        if rec.tanggal_evaluasi.year == year and rec.tanggal_evaluasi.month == month:
            days_map[str(rec.tanggal_evaluasi.day)] = {
                "status": tone_map.get(rec.status_energi, "good"),
                "status_energi": rec.status_energi,
                "skor_kepatuhan": rec.skor_kepatuhan,
            }

    return {
        "status": "success",
        "year": year,
        "month": month,
        "data": days_map,
    }


@router.get("/{id_user}/{tanggal}")
def get_evaluation_by_date(
    id_user: int,
    tanggal: str,
    db: Session = Depends(get_db),
):
    """Mengambil laporan evaluasi malam tersimpan berdasarkan tanggal (YYYY-MM-DD)."""
    try:
        target_date = date.fromisoformat(tanggal)
    except ValueError:
        raise HTTPException(status_code=400, detail="Format tanggal harus YYYY-MM-DD.")

    record = (
        db.query(DailyEvaluation)
        .filter(
            DailyEvaluation.id_user == id_user,
            DailyEvaluation.tanggal_evaluasi == target_date,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"Belum ada laporan evaluasi malam untuk tanggal {tanggal}.",
        )

    return {
        "status": "success",
        "data": _format_evaluation_response(record),
    }


@router.post("/{id_user}/seed-october")
def seed_sample_evaluations(id_user: int, db: Session = Depends(get_db)):
    """Helper untuk mengisi riwayat contoh bulan Oktober 2026 sesuai mock UI FitBite."""
    sample_days = [
        (5, 1820.0), (6, 1850.0), (7, 1450.0), (8, 1810.0), (9, 1890.0),
        (10, 2320.0), (11, 1800.0), (12, 1420.0), (13, 1840.0), (14, 1870.0),
        (15, 2290.0), (16, 1830.0), (17, 1810.0), (18, 1800.0),
    ]
    for day_num, kcal in sample_days:
        evaluasiMalam(
            db=db,
            id_user=id_user,
            target_date=date(2026, 10, day_num),
            tipe_pemicu="otomatis_20_00",
            overrides={"aktual_energi": kcal},
            kirim_notifikasi=False,
        )
    return {
        "status": "success",
        "message": "14 riwayat evaluasi malam Oktober 2026 berhasil dibuat.",
    }


# =====================================================================
# SCHEDULER OTOMATIS PUKUL 20.00 WIB (FIT-60)
# =====================================================================


async def evening_evaluation_scheduler_loop():
    """
    Background worker yang memantau waktu WIB (UTC+7).
    Tepat pukul 20.00 WIB setiap hari, otomatis menjalankan evaluasiMalam()
    dan mengirim notifikasi laporan evaluasi harian.
    """
    while True:
        try:
            now_wib = get_wib_now()
            date_key = now_wib.strftime("%Y-%m-%d")

            if now_wib.hour == 20 and now_wib.minute == 0 and date_key not in _auto_triggered_dates:
                _auto_triggered_dates.add(date_key)
                db = SessionLocal()
                try:
                    evaluasiMalam(
                        db=db,
                        id_user=1,
                        target_date=now_wib.date(),
                        tipe_pemicu="otomatis_20_00",
                        kirim_notifikasi=True,
                    )
                    print(f"[SCHEDULER 20.00 WIB] Evaluasi malam otomatis selesai untuk {date_key}")
                finally:
                    db.close()
        except Exception as err:
            print(f"[SCHEDULER ERROR] Gagal menjalankan evaluasi otomatis: {err}")

        await asyncio.sleep(20)