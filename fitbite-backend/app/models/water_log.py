from sqlalchemy import Column, Integer, String, Date
from datetime import date
from app.database import Base

class WaterLog(Base):
    __tablename__ = "water_logs"

    id_water_log = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, default=1, index=True)
    tanggal = Column(Date, nullable=False, default=date.today, index=True)
    waktu = Column(String(20), nullable=False)
    jumlah_ml = Column(Integer, nullable=False)
    catatan = Column(String(100), nullable=True, default="Air Putih")

