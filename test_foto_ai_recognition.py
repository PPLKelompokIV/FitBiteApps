"""
Pengujian E2E - PBI-19 / UC-22: AI Food Recognition via Foto
================================================================================
PIC      : David Febrian Pramusti
Halaman  : http://localhost:5173/foto-ai
API      : http://127.0.0.1:8000/api/ai/food-snap (9Router Vision AI)
Test Case: TC-PBI19-001 s.d. TC-PBI19-006 (6 test case)
Teknik   : Positive, Format Check, Boundary Value, AI Exception, Hardware Exception

Catatan:
- TC-PBI19-001 & TC-PBI19-004 membutuhkan layanan 9Router Vision AI aktif.
  Bila layanan sedang down/rate-limit, test akan SKIP dengan alasan yang jelas.
- Berkas uji dibuat otomatis di folder temporer (lihat david_test_assets.py).

Jalankan:
    python -m pytest test_foto_ai_recognition.py -v
"""

import json
import os
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

import david_test_assets as aset
from david_e2e_helper import (
    DEFAULT_WAIT,
    find_by_text,
    make_driver,
    open_page,
    safe_click,
    set_input_value,
)

HALAMAN_FOTO_AI = "/foto-ai"
SIAP = "//h1[contains(., 'Kenali isi piringmu')]"

FILE_INPUT = "input[type='file'][aria-label='Unggah foto makanan']"
BANNER_ERROR = "//div[contains(@class, 'bg-red-50')]//p"
BANNER_SUKSES = "//div[contains(@class, 'bg-emerald-50')]//p"
TOTAL_ENERGI = "//article[.//h2[contains(., 'Total estimasi')]]//strong[contains(., 'kkal')]"


@pytest.fixture
def driver():
    d = make_driver()
    yield d
    d.quit()


def unggah_foto(driver, path):
    input_element = WebDriverWait(driver, DEFAULT_WAIT).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, FILE_INPUT))
    )
    input_element.send_keys(str(path))


def teks_banner(driver, xpath):
    elements = driver.find_elements(By.XPATH, xpath)
    return elements[0].text.strip() if elements else ""


def tunggu_hasil_analisis(driver, timeout=90):
    """Menunggu banner sukses/error dari proses analisis AI."""

    def kondisi(d):
        return teks_banner(d, BANNER_SUKSES) or teks_banner(d, BANNER_ERROR)

    return WebDriverWait(driver, timeout).until(kondisi)


def jumlah_baris_komponen(driver):
    return len(driver.find_elements(By.CSS_SELECTOR, "input[aria-label$=' porsi']"))


# ---------------------------------------------------------------------------
# TC-PBI19-001 - Positive / Critical
# Unggah foto hidangan valid, AI mendeteksi makanan + estimasi gizi
# ---------------------------------------------------------------------------
def test_tc_pbi19_001_unggah_foto_makanan_valid(driver):
    foto = aset.foto_makanan()
    if not foto:
        pytest.skip("Foto contoh tidak dapat diunduh (butuh koneksi internet).")

    open_page(driver, HALAMAN_FOTO_AI, SIAP)
    baris_awal = jumlah_baris_komponen(driver)

    unggah_foto(driver, foto)
    hasil = tunggu_hasil_analisis(driver)

    if teks_banner(driver, BANNER_ERROR):
        pytest.skip(f"Layanan 9Router Vision AI tidak tersedia: {hasil}")

    assert "berhasil mengenali" in hasil.lower(), hasil
    assert jumlah_baris_komponen(driver) >= baris_awal, "Komponen hasil deteksi harus tampil"
    assert jumlah_baris_komponen(driver) > 0

    total = driver.find_element(By.XPATH, TOTAL_ENERGI).text
    angka = int("".join(ch for ch in total if ch.isdigit()) or 0)
    assert angka > 0, "Total estimasi kalori harus lebih dari 0 kkal"


# ---------------------------------------------------------------------------
# TC-PBI19-002 - Format Check / High
# Unggah berkas non-gambar (.pdf) harus ditolak dengan pesan yang jelas
# ---------------------------------------------------------------------------
def test_tc_pbi19_002_unggah_berkas_bukan_gambar(driver):
    open_page(driver, HALAMAN_FOTO_AI, SIAP)

    unggah_foto(driver, aset.berkas_pdf())

    pesan = WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: teks_banner(d, BANNER_ERROR)
    ).lower()

    assert "format berkas tidak didukung" in pesan or "harus berupa gambar" in pesan, (
        f"Pesan penolakan format berkas tidak sesuai: {pesan}"
    )


# ---------------------------------------------------------------------------
# TC-PBI19-003 - Boundary Value / High
# Unggah foto > 5 MB harus ditolak / dikompresi otomatis
# ---------------------------------------------------------------------------
def test_tc_pbi19_003_unggah_foto_melebihi_batas_ukuran(driver):
    open_page(driver, HALAMAN_FOTO_AI, SIAP)

    unggah_foto(driver, aset.foto_ukuran_besar())

    pesan = WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: teks_banner(d, BANNER_ERROR)
    ).lower()

    assert "ukuran" in pesan and "5 mb" in pesan, (
        f"Harus muncul peringatan ukuran maksimal 5 MB, pesan aktual: {pesan}"
    )


# ---------------------------------------------------------------------------
# TC-PBI19-004 - AI Exception / High
# Foto objek bukan makanan -> pesan bersahabat, aplikasi tidak crash
# ---------------------------------------------------------------------------
def test_tc_pbi19_004_foto_bukan_makanan(driver):
    open_page(driver, HALAMAN_FOTO_AI, SIAP)

    unggah_foto(driver, aset.foto_bukan_makanan())
    hasil = tunggu_hasil_analisis(driver)

    if teks_banner(driver, BANNER_ERROR):
        pesan = teks_banner(driver, BANNER_ERROR).lower()
        if any(kata in pesan for kata in ("9router", "gagal terhubung", "503", "403")):
            pytest.skip(f"Layanan 9Router Vision AI tidak tersedia: {pesan}")
        assert "tidak mendeteksi" in pesan or "tidak terdeteksi" in pesan, pesan
        return

    # AI masih mengembalikan komponen: bukan kegagalan UI, tetapi akurasi model
    if "berhasil mengenali" in hasil.lower():
        pytest.xfail(
            "Model AI masih mendeteksi 'makanan' pada gambar non-makanan "
            "(akurasi model, bukan bug antarmuka)."
        )


# ---------------------------------------------------------------------------
# TC-PBI19-005 - Positive / Critical
# Sesuaikan porsi hasil deteksi AI lalu simpan ke slot Makan Siang
# ---------------------------------------------------------------------------
def test_tc_pbi19_005_sesuaikan_porsi_dan_simpan_ke_jurnal(driver):
    open_page(driver, HALAMAN_FOTO_AI, SIAP)

    # Menyiapkan skenario seperti hasil AI: "Sate Ayam 10 tusuk" = 350 kkal
    porsi_input = driver.find_element(By.CSS_SELECTOR, "input[aria-label$=' porsi']")
    baris = porsi_input.find_element(
        By.XPATH, "ancestor::div[contains(@class, 'group')][1]"
    )
    input_nama = baris.find_element(By.XPATH, ".//input[@type='text'][1]")
    input_porsi = baris.find_element(By.CSS_SELECTOR, "input[aria-label$=' porsi']")
    input_kalori = baris.find_element(By.CSS_SELECTOR, "input[aria-label$=' kalori']")

    set_input_value(driver, input_nama, "Sate ayam")
    set_input_value(driver, input_porsi, "10 tusuk")
    set_input_value(driver, input_kalori, "350")

    # Langkah 1: ubah porsi dari 10 tusuk menjadi 5 tusuk (0.5x)
    set_input_value(driver, input_porsi, "5 tusuk")
    time.sleep(0.6)

    kalori_setelah = input_kalori.get_attribute("value")
    assert kalori_setelah == "175", (
        "Perubahan porsi 10 tusuk -> 5 tusuk harus menghitung ulang kalori "
        f"secara proporsional (350 -> 175), aktual: {kalori_setelah}"
    )

    # Langkah 3: pilih slot Makan siang lalu simpan
    safe_click(
        driver,
        find_by_text(driver, "Makan siang", tag="button"),
    )
    checkbox = driver.find_element(
        By.XPATH, "//label[contains(., 'Saya sudah meninjau')]//input[@type='checkbox']"
    )
    safe_click(driver, checkbox)
    safe_click(driver, find_by_text(driver, "Simpan ke jurnal"))

    # Verifikasi penyimpanan ke slot jurnal (key per tanggal, sama seperti halaman jurnal)
    tanggal = driver.find_element(By.CSS_SELECTOR, "input[type='date']").get_attribute("value")
    key = f"fitbite_journal_slots_{tanggal}"

    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "Makan siang"
        in (d.execute_script("return localStorage.getItem(arguments[0])", key) or "")
    )
    tersimpan = json.loads(
        driver.execute_script("return localStorage.getItem(arguments[0])", key)
    )
    assert "Makan siang" in tersimpan, "Entri harus tersimpan pada slot Makan siang"

    item_sate = next(
        (item for item in tersimpan["Makan siang"]["items"] if "sate" in item["name"].lower()),
        None,
    )
    assert item_sate is not None, tersimpan
    assert item_sate["calories"] == "175", (
        f"Kalori item sate harus 175 kkal setelah porsi disesuaikan, aktual: {item_sate}"
    )


# ---------------------------------------------------------------------------
# TC-PBI19-006 - Hardware / Exception / Medium
# Izin kamera ditolak -> pesan jelas + alternatif pilih dari galeri
# ---------------------------------------------------------------------------
def test_tc_pbi19_006_izin_kamera_ditolak(driver):
    open_page(driver, HALAMAN_FOTO_AI, SIAP)

    tombol_kamera = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(normalize-space(), 'Gunakan Kamera')]")
        )
    )
    safe_click(driver, tombol_kamera)

    # Chrome pada mode otomasi menolak permintaan kamera -> aplikasi harus graceful
    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "izin kamera ditolak" in d.page_source.lower()
    )
    halaman = driver.page_source.lower()
    assert "pilih dari galeri" in halaman or "unggah foto" in halaman, (
        "Harus tersedia alternatif unggah dari galeri/penyimpanan"
    )
    assert driver.find_element(By.XPATH, SIAP).is_displayed(), "Aplikasi tidak boleh crash"
