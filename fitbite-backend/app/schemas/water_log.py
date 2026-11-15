from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date

class WaterLogCreateRequest(BaseModel):
    id_user: int = 1
    tanggal: date = date.today()
    waktu: str
    jumlah_ml: int
    catatan: Optional[str] = "Air Putih"

    @field_validator("waktu")
    @classmethod
    def validate_waktu(cls, v: str):
        if not v or not v.strip():
            raise ValueError("Waktu minum tidak boleh kosong.")
        return v.strip()

    @field_validator("jumlah_ml")
    @classmethod
    def validate_jumlah_ml(cls, v: int):
        if v <= 0:
            raise ValueError("Jumlah air harus lebih besar dari 0 ml.")
        return v

class WaterLogUpdateRequest(BaseModel):
    waktu: Optional[str] = None
    jumlah_ml: Optional[int] = None
    catatan: Optional[str] = None

    @field_validator("jumlah_ml")
    @classmethod
    def validate_jumlah_ml(cls, v: Optional[int]):
        if v is not None and v <= 0:
            raise ValueError("Jumlah air harus lebih besar dari 0 ml.")
        return v

class WaterLogResponse(BaseModel):
    id_water_log: int
    id_user: int
    tanggal: str
    waktu: str
    jumlah_ml: int
    catatan: Optional[str]

