import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdministratorNavigationSection } from './AdministratorNavigationSection';
import { AdminPageHeader } from './AdminPageHeader';
import { AdminSummaryCards } from './AdminSummaryCards';

// ─── Types ───────────────────────────────────────────────────────────────────

type Verifikasi = 'Terverifikasi' | 'Perlu tinjau';

interface Food {
  id: number;
  nama: string;
  kategori: string;
  basis: number;
  kkal: number;
  protein: number;
  karbo: number;
  lemak: number;
  sumber: string;
  verifikasi: Verifikasi;
  aktif: boolean;
}

interface FoodForm {
  nama: string;
  kategori: string;
  basis: string;
  kkal: string;
  protein: string;
  karbo: string;
  lemak: string;
  sumber: string;
  verifikasi: Verifikasi;
}

type FormErrors = Partial<Record<keyof FoodForm, string>>;

interface NotificationState {
  type: 'success' | 'error';
  title: string;
  message: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SUMBER_DEFAULT = 'Referensi internal v1 (contoh)';

const SEED_FOODS: Food[] = [
  { id: 1, nama: 'Nasi merah matang', kategori: 'Serealia', basis: 100, kkal: 110, protein: 2.6, karbo: 23, lemak: 0.9, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 2, nama: 'Ayam panggang', kategori: 'Lauk hewani', basis: 100, kkal: 183, protein: 21.7, karbo: 0, lemak: 10, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 3, nama: 'Tempe panggang', kategori: 'Lauk nabati', basis: 100, kkal: 193, protein: 13.3, karbo: 16, lemak: 6.7, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 4, nama: 'Tahu kukus', kategori: 'Lauk nabati', basis: 100, kkal: 80, protein: 8, karbo: 2, lemak: 4.4, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 5, nama: 'Pisang', kategori: 'Buah', basis: 100, kkal: 90, protein: 1.1, karbo: 22, lemak: 0.3, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 6, nama: 'Pepaya', kategori: 'Buah', basis: 100, kkal: 40, protein: 0.5, karbo: 10, lemak: 0.1, sumber: SUMBER_DEFAULT, verifikasi: 'Terverifikasi', aktif: true },
  { id: 7, nama: 'Yoghurt tawar', kategori: 'Susu & olahan', basis: 100, kkal: 60, protein: 6.7, karbo: 5, lemak: 1.5, sumber: SUMBER_DEFAULT, verifikasi: 'Perlu tinjau', aktif: true },
];

const KATEGORI_LIST = ['Serealia', 'Lauk hewani', 'Lauk nabati', 'Buah', 'Susu & olahan'];
const VERIFIKASI_LIST: Verifikasi[] = ['Terverifikasi', 'Perlu tinjau'];
const STATUS_LIST = ['Aktif', 'Nonaktif', 'Semua'];

const VERIFIKASI_BADGE: Record<Verifikasi, string> = {
  Terverifikasi: 'bg-green-100 text-green-700',
  'Perlu tinjau': 'bg-amber-100 text-amber-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fitbite_foods';
const API_URL = 'http://localhost:5000/api/admin/foods';

const fmt = (n: number | undefined | null): string =>
  typeof n === 'number' && !isNaN(n)
    ? n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
    : String(n ?? '');

const toNum = (s: string): number => {
  if (!s || !s.trim()) return NaN;
  return Number(s.trim().replace(',', '.'));
};

const EMPTY_FORM: FoodForm = {
  nama: '',
  kategori: '',
  basis: '100',
  kkal: '',
  protein: '',
  karbo: '',
  lemak: '',
  sumber: SUMBER_DEFAULT,
  verifikasi: 'Perlu tinjau',
};

const toForm = (f: Food): FoodForm => ({
  nama: f?.nama || '',
  kategori: f?.kategori || '',
  basis: fmt(f?.basis ?? 100),
  kkal: fmt(f?.kkal ?? 0),
  protein: fmt(f?.protein ?? 0),
  karbo: fmt(f?.karbo ?? 0),
  lemak: fmt(f?.lemak ?? 0),
  sumber: f?.sumber || SUMBER_DEFAULT,
  verifikasi: f?.verifikasi || 'Perlu tinjau',
});

// Validasi data gizi positif (FIT-32)
const validateFoodForm = (formData: FoodForm): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.nama.trim()) {
    errors.nama = 'Nama makanan wajib diisi';
  }

  if (!formData.kategori) {
    errors.kategori = 'Kategori makanan wajib dipilih';
  }

  const basis = toNum(formData.basis);
  if (Number.isNaN(basis) || basis <= 0) {
    errors.basis = 'Basis berat harus bernilai positif (> 0 g)';
  }

  const kkal = toNum(formData.kkal);
  if (Number.isNaN(kkal) || kkal <= 0) {
    errors.kkal = 'Energi wajib diisi angka positif (> 0 kkal)';
  }

  const protein = toNum(formData.protein);
  if (Number.isNaN(protein) || protein < 0) {
    errors.protein = 'Protein harus bernilai positif (≥ 0 g)';
  }

  const karbo = toNum(formData.karbo);
  if (Number.isNaN(karbo) || karbo < 0) {
    errors.karbo = 'Karbo harus bernilai positif (≥ 0 g)';
  }

  const lemak = toNum(formData.lemak);
  if (Number.isNaN(lemak) || lemak < 0) {
    errors.lemak = 'Lemak harus bernilai positif (≥ 0 g)';
  }

  return errors;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Svg: React.FC<{ size?: number; sw?: number; children: React.ReactNode }> = ({ size = 16, sw = 1.8, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const IconShield = () => <Svg size={16}><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /></Svg>;
const IconSearch = () => <Svg size={16}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>;
const IconPencil = () => <Svg size={16} sw={2}><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17l-1 3z" /><path d="M14 7l3 3" /></Svg>;
const IconPower = () => <Svg size={16} sw={2}><path d="M12 3v8" /><path d="M7 6.3a8 8 0 1 0 10 0" /></Svg>;
const IconPlus = () => <Svg size={16} sw={2.2}><path d="M12 5v14M5 12h14" /></Svg>;
const IconTick = () => <Svg size={16} sw={2.2}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
const IconAlert = () => <Svg size={16}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Svg>;
const IconClose = () => <Svg size={14} sw={2.2}><path d="M18 6L6 18M6 6l12 12" /></Svg>;
const IconScale = () => (
  <Svg size={16}>
    <path d="M12 3v18M7 21h10" />
    <path d="M5 7h14" />
    <path d="M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7zM19 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7z" />
  </Svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AdminPengelolaan: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_FOODS;
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('Aktif');
  const [currentItem, setCurrentItem] = useState<Food | null>(() => SEED_FOODS[0] || null);
  const [formData, setFormData] = useState<FoodForm>(() =>
    SEED_FOODS[0] ? toForm(SEED_FOODS[0]) : EMPTY_FORM
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  useEffect(() => {
    if (!notification || notification.type !== 'success') return;
    const timer = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timer);
  }, [notification]);

  const saveFoods = (updated: Food[]): void => {
    setFoods([...updated]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const fetchFoods = async (): Promise<void> => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timer);
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result.data) && result.data.length > 0) {
          const list = result.data as Food[];
          setFoods([...list]);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          } catch {}
          if (!currentItem && list.length > 0) {
            setCurrentItem(list[0]);
            setFormData(toForm(list[0]));
          }
        }
      }
    } catch {
      // Data lokal sudah tampil secara instan dari SEED_FOODS
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, []);

  const setField = <K extends keyof FoodForm>(key: K, value: FoodForm[K]): void => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleAddNew = (): void => {
    setIsAddMode(true);
    setCurrentItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setNotification(null);
  };

  const handleEdit = (item: Food): void => {
    setIsAddMode(false);
    setCurrentItem(item);
    setFormData(toForm(item));
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const errors = validateFoodForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setNotification({
        type: 'error',
        title: 'Validasi Data Gizi Gagal',
        message: 'Pastikan seluruh nilai gizi (energi, protein, karbo, lemak, dan basis berat) bernilai positif dan tidak kosong.',
      });
      return;
    }

    setFormErrors({});

    const basis = toNum(formData.basis);
    const kkal = toNum(formData.kkal);
    const protein = toNum(formData.protein);
    const karbo = toNum(formData.karbo);
    const lemak = toNum(formData.lemak);

    const values = {
      nama: formData.nama.trim(),
      kategori: formData.kategori,
      basis,
      kkal,
      protein,
      karbo,
      lemak,
      sumber: formData.sumber.trim() || SUMBER_DEFAULT,
      verifikasi: formData.verifikasi,
    };

    if (isAddMode || !currentItem) {
      if (foods.some(f => f.nama.trim().toLowerCase() === values.nama.toLowerCase())) {
        setFormErrors({ nama: 'Makanan dengan nama tersebut sudah ada di katalog' });
        setNotification({
          type: 'error',
          title: 'Validasi Data Gizi Gagal',
          message: 'Makanan dengan nama tersebut sudah ada di katalog.',
        });
        return;
      }

      const tempId = Date.now();
      const newItem: Food = { id: tempId, aktif: true, ...values };
      const successMsg = `Data gizi "${values.nama}" (${fmt(values.kkal)} kkal) berhasil divalidasi dan disimpan ke katalog.`;

      // ── 1. RESPON INSTAN (MILIDETIK): Langsung update UI & LocalStorage tanpa tunggu network ──
      setFoods(prev => {
        const next = [...prev, newItem];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      setIsAddMode(false);
      setCurrentItem(newItem);
      setFormData(toForm(newItem));
      setFormErrors({});
      setNotification({
        type: 'success',
        title: 'Berhasil Disimpan!',
        message: successMsg,
      });

      // ── 2. BACKGROUND SYNC (Non-blocking): Sinkronisasi dengan server di latar belakang ──
      (async () => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2500);
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (response.ok) {
            const result = await response.json();
            if (result.data?.id) {
              const serverItem = result.data as Food;
              setFoods(prev => {
                const next = prev.map(f => (f.id === tempId ? serverItem : f));
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
                return next;
              });
              setCurrentItem(prev => (prev?.id === tempId ? serverItem : prev));
            }
          }
        } catch {}
      })();
    } else if (currentItem) {
      const targetId = currentItem.id;
      const updatedItem: Food = { ...currentItem, ...values };
      const successMsg = `Perubahan data gizi "${values.nama}" berhasil divalidasi dan disimpan.`;

      // ── 1. RESPON INSTAN (MILIDETIK): Langsung update baris tabel & form seketika ──
      setFoods(prev => {
        const next = prev.map(f =>
          String(f.id) === String(targetId) ? updatedItem : f
        );
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      setCurrentItem(updatedItem);
      setFormData(toForm(updatedItem));
      setFormErrors({});
      setNotification({
        type: 'success',
        title: 'Perubahan Berhasil Disimpan!',
        message: successMsg,
      });

      // ── 2. BACKGROUND SYNC (Non-blocking): Sinkronisasi PUT ke server di latar belakang ──
      (async () => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2500);
          const response = await fetch(`${API_URL}/${targetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (response.ok) {
            const result = await response.json();
            if (result.data) {
              const serverItem = result.data as Food;
              setFoods(prev => {
                const next = prev.map(f => (String(f.id) === String(targetId) ? serverItem : f));
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
                return next;
              });
              setCurrentItem(prev => (String(prev?.id) === String(targetId) ? serverItem : prev));
            }
          }
        } catch {}
      })();
    }
  };

  const handleToggleAktif = (id: number): void => {
    const target = foods.find(f => String(f.id) === String(id));
    if (!target) return;
    const next = !target.aktif;
    if (!next && !confirm('Nonaktifkan makanan ini? Catatan lama pengguna tetap tersimpan.')) return;

    // ── 1. RESPON INSTAN (MILIDETIK): Langsung toggle status aktif di layar ──
    setFoods(prev => {
      const updated = prev.map(f =>
        String(f.id) === String(id) ? { ...f, aktif: next } : f
      );
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (String(currentItem?.id) === String(id)) {
      const updatedCurrent = { ...target, aktif: next };
      setCurrentItem(updatedCurrent);
      setFormData(toForm(updatedCurrent));
    }

    setNotification({
      type: 'success',
      title: next ? 'Makanan Diaktifkan' : 'Makanan Dinonaktifkan',
      message: `Status "${target.nama}" berhasil diubah menjadi ${next ? 'Aktif' : 'Nonaktif'}.`,
    });

    // ── 2. BACKGROUND SYNC (Non-blocking): Update ke server di latar belakang ──
    (async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aktif: next }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch {}
    })();
  };

  const filtered = (Array.isArray(foods) ? foods : []).filter(f => {
    if (!f) return false;
    const name = String(f.nama || '').toLowerCase();
    const kat = String(f.kategori || '').toLowerCase();
    const q = String(search || '').toLowerCase();
    const matchSearch = name.includes(q) || kat.includes(q);
    const matchKategori = filterKategori === 'semua' || f.kategori === filterKategori;
    const matchStatus =
      filterStatus === 'Semua' || (filterStatus === 'Aktif' ? Boolean(f.aktif) : !f.aktif);
    return matchSearch && matchKategori && matchStatus;
  });

  const baseInputCls =
    'w-full text-sm rounded-lg px-3 py-2 outline-none transition-colors duration-200';
  const getInputCls = (field?: keyof FoodForm): string =>
    field && formErrors[field]
      ? `${baseInputCls} border border-red-400 bg-red-50/40 text-red-900 focus:border-red-600`
      : `${baseInputCls} border border-[#d0dbd5] bg-white focus:border-[#124b39]`;
  const labelCls = 'text-xs font-medium text-[#4a7060]';

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-tab-content {
          animation: fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Toast Notifikasi Melayang di Kanan Atas (FIT-32) */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          data-testid="toast-notifikasi"
          data-status={notification.type}
          className={`fixed top-5 right-6 z-50 max-w-md flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg border animate-tab-content ${
            notification.type === 'success'
              ? 'bg-[#eaf3e9] border-[#167653]/30 text-[#124b39]'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              notification.type === 'success'
                ? 'bg-[#124b39] text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {notification.type === 'success' ? <IconTick /> : <IconAlert />}
          </span>
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm">{notification.title}</p>
            <p className="mt-0.5 leading-relaxed">{notification.message}</p>
          </div>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => setNotification(null)}
            className="opacity-70 hover:opacity-100 p-1 rounded-md transition-opacity"
          >
            <IconClose />
          </button>
        </div>
      )}

      <div className="flex h-screen items-start overflow-hidden bg-[#f6f7f2] text-[#1d2926]">
        <AdministratorNavigationSection />

        <main className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col">
          <AdminPageHeader currentPage="Katalog makanan" />

          <div className="flex flex-col gap-5 p-8">
            {/* Hero */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-[#124b39]">PENGELOLAAN FITBITE</p>
                <h1 className="text-3xl font-medium tracking-tight text-[#1d2926] mt-1">
                  Referensi rapi, pengalaman lebih baik.
                </h1>
                <p className="text-xs text-[#6b8c7a] mt-1.5">Ruang administrator • Senin, 19 Oktober 2026</p>
              </div>
              <button
                type="button"
                data-testid="btn-tambah-makanan"
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-[#124b39] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0e3a2c] hover:shadow-md transition-all duration-300 whitespace-nowrap active:scale-95"
              >
                <IconPlus /> Tambah makanan
              </button>
            </div>

            {/* Banner */}
            <div className="flex items-center gap-2 bg-[#eaf3e9] text-[#124b39] text-xs rounded-lg px-4 py-2.5">
              <IconShield />
              <span>
                Batas akses admin: katalog makanan, aktivitas &amp; MET, serta metadata akun. Berat badan, profil
                kesehatan, foto, dan jurnal pribadi tidak tersedia di area ini.
              </span>
            </div>

            {/* Stats */}
            <AdminSummaryCards />

            {/* Tabs */}
            <div role="tablist" className="grid grid-cols-3 bg-[#eaf3e9] rounded-xl p-1 relative">
              <button
                type="button"
                role="tab"
                aria-selected="true"
                aria-current="page"
                className="py-2 text-sm rounded-lg relative z-10 bg-white font-bold text-[#124b39] shadow-sm transform scale-[1.02]"
              >
                Katalog makanan
              </button>
              <Link
                to="/admin/aktivitas"
                role="tab"
                aria-selected="false"
                className="py-2 text-center text-sm rounded-lg transition-all duration-300 ease-out relative z-10 text-[#4a7060] hover:bg-white/40"
              >
                Aktivitas &amp; MET
              </Link>
              <Link
                to="/admin/pantau"
                role="tab"
                aria-selected="false"
                className="py-2 text-center text-sm rounded-lg transition-all duration-300 ease-out relative z-10 text-[#4a7060] hover:bg-white/40"
              >
                Akun pengguna
              </Link>
            </div>

            {/* AREA KONTEN TAB DENGAN ANIMASI */}
            <div className="animate-tab-content">
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
                {/* Tabel */}
                <section className="bg-white rounded-2xl border border-[#e1e7df] p-6 shadow-sm min-w-0">
                  <h2 className="text-base font-bold text-[#1d2926]">Katalog makanan</h2>
                  <p className="text-xs text-[#6b8c7a] mt-0.5">
                    Nilai referensi per 100 g bahan matang, kecuali disebut lain.
                  </p>

                  <div className="grid grid-cols-[1fr_140px_120px] gap-3 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Cari makanan</label>
                      <div className="relative">
                        <input
                          type="text"
                          data-testid="input-cari"
                          placeholder="Cari nama atau kategori..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className={`${getInputCls()} pr-9 transition-shadow focus:shadow-sm`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7060] pointer-events-none">
                          <IconSearch />
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Kategori</label>
                      <select data-testid="filter-kategori" value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className={getInputCls()}>
                        <option value="semua">Semua</option>
                        {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Status</label>
                      <select data-testid="filter-status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={getInputCls()}>
                        {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-32 text-sm text-[#6b8c7a]">Memuat data...</div>
                    ) : filtered.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-sm text-[#6b8c7a]">Tidak ada data.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-[#f0f5f2] text-[11px] text-[#6b8c7a] uppercase tracking-wide">
                          <tr>
                            <th className="text-left px-4 py-3 rounded-l-lg">Makanan</th>
                            <th className="text-right px-2 py-3">Basis</th>
                            <th className="text-right px-2 py-3">Kkal</th>
                            <th className="text-right px-2 py-3">P (g)</th>
                            <th className="text-right px-2 py-3">K (g)</th>
                            <th className="text-right px-2 py-3">L (g)</th>
                            <th className="text-center px-3 py-3">Verifikasi</th>
                            <th className="text-center px-3 py-3 rounded-r-lg">Aksi</th>
                          </tr>
                        </thead>
                        <tbody data-testid="tabel-makanan">
                          {filtered.map(f => (
                            <tr
                              key={f.id}
                              data-testid="baris-makanan"
                              onClick={() => handleEdit(f)}
                              className={`border-t border-[#f0f5f2] cursor-pointer transition-all duration-200 ${
                                currentItem?.id === f.id ? 'bg-[#eaf3e9]' : 'hover:bg-[#f6f9f7]'
                              } ${f.aktif ? '' : 'opacity-60 grayscale-[30%]'}`}
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium text-[#1d2926]">{f.nama}</p>
                                <p className="text-xs text-[#6b8c7a] mt-0.5">{f.kategori}</p>
                              </td>
                              <td className="px-2 py-3 text-right whitespace-nowrap text-[#4a7060]">{fmt(f.basis)} g</td>
                              <td className="px-2 py-3 text-right font-bold text-[#1d2926]">{fmt(f.kkal)}</td>
                              <td className="px-2 py-3 text-right text-[#4a7060]">{fmt(f.protein)}</td>
                              <td className="px-2 py-3 text-right text-[#4a7060]">{fmt(f.karbo)}</td>
                              <td className="px-2 py-3 text-right text-[#4a7060]">{fmt(f.lemak)}</td>
                              <td className="px-3 py-3 text-center">
                                <span
                                  className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors duration-200 ${VERIFIKASI_BADGE[f.verifikasi]}`}
                                >
                                  {f.verifikasi}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    type="button"
                                    aria-label={`Edit ${f.nama}`}
                                    onClick={e => { e.stopPropagation(); handleEdit(f); }}
                                    className="text-[#124b39] hover:text-[#0e3a2c] hover:bg-[#eaf3e9] p-1.5 rounded-md transition-colors"
                                  >
                                    <IconPencil />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={f.aktif ? `Nonaktifkan ${f.nama}` : `Aktifkan ${f.nama}`}
                                    onClick={e => { e.stopPropagation(); handleToggleAktif(f.id); }}
                                    className="text-[#6b8c7a] hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                  >
                                    <IconPower />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#e1e7df] mt-2 pt-3 text-xs text-[#6b8c7a]">
                    <span>Menampilkan 1–{filtered.length} dari 126 makanan</span>
                    <span className="tracking-wide">
                      ‹ <b className="text-[#124b39]">1</b> 2 3 … 18 ›
                    </span>
                  </div>
                  <p className="border-t border-[#e1e7df] mt-3 pt-3 text-xs text-[#6b8c7a] leading-relaxed">
                    Semua angka pada mockup adalah data contoh. Status verifikasi adalah contoh alur pengelolaan, bukan
                    klaim validasi klinis.
                  </p>
                </section>

                {/* Form edit + catatan */}
                <div className="flex flex-col gap-4 min-w-0">
                  <aside className="flex flex-col bg-white rounded-2xl border border-[#e1e7df] p-6 gap-4 shadow-sm transition-all duration-300">
                    <div>
                      <h2 className="text-base font-bold text-[#1d2926]">
                        {isAddMode || !currentItem ? 'Tambah makanan' : 'Edit makanan'}
                      </h2>
                      <p className="text-xs text-[#6b8c7a] mt-0.5">
                        {isAddMode || !currentItem
                          ? 'Entri baru • validasi gizi positif aktif'
                          : `${currentItem?.nama ?? '-'} • entri ${currentItem?.aktif ? 'aktif' : 'nonaktif'}`}
                      </p>
                    </div>

                    {/* Banner Inline Notifikasi Sukses / Error di dalam Form (FIT-32) */}
                    {notification && (
                      <div
                        className={`flex items-start gap-2.5 p-3 rounded-xl text-xs border animate-tab-content ${
                          notification.type === 'success'
                            ? 'bg-[#eaf3e9] border-[#167653]/30 text-[#124b39]'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {notification.type === 'success' ? <IconTick /> : <IconAlert />}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold">{notification.title}</p>
                          <p className="mt-0.5 leading-relaxed">{notification.message}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
                      <div className="flex flex-col gap-1">
                        <label className={labelCls}>Nama makanan</label>
                        <input
                          type="text"
                          data-testid="input-nama"
                          value={formData.nama}
                          onChange={e => setField('nama', e.target.value)}
                          placeholder="cth. Nasi merah matang"
                          className={getInputCls('nama')}
                        />
                        {formErrors.nama && (
                          <span data-testid="error-nama" className="text-[11px] text-red-600 font-medium">{formErrors.nama}</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className={labelCls}>Kategori</label>
                        <select
                          data-testid="select-kategori"
                          value={formData.kategori}
                          onChange={e => setField('kategori', e.target.value)}
                          className={getInputCls('kategori')}
                        >
                          <option value="">Pilih kategori</option>
                          {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        {formErrors.kategori && (
                          <span className="text-[11px] text-red-600 font-medium">{formErrors.kategori}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className={labelCls}>Basis berat</label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              data-testid="input-basis"
                              value={formData.basis}
                              onChange={e => setField('basis', e.target.value)}
                              className={`${getInputCls('basis')} pr-8`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b8c7a] pointer-events-none">g</span>
                          </div>
                          {formErrors.basis && (
                            <span data-testid="error-basis" className="text-[10px] text-red-600 font-medium leading-tight">{formErrors.basis}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className={labelCls}>Energi</label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              data-testid="input-kkal"
                              value={formData.kkal}
                              onChange={e => setField('kkal', e.target.value)}
                              placeholder="> 0"
                              className={`${getInputCls('kkal')} pr-11`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b8c7a] pointer-events-none">kkal</span>
                          </div>
                          {formErrors.kkal && (
                            <span data-testid="error-kkal" className="text-[10px] text-red-600 font-medium leading-tight">{formErrors.kkal}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {([
                          ['Protein', 'protein'],
                          ['Karbo', 'karbo'],
                          ['Lemak', 'lemak'],
                        ] as const).map(([label, key]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <label className={labelCls}>{label}</label>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                data-testid={`input-${key}`}
                                value={formData[key]}
                                onChange={e => setField(key, e.target.value)}
                                placeholder="≥ 0"
                                className={`${getInputCls(key)} pr-7 px-2`}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b8c7a] pointer-events-none">g</span>
                            </div>
                            {formErrors[key] && (
                              <span data-testid={`error-${key}`} className="text-[10px] text-red-600 font-medium leading-tight">{formErrors[key]}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className={labelCls}>Sumber referensi</label>
                        <input
                          type="text"
                          value={formData.sumber}
                          onChange={e => setField('sumber', e.target.value)}
                          className={getInputCls('sumber')}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className={labelCls}>Status verifikasi</label>
                        <select
                          value={formData.verifikasi}
                          onChange={e => setField('verifikasi', e.target.value as Verifikasi)}
                          className={getInputCls('verifikasi')}
                        >
                          {VERIFIKASI_LIST.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          type="submit"
                          data-testid="btn-simpan"
                          className="flex items-center justify-center gap-2 bg-[#124b39] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#0e3a2c] active:scale-[0.98] transition-all duration-200"
                        >
                          <IconTick /> {isAddMode || !currentItem ? 'Tambah makanan' : 'Simpan perubahan'}
                        </button>
                        {!isAddMode && currentItem && (
                          <button
                            type="button"
                            onClick={() => handleToggleAktif(currentItem.id)}
                            className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 active:scale-[0.98] transition-all duration-200"
                          >
                            <IconPower /> {currentItem.aktif ? 'Nonaktifkan makanan' : 'Aktifkan makanan'}
                          </button>
                        )}
                      </div>

                      {!isAddMode ? (
                        <p className="text-xs text-[#6b8c7a] leading-relaxed mt-2 text-center">
                          Nonaktif menghilangkan entri dari pilihan baru, bukan menghapus catatan lama pengguna.
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEdit(currentItem || foods[0] || SEED_FOODS[0])}
                          className="text-xs text-[#6b8c7a] hover:text-[#1d2926] hover:underline text-center mt-2 transition-colors"
                        >
                          Batal
                        </button>
                      )}
                    </form>
                  </aside>

                  <div className="flex gap-2 bg-[#eaf3e9] text-[#124b39] text-xs rounded-xl p-4 leading-relaxed border border-[#cfe2d3]">
                    <span className="mt-0.5 shrink-0"><IconScale /></span>
                    <p>
                      Katalog memakai nilai per 100 g. Jurnal pengguna memakai porsi yang dipilih: 150 g nasi merah = 165
                      kkal. Jangan mencampur kedua basis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-auto flex items-center justify-between px-8 pb-6 text-xs text-[#6b8c7a]">
            <span>Area administrasi • Tidak memuat data kesehatan pribadi pengguna.</span>
            <span>FitBite © 2026</span>
          </footer>
        </main>
      </div>
    </>
  );
};

export default AdminPengelolaan;
