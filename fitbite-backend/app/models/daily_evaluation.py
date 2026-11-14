from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text
from app.database import Base

WIB = timezone(timedelta(hours=7))


def now_wib():
    return datetime.now(WIB).replace(tzinfo=None)


class DailyEvaluation(Base):
    __tablename__ = "daily_evaluation"

    id_evaluation = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, index=True, default=1)
    tanggal_evaluasi = Column(Date, nullable=False, index=True)

    # Skor kepatuhan (0 - 100) dan status energi ('tercapai' | 'kurang' | 'berlebih')
    skor_kepatuhan = Column(Integer, nullable=False, default=0)
    status_energi = Column(String(30), nullable=False, default="tercapai")
    persentase_energi = Column(Integer, nullable=False, default=0)

    # Target vs Aktual (sesuai kolom tabel Evaluasi Malam di UI)
    target_energi_dasar = Column(Float, nullable=False, default=1700.0)
    kalori_olahraga = Column(Float, nullable=False, default=0.0)
    target_energi = Column(Float, nullable=False, default=1700.0)
    aktual_energi = Column(Float, nullable=False, default=0.0)

    target_protein = Column(Float, nullable=False, default=100.0)
    aktual_protein = Column(Float, nullable=False, default=0.0)

    target_karbo = Column(Float, nullable=False, default=190.0)
    aktual_karbo = Column(Float, nullable=False, default=0.0)

    target_lemak = Column(Float, nullable=False, default=60.0)
    aktual_lemak = Column(Float, nullable=False, default=0.0)

    target_air_dasar = Column(Float, nullable=False, default=2240.0)
    bonus_air_olahraga = Column(Float, nullable=False, default=0.0)
    target_air = Column(Float, nullable=False, default=2240.0)
    aktual_air = Column(Float, nullable=False, default=0.0)

    # Ringkasan kelengkapan log & saran korektif (disimpan sebagai JSON string)
    jumlah_log_makan = Column(Integer, nullable=False, default=0)
    jumlah_log_aktivitas = Column(Integer, nullable=False, default=0)
    durasi_olahraga = Column(Integer, nullable=False, default=0)
    jumlah_log_air = Column(Integer, nullable=False, default=0)

    saran_korektif = Column(Text, nullable=False, default="[]")
    tipe_pemicu = Column(String(30), nullable=False, default="manual")  # 'otomatis_20_00' | 'manual'
    waktu_evaluasi = Column(DateTime, nullable=False, default=now_wib)