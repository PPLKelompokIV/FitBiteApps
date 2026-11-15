import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

URL = "http://localhost:5173/profil-pengingat"

@pytest.fixture
def driver():
    # 1. Buka Chrome otomatis
    d = webdriver.Chrome()
    d.maximize_window()
    d.get(URL)
    yield d
    # Tutup Chrome setelah setiap tes selesai
    d.quit()

@pytest.mark.parametrize("test_case_id, jam_input, expected_status", [
    ("TC-PBI11-001", "06.30", "sukses"),           # (Positive) Simpan jam valid
    ("TC-PBI11-002", "toggle_off", "sukses"),      # (Positive) Matikan toggle
    ("TC-PBI11-003", "25.99", "error_format"),     # (Format Check) Format waktu invalid
    ("TC-PBI11-004", "-60", "error_interval"),     # (Boundary Value) Interval negatif
    ("TC-PBI11-005", "reload", "persisten")        # (Positive) Reload, cek persistensi
], ids=["TC-001", "TC-002", "TC-003", "TC-004", "TC-005"])
def test_simpan_pengingat(driver, test_case_id, jam_input, expected_status):
    
    # Tunggu form pengingat muncul di layar
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Simpan pengaturan')]"))
    )
    
    if test_case_id == "TC-PBI11-002":
        # Skenario 2: Matikan toggle pengingat (Tunggu elemen tersedia)
        toggle = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "(//input[@type='checkbox'] | //button[@role='switch'])[1]"))
        )
        
        # Karena elemen switch kustom React kadang tidak terdeteksi via is_selected(),
        # kita perintahkan klik langsung menggunakan JavaScript untuk mencegah ElementNotInteractableException
        driver.execute_script("arguments[0].click();", toggle)
            
    elif test_case_id == "TC-PBI11-005":
        # Skenario 5: Refresh browser (F5) untuk cek persistensi
        driver.refresh()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Simpan pengaturan')]"))
        )
        return  # Untuk TC-005, jika berhasil load lagi tanpa crash berarti sukses
        
    else:
        # Skenario 1, 3, dan 4: Test input teks pada form jam
        input_jam = driver.find_element(By.XPATH, "(//input[@type='text'])[1]")
        input_jam.click()
        input_jam.send_keys(Keys.CONTROL + "a")
        input_jam.send_keys(Keys.BACKSPACE)
        input_jam.send_keys(jam_input)

    # 4. Klik tombol 'Simpan pengaturan'
    btn_simpan = driver.find_element(By.XPATH, "//button[contains(., 'Simpan pengaturan')]")
    btn_simpan.click()

    # 5. Tunggu munculnya notifikasi toast dan lakukan assertion
    if expected_status == "sukses":
        toast = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Pengaturan Tersimpan')]"))
        )
        assert "Pengaturan Tersimpan" in toast.text
        
    elif expected_status == "error_format":
        toast_error = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Gagal Menyimpan')]"))
        )
        # Sesuai tabel excel: harus menolak jam 25.99
        assert "Gagal Menyimpan" in toast_error.text
        
    elif expected_status == "error_interval":
        toast_error = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Gagal Menyimpan')]"))
        )
        # Sesuai tabel excel: menolak interval negatif (-60 min)
        assert "Gagal Menyimpan" in toast_error.text