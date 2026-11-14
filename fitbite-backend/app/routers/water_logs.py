from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from app.database import get_db
from app.models.water_log import WaterLog
from app.schemas.water_log import WaterLogCreateRequest, WaterLogUpdateRequest

router = APIRouter(prefix="/api/water-logs", tags=["Water Log / Hidrasi (FIT-37 / FIT-38)"])

# 1. CREATE (POST)
@router.post("", status_code=status.HTTP_201_CREATED)
def create_water_log(payload: WaterLogCreateRequest, db: Session = Depends(get_db)):
    """
    Menambahkan catatan asupan minum air baru ke database.
    """
    new_log = WaterLog(
        id_user=payload.id_user,
        tanggal=payload.tanggal,
        waktu=payload.waktu,
        jumlah_ml=payload.jumlah_ml,
        catatan=payload.catatan or "Air Putih",
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return {
        "status": "success",
        "message": f"Catatan minum {new_log.jumlah_ml} ml ({new_log.waktu}) berhasil disimpan.",
        "data": {
            "id_water_log": new_log.id_water_log,
            "id_user": new_log.id_user,
            "tanggal": str(new_log.tanggal),
            "waktu": new_log.waktu,
            "jumlah_ml": new_log.jumlah_ml,
            "catatan": new_log.catatan,
        },
    }

# 2. READ (GET)
@router.get("/{id_user}")
def get_daily_water_logs(
    id_user: int,
    tanggal: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Mengambil riwayat catatan minum pengguna untuk tanggal tertentu (default: hari ini).
    """
    target_date = tanggal or date.today()
    logs = (
        db.query(WaterLog)
        .filter(WaterLog.id_user == id_user, WaterLog.tanggal == target_date)
        .order_by(WaterLog.id_water_log.asc())
        .all()
    )
    total_ml = sum(log.jumlah_ml for log in logs)

    return {
        "status": "success",
        "tanggal": str(target_date),
        "total_ml": total_ml,
        "count": len(logs),
        "data": [
            {
                "id_water_log": log.id_water_log,
                "id_user": log.id_user,
                "tanggal": str(log.tanggal),
                "waktu": log.waktu,
                "jumlah_ml": log.jumlah_ml,
                "catatan": log.catatan,
            }
            for log in logs
        ],
    }

# 3. UPDATE (PUT)
@router.put("/{id_water_log}")
def update_water_log(
    id_water_log: int,
    payload: WaterLogUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Memperbarui waktu, jumlah ml, atau catatan asupan air yang sudah ada.
    """
    log_item = db.query(WaterLog).filter(WaterLog.id_water_log == id_water_log).first()
    if not log_item:
        raise HTTPException(status_code=404, detail="Catatan minum tidak ditemukan.")

    if payload.waktu is not None:
        log_item.waktu = payload.waktu
    if payload.jumlah_ml is not None:
        log_item.jumlah_ml = payload.jumlah_ml
    if payload.catatan is not None:
        log_item.catatan = payload.catatan

    db.commit()
    db.refresh(log_item)

    return {
        "status": "success",
        "message": "Catatan minum berhasil diperbarui.",
        "data": {
            "id_water_log": log_item.id_water_log,
            "id_user": log_item.id_user,
            "tanggal": str(log_item.tanggal),
            "waktu": log_item.waktu,
            "jumlah_ml": log_item.jumlah_ml,
            "catatan": log_item.catatan,
        },
    }

# 4. DELETE (DELETE)
@router.delete("/{id_water_log}")
def delete_water_log(id_water_log: int, db: Session = Depends(get_db)):
    """
    Menghapus catatan minum tertentu berdasarkan ID.
    """
    log_item = db.query(WaterLog).filter(WaterLog.id_water_log == id_water_log).first()
    if not log_item:
        raise HTTPException(status_code=404, detail="Catatan minum tidak ditemukan.")

    db.delete(log_item)
    db.commit()

    return {
        "status": "success",
        "message": f"Catatan minum ({log_item.waktu} - {log_item.jumlah_ml} ml) berhasil dihapus.",
    }

