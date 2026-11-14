import time
import urllib.request
import json
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

FRONTEND_URL = "http://localhost:5173/profil-pengingat"
API_BASE_URL = "http://127.0.0.1:8000/api/notifications"


def api_request(path: str, method: str = "GET", payload: dict = None):
    """Helper untuk mengatur prakondisi database melalui endpoint FastAPI."""
    url = f"{API_BASE_URL}{path}"
    data = json.dumps(payload).encode("utf-8") if payload else None
    headers = {"Content-Type": "application/json"} if payload else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


@pytest.fixture(scope="module")
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1440,900")
    # Hilangkan tanda komentar di bawah jika ingin berjalan tanpa membuka jendela Chrome (headless)
    # options.add_argument("--headless=new")
    browser = webdriver.Chrome(options=options)
    yield browser
    browser.quit()


# =====================================================================
# 1. TC-PBI12-001 (Baris 70): Badge unread count bertambah saat ada trigger baru
# =====================================================================
def test_tc_pbi12_001_badge_unread_bertambah(driver):
    # Prakondisi: Kosongkan notifikasi lalu kirim 1 trigger pengingat Makan Siang dari backend
    api_request("/user/1/clear", method="DELETE")
    api_request(
        "/trigger",
        method="POST",
        payload={"id_user": 1, "kategori": "makan_siang", "waktu_jadwal": "12:30"},
    )

    driver.get(FRONTEND_URL)
    wait = WebDriverWait(driver, 10)

    badge = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='notification-badge']"))
    )
    assert badge.text.strip() == "1", f"Expected badge '1', got '{badge.text}'"


# =====================================================================
# 2. TC-PBI12-002 (Baris 71): Membuka dropdown Notification Center & urutan waktu
# =====================================================================
def test_tc_pbi12_002_buka_dropdown_notification_center(driver):
    # Prakondisi: Reset ke 3 notifikasi contoh (minimal 2 notifikasi masuk)
    api_request("/user/1/reset", method="POST")

    driver.get(FRONTEND_URL)
    wait = WebDriverWait(driver, 10)

    bell_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Notifikasi']"))
    )
    bell_btn.click()

    dropdown = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "div[role='region'][aria-label='Dropdown daftar notifikasi']")
        )
    )
    dropdown_text = dropdown.text

    assert "Seteguk lagi sore ini?" in dropdown_text
    assert "Body Check pagi tersimpan" in dropdown_text
    assert "Hari ini • 18.25 WIB" in dropdown_text


# =====================================================================
# 3. TC-PBI12-003 (Baris 72): Klik 1 item notifikasi untuk menandai telah dibaca (Mark as Read)
# =====================================================================
def test_tc_pbi12_003_klik_satu_notifikasi_mark_as_read(driver):
    # Prakondisi: Terdapat 1 notifikasi berstatus unread (badge = 1)
    api_request("/user/1/reset", method="POST")

    driver.get(FRONTEND_URL)
    wait = WebDriverWait(driver, 10)

    badge_before = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='notification-badge']"))
    )
    assert badge_before.text.strip() == "1"

    # Buka dropdown dan klik notifikasi minum air ('Seteguk lagi sore ini?')
    bell_btn = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Notifikasi']")
    bell_btn.click()

    unread_item = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//div[@role='region']//button[contains(., 'Seteguk lagi sore ini?')]")
        )
    )
    unread_item.click()
    time.sleep(0.8)

    # Kembali ke halaman profil-pengingat untuk memverifikasi badge berkurang menjadi 0 (hilang)
    driver.get(FRONTEND_URL)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[aria-label='Notifikasi']")))
    time.sleep(0.5)

    badges_after = driver.find_elements(By.CSS_SELECTOR, "[data-testid='notification-badge']")
    assert len(badges_after) == 0, "Badge seharusnya hilang (0 unread) setelah item diklik"


# =====================================================================
# 4. TC-PBI12-004 (Baris 73): Menekan tombol 'Tandai Semua Telah Dibaca' (Mark All as Read)
# =====================================================================
def test_tc_pbi12_004_tandai_semua_telah_dibaca(driver):
    # Prakondisi: Terdapat 3 notifikasi unread di dropdown
    api_request("/user/1/clear", method="DELETE")
    for kategori, jam in [("sarapan", "07:30"), ("makan_siang", "12:30"), ("minum_air", "15:00")]:
        api_request(
            "/trigger",
            method="POST",
            payload={"id_user": 1, "kategori": kategori, "waktu_jadwal": jam},
        )

    driver.get(FRONTEND_URL)
    wait = WebDriverWait(driver, 10)

    badge = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='notification-badge']"))
    )
    assert badge.text.strip() == "3"

    # Buka dropdown notifikasi lalu klik 'Tandai Semua Telah Dibaca'
    bell_btn = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Notifikasi']")
    bell_btn.click()

    mark_all_btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(), 'Tandai Semua Telah Dibaca')]")
        )
    )
    mark_all_btn.click()
    time.sleep(0.6)

    badges_after = driver.find_elements(By.CSS_SELECTOR, "[data-testid='notification-badge']")
    assert len(badges_after) == 0, "Badge unread seharusnya hilang setelah Mark All as Read"


# =====================================================================
# 5. TC-PBI12-005 (Baris 74): Klik notifikasi Makan Siang otomatis redirect ke /jurnal-makanan
# =====================================================================
def test_tc_pbi12_005_klik_notifikasi_redirect_jurnal_makanan(driver):
    # Prakondisi: Ada notifikasi pengingat Makan Siang
    api_request("/user/1/clear", method="DELETE")
    api_request(
        "/trigger",
        method="POST",
        payload={"id_user": 1, "kategori": "makan_siang", "waktu_jadwal": "12:30"},
    )

    driver.get(FRONTEND_URL)
    wait = WebDriverWait(driver, 10)

    bell_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Notifikasi']"))
    )
    bell_btn.click()

    lunch_notif = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//div[@role='region']//button[contains(., 'Waktunya jeda makan siang')]")
        )
    )
    lunch_notif.click()

    wait.until(EC.url_contains("/jurnal-makanan"))
    assert "/jurnal-makanan" in driver.current_url

    # Kembalikan data contoh default setelah seluruh rangkaian pengujian selesai
    api_request("/user/1/reset", method="POST")