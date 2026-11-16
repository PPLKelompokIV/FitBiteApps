"""
Pengujian E2E - PBI-20 / UC-23: Barcode Scanner Produk Kemasan
================================================================================
PIC      : David Febrian Pramusti
Halaman  : http://localhost:5173/jurnal-makanan (tab "Barcode")
API      : http://127.0.0.1:8000/api/food-logs
Test Case: TC-PBI20-001 s.d. TC-PBI20-005 (5 test case)
Teknik   : Positive, Negative/Fallback, Hardware Exception, Boundary (timeout)

Catatan:
Karena browser otomasi tidak memiliki kamera fisik, skenario "hasil scan" disimulasikan
lewat kolom input kode barcode manual pada tab Barcode (jalur yang sama dengan
hasil pembacaan kamera).

Jalankan:
    python -m pytest test_barcode_scanner.py -v
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from david_e2e_helper import (
    DEFAULT_WAIT,
    find_by_text,
    food_logs,
    make_driver,
    open_page,
    safe_click,
    set_input_value,
    today_str,
)

HALAMAN_JURNAL = "/jurnal-makanan"
SIAP = "//h1[contains(., 'Makan dengan sadar')]"
INPUT_KODE = "input[aria-label='Tidak bisa memindai? Masukkan kode']"

BARCODE_TERDAFTAR = "8992753211012"
BARCODE_TIDAK_TERDAFTAR = "1234567890123"


@pytest.fixture
def driver():
    d = make_driver()
    yield d
    d.quit()


def buka_tab_barcode(driver):
    open_page(driver, HALAMAN_JURNAL, SIAP)
    safe_click(driver, find_by_text(driver, "Barcode"))
    WebDriverWait(driver, DEFAULT_WAIT).until(
        EC.presence_of_element_located((By.XPATH, "//span[contains(., 'Pindai Barcode Kemasan')]"))
    )


def cari_kode(driver, kode):
    input_element = WebDriverWait(driver, DEFAULT_WAIT).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, INPUT_KODE))
    )
    set_input_value(driver, input_element, kode)
    safe_click(driver, find_by_text(driver, "Cari kode"))


def teks_halaman(driver):
    return driver.find_element(By.TAG_NAME, "body").text.lower()


# ---------------------------------------------------------------------------
# TC-PBI20-001 - Positive / Critical
# Barcode terdaftar -> tampil nama produk, nilai gizi, dan konfirmasi slot makan
# ---------------------------------------------------------------------------
def test_tc_pbi20_001_barcode_terdaftar(driver):
    buka_tab_barcode(driver)

    cari_kode(driver, BARCODE_TERDAFTAR)

    # Expected: produk ditemukan beserta informasi nilai gizi
    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "kkal" in teks_halaman(d) and "biskuit" in teks_halaman(d)
    )

    halaman = teks_halaman(driver)
    assert "8992753211012" in halaman, "Kode barcode produk harus ditampilkan"
    assert any(
        kata in halaman for kata in ("konfirmasi", "catat ke jurnal", "pilih slot")
    ), "Sistem harus meminta konfirmasi slot makan"


# ---------------------------------------------------------------------------
# TC-PBI20-002 - Negative / Fallback / High
# Barcode tidak terdaftar -> notifikasi + tombol pintas Quick Add
# ---------------------------------------------------------------------------
def test_tc_pbi20_002_barcode_tidak_terdaftar(driver):
    buka_tab_barcode(driver)

    cari_kode(driver, BARCODE_TIDAK_TERDAFTAR)

    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "tidak ditemukan di database" in teks_halaman(d)
    )
    halaman = teks_halaman(driver)
    assert "produk tidak ditemukan" in halaman, "Harus ada notifikasi produk tidak ditemukan"
    assert any(
        kata in halaman for kata in ("quick add", "input manual")
    ), "Harus ditawarkan jalan pintas Quick Add / input manual"


# ---------------------------------------------------------------------------
# TC-PBI20-003 - Hardware / Exception / High
# Kamera tidak tersedia -> pesan informatif + input manual tetap tersedia
# ---------------------------------------------------------------------------
def test_tc_pbi20_003_kamera_tidak_tersedia(driver):
    buka_tab_barcode(driver)

    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "kamera tidak dapat diakses" in teks_halaman(d)
        or "kamera tidak tersedia" in teks_halaman(d)
    )

    # Alternatif: kolom input manual nomor barcode harus tetap bisa dipakai
    input_manual = driver.find_element(By.CSS_SELECTOR, INPUT_KODE)
    assert input_manual.is_displayed(), "Kolom input manual barcode harus tersedia"


# ---------------------------------------------------------------------------
# TC-PBI20-004 - Boundary Value / Medium
# Barcode buram / minim cahaya -> petunjuk posisi & pencahayaan
# ---------------------------------------------------------------------------
def test_tc_pbi20_004_petunjuk_barcode_buram(driver):
    buka_tab_barcode(driver)

    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "tegak lurus" in teks_halaman(d) and "cahaya" in teks_halaman(d)
    )
    halaman = teks_halaman(driver)
    assert "kotak pemindai" in halaman, "Petunjuk harus menyebut area kotak pemindai"


# ---------------------------------------------------------------------------
# TC-PBI20-005 - Positive / Critical
# Konfirmasi & simpan produk hasil scan ke slot waktu makan
# ---------------------------------------------------------------------------
def test_tc_pbi20_005_konfirmasi_dan_simpan_ke_jurnal(driver):
    buka_tab_barcode(driver)
    jumlah_awal = len(food_logs(today_str()))

    cari_kode(driver, "8998866200123")  # Susu UHT Cokelat 250 ml - 160 kkal

    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "susu uht" in teks_halaman(d)
    )

    slot_camilan = WebDriverWait(driver, DEFAULT_WAIT).until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "button[aria-label='Pilih slot barcode Camilan']")
        )
    )
    safe_click(driver, slot_camilan)
    safe_click(driver, find_by_text(driver, "Konfirmasi & Catat ke Jurnal"))

    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: len(food_logs(today_str())) == jumlah_awal + 1
    )

    log_baru = food_logs(today_str())[-1]
    assert "susu" in str(log_baru).lower(), f"Log baru tidak sesuai: {log_baru}"
    assert log_baru["slot_makan"] == "Camilan", log_baru
