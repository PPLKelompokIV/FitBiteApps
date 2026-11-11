"""
Pengujian Fungsional - Fitur Pengelolaan Katalog Makanan (Admin) FitBite
Halaman  : http://localhost:5173/admin/pengelolaan
Teknik   : Equivalence Partitioning (EP) + Boundary Value Analysis (BVA)
Jalankan : python -m pytest test_pengelolaan.py -v
"""
import os
import time

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait

URL = "http://localhost:5173/admin/pengelolaan"
TIMEOUT = 10


def tid(test_id):
    """Selektor stabil berbasis atribut data-testid."""
    return (By.CSS_SELECTOR, f"[data-testid='{test_id}']")


# ─── Fixture & fungsi bantu ──────────────────────────────────────────────────

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    if os.getenv("HEADLESS") == "1":  # set HEADLESS=1 untuk berjalan tanpa jendela
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")
    d = webdriver.Chrome(options=options)
    d.get(URL)
    # Tunggu sampai tabel katalog selesai dimuat dari API
    WebDriverWait(d, TIMEOUT).until(
        EC.presence_of_all_elements_located(tid("baris-makanan"))
    )
    yield d
    d.quit()


def wait(driver):
    return WebDriverWait(driver, TIMEOUT)


def nama_di_tabel(driver):
    """Daftar nama makanan yang sedang tampil di tabel."""
    rows = driver.find_elements(*tid("baris-makanan"))
    return [r.find_elements(By.CSS_SELECTOR, "td p")[0].text for r in rows]


def kategori_di_tabel(driver):
    """Daftar kategori makanan yang sedang tampil di tabel."""
    rows = driver.find_elements(*tid("baris-makanan"))
    return [r.find_elements(By.CSS_SELECTOR, "td p")[1].text for r in rows]


def isi_form_makanan(driver, nama, kategori, kkal, protein="", karbo="", lemak=""):
    """Buka form tambah makanan lalu isi seluruh kolom."""
    wait(driver).until(EC.element_to_be_clickable(tid("btn-tambah-makanan"))).click()
    nama_input = wait(driver).until(EC.visibility_of_element_located(tid("input-nama")))
    nama_input.clear()
    nama_input.send_keys(nama)
    Select(driver.find_element(*tid("select-kategori"))).select_by_visible_text(kategori)
    for field, nilai in (("kkal", kkal), ("protein", protein), ("karbo", karbo), ("lemak", lemak)):
        el = driver.find_element(*tid(f"input-{field}"))
        el.clear()
        el.send_keys(nilai)
    driver.find_element(*tid("btn-simpan")).click()


# ─── Kasus uji ───────────────────────────────────────────────────────────────

def test_tc01_halaman_katalog_tampil(driver):
    """TC-01: Halaman katalog makanan berhasil dimuat beserta datanya."""
    judul = driver.find_element(By.TAG_NAME, "h1").text
    assert judul == "Referensi rapi, pengalaman lebih baik."

    nama = nama_di_tabel(driver)
    assert len(nama) >= 7, f"Tabel seharusnya berisi minimal 7 makanan awal, ternyata {len(nama)}"
    assert "Nasi merah matang" in nama


def test_tc02_cari_makanan(driver):
    """TC-02: Pencarian 'Ayam' hanya menampilkan 'Ayam panggang'."""
    cari = driver.find_element(*tid("input-cari"))
    cari.send_keys("Ayam")

    wait(driver).until(lambda d: nama_di_tabel(d) == ["Ayam panggang"])
    assert nama_di_tabel(driver) == ["Ayam panggang"]


def test_tc03_filter_kategori_buah(driver):
    """TC-03: Filter kategori 'Buah' hanya menampilkan makanan kategori Buah."""
    Select(driver.find_element(*tid("filter-kategori"))).select_by_visible_text("Buah")

    wait(driver).until(lambda d: set(kategori_di_tabel(d)) == {"Buah"})
    nama = nama_di_tabel(driver)
    assert set(kategori_di_tabel(driver)) == {"Buah"}
    assert "Pisang" in nama and "Pepaya" in nama
    assert "Nasi merah matang" not in nama


def test_tc04_energi_nol_ditolak(driver):
    """TC-04 (BVA, batas bawah): energi 0 kkal ditolak dan tidak tersimpan."""
    nama_uji = "Uji Energi Nol"
    isi_form_makanan(driver, nama_uji, "Serealia", kkal="0", protein="1", karbo="1", lemak="1")

    toast = wait(driver).until(EC.visibility_of_element_located(tid("toast-notifikasi")))
    assert toast.get_attribute("data-status") == "error"
    assert "Validasi Data Gizi Gagal" in toast.text

    pesan = driver.find_element(*tid("error-kkal")).text
    assert pesan == "Energi wajib diisi angka positif (> 0 kkal)"
    assert nama_uji not in nama_di_tabel(driver)


def test_tc05_tambah_makanan_valid(driver):
    """TC-05 (EP, kelas valid): data gizi positif tersimpan dan notifikasi sukses tampil."""
    nama_uji = f"Alpukat Uji {int(time.time())}"  # nama unik agar tes bisa diulang
    isi_form_makanan(driver, nama_uji, "Buah", kkal="160", protein="2", karbo="8.5", lemak="14.7")

    toast = wait(driver).until(EC.visibility_of_element_located(tid("toast-notifikasi")))
    assert toast.get_attribute("data-status") == "success"
    assert "Berhasil Disimpan!" in toast.text

    wait(driver).until(EC.text_to_be_present_in_element(tid("tabel-makanan"), nama_uji))
    assert nama_uji in nama_di_tabel(driver)


def test_tc06_nama_kosong_ditolak(driver):
    """TC-PBI05-003 (Negative): Submit form master makanan dengan nama makanan dibiarkan kosong."""
    isi_form_makanan(driver, nama="", kategori="Serealia", kkal="150", protein="10", karbo="20", lemak="5")

    pesan = wait(driver).until(EC.visibility_of_element_located(tid("error-nama"))).text
    assert pesan == "Nama makanan wajib diisi"


def test_tc07_duplikasi_nama_ditolak(driver):
    """TC-PBI05-004 (Constraint): Menambahkan makanan master dengan nama yang sudah terdaftar ditolak."""
    isi_form_makanan(driver, nama="Nasi merah matang", kategori="Serealia", kkal="110", protein="2.6", karbo="23", lemak="0.9")

    toast = wait(driver).until(EC.visibility_of_element_located(tid("toast-notifikasi")))
    assert toast.get_attribute("data-status") == "error"
    assert "sudah ada di katalog" in toast.text

    pesan_error = driver.find_element(*tid("error-nama")).text
    assert "sudah ada di katalog" in pesan_error


