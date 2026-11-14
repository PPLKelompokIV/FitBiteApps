import asyncio
import base64
from contextlib import asynccontextmanager
import datetime
import json
import os
import re
from typing import Literal, Optional
import uuid

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
from sqlalchemy import Boolean, Column, Date, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

from app.database import Base as RouterBase, engine as router_engine
from app.routers import (
    activity_logs,
    admin_foods,
    body_check,
    evaluations,
    food_logs,
    notifications,
    reminders,
    water_logs,
)

ROUTER_API_KEY = os.getenv("ROUTER_API_KEY", "")
ROUTER_BASE_URL = os.getenv("ROUTER_BASE_URL", "http://localhost:20128/v1")
ROUTER_VISION_MODEL = os.getenv("ROUTER_VISION_MODEL", "ag/gemini-3.8-flash-high")

# =====================================================================
# KONFIGURASI DATABASE & TABEL DAILY_EVALUATION (FIT-59 & FIT-60)
# =====================================================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fitbite.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

WIB = datetime.timezone(datetime.timedelta(hours=7))
_auto_triggered_dates: set[str] = set()


def get_wib_now() -> datetime.datetime:
    return datetime.datetime.now(WIB)


def now_wib_naive() -> datetime.datetime:
    return get_wib_now().replace(tzinfo=None)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class DailyEvaluation(Base):
    __tablename__ = "daily_evaluation"

    id_evaluation = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, index=True, default=1)
    tanggal_evaluasi = Column(Date, nullable=False, index=True)

    # Skor kepatuhan (0 - 100) dan status energi ('tercapai' | 'kurang' | 'berlebih')
    skor_kepatuhan = Column(Integer, nullable=False, default=0)
    status_energi = Column(String(30), nullable=False, default="tercapai")
    persentase_energi = Column(Integer, nullable=False, default=0)

    # Target vs Aktual (sesuai kolom tabel Evaluasi Malam di UI)
    target_energi_dasar = Column(Float, nullable=False, default=1700.0)
    kalori_olahraga = Column(Float, nullable=False, default=0.0)
    target_energi = Column(Float, nullable=False, default=1700.0)
    aktual_energi = Column(Float, nullable=False, default=0.0)

    target_protein = Column(Float, nullable=False, default=100.0)
    aktual_protein = Column(Float, nullable=False, default=0.0)

    target_karbo = Column(Float, nullable=False, default=190.0)
    aktual_karbo = Column(Float, nullable=False, default=0.0)

    target_lemak = Column(Float, nullable=False, default=60.0)
    aktual_lemak = Column(Float, nullable=False, default=0.0)

    target_air_dasar = Column(Float, nullable=False, default=2240.0)
    bonus_air_olahraga = Column(Float, nullable=False, default=0.0)
    target_air = Column(Float, nullable=False, default=2240.0)
    aktual_air = Column(Float, nullable=False, default=0.0)

    # Ringkasan kelengkapan log & saran korektif (disimpan sebagai JSON string)
    jumlah_log_makan = Column(Integer, nullable=False, default=0)
    jumlah_log_aktivitas = Column(Integer, nullable=False, default=0)
    durasi_olahraga = Column(Integer, nullable=False, default=0)
    jumlah_log_air = Column(Integer, nullable=False, default=0)

    saran_korektif = Column(Text, nullable=False, default="[]")
    tipe_pemicu = Column(String(30), nullable=False, default="manual")  # 'otomatis_20_00' | 'manual'
    waktu_evaluasi = Column(DateTime, nullable=False, default=now_wib_naive)


class NotificationRecord(Base):
    __tablename__ = "notification"

    id_notification = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, index=True, default=1)
    kategori = Column(String(50), nullable=False, default="evaluasi_malam")
    judul = Column(String(150), nullable=False)
    pesan = Column(Text, nullable=False)
    waktu_kirim = Column(String(80), nullable=False)
    tautan_tujuan = Column(String(120), nullable=False, default="/jurnal-evaluasi")
    sudah_dibaca = Column(Boolean, nullable=False, default=False)


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


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    RouterBase.metadata.create_all(bind=router_engine)
    scheduler_task = asyncio.create_task(evaluations.evening_evaluation_scheduler_loop())
    yield
    scheduler_task.cancel()


app = FastAPI(title="FitBite AI & Calculation Service", lifespan=lifespan)

for router_module in (
    admin_foods,
    activity_logs,
    body_check,
    evaluations,
    food_logs,
    notifications,
    reminders,
    water_logs,
):
    app.include_router(router_module.router)

# Izinkan komunikasi dari Frontend (5173) & Node.js (5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Service Python FastAPI FitBite Berjalan!"}


class BMRRequest(BaseModel):
    usia: int = Field(gt=0, le=120)
    jenis_kelamin: Literal["laki-laki", "perempuan"]
    tinggi_cm: float = Field(gt=0, le=300)
    berat_kg: float = Field(gt=0, le=500)


def hitung_bmr(
    usia: int,
    jenis_kelamin: Literal["laki-laki", "perempuan"],
    tinggi_cm: float,
    berat_kg: float,
) -> float:
    """Hitung BMR dalam kkal/hari dengan rumus Mifflin-St Jeor."""
    konstanta = 5 if jenis_kelamin == "laki-laki" else -161
    return round((10 * berat_kg) + (6.25 * tinggi_cm) - (5 * usia) + konstanta, 1)


@app.post("/bmr")
def calculate_bmr(data: BMRRequest):
    return {
        "bmr_kcal_per_hari": hitung_bmr(
            usia=data.usia,
            jenis_kelamin=data.jenis_kelamin,
            tinggi_cm=data.tinggi_cm,
            berat_kg=data.berat_kg,
        )
    }


TingkatAktivitas = Literal["sedentari", "ringan", "sedang", "aktif", "sangat_aktif"]

FAKTOR_AKTIVITAS: dict[TingkatAktivitas, float] = {
    "sedentari": 1.2,
    "ringan": 1.375,
    "sedang": 1.55,
    "aktif": 1.725,
    "sangat_aktif": 1.9,
}


class TDEERequest(BaseModel):
    bmr_kcal_per_hari: float = Field(gt=0, le=10000)
    tingkat_aktivitas: TingkatAktivitas


def hitung_tdee(bmr_kcal_per_hari: float, tingkat_aktivitas: TingkatAktivitas) -> float:
    """Hitung TDEE dengan mengalikan BMR dan faktor aktivitas."""
    return round(bmr_kcal_per_hari * FAKTOR_AKTIVITAS[tingkat_aktivitas], 1)


@app.post("/tdee")
def calculate_tdee(data: TDEERequest):
    faktor_aktivitas = FAKTOR_AKTIVITAS[data.tingkat_aktivitas]
    return {
        "bmr_kcal_per_hari": data.bmr_kcal_per_hari,
        "tingkat_aktivitas": data.tingkat_aktivitas,
        "faktor_aktivitas": faktor_aktivitas,
        "tdee_kcal_per_hari": hitung_tdee(
            data.bmr_kcal_per_hari,
            data.tingkat_aktivitas,
        ),
    }


class CalorieTargetAdjustmentRequest(BaseModel):
    tdee_kcal_per_hari: float = Field(gt=0, le=10000)
    skor_kesiapan: float = Field(ge=0, le=100)
    durasi_tidur_jam: float = Field(ge=0, le=24)


SKOR_KESIAPAN_RENDAH = 40
SKOR_KESIAPAN_TINGGI = 80
DURASI_TIDUR_RENDAH_JAM = 6
DURASI_TIDUR_CUKUP_JAM = 7
PENYESUAIAN_KALORI_PERSEN = 5.0


def sesuaikan_target_kalori(
    tdee_kcal_per_hari: float,
    skor_kesiapan: float,
    durasi_tidur_jam: float,
) -> dict[str, float | str]:
    if (
        skor_kesiapan < SKOR_KESIAPAN_RENDAH
        or durasi_tidur_jam < DURASI_TIDUR_RENDAH_JAM
    ):
        penyesuaian_persen = -PENYESUAIAN_KALORI_PERSEN
        alasan = "Kesiapan rendah atau durasi tidur kurang."
    elif (
        skor_kesiapan >= SKOR_KESIAPAN_TINGGI
        and durasi_tidur_jam >= DURASI_TIDUR_CUKUP_JAM
    ):
        penyesuaian_persen = PENYESUAIAN_KALORI_PERSEN
        alasan = "Kesiapan tinggi dan durasi tidur cukup."
    else:
        penyesuaian_persen = 0.0
        alasan = "Tidak ada penyesuaian untuk kondisi ini."

    target_kalori = round(tdee_kcal_per_hari * (1 + penyesuaian_persen / 100), 1)
    return {
        "penyesuaian_persen": penyesuaian_persen,
        "target_kalori_disarankan": target_kalori,
        "alasan": alasan,
    }


@app.post("/calorie-target/adjust")
def adjust_calorie_target(data: CalorieTargetAdjustmentRequest):
    return {
        "tdee_kcal_per_hari": data.tdee_kcal_per_hari,
        "skor_kesiapan": data.skor_kesiapan,
        "durasi_tidur_jam": data.durasi_tidur_jam,
        **sesuaikan_target_kalori(
            tdee_kcal_per_hari=data.tdee_kcal_per_hari,
            skor_kesiapan=data.skor_kesiapan,
            durasi_tidur_jam=data.durasi_tidur_jam,
        ),
    }


def parse_ai_json_response(content: str) -> dict:
    cleaned = content.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        raise ValueError("Model AI tidak mengembalikan format JSON yang valid.")


@app.post("/api/ai/food-snap")
async def analyze_food_snap(file: UploadFile = File(...)):
    """Menerima unggahan foto makanan dan mengembalikan estimasi komponen nutrisi dari 9Router."""
    if not ROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ROUTER_API_KEY belum dikonfigurasi di file .env server.",
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Berkas yang diunggah harus berupa gambar (JPG, PNG, atau WebP).",
        )

    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Berkas gambar kosong.")

        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = file.content_type or "image/jpeg"
        data_url = f"data:{mime_type};base64,{b64_image}"

        prompt = (
            "Analisis gambar makanan atau piring hidangan ini. "
            "Identifikasi komponen makanan/minuman yang terlihat, perkirakan porsinya, "
            "jumlah kalori (kkal), serta makronutrien (protein, karbohidrat, dan lemak dalam gram). "
            "Format respons HARUS berupa JSON valid tanpa teks pengantar dan tanpa markdown ```json. "
            "Gunakan format persis berikut:\n"
            "{\n"
            '  "items": [\n'
            "    {\n"
            '      "name": "Nama makanan",\n'
            '      "detail": "Keterangan porsi atau olahan",\n'
            '      "portion": "100 g",\n'
            '      "calories": "150",\n'
            '      "nutrients": ["10", "20", "5"]\n'
            "    }\n"
            "  ]\n"
            "}\n"
            "PENTING: Nilai dalam nutrients adalah urutan [protein, karbohidrat, lemak] dalam gram (hanya angka numerik/desimal dalam string). "
            "Gunakan Bahasa Indonesia untuk nama dan detail makanan."
        )

        payload = {
            "model": ROUTER_VISION_MODEL,
            "stream": False,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
            "temperature": 0.1,
        }

        response = requests.post(
            f"{ROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {ROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=45,
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Layanan 9Router merespons dengan status {response.status_code}: {response.text}",
            )

        resp_json = response.json()
        ai_content = resp_json["choices"][0]["message"]["content"]
        parsed_data = parse_ai_json_response(ai_content)
        raw_items = parsed_data.get("items", [])

        formatted_items = []
        for i, item in enumerate(raw_items):
            nutrients = item.get("nutrients", ["0", "0", "0"])
            while len(nutrients) < 3:
                nutrients.append("0")
            nutrients = [str(nutrients[0]), str(nutrients[1]), str(nutrients[2])]

            formatted_items.append({
                "id": str(uuid.uuid4())[:8],
                "name": str(item.get("name", f"Komponen {i+1}")),
                "detail": str(item.get("detail", "Hasil estimasi AI")),
                "portion": str(item.get("portion", "1 porsi")),
                "calories": str(item.get("calories", "0")),
                "nutrients": nutrients,
            })

        return {
            "success": True,
            "filename": file.filename,
            "model_used": ROUTER_VISION_MODEL,
            "items": formatted_items,
        }

    except HTTPException:
        raise
    except requests.exceptions.RequestException as re_err:
        raise HTTPException(
            status_code=503,
            detail=f"Gagal menghubungi server 9Router: {str(re_err)}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat memproses gambar: {str(exc)}",
        )


# In-memory store untuk data log makanan (sebelum migrasi skema PostgreSQL)
DEFAULT_MEAL_SLOTS = [
    {
        "name": "Sarapan",
        "time": "07.30 WIB",
        "calories": "350 kkal",
        "items": [
            {"name": "Oat matang", "detail": "1 mangkuk • 200 g", "calories": "200"},
            {"name": "Pisang", "detail": "1 buah kecil • 100 g", "calories": "90"},
            {"name": "Yoghurt tawar", "detail": "100 g", "calories": "60"},
        ],
        "macros": "Protein 20 g  ·  Karbo 50 g  ·  Lemak 8 g",
        "protein_g": 20.0,
        "karbo_g": 50.0,
        "lemak_g": 8.0,
        "calories_num": 350.0,
    },
    {
        "name": "Makan siang",
        "time": "12.30 WIB",
        "calories": "600 kkal",
        "items": [
            {"name": "Nasi merah", "detail": "150 g", "calories": "165"},
            {"name": "Ayam panggang", "detail": "120 g", "calories": "220"},
            {"name": "Tempe panggang", "detail": "75 g", "calories": "145"},
            {"name": "Sayur bening", "detail": "1 mangkuk • 150 g", "calories": "70"},
        ],
        "macros": "Protein 42 g  ·  Karbo 65 g  ·  Lemak 19 g",
        "protein_g": 42.0,
        "karbo_g": 65.0,
        "lemak_g": 19.0,
        "calories_num": 600.0,
    },
    {
        "name": "Makan malam",
        "time": "18.00 WIB",
        "calories": "250 kkal",
        "items": [
            {"name": "Sup sayur", "detail": "1 mangkuk • 250 g", "calories": "170"},
            {"name": "Tahu kukus", "detail": "100 g", "calories": "80"},
        ],
        "macros": "Protein 18 g  ·  Karbo 15 g  ·  Lemak 13 g",
        "protein_g": 18.0,
        "karbo_g": 15.0,
        "lemak_g": 13.0,
        "calories_num": 250.0,
    },
    {
        "name": "Camilan",
        "time": "15.00 WIB",
        "calories": "150 kkal",
        "items": [
            {"name": "Pepaya", "detail": "150 g", "calories": "60"},
            {"name": "Yoghurt tawar", "detail": "150 g", "calories": "90"},
        ],
        "macros": "Protein 10 g  ·  Karbo 20 g  ·  Lemak 3 g",
        "protein_g": 10.0,
        "karbo_g": 20.0,
        "lemak_g": 3.0,
        "calories_num": 150.0,
    },
]

# Key: date_string (YYYY-MM-DD), Value: dict of meal_slots { "Makan siang": slot_data, ... }
meal_logs_db: dict[str, dict[str, dict]] = {}


class MealItemInput(BaseModel):
    id: str | None = None
    name: str = Field(min_length=1)
    detail: str = ""
    portion: str = ""
    calories: float | str = 0
    nutrients: list[float | str] = Field(default_factory=list)


class MealLogRequest(BaseModel):
    date: str
    meal_slot: Literal["Sarapan", "Makan siang", "Makan malam", "Camilan"]
    time: str = ""
    method: Literal["foto_ai", "katalog", "barcode", "quick_add", "manual"] = "foto_ai"
    items: list[MealItemInput]
    macros: str | None = None


@app.post("/api/meals/log")
def save_meal_log(payload: MealLogRequest):
    """Menyimpan atau memperbarui log makanan pada slot tertentu untuk tanggal tertentu."""
    date_key = payload.date
    if date_key not in meal_logs_db:
        meal_logs_db[date_key] = {}

    total_calories = 0.0
    total_p = 0.0
    total_k = 0.0
    total_l = 0.0

    items_list = []
    for it in payload.items:
        try:
            cal = max(0.0, float(str(it.calories).replace(",", ".")))
        except (ValueError, TypeError):
            cal = 0.0
        total_calories += cal

        p, k, l_val = 0.0, 0.0, 0.0
        if len(it.nutrients) >= 3:
            try:
                p = max(0.0, float(str(it.nutrients[0]).replace(",", ".")))
            except (ValueError, TypeError):
                p = 0.0
            try:
                k = max(0.0, float(str(it.nutrients[1]).replace(",", ".")))
            except (ValueError, TypeError):
                k = 0.0
            try:
                l_val = max(0.0, float(str(it.nutrients[2]).replace(",", ".")))
            except (ValueError, TypeError):
                l_val = 0.0
        total_p += p
        total_k += k
        total_l += l_val

        detail_text = it.detail
        if it.portion and it.portion not in it.detail:
            detail_text = f"{it.portion} • {it.detail}" if it.detail else it.portion

        items_list.append({
            "name": it.name,
            "detail": detail_text,
            "calories": str(int(round(cal))) if cal.is_integer() else f"{cal:.1f}",
        })

    if total_p == 0.0 and total_k == 0.0 and total_l == 0.0 and payload.macros:
        macros_str = payload.macros
        m = re.search(
            r"Protein\s+([-\d.,]+)\s*g.*?Karbo\s+([-\d.,]+)\s*g.*?Lemak\s+([-\d.,]+)\s*g",
            payload.macros,
            re.I,
        )
        if m:
            try:
                total_p = max(0.0, float(m.group(1).replace(",", ".")))
                total_k = max(0.0, float(m.group(2).replace(",", ".")))
                total_l = max(0.0, float(m.group(3).replace(",", ".")))
            except Exception:
                pass
        macros_str = f"Protein {int(round(total_p))} g  ·  Karbo {int(round(total_k))} g  ·  Lemak {int(round(total_l))} g"
    else:
        macros_str = f"Protein {int(round(total_p))} g  ·  Karbo {int(round(total_k))} g  ·  Lemak {int(round(total_l))} g"

    slot_data = {
        "name": payload.meal_slot,
        "time": payload.time or "12.00 WIB",
        "calories": f"{int(round(total_calories))} kkal",
        "items": items_list,
        "macros": macros_str,
        "protein_g": round(total_p, 1),
        "karbo_g": round(total_k, 1),
        "lemak_g": round(total_l, 1),
        "calories_num": round(total_calories, 1),
        "method": payload.method,
    }

    meal_logs_db[date_key][payload.meal_slot] = slot_data

    return {
        "success": True,
        "message": f"Log makanan {payload.meal_slot} berhasil disimpan.",
        "date": date_key,
        "data": slot_data,
    }


@app.get("/api/meals/daily")
def get_daily_meals(date: str | None = None):
    """Mengambil seluruh log makanan untuk 4 slot makan pada tanggal tertentu."""
    target_date = date or datetime.date.today().isoformat()

    daily_slots = meal_logs_db.get(target_date, {})

    result_meals = []
    total_cal = 0.0
    total_p = 0.0
    total_k = 0.0
    total_l = 0.0

    for default_slot in DEFAULT_MEAL_SLOTS:
        slot_name = default_slot["name"]
        if slot_name in daily_slots:
            slot = daily_slots[slot_name]
        else:
            slot = default_slot

        result_meals.append({
            "name": slot["name"],
            "time": slot["time"],
            "calories": slot["calories"],
            "items": slot["items"],
            "macros": slot["macros"],
        })
        total_cal += slot.get("calories_num", 0.0)
        total_p += slot.get("protein_g", 0.0)
        total_k += slot.get("karbo_g", 0.0)
        total_l += slot.get("lemak_g", 0.0)

    return {
        "date": target_date,
        "total_calories": round(total_cal, 1),
        "total_protein": round(total_p, 1),
        "total_carb": round(total_k, 1),
        "total_fat": round(total_l, 1),
        "meals": result_meals,
    }


# =====================================================================
# MODUL EVALUASI MALAM & NOTIFIKASI LAPORAN (FIT-57: FIT-59 & FIT-60)
# =====================================================================


class ManualEvaluationRequest(BaseModel):
    id_user: int = 1
    tanggal: Optional[str] = None  # Format YYYY-MM-DD (default: hari ini WIB)
    # Opsional: override nilai aktual untuk pengujian skenario (tercapai / kurang / berlebih)
    aktual_energi: Optional[float] = None
    aktual_protein: Optional[float] = None
    aktual_karbo: Optional[float] = None
    aktual_lemak: Optional[float] = None
    aktual_air: Optional[float] = None
    kalori_olahraga: Optional[float] = None


def _ambil_agregasi_makanan_harian(target_date: datetime.date) -> dict:
    """
    Mengambil agregasi nutrisi dari meal_logs_db jika pengguna mencatat makanan pada tanggal tersebut.
    Jika belum ada log khusus di tanggal itu, kembalikan None agar memakai nilai default representatif.
    """
    date_key = target_date.isoformat()
    if date_key not in meal_logs_db or len(meal_logs_db[date_key]) == 0:
        return {
            "aktual_energi": None,
            "aktual_protein": None,
            "aktual_karbo": None,
            "aktual_lemak": None,
            "jumlah_log_makan": 0,
        }

    daily_slots = meal_logs_db[date_key]
    total_cal = 0.0
    total_p = 0.0
    total_k = 0.0
    total_l = 0.0
    slot_terisi = 0

    for default_slot in DEFAULT_MEAL_SLOTS:
        slot_name = default_slot["name"]
        slot = daily_slots.get(slot_name, default_slot)
        if slot_name in daily_slots:
            slot_terisi += 1
        total_cal += slot.get("calories_num", 0.0)
        total_p += slot.get("protein_g", 0.0)
        total_k += slot.get("karbo_g", 0.0)
        total_l += slot.get("lemak_g", 0.0)

    return {
        "aktual_energi": round(total_cal, 1),
        "aktual_protein": round(total_p, 1),
        "aktual_karbo": round(total_k, 1),
        "aktual_lemak": round(total_l, 1),
        "jumlah_log_makan": slot_terisi or 4,
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
) -> list[dict]:
    """Men-generate catatan pendamping sehat (saran korektif untuk besok)."""
    saran = []

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
    waktu_wib: datetime.datetime,
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

    notif = NotificationRecord(
        id_user=id_user,
        kategori="evaluasi_malam",
        judul=judul,
        pesan=pesan,
        waktu_kirim=waktu_kirim,
        tautan_tujuan=tautan,
        sudah_dibaca=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    return {
        "id_notification": notif.id_notification,
        "id_user": notif.id_user,
        "kategori": notif.kategori,
        "judul": notif.judul,
        "pesan": notif.pesan,
        "waktu_kirim": notif.waktu_kirim,
        "tautan_tujuan": notif.tautan_tujuan,
        "sudah_dibaca": notif.sudah_dibaca,
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
    target_date: Optional[datetime.date] = None,
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

    agregasi_makan = _ambil_agregasi_makanan_harian(eval_date)

    # Target dasar harian sesuai spesifikasi FitBite
    target_energi_dasar = 1700.0
    target_protein = 100.0
    target_karbo = 190.0
    target_lemak = 60.0
    target_air_dasar = 2240.0

    kalori_olahraga = (
        overrides["kalori_olahraga"]
        if overrides.get("kalori_olahraga") is not None
        else 258.0
    )
    bonus_air_olahraga = 400.0 if kalori_olahraga > 0 else 0.0

    target_energi = target_energi_dasar + kalori_olahraga
    target_air = target_air_dasar + bonus_air_olahraga

    aktual_energi = (
        overrides["aktual_energi"]
        if overrides.get("aktual_energi") is not None
        else (
            agregasi_makan["aktual_energi"]
            if agregasi_makan["aktual_energi"] is not None
            else 1800.0
        )
    )
    aktual_protein = (
        overrides["aktual_protein"]
        if overrides.get("aktual_protein") is not None
        else (
            agregasi_makan["aktual_protein"]
            if agregasi_makan["aktual_protein"] is not None
            else 110.0
        )
    )
    aktual_karbo = (
        overrides["aktual_karbo"]
        if overrides.get("aktual_karbo") is not None
        else (
            agregasi_makan["aktual_karbo"]
            if agregasi_makan["aktual_karbo"] is not None
            else 210.0
        )
    )
    aktual_lemak = (
        overrides["aktual_lemak"]
        if overrides.get("aktual_lemak") is not None
        else (
            agregasi_makan["aktual_lemak"]
            if agregasi_makan["aktual_lemak"] is not None
            else 58.0
        )
    )
    aktual_air = (
        overrides["aktual_air"]
        if overrides.get("aktual_air") is not None
        else 2640.0
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

    # 2. Tentukan status energi: tercapai (90-110%), kurang (<90%), berlebih (>110%)
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

    jumlah_makan = agregasi_makan["jumlah_log_makan"] or 4
    jumlah_aktivitas = 2 if kalori_olahraga > 0 else 0
    durasi_olahraga = 50 if kalori_olahraga > 0 else 0
    jumlah_air = 7

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
            parsed_date = datetime.date.fromisoformat(payload.tanggal)
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


def get_evaluation_by_date(
    id_user: int,
    tanggal: str,
    db: Session = Depends(get_db),
):
    """Mengambil laporan evaluasi malam tersimpan berdasarkan tanggal (YYYY-MM-DD)."""
    try:
        target_date = datetime.date.fromisoformat(tanggal)
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


def seed_sample_evaluations(id_user: int, db: Session = Depends(get_db)):
    """Mengisi 14 riwayat contoh Oktober 2026 ke tabel daily_evaluation sesuai mock UI."""
    sample_days = [
        (5, 1820.0), (6, 1850.0), (7, 1450.0), (8, 1810.0), (9, 1890.0),
        (10, 2320.0), (11, 1800.0), (12, 1420.0), (13, 1840.0), (14, 1870.0),
        (15, 2290.0), (16, 1830.0), (17, 1810.0), (18, 1800.0),
    ]
    for day_num, kcal in sample_days:
        evaluasiMalam(
            db=db,
            id_user=id_user,
            target_date=datetime.date(2026, 10, day_num),
            tipe_pemicu="otomatis_20_00",
            overrides={"aktual_energi": kcal},
            kirim_notifikasi=False,
        )
    return {
        "status": "success",
        "message": "14 riwayat evaluasi malam Oktober 2026 berhasil disimpan ke daily_evaluation.",
    }