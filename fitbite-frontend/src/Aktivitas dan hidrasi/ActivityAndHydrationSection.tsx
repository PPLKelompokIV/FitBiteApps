// @ts-nocheck
import { useMemo, useState } from "react";

const iconPlaceholder =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E";
const vector10 = iconPlaceholder;
const vector11 = iconPlaceholder;
const vector12 = iconPlaceholder;
const vector13 = iconPlaceholder;
const vector14 = iconPlaceholder;
const vector15 = iconPlaceholder;
const vector18 = iconPlaceholder;
const vector19 = iconPlaceholder;
const vector20 = iconPlaceholder;
const vector21 = iconPlaceholder;
const vector22 = iconPlaceholder;
const vector23 = iconPlaceholder;
const vector25 = iconPlaceholder;
const vector26 = iconPlaceholder;
const vector29 = iconPlaceholder;
const vector30 = iconPlaceholder;
const vector31 = iconPlaceholder;
const vector32 = iconPlaceholder;
const vector34 = iconPlaceholder;
const vector36 = iconPlaceholder;
const vector38 = iconPlaceholder;
const vector40 = iconPlaceholder;

type Activity = {
  name: string;
  met: string;
  icon: string;
};

type Drink = {
  time: string;
  amount: number;
  icon: string;
};

const activityOptions: Activity[] = [
  { name: "Jalan kaki", met: "3,5 MET", icon: vector18 },
  { name: "Lari", met: "7,0 MET", icon: vector19 },
  { name: "Bersepeda", met: "6,0 MET", icon: vector20 },
  { name: "Berenang", met: "6,0 MET", icon: vector21 },
  { name: "Yoga", met: "2,5 MET", icon: vector22 },
  { name: "Latihan beban", met: "3,5 MET", icon: vector23 },
];

const drinks: Drink[] = [
  { time: "07.00 WIB", amount: 500, icon: vector30 },
  { time: "09.30 WIB", amount: 250, icon: vector32 },
  { time: "12.00 WIB", amount: 500, icon: vector34 },
  { time: "15.30 WIB", amount: 250, icon: vector36 },
  { time: "17.30 WIB", amount: 250, icon: vector38 },
];

const activityHistory = [
  {
    name: "Bersepeda intens",
    detail: "16.00 • 30 menit • 6,0 MET",
    calories: "202 kkal",
    icon: "",
    bonus: true,
  },
  {
    name: "Yoga",
    detail: "17.00 • 20 menit • 2,5 MET",
    calories: "56 kkal",
    icon: "",
    bonus: false,
  },
];

const suggestions = [
  {
    name: "Jalan santai",
    detail: "20 menit • ±78 kkal",
    description: "Pilihan ringan untuk menutup hari.",
    icon: "",
  },
  {
    name: "Yoga pemulihan",
    detail: "15 menit • ±42 kkal",
    description: "Peregangan lembut, tanpa mengejar intensitas.",
    icon: "",
  },
];

const Icon = ({
  src,
  className = "h-5 w-5",
  alt = "",
}: {
  src: string;
  className?: string;
  alt?: string;
}) => <img src={src} className={className} alt={alt} aria-hidden={!alt} />;

export const ActivityAndHydrationSection = (): JSX.Element => {
  const [selectedActivity, setSelectedActivity] = useState("Jalan kaki");
  const [duration, setDuration] = useState("20");
  const [_startTime, setStartTime] = useState("19.00");
  const [customAmount, setCustomAmount] = useState("200");
  const [hydration, setHydration] = useState(1750);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState(drinks);

  const selected = useMemo(
    () =>
      activityOptions.find((activity) => activity.name === selectedActivity) ??
      activityOptions[0],
    [selectedActivity],
  );

const selectedMet = Number(String((selected as any)?.met || "0").replace(",", "."));
const durationNum = Number(duration || 0);
const estimatedCalories = Math.round(selectedMet * durationNum * 3.5 * 64 / 200);

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
      { time: "19.00 WIB", amount, icon: vector38 },
    ]);
  };

  const undoLastDrink = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHydration((current) => Math.max(0, current - last.amount));
    setHistory((current) => current.slice(0, -1));
  };

  const progress = Math.round((hydration / 2640) * 100);

  return (
    <main className="relative flex min-h-screen flex-1 grow flex-col items-start bg-[#f7f9f5] text-[#203d32]">
      <header className="flex h-[78px] w-full items-center justify-between border-b border-[#e1e7df] bg-white px-9">
        <nav
          aria-label="Breadcrumb"
          className="inline-flex items-center gap-2 text-xs"
        >
          <span className="[font-family:'Inter-Regular',Helvetica] text-[#728078]">
            Ruang sehat
          </span>
          <Icon src={vector10} className="h-[13px] w-[13px]" />
          <strong className="[font-family:'Inter-SemiBold',Helvetica]">
            Aktivitas &amp; hidrasi
          </strong>
        </nav>
        <div className="inline-flex items-center gap-[18px]">
          <span className="rounded-full bg-[#f0f3ec] px-2.5 py-1 text-[11px] font-semibold text-[#728078]">
            Data contoh
          </span>
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative rounded p-1"
          >
            <Icon src={vector11} className="h-[19px] w-[19px]" />
            <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-[#167653]" />
          </button>
          <div className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#dcebb2] text-[11px] font-bold">
            NP
          </div>
        </div>
      </header>
      <section className="flex w-full flex-col gap-6 px-9 pb-7 pt-[30px]">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="font-['Manrope-Regular'] text-3xl tracking-[-0.24px]">
              Bergerak cukup. Minum teratur.
            </h1>
            <p className="mt-1 text-[13px] text-[#728078]">
              Senin, 19 Oktober 2026 • Catatan hingga 18.30 WIB
            </p>
          </div>
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 rounded-[10px] border border-[#e1e7df] bg-white px-[18px] py-[11px] text-sm font-semibold text-[#167653]"
          >
            <Icon src={vector12} className="h-[17px] w-[17px]" />
            19 Okt 2026
          </button>
        </div>
        <div className="grid grid-cols-3 gap-[18px]">
          {[
            [
              "Durasi bergerak",
              "50 menit",
              "2 aktivitas tercatat hari ini",
              vector13,
            ],
            [
              "Energi terbakar",
              "258 kkal",
              "Ditambahkan ke sisa kalori",
              vector14,
            ],
            [
              "Bonus air olahraga",
              "400 ml",
              "Bersepeda intens • 30 menit",
              vector15,
            ],
          ].map(([label, value, detail, icon], index) => (
            <article
              key={String(label)}
              className={`rounded-[18px] border border-[#e1e7df] p-5 ${
                index === 2 ? "bg-[#eaf3e9]" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#728078]">
                <span>{label}</span>
                <Icon src={String(icon)} className="h-[18px] w-[18px]" />
              </div>
              <strong className="mt-2 block text-[28px] leading-[42px]">
                {value}
              </strong>
              <p className="text-[11px] text-[#728078]">{detail}</p>
            </article>
          ))}
        </div>
        <div className="grid grid-cols-[728px_minmax(0,1fr)] items-start gap-6">
          <div className="flex flex-col gap-5">
            <section className="rounded-[18px] border border-[#e1e7df] bg-white p-6">
              <div className="mb-[18px] flex items-center justify-between">
                <h2 className="text-lg font-bold">Gerak hari ini</h2>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#167653]"
                >
                  Lihat riwayat →
                </button>
              </div>
              <div className="space-y-4">
                {activityHistory.map((activity) => (
                  <div key={activity.name}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#eaf3e9]">
                        <Icon
                          src={activity.icon}
                          className="h-[19px] w-[19px]"
                        />
                      </div>
                      <div className="flex-1">
                        <strong className="block text-[13px]">
                          {activity.name}
                        </strong>
                        <span className="text-[11px] text-[#728078]">
                          {activity.detail}
                        </span>
                      </div>
                      <strong className="text-sm">{activity.calories}</strong>
                    </div>
                    {activity.bonus && (
                      <span className="ml-[50px] mt-2 inline-block rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[11px] font-semibold text-[#4b8dab]">
                        Bonus air +400 ml
                      </span>
                    )}
                    <div className="mt-4 flex justify-end text-[11px] text-[#728078]">
                      Edit&nbsp;&nbsp;·&nbsp;&nbsp;Hapus
                    </div>
                    {activity.name !== "Yoga" && (
                      <hr className="mt-4 border-[#e1e7df]" />
                    )}
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-[18px] border border-[#e1e7df] bg-white p-6">
              <h2 className="text-lg font-bold">Catat aktivitas baru</h2>
              <p className="mt-1 text-xs text-[#728078]">
                Pilih aktivitas dan durasi; kalori diperkirakan otomatis.
              </p>
              <div className="mt-[18px] grid grid-cols-3 gap-2.5">
                {activityOptions.map((activity) => (
                  <button
                    type="button"
                    key={activity.name}
                    onClick={() => setSelectedActivity(activity.name)}
                    aria-pressed={selectedActivity === activity.name}
                    className={`flex items-center gap-2 rounded-[10px] border p-[13px] text-left ${
                      selectedActivity === activity.name
                        ? "border-[#167653] bg-[#eaf3e9]"
                        : "border-[#e1e7df] bg-white"
                    }`}
                  >
                    <Icon src={activity.icon} className="h-[21px] w-[21px]" />
                    <span>
                      <span className="block text-xs">{activity.name}</span>
                      <span className="block text-[10px] text-[#728078]">
                        {activity.met}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-[15px]">
                <label className="text-[13px] font-semibold">
                  Durasi
                  <span className="mt-2 flex items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px]">
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                      className="w-full bg-transparent text-sm font-normal outline-none"
                    />
                    <span className="text-xs font-normal text-[#728078]">
                      menit
                    </span>
                  </span>
                </label>
                <label className="text-[13px] font-semibold">
                  Waktu mulai
                  <span className="mt-2 flex items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px]">
                    <input
                      type="time"
                      onChange={(event) =>
                        setStartTime(event.target.value.replace(":", "."))
                      }
                      className="w-full bg-transparent text-sm font-normal outline-none"
                    />
                    <span className="text-xs font-normal text-[#728078]">
                      WIB
                    </span>
                  </span>
                </label>
              </div>
              <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#f0f3ec] p-[17px]">
                <Icon src={vector25} className="h-[25px] w-[25px]" />
                <div className="flex-1">
                  <strong className="block text-[13px]">
                    Estimasi energi: {estimatedCalories} kkal
                  </strong>
                  <span className="text-[10px] text-[#728078]">
                    {selected.met} × 3,5 × 64 kg ÷ 200 × {duration || 0} menit
                  </span>
                </div>
                <span className="rounded-full bg-[#e4e9e0] px-2.5 py-1 text-[11px] text-[#728078]">
                  Belum dicatat
                </span>
              </div>
              <p className="mt-4 text-[11px] leading-[16.5px] text-[#728078]">
                MET adalah perkiraan intensitas dari katalog. Hasil dapat
                berbeda menurut kecepatan dan kondisi tiap orang; bukan
                pengukuran perangkat.
              </p>
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#167653] px-[18px] py-[11px] text-sm font-semibold text-white"
              >
                <Icon src={vector26} className="h-[17px] w-[17px]" />
                {saved ? "Aktivitas tersimpan" : "Simpan aktivitas"}
              </button>
            </section>
            <section>
              <h2 className="mb-3.5 text-lg font-bold">
                Sesuai energi 4/5 hari ini
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion.name}
                    onClick={() =>
                      setSelectedActivity(
                        suggestion.name
                          .replace(" santai", "")
                          .replace(" pemulihan", ""),
                      )
                    }
                    className="rounded-2xl bg-[#eaf3e9] p-5 text-left"
                  >
                    <Icon src={suggestion.icon} className="h-[26px] w-[26px]" />
                    <strong className="mt-2.5 block text-[15px]">
                      {suggestion.name}
                    </strong>
                    <span className="mt-1 block text-xs font-semibold text-[#167653]">
                      {suggestion.detail}
                    </span>
                    <p className="mt-2 text-[11px] text-[#728078]">
                      {suggestion.description}
                    </p>
                    <span className="mt-2 block text-[11px] text-[#167653]">
                      Pilih aktivitas →
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3.5 text-[11px] text-[#728078]">
                Opsional, bukan tambahan wajib. Berhenti dan istirahat bila
                merasa tidak nyaman.
              </p>
            </section>
          </div>
          <div className="flex flex-col gap-5">
            <section className="rounded-[18px] border border-[#e1e7df] bg-white p-[22px]">
              <h2 className="text-lg font-bold">Isi ulang energimu</h2>
              <p className="mt-1 text-xs text-[#728078]">Hidrasi hari ini</p>
              <div className="mt-[18px] flex items-center gap-[23px]">
                <div className="relative h-40 w-[82px] overflow-hidden rounded-[22px] border-2 border-[#c5dde3] bg-[#ecf5f7]">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-[#a8ccd7]"
                    style={{ height: `${Math.max(20, progress * 1.06)}px` }}
                  />
                  <div className="relative p-2">
                    <Icon src={vector29} className="h-[25px] w-[25px]" />
                  </div>
                </div>
                <div>
                  <p className="text-[29px]">
                    <span className="text-xs">ml</span>
                  </p>
                  <p className="text-xs text-[#728078]">dari 2.640 ml</p>
                  <span className="mt-2 inline-block rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[11px] font-semibold text-[#4b8dab]">
                    {progress}% tercapai
                  </span>
                  <p className="mt-1 text-[11px] text-[#728078]">Tersisa ml</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                  <span>Target hari ini</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-[#f0f3ec]">
                  <div
                    className="h-full rounded-full bg-[#4b8dab]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => addHydration(250)}
                  className="min-h-11 rounded-[10px] border border-[#e1e7df] text-sm font-semibold text-[#167653]"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => addHydration(500)}
                  className="min-h-11 rounded-[10px] bg-[#167653] text-sm font-semibold text-white"
                >
                  +500 ml
                </button>
              </div>
              <div className="mt-4 flex items-end gap-2.5">
                <label className="flex-1 text-[13px] font-semibold">
                  Jumlah lainnya
                  <span className="mt-2 flex rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px]">
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(event) => setCustomAmount(event.target.value)}
                      className="w-full outline-none"
                    />
                    <span className="text-xs font-normal text-[#728078]">
                      ml
                    </span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={addCustomHydration}
                  className="min-h-11 rounded-[10px] border border-[#e1e7df] px-[18px] text-sm font-semibold text-[#167653]"
                >
                  Tambah
                </button>
              </div>
              <hr className="my-5 border-[#e1e7df]" />
              <div className="space-y-4 text-[13px]">
                <div className="flex justify-between">
                  <span>
                    <strong className="block">Target dasar</strong>
                    <small className="text-[11px] text-[#728078]">
                      35 ml × 64 kg
                    </small>
                  </span>
                  <strong>2.240 ml</strong>
                </div>
                <div className="flex justify-between">
                  <span>
                    <strong className="block">Bonus olahraga</strong>
                    <small className="text-[11px] text-[#728078]">
                      30 menit bersepeda intens
                    </small>
                  </span>
                  <strong>+400 ml</strong>
                </div>
              </div>
              <p className="mt-4 text-[10px] leading-[15px] text-[#728078]">
                Panduan bonus: 350–500 ml per 30 menit olahraga intens. Contoh
                ini memakai 400 ml, ditambahkan satu kali; yoga tidak menambah
                bonus.
              </p>
            </section>
            <section className="rounded-[18px] border border-[#e1e7df] bg-white p-[22px]">
              <h2 className="text-lg font-bold">Riwayat minum</h2>
              <p className="mt-1 text-xs text-[#728078]">
                {history.length} catatan • total ml
              </p>
              <div className="mt-[18px] space-y-3">
                {history.map((drink, index) => (
                  <div
                    key={`${drink.time}-${index}`}
                    className="flex items-center gap-3 text-xs"
                  >
                    <Icon src={drink.icon} className="h-[18px] w-[18px]" />
                    <span className="flex-1">{drink.time}</span>
                    <span className="text-[13px]">{drink.amount} ml</span>
                    <button
                      type="button"
                      aria-label={`Hapus catatan ${drink.time}`}
                      className="h-3.5 w-3.5"
                    >
                      <Icon src={vector31} className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <hr className="my-4 border-[#e1e7df]" />
              <button
                type="button"
                onClick={undoLastDrink}
                className="text-[11px] font-semibold text-[#167653]"
              >
                ↶ Batalkan catatan terakhir
              </button>
            </section>
          </div>
        </div>
        <aside className="flex items-start gap-[11px] rounded-[10px] bg-[#eaf3e9] p-3.5 text-xs text-[#124b39]">
          <Icon src={vector40} className="h-[18px] w-[18px]" />
          <p>
            Aktivitas tersimpan menambah sisa kalori. Hanya olahraga intens yang
            menambah target air. Menghapus aktivitas juga menyesuaikan kedua
            target secara otomatis.
          </p>
        </aside>
      </section>
      <footer className="flex w-full items-start justify-between px-9 pb-6 pt-2 text-[10px] text-[#728078]">
        <p>
          FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli
          gizi.
        </p>
        <span>FitBite © 2026</span>
      </footer>
    </main>
  );
};
