from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore

try:
    from app.routers import admin_foods
except (ImportError, ValueError):
    from .routers import admin_foods

try:
    from app.routers import reminders
except (ImportError, ValueError):
    from .routers import reminders

app = FastAPI(
    title="FitBite API",
    description="Backend Service FitBite menggunakan Python FastAPI",
    version="1.0.0",
)

# Izinkan akses dari Frontend Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pasang router admin_foods dan reminders
app.include_router(admin_foods.router)
app.include_router(reminders.router)


@app.on_event("startup")
def startup_db():
    try:
        from app.database import engine, Base
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Info: Database PostgreSQL lokal belum menyala ({e}). Backend katalog makanan tetap siap melayani.")


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "FitBite Backend FastAPI",
        "docs": "http://localhost:5000/docs",
    }
