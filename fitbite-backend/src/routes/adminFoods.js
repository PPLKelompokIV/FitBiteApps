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

// Helper validasi data gizi positif (FIT-32)
function validatePositiveNutrition(body) {
  const errors = {};
  const { nama, kategori, basis = 100, kkal, protein, karbo, lemak } = body;

  if (!nama || typeof nama !== 'string' || !nama.trim()) {
    errors.nama = 'Nama makanan wajib diisi';
  }

  if (!kategori || typeof kategori !== 'string' || !kategori.trim()) {
    errors.kategori = 'Kategori makanan wajib dipilih';
  }

  const numBasis = Number(basis);
  const numKkal = kkal === '' || kkal === undefined || kkal === null ? NaN : Number(kkal);
  const numProtein = protein === '' || protein === undefined || protein === null ? NaN : Number(protein);
  const numKarbo = karbo === '' || karbo === undefined || karbo === null ? NaN : Number(karbo);
  const numLemak = lemak === '' || lemak === undefined || lemak === null ? NaN : Number(lemak);

  if (Number.isNaN(numBasis) || numBasis <= 0) {
    errors.basis = 'Basis berat harus bernilai positif (> 0 g)';
  }

  if (Number.isNaN(numKkal) || numKkal <= 0) {
    errors.kkal = 'Energi (kkal) harus bernilai positif (> 0)';
  }

  if (Number.isNaN(numProtein) || numProtein < 0) {
    errors.protein = 'Protein harus bernilai positif (≥ 0 g)';
  }

  if (Number.isNaN(numKarbo) || numKarbo < 0) {
    errors.karbo = 'Karbohidrat harus bernilai positif (≥ 0 g)';
  }

  if (Number.isNaN(numLemak) || numLemak < 0) {
    errors.lemak = 'Lemak harus bernilai positif (≥ 0 g)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    parsed: {
      numBasis,
      numKkal,
      numProtein,
      numKarbo,
      numLemak,
    },
  };
}

// GET /api/admin/foods - Ambil daftar katalog makanan
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Daftar katalog makanan berhasil diambil',
    data: foods,
  });
});

// POST /api/admin/foods - Tambah makanan baru ke katalog master (FIT-31 & FIT-32)
router.post('/', (req, res) => {
  const { nama, kategori, sumber, verifikasi = 'Perlu tinjau' } = req.body;

  const validation = validatePositiveNutrition(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validasi data gizi gagal: pastikan seluruh nilai gizi bernilai positif',
      errors: validation.errors,
    });
  }

  const { numBasis, numKkal, numProtein, numKarbo, numLemak } = validation.parsed;

  // Cek duplikasi nama makanan (Unique Constraint)
  if (foods.some((f) => f.nama.trim().toLowerCase() === nama.trim().toLowerCase())) {
    return res.status(409).json({
      message: `Makanan dengan nama "${nama}" sudah ada di katalog.`,
      errors: { nama: 'Makanan dengan nama tersebut sudah ada di katalog' },
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
    message: `Data gizi "${newFood.nama}" (${newFood.kkal} kkal) berhasil divalidasi dan disimpan ke katalog.`,
    data: newFood,
  });
});

// PUT /api/admin/foods/:id - Update data makanan & validasi gizi positif (FIT-32)
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = foods.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Makanan tidak ditemukan' });
  }

  // Jika hanya toggle status aktif/nonaktif
  if (
    Object.keys(req.body).length === 1 &&
    typeof req.body.aktif === 'boolean'
  ) {
    foods[index] = { ...foods[index], aktif: req.body.aktif };
    return res.status(200).json({
      message: `Status "${foods[index].nama}" berhasil diubah menjadi ${req.body.aktif ? 'Aktif' : 'Nonaktif'}.`,
      data: foods[index],
    });
  }

  const mergedPayload = {
    ...foods[index],
    ...req.body,
  };

  const validation = validatePositiveNutrition(mergedPayload);
  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validasi data gizi gagal: pastikan seluruh nilai gizi bernilai positif',
      errors: validation.errors,
    });
  }

  const { numBasis, numKkal, numProtein, numKarbo, numLemak } = validation.parsed;

  const updated = {
    ...foods[index],
    nama: String(mergedPayload.nama).trim(),
    kategori: String(mergedPayload.kategori).trim(),
    basis: numBasis,
    kkal: numKkal,
    protein: numProtein,
    karbo: numKarbo,
    lemak: numLemak,
    sumber: String(mergedPayload.sumber || '').trim() || SUMBER_DEFAULT,
    verifikasi: mergedPayload.verifikasi === 'Terverifikasi' ? 'Terverifikasi' : 'Perlu tinjau',
    ...(typeof req.body.aktif === 'boolean' && { aktif: req.body.aktif }),
  };

  foods[index] = updated;

  return res.status(200).json({
    message: `Perubahan data gizi "${updated.nama}" berhasil divalidasi dan disimpan.`,
    data: updated,
  });
});

module.exports = router;
