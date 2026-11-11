import re
from pydantic import BaseModel, field_validator
from typing import List

TIME_24H_REGEX = re.compile(r"^([01]\d|2[0-3])[:.]([0-5]\d)$")
INTERVAL_REGEX = re.compile(r"^([1-9]|1[0-2])\s*jam$", re.IGNORECASE)

class ReminderItemSchema(BaseModel):
    jenis_pengingat: str
    waktu_jadwal: str
    saluran: str = "in_app"
    status_aktif: bool = True

    @field_validator("waktu_jadwal")
    @classmethod
    def validasi_format_waktu(cls, v: str, info):
        nilai = v.strip()
        if not nilai:
            raise ValueError("Waktu jadwal tidak boleh kosong.")

        jenis = (info.data.get("jenis_pengingat") or "").lower()
        if "minum" in jenis:
            if not (INTERVAL_REGEX.match(nilai) or TIME_24H_REGEX.match(nilai)):
                raise ValueError("Interval minum tidak valid. Contoh valid: '2 jam' atau '09:00'.")
        else:
            if not TIME_24H_REGEX.match(nilai):
                raise ValueError(f"Format jam '{nilai}' tidak valid. Gunakan format 24 jam (HH:MM / HH.MM).")

        return nilai.replace(".", ":")

class ReminderBulkSaveRequest(BaseModel):
    id_user: int
    jadwal: List[ReminderItemSchema]