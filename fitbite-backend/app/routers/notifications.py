from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification

router = APIRouter(prefix="/api/notifications", tags=["Notifications (FIT-53 / FIT-55)"])

DEFAULT_NOTIFICATIONS = [
    {
        "id_user": 1,
        "kategori": "minum_air",
        "judul": "Seteguk lagi sore ini?",
        "pesan": "Air hari ini 1.750 ml. Pengingat berikutnya pukul 19.00; masih ada 890 ml menuju target.",
        "waktu_kirim": "Hari ini • 18.25 WIB",
        "tautan_tujuan": "/aktivitas-hidrasi",
        "sudah_dibaca": False,
    },
    {
        "id_user": 1,
        "kategori": "body_check",
        "judul": "Body Check pagi tersimpan",
        "pesan": "Target hari ini siap • 19 Okt, 06.48 WIB",
        "waktu_kirim": "19 Okt • 06.48 WIB",
        "tautan_tujuan": "/body-check-pagi",
        "sudah_dibaca": True,
    },
    {
        "id_user": 1,
        "kategori": "evaluasi_malam",
        "judul": "Evaluasi Minggu siap dilihat",
        "pesan": "Lihat kembali kebiasaanmu • 18 Okt, 20.00 WIB",
        "waktu_kirim": "18 Okt • 20.00 WIB",
        "tautan_tujuan": "/jurnal-evaluasi",
        "sudah_dibaca": True,
    },
]

REMINDER_TEMPLATE_MAP = {
    "body_check": {
        "judul": "Waktunya Body Check pagi",
        "pesan": "Mulai hari dengan mengenali kondisi tubuh dan berat badanmu hari ini.",
        "tautan_tujuan": "/body-check-pagi",
    },
    "sarapan": {
        "judul": "Waktunya mencatat sarapan",
        "pesan": "Awali harimu dengan energi cukup. Catat menu sarapanmu di Jurnal makanan.",
        "tautan_tujuan": "/jurnal-makanan",
    },
    "makan_siang": {
        "judul": "Waktunya jeda makan siang",
        "pesan": "Beri jeda, nikmati makan siangmu, lalu catat porsinya agar terpantau.",
        "tautan_tujuan": "/jurnal-makanan",
    },
    "makan_malam": {
        "judul": "Lengkapi jurnal makan malam",
        "pesan": "Catat makan malammu untuk melihat sisa kalori dan keseimbangan nutrisi hari ini.",
        "tautan_tujuan": "/jurnal-makanan",
    },
    "minum_air": {
        "judul": "Saatnya minum segelas air",
        "pesan": "Jaga hidrasi tubuhmu tetap terpenuhi sesuai jadwal pengingat.",
        "tautan_tujuan": "/aktivitas-hidrasi",
    },
    "evaluasi_malam": {
        "judul": "Waktunya evaluasi malam",
        "pesan": "Laporan harianmu sudah siap. Tinjau kembali catatan makan dan hidrasi hari ini.",
        "tautan_tujuan": "/jurnal-evaluasi",
    },
}

class TriggerReminderNotificationRequest(BaseModel):
    id_user: int = 1
    kategori: str
    waktu_jadwal: str

def seed_notifications_if_needed(db: Session, id_user: int):
    existing_count = db.query(Notification).filter(Notification.id_user == id_user).count()
    if existing_count == 0:
        for item in DEFAULT_NOTIFICATIONS:
            db.add(Notification(**{**item, "id_user": id_user}))
        db.commit()

@router.get("/{id_user}")
def get_user_notifications(id_user: int, auto_seed: bool = True, db: Session = Depends(get_db)):
    if auto_seed:
        seed_notifications_if_needed(db, id_user)

    items = (
        db.query(Notification)
        .filter(Notification.id_user == id_user)
        .order_by(Notification.sudah_dibaca.asc(), Notification.id_notification.desc())
        .all()
    )
    unread_count = sum(1 for item in items if not item.sudah_dibaca)

    return {
        "status": "success",
        "unread_count": unread_count,
        "data": [
            {
                "id_notification": n.id_notification,
                "id_user": n.id_user,
                "kategori": n.kategori,
                "judul": n.judul,
                "pesan": n.pesan,
                "waktu_kirim": n.waktu_kirim,
                "tautan_tujuan": n.tautan_tujuan,
                "sudah_dibaca": n.sudah_dibaca,
            }
            for n in items
        ],
    }

@router.post("/trigger", status_code=status.HTTP_201_CREATED)
def trigger_reminder_notification(
    payload: TriggerReminderNotificationRequest, db: Session = Depends(get_db)
):
    """
    Membuat record notifikasi baru di tabel notification ketika waktu jadwal pengingat tiba,
    dengan pencegahan duplikasi (idempotent) jika halaman di-refresh pada menit yang sama.
    """
    jam_tampil = payload.waktu_jadwal.replace(":", ".")
    waktu_kirim_str = f"Hari ini • {jam_tampil} WIB"

    existing = (
        db.query(Notification)
        .filter(
            Notification.id_user == payload.id_user,
            Notification.kategori == payload.kategori,
            Notification.waktu_kirim == waktu_kirim_str,
        )
        .first()
    )

    if existing:
        return get_user_notifications(id_user=payload.id_user, auto_seed=False, db=db)

    template = REMINDER_TEMPLATE_MAP.get(
        payload.kategori,
        {
            "judul": "Pengingat Jadwal Harian",
            "pesan": f"Sudah pukul {jam_tampil} WIB, jangan lupa isi catatan harianmu.",
            "tautan_tujuan": "/jurnal-makanan",
        },
    )

    new_notif = Notification(
        id_user=payload.id_user,
        kategori=payload.kategori,
        judul=template["judul"],
        pesan=template["pesan"],
        waktu_kirim=waktu_kirim_str,
        tautan_tujuan=template["tautan_tujuan"],
        sudah_dibaca=False,
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)

    return get_user_notifications(id_user=payload.id_user, auto_seed=False, db=db)

@router.patch("/{id_notification}/read", status_code=status.HTTP_200_OK)
def mark_notification_as_read(id_notification: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id_notification == id_notification).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan.")

    notif.sudah_dibaca = True
    db.commit()
    db.refresh(notif)

    unread_count = (
        db.query(Notification)
        .filter(Notification.id_user == notif.id_user, Notification.sudah_dibaca == False)
        .count()
    )

    return {
        "status": "success",
        "message": "Notifikasi ditandai sudah dibaca.",
        "unread_count": unread_count,
        "data": {
            "id_notification": notif.id_notification,
            "sudah_dibaca": notif.sudah_dibaca,
            "tautan_tujuan": notif.tautan_tujuan,
        },
    }

@router.patch("/user/{id_user}/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_as_read(id_user: int, db: Session = Depends(get_db)):
    (
        db.query(Notification)
        .filter(Notification.id_user == id_user, Notification.sudah_dibaca == False)
        .update({"sudah_dibaca": True}, synchronize_session=False)
    )
    db.commit()

    return {
        "status": "success",
        "message": "Semua notifikasi berhasil ditandai telah dibaca.",
        "unread_count": 0,
    }

@router.delete("/user/{id_user}/clear", status_code=status.HTTP_200_OK)
def clear_user_notifications(id_user: int, db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.id_user == id_user).delete(synchronize_session=False)
    db.commit()
    return {"status": "success", "message": "Daftar notifikasi dikosongkan.", "unread_count": 0, "data": []}

@router.post("/user/{id_user}/reset", status_code=status.HTTP_200_OK)
def reset_default_notifications(id_user: int, db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.id_user == id_user).delete(synchronize_session=False)
    db.commit()
    seed_notifications_if_needed(db, id_user)
    return get_user_notifications(id_user=id_user, auto_seed=False, db=db)