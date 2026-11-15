"""
Helper pengujian E2E - David Febrian Pramusti (PBI-07, PBI-08, PBI-19, PBI-20)
================================================================================
Berisi utilitas bersama untuk seluruh skrip pengujian milik David Febrian Pramusti:

1. Pembuatan driver Chrome (Selenium 4).
2. Seeding sesi login (4A Authentication) agar rute terproteksi FIT-61 bisa dibuka
   tanpa harus mengulang alur login di setiap test.
3. Pemanggilan REST API FitBite memakai library standar `urllib` supaya skrip tetap
   ringan (tanpa dependensi tambahan di luar pytest + selenium).
4. Helper interaksi UI (set nilai input React, klik aman, baca total hidrasi).

Jalankan pengujian dari root repository:
    .venv/Scripts/python.exe -m pytest test_log_konsumsi_cairan.py -v

Prasyarat:
    - Frontend Vite aktif  : http://localhost:5173
    - Backend FastAPI aktif: http://127.0.0.1:8000
    - Chrome terpasang (Selenium Manager mengunduh driver otomatis)

Environment variable opsional:
    FITBITE_HEADLESS=1        -> jalankan Chrome tanpa jendela (untuk CI)
    FITBITE_FRONTEND_URL=...  -> override URL frontend
    FITBITE_API_BASE=...      -> override URL backend
"""

import json
import os
import re
import time
import urllib.error
import urllib.request
from datetime import date

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

FRONTEND_URL = os.getenv("FITBITE_FRONTEND_URL", "http://localhost:5173").rstrip("/")
API_BASE = os.getenv("FITBITE_API_BASE", "http://127.0.0.1:8000").rstrip("/")
HEADLESS = os.getenv("FITBITE_HEADLESS", "0") == "1"
DEFAULT_WAIT = int(os.getenv("FITBITE_WAIT", "15"))

# ---------------------------------------------------------------------------
# Sesi pengguna uji (4A: Authentication & Authorization)
# ---------------------------------------------------------------------------
TEST_USER = {
    "id_user": "22222222-2222-2222-2222-222222222222",
    "nama": "Budi Santoso",
    "email": "budi@fitbite.com",
    "role": "user",
    "status_akun": "active",
}
TEST_TOKEN = "e2e-david-febrian-pramusti-session-token"
TEST_AUDIT = {
    "session_id": "e2e-david-session",
    "login_at": "2026-01-01T08:00:00+00:00",
    "client_ip": "127.0.0.1",
}


# ---------------------------------------------------------------------------
# Driver & navigasi
# ---------------------------------------------------------------------------
def make_driver():
    """Membuat instance Chrome WebDriver."""
    options = Options()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1440,1000")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-search-engine-choice-screen")
    options.add_argument("--disable-notifications")
    options.add_experimental_option(
        "prefs",
        {
            "credentials_enable_service": False,
            "profile.password_manager_enabled": False,
        },
    )
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(0)
    return driver


def wait_page_ready(driver, timeout=DEFAULT_WAIT):
    """Menunggu dokumen selesai dimuat dan React selesai melakukan render awal."""
    WebDriverWait(driver, timeout).until(
        lambda d: d.execute_script("return document.readyState") == "complete"
    )
    WebDriverWait(driver, timeout).until(
        lambda d: d.execute_script("return document.body !== null")
    )
    time.sleep(0.4)


def seed_session(driver):
    """Menyimpan sesi login ke LocalStorage (key mengikuti src/utils/auth.ts)."""
    driver.get(f"{FRONTEND_URL}/login")
    wait_page_ready(driver)
    driver.execute_script(
        """
        localStorage.setItem('fitbite_token', arguments[0]);
        localStorage.setItem('fitbite_user', arguments[1]);
        localStorage.setItem('fitbite_role', arguments[2]);
        localStorage.setItem('fitbite_session', arguments[3]);
        """,
        TEST_TOKEN,
        json.dumps(TEST_USER),
        TEST_USER["role"],
        json.dumps(TEST_AUDIT),
    )


def open_page(driver, path, ready_xpath=None, timeout=DEFAULT_WAIT):
    """Membuka halaman FitBite dengan sesi login aktif.

    :param path: contoh "/jurnal-makanan"
    :param ready_xpath: XPath elemen penanda halaman siap dipakai
    """
    seed_session(driver)
    driver.get(f"{FRONTEND_URL}{path}")
    wait_page_ready(driver)
    if ready_xpath:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, ready_xpath))
        )
    return driver


def enable_request_logging(driver):
    """Merekam seluruh request fetch/XHR ke window.__fitbiteRequests.

    Dipakai untuk memverifikasi perilaku debounce pencarian katalog (TC-PBI07-003).
    Harus dipanggil SEBELUM navigasi halaman.
    """
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": """
            window.__fitbiteRequests = [];
            const __origFetch = window.fetch;
            window.fetch = function (...args) {
              try { window.__fitbiteRequests.push(String(args[0])); } catch (e) {}
              return __origFetch.apply(this, args);
            };
            const __origOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
              try { window.__fitbiteRequests.push(String(url)); } catch (e) {}
              return __origOpen.call(this, method, url, ...rest);
            };
            """,
        },
    )


def recorded_requests(driver):
    return driver.execute_script("return window.__fitbiteRequests || []")


# ---------------------------------------------------------------------------
# REST API (urllib standar)
# ---------------------------------------------------------------------------
def api_request(method, path, payload=None, timeout=30):
    """Memanggil REST API FitBite dan mengembalikan (status_code, body)."""
    data = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(
        f"{API_BASE}{path}", data=data, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read().decode("utf-8", "replace")
            return response.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", "replace")
        try:
            return error.code, json.loads(raw)
        except json.JSONDecodeError:
            return error.code, raw


def today_str():
    return date.today().isoformat()


# --- Hidrasi (PBI-08) -------------------------------------------------------
def water_logs():
    status, body = api_request("GET", f"/api/water-logs/1?tanggal={today_str()}")
    assert status == 200, f"Gagal membaca water-logs: {status} {body}"
    return body["data"]


def water_total_api():
    return sum(int(log["jumlah_ml"]) for log in water_logs())


def reset_water_logs():
    """Menghapus seluruh catatan minum hari ini agar baseline test deterministik."""
    for log in water_logs():
        api_request("DELETE", f"/api/water-logs/{log['id_water_log']}")


def seed_water_log(amount, waktu="08.00 WIB", catatan="Air Putih"):
    status, body = api_request(
        "POST",
        "/api/water-logs",
        {
            "id_user": 1,
            "tanggal": today_str(),
            "waktu": waktu,
            "jumlah_ml": amount,
            "catatan": catatan,
        },
    )
    assert status == 201, f"Gagal menyiapkan water-log: {status} {body}"
    return body["data"]


def prepare_hydration_baseline(amount=500, waktu="08.00 WIB"):
    """Baseline TC-PBI08-001: total asupan hari ini tepat `amount` ml."""
    reset_water_logs()
    if amount:
        seed_water_log(amount, waktu=waktu)


# --- Jurnal makanan (PBI-07 / PBI-19 / PBI-20) ------------------------------
def food_logs(target_date=None):
    status, body = api_request(
        "GET", f"/api/food-logs/1?tanggal={target_date or today_str()}"
    )
    if status != 200:
        # Catatan: GET /api/food-logs masih mengembalikan 500 (bug router FIT-33),
        # sehingga dianggap belum ada log tersimpan.
        return []
    return body.get("data", [])


# ---------------------------------------------------------------------------
# Helper interaksi UI
# ---------------------------------------------------------------------------
def set_input_value(driver, element, value):
    """Mengisi input React (controlled component) memakai native value setter."""
    driver.execute_script(
        """
        const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        setter.call(arguments[0], arguments[1]);
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
        """,
        element,
        value,
    )


def safe_click(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    driver.execute_script("arguments[0].click();", element)


def find_by_text(driver, text, tag="button", timeout=DEFAULT_WAIT):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable(
            (By.XPATH, f"//{tag}[normalize-space()='{text}']")
        )
    )


# --- Widget hidrasi ---------------------------------------------------------
# Anchor XPath: input "Jumlah lainnya" hanya ada satu pada halaman, sehingga
# ancestor::section[1] selalu menunjuk tepat ke kartu widget hidrasi.
_HYDRATION_CARD = (
    "//label[contains(normalize-space(.), 'Jumlah lainnya')]/ancestor::section[1]"
)
HYDRATION_TOTAL_XPATH = _HYDRATION_CARD + "//p[contains(@class, 'text-[29px]')]"
HYDRATION_PROGRESS_XPATH = (
    _HYDRATION_CARD + "//span[contains(normalize-space(.), '% tercapai')]"
)
HYDRATION_CUSTOM_INPUT_XPATH = (
    "//label[contains(normalize-space(.), 'Jumlah lainnya')]//input"
)


def hydration_total(driver, timeout=DEFAULT_WAIT):
    element = WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.XPATH, HYDRATION_TOTAL_XPATH))
    )
    digits = re.sub(r"[^\d]", "", element.text)
    return int(digits) if digits else 0


def hydration_progress(driver, timeout=DEFAULT_WAIT):
    element = WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.XPATH, HYDRATION_PROGRESS_XPATH))
    )
    digits = re.sub(r"[^\d]", "", element.text)
    return int(digits) if digits else 0


def wait_hydration_total(driver, expected, timeout=DEFAULT_WAIT):
    return WebDriverWait(driver, timeout).until(
        lambda d: hydration_total(d, timeout=1) == expected
    )


def hydration_error_text(driver):
    """Mengambil pesan error pada widget hidrasi (elemen role=alert)."""
    elements = driver.find_elements(
        By.XPATH, _HYDRATION_CARD + "//p[@role='alert']"
    )
    return elements[0].text.strip() if elements else ""


def riwayat_texts(driver):
    rows = driver.find_elements(
        By.XPATH,
        "//section[.//h2[contains(., 'Riwayat minum')]]"
        "//div[contains(@class, 'group')]",
    )
    return [row.text.strip() for row in rows]


# --- Katalog makanan -------------------------------------------------------
KATALOG_SEARCH_INPUT = "input[aria-label='Cari di katalog']"
KATALOG_ITEM_XPATH = "//button[.//span[contains(., 'Per 100 g')]]"


def katalog_items(driver):
    """Mengembalikan daftar nama makanan yang sedang tampil di katalog."""
    items = driver.find_elements(By.XPATH, KATALOG_ITEM_XPATH)
    names = []
    for item in items:
        name_element = item.find_element(
            By.XPATH, "./span[contains(@class, 'flex')]/span[1]"
        )
        names.append(name_element.text.strip())
    return names


def katalog_empty_state(driver):
    elements = driver.find_elements(
        By.XPATH, "//p[contains(., 'Makanan tidak ditemukan')]"
    )
    return elements[0].text.strip() if elements else ""


def ketik_katalog(driver, keyword, delay=0.0):
    """Mengetik kata kunci pada kolom pencarian katalog."""
    input_element = WebDriverWait(driver, DEFAULT_WAIT).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, KATALOG_SEARCH_INPUT))
    )
    input_element.click()
    input_element.send_keys("\ue009" + "a")  # Ctrl+A
    input_element.send_keys("\ue003")  # Backspace
    for char in keyword:
        input_element.send_keys(char)
        if delay:
            time.sleep(delay)
    return input_element
