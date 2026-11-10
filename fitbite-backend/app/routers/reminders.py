from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.reminder import SmartReminder
from app.schemas.reminder import ReminderBulkSaveRequest

router = APIRouter(prefix="/api/reminders", tags=["Smart Reminder (FIT-49 / FIT-51)"])

@router.get("/{id_user}")
def get_user_reminders(id_user: int, db: Session = Depends(get_db)):
    reminders = db.query(SmartReminder).filter(SmartReminder.id_user == id_user).all()
    return {"status": "success", "data": reminders}

@router.put("/save", status_code=status.HTTP_200_OK)
def save_user_reminders(payload: ReminderBulkSaveRequest, db: Session = Depends(get_db)):
    saved_items = []
    for item in payload.jadwal:
        existing = db.query(SmartReminder).filter(
            SmartReminder.id_user == payload.id_user,
            SmartReminder.jenis_pengingat == item.jenis_pengingat
        ).first()

        if existing:
            existing.waktu_jadwal = item.waktu_jadwal
            existing.saluran = item.saluran
            existing.status_aktif = item.status_aktif
            saved_items.append(existing)
        else:
            baru = SmartReminder(
                id_user=payload.id_user,
                jenis_pengingat=item.jenis_pengingat,
                waktu_jadwal=item.waktu_jadwal,
                saluran=item.saluran,
                status_aktif=item.status_aktif
            )
            db.add(baru)
            saved_items.append(baru)

    db.commit()
    return {
        "status": "success",
        "message": "Pengaturan jadwal pengingat berhasil disimpan.",
        "data": [
            {
                "jenis_pengingat": s.jenis_pengingat,
                "waktu_jadwal": s.waktu_jadwal,
                "status_aktif": s.status_aktif
            } for s in saved_items
        ]
    }