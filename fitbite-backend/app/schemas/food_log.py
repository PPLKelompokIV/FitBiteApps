from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date

VALID_SLOTS = {"Sarapan", "Makan siang", "Makan malam", "Camilan", "Snack"}

class FoodLogCreateRequest(BaseModel):
    id_user: int = 1
    id_catalog: Optional[int] = None
    tanggal: date
    slot_makan: str
    metode_input: str = "katalog"
    nama_makanan: str
    jumlah_porsi: float = 1.0
    basis_gram: float = 100.0
    kalori_per_100g: float
    protein_per_100g: float = 0.0
    karbo_per_100g: float = 0.0
    lemak_per_100g: float = 0.0
    foto_url: Optional[str] = None

    @field_validator("nama_makanan")
    @classmethod
    def validasi_nama(cls, v: str):
        if not v or not v.strip():
            raise ValueError("Nama makanan wajib diisi.")
        return v.strip()

    @field_validator("slot_makan")
    @classmethod
    def validasi_slot(cls, v: str):
        if v.strip() not in VALID_SLOTS:
            raise ValueError(f"Slot makan harus salah satu dari: {', '.join(VALID_SLOTS)}")
        return v.strip()

    @field_validator("jumlah_porsi")
    @classmethod
    def validasi_porsi(cls, v: float):
        if v <= 0:
            raise ValueError("Jumlah porsi harus lebih besar dari 0.")
        return v

    @field_validator("kalori_per_100g", "protein_per_100g", "karbo_per_100g", "lemak_per_100g")
    @classmethod
    def validasi_nutrisi_positif(cls, v: float):
        if v < 0:
            raise ValueError("Nilai kalori dan makronutrien tidak boleh bernilai negatif.")
        return v