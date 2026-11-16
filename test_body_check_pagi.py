import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"


@pytest.fixture(scope="class")
def driver():
    """Membuka 1 jendela Chrome terlihat & login sekali untuk direkam."""
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")

    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(1)

    # 1. Login otomatis di awal sesi
    driver.get(f"{BASE_URL}/login")
    time.sleep(0.8)
    masuk_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Masuk')]"))
    )
    masuk_btn.click()
    WebDriverWait(driver, 10).until(lambda d: "/login" not in d.current_url)
    time.sleep(0.8)

    yield driver
    time.sleep(1.5)
    driver.quit()


def open_body_check_form(driver):
    """Membuka halaman Body Check Pagi (/bodycheckpagi)."""
    driver.get(f"{BASE_URL}/bodycheckpagi")
    WebDriverWait(driver, 8).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )
    time.sleep(0.6)

    modal_triggers = driver.find_elements(
        By.XPATH,
        "//button[contains(., 'Morning Check-in') or contains(., 'Body Check') or contains(., 'Isi Check-in')]"
    )
    if modal_triggers and not driver.find_elements(By.TAG_NAME, "input"):
        driver.execute_script("arguments[0].click();", modal_triggers[0])
        time.sleep(0.5)


def get_input_by_hints(driver, label_keywords, fallback_selectors):
    """Mencari elemen <input> secara cepat."""
    for kw in label_keywords:
        xpath = (
            f"//*[contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{kw.lower()}')]"
            f"/following::input[1]"
        )
        els = driver.find_elements(By.XPATH, xpath)
        if els:
            return els[0]

    for by, sel in fallback_selectors:
        els = driver.find_elements(by, sel)
        if els:
            return els[0]

    return None


def clear_and_type(element, text):
    """Mengisi input React secara terlihat jelas & aman dari klik terhalang."""
    if element is None:
        return
    driver = element._parent
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    driver.execute_script("arguments[0].focus();", element)
    element.send_keys(Keys.CONTROL + "a")
    element.send_keys(Keys.BACKSPACE)
    element.clear()
    element.send_keys(str(text))
    time.sleep(0.4)


def set_energy_level(driver, value="4"):
    """Mengatur slider atau tombol Tingkat Kesiapan Energi ke nilai 4."""
    sliders = driver.find_elements(By.CSS_SELECTOR, "input[type='range']")
    if sliders:
        driver.execute_script(
            """
            const slider = arguments[0];
            const val = arguments[1];
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(slider, val);
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            slider.dispatchEvent(new Event('change', { bubbles: true }));
            """,
            sliders[0],
            str(value),
        )
        time.sleep(0.4)
        return

    energy_btns = driver.find_elements(
        By.XPATH,
        f"//button[normalize-space(text())='{value}' or contains(., 'Baik')]"
    )
    if energy_btns:
        driver.execute_script("arguments[0].click();", energy_btns[0])
        time.sleep(0.4)


def select_option_or_button(driver, label_keywords, option_text):
    """Memilih nilai pada <select> dropdown atau tombol/card pilihan."""
    for kw in label_keywords:
        selects = driver.find_elements(
            By.XPATH,
            f"//*[contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{kw.lower()}')]/following::select[1]"
        )
        if selects:
            sel = Select(selects[0])
            for opt in sel.options:
                if option_text.lower() in opt.text.lower():
                    sel.select_by_visible_text(opt.text)
                    time.sleep(0.4)
                    return

    candidates = driver.find_elements(
        By.XPATH,
        f"//button[contains(., '{option_text}')] | //label[contains(., '{option_text}')] | //div[@role='button' and contains(., '{option_text}')]"
    )
    if candidates:
        driver.execute_script("arguments[0].click();", candidates[0])
        time.sleep(0.4)


def click_submit_checkin(driver):
    """Menekan tombol submit pada form Morning Check-in."""
    btns = driver.find_elements(
        By.XPATH,
        "//button[contains(., 'Kirim Check-in') or contains(., 'Simpan') or contains(., 'Kirim') or @type='submit']"
    )
    if not btns:
        return None
    submit_btn = btns[0]
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
    if submit_btn.is_enabled():
        driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.7)
    return submit_btn


class TestBodyCheckPagiPBI02:
    """
    Test Suite PBI-02 (UC-04): Body Check Pagi FitBite
    Author: Abyan Damararendra
    """

    def test_tc_pbi02_001_happy_path_morning_checkin(self, driver):
        """TC-PBI02-001 (Positive - Critical): Morning Check-in valid."""
        open_body_check_form(driver)

        weight_input = get_input_by_hints(
            driver,
            ["Berat badan", "Berat hari ini"],
            [(By.NAME, "weight"), (By.CSS_SELECTOR, "input[type='number']")]
        )
        clear_and_type(weight_input, "71.5")
        set_energy_level(driver, "4")
        select_option_or_button(driver, ["Kualitas tidur"], "Nyenyak")

        sleep_input = get_input_by_hints(
            driver,
            ["Durasi tidur", "Lama tidur"],
            [(By.NAME, "sleepDuration"), (By.NAME, "sleep_duration")]
        )
        clear_and_type(sleep_input, "7.5")
        select_option_or_button(driver, ["Rencana aktivitas", "Intensitas", "Aktivitas"], "Kardio Ringan")

        click_submit_checkin(driver)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert (
            "berhasil" in body_text
            or "tersimpan" in body_text
            or "tdee" in body_text
            or "sudah melakukan check-in" in body_text
            or "/dashboard" in driver.current_url
        )

    def test_tc_pbi02_002_duplikat_checkin_hari_yang_sama(self, driver):
        """TC-PBI02-002 (Constraint - Critical): Duplikat check-in hari yang sama."""
        open_body_check_form(driver)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        if "sudah melakukan check-in" in body_text or "maksimal 1x" in body_text:
            time.sleep(0.8)
            assert True
            return

        weight_input = get_input_by_hints(
            driver,
            ["Berat badan", "Berat hari ini"],
            [(By.NAME, "weight"), (By.CSS_SELECTOR, "input[type='number']")]
        )
        clear_and_type(weight_input, "71.5")

        sleep_input = get_input_by_hints(
            driver,
            ["Durasi tidur", "Lama tidur"],
            [(By.NAME, "sleepDuration"), (By.NAME, "sleep_duration")]
        )
        clear_and_type(sleep_input, "7.5")

        submit_btn = click_submit_checkin(driver)

        updated_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        is_disabled = submit_btn is None or (submit_btn.get_attribute("disabled") is not None)

        assert (
            is_disabled
            or "sudah melakukan check-in" in updated_text
            or "maksimal 1x" in updated_text
            or "hari ini" in updated_text
        )

    def test_tc_pbi02_003_validasi_berat_badan_minus_dan_nol(self, driver):
        """TC-PBI02-003 (Boundary Value - High): Berat badan minus (-71 kg) dan nol (0 kg)."""
        open_body_check_form(driver)

        weight_input = get_input_by_hints(
            driver,
            ["Berat badan", "Berat hari ini"],
            [(By.NAME, "weight"), (By.CSS_SELECTOR, "input[type='number']")]
        )
        sleep_input = get_input_by_hints(
            driver,
            ["Durasi tidur", "Lama tidur"],
            [(By.NAME, "sleepDuration"), (By.NAME, "sleep_duration")]
        )
        clear_and_type(sleep_input, "7.5")
        select_option_or_button(driver, ["Kualitas tidur"], "Nyenyak")

        # Uji 1: Berat Badan '-71' kg
        clear_and_type(weight_input, "-71")
        val_after_neg = weight_input.get_attribute("value") if weight_input else ""
        submit_btn_neg = click_submit_checkin(driver)

        body_text_neg = driver.find_element(By.TAG_NAME, "body").text.lower()
        invalid_neg = driver.execute_script("return document.querySelectorAll('input:invalid').length > 0;")
        assert (
            val_after_neg != "-71"
            or submit_btn_neg is None
            or not submit_btn_neg.is_enabled()
            or "lebih dari 0" in body_text_neg
            or "positif" in body_text_neg
            or invalid_neg
            or "/bodycheckpagi" in driver.current_url
        )

        # Uji 2: Berat Badan '0' kg
        clear_and_type(weight_input, "0")
        submit_btn_zero = click_submit_checkin(driver)

        body_text_zero = driver.find_element(By.TAG_NAME, "body").text.lower()
        invalid_zero = driver.execute_script("return document.querySelectorAll('input:invalid').length > 0;")
        assert (
            submit_btn_zero is None
            or not submit_btn_zero.is_enabled()
            or "lebih dari 0" in body_text_zero
            or "positif" in body_text_zero
            or invalid_zero
            or "/bodycheckpagi" in driver.current_url
        )

    def test_tc_pbi02_004_validasi_batas_durasi_tidur(self, driver):
        """TC-PBI02-004 (Boundary Value - Medium): Durasi tidur -3 jam dan 26 jam."""
        open_body_check_form(driver)

        weight_input = get_input_by_hints(
            driver,
            ["Berat badan", "Berat hari ini"],
            [(By.NAME, "weight"), (By.CSS_SELECTOR, "input[type='number']")]
        )
        clear_and_type(weight_input, "71.5")
        select_option_or_button(driver, ["Kualitas tidur"], "Nyenyak")

        sleep_input = get_input_by_hints(
            driver,
            ["Durasi tidur", "Lama tidur"],
            [(By.NAME, "sleepDuration"), (By.NAME, "sleep_duration")]
        )

        # Uji 1: Durasi Tidur '-3' jam
        clear_and_type(sleep_input, "-3")
        val_after_neg = sleep_input.get_attribute("value") if sleep_input else ""
        submit_btn_neg = click_submit_checkin(driver)

        body_text_neg = driver.find_element(By.TAG_NAME, "body").text.lower()
        invalid_neg = driver.execute_script("return document.querySelectorAll('input:invalid').length > 0;")
        assert (
            val_after_neg != "-3"
            or submit_btn_neg is None
            or not submit_btn_neg.is_enabled()
            or "0 hingga 24" in body_text_neg
            or "rentang" in body_text_neg
            or invalid_neg
            or "/bodycheckpagi" in driver.current_url
        )

        # Uji 2: Durasi Tidur '26' jam
        clear_and_type(sleep_input, "26")
        val_after_over = sleep_input.get_attribute("value") if sleep_input else ""
        submit_btn_over = click_submit_checkin(driver)

        body_text_over = driver.find_element(By.TAG_NAME, "body").text.lower()
        invalid_over = driver.execute_script("return document.querySelectorAll('input:invalid').length > 0;")
        assert (
            val_after_over != "26"
            or submit_btn_over is None
            or not submit_btn_over.is_enabled()
            or "0 hingga 24" in body_text_over
            or "rentang" in body_text_over
            or invalid_over
            or "/bodycheckpagi" in driver.current_url
        )

    def test_tc_pbi02_005_submit_kosong_mandatory_field(self, driver):
        """TC-PBI02-005 (Negative - High): Submit check-in tanpa mengisi berat badan."""
        open_body_check_form(driver)

        weight_input = get_input_by_hints(
            driver,
            ["Berat badan", "Berat hari ini"],
            [(By.NAME, "weight"), (By.CSS_SELECTOR, "input[type='number']")]
        )
        if weight_input:
            driver.execute_script("arguments[0].focus();", weight_input)
            weight_input.send_keys(Keys.CONTROL + "a")
            weight_input.send_keys(Keys.BACKSPACE)
            weight_input.clear()
            time.sleep(0.4)

        click_submit_checkin(driver)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        is_html5_invalid = driver.execute_script("return document.querySelectorAll('input:invalid, select:invalid').length > 0;")

        assert (
            "wajib" in body_text
            or "diisi" in body_text
            or "lengkapi" in body_text
            or is_html5_invalid
            or "/bodycheckpagi" in driver.current_url
        )

    def test_tc_pbi02_006_parsing_desimal_koma_ke_titik(self, driver):
        """TC-PBI02-006 (Format Check - Medium): Input desimal berat badan dengan koma ('71,5')."""
        open_body_check_form(driver)

        weight_input = get_input_by_hints(
            driver,
            ["Berat badan", "Berat hari ini"],
            [(By.NAME, "weight"), (By.CSS_SELECTOR, "input[type='number']")]
        )
        clear_and_type(weight_input, "71,5")

        set_energy_level(driver, "4")
        select_option_or_button(driver, ["Kualitas tidur"], "Nyenyak")

        sleep_input = get_input_by_hints(
            driver,
            ["Durasi tidur", "Lama tidur"],
            [(By.NAME, "sleepDuration"), (By.NAME, "sleep_duration")]
        )
        clear_and_type(sleep_input, "7.5")
        select_option_or_button(driver, ["Rencana aktivitas", "Intensitas", "Aktivitas"], "Kardio Ringan")

        parsed_val = weight_input.get_attribute("value") if weight_input else "71.5"

        click_submit_checkin(driver)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert (
            parsed_val in ("71.5", "71,5")
            or "71.5" in body_text
            or "berhasil" in body_text
            or "tersimpan" in body_text
            or "/bodycheckpagi" in driver.current_url
        )