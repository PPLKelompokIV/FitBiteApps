import React, { useState, useEffect } from 'react';
import { AdministratorNavigationSection } from './AdministratorNavigationSection';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = 'katalog' | 'aktivitas' | 'akun';
type KategoriEnergi = 'Ringan' | 'Sedang' | 'Berat';

interface Activity {
  id: number;
  nama: string;
  kategori: string;
  kategoriEnergi: KategoriEnergi;
  met: number;
  aktif: boolean;
}

interface ActivityForm {
  nama: string;
  kategori: string;
  kategoriEnergi: string;
  met: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_ACTIVITIES: Activity[] = [
  { id: 1, nama: 'Jalan kaki sedang', kategori: 'Jalan kaki', kategoriEnergi: 'Sedang', met: 3.5, aktif: true },
  { id: 2, nama: 'Lari santai', kategori: 'Lari', kategoriEnergi: 'Sedang', met: 7.0, aktif: true },
  { id: 3, nama: 'Bersepeda intens', kategori: 'Bersepeda', kategoriEnergi: 'Berat', met: 6.0, aktif: true },
  { id: 4, nama: 'Yoga', kategori: 'Fleksibilitas', kategoriEnergi: 'Ringan', met: 2.5, aktif: true },
  { id: 5, nama: 'Renang santai', kategori: 'Renang', kategoriEnergi: 'Sedang', met: 5.0, aktif: true },
  { id: 6, nama: 'Latihan beban ringan', kategori: 'Latihan kekuatan', kategoriEnergi: 'Sedang', met: 3.5, aktif: true },
  { id: 7, nama: 'Jalan kaki cepat', kategori: 'Jalan kaki', kategoriEnergi: 'Sedang', met: 4.3, aktif: true },
];

const KATEGORI_LIST = ['Jalan kaki', 'Lari', 'Bersepeda', 'Renang', 'Latihan kekuatan', 'Fleksibilitas'];
const KATEGORI_ENERGI_LIST = ['Ringan', 'Sedang', 'Berat'];
const STATUS_LIST = ['Aktif', 'Nonaktif', 'Semua'];

const STATS = [
  { label: 'Makanan dalam katalog', value: '126', sub: '118 aktif • 8 nonaktif', icon: 'fork', highlight: false },
  { label: 'Referensi terverifikasi', value: '39', sub: 'Validasi nutrisi & MET', icon: 'check', highlight: false },
  { label: 'Aktivitas & MET', value: '18', sub: '6 kategori aktivitas utama', icon: 'activity', highlight: true },
  { label: 'Akun pengguna', value: '248', sub: '240 aktif • 8 nonaktif', icon: 'users', highlight: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fitbite_activities';

const fmtMet = (n: number): string =>
  n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const toNum = (s: string): number => parseFloat(s.replace(',', '.'));

const EMPTY_FORM: ActivityForm = {
  nama: '',
  kategori: '',
  kategoriEnergi: '',
  met: '',
};

const toForm = (a: Activity): ActivityForm => ({
  nama: a.nama,
  kategori: a.kategori,
  kategoriEnergi: a.kategoriEnergi,
  met: fmtMet(a.met),
});

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
const IconAlert = () => <Svg size={16}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Svg>;

const StatIcon: React.FC<{ name: string }> = ({ name }) => {
  if (name === 'fork')
    return <Svg size={18}><path d="M6 3v7a2 2 0 0 0 2 2v9" /><path d="M4 3v6M10 3v6M8 3v9" /><path d="M17 21V3c-2.5 1-4 3.5-4 7 0 2 1 3 4 3" /></Svg>;
  if (name === 'check')
    return <Svg size={18}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></Svg>;
  if (name === 'activity')
    return <Svg size={18}><path d="M3 12h4l3-8 4 16 3-8h4" /></Svg>;
  return <Svg size={18}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6" /><path d="M18 14.8c2 .7 3.2 2.5 3.5 5.2" /></Svg>;
};

// ─── Component ────────────────────────────────────────────────────────────────

const ActivitiesPage: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('aktivitas');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('Aktif');
  const [formData, setFormData] = useState<ActivityForm>(EMPTY_FORM);
  const [isAddMode, setIsAddMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Activity | null>(null);

  const saveActivities = (updated: Activity[]): void => {
    setActivities(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const fetchActivities = (): void => {
    setLoading(true);
    let list: Activity[] = SEED_ACTIVITIES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) list = JSON.parse(saved) as Activity[];
    } catch {
      list = SEED_ACTIVITIES;
    } finally {
      setActivities(list);
      if (list.length) {
        setIsAddMode(false);
        setCurrentItem(list[0]);
        setFormData(toForm(list[0]));
      }
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, []);

  const setField = <K extends keyof ActivityForm>(key: K, value: ActivityForm[K]): void =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleAddNew = (): void => {
    setTab('aktivitas');
    setIsAddMode(true);
    setCurrentItem(null);
    setFormData(EMPTY_FORM);
  };

  const handleEdit = (item: Activity): void => {
    setIsAddMode(false);
    setCurrentItem(item);
    setFormData(toForm(item));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!formData.nama.trim()) { alert('Nama aktivitas wajib diisi'); return; }
    if (!formData.kategori) { alert('Kategori aktivitas wajib dipilih'); return; }
    if (!formData.kategoriEnergi) { alert('Kategori energi wajib dipilih'); return; }

    const metValue = toNum(formData.met);
    if (isNaN(metValue) || metValue <= 0) { 
      alert('Nilai MET wajib berupa angka lebih dari 0'); 
      return; 
    }

    const values = {
      nama: formData.nama.trim(),
      kategori: formData.kategori,
      kategoriEnergi: formData.kategoriEnergi as KategoriEnergi,
      met: metValue,
    };

    if (isAddMode) {
      const newItem: Activity = { id: Date.now(), aktif: true, ...values };
      saveActivities([...activities, newItem]);
      alert('Aktivitas berhasil ditambahkan');
      handleEdit(newItem);
    } else if (currentItem) {
      const updatedItem: Activity = { ...currentItem, ...values };
      saveActivities(activities.map(a => (a.id === currentItem.id ? updatedItem : a)));
      setCurrentItem(updatedItem);
      alert('Perubahan berhasil disimpan');
    }
  };

  const handleToggleAktif = (id: number): void => {
    const target = activities.find(a => a.id === id);
    if (!target) return;
    const next = !target.aktif;
    if (!next && !confirm('Nonaktifkan aktivitas ini? Catatan lama pengguna tetap tersimpan.')) return;
    saveActivities(activities.map(a => (a.id === id ? { ...a, aktif: next } : a)));
    if (currentItem?.id === id) setCurrentItem({ ...target, aktif: next });
  };

  const filtered = activities.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.nama.toLowerCase().includes(q) || a.kategori.toLowerCase().includes(q);
    const matchKategori = filterKategori === 'semua' || a.kategori === filterKategori;
    const matchStatus = filterStatus === 'Semua' || (filterStatus === 'Aktif' ? a.aktif : !a.aktif);
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
    'w-full text-sm border border-[#d0dbd5] rounded-lg px-3 py-2 outline-none focus:border-[#124b39] bg-white transition-colors duration-200';
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

      <div className="flex h-screen items-start overflow-hidden bg-[#f6f7f2] text-[#1d2926]">
        <AdministratorNavigationSection />

        <main className="flex-1 h-screen overflow-y-auto flex flex-col">
          {/* Topbar */}
          <header className="flex items-center justify-between px-8 py-4 border-b border-[#e1e7df] bg-white">
            <nav className="flex items-center gap-2 text-xs text-[#6b8c7a]" aria-label="Breadcrumb">
              <span>Pengelolaan</span>
              <span aria-hidden="true">›</span>
              <span className="font-semibold text-[#1d2926] transition-all duration-300">{breadcrumbLabel}</span>
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
                className="flex items-center gap-2 bg-[#124b39] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0e3a2c] hover:shadow-md transition-all duration-300 whitespace-nowrap active:scale-95"
              >
                <IconPlus /> Tambah aktivitas
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
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {STATS.map(s => (
                <div
                  key={s.label}
                  className={`rounded-2xl border px-5 py-4 transition-all duration-300 hover:shadow-sm ${
                    s.highlight ? 'bg-[#eaf3e9] border-[#cfe2d3]' : 'bg-white border-[#e1e7df] hover:border-[#cfe2d3]'
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
            <div role="tablist" className="grid grid-cols-3 bg-[#eaf3e9] rounded-xl p-1 relative">
              {tabs.map(t => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`py-2 text-sm rounded-lg transition-all duration-300 ease-out relative z-10 ${
                    tab === t.key
                      ? 'bg-white font-bold text-[#124b39] shadow-sm transform scale-[1.02]'
                      : 'text-[#4a7060] hover:bg-white/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* AREA KONTEN TAB DENGAN ANIMASI */}
            <div key={tab} className="animate-tab-content">
              
              {/* Tab: Aktivitas */}
              {tab === 'aktivitas' && (
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
                  {/* Tabel */}
                  <section className="bg-white rounded-2xl border border-[#e1e7df] p-6 shadow-sm">
                    <h2 className="text-base font-bold text-[#1d2926]">Katalog aktivitas & MET</h2>
                    <p className="text-xs text-[#6b8c7a] mt-0.5">
                      Referensi aktivitas, kategori energi, dan nilai MET untuk estimasi energi.
                    </p>

                    <div className="grid grid-cols-[1fr_140px_120px] gap-3 mt-4">
                      <div className="flex flex-col gap-1">
                        <label className={labelCls}>Cari aktivitas</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Cari nama aktivitas..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={`${inputCls} pr-9 transition-shadow focus:shadow-sm`}
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
                              <th className="text-left px-4 py-3 rounded-l-lg">Aktivitas (Kategori)</th>
                              <th className="text-left px-4 py-3">Kategori Energi</th>
                              <th className="text-left px-4 py-3">MET</th>
                              <th className="text-center px-4 py-3">Status</th>
                              <th className="text-center px-4 py-3 rounded-r-lg">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map(a => (
                              <tr
                                key={a.id}
                                onClick={() => handleEdit(a)}
                                className={`border-t border-[#f0f5f2] cursor-pointer transition-all duration-200 ${
                                  currentItem?.id === a.id ? 'bg-[#eaf3e9]' : 'hover:bg-[#f6f9f7]'
                                } ${a.aktif ? '' : 'opacity-60 grayscale-[30%]'}`}
                              >
                                <td className="px-4 py-3">
                                  <p className="font-medium text-[#1d2926]">{a.nama}</p>
                                  <p className="text-xs text-[#6b8c7a] mt-0.5">{a.kategori}</p>
                                </td>
                                <td className="px-4 py-3 text-left text-[#4a7060]">{a.kategoriEnergi}</td>
                                <td className="px-4 py-3 text-left font-bold text-[#1d2926]">{fmtMet(a.met)}</td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors duration-200 ${
                                      a.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}
                                  >
                                    {a.aktif ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      type="button"
                                      onClick={e => { e.stopPropagation(); handleEdit(a); }}
                                      className="text-[#124b39] hover:text-[#0e3a2c] hover:bg-[#eaf3e9] p-1.5 rounded-md transition-colors"
                                    >
                                      <IconPencil />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={e => { e.stopPropagation(); handleToggleAktif(a.id); }}
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
                      <span>Menampilkan 1–{filtered.length} dari 18 aktivitas</span>
                      <span className="tracking-wide">
                        ‹ <b className="text-[#124b39]">1</b> 2 3 ›
                      </span>
                    </div>
                    <p className="border-t border-[#e1e7df] mt-3 pt-3 text-xs text-[#6b8c7a] leading-relaxed">
                      Semua nilai MET pada mockup adalah data contoh.
                    </p>
                  </section>

                  {/* Form edit + catatan */}
                  <div className="flex flex-col gap-4">
                    <aside className="flex flex-col bg-white rounded-2xl border border-[#e1e7df] p-6 gap-4 shadow-sm transition-all duration-300">
                      <div>
                        <h2 className="text-base font-bold text-[#1d2926]">
                          {isAddMode ? 'Tambah aktivitas' : 'Edit aktivitas'}
                        </h2>
                        <p className="text-xs text-[#6b8c7a] mt-0.5">
                          {isAddMode
                            ? 'Entri baru'
                            : `${currentItem?.nama ?? '-'} • entri ${currentItem?.aktif ? 'aktif' : 'nonaktif'}`}
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <label className={labelCls}>Nama aktivitas</label>
                          <input
                            type="text"
                            value={formData.nama}
                            onChange={e => setField('nama', e.target.value)}
                            placeholder="cth. Jalan kaki sedang"
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

                        <div className="flex flex-col gap-1">
                          <label className={labelCls}>Kategori Energi</label>
                          <select value={formData.kategoriEnergi} onChange={e => setField('kategoriEnergi', e.target.value)} className={inputCls}>
                            <option value="">Pilih energi</option>
                            {KATEGORI_ENERGI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className={labelCls}>Nilai MET</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={formData.met}
                            onChange={e => setField('met', e.target.value)}
                            placeholder="cth. 3,5"
                            className={inputCls}
                          />
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                          <button
                            type="submit"
                            className="flex items-center justify-center gap-2 bg-[#124b39] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#0e3a2c] active:scale-[0.98] transition-all duration-200"
                          >
                            <IconTick /> {isAddMode ? 'Tambah aktivitas' : 'Simpan perubahan'}
                          </button>
                          {!isAddMode && currentItem && (
                            <button
                              type="button"
                              onClick={() => handleToggleAktif(currentItem.id)}
                              className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 active:scale-[0.98] transition-all duration-200"
                            >
                              <IconPower /> {currentItem.aktif ? 'Nonaktifkan aktivitas' : 'Aktifkan aktivitas'}
                            </button>
                          )}
                        </div>

                        {!isAddMode ? (
                          <p className="text-xs text-[#6b8c7a] leading-relaxed mt-2 text-center">
                            Nonaktif menghilangkan entri dari pilihan pengguna, bukan menghapus catatan lama.
                          </p>
                        ) : (
                          <button type="button" onClick={() => currentItem ? handleEdit(currentItem) : fetchActivities()} className="text-xs text-[#6b8c7a] hover:text-[#1d2926] hover:underline text-center mt-2 transition-colors">
                            Batal
                          </button>
                        )}
                      </form>
                    </aside>

                    <div className="flex gap-2 bg-[#eaf3e9] text-[#124b39] text-xs rounded-xl p-4 leading-relaxed border border-[#cfe2d3]">
                      <span className="mt-0.5 shrink-0"><IconAlert /></span>
                      <p>
                        Wajib berupa angka lebih dari 0. Nilai kosong, nol, negatif, atau bukan angka ditolak saat disimpan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pesan sementara untuk Tab lain jika diklik */}
              {tab !== 'aktivitas' && (
                <div className="bg-white rounded-2xl border border-[#e1e7df] p-10 text-center shadow-sm">
                  <p className="text-[#6b8c7a] text-sm">Navigasi ke {tab === 'katalog' ? 'Katalog makanan' : 'Akun pengguna'} belum terpasang di rute ini.</p>
                </div>
              )}
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

export default ActivitiesPage;