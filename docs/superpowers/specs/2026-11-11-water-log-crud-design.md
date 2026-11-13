# FIT-37 / FIT-38: CRUD Jadwal & Riwayat Minum (Water Log) Design Spec

## Intent & The Why
Pengguna FitBite membutuhkan kemampuan penuh untuk mencatat asupan minum (Create), melihat riwayat minum harian (Read), mengubah catatan yang salah ketik/salah jam (Update), serta menghapus catatan yang dibatalkan (Delete), baik di sisi Frontend maupun tersimpan di Database Backend PostgreSQL melalui REST API FastAPI.

## Goals, Non-goals, Anti-goals
- **Goals**:
  - Menyediakan model database `water_logs` di PostgreSQL via SQLAlchemy.
  - Menyediakan REST API lengkap di FastAPI:
    - `POST /api/water-logs`: Tambah catatan minum baru.
    - `GET /api/water-logs/{id_user}`: Ambil riwayat minum pengguna hari ini.
    - `PUT /api/water-logs/{id_water_log}`: Perbarui waktu, jumlah ml, atau catatan.
    - `DELETE /api/water-logs/{id_water_log}`: Hapus catatan minum.
  - Menghubungkan Frontend `ActivityHydrationSection.tsx` ke REST API tersebut secara responsif (Optimistic UI + Fallback LocalStorage agar UI tetap responsif 0ms bahkan saat koneksi lambat).
  - Menyediakan modal Edit & Tambah pada UI Riwayat Minum.
- **Non-goals**:
  - Mengubah arsitektur user authentication (menggunakan user context `id_user=1` konsisten dengan modul food_log dan reminders).
- **Anti-goals**:
  - Jangan sampai UI membeku atau error jika backend sedang offline/database down; gunakan pola fetch dengan fallback yang tangguh.

## Architecture
- **Backend**: FastAPI, SQLAlchemy ORM, Pydantic v2 schemas, PostgreSQL.
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons (`Pencil`, `Trash2`, `Droplets`, `Plus`, `X`).

