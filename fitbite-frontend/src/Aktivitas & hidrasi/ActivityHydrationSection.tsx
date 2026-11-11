import React, { useMemo, useState, type ReactElement } from "react";
import {
  ChevronRight,
  Bell,
  Calendar,
  Clock,
  Flame,
  Droplets,
  Footprints,
  Bike,
  Waves,
  Smile,
  Dumbbell,
  Info,
  Trash2,
} from "lucide-react";

type Activity = {
  name: string;
  met: string;
  icon: React.ElementType;
};

type Drink = {
  time: string;
  amount: number;
};

const activityOptions: Activity[] = [
  { name: "Jalan kaki", met: "3,5 MET", icon: Footprints },
  { name: "Lari", met: "7,0 MOV", icon: Footprints }, // Atau gunakan icon lari jika ada
  { name: "Bersepeda", met: "6,0 MET", icon: Bike },
  { name: "Berenang", met: "6,0 MET", icon: Waves },
  { name: "Yoga", met: "2,5 MET", icon: Smile },
  { name: "Latihan beban", met: "3,5 MET", icon: Dumbbell },
];

const initialDrinks: Drink[] = [
  { time: "07.00 WIB", amount: 500 },
  { time: "09.30 WIB", amount: 250 },
  { time: "12.00 WIB", amount: 500 },
  { time: "15.30 WIB", amount: 250 },
  { time: "17.30 WIB", amount: 250 },
];

const activityHistory = [
  {
    name: "Bersepeda intens",
    detail: "16.00 • 30 menit • 6,0 MET",
    calories: "202 kkal",
    icon: Bike,
    bonus: true,
  },
  {
    name: "Yoga",
    detail: "17.00 • 20 menit • 2,5 MET",
    calories: "56 kkal",
    icon: Smile,
    bonus: false,
  },
];

const suggestions = [
  {
    name: "Jalan santai",
    detail: "20 menit • ±78 kkal",
    description: "Pilihan ringan untuk menutup hari.",
    icon: Footprints,
  },
  {
    name: "Yoga pemulihan",
    detail: "15 menit • ±42 kkal",
    description: "Peregangan lembut, tanpa mengejar intensitas.",
    icon: Smile,
  },
];

export const ActivityAndHydrationSection = (): ReactElement => {
  const [selectedActivity, setSelectedActivity] = useState("Jalan kaki");
  const [duration, setDuration] = useState("20");
  const [_startTime, setStartTime] = useState("19.00");
  const [customAmount, setCustomAmount] = useState("200");
  const [hydration, setHydration] = useState(1750);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<Drink[]>(initialDrinks);

  const selected = useMemo(
    () =>
      activityOptions.find((activity) => activity.name === selectedActivity) ??
      activityOptions[0],
    [selectedActivity]
  );

  const estimatedCalories = Math.round(
    (Number(selected.met.replace(",", ".")) *
      3.5 *
      64 *
      Number(duration || 0)) /
      200
  );

  const addHydration = (amount: number) => {
    setHydration((current) => Math.min(current + amount, 2640));
    setSaved(false);
  };

  const addCustomHydration = () => {
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    addHydration(amount);
    setHistory((current) => [
      ...current,
      { time: "19.00 WIB", amount },
    ]);
  };

  const undoLastDrink = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHydration((current) => Math.max(0, current - last.amount));
    setHistory((current) => current.slice(0, -1));
  };

  const removeDrinkAtIndex = (index: number) => {
    const target = history[index];
    if (!target) return;
    setHydration((current) => Math.max(0, current - target.amount));
    setHistory((current) => current.filter((_, i) => i !== index));
  };

  const progress = Math.round((hydration / 2640) * 100);
  const remainingHydration = Math.max(0, 2640 - hydration);

  return (
    <main className="relative flex h-screen min-h-0 min-w-0 flex-1 flex-col items-start overflow-y-auto bg-[#f7f9f5] text-[#203d32]">
      {/* Header Atas */}
      <header className="sticky top-0 z-20 flex h-[78px] w-full shrink-0 items-center justify-between border-b border-[#e1e7df] bg-white px-9">
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-xs">
          <span className="text-[#728078]">Ruang sehat</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#728078]" />
          <strong className="font-semibold text-[#203d32]">Aktivitas &amp; hidrasi</strong>
        </nav>
        <div className="inline-flex items-center gap-[18px]">
          <span className="rounded-full bg-[#f0f3ec] px-2.5 py-1 text-[11px] font-semibold text-[#728078]">
            Data contoh
          </span>
          <button type="button" aria-label="Notifikasi" className="relative rounded p-1 text-[#728078]">
            <Bell className="h-[19px] w-[19px]" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#167653]" />
          </button>
          <div className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#dcebb2] text-[11px] font-bold text-[#167653]">
            NP
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <section className="flex w-full flex-col gap-6 px-9 pb-7 pt-[30px]">
        {/* Title Bar */}
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="font-bold text-3xl tracking-[-0.24px] text-[#124b39]">
              Bergerak cukup. Minum teratur.
            </h1>
            <p className="mt-1 text-[13px] text-[#728078]">
              Senin, 19 Oktober 2026 • Catatan hingga 18.30 WIB
            </p>
          </div>
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 rounded-[10px] border border-[#e1e7df] bg-white px-[18px] py-[11px] text-sm font-semibold text-[#167653] shadow-sm"
          >
            <Calendar className="h-[17px] w-[17px]" />
            19 Okt 2026
          </button>
        </div>

        {/* Ringkasan 3 Kartu */}
        <div className="grid grid-cols-3 gap-[18px]">
          {[
            ["Durasi bergerak", "50 menit", "2 aktivitas tercatat hari ini", Clock],
            ["Energi terbakar", "258 kkal", "Ditambahkan ke sisa kalori", Flame],
            ["Bonus air olahraga", "400 ml", "Bersepeda intens • 30 menit", Droplets],
          ].map(([label, value, detail, IconComponent]: any, index) => (
            <article
              key={String(label)}
              className={`rounded-[18px] border border-[#e1e7df] p-5 shadow-sm ${
                index === 2 ? "bg-[#eaf3e9]" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#728078]">
                <span>{label}</span>
                <IconComponent className="h-[18px] w-[18px] text-[#167653]" />
              </div>
              <strong className="mt-2 block text-[28px] leading-[42px] font-bold text-[#124b39]">
                {value}
              </strong>
              <p className="text-[11px] text-[#728078]">{detail}</p>
            </article>
          ))}
        </div>

        {/* Layout Kolom Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-[728px_minmax(0,1fr)] items-start gap-6">
          <div className="flex flex-col gap-5">
            {/* Gerak Hari Ini */}
            <section className="rounded-[18px] border border-[#e1e7df] bg-white p-6 shadow-sm">
              <div className="mb-[18px] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#124b39]">Gerak hari ini</h2>
                <button type="button" className="text-xs font-semibold text-[#167653] hover:underline">
                  Lihat riwayat →
                </button>
              </div>
              <div className="space-y-4">
                {activityHistory.map((activity, idx) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div key={activity.name}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#eaf3e9] text-[#167653]">
                          <ActivityIcon className="h-[19px] w-[19px]" />
                        </div>
                        <div className="flex-1">
                          <strong className="block text-[13px] text-[#203d32]">{activity.name}</strong>
                          <span className="text-[11px] text-[#728078]">{activity.detail}</span>
                        </div>
                        <strong className="text-sm text-[#124b39]">{activity.calories}</strong>
                      </div>
                      {activity.bonus && (
                        <span className="ml-[50px] mt-2 inline-block rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[11px] font-semibold text-[#4b8dab]">
                          Bonus air +400 ml
                        </span>
                      )}
                      <div className="mt-4 flex justify-end text-[11px] text-[#728078] gap-2">
                        <button type="button" className="hover:text-[#167653]">Edit</button>
                        <span>·</span>
                        <button type="button" className="hover:text-red-600">Hapus</button>
                      </div>
                      {idx < activityHistory.length - 1 && <hr className="mt-4 border-[#e1e7df]" />}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Catat Aktivitas Baru */}
            <section className="rounded-[18px] border border-[#e1e7df] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#124b39]">Catat aktivitas baru</h2>
              <p className="mt-1 text-xs text-[#728078]">
                Pilih aktivitas dan durasi; kalori diperkirakan otomatis.
              </p>
              <div className="mt-[18px] grid grid-cols-3 gap-2.5">
                {activityOptions.map((activity) => {
                  const ActivityIcon = activity.icon;
                  const isSelected = selectedActivity === activity.name;
                  return (
                    <button
                      type="button"
                      key={activity.name}
                      onClick={() => setSelectedActivity(activity.name)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-2 rounded-[10px] border p-[13px] text-left transition-all ${
                        isSelected ? "border-[#167653] bg-[#eaf3e9]" : "border-[#e1e7df] bg-white hover:border-[#cbd5e1]"
                      }`}
                    >
                      <ActivityIcon className={`h-[21px] w-[21px] ${isSelected ? "text-[#167653]" : "text-[#728078]"}`} />
                      <span>
                        <span className="block text-xs font-semibold text-[#203d32]">{activity.name}</span>
                        <span className="block text-[10px] text-[#728078]">{activity.met}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-[15px]">
                <label className="text-[13px] font-semibold text-[#203d32]">
                  Durasi
                  <span className="mt-2 flex items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px] bg-white">
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                      className="w-full bg-transparent text-sm font-normal outline-none text-[#203d32]"
                    />
                    <span className="text-xs font-normal text-[#728078]">menit</span>
                  </span>
                </label>
                <label className="text-[13px] font-semibold text-[#203d32]">
                  Waktu mulai
                  <span className="mt-2 flex items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px] bg-white">
                    <input
                      type="time"
                      defaultValue="19:00"
                      onChange={(event) => setStartTime(event.target.value.replace(":", "."))}
                      className="w-full bg-transparent text-sm font-normal outline-none text-[#203d32]"
                    />
                    <span className="text-xs font-normal text-[#728078]">WIB</span>
                  </span>
                </label>
              </div>
              <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#f0f3ec] p-[17px]">
                <Flame className="h-[25px] w-[25px] text-[#167653]" />
                <div className="flex-1">
                  <strong className="block text-[13px] text-[#124b39]">
                    Estimasi energi: {estimatedCalories} kkal
                  </strong>
                  <span className="text-[10px] text-[#728078]">
                    {selected.met} × 3,5 × 64 kg ÷ 200 × {duration || 0} menit
                  </span>
                </div>
                <span className="rounded-full bg-[#e4e9e0] px-2.5 py-1 text-[11px] text-[#728078]">
                  {saved ? "Tersimpan" : "Belum dicatat"}
                </span>
              </div>
              <p className="mt-4 text-[11px] leading-[16.5px] text-[#728078]">
                MET adalah perkiraan intensitas dari katalog. Hasil dapat berbeda menurut kecepatan dan kondisi tiap orang; bukan pengukuran perangkat.
              </p>
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#167653] px-[18px] py-[11px] text-sm font-semibold text-white hover:bg-[#125c41] transition-colors shadow-sm"
              >
                {saved ? "Aktivitas tersimpan" : "Simpan aktivitas"}
              </button>
            </section>

            {/* Rekomendasi Sesuai Energi */}
            <section>
              <h2 className="mb-3.5 text-lg font-bold text-[#124b39]">Sesuai energi 4/5 hari ini</h2>
              <div className="grid grid-cols-2 gap-4">
                {suggestions.map((suggestion) => {
                  const SuggIcon = suggestion.icon;
                  return (
                    <button
                      type="button"
                      key={suggestion.name}
                      onClick={() =>
                        setSelectedActivity(
                          suggestion.name.replace(" santai", "").replace(" pemulihan", "")
                        )
                      }
                      className="rounded-2xl bg-[#eaf3e9] p-5 text-left border border-transparent hover:border-[#167653]/30 transition-all"
                    >
                      <SuggIcon className="h-[26px] w-[26px] text-[#167653]" />
                      <strong className="mt-2.5 block text-[15px] text-[#124b39]">{suggestion.name}</strong>
                      <span className="mt-1 block text-xs font-semibold text-[#167653]">
                        {suggestion.detail}
                      </span>
                      <p className="mt-2 text-[11px] text-[#728078]">{suggestion.description}</p>
                      <span className="mt-2 block text-[11px] text-[#167653] font-medium">
                        Pilih aktivitas →
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3.5 text-[11px] text-[#728078]">
                Opsional, bukan tambahan wajib. Berhenti dan istirahat bila merasa tidak nyaman.
              </p>
            </section>
          </div>

          {/* Kolom Kanan (Hidrasi & Riwayat Minum) */}
          <div className="flex flex-col gap-5">
            {/* Widget Hidrasi */}
            <section className="rounded-[18px] border border-[#e1e7df] bg-white p-[22px] shadow-sm">
              <h2 className="text-lg font-bold text-[#124b39]">Isi ulang energimu</h2>
              <p className="mt-1 text-xs text-[#728078]">Hidrasi hari ini</p>
              <div className="mt-[18px] flex items-center gap-[23px]">
                <div className="relative h-40 w-[82px] overflow-hidden rounded-[22px] border-2 border-[#c5dde3] bg-[#ecf5f7]">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-[#a8ccd7] transition-all duration-300"
                    style={{ height: `${Math.max(20, Math.min(160, (progress / 100) * 160))}px` }}
                  />
                  <div className="relative p-2 text-[#4b8dab]">
                    <Droplets className="h-[25px] w-[25px]" />
                  </div>
                </div>
                <div>
                  <p className="text-[29px] font-bold text-[#124b39]">
                    {hydration} <span className="text-xs font-normal text-[#728078]">ml</span>
                  </p>
                  <p className="text-xs text-[#728078]">dari 2.640 ml</p>
                  <span className="mt-2 inline-block rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[11px] font-semibold text-[#4b8dab]">
                    {progress}% tercapai
                  </span>
                  <p className="mt-1 text-[11px] text-[#728078]">Tersisa {remainingHydration} ml</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-[#728078]">
                  <span>Target hari ini</span>
                  <span className="font-semibold text-[#203d32]">{progress}%</span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-[#f0f3ec]">
                  <div
                    className="h-full rounded-full bg-[#4b8dab] transition-all duration-300"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => addHydration(250)}
                  className="min-h-11 rounded-[10px] border border-[#e1e7df] text-sm font-semibold text-[#167653] hover:bg-[#f6f7f2] transition-colors"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => addHydration(500)}
                  className="min-h-11 rounded-[10px] bg-[#167653] text-sm font-semibold text-white hover:bg-[#125c41] transition-colors"
                >
                  +500 ml
                </button>
              </div>
              <div className="mt-4 flex items-end gap-2.5">
                <label className="flex-1 text-[13px] font-semibold text-[#203d32]">
                  Jumlah lainnya
                  <span className="mt-2 flex rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px] bg-white">
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(event) => setCustomAmount(event.target.value)}
                      className="w-full outline-none text-[#203d32]"
                    />
                    <span className="text-xs font-normal text-[#728078]">ml</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={addCustomHydration}
                  className="min-h-11 rounded-[10px] border border-[#e1e7df] px-[18px] text-sm font-semibold text-[#167653] hover:bg-[#f6f7f2] transition-colors"
                >
                  Tambah
                </button>
              </div>
              <hr className="my-5 border-[#e1e7df]" />
              <div className="space-y-4 text-[13px] text-[#203d32]">
                <div className="flex justify-between">
                  <span>
                    <strong className="block font-semibold">Target dasar</strong>
                    <small className="text-[11px] text-[#728078]">35 ml × 64 kg</small>
                  </span>
                  <strong className="font-bold">2.240 ml</strong>
                </div>
                <div className="flex justify-between">
                  <span>
                    <strong className="block font-semibold">Bonus olahraga</strong>
                    <small className="text-[11px] text-[#728078]">30 menit bersepeda intens</small>
                  </span>
                  <strong className="font-bold text-[#167653]">+400 ml</strong>
                </div>
              </div>
              <p className="mt-4 text-[10px] leading-[15px] text-[#728078]">
                Panduan bonus: 350–500 ml per 30 menit olahraga intens. Contoh ini memakai 400 ml, ditambahkan satu kali; yoga tidak menambah bonus.
              </p>
            </section>

            {/* Riwayat Minum */}
            <section className="rounded-[18px] border border-[#e1e7df] bg-white p-[22px] shadow-sm">
              <h2 className="text-lg font-bold text-[#124b39]">Riwayat minum</h2>
              <p className="mt-1 text-xs text-[#728078]">
                {history.length} catatan • total {hydration} ml
              </p>
              <div className="mt-[18px] space-y-3">
                {history.map((drink, index) => (
                  <div key={`${drink.time}-${index}`} className="flex items-center gap-3 text-xs text-[#203d32]">
                    <Droplets className="h-[18px] w-[18px] text-[#4b8dab]" />
                    <span className="flex-1 font-medium">{drink.time}</span>
                    <span className="text-[13px] font-semibold">{drink.amount} ml</span>
                    <button
                      type="button"
                      aria-label={`Hapus catatan ${drink.time}`}
                      onClick={() => removeDrinkAtIndex(index)}
                      className="text-[#728078] hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <hr className="my-4 border-[#e1e7df]" />
              <button
                type="button"
                onClick={undoLastDrink}
                className="text-[11px] font-semibold text-[#167653] hover:underline"
              >
                ↶ Batalkan catatan terakhir
              </button>
            </section>
          </div>
        </div>

        {/* Informasi Footer Bawah */}
        <aside className="flex items-start gap-[11px] rounded-[10px] bg-[#eaf3e9] p-3.5 text-xs text-[#124b39]">
          <Info className="h-[18px] w-[18px] shrink-0 text-[#167653]" />
          <p>
            Aktivitas tersimpan menambah sisa kalori. Hanya olahraga intens yang menambah target air. Menghapus aktivitas juga menyesuaikan kedua target secara otomatis.
          </p>
        </aside>
      </section>

      {/* Footer Hak Cipta */}
      <footer className="flex w-full items-start justify-between px-9 pb-6 pt-2 text-[10px] text-[#728078]">
        <p>FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli gizi.</p>
        <span>FitBite © 2026</span>
      </footer>
    </main>
  );
};

export default ActivityAndHydrationSection;