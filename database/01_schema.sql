-- ==============================================================================
-- FITBITE DATABASE SCHEMA (01_schema.sql)
-- Standard Relational Schema for PostgreSQL & Supabase
-- Aligned with FitBite Proposal ERD (10 Tables) & 24 PBIs
-- ==============================================================================

-- Enable UUID and Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean-up existing tables if re-running (order respects foreign key dependencies)
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS smart_reminder CASCADE;
DROP TABLE IF EXISTS daily_evaluation CASCADE;
DROP TABLE IF EXISTS hydration_log CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS aktivitas_katalog CASCADE;
DROP TABLE IF EXISTS food_log CASCADE;
DROP TABLE IF EXISTS food_catalog CASCADE;
DROP TABLE IF EXISTS morning_checkin CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. TABEL: users (Sprint 0: Auth, PBI-01: Profil Fisik, PBI-24: Admin Monitoring)
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id_user UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    tanggal_lahir DATE,
    jenis_kelamin VARCHAR(20) CHECK (jenis_kelamin IN ('L', 'P', 'laki-laki', 'perempuan')),
    tinggi_badan_cm DECIMAL(5,2) CHECK (tinggi_badan_cm > 0),
    berat_badan_awal_kg DECIMAL(5,2) CHECK (berat_badan_awal_kg > 0),
    target_berat_badan_kg DECIMAL(5,2) CHECK (target_berat_badan_kg > 0),
    web_push_subscription JSONB,
    status_akun VARCHAR(20) DEFAULT 'active' CHECK (status_akun IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. TABEL: morning_checkin (PBI-02: Check-in BB & Energi, PBI-03: BMR/TDEE Dinamis, PBI-09: Rekomendasi Cairan)
-- ------------------------------------------------------------------------------
CREATE TABLE morning_checkin (
    id_checkin UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    berat_badan_hari_ini_kg DECIMAL(5,2) NOT NULL CHECK (berat_badan_hari_ini_kg > 0),
    skor_energi INT NOT NULL CHECK (skor_energi BETWEEN 1 AND 5),
    durasi_tidur_jam DECIMAL(4,2) NOT NULL CHECK (durasi_tidur_jam BETWEEN 0 AND 24),
    kualitas_tidur VARCHAR(30) NOT NULL CHECK (kualitas_tidur IN ('Buruk', 'Cukup', 'Nyenyak', 'Sangat Nyenyak')),
    rencana_aktivitas VARCHAR(100),
    bmr_kkal DECIMAL(7,2) CHECK (bmr_kkal >= 0),
    tdee_dinamis_kkal DECIMAL(7,2) CHECK (tdee_dinamis_kkal >= 0),
    base_water_target_ml INT DEFAULT 2000 CHECK (base_water_target_ml > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_tanggal_checkin UNIQUE (id_user, tanggal)
);

-- ------------------------------------------------------------------------------
-- 3. TABEL: food_catalog (PBI-05: Master Gizi, PBI-07: Search Katalog, PBI-20: Barcode Scanner, UC-26)
-- ------------------------------------------------------------------------------
CREATE TABLE food_catalog (
    id_catalog UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_makanan VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    ukuran_sajian VARCHAR(100) DEFAULT '100 g',
    berat_gram DECIMAL(6,2) DEFAULT 100.0 CHECK (berat_gram > 0),
    kalori DECIMAL(7,2) NOT NULL CHECK (kalori >= 0),
    protein_g DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
    karbohidrat_g DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (karbohidrat_g >= 0),
    lemak_g DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (lemak_g >= 0),
    serat_g DECIMAL(6,2) DEFAULT 0 CHECK (serat_g >= 0),
    barcode VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. TABEL: food_log (PBI-06: 4 Slot Makan, PBI-10: Ringkasan Nutrisi, PBI-18: Quick Add, PBI-19: AI Recognition)
-- ------------------------------------------------------------------------------
CREATE TABLE food_log (
    id_food_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu VARCHAR(20) DEFAULT '12.00 WIB',
    slot_makan VARCHAR(30) NOT NULL CHECK (slot_makan IN ('Sarapan', 'Makan siang', 'Makan malam', 'Camilan')),
    metode VARCHAR(30) NOT NULL CHECK (metode IN ('katalog', 'quick_add', 'foto_ai', 'barcode', 'manual')),
    id_catalog UUID REFERENCES food_catalog(id_catalog) ON DELETE SET NULL,
    nama_makanan VARCHAR(150) NOT NULL,
    porsi VARCHAR(100) DEFAULT '1 porsi',
    detail VARCHAR(255),
    kalori DECIMAL(7,2) NOT NULL CHECK (kalori >= 0),
    protein_g DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
    karbohidrat_g DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (karbohidrat_g >= 0),
    lemak_g DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (lemak_g >= 0),
    is_custom_entry BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. TABEL: aktivitas_katalog (PBI-04: Katalog MET Aktivitas Fisik, UC-27)
-- ------------------------------------------------------------------------------
CREATE TABLE aktivitas_katalog (
    id_aktivitas UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_aktivitas VARCHAR(150) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    nilai_met DECIMAL(4,2) NOT NULL CHECK (nilai_met > 0),
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. TABEL: activity_log (PBI-04: Log Olahraga, PBI-16: Burned Calories Sync, PBI-21: Dynamic Hydration Sync)
-- ------------------------------------------------------------------------------
CREATE TABLE activity_log (
    id_activity UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu VARCHAR(20) DEFAULT '07.00 WIB',
    id_aktivitas UUID REFERENCES aktivitas_katalog(id_aktivitas) ON DELETE SET NULL,
    nama_aktivitas VARCHAR(150) NOT NULL,
    durasi_menit INT NOT NULL CHECK (durasi_menit > 0),
    nilai_met DECIMAL(4,2) NOT NULL CHECK (nilai_met > 0),
    kalori_terbakar DECIMAL(7,2) NOT NULL CHECK (kalori_terbakar >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. TABEL: hydration_log (PBI-08: Log Asupan Cairan, PBI-10: Dashboard Cairan)
-- ------------------------------------------------------------------------------
CREATE TABLE hydration_log (
    id_hydration UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu VARCHAR(20) DEFAULT '08.00 WIB',
    volume_ml INT NOT NULL CHECK (volume_ml > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. TABEL: daily_evaluation (PBI-10: Dashboard, PBI-13: Engine Evaluasi 20:00, PBI-14: Jurnal Kalender, PBI-22: Visualisasi Tren)
-- ------------------------------------------------------------------------------
CREATE TABLE daily_evaluation (
    id_eval UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    total_kalori_masuk DECIMAL(7,2) DEFAULT 0 CHECK (total_kalori_masuk >= 0),
    target_kalori DECIMAL(7,2) DEFAULT 2000 CHECK (target_kalori >= 0),
    total_kalori_keluar DECIMAL(7,2) DEFAULT 0 CHECK (total_kalori_keluar >= 0),
    net_kalori DECIMAL(7,2) DEFAULT 0,
    total_protein_g DECIMAL(6,2) DEFAULT 0 CHECK (total_protein_g >= 0),
    target_protein_g DECIMAL(6,2) DEFAULT 100 CHECK (target_protein_g >= 0),
    total_karbo_g DECIMAL(6,2) DEFAULT 0 CHECK (total_karbo_g >= 0),
    target_karbo_g DECIMAL(6,2) DEFAULT 190 CHECK (target_karbo_g >= 0),
    total_lemak_g DECIMAL(6,2) DEFAULT 0 CHECK (total_lemak_g >= 0),
    target_lemak_g DECIMAL(6,2) DEFAULT 60 CHECK (target_lemak_g >= 0),
    total_cairan_ml INT DEFAULT 0 CHECK (total_cairan_ml >= 0),
    target_cairan_ml INT DEFAULT 2000 CHECK (target_cairan_ml >= 0),
    bonus_cairan_olahraga_ml INT DEFAULT 0 CHECK (bonus_cairan_olahraga_ml >= 0),
    status_kalori VARCHAR(30) DEFAULT 'Kurang' CHECK (status_kalori IN ('Kurang', 'Tercapai Optimal', 'Surplus')),
    status_hidrasi VARCHAR(30) DEFAULT 'Kurang' CHECK (status_hidrasi IN ('Kurang', 'Tercapai Optimal', 'Surplus')),
    saran_korektif TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_tanggal_eval UNIQUE (id_user, tanggal)
);

-- ------------------------------------------------------------------------------
-- 9. TABEL: smart_reminder (PBI-11: Konfigurasi Reminder, PBI-23: Web Push Notification)
-- ------------------------------------------------------------------------------
CREATE TABLE smart_reminder (
    id_reminder UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    jenis_pengingat VARCHAR(50) NOT NULL,
    jam_pengingat TIME NOT NULL,
    interval_menit INT DEFAULT 0 CHECK (interval_menit >= 0),
    saluran VARCHAR(30) DEFAULT 'in_app' CHECK (saluran IN ('in_app', 'web_push', 'both')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 10. TABEL: notification (PBI-12: In-App Notification Center, PBI-15: Rekomendasi Olahraga Notif)
-- ------------------------------------------------------------------------------
CREATE TABLE notification (
    id_notifikasi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_user UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_reminder UUID REFERENCES smart_reminder(id_reminder) ON DELETE SET NULL,
    judul VARCHAR(150) NOT NULL,
    pesan TEXT NOT NULL,
    tipe VARCHAR(50) DEFAULT 'general',
    target_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- INDEKS PERFORMA QUERY (Optimasi Dashboard, Kalender Riwayat, dan Pencarian)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_morning_checkin_user_date ON morning_checkin(id_user, tanggal);
CREATE INDEX IF NOT EXISTS idx_food_log_user_date ON food_log(id_user, tanggal);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON activity_log(id_user, tanggal);
CREATE INDEX IF NOT EXISTS idx_hydration_log_user_date ON hydration_log(id_user, tanggal);
CREATE INDEX IF NOT EXISTS idx_daily_eval_user_date ON daily_evaluation(id_user, tanggal);
CREATE INDEX IF NOT EXISTS idx_food_catalog_search ON food_catalog(nama_makanan);
CREATE INDEX IF NOT EXISTS idx_food_catalog_kategori ON food_catalog(kategori);
CREATE INDEX IF NOT EXISTS idx_food_catalog_barcode ON food_catalog(barcode);
CREATE INDEX IF NOT EXISTS idx_notification_user_unread ON notification(id_user, is_read);
