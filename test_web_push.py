import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "fitbite-backend"
SW_FILE_PATH = ROOT_DIR / "fitbite-frontend" / "public" / "sw.js"
BACKEND_VENV_PYTHON = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"

FRONTEND_URL = "http://localhost:5173/profil-pengingat"
API_BASE = "http://127.0.0.1:8000"

DEMO_EMAIL = "nadia.putri@email.com"
DEMO_PASSWORD = "Nadia123!"

_RESOLVED_BACKEND_PYTHON: str | None = None


def api_request(path: str, method: str = "GET", payload: dict | None = None):
    """Helper HTTP standar ke backend FastAPI."""
    url = f"{API_BASE}{path}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"} if data is not None else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8")
        try:
            parsed = json.loads(body) if body else {}
        except json.JSONDecodeError:
            parsed = {"detail": body}
        return err.code, parsed


def resolve_backend_python() -> str:
    """Memilih interpreter Python yang memiliki apscheduler & pywebpush (prioritas venv aktif)."""
    global _RESOLVED_BACKEND_PYTHON
    if _RESOLVED_BACKEND_PYTHON:
        return _RESOLVED_BACKEND_PYTHON

    candidates = [sys.executable]
    if BACKEND_VENV_PYTHON.exists():
        candidates.append(str(BACKEND_VENV_PYTHON))

    for candidate in candidates:
        probe = subprocess.run(
            [candidate, "-c", "import apscheduler, pywebpush, sqlalchemy"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if probe.returncode == 0:
            _RESOLVED_BACKEND_PYTHON = candidate
            return candidate

    _RESOLVED_BACKEND_PYTHON = sys.executable
    return sys.executable


def run_backend_check(code: str) -> str:
    """Menjalankan verifikasi modul internal backend (web_push.py / APScheduler)."""
    python_exec = resolve_backend_python()
    result = subprocess.run(
        [python_exec, "-c", code],
        cwd=str(BACKEND_DIR),
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 0, (
        f"Verifikasi backend gagal (interpreter: {python_exec}):\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    return result.stdout.strip()


def build_chrome_driver(allow_notifications: bool = True):
    """Membuat instance Chrome dengan izin notifikasi Allow (1) atau Block (2)."""
    options = Options()
    options.add_argument("--start-maximized")
    options.add_experimental_option(
        "prefs",
        {
            "profile.default_content_setting_values.notifications": (
                1 if allow_notifications else 2
            )
        },
    )
    return webdriver.Chrome(options=options)


def ensure_logged_in(driver, target_url: str = FRONTEND_URL):
    """
    Membuka halaman target. Jika dialihkan ke halaman login, otomatis mengisi
    kredensial akun demo Nadia Putri lalu masuk kembali ke /profil-pengingat.
    """
    driver.get(target_url)
    wait = WebDriverWait(driver, 15)

    # Tunggu halaman selesai render (baik halaman pengingat maupun form login)
    wait.until(
        lambda d: d.find_elements(By.CSS_SELECTOR, "input[type='password']")
        or d.find_elements(By.CSS_SELECTOR, "button[aria-label='Notifikasi']")
    )

    password_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
    if password_inputs:
        email_input = wait.until(
            EC.visibility_of_element_located(
                (
                    By.CSS_SELECTOR,
                    "input[type='email'], input[name='email'], input[placeholder*='email' i], input[type='text']",
                )
            )
        )
        password_input = password_inputs[0]

        email_input.clear()
        email_input.send_keys(DEMO_EMAIL)
        password_input.clear()
        password_input.send_keys(DEMO_PASSWORD)

        submit_btn = wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[@type='submit' or contains(., 'Masuk') or contains(., 'Login')]",
                )
            )
        )
        submit_btn.click()

        # Tunggu sampai keluar dari halaman login
        wait.until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "input[type='password']")) == 0
        )

        # Pastikan berada di halaman target (/profil-pengingat)
        if "/profil-pengingat" not in driver.current_url:
            driver.get(target_url)

    wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "button[aria-label='Notifikasi']")
        )
    )


@pytest.fixture
def driver():
    drv = build_chrome_driver(allow_notifications=True)
    yield drv
    drv.quit()


@pytest.fixture
def blocked_driver():
    drv = build_chrome_driver(allow_notifications=False)
    yield drv
    drv.quit()


# =============================================================================
# 1. TC-PBI23-001 (Positive): Izin Web Push Granted, Service Worker & push_subscription
# =============================================================================
def test_tc_pbi23_001_izin_push_service_worker_dan_subscription(driver):
    # 1. Pastikan file Service Worker /sw.js tersedia & valid
    assert SW_FILE_PATH.exists(), f"File /sw.js tidak ditemukan di {SW_FILE_PATH}"
    sw_text = SW_FILE_PATH.read_text(encoding="utf-8")
    assert 'addEventListener("push"' in sw_text
    assert "showNotification" in sw_text

    # 2. Login & buka halaman /profil-pengingat dengan izin notifikasi Granted
    ensure_logged_in(driver, FRONTEND_URL)
    wait = WebDriverWait(driver, 15)

    test_push_btn = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//button[contains(., 'Tes Web Push')]")
        )
    )
    assert test_push_btn.is_displayed()

    # 3. Verifikasi Notification.permission == 'granted' & Service Worker /sw.js aktif
    permission = driver.execute_script("return Notification.permission;")
    assert permission == "granted"

    sw_active = driver.execute_async_script(
        """
        const done = arguments[arguments.length - 1];
        navigator.serviceWorker.register('/sw.js')
          .then(() => navigator.serviceWorker.ready)
          .then((reg) => done(Boolean(reg && reg.active && reg.active.scriptURL.includes('/sw.js'))))
          .catch((err) => done('ERR:' + err.message));
        """
    )
    assert sw_active is True, f"Service Worker /sw.js belum aktif: {sw_active}"

    # 4. Verifikasi VAPID Public Key & penyimpanan push_subscription (JSONB) ke tabel users
    status_key, body_key = api_request("/api/push/vapid-public-key")
    assert status_key == 200
    assert body_key.get("status") == "success"
    assert len(body_key.get("public_key", "")) > 10

    output = run_backend_check(
        """
import json
from sqlalchemy import text
from app.database import SessionLocal
import app.services.web_push as wp

wp.ensure_push_subscription_column()
db = SessionLocal()
row = wp.resolve_user_record(db, 1)
assert row is not None
uid, original_sub = row[0], row[1]

dummy = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/fitbite-e2e-pbi23",
    "keys": {"p256dh": "BTestKeyPBI23", "auth": "TestAuthPBI23"},
}
try:
    db.execute(
        text("UPDATE users SET push_subscription = CAST(:sub AS JSONB) WHERE CAST(id_user AS TEXT) = :uid;"),
        {"sub": json.dumps(dummy), "uid": uid},
    )
    db.commit()
    db.expire_all()
    check_row = wp.resolve_user_record(db, 1)
    saved = json.loads(check_row[1]) if isinstance(check_row[1], str) else check_row[1]
    assert saved["endpoint"] == dummy["endpoint"]
    assert saved["keys"]["auth"] == "TestAuthPBI23"
    print("SUBSCRIBE_DB_OK")
finally:
    if original_sub is not None:
        orig_str = original_sub if isinstance(original_sub, str) else json.dumps(original_sub)
        db.execute(
            text("UPDATE users SET push_subscription = CAST(:sub AS JSONB) WHERE CAST(id_user AS TEXT) = :uid;"),
            {"sub": orig_str, "uid": uid},
        )
    else:
        db.execute(
            text("UPDATE users SET push_subscription = NULL WHERE CAST(id_user AS TEXT) = :uid;"),
            {"uid": uid},
        )
    db.commit()
    db.close()
"""
    )
    assert "SUBSCRIBE_DB_OK" in output
    time.sleep(1)


# =============================================================================
# 2. TC-PBI23-002 (Constraint/Security): Izin Ditolak -> Fallback In-App Notification
# =============================================================================
def test_tc_pbi23_002_izin_ditolak_fallback_in_app(blocked_driver):
    ensure_logged_in(blocked_driver, FRONTEND_URL)
    wait = WebDriverWait(blocked_driver, 15)

    # 1. Pastikan status izin browser 'denied' dan kotak peringatan tampil tanpa prompt agresif
    permission = blocked_driver.execute_script("return Notification.permission;")
    assert permission == "denied"

    blocked_banner = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//*[contains(text(), 'Notifikasi diblokir oleh browser')]")
        )
    )
    assert blocked_banner.is_displayed()

    # 2. Klik 'Simpan pengaturan' dan verifikasi saluran tersimpan sebagai 'in_app'
    save_btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Simpan pengaturan')]")
        )
    )
    save_btn.click()

    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//aside[@aria-live='polite']//*[contains(text(), 'Pengaturan Tersimpan')]")
        )
    )

    rem_status, rem_body = api_request("/api/reminders/1")
    assert rem_status == 200
    reminders = rem_body if isinstance(rem_body, list) else rem_body.get("data", [])
    assert len(reminders) > 0
    assert all(item.get("saluran") == "in_app" for item in reminders)

    # 3. Verifikasi fallback ke In-App Notification Center saat izin push ditolak
    trig_status, _ = api_request(
        "/api/notifications/trigger",
        method="POST",
        payload={"id_user": 1, "kategori": "evaluasi_malam", "waktu_jadwal": "20.00"},
    )
    assert trig_status in (200, 201)

    blocked_driver.refresh()
    bell_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Notifikasi']"))
    )
    bell_btn.click()

    dropdown = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "div[role='region'][aria-label='Dropdown daftar notifikasi']")
        )
    )
    assert "evaluasi" in dropdown.text.lower()
    time.sleep(1)


# =============================================================================
# 3. TC-PBI23-003 (Positive/Critical): APScheduler Kirim Web Push Tepat 20:00 WIB
# =============================================================================
def test_tc_pbi23_003_scheduler_kirim_web_push_tepat_waktu(driver):
    # 1. Simulasi APScheduler tepat pukul 20:00 WIB & verifikasi payload kirimWebPush() + tabel notification
    output = run_backend_check(
        """
import json
from datetime import datetime
from sqlalchemy import text
from app.database import SessionLocal
from app.models.notification import Notification
from app.models.reminder import SmartReminder
import app.services.web_push as wp

wp.ensure_push_subscription_column()
db = SessionLocal()
uid, original_sub = wp.resolve_user_record(db, 1)
max_notif_id = db.execute(text("SELECT COALESCE(MAX(id_notification), 0) FROM notification;")).scalar() or 0

rem = db.query(SmartReminder).filter(
    SmartReminder.id_user == 1, SmartReminder.jenis_pengingat == "evaluasi_malam"
).first()
orig_rem = (rem.waktu_jadwal, rem.saluran, rem.status_aktif) if rem else None

sent = []
orig_webpush = wp.webpush
orig_dt = wp.datetime

class FakeDT(datetime):
    @classmethod
    def now(cls, tz=None):
        return datetime(2026, 11, 23, 20, 0, 0, tzinfo=tz or wp.WIB)

def fake_webpush(subscription_info, data, vapid_private_key, vapid_claims, ttl):
    sent.append({"data": json.loads(data), "ttl": ttl})

try:
    dummy = {"endpoint": "https://fcm.googleapis.com/fcm/send/test-2000", "keys": {"p256dh": "k1", "auth": "a1"}}
    db.execute(
        text("UPDATE users SET push_subscription = CAST(:sub AS JSONB) WHERE CAST(id_user AS TEXT) = :uid;"),
        {"sub": json.dumps(dummy), "uid": uid},
    )
    if rem:
        rem.waktu_jadwal = "20.00"
        rem.saluran = "web_push"
        rem.status_aktif = True
    db.query(Notification).filter(
        Notification.id_user == 1,
        Notification.kategori == "evaluasi_malam",
        Notification.waktu_kirim == "Hari ini • 20.00 WIB",
    ).delete()
    db.commit()

    wp.webpush = fake_webpush
    wp.datetime = FakeDT
    wp.cek_dan_kirim_pengingat_terjadwal()

    eval_pushes = [p for p in sent if p["data"]["kategori"] == "evaluasi_malam"]
    assert len(eval_pushes) == 1
    assert eval_pushes[0]["data"]["title"] == "Waktunya evaluasi malam"
    assert eval_pushes[0]["data"]["url"] == "/jurnal-evaluasi"

    db.expire_all()
    saved_notif = db.query(Notification).filter(
        Notification.id_user == 1,
        Notification.kategori == "evaluasi_malam",
        Notification.waktu_kirim == "Hari ini • 20.00 WIB",
    ).first()
    assert saved_notif is not None and saved_notif.sudah_dibaca is False

    # Anti-duplikat: pemanggilan kedua di menit sama tidak mengirim ulang
    wp.cek_dan_kirim_pengingat_terjadwal()
    assert len([p for p in sent if p["data"]["kategori"] == "evaluasi_malam"]) == 1
    print("SCHEDULER_20_00_OK")
finally:
    wp.webpush = orig_webpush
    wp.datetime = orig_dt
    db.rollback()
    if original_sub is not None:
        orig_str = original_sub if isinstance(original_sub, str) else json.dumps(original_sub)
        db.execute(
            text("UPDATE users SET push_subscription = CAST(:sub AS JSONB) WHERE CAST(id_user AS TEXT) = :uid;"),
            {"sub": orig_str, "uid": uid},
        )
    else:
        db.execute(text("UPDATE users SET push_subscription = NULL WHERE CAST(id_user AS TEXT) = :uid;"), {"uid": uid})
    db.query(Notification).filter(Notification.id_notification > max_notif_id).delete()
    if rem and orig_rem:
        rem.waktu_jadwal, rem.saluran, rem.status_aktif = orig_rem
    db.commit()
    db.close()
"""
    )
    assert "SCHEDULER_20_00_OK" in output

    # 2. Verifikasi jadwal Evaluasi malam di UI, simulasi tab ditutup, lalu cek riwayat di lonceng
    ensure_logged_in(driver, FRONTEND_URL)
    wait = WebDriverWait(driver, 15)

    eval_input = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "input[aria-label='Waktu Evaluasi malam']")
        )
    )
    assert eval_input.is_displayed()

    test_btn = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//button[contains(., 'Tes Web Push')]")
        )
    )
    assert test_btn.is_displayed()

    # Simulasi tab FitBite ditutup saat jadwal 20:00 WIB terpicu di server
    driver.get("about:blank")
    trig_status, _ = api_request(
        "/api/notifications/trigger",
        method="POST",
        payload={"id_user": 1, "kategori": "evaluasi_malam", "waktu_jadwal": "20.00"},
    )
    assert trig_status in (200, 201)

    # Buka kembali FitBite dan pastikan riwayat pengingat tercatat di Notification Center
    driver.get(FRONTEND_URL)
    bell_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Notifikasi']"))
    )
    bell_btn.click()

    dropdown = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "div[role='region'][aria-label='Dropdown daftar notifikasi']")
        )
    )
    assert "evaluasi" in dropdown.text.lower()
    time.sleep(1)


# =============================================================================
# 4. TC-PBI23-004 (Navigation): Klik Notifikasi Redirect ke Halaman Tujuan
# =============================================================================
def test_tc_pbi23_004_klik_notifikasi_redirect_halaman_tujuan(driver):
    # 1. Verifikasi handler notificationclick di /sw.js mengarahkan ke URL tujuan
    sw_text = SW_FILE_PATH.read_text(encoding="utf-8")
    assert 'addEventListener("notificationclick"' in sw_text
    assert "event.notification.close()" in sw_text
    assert "client.navigate(targetUrl)" in sw_text
    assert "self.clients.openWindow(targetUrl)" in sw_text

    # 2. Verifikasi pemetaan tautan tujuan backend & redirect aktual di browser ke /jurnal-evaluasi
    output = run_backend_check(
        """
import app.services.web_push as wp
assert wp.PUSH_TEMPLATE_MAP["evaluasi_malam"]["tautan_tujuan"] == "/jurnal-evaluasi"
assert wp.PUSH_TEMPLATE_MAP["makan_siang"]["tautan_tujuan"] == "/jurnal-makanan"
assert wp.PUSH_TEMPLATE_MAP["minum_air"]["tautan_tujuan"] == "/aktivitas-hidrasi"
print("ROUTES_OK")
"""
    )
    assert "ROUTES_OK" in output

    api_request(
        "/api/notifications/trigger",
        method="POST",
        payload={"id_user": 1, "kategori": "evaluasi_malam", "waktu_jadwal": "20.00"},
    )

    ensure_logged_in(driver, FRONTEND_URL)
    wait = WebDriverWait(driver, 15)

    bell_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Notifikasi']"))
    )
    bell_btn.click()

    eval_notif = wait.until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//div[@role='region']//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'evaluasi')]",
            )
        )
    )
    eval_notif.click()

    wait.until(EC.url_contains("/jurnal-evaluasi"))
    assert "/jurnal-evaluasi" in driver.current_url
    time.sleep(1)


# =============================================================================
# 5. TC-PBI23-005 (Exception/Offline): Offline to Online & TTL Broker 3600s
# =============================================================================
def test_tc_pbi23_005_offline_resilience_dan_ttl_broker(driver):
    # 1. Verifikasi ttl=3600 pada kirimWebPush() & ketahanan scheduler saat koneksi offline
    output = run_backend_check(
        """
import json
from datetime import datetime
from sqlalchemy import text
from app.database import SessionLocal
from app.models.notification import Notification
from app.models.reminder import SmartReminder
import app.services.web_push as wp

captured = {}
orig_webpush = wp.webpush
orig_dt = wp.datetime

def fake_ok(subscription_info, data, vapid_private_key, vapid_claims, ttl):
    captured["ttl"] = ttl

wp.webpush = fake_ok
res = wp.kirimWebPush(
    subscription_info={"endpoint": "https://fcm.googleapis.com/fcm/send/ttl", "keys": {"p256dh": "k", "auth": "a"}},
    title="Tes Offline",
    body="Cek TTL",
    url="/jurnal-evaluasi",
    kategori="evaluasi_malam",
)
assert res["sent"] is True and captured["ttl"] == 3600

# Simulasi ConnectionError (offline) saat scheduler berjalan
db = SessionLocal()
uid, original_sub = wp.resolve_user_record(db, 1)
max_notif_id = db.execute(text("SELECT COALESCE(MAX(id_notification), 0) FROM notification;")).scalar() or 0
rem = db.query(SmartReminder).filter(
    SmartReminder.id_user == 1, SmartReminder.jenis_pengingat == "evaluasi_malam"
).first()
orig_rem = (rem.waktu_jadwal, rem.status_aktif) if rem else None

class FakeDT(datetime):
    @classmethod
    def now(cls, tz=None):
        return datetime(2026, 11, 23, 20, 0, 0, tzinfo=tz or wp.WIB)

def fake_offline(*args, **kwargs):
    raise ConnectionError("Simulasi offline")

try:
    if rem:
        rem.waktu_jadwal = "20.00"
        rem.status_aktif = True
    db.query(Notification).filter(
        Notification.id_user == 1,
        Notification.kategori == "evaluasi_malam",
        Notification.waktu_kirim == "Hari ini • 20.00 WIB",
    ).delete()
    db.commit()

    wp.webpush = fake_offline
    wp.datetime = FakeDT
    wp.cek_dan_kirim_pengingat_terjadwal()

    db.expire_all()
    notif = db.query(Notification).filter(
        Notification.id_user == 1,
        Notification.kategori == "evaluasi_malam",
        Notification.waktu_kirim == "Hari ini • 20.00 WIB",
    ).first()
    assert notif is not None
    print("OFFLINE_TTL_OK")
finally:
    wp.webpush = orig_webpush
    wp.datetime = orig_dt
    db.rollback()
    db.query(Notification).filter(Notification.id_notification > max_notif_id).delete()
    if rem and orig_rem:
        rem.waktu_jadwal, rem.status_aktif = orig_rem
    db.commit()
    db.close()
"""
    )
    assert "OFFLINE_TTL_OK" in output

    # 2. Simulasi transisi Offline -> Online di Chrome CDP lalu verifikasi In-App Notification tetap tersedia
    ensure_logged_in(driver, FRONTEND_URL)
    wait = WebDriverWait(driver, 15)
    driver.execute_cdp_cmd("Network.enable", {})
    driver.execute_cdp_cmd(
        "Network.emulateNetworkConditions",
        {"offline": True, "latency": 0, "downloadThroughput": 0, "uploadThroughput": 0},
    )
    time.sleep(1)

    driver.execute_cdp_cmd(
        "Network.emulateNetworkConditions",
        {"offline": False, "latency": 0, "downloadThroughput": -1, "uploadThroughput": -1},
    )
    driver.refresh()

    bell_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Notifikasi']"))
    )
    bell_btn.click()

    dropdown = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "div[role='region'][aria-label='Dropdown daftar notifikasi']")
        )
    )
    assert dropdown.is_displayed()
    time.sleep(1)


# =============================================================================
# 6. TC-PBI23-006 (Boundary Value): Batas Bawah (09:00) & Atas (21:00) Minum Air
# =============================================================================
def test_tc_pbi23_006_bva_batas_jam_operasional_minum_air(driver):
    # 1. Verifikasi UI menampilkan konfigurasi Minum air dengan interval 2 jam
    ensure_logged_in(driver, FRONTEND_URL)
    wait = WebDriverWait(driver, 15)
    water_input = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "input[aria-label='Waktu Minum air']")
        )
    )
    assert water_input.is_displayed()

    # 2. Verifikasi Boundary Value pada _is_schedule_due("minum_air", "2 jam", waktu_wib)
    output = run_backend_check(
        """
from datetime import datetime
import app.services.web_push as wp

cases = [
    (8, 0, False, "08:00 WIB (min-1)"),
    (9, 0, True, "09:00 WIB (Lower Boundary)"),
    (10, 0, False, "10:00 WIB (luar kelipatan 2 jam)"),
    (11, 0, True, "11:00 WIB (interval valid)"),
    (21, 0, True, "21:00 WIB (Upper Boundary)"),
    (22, 0, False, "22:00 WIB (max+1)"),
]
for jam, menit, expected, label in cases:
    waktu = datetime(2026, 11, 23, jam, menit, 0, tzinfo=wp.WIB)
    actual = wp._is_schedule_due("minum_air", "2 jam", waktu)
    assert actual is expected, f"Gagal pada {label}: expected={expected}, actual={actual}"
print("BVA_MINUM_AIR_OK")
"""
    )
    assert "BVA_MINUM_AIR_OK" in output
    time.sleep(1)