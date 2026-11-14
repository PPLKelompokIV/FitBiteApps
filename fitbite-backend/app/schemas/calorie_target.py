from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.services.calorie_calculator import TingkatAktivitas


class CalorieTargetCalculateRequest(BaseModel):
    id_user: int = Field(gt=0)
    usia: int | None = Field(default=None, gt=0, le=120)
    jenis_kelamin: Literal["laki-laki", "perempuan"] | None = None
    tinggi_cm: float | None = Field(default=None, gt=0, le=300, allow_inf_nan=False)
    berat_kg: float | None = Field(default=None, gt=0, le=500, allow_inf_nan=False)
    tingkat_aktivitas: TingkatAktivitas | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_empty_profile_values(cls, values):
        if not isinstance(values, dict):
            return values

        normalized = values.copy()
        for field in (
            "usia",
            "jenis_kelamin",
            "tinggi_cm",
            "berat_kg",
            "tingkat_aktivitas",
        ):
            value = normalized.get(field)
            if isinstance(value, str) and not value.strip():
                normalized[field] = None
        return normalized
