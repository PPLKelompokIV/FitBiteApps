"""
Pengujian Selenium PBI-03: Kalkulator BMR & TDEE Dinamis.
Kasus uji: TC-PBI03-001 sampai TC-PBI03-005 dari workbook Test_Case_FitBiteApps.xlsx.
Halaman: http://localhost:5173/bodycheckpagi dan /dashboard-hari-ini
API: http://localhost:8000
Jalankan: python -m pytest test_kalkulator_bmr_tdee.py -v
"""

import os

import pytest

pytest.importorskip("selenium")

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


URL_BODY_CHECK = "http://localhost:5173/bodycheckpagi"
URL_DASHBOARD = "http://localhost:5173/dashboard-hari-ini"
API_BASE_URL = "http://localhost:8000"
TIMEOUT = 15
CALORIE_SUMMARY_LABEL = "Ringkasan kebutuhan kalori dari backend"


@pytest.fixture
def driver():
    """Menyiapkan Chrome untuk pengujian UI dan API melalui browser."""
    options = webdriver.ChromeOptions()
    if os.getenv("HEADLESS") == "1":
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")

    try:
        browser = webdriver.Chrome(options=options)
    except Exception as error:
        pytest.skip(f"Chrome WebDriver tidak dapat diinisialisasi: {error}")

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
    assert "1.679" in nilai_kebutuhan_kalori(driver, "BMR")
    assert "2.602" in nilai_kebutuhan_kalori(driver, "TDEE")


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
