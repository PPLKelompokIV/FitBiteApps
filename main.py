from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="FitBite AI & Calculation Service")

# Izinkan komunikasi dari Frontend (5173) & Node.js (5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
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