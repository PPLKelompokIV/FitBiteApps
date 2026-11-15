from datetime import date

from sqlalchemy import Column, Date, Float, Integer, String

from app.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id_activity_log = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, default=1, index=True)
    tanggal = Column(Date, nullable=False, default=date.today, index=True)
    nama_aktivitas = Column(String(100), nullable=False)
    durasi_menit = Column(Integer, nullable=False)
    waktu_mulai = Column(String(5), nullable=False)
    met = Column(Float, nullable=False)
    kalori_terbakar = Column(Float, nullable=False)
