from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class SmartReminder(Base):
    __tablename__ = "smart_reminder"

    id_reminder = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, index=True)  # <-- Hapus ForeignKey("users.id_user")
    jenis_pengingat = Column(String(50), nullable=False)
    waktu_jadwal = Column(String(20), nullable=False)
    saluran = Column(String(20), default="in_app", nullable=False)
    status_aktif = Column(Boolean, default=True, nullable=False)