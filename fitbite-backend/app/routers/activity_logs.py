from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity_log import ActivityLog

router = APIRouter(prefix="/api/activity-logs", tags=["Activity Log"])
activities_router = APIRouter(tags=["Activity Log"])


class ActivityLogCreateRequest(BaseModel):
    id_user: int = Field(default=1, gt=0)
    tanggal: date
    nama_aktivitas: str = Field(min_length=1, max_length=100)
    durasi_menit: int = Field(gt=0, le=360)
    waktu_mulai: str = Field(min_length=5, max_length=5)
    met: float = Field(gt=0, le=30)
    kalori_terbakar: float = Field(ge=0)


class ActivityMetLogCreateRequest(BaseModel):
    id_user: int = Field(gt=0)
    tanggal: date
    nama_aktivitas: str = Field(min_length=1, max_length=100)
    durasi_menit: int = Field(gt=0, le=360)
    waktu_mulai: str = Field(min_length=5, max_length=5)
    met: float = Field(gt=0, le=30, allow_inf_nan=False)
    berat_kg: float = Field(gt=0, le=500, allow_inf_nan=False)


class ActivityLogUpdateRequest(BaseModel):
    durasi_menit: int = Field(gt=0, le=360)
    berat_kg: float = Field(gt=0, le=500, allow_inf_nan=False)


def _activity_data(log: ActivityLog) -> dict:
    return {
        "id_activity_log": log.id_activity_log,
        "id_user": log.id_user,
        "tanggal": log.tanggal.isoformat(),
        "nama_aktivitas": log.nama_aktivitas,
        "durasi_menit": log.durasi_menit,
        "waktu_mulai": log.waktu_mulai,
        "met": log.met,
        "kalori_terbakar": log.kalori_terbakar,
    }


@activities_router.post("/api/activities/log", status_code=status.HTTP_201_CREATED)
def create_met_activity_log(
    payload: ActivityMetLogCreateRequest,
    db: Session = Depends(get_db),
):
    calories_burned = round(
        payload.met * 3.5 * payload.berat_kg * payload.durasi_menit / 200,
        1,
    )
    log = ActivityLog(
        id_user=payload.id_user,
        tanggal=payload.tanggal,
        nama_aktivitas=payload.nama_aktivitas,
        durasi_menit=payload.durasi_menit,
        waktu_mulai=payload.waktu_mulai,
        met=payload.met,
        kalori_terbakar=calories_burned,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"status": "success", "data": _activity_data(log)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_activity_log(
    payload: ActivityLogCreateRequest,
    db: Session = Depends(get_db),
):
    log = ActivityLog(**payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"status": "success", "data": _activity_data(log)}


@router.get("/{id_user}")
def get_activity_logs(
    id_user: int,
    tanggal: date | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(ActivityLog).filter(ActivityLog.id_user == id_user)
    if tanggal is not None:
        query = query.filter(ActivityLog.tanggal == tanggal)

    logs = query.order_by(ActivityLog.waktu_mulai, ActivityLog.id_activity_log).all()
    return {
        "status": "success",
        "tanggal": tanggal.isoformat() if tanggal else None,
        "total_kalori_terbakar": sum(log.kalori_terbakar for log in logs),
        "total_durasi_menit": sum(log.durasi_menit for log in logs),
        "count": len(logs),
        "data": [_activity_data(log) for log in logs],
    }


@router.put("/{id_activity_log}")
def update_activity_log(
    id_activity_log: int,
    payload: ActivityLogUpdateRequest,
    db: Session = Depends(get_db),
):
    log = (
        db.query(ActivityLog)
        .filter(ActivityLog.id_activity_log == id_activity_log)
        .first()
    )
    if log is None:
        raise HTTPException(status_code=404, detail="Catatan aktivitas tidak ditemukan.")

    log.durasi_menit = payload.durasi_menit
    log.kalori_terbakar = round(
        log.met * 3.5 * payload.berat_kg * payload.durasi_menit / 200,
        1,
    )
    db.commit()
    db.refresh(log)
    return {"status": "success", "data": _activity_data(log)}


@router.delete("/{id_activity_log}")
def delete_activity_log(id_activity_log: int, db: Session = Depends(get_db)):
    log = (
        db.query(ActivityLog)
        .filter(ActivityLog.id_activity_log == id_activity_log)
        .first()
    )
    if log is None:
        raise HTTPException(status_code=404, detail="Catatan aktivitas tidak ditemukan.")
    db.delete(log)
    db.commit()
    return {"status": "success", "message": "Catatan aktivitas berhasil dihapus."}
