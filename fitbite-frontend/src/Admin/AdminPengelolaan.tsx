import React, { useState, useEffect } from 'react';
import { AdministratorNavigationSection } from './AdministratorNavigationSection';

// ─── Types ───────────────────────────────────────────────────────────────────

type Verifikasi = 'Terverifikasi' | 'Perlu tinjau';
type TabKey = 'katalog' | 'aktivitas' | 'akun';

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

interface ActivityPreview {
  id: number;
  nama: string;
  met: string;
}

interface UserPreview {
  id: number;
  nama: string;
  email: string;
  dibuat: string;
  akses: string;
  aktif: boolean;
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

const SEED_ACTIVITY_PREVIEW: ActivityPreview[] = [
  { id: 1, nama: 'Jalan kaki sedang', met: '3,5' },
  { id: 2, nama: 'Lari santai', met: '7,0' },
  { id: 3, nama: 'Bersepeda intens', met: '6,0' },
  { id: 4, nama: 'Yoga', met: '2,5' },
];

const SEED_USER_PREVIEW: UserPreview[] = [
  { id: 1, nama: 'Nadia Putri', email: 'nadia.putri@email.com', dibuat: '5 Okt 2026', akses: '19 Okt, 18.30', aktif: true },
  { id: 2, nama: 'Dewi Lestari', email: 'dewi.l@email.com', dibuat: '8 Okt 2026', akses: '19 Okt, 09.10', aktif: true },
  { id: 3, nama: 'Andi Saputra', email: 'andi.s@email.com', dibuat: '10 Okt 2026', akses: '15 Okt, 17.20', aktif: false },
];

const KATEGORI_LIST = ['Serealia', 'Lauk hewani', 'Lauk nabati', 'Buah', 'Susu & olahan'];
const VERIFIKASI_LIST: Verifikasi[] = ['Terverifikasi', 'Perlu tinjau'];
const STATUS_LIST = ['Aktif', 'Nonaktif', 'Semua'];

const STATS = [
  { label: 'Makanan dalam katalog', value: '126', sub: '118 aktif • 8 nonaktif', icon: 'fork', highlight: false },
  { label: 'Referensi terverifikasi', value: '112', sub: '14 menunggu tinjauan', icon: 'check', highlight: true },
  { label: 'Aktivitas & MET', value: '18', sub: '6 kategori aktivitas utama', icon: 'activity', highlight: false },
  { label: 'Akun pengguna', value: '248', sub: '240 aktif • 8 nonaktif', icon: 'users', highlight: false },
];

const VERIFIKASI_BADGE: Record<Verifikasi, string> = {
  Terverifikasi: 'bg-green-100 text-green-700',
  'Perlu tinjau': 'bg-amber-100 text-amber-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fitbite_foods';

const fmt = (n: number): string =>
  n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

const toNum = (s: string): number => parseFloat(s.replace(',', '.'));

// Layout kolom memakai inline style agar tidak bergantung pada class grid-cols Tailwind
const gridStyle = (cols: string): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: cols,
});

const ACT_GRID: React.CSSProperties = gridStyle('minmax(0, 1fr) 56px 80px 28px');

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent): void => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
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
  nama: f.nama,
  kategori: f.kategori,
  basis: fmt(f.basis),
  kkal: fmt(f.kkal),
  protein: fmt(f.protein),
  karbo: fmt(f.karbo),
  lemak: fmt(f.lemak),
  sumber: f.sumber,
  verifikasi: f.verifikasi,
});

const readActivityPreview = (): ActivityPreview[] => {
  try {
    const saved = localStorage.getItem('fitbite_activities');
    if (!saved) return SEED_ACTIVITY_PREVIEW;
    const list = JSON.parse(saved) as ActivityPreview[];
    return list.length ? list.slice(0, 4) : SEED_ACTIVITY_PREVIEW;
  } catch {
    return SEED_ACTIVITY_PREVIEW;
  }
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const Svg: React.FC<{ size?: number; sw?: number; children: React.ReactNode }> = ({ size = 16, sw = 1.8, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const IconShield = () => (
  <Svg size={16}><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" /></Svg>
);
const IconSearch = () => (
  <Svg size={16}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>
);
const IconPencil = () => (
  <Svg size={16} sw={2}><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17l-1 3z" /><path d="M14 7l3 3" /></Svg>
);
const IconPower = () => (
  <Svg size={16} sw={2}><path d="M12 3v8" /><path d="M7 6.3a8 8 0 1 0 10 0" /></Svg>
);
const IconPlus = () => (
  <Svg size={16} sw={2.2}><path d="M12 5v14M5 12h14" /></Svg>
);
const IconTick = () => (
  <Svg size={16} sw={2.2}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>
);
const IconArrow = () => (
  <Svg size={14} sw={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
);
const IconScale = () => (
  <Svg size={16}>
    <path d="M12 3v18M7 21h10" />
    <path d="M5 7h14" />
    <path d="M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7zM19 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7z" />
  </Svg>
);

const StatIcon: React.FC<{ name: string }> = ({ name }) => {
  if (name === 'fork')
    return (
      <Svg size={18}>
        <path d="M6 3v7a2 2 0 0 0 2 2v9" /><path d="M4 3v6M10 3v6M8 3v9" /><path d="M17 21V3c-2.5 1-4 3.5-4 7 0 2 1 3 4 3" />
      </Svg>
    );
  if (name === 'check')
    return (
      <Svg size={18}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></Svg>
    );
  if (name === 'activity')
    return (
      <Svg size={18}><path d="M3 12h4l3-8 4 16 3-8h4" /></Svg>
    );
  return (
    <Svg size={18}>
      <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6" /><path d="M18 14.8c2 .7 3.2 2.5 3.5 5.2" />
    </Svg>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminPengelolaan: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('katalog');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('Aktif');
  const [formData, setFormData] = useState<FoodForm>(EMPTY_FORM);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Food | null>(null);
  const [activityPreview, setActivityPreview] = useState<ActivityPreview[]>(SEED_ACTIVITY_PREVIEW);

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const saveFoods = (updated: Food[]): void => {
    setFoods(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const fetchFoods = (): void => {
    setLoading(true);
    let list: Food[] = SEED_FOODS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) list = JSON.parse(saved) as Food[];
    } catch {
      list = SEED_FOODS;
    } finally {
      setFoods(list);
      if (list.length) {
        setIsAddMode(false);
        setCurrentItem(list[0]);
        setFormData(toForm(list[0]));
      }
      setActivityPreview(readActivityPreview());
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, []);

  const setField = <K extends keyof FoodForm>(key: K, value: FoodForm[K]): void =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleAddNew = (): void => {
    setTab('katalog');
    setIsAddMode(true);
    setCurrentItem(null);
    setFormData(EMPTY_FORM);
  };

  const handleEdit = (item: Food): void => {
    setIsAddMode(false);
    setCurrentItem(item);
    setFormData(toForm(item));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!formData.nama.trim()) { alert('Nama makanan wajib diisi'); return; }
    if (!formData.kategori) { alert('Kategori wajib dipilih'); return; }

    const basis = toNum(formData.basis);
    const kkal = toNum(formData.kkal);
    const protein = toNum(formData.protein);
    const karbo = toNum(formData.karbo);
    const lemak = toNum(formData.lemak);

    if (isNaN(basis) || basis <= 0) { alert('Basis berat harus berupa angka > 0'); return; }
    if ([kkal, protein, karbo, lemak].some(n => isNaN(n) || n < 0)) {
      alert('Energi, protein, karbo, dan lemak harus berupa angka ≥ 0');
      return;
    }

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

    if (isAddMode) {
      const newItem: Food = { id: Date.now(), aktif: true, ...values };
      saveFoods([...foods, newItem]);
      alert('Makanan berhasil ditambahkan');
      handleEdit(newItem);
    } else if (currentItem) {
      const updatedItem: Food = { ...currentItem, ...values };
      saveFoods(foods.map(f => (f.id === currentItem.id ? updatedItem : f)));
      setCurrentItem(updatedItem);
      alert('Perubahan berhasil disimpan');
    }
  };

  const handleToggleAktif = (id: number): void => {
    const target = foods.find(f => f.id === id);
    if (!target) return;
    const next = !target.aktif;
    if (!next && !confirm('Nonaktifkan makanan ini? Catatan lama pengguna tetap tersimpan.')) return;
    saveFoods(foods.map(f => (f.id === id ? { ...f, aktif: next } : f)));
    if (currentItem?.id === id) setCurrentItem({ ...target, aktif: next });
  };

  const filtered = foods.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = f.nama.toLowerCase().includes(q) || f.kategori.toLowerCase().includes(q);
    const matchKategori = filterKategori === 'semua' || f.kategori === filterKategori;
    const matchStatus =
      filterStatus === 'Semua' || (filterStatus === 'Aktif' ? f.aktif : !f.aktif);
    return matchSearch && matchKategori && matchStatus;
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'katalog', label: 'Katalog makanan' },
    { key: 'aktivitas', label: 'Aktivitas & MET' },
    { key: 'akun', label: 'Akun pengguna' },
  ];

  const breadcrumbLabel =
    tab === 'katalog' ? 'Katalog makanan' : tab === 'aktivitas' ? 'Aktivitas & MET' : 'Akun pengguna';

  const inputCls =
    'w-full text-sm border border-[#d0dbd5] rounded-lg px-3 py-2 outline-none focus:border-[#124b39] bg-white';
  const labelCls = 'text-xs font-medium text-[#4a7060]';

  // ── Kartu pratinjau ──
  const ActivityCard = ({ preview }: { preview: boolean }) => (
    <section className="bg-white rounded-2xl border border-[#e1e7df] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1d2926]">Aktivitas &amp; MET</h2>
          <p className="text-xs text-[#6b8c7a] mt-0.5">
            {preview ? 'Pratinjau tab • ' : ''}referensi estimasi pembakaran
          </p>
        </div>
        {preview && (
          <button
            type="button"
            onClick={() => setTab('aktivitas')}
            className="flex items-center gap-1 text-xs font-semibold text-[#124b39] hover:underline whitespace-nowrap"
          >
            Buka katalog <IconArrow />
          </button>
        )}
      </div>

      <div
        style={ACT_GRID}
        className="mt-4 items-center gap-2 border-b border-[#e1e7df] pb-2 text-[11px] uppercase tracking-wide text-[#6b8c7a]"
      >
        <span>Aktivitas</span>
        <span className="text-right">MET</span>
        <span className="text-center">Status</span>
        <span />
      </div>
      {activityPreview.map(a => (
        <div key={a.id} style={ACT_GRID} className="items-center gap-2 py-3 text-sm">
          <span className="font-medium">{a.nama}</span>
          <span className="text-right font-mono">{a.met}</span>
          <span className="text-center">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Aktif</span>
          </span>
          <span className="text-[#124b39]"><IconPencil /></span>
        </div>
      ))}

      <p className="border-t border-[#e1e7df] mt-1 pt-3 text-xs text-[#6b8c7a] leading-relaxed">
        Estimasi kkal = MET × 3,5 × berat (kg) ÷ 200 × menit. Admin mengelola MET, bukan berat pengguna.
      </p>
      <button
        type="button"
        className="mt-3 w-full flex items-center justify-center gap-2 border border-[#d0dbd5] text-[#124b39] text-sm font-medium py-2 rounded-lg hover:bg-[#f0f5f2] transition-colors"
      >
        <IconPlus /> Tambah aktivitas
      </button>
    </section>
  );

  const UserCard = ({ preview }: { preview: boolean }) => (
    <section className="bg-white rounded-2xl border border-[#e1e7df] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1d2926]">Akun pengguna</h2>
          <p className="text-xs text-[#6b8c7a] mt-0.5">{preview ? 'Pratinjau tab • ' : ''}metadata akun saja</p>
        </div>
        {preview && (
          <button
            type="button"
            onClick={() => setTab('akun')}
            className="flex items-center gap-1 text-xs font-semibold text-[#124b39] hover:underline whitespace-nowrap"
          >
            Lihat akun <IconArrow />
          </button>
        )}
      </div>

      <div className="mt-2">
        {SEED_USER_PREVIEW.map(u => (
          <div key={u.id} className="border-b border-[#e1e7df] py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{u.nama}</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  u.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {u.aktif ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <p className="text-xs text-[#6b8c7a] mt-0.5">{u.email}</p>
            <div className="flex justify-between text-[11px] text-[#8aa395] mt-2">
              <span>Pengguna • Dibuat {u.dibuat}</span>
              <span>Akses {u.akses}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="pt-3 text-xs text-[#6b8c7a] leading-relaxed">
        Kontrol akun: cari, filter status, ubah status aktif/nonaktif. Tidak ada akses ke data kesehatan atau isi
        jurnal.
      </p>
    </section>
  );

  return (
    <div className="flex h-screen items-start overflow-hidden bg-[#f6f7f2] text-[#1d2926]">
      <AdministratorNavigationSection />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-[#e1e7df] bg-white">
          <nav className="flex items-center gap-2 text-xs text-[#6b8c7a]" aria-label="Breadcrumb">
            <span>Pengelolaan</span>
            <span aria-hidden="true">›</span>
            <span className="font-semibold text-[#1d2926]">{breadcrumbLabel}</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#eaf0e8] text-[#4a7060]">Data contoh</span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-[#124b39]">
              Akses terbatas
            </span>
          </div>
        </header>

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
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-[#124b39] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0e3a2c] transition-colors whitespace-nowrap"
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
          <div
            className="gap-4"
            style={gridStyle(isDesktop ? 'repeat(4, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))')}
          >
            {STATS.map(s => (
              <div
                key={s.label}
                className={`rounded-2xl border px-5 py-4 ${
                  s.highlight ? 'bg-[#eaf3e9] border-[#cfe2d3]' : 'bg-white border-[#e1e7df]'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-[#6b8c7a]">
                  <span>{s.label}</span>
                  <span className="text-[#124b39]"><StatIcon name={s.icon} /></span>
                </div>
                <p className="text-3xl font-semibold tracking-tight mt-3">{s.value}</p>
                <p className="text-xs text-[#6b8c7a] mt-1.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            className="bg-[#eaf3e9] rounded-xl p-1"
            style={gridStyle('repeat(3, minmax(0, 1fr))')}
          >
            {tabs.map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`py-2 text-sm rounded-lg transition-colors ${
                  tab === t.key
                    ? 'bg-white font-bold text-[#124b39] shadow-sm'
                    : 'text-[#4a7060] hover:bg-white/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Katalog */}
          {tab === 'katalog' && (
            <div
              className="gap-6"
              style={{
                ...gridStyle(isDesktop ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)'),
                alignItems: 'start',
              }}
            >
              {/* Tabel */}
              <section className="bg-white rounded-2xl border border-[#e1e7df] p-6 min-w-0">
                <h2 className="text-base font-bold text-[#1d2926]">Katalog makanan</h2>
                <p className="text-xs text-[#6b8c7a] mt-0.5">
                  Nilai referensi per 100 g bahan matang, kecuali disebut lain.
                </p>

                <div className="gap-3 mt-4" style={gridStyle('minmax(0, 1fr) 140px 120px')}>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Cari makanan</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari nama atau kategori..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`${inputCls} pr-9`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7060] pointer-events-none">
                        <IconSearch />
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Kategori</label>
                    <select value={filterKategori} onChange={e => setFilterKategori(e.target.value)} className={inputCls}>
                      <option value="semua">Semua</option>
                      {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
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
                      <tbody>
                        {filtered.map(f => (
                          <tr
                            key={f.id}
                            onClick={() => handleEdit(f)}
                            className={`border-t border-[#f0f5f2] cursor-pointer hover:bg-[#f6f9f7] transition-colors ${
                              currentItem?.id === f.id ? 'bg-[#eaf3e9]' : ''
                            } ${f.aktif ? '' : 'opacity-60'}`}
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium">{f.nama}</p>
                              <p className="text-xs text-[#6b8c7a]">{f.kategori}</p>
                            </td>
                            <td className="px-2 py-3 text-right whitespace-nowrap">{fmt(f.basis)} g</td>
                            <td className="px-2 py-3 text-right font-bold">{fmt(f.kkal)}</td>
                            <td className="px-2 py-3 text-right">{fmt(f.protein)}</td>
                            <td className="px-2 py-3 text-right">{fmt(f.karbo)}</td>
                            <td className="px-2 py-3 text-right">{fmt(f.lemak)}</td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${VERIFIKASI_BADGE[f.verifikasi]}`}
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
                                  className="text-[#124b39] hover:opacity-70"
                                >
                                  <IconPencil />
                                </button>
                                <button
                                  type="button"
                                  aria-label={f.aktif ? `Nonaktifkan ${f.nama}` : `Aktifkan ${f.nama}`}
                                  onClick={e => { e.stopPropagation(); handleToggleAktif(f.id); }}
                                  className="text-[#4a5a53] hover:opacity-70"
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
                <aside className="flex flex-col bg-white rounded-2xl border border-[#e1e7df] p-6 gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2926]">
                      {isAddMode ? 'Tambah makanan' : 'Edit makanan'}
                    </h2>
                    <p className="text-xs text-[#6b8c7a] mt-0.5">
                      {isAddMode
                        ? 'Entri baru'
                        : `${currentItem?.nama ?? '-'} • entri ${currentItem?.aktif ? 'aktif' : 'nonaktif'}`}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Nama makanan</label>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={e => setField('nama', e.target.value)}
                        placeholder="cth. Nasi merah matang"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Kategori</label>
                      <select value={formData.kategori} onChange={e => setField('kategori', e.target.value)} className={inputCls}>
                        <option value="">Pilih kategori</option>
                        {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>

                    <div className="gap-3" style={gridStyle('repeat(2, minmax(0, 1fr))')}>
                      <div className="flex flex-col gap-1">
                        <label className={labelCls}>Basis berat</label>
                        <div className="relative">
                          <input type="text" inputMode="decimal" value={formData.basis} onChange={e => setField('basis', e.target.value)} className={`${inputCls} pr-8`} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b8c7a] pointer-events-none">g</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className={labelCls}>Energi</label>
                        <div className="relative">
                          <input type="text" inputMode="decimal" value={formData.kkal} onChange={e => setField('kkal', e.target.value)} className={`${inputCls} pr-11`} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b8c7a] pointer-events-none">kkal</span>
                        </div>
                      </div>
                    </div>

                    <div className="gap-3" style={gridStyle('repeat(3, minmax(0, 1fr))')}>
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
                              value={formData[key]}
                              onChange={e => setField(key, e.target.value)}
                              className={`${inputCls} pr-7 px-2`}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b8c7a] pointer-events-none">g</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Sumber referensi</label>
                      <input type="text" value={formData.sumber} onChange={e => setField('sumber', e.target.value)} className={inputCls} />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className={labelCls}>Status verifikasi</label>
                      <select value={formData.verifikasi} onChange={e => setField('verifikasi', e.target.value as Verifikasi)} className={inputCls}>
                        {VERIFIKASI_LIST.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-[#124b39] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#0e3a2c] transition-colors"
                      >
                        <IconTick /> {isAddMode ? 'Tambah makanan' : 'Simpan perubahan'}
                      </button>
                      {!isAddMode && currentItem && (
                        <button
                          type="button"
                          onClick={() => handleToggleAktif(currentItem.id)}
                          className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <IconPower /> {currentItem.aktif ? 'Nonaktifkan makanan' : 'Aktifkan makanan'}
                        </button>
                      )}
                    </div>

                    {!isAddMode ? (
                      <p className="text-xs text-[#6b8c7a] leading-relaxed">
                        Nonaktif menghilangkan entri dari pilihan baru, bukan menghapus catatan lama pengguna.
                      </p>
                    ) : (
                      <button type="button" onClick={() => currentItem ? handleEdit(currentItem) : fetchFoods()} className="text-xs text-[#6b8c7a] hover:underline text-center">
                        Batal
                      </button>
                    )}
                  </form>
                </aside>

                <div className="flex gap-2 bg-[#eaf3e9] text-[#124b39] text-xs rounded-xl p-4 leading-relaxed">
                  <span className="mt-0.5 shrink-0"><IconScale /></span>
                  <p>
                    Katalog memakai nilai per 100 g. Jurnal pengguna memakai porsi yang dipilih: 150 g nasi merah = 165
                    kkal. Jangan mencampur kedua basis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Aktivitas & Akun (tampilan penuh) */}
          {tab === 'aktivitas' && <div className="max-w-2xl"><ActivityCard preview={false} /></div>}
          {tab === 'akun' && <div className="max-w-2xl"><UserCard preview={false} /></div>}

          {/* Pratinjau di bawah katalog */}
          {tab === 'katalog' && (
            <div
              className="gap-6"
              style={{
                ...gridStyle(isDesktop ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)'),
                alignItems: 'start',
              }}
            >
              <ActivityCard preview />
              <UserCard preview />
            </div>
          )}
        </div>

        <footer className="mt-auto flex items-center justify-between px-8 pb-6 text-xs text-[#6b8c7a]">
          <span>Area administrasi • Tidak memuat data kesehatan pribadi pengguna.</span>
          <span>FitBite © 2026</span>
        </footer>
      </main>
    </div>
  );
};

export default AdminPengelolaan;