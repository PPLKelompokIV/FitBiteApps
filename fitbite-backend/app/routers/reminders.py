from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.reminder import SmartReminder
from app.schemas.reminder import ReminderBulkSaveRequest

# Router konfigurasi Smart Reminder (FIT-49 / FIT-51 / FIT-52)
router = APIRouter(prefix="/api/reminders", tags=["Smart Reminder (FIT-49 / FIT-51 / FIT-52)"])


# ==========================================
# 1. READ (R): Mengambil Jadwal Pengingat
# ==========================================
@router.get("/{id_user}", status_code=status.HTTP_200_OK)
def get_user_reminders(id_user: int, db: Session = Depends(get_db)):
    reminders = db.query(SmartReminder).filter(SmartReminder.id_user == id_user).all()
    return {
        "status": "success",
        "data": [
            {
                "id_reminder": r.id_reminder,
                "id_user": r.id_user,
                "jenis_pengingat": r.jenis_pengingat,
                "waktu_jadwal": r.waktu_jadwal,
                "saluran": r.saluran,
                "status_aktif": r.status_aktif,
            }
            for r in reminders
        ],
    }


# ==========================================
# 2. CREATE (C) & UPDATE (U): Simpan / Perbarui Jadwal
# Subtask FIT-51: Validasi waktu & penyimpanan tabel smart_reminder
# Subtask FIT-52: Pengembalian status sukses untuk notifikasi dan sinkronisasi scheduler
# ==========================================
@router.post("/save", status_code=status.HTTP_200_OK)
@router.put("/save", status_code=status.HTTP_200_OK)
def save_user_reminders(payload: ReminderBulkSaveRequest, db: Session = Depends(get_db)):
    saved_items = []

    for item in payload.jadwal:
        existing = db.query(SmartReminder).filter(
            SmartReminder.id_user == payload.id_user,
            SmartReminder.jenis_pengingat == item.jenis_pengingat,
        ).first()

        if existing:
            # Operasi UPDATE
            existing.waktu_jadwal = item.waktu_jadwal
            existing.saluran = item.saluran
            existing.status_aktif = item.status_aktif
            saved_items.append(existing)
        else:
            # Operasi CREATE
            baru = SmartReminder(
                id_user=payload.id_user,
                jenis_pengingat=item.jenis_pengingat,
                waktu_jadwal=item.waktu_jadwal,
                saluran=item.saluran,
                status_aktif=item.status_aktif,
            )
            db.add(baru)
            saved_items.append(baru)

    db.commit()

    # Payload respons sukses untuk memicu Toast sukses dan pembaruan jadwal pengingat (FIT-52)
    return {
        "status": "success",
        "message": "Pengaturan jadwal pengingat berhasil disimpan.",
        "data": [
            {
                "jenis_pengingat": s.jenis_pengingat,
                "waktu_jadwal": s.waktu_jadwal,
                "saluran": s.saluran,
                "status_aktif": s.status_aktif,
            }
            for s in saved_items
        ],
    }


# ==========================================
# 3. DELETE (D): Reset Seluruh Jadwal Pengguna
# ==========================================
@router.delete("/reset/{id_user}", status_code=status.HTTP_200_OK)
def reset_user_reminders(id_user: int, db: Session = Depends(get_db)):
    """
    DELETE: Menghapus konfigurasi jadwal pengingat pengguna (reset ke awal).
    """
    deleted_count = db.query(SmartReminder).filter(SmartReminder.id_user == id_user).delete()
    db.commit()
    return {
        "status": "success",
        "message": f"Berhasil menghapus {deleted_count} jadwal pengingat untuk user {id_user}.",
    }