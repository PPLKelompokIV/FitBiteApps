from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Sesuaikan user, password, dan nama database postgres lokal Anda
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:Faiz050105@localhost:5432/fitbite_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()