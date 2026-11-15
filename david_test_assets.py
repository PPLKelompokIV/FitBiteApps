"""
Pembuat berkas uji (test asset) untuk pengujian Foto AI (PBI-19).
==============================================================================
Seluruh berkas dibuat otomatis di folder temporer agar repository tidak dipenuhi
berkas biner. Fungsi mengembalikan path (str) atau None bila berkas tidak bisa
disiapkan (mis. tidak ada koneksi internet untuk foto contoh).
"""

import os
import random
import struct
import tempfile
import urllib.request
import zlib

ASSET_DIR = os.path.join(tempfile.gettempdir(), "fitbite_e2e_assets")

# Foto hidangan (nasi goreng) dari Unsplash - dipakai sebagai foto "valid".
FOTO_MAKANAN_URLS = [
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
]


def _ensure_dir():
    os.makedirs(ASSET_DIR, exist_ok=True)
    return ASSET_DIR


def _tulis(nama, data):
    path = os.path.join(_ensure_dir(), nama)
    with open(path, "wb") as berkas:
        berkas.write(data)
    return path


def _png_polos(width, height, rgb, noise=False):
    """Membuat PNG sederhana tanpa dependensi Pillow."""
    baris = bytearray()
    rng = random.Random(42)
    for _ in range(height):
        baris.append(0)  # filter type 0 (None)
        for _ in range(width):
            if noise:
                baris.extend((rng.randrange(256), rng.randrange(256), rng.randrange(256)))
            else:
                baris.extend(rgb)

    def chunk(tag, data):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(baris), 9))
        + chunk(b"IEND", b"")
    )


def foto_makanan():
    """Foto makanan valid (JPG). Mengembalikan None jika gagal diunduh."""
    path = os.path.join(ASSET_DIR, "nasi_goreng_ayam.jpg")
    if os.path.exists(path) and os.path.getsize(path) > 5000:
        return path

    _ensure_dir()
    for url in FOTO_MAKANAN_URLS:
        try:
            with urllib.request.urlopen(url, timeout=20) as response:
                data = response.read()
            if len(data) > 5000:
                with open(path, "wb") as berkas:
                    berkas.write(data)
                return path
        except Exception:
            continue
    return None


def berkas_pdf(nama="laporan.pdf"):
    """Berkas non-gambar (PDF) untuk TC-PBI19-002."""
    isi = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n"
        b"trailer<</Root 1 0 R>>\n%%EOF\n"
    )
    return _tulis(nama, isi)


def foto_ukuran_besar(megabyte=12.4, nama="foto_besar.jpg"):
    """Berkas JPG berukuran besar (>5 MB) untuk TC-PBI19-003."""
    target = int(megabyte * 1024 * 1024)
    header = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    rng = random.Random(7)
    body = bytes(rng.randrange(256) for _ in range(min(target, 65536)))
    data = header + body
    while len(data) < target:
        data += body
    return _tulis(nama, data[:target])


def foto_bukan_makanan(nama="keyboard.png"):
    """Gambar non-makanan (pola noise abu-abu) untuk TC-PBI19-004."""
    return _tulis(nama, _png_polos(320, 240, (0, 0, 0), noise=True))
