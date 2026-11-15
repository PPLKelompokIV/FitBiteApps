import math
from typing import Literal


TingkatAktivitas = Literal["sedentari", "ringan", "sedang", "aktif", "sangat_aktif"]

FAKTOR_AKTIVITAS: dict[TingkatAktivitas, float] = {
    "sedentari": 1.2,
    "ringan": 1.375,
    "sedang": 1.55,
    "aktif": 1.725,
    "sangat_aktif": 1.9,
}


def hitungMifflinBMR(
    usia: int,
    jenis_kelamin: Literal["laki-laki", "perempuan"],
    tinggi_cm: float,
    berat_kg: float,
) -> float:
    """Hitung BMR harian dengan rumus Mifflin-St Jeor."""
    if not 1 <= usia <= 120:
        raise ValueError("Usia harus berada di antara 1 dan 120 tahun.")
    if jenis_kelamin not in ("laki-laki", "perempuan"):
        raise ValueError("Jenis kelamin harus 'laki-laki' atau 'perempuan'.")
    if not math.isfinite(tinggi_cm) or not 0 < tinggi_cm <= 300:
        raise ValueError("Tinggi badan harus lebih besar dari 0 dan maksimal 300 cm.")
    if not math.isfinite(berat_kg) or not 0 < berat_kg <= 500:
        raise ValueError("Berat badan harus lebih besar dari 0 dan maksimal 500 kg.")

    konstanta = 5 if jenis_kelamin == "laki-laki" else -161
    return round(10 * berat_kg + 6.25 * tinggi_cm - 5 * usia + konstanta, 1)


def hitungTDEEDinamis(
    bmr_kcal_per_hari: float,
    tingkat_aktivitas: TingkatAktivitas,
) -> float:
    """Hitung TDEE dengan faktor aktivitas harian."""
    if not math.isfinite(bmr_kcal_per_hari) or bmr_kcal_per_hari <= 0:
        raise ValueError("BMR harus lebih besar dari 0 kkal per hari.")

    faktor_aktivitas = FAKTOR_AKTIVITAS.get(tingkat_aktivitas)
    if faktor_aktivitas is None:
        raise ValueError("Tingkat aktivitas tidak dikenal.")

    return round(bmr_kcal_per_hari * faktor_aktivitas, 1)


def hitungSasaranKalori(
    tdee_kcal_per_hari: float,
    jenis_kelamin: Literal["laki-laki", "perempuan"],
) -> int:
    """Hitung defisit 15% dengan batas minimum sasaran sesuai jenis kelamin."""
    if not math.isfinite(tdee_kcal_per_hari) or tdee_kcal_per_hari <= 0:
        raise ValueError("TDEE harus lebih besar dari 0 kkal per hari.")
    if jenis_kelamin not in ("laki-laki", "perempuan"):
        raise ValueError("Jenis kelamin harus 'laki-laki' atau 'perempuan'.")

    sasaran_defisit = int(math.floor(tdee_kcal_per_hari * 0.85 / 10 + 0.5) * 10)
    batas_minimum = 1200 if jenis_kelamin == "perempuan" else 1500
    return max(sasaran_defisit, batas_minimum)
