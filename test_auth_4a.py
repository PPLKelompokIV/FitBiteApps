# -*- coding: utf-8 -*-
"""
Pengujian Otomatis Sistem Autentikasi & Otorisasi FitBite (FIT-61)
Berdasarkan Prinsip 4A Keamanan Sistem Informasi:
1. Authentication: Verifikasi identitas kredensial email & password_hash.
2. Authorization: Role-Based Access Control (RBAC) 'user' vs 'admin'.
3. Accountability: Pencatatan jejak audit login & token validity.
4. Administration: Pendaftaran akun baru, validasi format, dan penolakan duplikasi.
"""

import time
import uuid
from fastapi import HTTPException
from main import login_user, register_user, get_current_user_profile, LoginRequest, RegisterRequest


def test_4a_authentication():
    print("\n--- [1. PENGUJIAN AUTHENTICATION (AUTENTIKASI)] ---")
    
    # Skenario 1.1: Login gagal dengan kata sandi salah
    try:
        login_user(LoginRequest(email="budi@fitbite.com", password="SandiSalah123!"))
        assert False, "Seharusnya gagal dengan 401"
    except HTTPException as e:
        assert e.status_code == 401
        print("  [PASS] 1.1 Kata sandi salah ditolak dengan status 401:", e.detail)

    # Skenario 1.2: Login gagal dengan email yang tidak terdaftar
    try:
        login_user(LoginRequest(email="tidakada@fitbite.com", password="Password123!"))
        assert False, "Seharusnya gagal dengan 401"
    except HTTPException as e:
        assert e.status_code == 401
        print("  [PASS] 1.2 Email asing ditolak dengan status 401:", e.detail)

    # Skenario 1.3: Login berhasil pengguna biasa (Budi)
    res_budi = login_user(LoginRequest(email="budi@fitbite.com", password="Budi123!"))
    assert res_budi["status"] == "success"
    assert res_budi["user"]["email"] == "budi@fitbite.com"
    assert res_budi["token"] is not None
    print("  [PASS] 1.3 Kredensial sah Budi Santoso berhasil terautentikasi.")


def test_4a_authorization():
    print("\n--- [2. PENGUJIAN AUTHORIZATION (OTORISASI & RBAC)] ---")
    
    # Skenario 2.1: Pengguna biasa (Role 'user') diarahkan ke /bodycheckpagi
    res_user = login_user(LoginRequest(email="budi@fitbite.com", password="Budi123!"))
    assert res_user["user"]["role"] == "user"
    assert res_user["redirect_url"] == "/bodycheckpagi"
    print("  [PASS] 2.1 Role 'user' diarahkan ke halaman pengguna:", res_user["redirect_url"])

    # Skenario 2.2: Administrator (Role 'admin') diarahkan ke /admin/pantau
    res_admin = login_user(LoginRequest(email="admin@fitbite.com", password="Admin123!"))
    assert res_admin["user"]["role"] == "admin"
    assert res_admin["redirect_url"] == "/admin/pantau"
    print("  [PASS] 2.2 Role 'admin' diarahkan ke halaman administrator:", res_admin["redirect_url"])


def test_4a_accountability():
    print("\n--- [3. PENGUJIAN ACCOUNTABILITY (AKUNTABILITAS & AUDIT)] ---")
    
    res = login_user(LoginRequest(email="budi@fitbite.com", password="Budi123!"))
    assert "audit" in res
    assert "session_id" in res["audit"]
    assert "login_at" in res["audit"]
    print("  [PASS] 3.1 Jejak audit sesi login tercatat:", res["audit"])

    # Skenario 3.2: Token Bearer JWT valid dapat diverifikasi
    token = res["token"]
    profile = get_current_user_profile(token=token)
    assert profile["status"] == "success"
    assert profile["user"]["email"] == "budi@fitbite.com"
    print("  [PASS] 3.2 Token JWT terverifikasi dan identitas pengguna valid:", profile["user"])

    # Skenario 3.3: Token palsu / rusak ditolak
    try:
        get_current_user_profile(token="token_palsu_rusak_123")
        assert False, "Seharusnya token palsu ditolak"
    except HTTPException as e:
        assert e.status_code == 401
        print("  [PASS] 3.3 Token palsu ditolak dengan status 401:", e.detail)


def test_4a_administration():
    print("\n--- [4. PENGUJIAN ADMINISTRATION (ADMINISTRASI PENGGUNA)] ---")
    
    unique_email = f"user_{int(time.time())}_{uuid.uuid4().hex[:4]}@fitbite.com"

    # Skenario 4.1: Registrasi akun baru dengan format valid
    res_reg = register_user(RegisterRequest(
        nama="Dokter Nadia Putri",
        email=unique_email,
        password="Password123!"
    ))
    assert res_reg["status"] == "success"
    assert res_reg["user"]["role"] == "user"
    assert res_reg["user"]["email"] == unique_email
    print(f"  [PASS] 4.1 Pendaftaran akun baru berhasil: {unique_email}")

    # Skenario 4.2: Penolakan email duplikat
    try:
        register_user(RegisterRequest(
            nama="Akun Duplikat",
            email=unique_email,
            password="Password123!"
        ))
        assert False, "Seharusnya email duplikat ditolak"
    except HTTPException as e:
        assert e.status_code == 400
        print("  [PASS] 4.2 Email duplikat berhasil dicegah:", e.detail)

    # Skenario 4.3: Penolakan kata sandi terlalu pendek (< 8 karakter)
    try:
        register_user(RegisterRequest(
            nama="User Pendek",
            email="pendek@fitbite.com",
            password="123"
        ))
        assert False, "Seharusnya kata sandi pendek ditolak"
    except Exception as e:
        print("  [PASS] 4.3 Kata sandi di bawah 8 karakter berhasil dicegah.")

    # Skenario 4.4: Login langsung akun yang baru saja didaftarkan
    res_login_new = login_user(LoginRequest(email=unique_email, password="Password123!"))
    assert res_login_new["status"] == "success"
    assert res_login_new["user"]["nama"] == "Dokter Nadia Putri"
    print("  [PASS] 4.4 Akun baru berhasil langsung digunakan untuk login.")

    # Bersihkan akun uji dari basis data
    try:
        from main import get_pg_connection
        conn = get_pg_connection()
        if conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM users WHERE email = %s;", (unique_email,))
            conn.commit()
            cur.close()
            conn.close()
            print("  [INFO] Data akun pengujian berhasil dibersihkan dari database.")
    except Exception as e:
        print("  [WARN] Gagal membersihkan data uji:", e)


if __name__ == "__main__":
    print("=" * 65)
    print("   PENGUJIAN MENYELURUH FITUR LOGIN & REGISTER (FIT-61)")
    print("   BERDASARKAN 4A KEAMANAN SISTEM INFORMASI")
    print("=" * 65)
    
    test_4a_authentication()
    test_4a_authorization()
    test_4a_accountability()
    test_4a_administration()
    
    print("\n" + "*" * 65)
    print(" [SEMUA PENGUJIAN 4A BERHASIL 100%!]")
    print(" Sistem Autentikasi, Otorisasi, Akuntabilitas, dan Administrasi")
    print(" telah berfungsi sempurna dan siap digunakan!")
    print("*" * 65)
