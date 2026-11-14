import re
import time
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL = "http://localhost:5173/jurnal-makanan"


@pytest.fixture
def driver():
    d = webdriver.Chrome()
    d.maximize_window()
    d.get(URL)
    WebDriverWait(d, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//h1[contains(text(), 'Makan dengan sadar')]"))
    )
    # Tunggu data awal selesai dimuat dari backend
    time.sleep(0.8)
    yield d
    d.quit()


def set_react_input_value(driver, element, value: str):
    driver.execute_script(
        """
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(arguments[0], arguments[1]);
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        """,
        element,
        value,
    )


def ambil_angka_kalori_slot(driver, slot_makan: str) -> int:
    teks = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located(
            (By.XPATH, f"//article[.//h3[text()='{slot_makan}']]//header//span[contains(text(), 'kkal')]")
        )
    ).text
    angka = re.sub(r"[^\d]", "", teks)
    return int(angka) if angka else 0


def tambah_makanan_katalog(driver, slot_makan: str, nama_cari: str, porsi: str, tambahan_kkal: int):
    kalori_awal = ambil_angka_kalori_slot(driver, slot_makan)

    tombol_slot = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, f"//button[normalize-space()='{slot_makan}']"))
    )
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", tombol_slot)
    driver.execute_script("arguments[0].click();", tombol_slot)

    input_cari = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[aria-label='Cari di katalog']"))
    )
    set_react_input_value(driver, input_cari, nama_cari)

    item_katalog = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, f"//button[.//span[contains(text(), '{nama_cari}')]]")
        )
    )
    driver.execute_script("arguments[0].click();", item_katalog)

    input_porsi = driver.find_element(By.CSS_SELECTOR, "input[aria-label='Jumlah porsi']")
    set_react_input_value(driver, input_porsi, porsi)

    tombol_submit = driver.find_element(
        By.XPATH, f"//button[contains(normalize-space(), 'Tambah ke {slot_makan}')]"
    )
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", tombol_submit)
    driver.execute_script("arguments[0].click();", tombol_submit)

    # Tunggu sampai total kalori pada header slot bertambah sesuai porsi yang ditambahkan
    WebDriverWait(driver, 15).until(
        lambda d: ambil_angka_kalori_slot(d, slot_makan) == kalori_awal + tambahan_kkal
    )


# 1. TC-PBI06-001: Mencatat makanan dari katalog ke slot Sarapan dan verifikasi akumulasi kalori slot
def test_tc_pbi06_001_katalog_sarapan(driver):
    tambah_makanan_katalog(driver, "Sarapan", "Nasi merah matang", "2", 220)


# 2. TC-PBI06-002: Mencatat makanan pada ke-4 slot berbeda (Sarapan, Makan siang, Makan malam, Camilan)
def test_tc_pbi06_002_empat_slot_waktu_makan(driver):
    for slot in ["Sarapan", "Makan siang", "Makan malam", "Camilan"]:
        tambah_makanan_katalog(driver, slot, "Nasi merah matang", "1", 110)


# 3. TC-PBI06-003: Inline edit porsi/kalori makanan pada list slot yang telah tersimpan
def test_tc_pbi06_003_inline_edit_kalori(driver):
    btn_edit = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[title='Edit porsi atau kalori']"))
    )
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn_edit)
    driver.execute_script("arguments[0].click();", btn_edit)

    input_kkal = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Kkal']"))
    )
    input_kkal.click()
    input_kkal.send_keys(Keys.CONTROL + "a")
    input_kkal.send_keys(Keys.BACKSPACE)
    input_kkal.send_keys("300")

    btn_simpan = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[title='Simpan perubahan']"))
    )
    driver.execute_script("arguments[0].click();", btn_simpan)

    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Kkal']"))
    )
    assert WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(normalize-space(), '300 kkal')]"))
    )


# 4. TC-PBI06-004: Menghapus salah satu item makanan dari slot makan
def test_tc_pbi06_004_hapus_item_slot(driver):
    jumlah_awal = len(driver.find_elements(By.CSS_SELECTOR, "button[title='Hapus makanan ini']"))
    assert jumlah_awal > 0, "Tidak ada item makanan yang bisa dihapus"

    btn_hapus = driver.find_elements(By.CSS_SELECTOR, "button[title='Hapus makanan ini']")[0]
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn_hapus)
    driver.execute_script("arguments[0].click();", btn_hapus)

    WebDriverWait(driver, 10).until(
        lambda d: len(d.find_elements(By.CSS_SELECTOR, "button[title='Hapus makanan ini']")) == jumlah_awal - 1
    )


# 5. TC-PBI06-005: Boundary Value - Edit kalori item makanan menjadi angka negatif (-200 kkal)
def test_tc_pbi06_005_edit_kalori_negatif(driver):
    btn_edit = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[title='Edit porsi atau kalori']"))
    )
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn_edit)
    driver.execute_script("arguments[0].click();", btn_edit)

    input_kkal = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder='Kkal']"))
    )
    input_kkal.click()
    input_kkal.send_keys(Keys.CONTROL + "a")
    input_kkal.send_keys(Keys.BACKSPACE)
    input_kkal.send_keys("-200")

    btn_simpan = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[title='Simpan perubahan']"))
    )
    driver.execute_script("arguments[0].click();", btn_simpan)

    assert input_kkal.is_displayed()


# 6. TC-PBI06-006: Sinkronisasi log makanan harian dengan indikator kalender jurnal aktif
def test_tc_pbi06_006_sinkronisasi_kalender_jurnal(driver):
    header_tanggal = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//*[contains(normalize-space(), '2026')]"))
    )
    assert header_tanggal.is_displayed()
    for slot in ["Sarapan", "Makan siang", "Makan malam", "Camilan"]:
        assert driver.find_element(By.XPATH, f"//h3[text()='{slot}']").is_displayed()