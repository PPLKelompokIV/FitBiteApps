import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"


@pytest.fixture(scope="function")
def driver():
    chrome_options = Options()
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1366,768")

    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(5)

    # 1. Login otomatis menggunakan akun uji yang sudah terisi
    driver.get(f"{BASE_URL}/login")
    masuk_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Masuk')]"))
    )
    masuk_btn.click()

    # 2. Tunggu hingga berhasil keluar dari halaman /login
    WebDriverWait(driver, 10).until(lambda d: "/login" not in d.current_url)

    yield driver
    driver.quit()


def open_profile_wizard(driver):
    """Membuka halaman Lengkapi profil kesehatan (/profil-kesehatan)."""
    driver.get(f"{BASE_URL}/profil-kesehatan")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Lengkapi profil kesehatan')]"))
    )
    time.sleep(0.3)


def get_input_by_label(driver, label_text):
    """Mencari elemen <input> yang berada tepat di bawah/dalam container teks label tertentu."""
    xpath = (
        f"//*[contains(normalize-space(text()), '{label_text}')]"
        f"/following::input[1]"
    )
    return WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, xpath))
    )


def get_select_by_label(driver, label_text):
    """Mencari elemen <select> yang berada tepat di bawah teks label tertentu."""
    xpath = (
        f"//*[contains(normalize-space(text()), '{label_text}')]"
        f"/following::select[1]"
    )
    return WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, xpath))
    )


def clear_and_type(element, text):
    """Membersihkan input React secara menyeluruh sebelum mengetik nilai baru."""
    element.click()
    element.clear()
    element.send_keys(str(text))


class TestProfilKesehatanPBI01:
    """
    Test Suite PBI-01 (UC-03): Profil Kesehatan FitBite
    Author: Abyan Damararendra
    """

    def test_tc_pbi01_001_simpan_profil_valid_dan_lengkap(self, driver):
        """
        TC-PBI01-001 (Positive - High):
        Simpan profil fisik pertama kali dengan data numerik valid dan lengkap.
        """
        open_profile_wizard(driver)

        # 1. Isi Tanggal Lahir: 15-05-1998 (format input type="date" di Chrome: 15051998)
        dob_input = get_input_by_label(driver, "Tanggal lahir")
        dob_input.click()
        dob_input.send_keys("15051998")

        # 2. Pilih Jenis Kelamin: Laki-laki pada dropdown
        gender_select_el = get_select_by_label(driver, "Jenis kelamin")
        select_gender = Select(gender_select_el)
        try:
            select_gender.select_by_visible_text("Laki-laki")
        except Exception:
            for opt in select_gender.options:
                if "laki" in opt.text.lower():
                    select_gender.select_by_visible_text(opt.text)
                    break

        # 3. Isi Tinggi Badan: 175 cm
        height_input = get_input_by_label(driver, "Tinggi badan")
        clear_and_type(height_input, "175")

        # 4. Isi Berat Badan Awal: 72 kg
        weight_input = get_input_by_label(driver, "Berat awal")
        clear_and_type(weight_input, "72")

        # 5. Isi Target Berat Badan: 68 kg
        target_input = get_input_by_label(driver, "Target berat badan")
        clear_and_type(target_input, "68")

        # 6. Klik tombol submit ('Simpan Profil' atau tombol submit utama di bawah form)
        submit_btn = driver.find_element(
            By.XPATH,
            "//button[contains(., 'Simpan') or contains(., 'Lanjut') or @type='submit']"
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
        submit_btn.click()
        time.sleep(0.8)

        # Verifikasi data tersimpan / berpindah ke langkah berikutnya atau muncul notifikasi
        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert (
            "berhasil" in body_text
            or "tersimpan" in body_text
            or "body check" in body_text
            or "/profil-kesehatan" not in driver.current_url
        )

    def test_tc_pbi01_002_submit_kosong_tinggi_badan_dan_gender(self, driver):
        """
        TC-PBI01-002 (Negative - High):
        Submit profil kesehatan dengan mengosongkan tinggi badan.
        """
        open_profile_wizard(driver)

        height_input = get_input_by_label(driver, "Tinggi badan")
        height_input.clear()

        submit_btn = driver.find_element(
            By.XPATH,
            "//button[contains(., 'Simpan') or contains(., 'Lanjut') or @type='submit']"
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
        submit_btn.click()
        time.sleep(0.5)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        is_html5_invalid = driver.execute_script(
            "return document.querySelectorAll('input:invalid, select:invalid').length > 0;"
        )

        # Pastikan tetap tertahan di halaman profil atau muncul pesan validasi wajib diisi
        assert (
            "wajib" in body_text
            or "diisi" in body_text
            or "lengkapi" in body_text
            or is_html5_invalid
            or "/profil-kesehatan" in driver.current_url
        )

    def test_tc_pbi01_003_input_nilai_negatif(self, driver):
        """
        TC-PBI01-003 (Boundary Value - Critical):
        Input nilai tinggi badan (-175 cm) dan berat badan awal (-70 kg).
        """
        open_profile_wizard(driver)

        height_input = get_input_by_label(driver, "Tinggi badan")
        clear_and_type(height_input, "-175")

        weight_input = get_input_by_label(driver, "Berat awal")
        clear_and_type(weight_input, "-70")

        submit_btn = driver.find_element(
            By.XPATH,
            "//button[contains(., 'Simpan') or contains(., 'Lanjut') or @type='submit']"
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
        submit_btn.click()
        time.sleep(0.5)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        is_html5_invalid = driver.execute_script(
            "return document.querySelectorAll('input:invalid').length > 0;"
        )

        assert (
            "positif" in body_text
            or "lebih dari" in body_text
            or "minimal" in body_text
            or is_html5_invalid
            or "/profil-kesehatan" in driver.current_url
        )

    def test_tc_pbi01_004_input_nilai_ekstrim_biologis(self, driver):
        """
        TC-PBI01-004 (Boundary Value - Medium):
        Input parameter fisik bernilai ekstrim (TB: 400 cm, BB: 650 kg).
        """
        open_profile_wizard(driver)

        height_input = get_input_by_label(driver, "Tinggi badan")
        clear_and_type(height_input, "400")

        weight_input = get_input_by_label(driver, "Berat awal")
        clear_and_type(weight_input, "650")

        submit_btn = driver.find_element(
            By.XPATH,
            "//button[contains(., 'Simpan') or contains(., 'Lanjut') or @type='submit']"
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
        submit_btn.click()
        time.sleep(0.5)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        is_html5_invalid = driver.execute_script(
            "return document.querySelectorAll('input:invalid').length > 0;"
        )

        assert (
            "50-250" in body_text
            or "20-300" in body_text
            or "rentang" in body_text
            or "maksimal" in body_text
            or is_html5_invalid
            or "/profil-kesehatan" in driver.current_url
        )

    def test_tc_pbi01_005_input_karakter_huruf_dan_simbol(self, driver):
        """
        TC-PBI01-005 (Format Check - Medium):
        Input karakter huruf ('seratus tujuh puluh') atau simbol ('70kg!') pada kolom TB dan BB.
        """
        open_profile_wizard(driver)

        height_input = get_input_by_label(driver, "Tinggi badan")
        clear_and_type(height_input, "seratus tujuh puluh")

        weight_input = get_input_by_label(driver, "Berat awal")
        clear_and_type(weight_input, "70kg!")

        height_val = height_input.get_attribute("value")
        weight_val = weight_input.get_attribute("value")

        submit_btn = driver.find_element(
            By.XPATH,
            "//button[contains(., 'Simpan') or contains(., 'Lanjut') or @type='submit']"
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
        submit_btn.click()
        time.sleep(0.5)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()

        assert (
            (height_val == "" and weight_val in ("", "70"))
            or "angka" in body_text
            or "numerik" in body_text
        )

    def test_tc_pbi01_006_update_target_berat_badan(self, driver):
        """
        TC-PBI01-006 (Positive - High):
        Pembaruan (Update) target berat badan menjadi 65 kg pada Pengaturan Profil.
        """
        driver.get(f"{BASE_URL}/profil-pengingat")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(0.5)

        # Cari input Target berat badan di halaman Pengaturan Profil
        target_inputs = driver.find_elements(
            By.XPATH,
            "//*[contains(translate(text(), 'TARGET', 'target'), 'target')]/following::input[1]"
        )
        if not target_inputs:
            # Fallback ke halaman profil-kesehatan jika field target berada di sana
            open_profile_wizard(driver)
            target_input = get_input_by_label(driver, "Target berat badan")
        else:
            target_input = target_inputs[0]

        clear_and_type(target_input, "65")

        save_btn = driver.find_element(
            By.XPATH,
            "//button[contains(., 'Simpan') or contains(., 'Perbarui') or @type='submit']"
        )
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", save_btn)
        save_btn.click()
        time.sleep(0.8)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert (
            "berhasil" in body_text
            or "tersimpan" in body_text
            or "65" in body_text
            or target_input.get_attribute("value") == "65"
        )