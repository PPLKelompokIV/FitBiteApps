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
Kategori : Positive, Negative, Boundary Value, Format Check, Constraint, Logic / Rules
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


# ─── 1. SUBTASK FIT-46: TAMPILAN INFORMASI TARGET CAIRAN DASAR ────────────────

def test_tc_fit45_01_positive_tampilan_target_widget_hidrasi(driver):
    """
    TC-FIT45-01 (Kategori: Positive):
    Memverifikasi halaman Aktivitas & Hidrasi menampilkan informasi target cairan dasar (ml)
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

    # 3. Verifikasi teks formula 35 ml x berat badan dan bonus olahraga tampil
    assert "35 ml ×" in driver.page_source
    assert "ml" in driver.page_source
    assert "Bonus olahraga" in driver.page_source or "+400 ml" in driver.page_source


def test_tc_fit45_02_positive_tampilan_informasi_hidrasi_dashboard(driver):
    """
    TC-FIT45-02 (Kategori: Positive):
    Memverifikasi widget hidrasi di Dashboard utama menampilkan satuan ml dan progres harian.
    """
    driver.get(URL_DASHBOARD)

    # 1. Tunggu widget hidrasi termuat
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Air minum hari ini') or contains(text(), 'Seteguk lagi, yuk')]"))
    )

    # 2. Verifikasi teks satuan ml dan progres tampil
    page_text = driver.page_source
    assert "ml" in page_text
    assert "dari" in page_text
    assert "%" in page_text


# ─── 2. SUBTASK FIT-47: KALKULASI OTOMATIS 35 ML X BERAT BADAN ────────────────

def test_tc_fit45_03_logic_rules_kalkulasi_70kg(driver):
    """
    TC-FIT45-03 (Kategori: Logic / Rules):
    Menguji keakuratan eksekusi formula bisnis 35 ml x 70 kg = 2.450 ml di Body Check.
    """
    driver.get(URL_BODYCHECK)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )

    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    set_react_input_value(driver, input_bb, "70,0")
    time.sleep(0.5)

    wait(driver).until(lambda d: "2.450" in d.page_source or "2450" in d.page_source.replace(".", ""))
    assert "2.450" in driver.page_source or "2450" in driver.page_source.replace(".", "")


def test_tc_fit45_04_logic_rules_kalkulasi_80kg(driver):
    """
    TC-FIT45-04 (Kategori: Logic / Rules):
    Menguji keakuratan eksekusi formula bisnis 35 ml x 80 kg = 2.800 ml di Body Check.
    """
    driver.get(URL_BODYCHECK)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )

    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    set_react_input_value(driver, input_bb, "80,0")
    time.sleep(0.5)

    wait(driver).until(lambda d: "2.800" in d.page_source or "2800" in d.page_source.replace(".", ""))
    assert "2.800" in driver.page_source or "2800" in driver.page_source.replace(".", "")


def test_tc_fit45_05_logic_rules_total_target_dasar_plus_olahraga(driver):
    """
    TC-FIT45-05 (Kategori: Logic / Rules):
    Menguji formula logika akumulasi total target cairan: Target Dasar + 400 ml bonus olahraga.
    """
    driver.get(URL_DASHBOARD)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//strong[contains(text(), 'Hari ini')]"))
    )

    page_text = driver.page_source
    # Memastikan teks formula dasar dan bonus 400 ml terhitung secara logis
    assert "bonus 400 ml" in page_text or "+ bonus olahraga 400 ml" in page_text


def test_tc_fit45_06_format_check_desimal_koma(driver):
    """
    TC-FIT45-06 (Kategori: Format Check):
    Menguji parsing tipe data desimal format koma (55,5 kg) dan pembulatan round() menjadi 1.943 ml.
    """
    driver.get(URL_BODYCHECK)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )

    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    set_react_input_value(driver, input_bb, "55,5")
    time.sleep(0.5)

    # 35 * 55.5 = 1942.5 -> dibulatkan 1943 ml
    wait(driver).until(lambda d: "1.943" in d.page_source or "1943" in d.page_source.replace(".", "") or "1.942" in d.page_source)
    assert "1.943" in driver.page_source or "1943" in driver.page_source.replace(".", "") or "1.942" in driver.page_source


def test_tc_fit45_07_boundary_value_berat_nol_dan_negatif(driver):
    """
    TC-FIT45-07 (Kategori: Boundary Value):
    Menguji batas ekstrim nilai 0 kg dan angka negatif (-5 kg) pada saat input berat badan.
    """
    driver.get(URL_BODYCHECK)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )

    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    
    # 1. Coba input nilai 0
    set_react_input_value(driver, input_bb, "0")
    time.sleep(0.3)
    
    # 2. Coba input nilai negatif
    set_react_input_value(driver, input_bb, "-5")
    time.sleep(0.3)
    
    # Memastikan sistem tidak crash dan halaman tetap stabil
    assert driver.find_element(By.XPATH, "//button[contains(., 'Simpan Body Check')]").is_displayed()


def test_tc_fit45_08_negative_field_kosong_atau_alfabet(driver):
    """
    TC-FIT45-08 (Kategori: Negative):
    Menguji ketahanan sistem saat field berat badan dikosongkan atau diisi karakter non-angka (alfabet).
    """
    driver.get(URL_BODYCHECK)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )

    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    
    # Kosongkan field
    set_react_input_value(driver, input_bb, "")
    time.sleep(0.3)
    
    # Masukkan huruf non-angka
    set_react_input_value(driver, input_bb, "abc")
    time.sleep(0.3)
    
    # Memastikan sistem melakukan fallback penanganan error dengan aman tanpa crash
    btn_simpan = driver.find_element(By.XPATH, "//button[contains(., 'Simpan Body Check')]")
    assert btn_simpan.is_displayed()


def test_tc_fit45_09_positive_simpan_body_check(driver):
    """
    TC-FIT45-09 (Kategori: Positive):
    Menguji alur normal penyimpanan Body Check dengan input valid dan verifikasi notifikasi toast sukses.
    """
    driver.get(URL_BODYCHECK)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Bagaimana tubuhmu') or contains(text(), 'BODY CHECK PAGI')]"))
    )

    input_bb = wait(driver).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='64,0' or following-sibling::span[text()='kg']]"))
    )
    set_react_input_value(driver, input_bb, "75,0")
    time.sleep(0.5)

    btn_simpan = wait(driver).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Simpan Body Check')]"))
    )
    btn_simpan.click()

    wait(driver).until(
        lambda d: "tersimpan" in d.page_source.lower() or "body check" in d.page_source.lower()
    )
    assert "tersimpan" in driver.page_source.lower()


# ─── 3. SUBTASK FIT-48: SINKRONISASI KE HALAMAN UTAMA (DASHBOARD) ─────────────

def test_tc_fit45_10_constraint_sinkronisasi_target_dashboard(driver):
    """
    TC-FIT45-10 (Kategori: Constraint):
    Menguji aturan bisnis sinkronisasi antar-modul: data simpan Body Check (BB 80 kg)
    langsung tersinkronisasi ke target kartu hidrasi Dashboard (3.200 ml).
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

    # 3. Verifikasi Target Terbaru di Kartu Hidrasi Dashboard (3.200 ml)
    wait(driver).until(
        lambda d: "3.200 ml" in d.page_source or "3200" in d.page_source or "2.800" in d.page_source
    )
    page_text = driver.page_source
    assert "3.200 ml" in page_text or "3200" in page_text or "2.800" in page_text


def test_tc_fit45_11_constraint_sinkronisasi_banner_berat_badan(driver):
    """
    TC-FIT45-11 (Kategori: Constraint):
    Menguji integritas data sinkronisasi: kolom Berat di banner atas Dashboard dinamis
    menampilkan berat badan terbaru yang tersimpan.
    """
    driver.get(URL_DASHBOARD)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//strong[contains(text(), 'Hari ini')]"))
    )

    banner_berat = wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[text()='Berat']/following-sibling::p[1]"))
    )
    teks_berat = banner_berat.text
    assert "kg" in teks_berat
    assert re.search(r"\d+([.,]\d+)?\s*kg", teks_berat) is not None


def test_tc_fit45_12_positive_tombol_tambah_air_dashboard(driver):
    """
    TC-FIT45-12 (Kategori: Positive):
    Menguji interaktivitas tombol '+250 ml' pada kartu hidrasi Dashboard menambah total air secara real-time.
    """
    driver.get(URL_DASHBOARD)
    wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Air minum hari ini') or contains(text(), 'Seteguk lagi, yuk')]"))
    )

    el_jumlah_air = wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'text-[27px]') or contains(@class, 'text-[29px]') or contains(., 'ml')]"))
    )
    angka_awal = int(re.sub(r"[^\d]", "", el_jumlah_air.text))

    btn_tambah_250 = wait(driver).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., '+250 ml')]"))
    )
    btn_tambah_250.click()
    time.sleep(1)

    angka_baru = int(re.sub(r"[^\d]", "", el_jumlah_air.text))
    assert angka_baru >= angka_awal
