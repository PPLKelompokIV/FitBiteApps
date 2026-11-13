# CRUD Jadwal & Riwayat Minum (Water Log) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun fitur CRUD penuh (Create, Read, Update, Delete) untuk jadwal dan riwayat asupan minum air di backend FastAPI dan frontend React.

**Architecture:** 
1. Backend: Model SQLAlchemy `WaterLog`, skema Pydantic `WaterLogCreateRequest` / `WaterLogUpdateRequest`, dan router FastAPI `/api/water-logs`.
2. Frontend: Integrasi API di `ActivityHydrationSection.tsx` dengan modal Edit & Tambah, tombol Hapus per baris, dan perhitungan total hidrasi otomatis.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic v2, Pytest, React 19, TypeScript, Tailwind CSS, Lucide React.

**Spec:** `docs/superpowers/specs/2026-11-11-water-log-crud-design.md`

## Global Constraints
- Python: FastAPI + SQLAlchemy 2.0 + Pydantic v2.
- TypeScript: No implicit any, valid bundling with `npm run build`.
- Resilient UI: Optimistic update dengan fallback graceful bila backend offline.

---

### Task 1: Backend Data Model & Schemas
**Files:**
- Create: `fitbite-backend/app/models/water_log.py`
- Create: `fitbite-backend/app/schemas/water_log.py`
- Test: `fitbite-backend/tests/test_water_logs.py`

- [x] Tulis test Pydantic validation di `fitbite-backend/tests/test_water_logs.py`.
- [x] Buat model `WaterLog` di `fitbite-backend/app/models/water_log.py` dengan kolom: `id_water_log`, `id_user`, `tanggal`, `waktu`, `jumlah_ml`, `catatan`.
- [x] Buat skema Pydantic di `fitbite-backend/app/schemas/water_log.py` dengan validasi jumlah_ml > 0 dan waktu tidak kosong.
- [x] Jalankan pytest untuk memverifikasi test validasi lolos.

### Task 2: Backend API Endpoints (CRUD)
**Files:**
- Create: `fitbite-backend/app/routers/water_logs.py`
- Modify: `fitbite-backend/app/main.py`
- Modify: `fitbite-backend/tests/test_water_logs.py`

- [x] Implementasikan endpoint `POST /api/water-logs` (Create).
- [x] Implementasikan endpoint `GET /api/water-logs/{id_user}` (Read list hari ini).
- [x] Implementasikan endpoint `PUT /api/water-logs/{id_water_log}` (Update waktu/ml).
- [x] Implementasikan endpoint `DELETE /api/water-logs/{id_water_log}` (Delete single item).
- [x] Daftarkan router di `fitbite-backend/app/main.py`.
- [x] Tambahkan API test di `test_water_logs.py` dan jalankan dengan pytest.

### Task 3: Frontend Integration di ActivityHydrationSection
**Files:**
- Modify: `fitbite-frontend/src/Aktivitas & hidrasi/ActivityHydrationSection.tsx`

- [x] Tambahkan state `isEditModalOpen`, `selectedDrink`, dan form fields untuk edit & tambah.
- [x] Buat fungsi fetch API `loadWaterLogs`, `handleCreateDrink`, `handleUpdateDrink`, `handleDeleteDrink` dengan pola Optimistic UI.
- [x] Tambahkan tombol Edit (ikon pensil ✏️) dan pastikan tombol Hapus (🗑️) terhubung ke API DELETE.
- [x] Tampilkan Modal Dialog untuk Edit Jam & Jumlah ml.
- [x] Jalankan `npm run build` untuk memverifikasi bundling frontend.

### Task 4: Verifikasi Akhir
- [x] Jalankan test suite pytest di backend (8 passed).
- [x] Jalankan `npm run build` di frontend (built in 1.14s).
