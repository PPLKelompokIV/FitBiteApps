from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.routers import admin_foods
except (ImportError, ValueError):
    from .routers import admin_foods

app = FastAPI(
    title="FitBite Backend API",
    description="Backend Service FitBite menggunakan Python FastAPI",
    version="1.0.0",
)

# Izinkan akses dari Frontend Vite (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pasang router admin_foods
app.include_router(admin_foods.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "FitBite Backend FastAPI",
        "docs": "http://localhost:5000/docs",
    }

