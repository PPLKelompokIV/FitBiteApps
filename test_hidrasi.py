"""
Pengujian Fungsional & E2E - Fitur Target Cairan Dasar & Hidrasi FitBite (FIT-45, FIT-46, FIT-47)
Halaman  : http://localhost:5173/bodycheckpagi & http://localhost:5173/aktivitas-hidrasi
API      : http://localhost:8000/api/body-check
Teknik   : Equivalence Partitioning (EP) + Boundary Value Analysis (BVA) + API & UI Integration
Jalankan : python -m pytest test_hidrasi.py -v
"""

import os
import sys
import time
import pytest

# Menambahkan folder fitbite-backend ke Python path
BACKEND_DIR = os.path.join(os.path.dirname(__file__), "fitbite-backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from fastapi.testclient import TestClient
from fastapi import FastAPI
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Import endpoint & logika backend FitBite
from app.routers.body_check import hitung_target_cairan_dasar, router as body_check_router

# ==============================================================================
# BAGIAN 1: PENGUJIAN API & LOGIKA KALKULASI BACKEND (FIT-47)
# ==============================================================================

app = FastAPI()
app.include_router(body_check_router)
client = TestClient(app)

@pytest.mark.parametrize("bb_input, expected_ml", [
    (64.0, 2240),   # 35 * 64 = 2240 ml (baseline awal pengguna)
    (70.0, 2450),   # 35 * 70 = 2450 ml
    (80.0, 2800),   # 35 * 80 = 2800 ml
    (55.5, 1943),   # Desimal: 35 * 55.5 = 1942.5 -> dibulatkan 1943 ml
    (45.0, 1575),   # Boundary batas bawah pengguna dewasa
    (120.0, 4200),  # Boundary berat badan tinggi
], ids=["BB-64kg", "BB-70kg", "BB-80kg", "BB-55.5kg-desimal", "BB-45kg", "BB-120kg"])
def test_backend_rumus_kalkulasi_cairan(bb_input, expected_ml):
    """Menguji rumus 35 ml x berat badan menghasilkan output akurat."""
    hasil = hitung_target_cairan_dasar(bb_input)
    assert hasil in (expected_ml, expected_ml - 1)  # toleransi pembulatan float


@pytest.mark.parametrize("bb_invalid", [0, -5, -64.0], ids=["Nol", "Negatif-5", "Negatif-64"])
def test_backend_validasi_tolak_berat_nol_atau_negatif(bb_invalid):
    """Memastikan backend menolak berat badan yang tidak valid (<= 0)."""
    with pytest.raises(ValueError):
        hitung_target_cairan_dasar(bb_invalid)


def test_backend_api_post_body_check_sukses():
    """Menguji API POST /api/body-check mengembalikan water_ml dan formula dinamis."""
    payload = {
        "weight": 70.0,
        "sleepDuration": 8.0,
        "sleepQuality": "Nyenyak",
        "energyLevel": 4,
        "plannedIntensity": "Sedang"
    }
    response = client.post("/api/body-check", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["overview"]["water_ml"] == 2450
    assert res_data["overview"]["water_formula"] == "35 ml × 70.0 kg"


def test_backend_api_helper_target_cairan_get():
    """Menguji endpoint helper GET /api/body-check/target-cairan/{weight}."""
    response = client.get("/api/body-check/target-cairan/80")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["water_ml"] == 2800


# ==============================================================================
# BAGIAN 2: PENGUJIAN OTOMATIS TAMPILAN WEB FRONTEND (SELENIUM E2E)
# ==============================================================================

URL_BODYCHECK = "http://localhost:5173/bodycheckpagi"
URL_HIDRASI = "http://localhost:5173/aktivitas-hidrasi"

@pytest.fixture
def driver():
    """Fixture Selenium Chrome WebDriver untuk pengujian halaman web."""
    options = webdriver.ChromeOptions()
    if os.getenv("HEADLESS") == "1":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")
    try:
        d = webdriver.Chrome(options=options)
    except Exception as e:
        pytest.skip(f"Chrome WebDriver tidak tersedia atau tidak berjalan: {e}")
    yield d
    d.quit()


def test_ui_body_check_dan_sinkronisasi_hidrasi(driver):
    """
    Skenario Integrasi Web:
    1. Buka halaman Body Check Pagi.
    2. Input berat badan baru (misal: 70 kg).
    3. Verifikasi kartu 'Di balik angkanya' berubah menampilkan '35 ml × 70 kg' dan '2.450 ml'.
    4. Klik 'Simpan Body Check'.
    5. Buka halaman Aktivitas & Hidrasi, verifikasi Target Dasar berubah menjadi '2.450 ml'.
    """
    driver.get(URL_BODYCHECK)
    wait = WebDriverWait(driver, 10)

    # 1. Pastikan halaman termuat
    wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(text(), 'Body Check')]")))

    # 2. Cari input berat badan
    input_bb = wait.until(
        EC.presence_of_element_located((By.XPATH, "//label[contains(text(), 'Berat badan')]/following::input[1]"))
    )
    input_bb.click()
    input_bb.send_keys(Keys.CONTROL + "a")
    input_bb.send_keys(Keys.BACKSPACE)
    input_bb.send_keys("70,0")

    time.sleep(0.5)

    # 3. Verifikasi pratinjau kalkulasi Air Dasar di sebelah kanan
    elemen_air = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Air dasar')]/following::*[contains(text(), 'ml')][1]"))
    )
    assert "2.450" in elemen_air.text or "2.450 ml" in driver.page_source

    # 4. Klik Simpan
    tombol_simpan = driver.find_element(By.XPATH, "//button[contains(., 'Simpan Body Check')]")
    tombol_simpan.click()
    time.sleep(1)

    # 5. Navigasi ke halaman Aktivitas & Hidrasi
    driver.get(URL_HIDRASI)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(text(), 'Aktivitas & hidrasi')] | //strong[contains(text(), 'Aktivitas & hidrasi')]")))

    # 6. Verifikasi Target Dasar sudah tersinkronisasi menjadi 2.450 ml
    assert "2.450 ml" in driver.page_source or "35 ml × 70" in driver.page_source
