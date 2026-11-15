-- Apply to an existing database to add the Nadia demo login without re-running all seeds.
INSERT INTO users (
    id_user,
    nama,
    email,
    password_hash,
    role,
    tanggal_lahir,
    jenis_kelamin,
    tinggi_badan_cm,
    berat_badan_awal_kg,
    target_berat_badan_kg,
    status_akun
)
VALUES (
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
