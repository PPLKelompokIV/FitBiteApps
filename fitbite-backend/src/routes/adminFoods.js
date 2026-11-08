const express = require('express');
const router = express.Router();

const SUMBER_DEFAULT = 'Referensi internal v1 (contoh)';

// Data katalog makanan master (in-memory store dengan data awal)
let foods = [
  { id: 1, nama: 'Nasi merah matang', kategori: 'Serealia', basis: 100, kkal: 110, protein: 2.6, karbo: 23, lemak: 0.9, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 2, nama: 'Ayam panggang', kategori: 'Lauk hewani', basis: 100, kkal: 183, protein: 21.7, karbo: 0, lemak: 10, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 3, nama: 'Tempe panggang', kategori: 'Lauk nabati', basis: 100, kkal: 193, protein: 13.3, karbo: 16, lemak: 6.7, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 4, nama: 'Tahu kukus', kategori: 'Lauk nabati', basis: 100, kkal: 80, protein: 8, karbo: 2, lemak: 4.4, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 5, nama: 'Pisang', kategori: 'Buah', basis: 100, kkal: 90, protein: 1.1, karbo: 22, lemak: 0.3, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 6, nama: 'Pepaya', kategori: 'Buah', basis: 100, kkal: 40, protein: 0.5, karbo: 10, lemak: 0.1, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 7, nama: 'Yoghurt tawar', kategori: 'Susu & olahan', basis: 100, kkal: 60, protein: 6.7, karbo: 5, lemak: 1.5, sumber: SUMBER_DEFAULT, verifikasi: 'Perlu tinjau', aktif: true },
];

// GET /api/admin/foods - Ambil daftar katalog makanan
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Daftar katalog makanan berhasil diambil',
    data: foods,
  });
});

// POST /api/admin/foods - Tambah makanan baru ke katalog master (FIT-31)
router.post('/', (req, res) => {
  const {
    nama,
    kategori,
    basis = 100,
    kkal,
    protein,
    karbo,
    lemak,
    sumber,
    verifikasi = 'Perlu tinjau',
  } = req.body;

  // Validasi field wajib
  if (!nama || typeof nama !== 'string' || !nama.trim()) {
    return res.status(400).json({
      message: 'Nama makanan wajib diisi',
    });
  }

  if (!kategori || typeof kategori !== 'string' || !kategori.trim()) {
    return res.status(400).json({
      message: 'Kategori makanan wajib dipilih',
    });
  }

  const numBasis = Number(basis);
  const numKkal = Number(kkal);
  const numProtein = Number(protein);
  const numKarbo = Number(karbo);
  const numLemak = Number(lemak);

  if (Number.isNaN(numBasis) || numBasis <= 0) {
    return res.status(400).json({
      message: 'Basis berat harus berupa angka lebih dari 0',
    });
  }

  if (
    [numKkal, numProtein, numKarbo, numLemak].some(
      (n) => Number.isNaN(n) || n < 0
    )
  ) {
    return res.status(400).json({
      message: 'Energi (kkal), protein, karbo, dan lemak harus berupa angka >= 0',
    });
  }

  const newFood = {
    id: foods.length > 0 ? Math.max(...foods.map((f) => f.id)) + 1 : 1,
    nama: nama.trim(),
    kategori: kategori.trim(),
    basis: numBasis,
    kkal: numKkal,
    protein: numProtein,
    karbo: numKarbo,
    lemak: numLemak,
    sumber: sumber && String(sumber).trim() ? String(sumber).trim() : SUMBER_DEFAULT,
    verifikasi: verifikasi === 'Terverifikasi' ? 'Terverifikasi' : 'Perlu tinjau',
    aktif: true,
  };

  foods.push(newFood);

  return res.status(201).json({
    message: 'Makanan berhasil ditambahkan',
    data: newFood,
  });
});

// PUT /api/admin/foods/:id - Update data makanan
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = foods.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Makanan tidak ditemukan' });
  }

  const {
    nama,
    kategori,
    basis,
    kkal,
    protein,
    karbo,
    lemak,
    sumber,
    verifikasi,
    aktif,
  } = req.body;

  if (nama !== undefined && !String(nama).trim()) {
    return res.status(400).json({ message: 'Nama makanan wajib diisi' });
  }

  const updated = {
    ...foods[index],
    ...(nama !== undefined && { nama: String(nama).trim() }),
    ...(kategori !== undefined && { kategori: String(kategori).trim() }),
    ...(basis !== undefined && { basis: Number(basis) }),
    ...(kkal !== undefined && { kkal: Number(kkal) }),
    ...(protein !== undefined && { protein: Number(protein) }),
    ...(karbo !== undefined && { karbo: Number(karbo) }),
    ...(lemak !== undefined && { lemak: Number(lemak) }),
    ...(sumber !== undefined && { sumber: String(sumber).trim() || SUMBER_DEFAULT }),
    ...(verifikasi !== undefined && { verifikasi }),
    ...(typeof aktif === 'boolean' && { aktif }),
  };

  foods[index] = updated;

  return res.status(200).json({
    message: 'Perubahan makanan berhasil disimpan',
    data: updated,
  });
});

module.exports = router;

