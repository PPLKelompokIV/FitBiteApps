# -*- coding: utf-8 -*-
"""
==============================================================================
FITBITE DATABASE AUTOMATION SETUP SCRIPT (setup_db.py)
Kelompok IV PPL - FitBite Apps
==============================================================================
Skrip ini mengotomatiskan setup database PostgreSQL lokal untuk seluruh tim:
1. Membaca konfigurasi dari file '.env' (atau meminta input kredensial sekali saja).
2. Membuat database 'fitbite_db' di PostgreSQL jika belum tersedia.
3. Menjalankan DDL '01_schema.sql' (10 tabel, foreign keys, constraints, indexes).
4. Menjalankan DML '02_seed_data.sql' (master makanan, barcode nyata, MET aktivitas, demo user).
5. Memverifikasi integritas seluruh tabel dan menampilkan laporan statistik data.
==============================================================================
"""

import os
import sys
import argparse
import getpass
from pathlib import Path
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Path Direktori Proyek
BASE_DIR = Path(__file__).resolve().parent.parent
DB_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
ENV_EXAMPLE_PATH = BASE_DIR / ".env.example"
SCHEMA_SQL_PATH = DB_DIR / "01_schema.sql"
SEED_SQL_PATH = DB_DIR / "02_seed_data.sql"

# Load variabel lingkungan jika file .env ada
load_dotenv(dotenv_path=ENV_PATH)


def print_banner():
    banner = r"""
    ====================================================================
      FITBITE POSTGRESQL DATABASE SETUP & SYNCHRONIZATION ENGINE
      Kelompok IV PPL | 10 Tables, Constraints & Seed Synchronization
    ====================================================================
    """
    print(banner)


def get_db_credentials(args):
    """Mendapatkan kredensial koneksi dari args, .env, atau prompt interaktif."""
    host = args.host or os.getenv("DB_HOST", "localhost")
    port = args.port or os.getenv("DB_PORT", "5432")
    user = args.user or os.getenv("DB_USER", "postgres")
    db_name = args.dbname or os.getenv("DB_NAME", "fitbite_db")
    password = args.password or os.getenv("DB_PASSWORD")

    # Jika password belum diset di .env atau argumen, minta input dari pengguna
    if not password:
        print(f"[*] Konfigurasi koneksi PostgreSQL belum lengkap di file .env.")
        print(f"[*] Host: {host} | Port: {port} | User: {user}")
        try:
            password = getpass.getpass(f"[?] Masukkan kata sandi PostgreSQL untuk pengguna '{user}': ")
        except (KeyboardInterrupt, EOFError):
            print("\n[!] Setup dibatalkan oleh pengguna.")
            sys.exit(1)

    return host, port, user, password, db_name


def save_env_file(host, port, user, password, db_name):
    """Memperbarui atau membuat file .env agar anggota tim tidak perlu input ulang."""
    db_url = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
    
    env_content = f"""# ==============================================================================
# FITBITE ENVIRONMENT CONFIGURATION (.env)
# Terkonfigurasi otomatis oleh database/setup_db.py
# ==============================================================================

# 1. DATABASE POSTGRESQL LOKAL
DB_HOST={host}
DB_PORT={port}
DB_NAME={db_name}
DB_USER={user}
DB_PASSWORD={password}
DATABASE_URL={db_url}

# 2. AUTENTIKASI & KEAMANAN JWT
JWT_SECRET_KEY={os.getenv("JWT_SECRET_KEY", "fitbite_super_secret_jwt_encryption_key_2026_kelompok4")}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# 3. AI ROUTER / GEMINI
ROUTER_API_KEY={os.getenv("ROUTER_API_KEY", "")}
ROUTER_BASE_URL={os.getenv("ROUTER_BASE_URL", "http://localhost:20128/v1")}
ROUTER_VISION_MODEL={os.getenv("ROUTER_VISION_MODEL", "ag/gemini-3.8-flash-high")}
"""
    try:
        with open(ENV_PATH, "w", encoding="utf-8") as f:
            f.write(env_content)
        print(f"[+] File konfigurasi '.env' berhasil diperbarui di root folder.")
    except Exception as e:
        print(f"[!] Peringatan: Gagal menyimpan .env otomatis: {e}")


def connect_postgres(host, port, user, password, dbname="postgres"):
    """Membuka koneksi ke PostgreSQL."""
    return psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        dbname=dbname,
        connect_timeout=5
    )


def ensure_database_exists(host, port, user, password, target_dbname):
    """Memastikan database target ('fitbite_db') sudah ada di server PostgreSQL."""
    print(f"[*] Menghubungi server PostgreSQL di {host}:{port}...")
    try:
        conn = connect_postgres(host, port, user, password, "postgres")
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Cek apakah database sudah ada
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (target_dbname,))
        exists = cursor.fetchone()

        if not exists:
            print(f"[+] Database '{target_dbname}' belum ada. Membuat database baru...")
            cursor.execute(f'CREATE DATABASE "{target_dbname}" WITH OWNER "{user}" ENCODING \'UTF8\';')
            print(f"[OK] Database '{target_dbname}' berhasil dibuat!")
        else:
            print(f"[OK] Database '{target_dbname}' sudah tersedia di server.")

        cursor.close()
        conn.close()
    except psycopg2.OperationalError as e:
        print("\n" + "=" * 65)
        print(" [GAGAL KONEKSI KE POSTGRESQL]")
        print("=" * 65)
        print(f"Pesan Error: {e}")
        print("\nTips Mengatasi:")
        print("1. Pastikan Service PostgreSQL di Windows/Mac/Linux dalam keadaan RUNNING.")
        print(f"2. Periksa kembali kecocokan password untuk user '{user}'.")
        print("3. Periksa port PostgreSQL (apakah default 5432 atau port lain).")
        print("=" * 65 + "\n")
        sys.exit(1)


def execute_sql_file(conn, sql_file_path, step_name):
    """Mengeksekusi berkas script SQL ke dalam database target."""
    if not sql_file_path.exists():
        print(f"[!] File SQL tidak ditemukan: {sql_file_path}")
        sys.exit(1)

    print(f"[*] Mengeksekusi {step_name} ({sql_file_path.name})...")
    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    cursor = conn.cursor()
    try:
        cursor.execute(sql_content)
        conn.commit()
        print(f"[OK] Berhasil mengeksekusi {step_name}!")
    except Exception as e:
        conn.rollback()
        print(f"[!] GAGAL saat mengeksekusi {step_name}: {e}")
        cursor.close()
        sys.exit(1)
    finally:
        cursor.close()


def verify_tables(conn):
    """Memverifikasi seluruh 10 tabel dan menampilkan jumlah baris data awal."""
    expected_tables = [
        ("users", "PBI-01 / Sprint 0: Akun Pengguna & Admin"),
        ("morning_checkin", "PBI-02, 03: Body Check Pagi & TDEE"),
        ("food_catalog", "PBI-05, 07, 20: Master Makanan & Barcode"),
        ("food_log", "PBI-06, 18, 19: Catatan Log Makanan 4 Slot"),
        ("aktivitas_katalog", "PBI-04: Master Aktivitas Fisik (MET)"),
        ("activity_log", "PBI-04, 16: Log Olahraga & Kalori Terbakar"),
        ("hydration_log", "PBI-08: Log Asupan Air Putih"),
        ("daily_evaluation", "PBI-10, 13: Evaluasi Harian Akhir Hari"),
        ("smart_reminder", "PBI-11, 23: Pengaturan Reminder & Alarm"),
        ("notification", "PBI-12, 15: In-App Notification Center")
    ]

    cursor = conn.cursor()
    print("\n" + "=" * 75)
    print("           RINGKASAN STATUS 10 TABEL BASIS DATA FITBITE")
    print("=" * 75)
    print(f"{'Nama Tabel':<22} | {'Jumlah Baris':<14} | {'Status & PBI Terkait'}")
    print("-" * 75)

    all_ok = True
    for table_name, desc in expected_tables:
        try:
            cursor.execute(f'SELECT COUNT(*) FROM "{table_name}";')
            count = cursor.fetchone()[0]
            status = f"[SIAP] {desc}"
            print(f"{table_name:<22} | {count:<14} | {status}")
        except Exception as e:
            all_ok = False
            print(f"{table_name:<22} | {'ERROR':<14} | [GAGAL] {e}")

    print("=" * 75)
    cursor.close()
    return all_ok


def main():
    parser = argparse.ArgumentParser(description="FitBite Database Synchronization Tool")
    parser.add_argument("--host", help="PostgreSQL host (default: localhost)")
    parser.add_argument("--port", help="PostgreSQL port (default: 5432)")
    parser.add_argument("--user", help="PostgreSQL user (default: postgres)")
    parser.add_argument("--password", help="PostgreSQL password")
    parser.add_argument("--dbname", help="Target database name (default: fitbite_db)")
    parser.add_argument("--skip-seed", action="store_true", help="Lewati pengisian data awal (seed)")
    args = parser.parse_args()

    print_banner()

    # 1. Dapatkan kredensial
    host, port, user, password, db_name = get_db_credentials(args)

    # 2. Pastikan database 'fitbite_db' tersedia di server PostgreSQL
    ensure_database_exists(host, port, user, password, db_name)

    # 3. Hubungkan langsung ke database 'fitbite_db'
    print(f"[*] Menghubungkan ke database '{db_name}'...")
    conn = connect_postgres(host, port, user, password, db_name)

    # 4. Eksekusi Skema DDL (10 Tabel)
    execute_sql_file(conn, SCHEMA_SQL_PATH, "Skema DDL (10 Tabel & Constraints)")

    # 5. Eksekusi Seed Data (jika tidak di-skip)
    if not args.skip_seed:
        execute_sql_file(conn, SEED_SQL_PATH, "Seed Data (Master & Demo)")
    else:
        print("[*] Melewati pengisian seed data (--skip-seed aktif).")

    # 6. Verifikasi Integritas Seluruh Tabel
    success = verify_tables(conn)
    conn.close()

    # 7. Simpan konfigurasi ke .env lokal jika berhasil
    if success:
        save_env_file(host, port, user, password, db_name)
        print("\n" + "*" * 75)
        print(" [SELAMAT!] Setup Basis Data PostgreSQL FitBite Berhasil 100%!")
        print(" Seluruh tabel, constraints, dan data master telah sinkron.")
        print(" Anggota tim sekarang dapat menjalankan backend dengan struktur yang identik.")
        print("*" * 75 + "\n")
    else:
        print("\n[!] Setup selesai namun ditemukan beberapa ketidaksesuaian tabel.")


if __name__ == "__main__":
    main()
