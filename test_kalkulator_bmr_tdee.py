"""
Pengujian Selenium PBI-03: Kalkulator BMR & TDEE Dinamis.
Kasus uji: TC-PBI03-001 sampai TC-PBI03-005 dari workbook Test_Case_FitBiteApps.xlsx.
Halaman: http://localhost:5173/dashboard-hari-ini
API: http://localhost:8000
Server lokal dijalankan otomatis jika belum aktif.
Jalankan: python -m pytest test_kalkulator_bmr_tdee.py -v
"""

import os
import shutil
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


REPOSITORY_ROOT = Path(__file__).resolve().parent
BACKEND_ROOT = REPOSITORY_ROOT / "fitbite-backend"
FRONTEND_ROOT = REPOSITORY_ROOT / "fitbite-frontend"
URL_DASHBOARD = "http://localhost:5173/dashboard-hari-ini"
API_BASE_URL = "http://localhost:8000"
BACKEND_HEALTH_URL = f"{API_BASE_URL}/"
TIMEOUT = 15
SERVER_STARTUP_TIMEOUT = 60
CALORIE_SUMMARY_LABEL = "Ringkasan kebutuhan kalori dari backend"


def status_http(url):
    try:
        with urllib.request.urlopen(url, timeout=1) as response:
            return response.status
    except urllib.error.HTTPError as error:
        return error.code
    except (urllib.error.URLError, TimeoutError, OSError):
        return None


def detail_log(log_file):
    log_file.flush()
    log_file.seek(0)
    return log_file.read().decode("utf-8", errors="replace").strip()


def wait_for_server(url, process, log_file, name):
    deadline = time.monotonic() + SERVER_STARTUP_TIMEOUT
    while time.monotonic() < deadline:
        status = status_http(url)
        if status is not None:
            if status >= 500:
                raise RuntimeError(
                    f"{name} returned HTTP {status} during startup.\n"
                    f"{detail_log(log_file)}"
                )
            return
        if process.poll() is not None:
            raise RuntimeError(
                f"{name} exited with code {process.returncode}.\n"
                f"{detail_log(log_file)}"
            )
        time.sleep(0.5)

    raise RuntimeError(
        f"{name} did not become ready within {SERVER_STARTUP_TIMEOUT} seconds.\n"
        f"{detail_log(log_file)}"
    )


@pytest.fixture(scope="session", autouse=True)
def local_app_servers():
    """Starts local app servers when needed and stops only the servers it owns."""
    processes = []
    log_files = []
    try:
        backend_status = status_http(BACKEND_HEALTH_URL)
        if backend_status is None:
            backend_python = BACKEND_ROOT / ".venv" / "Scripts" / "python.exe"
            if not backend_python.is_file():
                raise RuntimeError(f"Backend Python environment not found: {backend_python}")

            backend_log = tempfile.TemporaryFile()
            log_files.append(backend_log)
            backend_process = subprocess.Popen(
                [
                    str(backend_python),
                    "-m",
                    "uvicorn",
                    "app.main:app",
                    "--host",
                    "127.0.0.1",
                    "--port",
                    "8000",
                ],
                cwd=BACKEND_ROOT,
                stdout=backend_log,
                stderr=subprocess.STDOUT,
            )
            processes.append(backend_process)
            wait_for_server(
                BACKEND_HEALTH_URL,
                backend_process,
                backend_log,
                "FastAPI backend",
            )
        elif backend_status >= 500:
            raise RuntimeError(
                f"FastAPI backend returned HTTP {backend_status} at {BACKEND_HEALTH_URL}."
            )

        frontend_status = status_http(URL_DASHBOARD)
        if frontend_status is None:
            node_executable = shutil.which("node")
            vite_script = FRONTEND_ROOT / "node_modules" / "vite" / "bin" / "vite.js"
            if not node_executable:
                raise RuntimeError("Node.js is required to start the frontend.")
            if not vite_script.is_file():
                raise RuntimeError(f"Vite entry point not found: {vite_script}")

            frontend_log = tempfile.TemporaryFile()
            log_files.append(frontend_log)
            frontend_process = subprocess.Popen(
                [node_executable, str(vite_script), "--host", "127.0.0.1"],
                cwd=FRONTEND_ROOT,
                stdout=frontend_log,
                stderr=subprocess.STDOUT,
            )
            processes.append(frontend_process)
            wait_for_server(
                URL_DASHBOARD,
                frontend_process,
                frontend_log,
                "Vite frontend",
            )
        elif frontend_status >= 500:
            raise RuntimeError(
                f"Vite frontend returned HTTP {frontend_status} at {URL_DASHBOARD}."
            )

        yield
    finally:
        for process in reversed(processes):
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
        for log_file in log_files:
            log_file.close()


@pytest.fixture
def driver():
    """Menyiapkan Chrome untuk pengujian UI dan API melalui browser."""
    options = webdriver.ChromeOptions()
    if os.getenv("HEADLESS") == "1":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")

    browser = webdriver.Chrome(options=options)
    yield browser
    browser.quit()


def buka_dashboard(driver):
    driver.get(URL_DASHBOARD)
    WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located(
            (By.XPATH, "//h1[contains(., 'Hari baik dimulai')]")
        )
    )


def panggil_api_dari_browser(driver, path, payload, method="POST"):
    """Memanggil API dari origin website agar pengujian memakai Selenium."""
    driver.set_script_timeout(TIMEOUT)
    return driver.execute_async_script(
        """
        const [url, method, payload, done] = arguments;
        fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: payload === null ? undefined : JSON.stringify(payload),
        })
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


def nilai_kebutuhan_kalori(driver, label):
    element = WebDriverWait(driver, TIMEOUT).until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                f"//*[@aria-label='{CALORIE_SUMMARY_LABEL}']"
                f"//div[p[normalize-space()='{label}']]/p[2]",
            )
        )
    )
    return element.text


def test_tc_pbi03_001_hitung_simpan_dan_sinkronkan_bmr_tdee_ke_dashboard(driver):
    """
    Profil pria, 175 cm, 28 tahun, 72 kg, aktivitas sedang:
    BMR sekitar 1.679 kkal dan TDEE sekitar 2.602 kkal.
    """
    buka_dashboard(driver)
    response = panggil_api_dari_browser(
        driver,
        "/api/calorie-targets",
        {
            "id_user": 1,
            "usia": 28,
            "jenis_kelamin": "laki-laki",
            "tinggi_cm": 175,
            "berat_kg": 72,
            "tingkat_aktivitas": "sedang",
        },
    )

    assert response.get("status") == 201, response
    data = response["body"]["data"]
    assert data["bmr_kcal_per_hari"] == pytest.approx(1678.8, abs=0.1)
    assert data["tdee_kcal_per_hari"] == pytest.approx(2602.1, abs=0.1)

    driver.get(URL_DASHBOARD)
    assert "1.678,8" in nilai_kebutuhan_kalori(driver, "BMR")
    assert "2.602,1" in nilai_kebutuhan_kalori(driver, "TDEE")


def test_tc_pbi03_002_tdee_dikoreksi_berdasarkan_kesiapan_dan_tidur(driver):
    """Skor energi 1/5 dan tidur 4 jam harus lebih konservatif daripada 4/5."""
    buka_dashboard(driver)
    tdee = 2602.1
    kondisi_rendah = panggil_api_dari_browser(
        driver,
        "/calorie-target/adjust",
        {
            "tdee_kcal_per_hari": tdee,
            "skor_kesiapan": 20,
            "durasi_tidur_jam": 4,
        },
    )
    kondisi_baik = panggil_api_dari_browser(
        driver,
        "/calorie-target/adjust",
        {
            "tdee_kcal_per_hari": tdee,
            "skor_kesiapan": 80,
            "durasi_tidur_jam": 8,
        },
    )

    assert kondisi_rendah.get("status") == 200, kondisi_rendah
    assert kondisi_baik.get("status") == 200, kondisi_baik
    target_rendah = kondisi_rendah["body"]["target_kalori_disarankan"]
    target_baik = kondisi_baik["body"]["target_kalori_disarankan"]
    assert kondisi_rendah["body"]["penyesuaian_persen"] < 0
    assert kondisi_baik["body"]["penyesuaian_persen"] > 0
    assert target_rendah < target_baik


def test_tc_pbi03_003_profil_tidak_lengkap_menolak_kalkulasi(driver):
    """TB dan gender kosong harus menghasilkan peringatan, bukan kalkulasi."""
    buka_dashboard(driver)
    response = panggil_api_dari_browser(
        driver,
        "/api/calorie-targets",
        {
            "id_user": 930003,
            "usia": 28,
            "berat_kg": 72,
            "tingkat_aktivitas": "sedang",
        },
    )

    assert response.get("status") == 422, response
    detail = response["body"]["detail"]
    assert detail["code"] == "PROFILE_INCOMPLETE"
    assert "jenis kelamin" in detail["missing_fields"]
    assert "tinggi badan" in detail["missing_fields"]
    assert "belum lengkap" in detail["message"].lower()


def test_tc_pbi03_004_bmr_pria_166_kkal_di_atas_wanita(driver):
    """Parameter fisik sama harus menghasilkan selisih BMR tepat 166 kkal."""
    buka_dashboard(driver)
    profil = {
        "usia": 25,
        "tinggi_cm": 165,
        "berat_kg": 60,
    }
    pria = panggil_api_dari_browser(
        driver,
        "/bmr",
        {**profil, "jenis_kelamin": "laki-laki"},
    )
    wanita = panggil_api_dari_browser(
        driver,
        "/bmr",
        {**profil, "jenis_kelamin": "perempuan"},
    )

    assert pria.get("status") == 200, pria
    assert wanita.get("status") == 200, wanita
    bmr_pria = pria["body"]["bmr_kcal_per_hari"]
    bmr_wanita = wanita["body"]["bmr_kcal_per_hari"]
    assert bmr_pria - bmr_wanita == pytest.approx(166)


@pytest.mark.parametrize(
    ("jenis_kelamin", "batas_minimum", "id_user"),
    [
        ("perempuan", 1200, 930005),
        ("laki-laki", 1500, 930006),
    ],
)
def test_tc_pbi03_005_sasaran_kalori_mematuhi_batas_minimum(
    driver, jenis_kelamin, batas_minimum, id_user
):
    """Memastikan sasaran kalori tidak melewati floor minimum pada workbook."""
    buka_dashboard(driver)
    response = panggil_api_dari_browser(
        driver,
        "/api/calorie-targets",
        {
            "id_user": id_user,
            "usia": 60,
            "jenis_kelamin": jenis_kelamin,
            "tinggi_cm": 150,
            "berat_kg": 45,
            "tingkat_aktivitas": "sedentari",
        },
    )

    assert response.get("status") == 201, response
    sasaran = response["body"]["data"]["sasaran_kalori_kcal_per_hari"]
    assert sasaran >= batas_minimum
