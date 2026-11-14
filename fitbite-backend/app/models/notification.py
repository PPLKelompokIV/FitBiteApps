from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Notification(Base):
    __tablename__ = "notification"

    id_notification = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, index=True, default=1)
    kategori = Column(String(50), nullable=False)        # minum_air, body_check, evaluasi_malam, jurnal_makanan
    judul = Column(String(150), nullable=False)
    pesan = Column(String(300), nullable=False)
    waktu_kirim = Column(String(60), nullable=False)     # Contoh: "Hari ini • 18.25 WIB"
    tautan_tujuan = Column(String(120), nullable=False)  # Contoh: "/aktivitas-hidrasi"
    sudah_dibaca = Column(Boolean, default=False, nullable=False)