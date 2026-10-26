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