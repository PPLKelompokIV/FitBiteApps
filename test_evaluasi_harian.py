"""Selenium E2E tests for the daily evaluation page (TC-PBI13-001..006)."""

import json

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


URL = "http://localhost:5173/evaluasi-harian"
TIMEOUT = 15
EMPTY_LOG_MESSAGE = (
    "Data hari ini belum lengkap. Silakan catat konsumsi makanan dan aktivitas "
    "Anda untuk evaluasi akurat"
)


def _format_energy(value):
    return f"{value:,}".replace(",", ".")


def _evaluation_payload(
    aktual_energi, status, percent, badge, title, appreciation, suggestion
):
    target_energi = 2000
    target_protein, aktual_protein = 100, 80
    target_karbo, aktual_karbo = 190, 170
    target_lemak, aktual_lemak = 60, 50
    target_air, aktual_air = 2240, 1800
    tone = {"tercapai": "good", "kurang": "low", "berlebih": "high"}[status]
    suggestions = [{"nomor": "01", "teks": suggestion}]

    return {
        "id_evaluation": 1,
        "id_user": 1,
        "tanggal_evaluasi": "2026-01-01",
        "is_log_kosong": False,
        "pesan_state_kosong": None,
        "skor_kepatuhan": 75,
        "status_energi": status,
        "badge_evaluasi_kalori": badge,
        "judul_status": title,
        "pesan_apresiasi": appreciation,
        "status_tone": tone,
        "persentase_energi": percent,
        "tipe_pemicu": "manual",
        "waktu_evaluasi": "20.00 WIB",
        "ringkasan_tabel": [
            {
                "komponen": "Energi",
                "target": f"{_format_energy(target_energi)} kkal",
                "aktual": f"{_format_energy(aktual_energi)} kkal",
                "ringkasan": f"{percent}% · {badge}",
                "tone": tone,
            },
            {
                "komponen": "Protein",
                "target": f"{target_protein} g",
                "aktual": f"{aktual_protein} g",
                "ringkasan": "-20 g",
                "tone": "low",
            },
            {
                "komponen": "Karbohidrat",
                "target": f"{target_karbo} g",
                "aktual": f"{aktual_karbo} g",
                "ringkasan": "-20 g",
                "tone": "low",
            },
            {
                "komponen": "Lemak",
                "target": f"{target_lemak} g",
                "aktual": f"{aktual_lemak} g",
                "ringkasan": "-10 g",
                "tone": "neutral",
            },
            {
                "komponen": "Air minum",
                "target": f"{_format_energy(target_air)} ml",
                "aktual": f"{_format_energy(aktual_air)} ml",
                "ringkasan": "80% · kurang",
                "tone": "low",
            },
        ],
        "detail": {
            "target_energi_dasar": target_energi,
            "kalori_olahraga": 250,
            "target_energi": target_energi,
            "aktual_energi": aktual_energi,
            "target_air_dasar": target_air,
            "bonus_air_olahraga": 0,
            "target_air": target_air,
            "aktual_air": aktual_air,
            "jumlah_log_makan": 1,
            "jumlah_log_aktivitas": 1,
            "durasi_olahraga": 30,
            "jumlah_log_air": 1,
        },
        "saran_korektif": suggestions,
    }


def _scenario(actual_energy):
    target_energy = 2000
    percent = round(actual_energy / target_energy * 100)

    if actual_energy < target_energy * 0.9:
        status = "kurang"
        badge = "Asupan Kurang"
        title = "Asupan energi masih di bawah target."
        appreciation = (
            "Tingkatkan porsi makan bernutrisi besok untuk menjaga metabolisme."
        )
        deficit = f"{target_energy - actual_energy:,}".replace(",", ".")
        suggestion = (
            f"Status Asupan Kurang (defisit {deficit} kkal dari target). "
            "Tingkatkan porsi makan bernutrisi besok untuk menjaga metabolisme."
        )
    elif actual_energy > target_energy * 1.1:
        status = "berlebih"
        badge = "Surplus Kalori"
        title = "Surplus Kalori — Asupan energi melebihi target harian."
        appreciation = (
            "Lakukan aktivitas olahraga ringan untuk membakar kelebihan energi "
            "besok pagi."
        )
        surplus = f"{actual_energy - target_energy:,}".replace(",", ".")
        suggestion = (
            f"Status Surplus Kalori (+{surplus} kkal di atas target). "
            "Disarankan melakukan aktivitas olahraga ringan seperti jalan cepat "
            "atau jogging 20-30 menit untuk membakar kelebihan energi besok pagi."
        )
    else:
        status = "tercapai"
        badge = "Target Kalori Tercapai Optimal"
        title = (
            "Target Kalori Tercapai Optimal! Pertahankan konsistensi "
            "asupan harianmu."
        )
        appreciation = (
            "Kerja bagus! Asupan kalorimu hari ini berada dalam rentang "
            "optimal (+/- 10% dari target)."
        )
        suggestion = (
            "Target Kalori Tercapai Optimal! Apresiasi untuk konsistensimu "
            "hari ini, pertahankan pola makan seimbang ini untuk esok hari."
        )

    return {
        "actual": actual_energy,
        "status": status,
        "percent": percent,
        "badge": badge,
        "title": title,
        "appreciation": appreciation,
        "suggestion": suggestion,
    }


def _mock_api(driver, actual_energy=None):
    """Stub only the page's API calls so each scenario is isolated from user data."""
    scenario = _scenario(actual_energy) if actual_energy is not None else None
    mock_data = {
        "emptyMessage": EMPTY_LOG_MESSAGE,
        "evaluation": (
            _evaluation_payload(
                scenario["actual"],
                scenario["status"],
                scenario["percent"],
                scenario["badge"],
                scenario["title"],
                scenario["appreciation"],
                scenario["suggestion"],
            )
            if scenario
            else None
        ),
        "foodLogs": (
            [
                {
                    "id_food_log": 1,
                    "nama_makanan": "Catatan makanan uji",
                    "slot_makan": "Makan malam",
                    "kalori": scenario["actual"],
                }
            ]
            if scenario
            else []
        ),
        "activityLogs": (
            [
                {
                    "id_activity_log": 1,
                    "nama_aktivitas": "Jalan cepat",
                    "durasi_menit": 30,
                    "waktu_mulai": "07:00",
                    "met": 6,
                    "kalori_terbakar": 250,
                }
            ]
            if scenario
            else []
        ),
        "waterLogs": (
            [{"id_water_log": 1, "waktu": "09.00 WIB", "jumlah_ml": 1800}]
            if scenario
            else []
        ),
    }
    script = """
        const fixture = __FIXTURE__;
        const originalFetch = window.fetch.bind(window);
        let evaluationTriggered = false;
        const response = (body, status = 200) => new Response(
            JSON.stringify(body),
            { status, headers: { "Content-Type": "application/json" } }
        );
        window.fetch = async (input, init = {}) => {
            const url = new URL(typeof input === "string" ? input : input.url);
            const method = (init.method || "GET").toUpperCase();
            if (url.pathname.endsWith("/calendar")) {
                return response({ status: "success", data: {} });
            }
            if (/\\/api\\/evaluations\\/1\\/\\d{4}-\\d{2}-\\d{2}$/.test(url.pathname)) {
                if (evaluationTriggered && fixture.evaluation) {
                    return response({ status: "success", data: fixture.evaluation });
                }
                return response({
                    status: "empty",
                    is_log_kosong: true,
                    message: fixture.emptyMessage,
                    data: {}
                });
            }
            if (url.pathname === "/api/evaluations/trigger" && method === "POST") {
                evaluationTriggered = true;
                return response({
                    status: "success",
                    message: "Evaluasi malam berhasil dihitung.",
                    data: fixture.evaluation
                });
            }
            if (url.pathname === "/api/food-logs/1") {
                return response({ status: "success", data: fixture.foodLogs });
            }
            if (url.pathname === "/api/activity-logs/1") {
                return response({ status: "success", data: fixture.activityLogs });
            }
            if (url.pathname === "/api/water-logs/1") {
                return response({ status: "success", data: fixture.waterLogs });
            }
            return originalFetch(input, init);
        };
    """.replace("__FIXTURE__", json.dumps(mock_data))
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument", {"source": script}
    )


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless=new")  <-- hapus atau jadikan komentar
    options.add_argument("--start-maximized")
    browser = webdriver.Chrome(options=options)
    browser.set_page_load_timeout(TIMEOUT)
    yield browser
    browser.quit()


def _open_page(driver, actual_energy=None):
    _mock_api(driver, actual_energy)
    driver.get(URL)
    wait = WebDriverWait(driver, TIMEOUT)
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//h1[contains(., 'Lihat kembali, melangkah lebih sadar.')]")
        )
    )
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//*[normalize-space(.)='Data tersinkron']")
        )
    )
    return wait


def _run_evaluation(driver, wait):
    button = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space(.)='Hitung & simpan evaluasi']")
        )
    )
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
    driver.execute_script("arguments[0].click();", button)


# 1. TC-PBI13-001
def test_tc_pbi13_001_rekapitulasi_evaluasi_harian(driver):
    """TC-PBI13-001: recap calories, macros, hydration and burned calories."""
    wait = _open_page(driver, actual_energy=1950)
    _run_evaluation(driver, wait)

    for label in (
        "Evaluasi malam",
        "Energi",
        "2.000 kkal",
        "1.950 kkal",
        "Protein",
        "100 g",
        "80 g",
        "Karbohidrat",
        "190 g",
        "170 g",
        "Lemak",
        "60 g",
        "50 g",
        "Air minum",
        "2.240 ml",
        "1.800 ml",
        "250 kkal",
    ):
        wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, f"//*[contains(normalize-space(.), {json.dumps(label)})]")
            )
        )
    assert "Aktivitas" in driver.find_element(By.TAG_NAME, "body").text


# 2. TC-PBI13-002
def test_tc_pbi13_002_status_target_tercapai_optimal(driver):
    """TC-PBI13-002: optimal badge and appreciation for 1950/2000 kcal."""
    wait = _open_page(driver, actual_energy=1950)
    _run_evaluation(driver, wait)

    badge = wait.until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                "//span[contains(normalize-space(.), 'Target Kalori Tercapai Optimal')]",
            )
        )
    )
    assert "bg-[#eaf3e9]" in badge.get_attribute("class")
    assert "98% dari target" in badge.text
    assert "Kerja bagus!" in driver.find_element(By.TAG_NAME, "body").text


# 3. TC-PBI13-003
def test_tc_pbi13_003_saran_korektif_defisit_kalori(driver):
    """TC-PBI13-003: low-intake status and corrective recommendation."""
    wait = _open_page(driver, actual_energy=1100)
    _run_evaluation(driver, wait)

    body = wait.until(
        EC.visibility_of_element_located((By.TAG_NAME, "body"))
    ).text
    assert "Asupan Kurang" in body
    assert "Saran Korektif untuk Besok" in body
    assert "Tingkatkan porsi makan bernutrisi besok untuk menjaga metabolisme." in body


# 4. TC-PBI13-004
def test_tc_pbi13_004_saran_korektif_surplus_kalori(driver):
    """TC-PBI13-004: surplus status and light-exercise recommendation."""
    wait = _open_page(driver, actual_energy=2500)
    _run_evaluation(driver, wait)

    body = wait.until(
        EC.visibility_of_element_located((By.TAG_NAME, "body"))
    ).text
    assert "Surplus Kalori" in body
    assert "Saran Korektif untuk Besok" in body
    assert (
        "aktivitas olahraga ringan seperti jalan cepat atau jogging 20-30 menit"
        in body
    )
    assert "membakar kelebihan energi besok pagi" in body


# 5. TC-PBI13-005
def test_tc_pbi13_005_state_informatif_log_kosong(driver):
    """TC-PBI13-005: informative state when there are no daily logs."""
    wait = _open_page(driver)

    informative_state = wait.until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                f"//*[@role='status'][contains(., {json.dumps(EMPTY_LOG_MESSAGE)})]",
            )
        )
    )
    assert EMPTY_LOG_MESSAGE in informative_state.text


# 6. TC-PBI13-006 (Boundary Value Analysis - Batas Bawah Optimal -10% = 1800 kkal)
def test_tc_pbi13_006_bva_batas_bawah_optimal(driver):
    """TC-PBI13-006: BVA lower boundary at 1800 kcal (-10% of 2000 kcal)."""
    wait = _open_page(driver, actual_energy=1800)
    _run_evaluation(driver, wait)

    badge = wait.until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                "//span[contains(normalize-space(.), 'Target Kalori Tercapai Optimal')]",
            )
        )
    )
    assert "90% dari target" in badge.text
    assert "bg-[#eaf3e9]" in badge.get_attribute("class")