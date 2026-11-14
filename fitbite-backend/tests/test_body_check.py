import pytest
from fastapi.testclient import TestClient
from app.routers.body_check import hitung_target_cairan_dasar, router
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_kalkulasi_cairan_dasar_64kg():
    # 35 ml * 64 kg = 2240 ml
    assert hitung_target_cairan_dasar(64.0) == 2240

def test_kalkulasi_cairan_dasar_70kg():
    # 35 ml * 70 kg = 2450 ml
    assert hitung_target_cairan_dasar(70.0) == 2450

def test_kalkulasi_cairan_dasar_desimal():
    # 35 ml * 55.5 kg = 1942.5 -> round to 1942 or 1943
    assert hitung_target_cairan_dasar(55.5) in (1942, 1943)

def test_kalkulasi_cairan_dasar_tolak_nol_atau_negatif():
    with pytest.raises(ValueError):
        hitung_target_cairan_dasar(0)
    with pytest.raises(ValueError):
        hitung_target_cairan_dasar(-10.5)

def test_api_body_check_menghasilkan_water_ml_otomatis():
    response = client.post("/api/body-check", json={
        "weight": 70.0,
        "sleepDuration": 8.0,
        "sleepQuality": "Nyenyak",
        "energyLevel": 4,
        "plannedIntensity": "Sedang"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Harus 35 * 70 = 2450 ml, bukan 2240 statis lagi!
    assert data["overview"]["water_ml"] == 2450
    assert data["overview"]["water_formula"] == "35 ml × 70.0 kg"

def test_api_body_check_validasi_berat_nol_atau_negatif():
    response = client.post("/api/body-check", json={
        "weight": -5.0,
        "sleepDuration": 7.0,
        "sleepQuality": "Cukup",
        "energyLevel": 3,
        "plannedIntensity": "Ringan"
    })
    # Pydantic validation (Field gt=0) produces 422 Unprocessable Entity
    assert response.status_code == 422

def test_api_get_target_cairan_endpoint():
    response = client.get("/api/body-check/target-cairan/60")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # 35 * 60 = 2100 ml
    assert data["water_ml"] == 2100
    assert data["water_formula"] == "35 ml × 60.0 kg"
