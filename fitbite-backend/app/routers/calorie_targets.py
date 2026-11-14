from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.calorie_target import CalorieTarget
from app.schemas.calorie_target import CalorieTargetCalculateRequest
from app.services.calorie_calculator import (
    FAKTOR_AKTIVITAS,
    hitungMifflinBMR,
    hitungSasaranKalori,
    hitungTDEEDinamis,
)


router = APIRouter(prefix="/api/calorie-targets", tags=["Calorie Targets"])


def _calorie_target_data(record: CalorieTarget) -> dict:
    return {
        "id_calorie_target": record.id_calorie_target,
        "id_user": record.id_user,
        "usia": record.usia,
        "jenis_kelamin": record.jenis_kelamin,
        "tinggi_cm": record.tinggi_cm,
        "berat_kg": record.berat_kg,
        "tingkat_aktivitas": record.tingkat_aktivitas,
        "faktor_aktivitas": record.faktor_aktivitas,
        "bmr_kcal_per_hari": record.bmr_kcal_per_hari,
        "tdee_kcal_per_hari": record.tdee_kcal_per_hari,
        "sasaran_kalori_kcal_per_hari": record.sasaran_kalori_kcal_per_hari,
        "tanggal_dibuat": record.tanggal_dibuat.isoformat(),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def calculate_and_save_calorie_target(
    payload: CalorieTargetCalculateRequest,
    db: Session = Depends(get_db),
):
    profile_fields = {
        "usia": "usia",
        "jenis_kelamin": "jenis kelamin",
        "tinggi_cm": "tinggi badan",
        "berat_kg": "berat badan",
        "tingkat_aktivitas": "tingkat aktivitas",
    }
    missing_fields = [
        label
        for field, label in profile_fields.items()
        if getattr(payload, field) is None
    ]
    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "PROFILE_INCOMPLETE",
                "message": (
                    "Profil fisik belum lengkap. Lengkapi data berikut "
                    "sebelum menghitung BMR dan TDEE."
                ),
                "missing_fields": missing_fields,
            },
        )

    bmr = hitungMifflinBMR(
        usia=payload.usia,
        jenis_kelamin=payload.jenis_kelamin,
        tinggi_cm=payload.tinggi_cm,
        berat_kg=payload.berat_kg,
    )
    tdee = hitungTDEEDinamis(
        bmr_kcal_per_hari=bmr,
        tingkat_aktivitas=payload.tingkat_aktivitas,
    )
    record = CalorieTarget(
        **payload.model_dump(),
        faktor_aktivitas=FAKTOR_AKTIVITAS[payload.tingkat_aktivitas],
        bmr_kcal_per_hari=bmr,
        tdee_kcal_per_hari=tdee,
        sasaran_kalori_kcal_per_hari=hitungSasaranKalori(tdee),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "message": "Hasil perhitungan BMR, TDEE, dan sasaran kalori berhasil disimpan.",
        "data": _calorie_target_data(record),
    }


@router.get("/{id_user}")
def get_latest_calorie_target(
    id_user: int = Path(gt=0),
    db: Session = Depends(get_db),
):
    record = (
        db.query(CalorieTarget)
        .filter(CalorieTarget.id_user == id_user)
        .order_by(CalorieTarget.tanggal_dibuat.desc(), CalorieTarget.id_calorie_target.desc())
        .first()
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hasil perhitungan kalori belum tersedia untuk pengguna ini.",
        )
    return {"status": "success", "data": _calorie_target_data(record)}
