from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.food_log import FoodLog
from app.schemas.food_log import FoodLogCreateRequest

router = APIRouter(prefix="/api/food-logs", tags=["Food Log (FIT-33 / FIT-35)"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_food_log(payload: FoodLogCreateRequest, db: Session = Depends(get_db)):
    """
    FIT-35: Endpoint POST pencatatan makanan ke tabel food_log
    beserta kalkulasi makronutrien proporsional berdasarkan jumlah porsi.
    """
    # Kalkulasi gramasi dan makronutrien per porsi di sisi server
    estimasi_gram = round(payload.jumlah_porsi * payload.basis_gram, 1)
    kalori_total = round(payload.kalori_per_100g * payload.jumlah_porsi, 1)
    protein_total = round(payload.protein_per_100g * payload.jumlah_porsi, 1)
    karbo_total = round(payload.karbo_per_100g * payload.jumlah_porsi, 1)
    lemak_total = round(payload.lemak_per_100g * payload.jumlah_porsi, 1)

    new_log = FoodLog(
        id_user=payload.id_user,
        id_catalog=payload.id_catalog,
        tanggal=payload.tanggal,
        slot_makan=payload.slot_makan,
        metode_input=payload.metode_input,
        nama_makanan=payload.nama_makanan,
        estimasi_gram=estimasi_gram,
        kalori=kalori_total,
        protein_g=protein_total,
        karbo_g=karbo_total,
        lemak_g=lemak_total,
        foto_url=payload.foto_url,
    )

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return {
        "status": "success",
        "message": f"{new_log.nama_makanan} ({round(new_log.kalori)} kkal) berhasil dicatat ke {new_log.slot_makan}.",
        "data": {
            "id_food_log": new_log.id_food_log,
            "id_user": new_log.id_user,
            "tanggal": str(new_log.tanggal),
            "slot_makan": new_log.slot_makan,
            "metode_input": new_log.metode_input,
            "nama_makanan": new_log.nama_makanan,
            "estimasi_gram": new_log.estimasi_gram,
            "kalori": new_log.kalori,
            "protein_g": new_log.protein_g,
            "karbo_g": new_log.karbo_g,
            "lemak_g": new_log.lemak_g,
        },
    }

@router.get("/{id_user}")
def get_daily_food_logs(id_user: int, tanggal: date = date.today(), db: Session = Depends(get_db)):
    logs = (
        db.query(FoodLog)
        .filter(FoodLog.id_user == id_user, FoodLog.tanggal == tanggal)
        .order_by(FoodLog.id_food_log.asc())
        .all()
    )
    return {"status": "success", "data": logs}

@router.delete("/{id_food_log}")
def delete_food_log(id_food_log: int, db: Session = Depends(get_db)):
    log_item = db.query(FoodLog).filter(FoodLog.id_food_log == id_food_log).first()
    if not log_item:
        raise HTTPException(status_code=404, detail="Catatan makanan tidak ditemukan.")
    db.delete(log_item)
    db.commit()
    return {"status": "success", "message": "Catatan makanan berhasil dihapus."}