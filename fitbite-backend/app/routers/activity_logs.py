from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity_log import ActivityLog

router = APIRouter(prefix="/api/activity-logs", tags=["Activity Log"])


class ActivityLogCreateRequest(BaseModel):
    id_user: int = Field(default=1, gt=0)
    tanggal: date
    nama_aktivitas: str = Field(min_length=1, max_length=100)
    durasi_menit: int = Field(gt=0, le=1440)
    waktu_mulai: str = Field(min_length=5, max_length=5)
    met: float = Field(gt=0, le=30)
    kalori_terbakar: float = Field(ge=0)


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
