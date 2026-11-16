"""
Pengujian E2E - PBI-08 / UC-09: Log Konsumsi Cairan (CRUD Log Konsumsi Cairan)
================================================================================
PIC      : David Febrian Pramusti
Halaman  : http://localhost:5173/aktivitas-hidrasi (widget "Isi ulang energimu")
API      : http://127.0.0.1:8000/api/water-logs
Test Case: TC-PBI08-001 s.d. TC-PBI08-006 (6 test case)
Teknik   : Positive, Boundary Value Analysis (BVA), CRUD Integration, UI + API

Jalankan:
    .venv/Scripts/python.exe -m pytest test_log_konsumsi_cairan.py -v
    .venv/Scripts/python.exe -m pytest test_log_konsumsi_cairan.py -v -k "004 or 005"
"""

import re
import time

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from david_e2e_helper import (
    DEFAULT_WAIT,
    find_by_text,
    hydration_error_text,
    hydration_progress,
    hydration_total,
    make_driver,
    open_page,
    prepare_hydration_baseline,
    reset_water_logs,
    riwayat_texts,
    safe_click,
    seed_water_log,
    set_input_value,
    wait_hydration_total,
    water_logs,
    water_total_api,
    HYDRATION_CUSTOM_INPUT_XPATH,
)

HALAMAN_HIDRASI = "/aktivitas-hidrasi"
SIAP = "//h2[contains(., 'Isi ulang energimu')]"


@pytest.fixture
def driver():
    d = make_driver()
    yield d
    d.quit()


@pytest.fixture(autouse=True)
def bersihkan_catatan_minum():
    """Menjaga database tetap bersih setelah setiap skenario pengujian."""
    yield
    try:
        reset_water_logs()
    except Exception:
        pass


def isi_volume_kustom(driver, volume):
    input_element = WebDriverWait(driver, DEFAULT_WAIT).until(
        EC.visibility_of_element_located((By.XPATH, HYDRATION_CUSTOM_INPUT_XPATH))
    )
    set_input_value(driver, input_element, str(volume))
    safe_click(driver, find_by_text(driver, "Tambah"))


def tunggu_total_api(expected, timeout=15):
    """Menunggu sampai total pada API (sumber kebenaran) sesuai harapan."""
    batas = time.time() + timeout
    while time.time() < batas:
        if water_total_api() == expected:
            return True
        time.sleep(0.3)
    return False


# ---------------------------------------------------------------------------
# TC-PBI08-001 - Positive / Critical
# Pencatatan asupan cairan menggunakan tombol cepat +250 ml
# ---------------------------------------------------------------------------
def test_tc_pbi08_001_quick_add_250_ml(driver):
    prepare_hydration_baseline(500, waktu="07.00 WIB")

    open_page(driver, HALAMAN_HIDRASI, SIAP)
    assert hydration_total(driver) == 500, "Baseline hidrasi harus 500 ml"
    progress_awal = hydration_progress(driver)

    safe_click(driver, find_by_text(driver, "+250 ml"))

    # Expected: total bertambah menjadi 750 ml dan progress bar ikut naik
    wait_hydration_total(driver, 750)
    assert hydration_progress(driver) >= progress_awal
    assert tunggu_total_api(750), "Total pada API harus 750 ml"
    assert any("250 ml" in row for row in riwayat_texts(driver)), (
        "Entri 250 ml harus tercatat pada riwayat minum"
    )


# ---------------------------------------------------------------------------
# TC-PBI08-002 - Positive / High
# Pencatatan asupan cairan menggunakan tombol cepat +500 ml
# ---------------------------------------------------------------------------
def test_tc_pbi08_002_quick_add_500_ml(driver):
    prepare_hydration_baseline(250, waktu="07.00 WIB")

    open_page(driver, HALAMAN_HIDRASI, SIAP)
    total_awal = hydration_total(driver)
    progress_awal = hydration_progress(driver)

    safe_click(driver, find_by_text(driver, "+500 ml"))

    # Expected: total bertambah tepat 500 ml dan persentase hidrasi meningkat
    wait_hydration_total(driver, total_awal + 500)
    assert hydration_progress(driver) > progress_awal
    assert tunggu_total_api(total_awal + 500)


# ---------------------------------------------------------------------------
# TC-PBI08-003 - Positive / High
# Pencatatan asupan cairan dengan input volume kustom 330 ml
# ---------------------------------------------------------------------------
def test_tc_pbi08_003_input_volume_kustom_330_ml(driver):
    prepare_hydration_baseline(0)

    open_page(driver, HALAMAN_HIDRASI, SIAP)
    assert hydration_total(driver) == 0

    isi_volume_kustom(driver, 330)

    wait_hydration_total(driver, 330)
    assert tunggu_total_api(330)

    catatan = water_logs()
    assert len(catatan) == 1
    assert int(catatan[0]["jumlah_ml"]) == 330, "Volume 330 ml harus tersimpan di hydration_log"


# ---------------------------------------------------------------------------
# TC-PBI08-004 - Boundary Value / Critical
# Input volume minus (-250 ml) dan nol (0 ml) harus ditolak
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("volume", ["-250", "0"])
def test_tc_pbi08_004_volume_minus_dan_nol_ditolak(driver, volume):
    prepare_hydration_baseline(500, waktu="07.00 WIB")

    open_page(driver, HALAMAN_HIDRASI, SIAP)
    total_awal = hydration_total(driver)

    isi_volume_kustom(driver, volume)

    # Expected: sistem menolak input dan menampilkan pesan validasi
    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "lebih dari 0" in hydration_error_text(d).lower()
    )
    assert hydration_total(driver) == total_awal, "Total cairan tidak boleh berubah"
    assert len(water_logs()) == 1, "Tidak boleh ada entri baru pada database"


# ---------------------------------------------------------------------------
# TC-PBI08-005 - Boundary Value / Medium
# Volume sekali minum 10.000 ml harus dibatasi batas wajar (maks 2000 ml)
# ---------------------------------------------------------------------------
def test_tc_pbi08_005_volume_di_atas_batas_wajar(driver):
    prepare_hydration_baseline(500, waktu="07.00 WIB")

    open_page(driver, HALAMAN_HIDRASI, SIAP)
    total_awal = hydration_total(driver)

    isi_volume_kustom(driver, 10000)

    # Expected: input dibatasi (maks 2000 ml) atau ditolak dengan pesan batas atas
    WebDriverWait(driver, DEFAULT_WAIT).until(
        lambda d: "2000" in hydration_error_text(d) or hydration_total(d) > total_awal
    )

    total_akhir = hydration_total(driver)
    assert total_akhir <= total_awal + 2000, (
        "Sekali input tidak boleh melebihi 2000 ml untuk mencegah salah ketik"
    )
    if total_akhir > total_awal:
        assert "2000" in hydration_error_text(driver), (
            "Sistem perlu memberi tahu bahwa input dipotong ke batas 2000 ml"
        )


# ---------------------------------------------------------------------------
# TC-PBI08-006 - Positive / High
# Hapus salah satu riwayat minum dan verifikasi total berkurang
# ---------------------------------------------------------------------------
def test_tc_pbi08_006_hapus_riwayat_minum(driver):
    reset_water_logs()
    seed_water_log(500, waktu="10.00 WIB")
    seed_water_log(500, waktu="08.00 WIB")
    seed_water_log(500, waktu="12.00 WIB")

    open_page(driver, HALAMAN_HIDRASI, SIAP)
    wait_hydration_total(driver, 1500)

    tombol_hapus = WebDriverWait(driver, DEFAULT_WAIT).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Hapus catatan 10.00 WIB']"))
    )
    safe_click(driver, tombol_hapus)

    # Expected: entri 500 ml terhapus, total turun dari 1500 ml menjadi 1000 ml
    wait_hydration_total(driver, 1000)
    assert tunggu_total_api(1000)
    assert len(water_logs()) == 2
    assert not any("10.00 WIB" in row for row in riwayat_texts(driver))
