from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base

class FoodLog(Base):
    __tablename__ = "food_log"

    id_food_log = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, index=True)
    id_catalog = Column(Integer, nullable=True)  # Opsional untuk Quick Add / Custom
    tanggal = Column(Date, nullable=False, index=True)
    slot_makan = Column(String(30), nullable=False)  # Sarapan, Makan siang, Makan malam, Camilan
    metode_input = Column(String(30), default="katalog", nullable=False)  # katalog, quick_add, foto_ai, barcode
    nama_makanan = Column(String(120), nullable=False)
    estimasi_gram = Column(Float, default=100.0, nullable=False)
    kalori = Column(Float, nullable=False)
    protein_g = Column(Float, default=0.0, nullable=False)
    karbo_g = Column(Float, default=0.0, nullable=False)
    lemak_g = Column(Float, default=0.0, nullable=False)
    foto_url = Column(String(255), nullable=True)