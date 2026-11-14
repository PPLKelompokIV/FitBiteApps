from calendar import monthrange
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.food_log import FoodLog
from app.models.water_log import WaterLog

router = APIRouter(prefix="/api/daily-logs", tags=["Daily Logs"])


@router.get("/{id_user}")
def get_monthly_daily_logs(
    id_user: int,
    year: int = Query(..., ge=1, le=9999),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    start_date = date(year, month, 1)
    end_date = date(year, month, monthrange(year, month)[1])
    daily_logs = {}

    food_logs = (
        db.query(FoodLog)
        .filter(
            FoodLog.id_user == id_user,
            FoodLog.tanggal >= start_date,
            FoodLog.tanggal <= end_date,
        )
        .order_by(FoodLog.tanggal.asc(), FoodLog.id_food_log.asc())
        .all()
    )
    for log in food_logs:
        day = daily_logs.setdefault(
            log.tanggal.isoformat(),
            {"tanggal": log.tanggal.isoformat(), "food_logs": [], "water_logs": []},
        )
        day["food_logs"].append(
            {
                "id_food_log": log.id_food_log,
                "slot_makan": log.slot_makan,
                "nama_makanan": log.nama_makanan,
                "estimasi_gram": log.estimasi_gram,
                "kalori": log.kalori,
                "protein_g": log.protein_g,
                "karbo_g": log.karbo_g,
                "lemak_g": log.lemak_g,
            }
        )

    water_logs = (
        db.query(WaterLog)
        .filter(
            WaterLog.id_user == id_user,
            WaterLog.tanggal >= start_date,
            WaterLog.tanggal <= end_date,
        )
        .order_by(WaterLog.tanggal.asc(), WaterLog.id_water_log.asc())
        .all()
    )
    for log in water_logs:
        day = daily_logs.setdefault(
            log.tanggal.isoformat(),
            {"tanggal": log.tanggal.isoformat(), "food_logs": [], "water_logs": []},
        )
        day["water_logs"].append(
            {
                "id_water_log": log.id_water_log,
                "waktu": log.waktu,
                "jumlah_ml": log.jumlah_ml,
                "catatan": log.catatan,
            }
        )

    return {
        "status": "success",
        "year": year,
        "month": month,
        "data": [daily_logs[key] for key in sorted(daily_logs)],
    }
