import pytest
from datetime import date
from app.schemas.water_log import WaterLogCreateRequest, WaterLogUpdateRequest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

# Setup test in-memory SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_water.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=test_engine)
client = TestClient(app)

def test_water_log_create_valid():
    req = WaterLogCreateRequest(
        id_user=1,
        tanggal=date.today(),
        waktu="08.00 WIB",
        jumlah_ml=250,
        catatan="Air Mineral"
    )
    assert req.waktu == "08.00 WIB"
    assert req.jumlah_ml == 250
    assert req.catatan == "Air Mineral"

def test_water_log_create_rejects_negative_or_zero_ml():
    with pytest.raises(ValueError):
        WaterLogCreateRequest(
            id_user=1,
            tanggal=date.today(),
            waktu="08.00 WIB",
            jumlah_ml=0
        )

def test_water_log_create_rejects_empty_time():
    with pytest.raises(ValueError):
        WaterLogCreateRequest(
            id_user=1,
            tanggal=date.today(),
            waktu="",
            jumlah_ml=250
        )

def test_water_log_update_allows_partial():
    req = WaterLogUpdateRequest(jumlah_ml=500)
    assert req.jumlah_ml == 500
    assert req.waktu is None

def test_api_crud_flow():
    # 1. CREATE
    res_create = client.post("/api/water-logs", json={
        "id_user": 1,
        "tanggal": str(date.today()),
        "waktu": "07.00 WIB",
        "jumlah_ml": 500,
        "catatan": "Air Hangat"
    })
    assert res_create.status_code == 201
    created = res_create.json()["data"]
    log_id = created["id_water_log"]
    assert created["jumlah_ml"] == 500

    # 2. READ
    res_get = client.get("/api/water-logs/1")
    assert res_get.status_code == 200
    assert res_get.json()["total_ml"] >= 500

    # 3. UPDATE
    res_update = client.put(f"/api/water-logs/{log_id}", json={
        "jumlah_ml": 600,
        "waktu": "07.30 WIB"
    })
    assert res_update.status_code == 200
    assert res_update.json()["data"]["jumlah_ml"] == 600
    assert res_update.json()["data"]["waktu"] == "07.30 WIB"

    # 4. DELETE
    res_delete = client.delete(f"/api/water-logs/{log_id}")
    assert res_delete.status_code == 200
    assert "berhasil dihapus" in res_delete.json()["message"]

def test_api_monthly_daily_logs_returns_food_and_water_read_only():
    log_date = "2026-10-18"
    food_response = client.post("/api/food-logs", json={
        "id_user": 1,
        "tanggal": log_date,
        "slot_makan": "Sarapan",
        "nama_makanan": "Oat dan buah",
        "jumlah_porsi": 1,
        "basis_gram": 100,
        "kalori_per_100g": 400,
    })
    water_response = client.post("/api/water-logs", json={
        "id_user": 1,
        "tanggal": log_date,
        "waktu": "08.00 WIB",
        "jumlah_ml": 500,
    })

    assert food_response.status_code == 201
    assert water_response.status_code == 201

    response = client.get("/api/daily-logs/1?year=2026&month=10")

    assert response.status_code == 200
    day = next(item for item in response.json()["data"] if item["tanggal"] == log_date)
    assert day["food_logs"][0]["nama_makanan"] == "Oat dan buah"
    assert day["water_logs"][0]["jumlah_ml"] == 500
