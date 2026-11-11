from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import reminders, food_logs

# Otomatis membuat tabel smart_reminder dan food_log di PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FitBite API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reminders.router)
app.include_router(food_logs.router)