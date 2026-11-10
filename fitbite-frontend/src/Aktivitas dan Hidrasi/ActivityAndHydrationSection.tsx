
import { useMemo, useState } from "react";
import {
  Activity,
  Bike,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  GlassWater,
  Plus,
  Sparkles,
  Trash2,
  Undo2,
  Waves,
  type LucideIcon,
} from "lucide-react";

type ActivityOption = {
  name: string;
  met: number;
  icon: LucideIcon;
};

type ActivityRecord = {
  id: number;
  name: string;
  time: string;
  duration: number;
  met: number;
  calories: number;
  bonusMl: number;
};

type DrinkRecord = {
  id: number;
  time: string;
  amount: number;
};

const activityOptions: ActivityOption[] = [
  { name: "Jalan kaki", met: 3.5, icon: Footprints },
  { name: "Lari", met: 7, icon: Activity },
  { name: "Bersepeda", met: 6, icon: Bike },
  { name: "Berenang", met: 6, icon: Waves },
  { name: "Yoga", met: 2.5, icon: Activity },
  { name: "Latihan beban", met: 3.5, icon: Dumbbell },
];

const initialActivities: ActivityRecord[] = [
  {
    id: 1,
    name: "Bersepeda intens",
    time: "16.00",
    duration: 30,
    met: 6,
    calories: 202,
    bonusMl: 400,
  },
  {
    id: 2,
    name: "Yoga",
    time: "17.00",
    duration: 20,
    met: 2.5,
    calories: 56,
    bonusMl: 0,
  },
];

const initialDrinks: DrinkRecord[] = [
  { id: 1, time: "07.00 WIB", amount: 500 },
  { id: 2, time: "09.30 WIB", amount: 250 },
  { id: 3, time: "12.00 WIB", amount: 500 },
  { id: 4, time: "15.30 WIB", amount: 250 },
  { id: 5, time: "17.30 WIB", amount: 250 },
];

const suggestions = [
  {
    name: "Jalan santai",
    detail: "20 menit • ±78 kkal",
    description: "Pilihan ringan untuk menutup hari.",
    icon: Footprints,
    activity: "Jalan kaki",
  },
  {
    name: "Yoga pemulihan",
    detail: "15 menit • ±42 kkal",
    description: "Peregangan lembut, tanpa mengejar intensitas.",
    icon: Activity,
    activity: "Yoga",
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

export const ActivityAndHydrationSection = (): JSX.Element => {
  const [selectedActivity, setSelectedActivity] = useState("Jalan kaki");
  const [duration, setDuration] = useState("20");
  const [startTime, setStartTime] = useState("19:00");
  const [customAmount, setCustomAmount] = useState("200");

  const [activities, setActivities] =
    useState<ActivityRecord[]>(initialActivities);

  const [drinks, setDrinks] =
    useState<DrinkRecord[]>(initialDrinks);

  const [bonusWater, setBonusWater] = useState(400);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () =>
      activityOptions.find(
        (activity) => activity.name === selectedActivity,
      ) ?? activityOptions[0],
    [selectedActivity],
  );

  const totalDuration = activities.reduce(
    (total, item) => total + item.duration,
    0,
  );

  const totalCalories = activities.reduce(
    (total, item) => total + item.calories,
    0,
  );

  const totalHydration = drinks.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const hydrationTarget = 2240 + bonusWater;

  const progress = Math.min(
    100,
    Math.round((totalHydration / hydrationTarget) * 100),
  );

  const remainingWater = Math.max(
    0,
    hydrationTarget - totalHydration,
  );

  const validDuration = Number(duration);

  const estimatedCalories = Math.round(
    (selected.met * 3.5 * 64 * validDuration) / 200,
  );

  const saveActivity = () => {
    if (!Number.isFinite(validDuration) || validDuration <= 0) {
      setMessage("Masukkan durasi aktivitas yang valid.");
      setSaved(false);
      return;
    }

    const bonus =
      selected.met >= 6 && validDuration >= 30 ? 400 : 0;

    const newActivity: ActivityRecord = {
      id: Date.now(),
      name: selected.name,
      time: startTime.replace(":", "."),
      duration: validDuration,
      met: selected.met,
      calories: estimatedCalories,
      bonusMl: bonus,
    };

    setActivities((current) => [newActivity, ...current]);
    setBonusWater((current) => current + bonus);
    setSaved(true);
    setMessage("Aktivitas berhasil disimpan!");

  };

  const deleteActivity = (id: number) => {
    const activity = activities.find((item) => item.id === id);

    if (!activity) return;

    setActivities((current) =>
      current.filter((item) => item.id !== id),
    );

    setBonusWater((current) =>
      Math.max(0, current - activity.bonusMl),
    );

    setMessage("Aktivitas berhasil dihapus.");
  };

  const addHydration = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;

    const newDrink: DrinkRecord = {
      id: Date.now() + Math.random(),
      time: "19.00 WIB",
      amount,
    };

    setDrinks((current) => [...current, newDrink]);
    setMessage(`${amount} ml air berhasil ditambahkan.`);
  };

  const deleteDrink = (id: number) => {
    setDrinks((current) =>
      current.filter((item) => item.id !== id),
    );

    setMessage("Catatan minum berhasil dihapus.");
  };

  const addCustomHydration = () => {
    const amount = Number(customAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Masukkan jumlah air yang valid.");
      return;
    }

    addHydration(amount);
  };

  const undoLastDrink = () => {
    if (drinks.length === 0) return;

    setDrinks((current) => current.slice(0, -1));
    setMessage("Catatan minum terakhir dibatalkan.");
  };

  return (
    <main className="min-w-0 flex-1 bg-[#f7f9f5] text-[#203d32]">

      {/* HEADER */}
      <header className="sticky top-0 z-20 flex h-[70px] w-full items-center justify-between border-b border-[#e1e7df] bg-white px-5 sm:px-8 lg:px-9">
        <nav className="flex items-center gap-2 text-xs">
          <span className="text-[#728078]">Ruang sehat</span>
          <ChevronRight size={14} className="text-[#a0aaa3]" />
          <strong>Aktivitas &amp; hidrasi</strong>
        </nav>

        <div className="flex items-center gap-3 sm:gap-[18px]">
          <span className="hidden rounded-full bg-[#f0f3ec] px-3 py-1.5 text-[11px] font-semibold text-[#728078] sm:inline-block">
            Data contoh
          </span>

          <button
            type="button"
            aria-label="Notifikasi"
            className="relative rounded-lg p-2 text-[#728078] hover:bg-[#f0f3ec]"
          >
            <Bell size={19} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#167653]" />
          </button>

          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#dcebb2] text-[11px] font-bold">
            NP
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-7 pt-7 sm:px-6 lg:px-9">

        {/* JUDUL HALAMAN */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
              Bergerak cukup. Minum teratur.
            </h1>
            <p className="mt-1 text-[12px] text-[#728078]">
              Senin, 19 Oktober 2026 • Catatan aktivitas hari ini
            </p>
          </div>

          <button
            type="button"
            className="flex min-h-10 w-fit items-center gap-2 rounded-[10px] border border-[#e1e7df] bg-white px-4 py-2 text-xs font-semibold text-[#167653]"
          >
            <CalendarDays size={16} />
            19 Okt 2026
          </button>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <article className="rounded-[16px] border border-[#e1e7df] bg-white p-5">
            <div className="flex items-center justify-between text-xs text-[#728078]">
              <span>Durasi bergerak</span>
              <Clock3 size={18} className="text-[#167653]" />
            </div>

            <strong className="mt-2 block text-[27px] font-bold">
              {totalDuration} menit
            </strong>

            <p className="text-[11px] text-[#728078]">
              {activities.length} aktivitas tercatat hari ini
            </p>
          </article>

          <article className="rounded-[16px] border border-[#e1e7df] bg-white p-5">
            <div className="flex items-center justify-between text-xs text-[#728078]">
              <span>Energi terbakar</span>
              <Flame size={18} className="text-[#167653]" />
            </div>

            <strong className="mt-2 block text-[27px] font-bold">
              {formatNumber(totalCalories)} kkal
            </strong>

            <p className="text-[11px] text-[#728078]">
              Ditambahkan ke sisa kalori
            </p>
          </article>

          <article className="rounded-[16px] border border-[#e1e7df] bg-[#eaf3e9] p-5 sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between text-xs text-[#728078]">
              <span>Bonus air olahraga</span>
              <Droplets size={18} className="text-[#167653]" />
            </div>

            <strong className="mt-2 block text-[27px] font-bold">
              {formatNumber(bonusWater)} ml
            </strong>

            <p className="text-[11px] text-[#728078]">
              Dari aktivitas olahraga intens
            </p>
          </article>
        </div>

        {/* KONTEN UTAMA */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">

          {/* KOLOM KIRI */}
          <div className="flex min-w-0 flex-col gap-5">

            {/* RIWAYAT AKTIVITAS */}
            <section className="rounded-[17px] border border-[#e1e7df] bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold">
                  Gerak hari ini
                </h2>

                <span className="text-xs font-semibold text-[#167653]">
                  {activities.length} aktivitas
                </span>
              </div>

              {activities.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#728078]">
                  Belum ada aktivitas yang dicatat.
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((item) => {
                    const IconComponent =
                      activityOptions.find(
                        (activity) => activity.name === item.name,
                      )?.icon ?? Activity;

                    return (
                      <div
                        key={item.id}
                        className="border-b border-[#edf0eb] pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3e9] text-[#167653]">
                            <IconComponent size={20} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <strong className="block text-[13px]">
                              {item.name}
                            </strong>

                            <span className="text-[11px] text-[#728078]">
                              {item.time} • {item.duration} menit •{" "}
                              {item.met.toFixed(1).replace(".", ",")} MET
                            </span>
                          </div>

                          <strong className="whitespace-nowrap text-sm">
                            {formatNumber(item.calories)} kkal
                          </strong>
                        </div>

                        {item.bonusMl > 0 && (
                          <span className="ml-[52px] mt-2 inline-block rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[10px] font-semibold text-[#4b8dab]">
                            Bonus air +{item.bonusMl} ml
                          </span>
                        )}

                        <div className="mt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => deleteActivity(item.id)}
                            className="flex items-center gap-1 text-[11px] text-[#b45e5e] hover:text-red-700"
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* FORM AKTIVITAS */}
            <section className="rounded-[17px] border border-[#e1e7df] bg-white p-5 sm:p-6">
              <h2 className="text-base font-bold">
                Catat aktivitas baru
              </h2>

              <p className="mt-1 text-xs text-[#728078]">
                Pilih aktivitas dan durasi; kalori diperkirakan otomatis.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {activityOptions.map((item) => {
                  const IconComponent = item.icon;
                  const isSelected =
                    selectedActivity === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setSelectedActivity(item.name);
                        setSaved(false);
                        setMessage("");
                      }}
                      aria-pressed={isSelected}
                      className={`flex min-h-[65px] items-center gap-2 rounded-[10px] border p-3 text-left transition ${
                        isSelected
                          ? "border-[#167653] bg-[#eaf3e9]"
                          : "border-[#e1e7df] bg-white hover:bg-[#f7f9f5]"
                      }`}
                    >
                      <IconComponent
                        size={21}
                        className="shrink-0 text-[#167653]"
                      />

                      <span>
                        <span className="block text-xs font-semibold">
                          {item.name}
                        </span>

                        <span className="mt-0.5 block text-[10px] text-[#728078]">
                          {item.met.toFixed(1).replace(".", ",")} MET
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold">
                  Durasi
                  <span className="mt-2 flex items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-3">
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(event) => {
                        setDuration(event.target.value);
                        setSaved(false);
                      }}
                      className="w-full bg-transparent text-sm font-normal outline-none"
                    />

                    <span className="text-xs font-normal text-[#728078]">
                      menit
                    </span>
                  </span>
                </label>

                <label className="text-xs font-semibold">
                  Waktu mulai
                  <span className="mt-2 flex items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-3">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) =>
                        setStartTime(event.target.value)
                      }
                      className="w-full bg-transparent text-sm font-normal outline-none"
                    />

                    <span className="text-xs font-normal text-[#728078]">
                      WIB
                    </span>
                  </span>
                </label>
              </div>

              {/* ESTIMASI KALORI */}
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f0f3ec] p-4">
                <Flame
                  size={24}
                  className="shrink-0 text-[#167653]"
                />

                <div className="min-w-0 flex-1">
                  <strong className="block text-xs">
                    Estimasi energi:{" "}
                    {formatNumber(estimatedCalories)} kkal
                  </strong>

                  <span className="mt-1 block text-[10px] text-[#728078]">
                    {selected.met} × 3,5 × 64 kg ÷ 200 ×{" "}
                    {duration || 0} menit
                  </span>
                </div>

                <span className="hidden rounded-full bg-[#e4e9e0] px-2.5 py-1 text-[10px] text-[#728078] sm:inline-block">
                  Perkiraan
                </span>
              </div>

              <p className="mt-4 text-[10px] leading-relaxed text-[#728078]">
                MET adalah perkiraan intensitas aktivitas. Hasil dapat
                berbeda menurut kecepatan dan kondisi setiap orang.
                Angka kalori bukan pengukuran langsung dari perangkat.
              </p>

              {message && (
                <p
                  role="status"
                  className="mt-3 text-xs font-medium text-[#167653]"
                >
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={saveActivity}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#167653] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#105e41]"
              >
                {saved ? <Check size={17} /> : <Plus size={17} />}
                {saved ? "Aktivitas tersimpan" : "Simpan aktivitas"}
              </button>
            </section>

            {/* REKOMENDASI */}
            <section>
              <h2 className="mb-3 text-base font-bold">
                Sesuai energi 4/5 hari ini
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {suggestions.map((item) => {
                  const IconComponent = item.icon;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setSelectedActivity(item.activity);
                        setDuration(
                          item.activity === "Yoga" ? "15" : "20",
                        );
                        setSaved(false);
                        setMessage("");
                      }}
                      className="rounded-2xl bg-[#eaf3e9] p-5 text-left transition hover:bg-[#dfeddf]"
                    >
                      <IconComponent
                        size={25}
                        className="text-[#167653]"
                      />

                      <strong className="mt-3 block text-sm">
                        {item.name}
                      </strong>

                      <span className="mt-1 block text-xs font-semibold text-[#167653]">
                        {item.detail}
                      </span>

                      <p className="mt-2 text-[11px] text-[#728078]">
                        {item.description}
                      </p>

                      <span className="mt-3 block text-[11px] font-semibold text-[#167653]">
                        Pilih aktivitas →
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-[10px] text-[#728078]">
                Opsional, bukan tambahan wajib. Berhenti dan
                istirahat bila merasa tidak nyaman.
              </p>
            </section>
          </div>

          {/* KOLOM KANAN */}
          <div className="flex min-w-0 flex-col gap-5">

            {/* HIDRASI */}
            <section className="rounded-[17px] border border-[#e1e7df] bg-white p-5 sm:p-6">
              <h2 className="text-base font-bold">
                Isi ulang energimu
              </h2>

              <p className="mt-1 text-xs text-[#728078]">
                Hidrasi hari ini
              </p>

              <div className="mt-5 flex items-center gap-5">
                {/* BOTOL AIR */}
                <div className="relative h-[155px] w-[76px] shrink-0 overflow-hidden rounded-[22px] border-2 border-[#c5dde3] bg-[#ecf5f7]">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-[#a8ccd7] transition-all duration-500"
                    style={{
                      height: `${progress}%`,
                    }}
                  />

                  <div className="relative flex h-full items-start justify-center pt-3">
                    <Droplets
                      size={24}
                      className="text-[#4b8dab]"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <strong className="block text-[27px] font-semibold leading-tight">
                    {formatNumber(totalHydration)}
                    <span className="ml-1 text-xs font-normal text-[#728078]">
                      ml
                    </span>
                  </strong>

                  <p className="mt-1 text-xs text-[#728078]">
                    dari {formatNumber(hydrationTarget)} ml
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[11px] font-semibold text-[#4b8dab]">
                    {progress}% tercapai
                  </span>

                  <p className="mt-2 text-[11px] text-[#728078]">
                    Tersisa {formatNumber(remainingWater)} ml
                  </p>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                  <span>Target hari ini</span>
                  <strong>{progress}%</strong>
                </div>

                <div className="h-[7px] overflow-hidden rounded-full bg-[#f0f3ec]">
                  <div
                    className="h-full rounded-full bg-[#4b8dab] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* TOMBOL TAMBAH AIR */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => addHydration(250)}
                  className="min-h-11 rounded-[10px] border border-[#e1e7df] text-sm font-semibold text-[#167653] hover:bg-[#f0f3ec]"
                >
                  +250 ml
                </button>

                <button
                  type="button"
                  onClick={() => addHydration(500)}
                  className="min-h-11 rounded-[10px] bg-[#167653] text-sm font-semibold text-white hover:bg-[#105e41]"
                >
                  +500 ml
                </button>
              </div>

              {/* INPUT MANUAL */}
              <div className="mt-4 flex items-end gap-2.5">
                <label className="min-w-0 flex-1 text-xs font-semibold">
                  Jumlah lainnya

                  <span className="mt-2 flex rounded-[10px] border border-[#e1e7df] px-3.5 py-3">
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(event) =>
                        setCustomAmount(event.target.value)
                      }
                      className="w-full min-w-0 bg-transparent text-sm font-normal outline-none"
                    />

                    <span className="text-xs font-normal text-[#728078]">
                      ml
                    </span>
                  </span>
                </label>

                <button
                  type="button"
                  onClick={addCustomHydration}
                  className="min-h-11 rounded-[10px] border border-[#e1e7df] px-4 text-xs font-semibold text-[#167653] hover:bg-[#f0f3ec]"
                >
                  Tambah
                </button>
              </div>

              <hr className="my-5 border-[#e1e7df]" />

              {/* TARGET AIR */}
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span>
                    <strong className="block">Target dasar</strong>
                    <small className="mt-1 block text-[10px] text-[#728078]">
                      35 ml × 64 kg
                    </small>
                  </span>

                  <strong>2.240 ml</strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span>
                    <strong className="block">Bonus olahraga</strong>
                    <small className="mt-1 block text-[10px] text-[#728078]">
                      Dari aktivitas olahraga intens
                    </small>
                  </span>

                  <strong>+{formatNumber(bonusWater)} ml</strong>
                </div>
              </div>

              <p className="mt-4 text-[10px] leading-relaxed text-[#728078]">
                Contoh panduan hidrasi menggunakan bonus 400 ml
                untuk setiap aktivitas intens berdurasi minimal
                30 menit. Sesuaikan kebutuhan cairan dengan
                kondisi tubuh.
              </p>
            </section>

            {/* RIWAYAT MINUM */}
            <section className="rounded-[17px] border border-[#e1e7df] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">
                  Riwayat minum
                </h2>

                <GlassWater
                  size={19}
                  className="text-[#4b8dab]"
                />
              </div>

              <p className="mt-1 text-xs text-[#728078]">
                {drinks.length} catatan • total{" "}
                {formatNumber(totalHydration)} ml
              </p>

              <div className="mt-5 space-y-3">
                {drinks.length === 0 ? (
                  <p className="py-5 text-center text-xs text-[#728078]">
                    Belum ada catatan minum.
                  </p>
                ) : (
                  drinks.map((drink) => (
                    <div
                      key={drink.id}
                      className="flex items-center gap-3 text-xs"
                    >
                      <Droplets
                        size={17}
                        className="shrink-0 text-[#4b8dab]"
                      />

                      <span className="flex-1 text-[#52665b]">
                        {drink.time}
                      </span>

                      <strong className="text-[13px]">
                        {formatNumber(drink.amount)} ml
                      </strong>

                      <button
                        type="button"
                        onClick={() => deleteDrink(drink.id)}
                        aria-label={`Hapus catatan ${drink.time}`}
                        className="rounded p-1 text-[#a2aaa4] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <hr className="my-4 border-[#e1e7df]" />

              <button
                type="button"
                onClick={undoLastDrink}
                disabled={drinks.length === 0}
                className="flex items-center gap-2 text-[11px] font-semibold text-[#167653] hover:text-[#105e41] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Undo2 size={14} />
                Batalkan catatan terakhir
              </button>
            </section>
          </div>
        </div>

        {/* INFORMASI */}
        <aside className="flex items-start gap-3 rounded-[10px] bg-[#eaf3e9] p-4 text-xs text-[#124b39]">
          <Sparkles
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p className="leading-relaxed">
            Aktivitas yang disimpan akan memperbarui total
            durasi dan estimasi kalori. Aktivitas olahraga
            intens tertentu juga dapat menambah target air.
            Menghapus aktivitas atau catatan minum akan
            memperbarui perhitungan secara otomatis.
          </p>
        </aside>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col justify-between gap-2 px-5 pb-6 pt-2 text-[10px] text-[#728078] sm:flex-row sm:px-9">
        <p>
          FitBite mendukung kebiasaan sehat, bukan pengganti
          dokter atau ahli gizi.
        </p>

        <span>FitBite © 2026</span>
      </footer>
    </main>
  );
};

export default ActivityAndHydrationSection;
