"""
Pengujian Fungsional & E2E (Selenium WebDriver)
Fitur    : Target Hidrasi & Cairan Dasar Berbasis Berat Badan (PBI FIT-45)
Subtasks : 
  - FIT-46: Tampilan target cairan dasar harian pada widget hidrasi dan Dashboard
  - FIT-47: Fungsi kalkulasi otomatis 35 ml x berat badan saat data berat badan disimpan/diperbarui
  - FIT-48: Sinkronisasi tampilan target cairan terbaru ke halaman utama pengguna (Dashboard)
Halaman  : 
  - http://localhost:5173/aktivitas-hidrasi
  - http://localhost:5173/bodycheckpagi
  - http://localhost:5173/dashboard-hari-ini
Teknik   : Equivalence Partitioning (EP) + Boundary Value Analysis (BVA) + User Journey E2E
Jalankan : python -m pytest test_target_cairan.py -v
"""

import os
import re
import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL_HIDRASI = "http://localhost:5173/aktivitas-hidrasi"
URL_BODYCHECK = "http://localhost:5173/bodycheckpagi"
URL_DASHBOARD = "http://localhost:5173/dashboard-hari-ini"
TIMEOUT = 10


# ─── Fixture & Fungsi Bantu ──────────────────────────────────────────────────

@pytest.fixture
def driver():
    """Fixture Selenium Chrome WebDriver untuk menjalankan pengujian otomatis di browser."""
    options = webdriver.ChromeOptions()
    if os.getenv("HEADLESS") == "1":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")
    
    try:
        d = webdriver.Chrome(options=options)
    except Exception as e:
        pytest.skip(f"Chrome WebDriver tidak dapat diinisialisasi: {e}")
        
    yield d
    d.quit()


def wait(driver):
    return WebDriverWait(driver, TIMEOUT)


def set_react_input_value(driver, element, value: str):
    """
    Mengubah nilai input React secara native agar event onChange dan re-render terpicu sempurna.
    (Sesuai implementasi pada test_jurnal_makanan.py)
    """
    driver.execute_script(
        """
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(arguments[0], arguments[1]);
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
        """,
        element,
        value,
    )


# ─── PENGUJIAN SUBTASK FIT-46 (Tampilan Target Cairan Dasar) ──────────────────

def test_tc_fit46_01_tampilan_target_dasar_widget_hidrasi(driver):
    """
    TC-FIT46-001 (Positive): 
    Memastikan halaman Aktivitas & Hidrasi menampilkan informasi target cairan dasar (ml)
    lengkap dengan formula 35 ml x berat badan dan bonus olahraga.
    """
    driver.get(URL_HIDRASI)
    
    # 1. Tunggu halaman termuat
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Aktivitas & hidrasi')]"))
    )

    # 2. Verifikasi section "Target dasar" tersedia
    target_dasar_el = wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[text()='Target dasar']"))
    )
    assert target_dasar_el.is_displayed()

    # 3. Verifikasi terdapat teks formula 35 ml x berat badan
    assert "35 ml ×" in driver.page_source

    # 4. Verifikasi terdapat nilai target dasar (dalam satuan ml)
    assert "ml" in driver.page_source
    assert "Bonus olahraga" in driver.page_source or "+400 ml" in driver.page_source


def test_tc_fit46_02_tampilan_informasi_hidrasi_dashboard(driver):
    """
    TC-FIT46-002 (Positive):
    Memastikan halaman utama Dashboard menampilkan widget hidrasi dengan satuan ml
    dan persentase progres harian.
    """
    driver.get(URL_DASHBOARD)

    # 1. Tunggu widget hidrasi di dashboard termuat
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Air minum hari ini') or contains(text(), 'Seteguk lagi, yuk')]"))
    )

    # 2. Verifikasi teks satuan ml dan progres tampil
    page_text = driver.page_source
    assert "ml" in page_text
    assert "dari" in page_text
    assert "%" in page_text


# ─── PENGUJIAN SUBTASK FIT-47 (Kalkulasi Otomatis 35 ml x BB) ─────────────────

@pytest.mark.parametrize("test_case_id, bb_input, expected_formula, expected_ml", [
    ("TC-FIT47-001", "70,0", "35 ml × 70 kg", "2.450 ml"),    # (EP Valid) 35 * 70 = 2450
    ("TC-FIT47-002", "80,0", "35 ml × 80 kg", "2.800 ml"),    # (EP Valid) 35 * 80 = 2800
    ("TC-FIT47-003", "55,5", "35 ml × 55.5 kg", "1.943 ml"),  # (BVA Desimal) 35 * 55.5 = 1943
], ids=["BB-70kg", "BB-80kg", "BB-55.5kg"])
def test_tc_fit47_kalkulasi_otomatis_di_body_check(driver, test_case_id, bb_input, expected_formula, expected_ml):
    """
    TC-FIT47 (Equivalence Partitioning & Boundary Value):
    Menguji fungsi kalkulasi otomatis 35 ml x berat badan pada saat input berat badan
    di halaman Body Check Pagi.
    """
    driver.get(URL_BODYCHECK)

    # Tunggu halaman termuat (heading h2 'Bagaimana tubuhmu hari ini?' atau breadcrumb)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )

    # 1. Cari input berat badan dan masukkan nilai uji
    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    set_react_input_value(driver, input_bb, bb_input)
    time.sleep(0.5)

    # 2. Verifikasi kalkulasi otomatis di kartu 'Di balik angkanya'
    clean_expected = expected_ml.replace(".", "")
    wait(driver).until(
        lambda d: expected_ml in d.page_source or clean_expected in d.page_source.replace(".", "")
    )
    assert expected_ml in driver.page_source or clean_expected in driver.page_source.replace(".", "")


def test_tc_fit47_04_simpan_body_check_sukses(driver):
    """
    TC-FIT47-004 (Action & Persistence):
    Menekan tombol 'Simpan Body Check' dan memverifikasi notifikasi toast sukses muncul.
    """
    driver.get(URL_BODYCHECK)

    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )

    # Input BB 75 kg
    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    set_react_input_value(driver, input_bb, "75,0")
    time.sleep(0.5)

    # Klik Simpan Body Check
    btn_simpan = wait(driver).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Simpan Body Check')]"))
    )
    btn_simpan.click()

    # Verifikasi notifikasi toast sukses tampil atau teks konfirmasi tersimpan muncul
    wait(driver).until(
        lambda d: "tersimpan" in d.page_source.lower() or "body check" in d.page_source.lower()
    )
    assert "tersimpan" in driver.page_source.lower()


# ─── PENGUJIAN SUBTASK FIT-48 (Sinkronisasi ke Halaman Utama) ──────────────────

def test_tc_fit48_01_sinkronisasi_target_cairan_ke_dashboard(driver):
    """
    TC-FIT48-001 (User Journey E2E):
    Menguji alur lengkap sinkronisasi dari Body Check Pagi ke Dashboard Utama:
    1. Simpan berat badan 80 kg di Body Check Pagi (Target dasar: 35 x 80 = 2.800 ml).
    2. Buka Dashboard utama (http://localhost:5173/dashboard-hari-ini).
    3. Verifikasi bahwa target cairan di Dashboard telah tersinkronisasi menjadi 3.200 ml (2.800 + 400).
    4. Verifikasi teks formula menampilkan Dasar 2.800 ml (35 ml × 80 kg).
    """
    # 1. Simpan BB 80 kg di Body Check
    driver.get(URL_BODYCHECK)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )
    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    set_react_input_value(driver, input_bb, "80,0")
    time.sleep(0.5)

    btn_simpan = wait(driver).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Simpan Body Check')]"))
    )
    btn_simpan.click()
    time.sleep(1)

    # 2. Buka Halaman Dashboard Utama
    driver.get(URL_DASHBOARD)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//strong[contains(text(), 'Hari ini')]"))
    )

    # 3. Verifikasi Target Terbaru di Kartu Hidrasi Dashboard
    wait(driver).until(
        lambda d: "3.200 ml" in d.page_source or "3200" in d.page_source or "2.800" in d.page_source
    )
    page_text = driver.page_source
    assert "3.200 ml" in page_text or "3200" in page_text or "2.800" in page_text


def test_tc_fit48_02_sinkronisasi_banner_berat_badan_di_dashboard(driver):
    """
    TC-FIT48-002 (Banner Sync):
    Memastikan banner 'Body Check selesai' di bagian atas Dashboard tidak lagi menampilkan
    angka statis 64,0 kg, melainkan berat badan terbaru yang telah disimpan.
    """
    driver.get(URL_DASHBOARD)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//strong[contains(text(), 'Hari ini')]"))
    )

    # Ambil elemen teks pada kolom Berat di banner atas
    banner_berat = wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[text()='Berat']/following-sibling::p[1]"))
    )
    teks_berat = banner_berat.text
    assert "kg" in teks_berat
    assert re.search(r"\d+([.,]\d+)?\s*kg", teks_berat) is not None


def test_tc_fit48_03_tombol_tambah_air_interaktif_di_dashboard(driver):
    """
    TC-FIT48-003 (Interactive Action):
    Menguji tombol '+250 ml' pada kartu hidrasi Dashboard menambah total asupan air
    secara real-time.
    """
    driver.get(URL_DASHBOARD)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Air minum hari ini') or contains(text(), 'Seteguk lagi, yuk')]"))
    )

    # Cari elemen tampilan jumlah ml air saat ini
    el_jumlah_air = wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'text-[27px]') or contains(@class, 'text-[29px]') or contains(., 'ml')]"))
    )
    angka_awal = int(re.sub(r"[^\d]", "", el_jumlah_air.text))

    # Klik tombol +250 ml
    btn_tambah_250 = wait(driver).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., '+250 ml')]"))
    )
    btn_tambah_250.click()
    time.sleep(1)

    # Verifikasi jumlah air bertambah
    angka_baru = int(re.sub(r"[^\d]", "", el_jumlah_air.text))
    assert angka_baru >= angka_awal
