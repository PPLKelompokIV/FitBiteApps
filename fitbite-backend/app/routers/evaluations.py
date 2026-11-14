import asyncio
import json
from datetime import date, datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models.activity_log import ActivityLog
from app.models.daily_evaluation import DailyEvaluation
from app.models.food_log import FoodLog
from app.models.notification import Notification
from app.models.water_log import WaterLog

router = APIRouter(prefix="/api/evaluations", tags=["Daily Evaluation (FIT-59/FIT-60)"])

WIB = timezone(timedelta(hours=7))
_auto_triggered_dates: set[str] = set()
_last_scheduler_run: dict[str, Optional[str]] = {
    "last_checked_wib": None,
    "last_auto_run_date": None,
    "last_auto_run_time": None,
}

EMPTY_LOG_MESSAGE = (
    "Data hari ini belum lengkap. Silakan catat konsumsi makanan dan aktivitas Anda untuk evaluasi akurat"
)


def get_wib_now() -> datetime:
    return datetime.now(WIB)


class ManualEvaluationRequest(BaseModel):
    id_user: int = 1
    tanggal: Optional[str] = None  # Format YYYY-MM-DD (opsional, default hari ini WIB)
    # Opsional: override target & nilai aktual untuk pengujian skenario TC-PBI13-001 s/d TC-PBI13-005
    target_energi: Optional[float] = Field(default=None, gt=0)
    aktual_energi: Optional[float] = Field(default=None, ge=0)
    aktual_protein: Optional[float] = Field(default=None, ge=0)
    aktual_karbo: Optional[float] = Field(default=None, ge=0)
    aktual_lemak: Optional[float] = Field(default=None, ge=0)
    aktual_air: Optional[float] = Field(default=None, ge=0)
    kalori_olahraga: Optional[float] = Field(default=None, ge=0)


def _ambil_agregasi_log_harian(db: Session, id_user: int, target_date: date) -> dict:
    food_logs = (
        db.query(FoodLog)
        .filter(FoodLog.id_user == id_user, FoodLog.tanggal == target_date)
        .all()
    )
    activity_logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.id_user == id_user, ActivityLog.tanggal == target_date)
        .all()
    )
    water_logs = (
        db.query(WaterLog)
        .filter(WaterLog.id_user == id_user, WaterLog.tanggal == target_date)
        .all()
    )

    return {
        "aktual_energi": sum(float(log.kalori or 0) for log in food_logs),
        "aktual_protein": sum(float(log.protein_g or 0) for log in food_logs),
        "aktual_karbo": sum(float(log.karbo_g or 0) for log in food_logs),
        "aktual_lemak": sum(float(log.lemak_g or 0) for log in food_logs),
        "jumlah_log_makan": len(food_logs),
        "kalori_olahraga": sum(
            float(log.kalori_terbakar or 0) for log in activity_logs
        ),
        "durasi_olahraga": sum(log.durasi_menit for log in activity_logs),
        "jumlah_log_aktivitas": len(activity_logs),
        "bonus_air_olahraga": (
            400.0
            if any(log.met >= 6 and log.durasi_menit >= 30 for log in activity_logs)
            else 0.0
        ),
        "aktual_air": sum(log.jumlah_ml for log in water_logs),
        "jumlah_log_air": len(water_logs),
    }


def _tentukan_badge_dan_judul_energi(
    status_energi: str,
    is_log_kosong: bool,
) -> dict[str, str]:
    """Menghasilkan badge & pesan utama yang sesuai dengan TC-PBI13-002 s/d TC-PBI13-005."""
    if is_log_kosong:
        return {
            "badge_kalori": "Data Belum Lengkap",
            "judul_status": EMPTY_LOG_MESSAGE,
            "pesan_apresiasi": EMPTY_LOG_MESSAGE,
        }

    if status_energi == "tercapai":
        return {
            "badge_kalori": "Target Kalori Tercapai Optimal",
            "judul_status": "Target Kalori Tercapai Optimal! Pertahankan konsistensi asupan harianmu.",
            "pesan_apresiasi": "Kerja bagus! Asupan kalorimu hari ini berada dalam rentang optimal (+/- 10% dari target).",
        }
    if status_energi == "kurang":
        return {
            "badge_kalori": "Asupan Kurang",
            "judul_status": "Asupan energi masih di bawah target.",
            "pesan_apresiasi": "Tingkatkan porsi makan bernutrisi besok untuk menjaga metabolisme.",
        }
    return {
        "badge_kalori": "Surplus Kalori",
        "judul_status": "Surplus Kalori — Asupan energi melebihi target harian.",
        "pesan_apresiasi": "Lakukan aktivitas olahraga ringan untuk membakar kelebihan energi besok pagi.",
    }


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
    is_log_kosong: bool = False,
) -> list[dict]:
    """Men-generate catatan pendamping sehat (saran korektif untuk besok) sesuai TC-PBI13-002 s/d TC-PBI13-005."""
    if is_log_kosong:
        return [
            {
                "nomor": "01",
                "teks": EMPTY_LOG_MESSAGE,
            }
        ]

    saran = []

    # 1. Evaluasi Energi (TC-PBI13-002, TC-PBI13-003, TC-PBI13-004)
    if status_energi == "tercapai":
        saran.append(
            "Target Kalori Tercapai Optimal! Apresiasi untuk konsistensimu hari ini, "
            "pertahankan pola makan seimbang ini untuk esok hari."
        )
    elif status_energi == "kurang":
        selisih = round(target_energi - aktual_energi)
        saran.append(
            f"Status Asupan Kurang (defisit {selisih:,} kkal dari target). "
            "Tingkatkan porsi makan bernutrisi besok untuk menjaga metabolisme."
        )
    elif status_energi == "berlebih":
        selisih = round(aktual_energi - target_energi)
        saran.append(
            f"Status Surplus Kalori (+{selisih:,} kkal di atas target). "
            "Disarankan melakukan aktivitas olahraga ringan seperti jalan cepat atau jogging 20-30 menit "
            "untuk membakar kelebihan energi besok pagi."
        )

    # 2. Evaluasi Protein
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

    # 3. Evaluasi Hidrasi
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

    # Evaluasi Karbohidrat jika belum ada 3 saran
    if len(saran) < 3 and aktual_karbo > target_karbo * 1.1:
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
    tanggal_evaluasi: date,
) -> dict:
    """Menyimpan notifikasi laporan evaluasi malam ke tabel notification (FIT-60)."""
    jam_str = waktu_wib.strftime("%H.%M")
    judul = "Evaluasi Malam siap dilihat"
    pesan = (
        f"Evaluasi {tanggal_evaluasi.strftime('%d/%m/%Y')} selesai: "
        f"skor {skor_kepatuhan}/100, energi {status_energi}. "
        "Lihat ringkasan dan saran pendamping."
    )
    waktu_kirim = f"{tanggal_evaluasi.strftime('%d/%m/%Y')} • {jam_str} WIB"
    tautan = "/jurnal-evaluasi"

    db.add(
        Notification(
            id_user=id_user,
            kategori="evaluasi_malam",
            judul=judul,
            pesan=pesan,
            waktu_kirim=waktu_kirim,
            tautan_tujuan=tautan,
            sudah_dibaca=False,
        )
    )
    db.commit()

    return {
        "kategori": "evaluasi_malam",
        "judul": judul,
        "pesan": pesan,
        "waktu_kirim": waktu_kirim,
        "tautan_tujuan": tautan,
    }


def _format_evaluation_response(record: DailyEvaluation) -> dict:
    """Memformat record database menjadi struktur JSON siap pakai oleh frontend."""
    is_log_kosong = (
        record.jumlah_log_makan == 0
        and record.jumlah_log_air == 0
        and record.jumlah_log_aktivitas == 0
        and record.aktual_energi == 0
        and record.aktual_air == 0
    )

    tone_map = {"tercapai": "good", "kurang": "low", "berlebih": "high"}
    status_tone = "neutral" if is_log_kosong else tone_map.get(record.status_energi, "good")
    info_badge = _tentukan_badge_dan_judul_energi(record.status_energi, is_log_kosong)

    diff_protein = round(record.aktual_protein - record.target_protein)
    diff_karbo = round(record.aktual_karbo - record.target_karbo)
    diff_lemak = round(record.aktual_lemak - record.target_lemak)
    pct_air = round((record.aktual_air / record.target_air) * 100) if record.target_air > 0 else 0

    saran_list = json.loads(record.saran_korektif) if record.saran_korektif else []

    return {
        "id_evaluation": record.id_evaluation,
        "id_user": record.id_user,
        "tanggal_evaluasi": record.tanggal_evaluasi.isoformat(),
        "is_log_kosong": is_log_kosong,
        "pesan_state_kosong": EMPTY_LOG_MESSAGE if is_log_kosong else None,
        "skor_kepatuhan": 0 if is_log_kosong else record.skor_kepatuhan,
        "status_energi": record.status_energi,
        "badge_evaluasi_kalori": info_badge["badge_kalori"],
        "judul_status": info_badge["judul_status"],
        "pesan_apresiasi": info_badge["pesan_apresiasi"],
        "status_tone": status_tone,
        "persentase_energi": record.persentase_energi,
        "tipe_pemicu": record.tipe_pemicu,
        "waktu_evaluasi": record.waktu_evaluasi.strftime("%H.%M WIB"),
        "ringkasan_tabel": [
            {
                "komponen": "Energi",
                "target": f"{int(record.target_energi):,}".replace(",", ".") + " kkal",
                "aktual": f"{int(record.aktual_energi):,}".replace(",", ".") + " kkal",
                "ringkasan": (
                    "Belum ada log"
                    if is_log_kosong
                    else f"{record.persentase_energi}% · {info_badge['badge_kalori']}"
                ),
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
    3. Men-generate saran korektif untuk esok hari (sesuai TC-PBI13-002 s/d TC-PBI13-005)
    4. Menyimpan hasil evaluasi ke tabel daily_evaluation
    5. Mengirim notifikasi laporan evaluasi ke tabel notification (FIT-60)
    """
    now_wib = get_wib_now()
    eval_date = target_date or now_wib.date()
    overrides = overrides or {}

    agregasi = _ambil_agregasi_log_harian(db, id_user, eval_date)

    # Target dasar harian (mendukung override target_energi misal 2000 kkal untuk TC-PBI13-002/003/004)
    target_energi_dasar = (
        float(overrides["target_energi"])
        if overrides.get("target_energi") is not None
        else 1700.0
    )
    target_protein = 100.0
    target_karbo = 190.0
    target_lemak = 60.0
    target_air_dasar = 2240.0

    kalori_olahraga = (
        float(overrides["kalori_olahraga"])
        if overrides.get("kalori_olahraga") is not None
        else agregasi["kalori_olahraga"]
    )
    bonus_air_olahraga = agregasi["bonus_air_olahraga"]

    target_energi = (
        float(overrides["target_energi"])
        if overrides.get("target_energi") is not None
        else (target_energi_dasar + kalori_olahraga)
    )
    target_air = target_air_dasar + bonus_air_olahraga

    aktual_energi = (
        float(overrides["aktual_energi"])
        if overrides.get("aktual_energi") is not None
        else agregasi["aktual_energi"]
    )
    aktual_protein = (
        float(overrides["aktual_protein"])
        if overrides.get("aktual_protein") is not None
        else agregasi["aktual_protein"]
    )
    aktual_karbo = (
        float(overrides["aktual_karbo"])
        if overrides.get("aktual_karbo") is not None
        else agregasi["aktual_karbo"]
    )
    aktual_lemak = (
        float(overrides["aktual_lemak"])
        if overrides.get("aktual_lemak") is not None
        else agregasi["aktual_lemak"]
    )
    aktual_air = (
        float(overrides["aktual_air"])
        if overrides.get("aktual_air") is not None
        else agregasi["aktual_air"]
    )

    jumlah_makan = (
        1
        if overrides.get("aktual_energi") is not None and aktual_energi > 0
        else agregasi["jumlah_log_makan"]
    )
    jumlah_aktivitas = agregasi["jumlah_log_aktivitas"]
    durasi_olahraga = agregasi["durasi_olahraga"]
    jumlah_air = (
        1
        if overrides.get("aktual_air") is not None and aktual_air > 0
        else agregasi["jumlah_log_air"]
    )

    is_log_kosong = (
        jumlah_makan == 0
        and jumlah_air == 0
        and jumlah_aktivitas == 0
        and aktual_energi == 0
        and aktual_air == 0
    )

    # 1. Hitung persentase energi & skor kepatuhan
    persentase_energi_exact = (
        (aktual_energi / target_energi) * 100 if target_energi > 0 else 0
    )
    persentase_energi = round(persentase_energi_exact)

    rasio_energi = max(0.0, min(aktual_energi / target_energi, 1.0)) if target_energi > 0 else 0.0
    rasio_protein = max(0.0, min(aktual_protein / target_protein, 1.0)) if target_protein > 0 else 0.0
    rasio_karbo = max(0.0, min(aktual_karbo / target_karbo, 1.0)) if target_karbo > 0 else 0.0
    rasio_lemak = max(0.0, min(aktual_lemak / target_lemak, 1.0)) if target_lemak > 0 else 0.0
    rasio_air = max(0.0, min(aktual_air / target_air, 1.0)) if target_air > 0 else 0.0

    skor_kepatuhan = (
        0
        if is_log_kosong
        else round(
            ((rasio_energi + rasio_protein + rasio_karbo + rasio_lemak + rasio_air) / 5.0) * 100
        )
    )

    # 2. Tentukan status energi sesuai aturan UI FitBite (90-110% tercapai, <90% kurang, >110% berlebih)
    if aktual_energi < target_energi * 0.9:
        status_energi = "kurang"
    elif aktual_energi > target_energi * 1.1:
        status_energi = "berlebih"
    else:
        status_energi = "tercapai"

    # 3. Generate saran korektif sesuai TC-PBI13-002 s/d TC-PBI13-005
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
        is_log_kosong=is_log_kosong,
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
            tanggal_evaluasi=eval_date,
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
@router.post("/manual-trigger")
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
                detail="Format tanggal harus YYYY-MM-DD (contoh: 2026-11-14).",
            )

    overrides = {
        "target_energi": payload.target_energi,
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
        "message": (
            EMPTY_LOG_MESSAGE
            if hasil["evaluasi"]["is_log_kosong"]
            else "Evaluasi malam berhasil dihitung, disimpan ke daily_evaluation, dan notifikasi laporan dikirim."
        ),
        "data": hasil["evaluasi"],
        "notifikasi": hasil["notifikasi"],
    }


@router.get("/scheduler/status")
def get_scheduler_status():
    return {
        "status": "running",
        "timezone": "Asia/Jakarta",
        "scheduled_time": "20:00",
        "log_scheduler": dict(_last_scheduler_run),
    }


@router.post("/scheduler/simulate-20-00")
def simulate_scheduler_20_00(
    id_user: int = 1,
    db: Session = Depends(get_db),
):
    hasil = evaluasiMalam(
        db=db,
        id_user=id_user,
        target_date=get_wib_now().date(),
        tipe_pemicu="otomatis_20_00",
        kirim_notifikasi=True,
    )
    return {
        "status": "success",
        "message": "Evaluasi otomatis pukul 20:00 WIB berhasil dijalankan.",
        "data": hasil["evaluasi"],
        "notifikasi": hasil["notifikasi"],
    }


@router.get("/{id_user}/calendar")
def get_calendar_evaluations(
    id_user: int,
    year: Optional[int] = None,
    month: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Mengambil status warna kalender bulanan dari tabel daily_evaluation."""
    now_wib = get_wib_now()
    year = now_wib.year if year is None else year
    month = now_wib.month if month is None else month
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Bulan harus berada antara 1 dan 12.")

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
        # Jika belum ada record tersimpan untuk tanggal tersebut, cek apakah log hari itu kosong (TC-PBI13-005)
        agregasi = _ambil_agregasi_log_harian(db, id_user, target_date)
        if (
            agregasi["jumlah_log_makan"] == 0
            and agregasi["jumlah_log_air"] == 0
            and agregasi["jumlah_log_aktivitas"] == 0
        ):
            return {
                "status": "empty",
                "is_log_kosong": True,
                "message": EMPTY_LOG_MESSAGE,
                "data": {
                    "id_user": id_user,
                    "tanggal_evaluasi": target_date.isoformat(),
                    "is_log_kosong": True,
                    "pesan_state_kosong": EMPTY_LOG_MESSAGE,
                    "badge_evaluasi_kalori": "Data Belum Lengkap",
                    "judul_status": EMPTY_LOG_MESSAGE,
                    "skor_kepatuhan": 0,
                    "status_energi": "kurang",
                    "status_tone": "neutral",
                    "persentase_energi": 0,
                    "ringkasan_tabel": [],
                    "saran_korektif": [{"nomor": "01", "teks": EMPTY_LOG_MESSAGE}],
                },
            }

        raise HTTPException(
            status_code=404,
            detail=f"Belum ada laporan evaluasi malam untuk tanggal {tanggal}.",
        )

    return {
        "status": "success",
        "data": _format_evaluation_response(record),
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

            _last_scheduler_run["last_checked_wib"] = now_wib.strftime(
                "%Y-%m-%d %H:%M:%S WIB"
            )
            if now_wib.hour >= 20 and date_key not in _auto_triggered_dates:
                db = SessionLocal()
                try:
                    existing = (
                        db.query(DailyEvaluation)
                        .filter(
                            DailyEvaluation.id_user == 1,
                            DailyEvaluation.tanggal_evaluasi == now_wib.date(),
                        )
                        .first()
                    )
                    if not existing or existing.tipe_pemicu != "otomatis_20_00":
                        evaluasiMalam(
                            db=db,
                            id_user=1,
                            target_date=now_wib.date(),
                            tipe_pemicu="otomatis_20_00",
                            kirim_notifikasi=True,
                        )
                    _auto_triggered_dates.add(date_key)
                    _last_scheduler_run["last_auto_run_date"] = date_key
                    _last_scheduler_run["last_auto_run_time"] = now_wib.strftime(
                        "%H:%M:%S WIB"
                    )
                    print(f"[SCHEDULER 20.00 WIB] Evaluasi malam otomatis selesai untuk {date_key}")
                finally:
                    db.close()
        except Exception as err:
            print(f"[SCHEDULER ERROR] Gagal menjalankan evaluasi otomatis: {err}")

        await asyncio.sleep(20)