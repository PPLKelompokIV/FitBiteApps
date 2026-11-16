"""
Pengujian Selenium PBI-04: CRUD Log Aktivitas Fisik.
Kasus: TC-PBI04-001 sampai TC-PBI04-006 pada Test_Case_FitBiteApps.xlsx.
Jalankan frontend dan backend lokal, lalu:
    python -m pytest test_log_aktivitas_fisik.py -v

Tes memakai id_user=1 karena halaman aktivitas menggunakan akun tersebut.
Log aktivitas baru yang dibuat selama tes akan dihapus saat fixture selesai.
"""

import json
import os
import time
import urllib.error
import urllib.request
from datetime import date, datetime

import pytest
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


FRONTEND_BASE_URL = "http://localhost:5173"
ACTIVITY_URL = f"{FRONTEND_BASE_URL}/aktivitas-hidrasi"
API_BASE_URL = "http://localhost:8000"
USER_ID = 1
TIMEOUT = 15


def _http_json(path, method="GET", payload=None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        f"{API_BASE_URL}{path}",
        data=body,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read().decode("utf-8"))


def _today_logs():
    response_status, body = _http_json(
        f"/api/activity-logs/{USER_ID}?tanggal={date.today().isoformat()}"
    )
    if response_status != 200:
        raise RuntimeError(f"Gagal membaca log aktivitas untuk cleanup: {body}")
    return body


def _http_status(url):
    try:
        with urllib.request.urlopen(url, timeout=1) as response:
            return response.status
    except urllib.error.HTTPError as error:
        return error.code
    except (urllib.error.URLError, TimeoutError, OSError):
        return None


@pytest.fixture(scope="session", autouse=True)
def local_app_is_running():
    """Pastikan layanan lokal siap sebelum membuka browser."""
    deadline = time.monotonic() + 15
    urls = (ACTIVITY_URL, f"{API_BASE_URL}/")
    while time.monotonic() < deadline:
        if all(_http_status(url) is not None for url in urls):
            return
        time.sleep(0.5)
    pytest.fail(
        "Frontend atau backend belum aktif. Jalankan Vite di port 5173 "
        "dan FastAPI di port 8000 terlebih dahulu."
    )


@pytest.fixture
def driver():
    before_ids = {log["id_activity_log"] for log in _today_logs()["data"]}
    options = webdriver.ChromeOptions()
    if os.getenv("HEADLESS") == "1":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")

    try:
        browser = webdriver.Chrome(options=options)
    except Exception as error:
        pytest.skip(f"Chrome WebDriver tidak tersedia: {error}")

    try:
        yield browser
    finally:
        try:
            after_ids = {log["id_activity_log"] for log in _today_logs()["data"]}
            for activity_id in sorted(after_ids - before_ids):
                status_code, body = _http_json(
                    f"/api/activity-logs/{activity_id}", method="DELETE"
                )
                if status_code not in (200, 404):
                    raise RuntimeError(
                        f"Gagal membersihkan log aktivitas {activity_id}: {body}"
                    )
        finally:
            browser.quit()


def buka_halaman_aktivitas(driver, berat_kg=70):
    driver.get(FRONTEND_BASE_URL)
    driver.execute_script(
        "localStorage.setItem('fitbite_berat_badan_kg', arguments[0]);",
        str(berat_kg),
    )
    driver.get(ACTIVITY_URL)
    WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located(
            (By.XPATH, "//h1[contains(., 'Bergerak cukup')]")
        )
    )


def panggil_api_dari_browser(driver, path, payload=None, method="POST"):
    """Panggil API melalui Selenium dari origin frontend."""
    driver.set_script_timeout(TIMEOUT)
    result = driver.execute_async_script(
        """
        const [url, method, payload, done] = arguments;
        const options = { method, headers: { "Content-Type": "application/json" } };
        if (payload !== null) options.body = JSON.stringify(payload);
        fetch(url, options)
          .then(async (response) => {
            const body = await response.json();
            done({ status: response.status, body });
          })
          .catch((error) => done({ error: String(error) }));
        """,
        f"{API_BASE_URL}{path}",
        method,
        payload,
    )
    assert "error" not in result, result
    return result


def input_durasi(driver):
    return driver.find_element(
        By.XPATH, "//label[contains(., 'Durasi')]//input[@type='number']"
    )


def section_gerak_hari_ini(driver):
    return driver.find_element(
        By.XPATH, "//section[.//h2[normalize-space()='Gerak hari ini']]"
    )


def ringkasan_total_kalori(driver):
    return driver.find_element(
        By.XPATH, "//article[.//span[normalize-space()='Energi terbakar']]//strong"
    ).text


def format_kalori_id(value):
    return f"{value:,}".replace(",", ".")


def buat_log_uji(driver, nama, durasi, met=7, berat=70):
    response = panggil_api_dari_browser(
        driver,
        "/api/activities/log",
        {
            "id_user": USER_ID,
            "tanggal": date.today().isoformat(),
            "nama_aktivitas": nama,
            "durasi_menit": durasi,
            "waktu_mulai": datetime.now().strftime("%H:%M"),
            "met": met,
            "berat_kg": berat,
        },
    )
    assert response["status"] == 201, response
    return response["body"]["data"]


def test_tc_pbi04_001_catat_lari_kalori_instansi_dan_total_harian(driver):
    """Jogging 30 menit, 70 kg, MET 7 menghasilkan sekitar 257 kkal."""
    buka_halaman_aktivitas(driver, berat_kg=70)
    before_count = _today_logs()["count"]
    before_total = _today_logs()["total_kalori_terbakar"]

    driver.find_element(
        By.XPATH, "//button[.//span[normalize-space()='Lari']]"
    ).click()
    durasi = input_durasi(driver)
    durasi.clear()
    durasi.send_keys("30")

    preview = WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='status']"))
    )
    assert "257 kkal" in preview.text
    assert "70 kg" in preview.text

    driver.find_element(
        By.XPATH, "//button[contains(normalize-space(), 'Simpan aktivitas')]"
    ).click()
    WebDriverWait(driver, TIMEOUT).until(
        lambda _: _today_logs()["count"] == before_count + 1
    )

    section = section_gerak_hari_ini(driver)
    assert "Lari" in section.text
    assert "30 menit" in section.text
    assert "257 kkal" in section.text

    updated = _today_logs()
    assert updated["total_kalori_terbakar"] > before_total
    expected_total = int(updated["total_kalori_terbakar"] + 0.5)
    WebDriverWait(driver, TIMEOUT).until(
        lambda _: format_kalori_id(expected_total)
        in ringkasan_total_kalori(driver)
    )


def test_tc_pbi04_002_durasi_kosong_ditolak_dengan_pesan_validasi(driver):
    """Form menolak durasi kosong dan meminta aktivitas serta durasi wajib."""
    buka_halaman_aktivitas(driver)
    durasi = input_durasi(driver)
    durasi.click()
    durasi.send_keys(Keys.CONTROL + "a")
    durasi.send_keys(Keys.BACKSPACE)
    driver.find_element(
        By.XPATH, "//button[contains(normalize-space(), 'Simpan aktivitas')]"
    ).click()

    invalid_activity = panggil_api_dari_browser(
        driver,
        "/api/activities/log",
        {
            "id_user": USER_ID,
            "tanggal": date.today().isoformat(),
            "nama_aktivitas": "",
            "durasi_menit": 20,
            "waktu_mulai": "12:00",
            "met": 3.5,
            "berat_kg": 70,
        },
    )
    assert invalid_activity["status"] == 422

    alert = WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert']"))
    )
    assert "Pilih jenis aktivitas dan isi durasi olahraga" in alert.text


@pytest.mark.parametrize("durasi_input", ["0", "-45"])
def test_tc_pbi04_003_durasi_nol_atau_negatif_ditolak(driver, durasi_input):
    """Durasi nol dan negatif tidak boleh tersimpan."""
    buka_halaman_aktivitas(driver)
    before_count = _today_logs()["count"]

    durasi = input_durasi(driver)
    durasi.clear()
    durasi.send_keys(durasi_input)
    driver.find_element(
        By.XPATH, "//button[contains(normalize-space(), 'Simpan aktivitas')]"
    ).click()

    alert = WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='alert']"))
    )
    assert "Durasi aktivitas harus berupa angka positif lebih dari 0" in alert.text
    assert _today_logs()["count"] == before_count


def test_tc_pbi04_004_durasi_ekstrem_meminta_konfirmasi_batas_wajar(driver):
    """Durasi 1.440 menit memunculkan konfirmasi batas sesi yang wajar."""
    buka_halaman_aktivitas(driver)
    before_count = _today_logs()["count"]

    durasi = input_durasi(driver)
    durasi.clear()
    durasi.send_keys("1440")
    driver.find_element(
        By.XPATH, "//button[contains(normalize-space(), 'Simpan aktivitas')]"
    ).click()

    try:
        confirmation = WebDriverWait(driver, 5).until(EC.alert_is_present())
        message = confirmation.text.lower()
        assert any(word in message for word in ("360", "batas", "wajar", "maksimal"))
        confirmation.dismiss()
    except TimeoutException:
        dialog = WebDriverWait(driver, TIMEOUT).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='dialog']"))
        )
        assert any(
            word in dialog.text.lower()
            for word in ("360", "batas", "wajar", "maksimal")
        )

    assert _today_logs()["count"] == before_count


def test_tc_pbi04_005_edit_durasi_menghitung_ulang_kalori(driver):
    """Edit lari 30 ke 45 menit memperbarui kalori menjadi sekitar 386."""
    buka_halaman_aktivitas(driver)
    test_name = "PBI04 Edit Selenium"
    record = buat_log_uji(driver, test_name, durasi=30)
    before_total = _today_logs()["total_kalori_terbakar"]
    driver.refresh()

    row = WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                f"//section[.//h2[normalize-space()='Gerak hari ini']]"
                f"//div[.//strong[normalize-space()='{test_name}']]",
            )
        )
    )
    edit_button = WebDriverWait(driver, TIMEOUT).until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                f"//div[.//strong[normalize-space()='{test_name}']]"
                "//button[contains(., 'Edit') or contains(@aria-label, 'Edit') "
                "or contains(@title, 'Edit')]",
            )
        )
    )
    edit_button.click()

    edit_input = WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                "//*[@role='dialog']//input[@type='number']"
                " | //input[@aria-label='Durasi aktivitas']",
            )
        )
    )
    edit_input.clear()
    edit_input.send_keys("45")
    driver.find_element(
        By.XPATH,
        "//*[@role='dialog']//button[contains(., 'Simpan perubahan') "
        "or contains(., 'Simpan')]",
    ).click()

    WebDriverWait(driver, TIMEOUT).until(
        lambda _: "45 menit" in row.text and "386 kkal" in row.text
    )
    updated_total = _today_logs()["total_kalori_terbakar"]
    assert updated_total > before_total
    assert "386 kkal" in row.text


def test_tc_pbi04_006_hapus_log_dengan_konfirmasi_dan_kurangi_total(driver):
    """Hapus satu log setelah konfirmasi dan pastikan total kalori berkurang."""
    buka_halaman_aktivitas(driver)
    test_name = "PBI04 Hapus Selenium"
    record = buat_log_uji(driver, test_name, durasi=10, met=4)
    before_total = _today_logs()["total_kalori_terbakar"]
    driver.refresh()

    row_xpath = (
        f"//section[.//h2[normalize-space()='Gerak hari ini']]"
        f"//div[.//strong[normalize-space()='{test_name}']]"
    )
    row = WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located((By.XPATH, row_xpath))
    )
    row.find_element(By.XPATH, ".//button[contains(., 'Hapus')]").click()

    try:
        confirmation = WebDriverWait(driver, 5).until(EC.alert_is_present())
        confirmation.accept()
    except TimeoutException:
        dialog = WebDriverWait(driver, TIMEOUT).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[role='dialog']"))
        )
        dialog.find_element(
            By.XPATH, ".//button[contains(., 'Hapus') or contains(., 'Ya')]"
        ).click()

    WebDriverWait(driver, TIMEOUT).until(
        EC.invisibility_of_element_located((By.XPATH, row_xpath))
    )
    WebDriverWait(driver, TIMEOUT).until(
        lambda _: _today_logs()["total_kalori_terbakar"] < before_total
    )
    assert record["id_activity_log"] not in {
        log["id_activity_log"] for log in _today_logs()["data"]
    }
