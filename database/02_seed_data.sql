-- ==============================================================================
-- FITBITE DATABASE SEED DATA (02_seed_data.sql)
-- Master Reference Data & Demo Testing Records
-- Aligned with FitBite Proposal ERD & All 24 PBIs
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED: USERS (Admin & Demo Users)
-- Password demo: Admin123!, Budi123!, Siti123!, Nadia123! (dihash dengan pgcrypto)
-- ------------------------------------------------------------------------------
INSERT INTO users (id_user, nama, email, password_hash, role, tanggal_lahir, jenis_kelamin, tinggi_badan_cm, berat_badan_awal_kg, target_berat_badan_kg, status_akun)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'Administrator FitBite',
        'admin@fitbite.com',
        crypt('Admin123!', gen_salt('bf')),
        'admin',
        '1995-01-01',
        'L',
        175.0,
        70.0,
        70.0,
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Budi Santoso',
        'budi@fitbite.com',
        crypt('Budi123!', gen_salt('bf')),
        'user',
        '2000-05-15',
        'L',
        175.0,
        72.0,
        68.0,
        'active'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Siti Rahma',
        'siti@fitbite.com',
        crypt('Siti123!', gen_salt('bf')),
        'user',
        '2002-08-20',
        'P',
        160.0,
        55.0,
        52.0,
        'active'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'Nadia Putri',
        'nadia.putri@email.com',
        crypt('Nadia123!', gen_salt('bf')),
        'user',
        '1998-04-12',
        'P',
        160.0,
        64.8,
        60.0,
        'active'
    )
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. SEED: FOOD CATALOG (Katalog Master Makanan Nusantara, Sehat, & Kemasan Ber-Barcode)
-- ------------------------------------------------------------------------------
INSERT INTO food_catalog (id_catalog, nama_makanan, kategori, ukuran_sajian, berat_gram, kalori, protein_g, karbohidrat_g, lemak_g, serat_g, barcode)
VALUES
    -- Makanan Pokok
    ('a0000001-0000-0000-0000-000000000001', 'Nasi Putih', 'Pokok', '1 piring sedang (100g)', 100.0, 130.0, 2.7, 28.2, 0.3, 0.4, NULL),
    ('a0000001-0000-0000-0000-000000000002', 'Nasi Merah', 'Pokok', '1 piring sedang (100g)', 100.0, 111.0, 2.6, 23.0, 0.9, 1.8, NULL),
    ('a0000001-0000-0000-0000-000000000003', 'Oatmeal Matang', 'Pokok', '1 mangkuk (100g)', 100.0, 71.0, 2.5, 12.0, 1.5, 1.7, NULL),
    ('a0000001-0000-0000-0000-000000000004', 'Kentang Rebus', 'Pokok', '1 buah sedang (100g)', 100.0, 87.0, 1.9, 20.1, 0.1, 1.8, NULL),
    ('a0000001-0000-0000-0000-000000000005', 'Roti Gandum Utuh', 'Pokok', '1 lembar (40g)', 40.0, 95.0, 4.0, 17.0, 1.2, 2.5, NULL),
    ('a0000001-0000-0000-0000-000000000006', 'Ubi Jalar Rebus', 'Pokok', '1 buah sedang (100g)', 100.0, 86.0, 1.6, 20.1, 0.1, 3.0, NULL),

    -- Lauk Protein
    ('a0000002-0000-0000-0000-000000000001', 'Dada Ayam Rebus (Skinless)', 'Lauk', '1 potong (100g)', 100.0, 165.0, 31.0, 0.0, 3.6, 0.0, NULL),
    ('a0000002-0000-0000-0000-000000000002', 'Dada Ayam Panggang', 'Lauk', '1 potong (100g)', 100.0, 195.0, 29.5, 1.2, 7.8, 0.0, NULL),
    ('a0000002-0000-0000-0000-000000000003', 'Telur Ayam Rebus', 'Lauk', '1 butir (50g)', 50.0, 78.0, 6.3, 0.6, 5.3, 0.0, NULL),
    ('a0000002-0000-0000-0000-000000000004', 'Telur Dadar Goreng', 'Lauk', '1 butir (60g)', 60.0, 154.0, 6.5, 0.8, 12.0, 0.0, NULL),
    ('a0000002-0000-0000-0000-000000000005', 'Tempe Bacem', 'Lauk', '1 potong (50g)', 50.0, 118.0, 7.5, 9.8, 4.8, 1.5, NULL),
    ('a0000002-0000-0000-0000-000000000006', 'Tempe Goreng Tepung', 'Lauk', '1 potong (50g)', 50.0, 135.0, 6.0, 8.5, 9.2, 1.2, NULL),
    ('a0000002-0000-0000-0000-000000000007', 'Tahu Putih Kukus', 'Lauk', '1 potong besar (100g)', 100.0, 76.0, 8.1, 1.9, 4.8, 0.3, NULL),
    ('a0000002-0000-0000-0000-000000000008', 'Ikan Nila Bakar', 'Lauk', '1 ekor sedang (100g)', 100.0, 128.0, 26.0, 0.0, 2.7, 0.0, NULL),
    ('a0000002-0000-0000-0000-000000000009', 'Ikan Salmon Panggang', 'Lauk', '1 potong fillet (100g)', 100.0, 206.0, 22.0, 0.0, 12.3, 0.0, NULL),
    ('a0000002-0000-0000-0000-000000000010', 'Daging Sapi Panggang Empuk', 'Lauk', '1 potong (100g)', 100.0, 250.0, 26.0, 0.0, 15.0, 0.0, NULL),

    -- Sayuran Nusantara & Sehat
    ('a0000003-0000-0000-0000-000000000001', 'Sayur Bening Bayam Jagung', 'Sayur', '1 mangkuk sedang (150g)', 150.0, 45.0, 2.8, 8.5, 0.4, 2.5, NULL),
    ('a0000003-0000-0000-0000-000000000002', 'Sayur Asem Khas Jawa', 'Sayur', '1 mangkuk sedang (150g)', 150.0, 60.0, 2.0, 11.0, 0.6, 2.1, NULL),
    ('a0000003-0000-0000-0000-000000000003', 'Tumis Kangkung Terasi', 'Sayur', '1 porsi (100g)', 100.0, 85.0, 3.2, 5.0, 6.0, 2.0, NULL),
    ('a0000003-0000-0000-0000-000000000004', 'Brokoli Kukus', 'Sayur', '1 mangkuk (100g)', 100.0, 35.0, 2.4, 7.2, 0.4, 2.6, NULL),
    ('a0000003-0000-0000-0000-000000000005', 'Capcay Kuah Komplit', 'Sayur', '1 mangkuk (150g)', 150.0, 95.0, 5.0, 10.0, 4.0, 3.5, NULL),

    -- Buah-buahan
    ('a0000004-0000-0000-0000-000000000001', 'Pisang Cavendish', 'Buah', '1 buah sedang (118g)', 118.0, 105.0, 1.3, 27.0, 0.3, 3.1, NULL),
    ('a0000004-0000-0000-0000-000000000002', 'Apel Fuji Segar', 'Buah', '1 buah sedang (150g)', 150.0, 95.0, 0.5, 25.0, 0.3, 4.4, NULL),
    ('a0000004-0000-0000-0000-000000000003', 'Pepaya Potong Segar', 'Buah', '1 mangkuk (150g)', 150.0, 62.0, 0.9, 15.0, 0.4, 2.5, NULL),
    ('a0000004-0000-0000-0000-000000000004', 'Alpukat Mentega Matang', 'Buah', '1/2 buah (100g)', 100.0, 160.0, 2.0, 8.5, 14.7, 6.7, NULL),
    ('a0000004-0000-0000-0000-000000000005', 'Jeruk Manis Sunkist', 'Buah', '1 buah sedang (130g)', 130.0, 62.0, 1.2, 15.4, 0.2, 3.1, NULL),

    -- Camilan Sehat
    ('a0000005-0000-0000-0000-000000000001', 'Almond Panggang Tanpa Garam', 'Camilan', '1 genggam (30g)', 30.0, 170.0, 6.0, 6.0, 15.0, 3.5, NULL),
    ('a0000005-0000-0000-0000-000000000002', 'Greek Yogurt Plain Low Fat', 'Camilan', '1 cup (150g)', 150.0, 100.0, 15.0, 6.0, 1.5, 0.0, NULL),
    ('a0000005-0000-0000-0000-000000000003', 'Edamame Rebus', 'Camilan', '1 mangkuk kecil (100g)', 100.0, 122.0, 11.0, 10.0, 5.0, 5.2, NULL),

    -- Produk Kemasan Ber-Barcode Asli (Khusus Pengujian Barcode Scanner David - PBI-20)
    ('a0000006-0000-0000-0000-000000000001', 'Ultra Milk UHT Cokelat 250ml', 'Camilan', '1 kotak (250ml)', 250.0, 180.0, 7.0, 27.0, 5.0, 1.0, '8992753211012'),
    ('a0000006-0000-0000-0000-000000000002', 'Soyjoy Bar Almond & Chocolate', 'Camilan', '1 bar (30g)', 30.0, 140.0, 4.0, 13.0, 8.0, 3.0, '8992741912013'),
    ('a0000006-0000-0000-0000-000000000003', 'Roma Biskuit Sari Gandum', 'Camilan', '3 keping (39g)', 39.0, 190.0, 3.0, 26.0, 8.0, 2.0, '8992775211111'),
    ('a0000006-0000-0000-0000-000000000004', 'Teh Botol Sosro Kotak 250ml', 'Camilan', '1 kotak (250ml)', 250.0, 120.0, 0.0, 30.0, 0.0, 0.0, '8998866200222'),
    ('a0000006-0000-0000-0000-000000000005', 'Pocari Sweat Botol 500ml', 'Camilan', '1 botol (500ml)', 500.0, 125.0, 0.0, 31.0, 0.0, 0.0, '8992741120012')
ON CONFLICT (id_catalog) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. SEED: AKTIVITAS KATALOG (Nilai MET Standar CDC / Compendium of Physical Activities)
-- Rumus Kalori Terbakar = MET x 3.5 x BB(kg) / 200 x Durasi(menit)
-- ------------------------------------------------------------------------------
INSERT INTO aktivitas_katalog (id_aktivitas, nama_aktivitas, kategori, nilai_met, deskripsi)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'Jalan Santai (3.5 - 4 km/jam)', 'Ringan', 3.0, 'Jalan perlahan santai di jalan datar atau sekitar rumah'),
    ('b0000001-0000-0000-0000-000000000002', 'Peregangan Otot / Yoga Santai', 'Ringan', 2.5, 'Stretching ringan dan pose dasar hatha yoga'),
    ('b0000001-0000-0000-0000-000000000003', 'Membersihkan Rumah / Menyapu', 'Ringan', 2.8, 'Aktivitas domestik harian menyapu atau merapikan ruangan'),
    ('b0000001-0000-0000-0000-000000000004', 'Jalan Cepat (5.5 - 6 km/jam)', 'Sedang', 4.5, 'Brisk walking dengan detak jantung stabil'),
    ('b0000001-0000-0000-0000-000000000005', 'Latihan Beban Gym (Moderate)', 'Sedang', 5.0, 'Weight training repetisi sedang dengan jeda istirahat teratur'),
    ('b0000001-0000-0000-0000-000000000006', 'Bersepeda Santai (15 km/jam)', 'Sedang', 6.0, 'Bersepeda keliling taman atau area pemukiman'),
    ('b0000001-0000-0000-0000-000000000007', 'Senam Aerobik Ringan', 'Sedang', 5.5, 'Senam zumba atau aerobik berintensitas teratur'),
    ('b0000001-0000-0000-0000-000000000008', 'Renang Santai (Gaya Dada)', 'Sedang', 6.0, 'Berenang santai tanpa sprint berlebih'),
    ('b0000001-0000-0000-0000-000000000009', 'Lari Santai / Jogging (8 km/jam)', 'Berat', 7.0, 'Jogging stabil di luar ruangan atau treadmill'),
    ('b0000001-0000-0000-0000-000000000010', 'Lari Cepat (10 km/jam)', 'Berat', 10.0, 'Running tempo tinggi memacu denyut kardiovaskular'),
    ('b0000001-0000-0000-0000-000000000011', 'Renang Cepat (Gaya Bebas)', 'Berat', 8.5, 'Berenang intensif dengan tempo cepat'),
    ('b0000001-0000-0000-0000-000000000012', 'Bersepeda Cepat (20-25 km/jam)', 'Berat', 8.0, 'Bersepeda di tanjakan atau jalan raya intensitas tinggi'),
    ('b0000001-0000-0000-0000-000000000013', 'Lompat Tali / Skipping', 'Berat', 11.0, 'Rope jumping ritmis kontinu untuk kardio maksimal'),
    ('b0000001-0000-0000-0000-000000000014', 'HIIT / Circuit Training', 'Berat', 8.0, 'High-intensity interval training dengan burpees dan squats'),
    ('b0000001-0000-0000-0000-000000000015', 'Bulutangkis / Badminton', 'Berat', 7.0, 'Bermain bulutangkis kompetitif reli sedang hingga cepat')
ON CONFLICT (id_aktivitas) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. SEED: DEMO LOG DATA UNTUK USER BUDI (Hari Ini)
-- Menghidupkan Dashboard & Modul Log Tim Saat Pertama Dijalankan
-- ------------------------------------------------------------------------------
-- Body Check Pagi
INSERT INTO morning_checkin (id_checkin, id_user, tanggal, berat_badan_hari_ini_kg, skor_energi, durasi_tidur_jam, kualitas_tidur, rencana_aktivitas, bmr_kkal, tdee_dinamis_kkal, base_water_target_ml)
VALUES (
    'c0000001-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE,
    71.8,
    4,
    7.5,
    'Nyenyak',
    'Jogging sore 30 menit',
    1675.0,
    2200.0,
    2150
)
ON CONFLICT (id_user, tanggal) DO NOTHING;

-- Food Logs Hari Ini (Sarapan & Makan Siang)
INSERT INTO food_log (id_user, tanggal, waktu, slot_makan, metode, id_catalog, nama_makanan, porsi, detail, kalori, protein_g, karbohidrat_g, lemak_g, is_custom_entry)
VALUES
    (
        '22222222-2222-2222-2222-222222222222',
        CURRENT_DATE,
        '07.30 WIB',
        'Sarapan',
        'katalog',
        'a0000001-0000-0000-0000-000000000003',
        'Oatmeal Matang',
        '1 mangkuk (100g)',
        'Dicampur sedikit madu',
        150.0,
        5.0,
        28.0,
        2.5,
        FALSE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        CURRENT_DATE,
        '07.45 WIB',
        'Sarapan',
        'katalog',
        'a0000002-0000-0000-0000-000000000003',
        'Telur Ayam Rebus',
        '2 butir (100g)',
        'Telur rebus matang',
        156.0,
        12.6,
        1.2,
        10.6,
        FALSE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        CURRENT_DATE,
        '12.30 WIB',
        'Makan siang',
        'katalog',
        'a0000001-0000-0000-0000-000000000001',
        'Nasi Putih',
        '1 piring (150g)',
        'Porsi normal',
        195.0,
        4.0,
        42.3,
        0.5,
        FALSE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        CURRENT_DATE,
        '12.35 WIB',
        'Makan siang',
        'katalog',
        'a0000002-0000-0000-0000-000000000001',
        'Dada Ayam Rebus (Skinless)',
        '1 potong (120g)',
        'Dada ayam tanpa kulit',
        198.0,
        37.2,
        0.0,
        4.3,
        FALSE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        CURRENT_DATE,
        '12.40 WIB',
        'Makan siang',
        'katalog',
        'a0000003-0000-0000-0000-000000000001',
        'Sayur Bening Bayam Jagung',
        '1 mangkuk (150g)',
        'Kuah bening segar',
        45.0,
        2.8,
        8.5,
        0.4,
        FALSE
    );

-- Hydration Logs Hari Ini (David - PBI-08)
INSERT INTO hydration_log (id_user, tanggal, waktu, volume_ml)
VALUES
    ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, '07.00 WIB', 300),
    ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, '09.30 WIB', 250),
    ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, '12.45 WIB', 500);

-- Activity Log Hari Ini (Rifqy - PBI-04 & PBI-16)
-- Durasi 30 menit Jogging (MET 7.0) BB 71.8 kg -> 7.0 x 3.5 x 71.8 / 200 x 30 = 263.8 kkal
INSERT INTO activity_log (id_user, tanggal, waktu, id_aktivitas, nama_aktivitas, durasi_menit, nilai_met, kalori_terbakar)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE,
    '06.30 WIB',
    'b0000001-0000-0000-0000-000000000009',
    'Lari Santai / Jogging (8 km/jam)',
    30,
    7.0,
    263.8
);

-- Smart Reminder Settings (Faiz - PBI-11)
INSERT INTO smart_reminder (id_user, jenis_pengingat, jam_pengingat, interval_menit, saluran, is_active)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'Body Check Pagi', '06:30:00', 0, 'both', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Pengingat Minum Air', '09:00:00', 120, 'in_app', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Evaluasi Harian', '20:00:00', 0, 'both', TRUE);

-- Notification Initial Items (Faiz - PBI-12)
INSERT INTO notification (id_user, judul, pesan, tipe, is_read)
VALUES
    (
        '22222222-2222-2222-2222-222222222222',
        'Selamat Datang di FitBite!',
        'Profil fisik Anda telah tersimpan. Lakukan Morning Check-in setiap pagi untuk kalkulasi TDEE presisi.',
        'welcome',
        TRUE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Waktunya Minum Air',
        'Sudah 2 jam sejak tegukan terakhir. Minum 250ml air untuk menjaga hidrasi optimal.',
        'hydration',
        FALSE
    );

-- Daily Evaluation Demo (Aqiela - PBI-10, PBI-13)
INSERT INTO daily_evaluation (
    id_user, tanggal, total_kalori_masuk, target_kalori, total_kalori_keluar, net_kalori,
    total_protein_g, target_protein_g, total_karbo_g, target_karbo_g, total_lemak_g, target_lemak_g,
    total_cairan_ml, target_cairan_ml, bonus_cairan_olahraga_ml, status_kalori, status_hidrasi, saran_korektif
)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE,
    744.0,
    2200.0,
    263.8,
    480.2,
    61.6,
    110.0,
    79.0,
    240.0,
    18.5,
    60.0,
    1050,
    2500,
    350,
    'Kurang',
    'Kurang',
    'Asupan makan siang dan cairan masih on track. Jangan lupa lengkapi log makan malam sebelum pukul 20:00.'
)
ON CONFLICT (id_user, tanggal) DO UPDATE SET
    total_kalori_masuk = EXCLUDED.total_kalori_masuk,
    total_protein_g = EXCLUDED.total_protein_g,
    updated_at = CURRENT_TIMESTAMP;
