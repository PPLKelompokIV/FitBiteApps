from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.database import Base


class CalorieTarget(Base):
    __tablename__ = "calorie_targets"

    id_calorie_target = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, index=True)
    usia = Column(Integer, nullable=False)
    jenis_kelamin = Column(String(20), nullable=False)
    tinggi_cm = Column(Float, nullable=False)
    berat_kg = Column(Float, nullable=False)
    tingkat_aktivitas = Column(String(20), nullable=False)
    faktor_aktivitas = Column(Float, nullable=False)
    bmr_kcal_per_hari = Column(Float, nullable=False)
    tdee_kcal_per_hari = Column(Float, nullable=False)
    sasaran_kalori_kcal_per_hari = Column(Float, nullable=False, default=0)
    tanggal_dibuat = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
