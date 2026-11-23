import json
import time
import urllib.error
import urllib.parse
import urllib.request

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

FRONTEND_BASE = "http://localhost:5173"
API_BASE = "http://127.0.0.1:8000"

ADMIN_EMAIL = "admin@fitbite.com"
ADMIN_PASSWORD = "Admin123!"

USER_EMAIL = "nadia.putri@email.com"
USER_PASSWORD = "Nadia123!"

SITI_EMAIL = "siti@fitbite.com"
SITI_PASSWORD = "Siti123!"

BUDI_EMAIL = "budi@fitbite.com"

FORBIDDEN_PRIVACY_FIELDS = {
    "password_hash",
    "password",
    "tanggal_lahir",
    "jenis_kelamin",
    "tinggi_badan_cm",
    "berat_badan_awal_kg",
    "target_berat_badan_kg",
    "web_push_subscription",
    "push_subscription",
    "food_log",
    "morning_checkin",
    "activity_log",
    "hydration_log",
    "daily_evaluation",
}


def api_request(
    path: str,
    method: str = "GET",
    payload: dict | None = None,
    token: str | None = None,
):
    """Helper HTTP standar ke backend FastAPI dengan dukungan Bearer JWT."""
    url = f"{API_BASE}{path}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {}
    if data is not None:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"

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


def api_login(email: str, password: str) -> tuple[int, dict]:
    return api_request(
        "/api/auth/login",
        method="POST",
        payload={"email": email, "password": password},
    )


def get_token_for(email: str, password: str) -> str:
    status, body = api_login(email, password)
    assert status == 200, f"Gagal login API untuk {email}: {status} - {body}"
    return body["token"]


def clear_and_type(element, text: str):
    """Membersihkan input terkontrol React secara andal lalu mengetik teks baru."""
    element.click()
    element.send_keys(Keys.CONTROL, "a")
    element.send_keys(Keys.BACKSPACE)
    if text:
        element.send_keys(text)


def login_via_ui(driver, email: str, password: str, expect_success: bool = True):
    """Login melalui form /login di browser Chrome."""
    driver.get(f"{FRONTEND_BASE}/login")
    driver.execute_script("localStorage.clear(); sessionStorage.clear();")
    driver.get(f"{FRONTEND_BASE}/login")

    wait = WebDriverWait(driver, 15)
    email_input = wait.until(
        EC.visibility_of_element_located(
            (
                By.CSS_SELECTOR,
                "input[type='email'], input[name='email'], input[placeholder*='email' i], input[type='text']",
            )
        )
    )
    password_input = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='password']"))
    )

    clear_and_type(email_input, email)
    clear_and_type(password_input, password)

    submit_btn = wait.until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//button[@type='submit' or contains(., 'Masuk') or contains(., 'Login')]",
            )
        )
    )
    submit_btn.click()

    if expect_success:
        wait.until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "input[type='password']")) == 0
        )


def wait_for_admin_table_loaded(driver, timeout: int = 15):
    wait = WebDriverWait(driver, timeout)
    wait.until(EC.visibility_of_element_located((By.ID, "admin-user-search")))
    wait.until(
        lambda d: len(d.find_elements(By.CSS_SELECTOR, "table tbody tr")) > 0
        or len(d.find_elements(By.CSS_SELECTOR, "[data-testid='empty-user-state']")) > 0
    )


@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--start-maximized")
    drv = webdriver.Chrome(options=options)
    yield drv
    drv.quit()


# =============================================================================
# 1. TC-PBI24-001 (Positive): Admin Melihat Daftar & Ringkasan Akun Pengguna
# =============================================================================
def test_tc_pbi24_001_admin_melihat_daftar_dan_ringkasan_akun(driver):
    login_via_ui(driver, ADMIN_EMAIL, ADMIN_PASSWORD)
    wait = WebDriverWait(driver, 15)

    wait.until(EC.url_contains("/admin/pantau"))
    wait_for_admin_table_loaded(driver)

    # Verifikasi kartu ringkasan tampil
    summary_cards = wait.until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "div[aria-label='Ringkasan pengelolaan']")
        )
    )
    assert "Akun pengguna" in summary_cards.text

    # Verifikasi kolom header tabel sesuai spesifikasi
    headers_text = [
        th.text.strip().upper()
        for th in driver.find_elements(By.CSS_SELECTOR, "table thead th")
    ]
    for expected_col in ["ID AKUN", "NAMA / EMAIL", "DIBUAT", "AKSES TERAKHIR", "STATUS", "RINCIAN"]:
        assert expected_col in headers_text, f"Kolom {expected_col} tidak ditemukan: {headers_text}"

    # Verifikasi baris data pengguna & paginasi tampil
    rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
    assert len(rows) >= 1, "Tabel akun kosong."
    assert "Halaman 1 /" in driver.page_source
    assert "Menampilkan 1–" in driver.page_source

    # Verifikasi sinkronisasi jumlah data dengan API backend
    admin_token = get_token_for(ADMIN_EMAIL, ADMIN_PASSWORD)
    status_code, body = api_request("/api/admin/users?page=1&limit=10", token=admin_token)
    assert status_code == 200
    assert body["summary"]["total_users"] >= len(rows)
    time.sleep(1)


# =============================================================================
# 2. TC-PBI24-002 (Positive): Pencarian Akun Berdasarkan Nama / Email
# =============================================================================
def test_tc_pbi24_002_pencarian_akun_berdasarkan_email(driver):
    login_via_ui(driver, ADMIN_EMAIL, ADMIN_PASSWORD)
    wait = WebDriverWait(driver, 15)

    wait.until(EC.url_contains("/admin/pantau"))
    wait_for_admin_table_loaded(driver)

    search_input = wait.until(EC.visibility_of_element_located((By.ID, "admin-user-search")))
    clear_and_type(search_input, BUDI_EMAIL)
    search_input.send_keys(Keys.ENTER)

    # Tunggu sampai hasil filter hanya menampilkan Budi Santoso
    wait.until(
        lambda d: len(d.find_elements(By.CSS_SELECTOR, "table tbody tr")) == 1
        and BUDI_EMAIL in d.find_element(By.CSS_SELECTOR, "table tbody").text.lower()
    )

    rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
    assert len(rows) == 1
    assert "Budi Santoso" in rows[0].text
    assert BUDI_EMAIL in rows[0].text.lower()
    time.sleep(1)


# =============================================================================
# 3. TC-PBI24-003 (Security / Privacy - NFR-03): Isolasi Data Kesehatan Pribadi
# =============================================================================
def test_tc_pbi24_003_isolasi_privasi_data_kesehatan_nfr03(driver):
    login_via_ui(driver, ADMIN_EMAIL, ADMIN_PASSWORD)
    wait = WebDriverWait(driver, 15)

    wait.until(EC.url_contains("/admin/pantau"))
    wait_for_admin_table_loaded(driver)

    # 1. Buka Modal Ringkasan Status Akun untuk Nadia Putri
    lihat_btn = wait.until(
        EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "button[aria-label='Lihat ringkasan Nadia Putri']")
        )
    )
    lihat_btn.click()

    modal = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "div[role='dialog']"))
    )
    modal_text = modal.text

    # Pastikan hanya metadata dasar + pemberitahuan privasi NFR-03 yang tampil
    assert "Ringkasan Status Akun" in modal_text
    assert "Nadia Putri" in modal_text
    assert USER_EMAIL in modal_text
    assert "Isolasi privasi NFR-03 aktif" in modal_text

    # Pastikan label data medis / berat / tinggi / kalori tidak tampil di daftar <dt>
    dt_labels = [
        dt.text.strip().lower()
        for dt in modal.find_elements(By.CSS_SELECTOR, "dl dt")
    ]
    for forbidden_label in ["berat badan", "tinggi badan", "kalori", "jurnal makan", "tanggal lahir"]:
        assert all(forbidden_label not in lbl for lbl in dt_labels), (
            f"Atribut kesehatan pribadi bocor di modal: {dt_labels}"
        )

    # 2. Verifikasi payload API backend bebas dari seluruh field sensitif / kesehatan pribadi
    admin_token = get_token_for(ADMIN_EMAIL, ADMIN_PASSWORD)
    list_status, list_body = api_request("/api/admin/users?search=nadia.putri@email.com", token=admin_token)
    assert list_status == 200
    assert len(list_body["data"]) >= 1
    nadia_item = list_body["data"][0]

    leaked_list_keys = FORBIDDEN_PRIVACY_FIELDS.intersection(nadia_item.keys())
    assert not leaked_list_keys, f"Field sensitif bocor di GET /api/admin/users: {leaked_list_keys}"

    detail_status, detail_body = api_request(
        f"/api/admin/users/{urllib.parse.quote(nadia_item['id_user'])}",
        token=admin_token,
    )
    assert detail_status == 200
    leaked_detail_keys = FORBIDDEN_PRIVACY_FIELDS.intersection(detail_body["data"].keys())
    assert not leaked_detail_keys, f"Field sensitif bocor di GET /api/admin/users/{{id}}: {leaked_detail_keys}"

    time.sleep(1)
    close_btn = modal.find_element(By.CSS_SELECTOR, "button[aria-label='Tutup modal ringkasan akun']")
    close_btn.click()


# =============================================================================
# 4. TC-PBI24-004 (Positive): Admin Menonaktifkan (Suspend) & Mengaktifkan Akun
# =============================================================================
def test_tc_pbi24_004_suspend_dan_aktifkan_kembali_akun(driver):
    admin_token = get_token_for(ADMIN_EMAIL, ADMIN_PASSWORD)

    # Ambil UUID Siti & pastikan awalnya dalam status 'active'
    status_find, body_find = api_request(
        f"/api/admin/users?search={urllib.parse.quote(SITI_EMAIL)}",
        token=admin_token,
    )
    assert status_find == 200 and len(body_find["data"]) >= 1, "Akun siti@fitbite.com tidak ditemukan."
    siti_id = body_find["data"][0]["id_user"]

    api_request(
        f"/api/admin/users/{siti_id}/status",
        method="PATCH",
        payload={"status_akun": "active"},
        token=admin_token,
    )

    try:
        # 1. Login sebagai Admin & cari Siti Rahma
        login_via_ui(driver, ADMIN_EMAIL, ADMIN_PASSWORD)
        wait = WebDriverWait(driver, 15)
        wait.until(EC.url_contains("/admin/pantau"))
        wait_for_admin_table_loaded(driver)

        search_input = wait.until(EC.visibility_of_element_located((By.ID, "admin-user-search")))
        clear_and_type(search_input, SITI_EMAIL)

        wait.until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "table tbody tr")) == 1
            and SITI_EMAIL in d.find_element(By.CSS_SELECTOR, "table tbody").text.lower()
        )
        driver.find_element(By.CSS_SELECTOR, "table tbody tr").click()

        # 2. Klik 'Nonaktifkan Akun' & konfirmasi pada popup modal
        suspend_btn = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//aside//button[contains(., 'Nonaktifkan Akun')]")
            )
        )
        suspend_btn.click()

        confirm_dialog = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "div[role='alertdialog']"))
        )
        assert "Konfirmasi Nonaktifkan Akun" in confirm_dialog.text
        confirm_dialog.find_element(By.XPATH, ".//button[contains(., 'Ya, Nonaktifkan')]").click()

        # Tunggu toast sukses & badge status berubah menjadi 'Nonaktif'
        wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//aside[@aria-live='polite']//*[contains(text(), 'berhasil dinonaktifkan')]")
            )
        )
        wait.until(
            lambda d: "Nonaktif" in d.find_element(By.CSS_SELECTOR, "table tbody tr").text
        )
        time.sleep(1)

        # 3. Uji login memakai akun Siti -> harus ditolak (403) + pesan blokir tampil di UI
        login_status, login_body = api_login(SITI_EMAIL, SITI_PASSWORD)
        assert login_status == 403
        assert "Akun Anda dinonaktifkan oleh administrator" in login_body.get("detail", "")

        login_via_ui(driver, SITI_EMAIL, SITI_PASSWORD, expect_success=False)
        wait.until(
            lambda d: "dinonaktifkan oleh administrator" in d.page_source.lower()
        )
        assert "/login" in driver.current_url
        time.sleep(1)

        # 4. Login kembali sebagai Admin & aktifkan kembali akun Siti
        login_via_ui(driver, ADMIN_EMAIL, ADMIN_PASSWORD)
        wait.until(EC.url_contains("/admin/pantau"))
        wait_for_admin_table_loaded(driver)

        search_input = wait.until(EC.visibility_of_element_located((By.ID, "admin-user-search")))
        clear_and_type(search_input, SITI_EMAIL)
        wait.until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, "table tbody tr")) == 1
            and "Nonaktif" in d.find_element(By.CSS_SELECTOR, "table tbody tr").text
        )
        driver.find_element(By.CSS_SELECTOR, "table tbody tr").click()

        activate_btn = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//aside//button[contains(., 'Aktifkan Akun')]")
            )
        )
        activate_btn.click()

        confirm_activate = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "div[role='alertdialog']"))
        )
        confirm_activate.find_element(By.XPATH, ".//button[contains(., 'Ya, Aktifkan')]").click()

        wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//aside[@aria-live='polite']//*[contains(text(), 'berhasil diaktifkan kembali')]")
            )
        )
        wait.until(
            lambda d: "Aktif" in d.find_element(By.CSS_SELECTOR, "table tbody tr").text
            and "Nonaktif" not in d.find_element(By.CSS_SELECTOR, "table tbody tr").text
        )

        # Pastikan Siti dapat login kembali secara normal
        relogin_status, _ = api_login(SITI_EMAIL, SITI_PASSWORD)
        assert relogin_status == 200
        time.sleep(1)
    finally:
        # Jaga agar akun Siti selalu kembali aktif meski terjadi error di tengah tes
        api_request(
            f"/api/admin/users/{siti_id}/status",
            method="PATCH",
            payload={"status_akun": "active"},
            token=admin_token,
        )


# =============================================================================
# 5. TC-PBI24-005 (Security / RBAC): Pengguna Biasa Diblokir dari Halaman & API Admin
# =============================================================================
def test_tc_pbi24_005_user_biasa_diblokir_akses_admin(driver):
    # 1. Login sebagai pengguna biasa (role: 'user')
    login_via_ui(driver, USER_EMAIL, USER_PASSWORD)
    wait = WebDriverWait(driver, 15)
    wait.until(EC.url_contains("/bodycheckpagi"))

    # 2. Coba akses langsung URL /admin/users via address bar
    driver.get(f"{FRONTEND_BASE}/admin/users")

    # Harus di-redirect kembali ke /bodycheckpagi & memunculkan alert akses ditolak
    wait.until(EC.url_contains("/bodycheckpagi"))
    alert_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "div[role='alert']"))
    )
    assert "Akses ditolak: Halaman khusus Administrator" in alert_box.text

    # 3. Verifikasi proteksi backend API menolak JWT milik user biasa dengan 403 Forbidden
    user_token = get_token_for(USER_EMAIL, USER_PASSWORD)
    api_status, api_body = api_request("/api/admin/users", token=user_token)
    assert api_status == 403
    assert "Akses ditolak: Halaman khusus Administrator" in api_body.get("detail", "")

    # Verifikasi tanpa token ditolak dengan 401 Unauthorized
    unauth_status, _ = api_request("/api/admin/users")
    assert unauth_status == 401
    time.sleep(1)


# =============================================================================
# 6. TC-PBI24-006 (Boundary Value): Batas Paginasi API & Empty State 0 Akun
# =============================================================================
def test_tc_pbi24_006_bva_paginasi_dan_empty_state(driver):
    admin_token = get_token_for(ADMIN_EMAIL, ADMIN_PASSWORD)

    # 1. Boundary Value Analysis pada parameter paginasi GET /api/admin/users
    # Batas bawah valid: page=1, limit=1
    st_min, body_min = api_request("/api/admin/users?page=1&limit=1", token=admin_token)
    assert st_min == 200
    assert len(body_min["data"]) == 1
    assert body_min["pagination"]["page"] == 1
    assert body_min["pagination"]["limit"] == 1

    # Batas atas valid: page=1, limit=50
    st_max, body_max = api_request("/api/admin/users?page=1&limit=50", token=admin_token)
    assert st_max == 200
    assert body_max["pagination"]["limit"] == 50
    assert len(body_max["data"]) <= 50

    # Di luar batas bawah & atas (min-1 dan max+1) -> 422 Unprocessable Entity
    st_page_zero, _ = api_request("/api/admin/users?page=0&limit=10", token=admin_token)
    assert st_page_zero == 422

    st_limit_zero, _ = api_request("/api/admin/users?page=1&limit=0", token=admin_token)
    assert st_limit_zero == 422

    st_limit_over, _ = api_request("/api/admin/users?page=1&limit=51", token=admin_token)
    assert st_limit_over == 422

    # 2. Batas bawah pencarian 0 hasil (Empty State) di UI
    login_via_ui(driver, ADMIN_EMAIL, ADMIN_PASSWORD)
    wait = WebDriverWait(driver, 15)
    wait.until(EC.url_contains("/admin/pantau"))
    wait_for_admin_table_loaded(driver)

    search_input = wait.until(EC.visibility_of_element_located((By.ID, "admin-user-search")))
    clear_and_type(search_input, "akun.tidakada@email.com")

    empty_state = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='empty-user-state']"))
    )
    assert "Akun pengguna tidak ditemukan" in empty_state.text
    assert "Menampilkan 0 akun" in driver.page_source
    time.sleep(1)

    # Klik 'Reset pencarian' dan pastikan daftar akun kembali tampil
    reset_btn = empty_state.find_element(By.XPATH, ".//button[contains(., 'Reset pencarian')]")
    reset_btn.click()

    wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, "table tbody tr")) >= 1)
    time.sleep(1)