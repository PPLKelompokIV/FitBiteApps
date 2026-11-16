"""
Pengujian E2E - PBI-07 / UC-21: Search & Filter Katalog Makanan
================================================================================
PIC      : David Febrian Pramusti
Halaman  : http://localhost:5173/jurnal-makanan (tab "Katalog")
Test Case: TC-PBI07-001 s.d. TC-PBI07-005 (5 test case)
Teknik   : Positive, Performance (debounce), Negative/Zero Result, Security (XSS)

Jalankan:
    python -m pytest test_katalog_makanan.py -v
"""

import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from david_e2e_helper import (
    DEFAULT_WAIT,
    enable_request_logging,
    katalog_empty_state,
    katalog_items,
    ketik_katalog,
    make_driver,
    open_page,
    recorded_requests,
    safe_click,
)

HALAMAN_JURNAL = "/jurnal-makanan"
SIAP = "//h1[contains(., 'Makan dengan sadar')]"


@pytest.fixture
def driver():
    d = make_driver()
    yield d
    d.quit()


# ---------------------------------------------------------------------------
# TC-PBI07-001 - Positive / Critical
# Pencarian makanan berdasarkan kata kunci spesifik "Ayam"
# ---------------------------------------------------------------------------
def test_tc_pbi07_001_pencarian_kata_kunci_ayam(driver):
    open_page(driver, HALAMAN_JURNAL, SIAP)

    ketik_katalog(driver, "Ayam")

    WebDriverWait(driver, DEFAULT_WAIT).until(lambda d: len(katalog_items(d)) > 0)
    hasil = katalog_items(driver)

    assert hasil, "Kata kunci 'Ayam' harus menampilkan minimal satu makanan"
    assert all("ayam" in nama.lower() for nama in hasil), (
        f"Seluruh hasil pencarian harus mengandung kata 'Ayam', hasil: {hasil}"
    )


# ---------------------------------------------------------------------------
# TC-PBI07-002 - Positive / High
# Penyaringan katalog berdasarkan kategori "Buah"
# ---------------------------------------------------------------------------
def test_tc_pbi07_002_filter_kategori_buah(driver):
    open_page(driver, HALAMAN_JURNAL, SIAP)

    tombol_buah = WebDriverWait(driver, DEFAULT_WAIT).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space()='Buah']")
        )
    )
    safe_click(driver, tombol_buah)

    WebDriverWait(driver, DEFAULT_WAIT).until(lambda d: len(katalog_items(d)) > 0)
    hasil = katalog_items(driver)
    nama_buah = ["pisang", "apel", "jeruk"]

    assert hasil, "Filter kategori 'Buah' tidak boleh kosong"
    assert all(any(buah in nama.lower() for buah in nama_buah) for nama in hasil), (
        f"Hanya item kategori Buah yang boleh tampil, hasil: {hasil}"
    )


# ---------------------------------------------------------------------------
# TC-PBI07-003 - Performance / Medium
# Debounce 300 ms: pengetikan cepat tidak boleh memicu spam request
# ---------------------------------------------------------------------------
def test_tc_pbi07_003_debounce_pencarian(driver):
    enable_request_logging(driver)
    open_page(driver, HALAMAN_JURNAL, SIAP)

    # Mengetik "sate" secepat mungkin (4 huruf < 300 ms)
    ketik_katalog(driver, "sate")

    # Beri kesempatan request (jika ada) terkirim
    time.sleep(1.2)

    request_pencarian = [
        url
        for url in recorded_requests(driver)
        if any(kata in url.lower() for kata in ("catalog", "search", "foods"))
    ]

    assert len(request_pencarian) <= 1, (
        "Pencarian tidak boleh mengirim lebih dari 1 request per jeda pengetikan, "
        f"terekam: {request_pencarian}"
    )

    # Hasil filter tetap benar walau pengetikan cepat
    assert "Makanan tidak ditemukan" in katalog_empty_state(driver)


# ---------------------------------------------------------------------------
# TC-PBI07-004 - Negative / Zero Result / Medium
# Pencarian kata kunci yang tidak terdaftar
# ---------------------------------------------------------------------------
def test_tc_pbi07_004_kata_kunci_tidak_ditemukan(driver):
    open_page(driver, HALAMAN_JURNAL, SIAP)

    ketik_katalog(driver, "MakananAsingXYZ123")

    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "Makanan tidak ditemukan" in katalog_empty_state(d)
    )

    assert katalog_items(driver) == [], "Tidak boleh ada item yang tampil"

    # Recovery: pengguna diarahkan memakai Quick Add / input manual
    quick_add = driver.find_elements(
        By.XPATH, "//button[contains(normalize-space(), 'Catat manual ke')]"
    )
    assert quick_add, "Harus tersedia tombol cepat 'Catat manual / Quick Add'"


# ---------------------------------------------------------------------------
# TC-PBI07-005 - Security / Format / High
# Input pencarian berisi tag HTML / wildcard tidak boleh memicu XSS
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("payload", ["<script>alert(1)</script>", "100%_"])
def test_tc_pbi07_005_sanitasi_input_pencarian(driver, payload):
    open_page(driver, HALAMAN_JURNAL, SIAP)

    ketik_katalog(driver, payload)

    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "Makanan tidak ditemukan" in katalog_empty_state(d)
    )

    # Tidak ada dialog alert() yang dieksekusi
    with pytest.raises(Exception):
        driver.switch_to.alert

    # Tidak ada elemen <script> baru hasil injeksi
    injeksi = driver.find_elements(By.XPATH, "//script[contains(., 'alert(1)')]")
    assert injeksi == [], "Input pencarian tidak boleh dieksekusi sebagai HTML/JS"

    # Halaman tetap sehat dan input tetap tersimpan sebagai teks biasa
    assert driver.find_element(By.XPATH, SIAP).is_displayed()
    assert driver.find_element(By.CSS_SELECTOR, "input[aria-label='Cari di katalog']").get_attribute("value") == payload
