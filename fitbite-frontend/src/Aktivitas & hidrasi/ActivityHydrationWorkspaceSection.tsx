import { useMemo, useState } from "react";
import vector10 from "./vector-10.svg";
import vector11 from "./vector-11.svg";
import vector12 from "./vector-12.svg";
import vector13 from "./vector-13.svg";
import vector14 from "./vector-14.svg";
import vector15 from "./vector-15.svg";
import vector16 from "./vector-16.svg";
import vector17 from "./vector-17.svg";
import vector18 from "./vector-18.svg";
import vector19 from "./vector-19.svg";
import vector20 from "./vector-20.svg";
import vector21 from "./vector-21.svg";
import vector22 from "./vector-22.svg";
import vector23 from "./vector-23.svg";
import vector24 from "./vector-24.svg";
import vector25 from "./vector-25.svg";
import vector26 from "./vector-26.svg";
import vector27 from "./vector-27.svg";
import vector28 from "./vector-28.svg";
import vector29 from "./vector-29.svg";
import vector30 from "./vector-30.svg";
import vector31 from "./vector-31.svg";
import vector32 from "./vector-32.svg";
import vector33 from "./vector-33.svg";
import vector34 from "./vector-34.svg";
import vector35 from "./vector-35.svg";
import vector36 from "./vector-36.svg";
import vector37 from "./vector-37.svg";
import vector38 from "./vector-38.svg";
import vector39 from "./vector-39.svg";
import vector40 from "./vector-40.svg";

type Activity = {
  name: string;
  time: string;
  duration: number;
  met: string;
  calories: number;
  icon: string;
};

type Drink = {
  time: string;
  amount: number;
  icon: string;
  removeIcon: string;
};

const _icons = [
  vector10,
  vector11,
  vector12,
  vector13,
  vector14,
  vector15,
  vector16,
  vector17,
  vector18,
  vector19,
  vector20,
  vector21,
  vector22,
  vector23,
  vector24,
  vector25,
  vector26,
  vector27,
  vector28,
  vector29,
  vector30,
  vector31,
  vector32,
  vector33,
  vector34,
  vector35,
  vector36,
  vector37,
  vector38,
  vector39,
  vector40,
];

const activityOptions = [
  { name: "Jalan kaki", met: "3,5 MET", icon: vector18 },
  { name: "Lari", met: "7,0 MET", icon: vector19 },
  { name: "Bersepeda", met: "6,0 MET", icon: vector20 },
  { name: "Berenang", met: "6,0 MET", icon: vector21 },
  { name: "Yoga", met: "2,5 MET", icon: vector22 },
  { name: "Latihan beban", met: "3,5 MET", icon: vector23 },
];

const recommendations = [
  {
    title: "Jalan santai",
    detail: "20 menit • ±78 kkal",
    description: "Pilihan ringan untuk menutup hari.",
    icon: vector27,
  },
  {
    title: "Yoga pemulihan",
    detail: "15 menit • ±42 kkal",
    description: "Peregangan lembut, tanpa mengejar intensitas.",
    icon: vector28,
  },
];

const initialActivities: Activity[] = [
  {
    name: "Bersepeda intens",
    time: "16.00",
    duration: 30,
    met: "6,0 MET",
    calories: 202,
    icon: vector16,
  },
  {
    name: "Yoga",
    time: "17.00",
    duration: 20,
    met: "2,5 MET",
    calories: 56,
    icon: vector17,
  },
];

const initialDrinks: Drink[] = [
  { time: "07.00 WIB", amount: 500, icon: vector30, removeIcon: vector31 },
  { time: "09.30 WIB", amount: 250, icon: vector32, removeIcon: vector33 },
  { time: "12.00 WIB", amount: 500, icon: vector34, removeIcon: vector35 },
  { time: "15.30 WIB", amount: 250, icon: vector36, removeIcon: vector37 },
  { time: "17.30 WIB", amount: 250, icon: vector38, removeIcon: vector39 },
];

const Icon = ({
  src,
  alt = "",
  className = "h-5 w-5 object-contain",
}: {
  src: string;
  alt?: string;
  className?: string;
}) => <img src={src} alt={alt} className={className} />;

const ActionButton = ({
  children,
  onClick,
  primary = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex min-h-11 items-center justify-center rounded-[10px] border px-[18px] py-[11px] text-sm font-semibold leading-[21px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#167653] focus:ring-offset-2 ${
      primary
        ? "border-[#167653] bg-[#167653] text-white hover:bg-[#124b39]"
        : "border-[#e1e7df] bg-white text-[#167653] hover:bg-[#f0f3ec]"
    } ${className}`}
  >
    {children}
  </button>
);

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`overflow-hidden rounded-[18px] border border-solid border-[#e1e7df] bg-white p-6 ${className}`}
  >
    {children}
  </section>
);

export const ActivityHydrationWorkspaceSection = (): JSX.Element => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [selectedActivity, setSelectedActivity] = useState("Jalan kaki");
  const [duration, setDuration] = useState(20);
  const [startTime, setStartTime] = useState("19.00");
  const [customAmount, setCustomAmount] = useState(200);
  const [savedMessage, setSavedMessage] = useState("");

  const totalWater = useMemo(
    () => drinks.reduce((total, drink) => total + drink.amount, 0),
    [drinks],
  );

  const estimatedCalories = Math.round((3.5 * 3.5 * 64 * duration) / 200);

  const addWater = (amount: number) => {
    setDrinks((current) => [
      ...current,
      {
        time: "18.30 WIB",
        amount,
        icon: vector38,
        removeIcon: vector39,
      },
    ]);
  };

  const saveActivity = () => {
    const option = activityOptions.find(
      (item) => item.name === selectedActivity,
    );
    if (!option) return;
    setActivities((current) => [
      ...current,
      {
        name: selectedActivity,
        time: startTime,
        duration,
        met: option.met,
        calories: estimatedCalories,
        icon: option.icon,
      },
    ]);
    setSavedMessage("Aktivitas berhasil disimpan");
    window.setTimeout(() => setSavedMessage(""), 2500);
  };

  const removeLastDrink = () => {
    setDrinks((current) => current.slice(0, -1));
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f8f4] text-[#203d32]">
      <header className="flex h-[78px] items-center justify-between border-b border-[#e1e7df] bg-white px-9">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs"
        >
          <span className="font-normal text-[#728078]">Ruang sehat</span>
          <Icon src={vector10} className="h-[13px] w-[13px]" />
          <span className="font-semibold text-[#203d32]">
            Aktivitas &amp; hidrasi
          </span>
        </nav>
        <div className="flex items-center gap-[18px]">
          <span className="rounded-full bg-[#f0f3ec] px-2.5 py-1 text-[11px] font-semibold leading-[16.5px] text-[#728078]">
            Data contoh
          </span>
          <span
            className="flex items-center gap-[5px]"
            aria-label="Notifikasi aktif"
          >
            <Icon src={vector11} className="h-[19px] w-[19px]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#167653]" />
          </span>
          <span className="flex h-[33px] w-[33px] items-center justify-center rounded-full bg-[#dcebb2] text-[11px] font-bold text-[#203d32]">
            NP
          </span>
        </div>
      </header>
      <div className="flex flex-col gap-6 px-9 pb-7 pt-[30px]">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="font-['Manrope-Regular',Helvetica] text-3xl leading-[37.5px] tracking-[-0.24px]">
              Bergerak cukup. Minum teratur.
            </h1>
            <p className="mt-[5px] text-[13px] leading-[19.5px] text-[#728078]">
              Senin, 19 Oktober 2026 • Catatan hingga 18.30 WIB
            </p>
          </div>
          <ActionButton>
            <Icon src={vector12} className="mr-2 h-[17px] w-[17px]" />
            19 Okt 2026
          </ActionButton>
        </div>
        <div className="grid grid-cols-3 gap-[18px]">
          {[
            [
              "Durasi bergerak",
              `${activities.reduce((sum, item) => sum + item.duration, 0)} menit`,
              "2 aktivitas tercatat hari ini",
              vector13,
            ],
            [
              "Energi terbakar",
              `${activities.reduce((sum, item) => sum + item.calories, 0)} kkal`,
              "Ditambahkan ke sisa kalori",
              vector14,
            ],
            [
              "Bonus air olahraga",
              "400 ml",
              "Bersepeda intens • 30 menit",
              vector15,
            ],
          ].map(([label, value, description, icon], index) => (
            <article
              key={String(label)}
              className={`rounded-[18px] border border-[#e1e7df] p-5 ${
                index === 2 ? "bg-[#eaf3e9]" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between text-xs leading-[18px] text-[#728078]">
                <span>{label}</span>
                <Icon src={String(icon)} className="h-[18px] w-[18px]" />
              </div>
              <strong className="mt-[9px] block text-[28px] leading-[42px]">
                {value}
              </strong>
              <p className="text-[11px] leading-[16.5px] text-[#728078]">
                {description}
              </p>
            </article>
          ))}
        </div>
        <div className="grid grid-cols-[728px_minmax(0,1fr)] items-start gap-6">
          <div className="flex flex-col gap-5">
            <Card>
              <div className="mb-[18px] flex items-center justify-between">
                <h2 className="text-lg font-bold leading-[27px]">
                  Gerak hari ini
                </h2>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#167653]"
                >
                  Lihat riwayat →
                </button>
              </div>
              <div className="space-y-[18px]">
                {activities.map((activity, index) => (
                  <div key={`${activity.name}-${activity.time}`}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#eaf3e9]">
                        <Icon
                          src={activity.icon}
                          className="h-[19px] w-[19px]"
                        />
                      </span>
                      <div className="flex-1">
                        <h3 className="text-[13px] font-semibold leading-[19.5px]">
                          {activity.name}
                        </h3>
                        <p className="text-[11px] leading-[16.5px] text-[#728078]">
                          {activity.time} • {activity.duration} menit •{" "}
                          {activity.met}
                        </p>
                      </div>
                      <strong className="text-sm">
                        {activity.calories} kkal
                      </strong>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      {index === 0 && (
                        <span className="rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[11px] font-semibold text-[#4b8dab]">
                          Bonus air +400 ml
                        </span>
                      )}
                      <button
                        type="button"
                        className="ml-auto text-[11px] text-[#728078]"
                      >
                        Edit&nbsp;&nbsp;·&nbsp;&nbsp;Hapus
                      </button>
                    </div>
                    {index < activities.length - 1 && (
                      <div className="mt-[18px] h-px bg-[#e1e7df]" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="text-lg font-bold leading-[27px]">
                Catat aktivitas baru
              </h2>
              <p className="mt-[3px] text-xs leading-[18px] text-[#728078]">
                Pilih aktivitas dan durasi; kalori diperkirakan otomatis.
              </p>
              <div className="mt-[18px] grid grid-cols-3 gap-2.5">
                {activityOptions.map((option) => {
                  const selected = option.name === selectedActivity;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setSelectedActivity(option.name)}
                      className={`flex items-center gap-[9px] rounded-[10px] border p-[13px] text-left ${
                        selected
                          ? "border-[#167653] bg-[#eaf3e9]"
                          : "border-[#e1e7df] bg-white"
                      }`}
                      aria-pressed={selected}
                    >
                      <Icon src={option.icon} className="h-[21px] w-[21px]" />
                      <span>
                        <span className="block text-xs leading-[18px]">
                          {option.name}
                        </span>
                        <span className="block text-[10px] leading-[15px] text-[#728078]">
                          {option.met}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-[15px]">
                <label className="text-[13px] font-semibold">
                  Durasi jalan kaki
                  <span className="mt-[7px] flex min-h-[47px] items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px]">
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(event) =>
                        setDuration(Number(event.target.value))
                      }
                      className="w-full bg-transparent text-sm font-normal outline-none"
                    />
                    <span className="text-xs font-normal text-[#728078]">
                      menit
                    </span>
                  </span>
                </label>
                <label className="text-[13px] font-semibold">
                  Waktu mulai
                  <span className="mt-[7px] flex min-h-[47px] items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px]">
                    <input
                      type="text"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      className="w-full bg-transparent text-sm font-normal outline-none"
                    />
                    <span className="text-xs font-normal text-[#728078]">
                      WIB
                    </span>
                    <Icon src={vector24} className="ml-2 h-[17px] w-[17px]" />
                  </span>
                </label>
              </div>
              <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#f0f3ec] p-[17px]">
                <Icon src={vector25} className="h-[25px] w-[25px]" />
                <div className="flex-1">
                  <strong className="block text-[13px] leading-[19.5px]">
                    Estimasi energi: {estimatedCalories} kkal
                  </strong>
                  <p className="text-[10px] leading-[15px] text-[#728078]">
                    3,5 MET × 3,5 × 64 kg ÷ 200 × {duration} menit
                  </p>
                </div>
                <span className="rounded-full bg-[#f0f3ec] px-2.5 py-1 text-[11px] text-[#728078]">
                  Belum dicatat
                </span>
              </div>
              <p className="mt-[18px] text-[11px] leading-[16.5px] text-[#728078]">
                MET adalah perkiraan intensitas dari katalog. Hasil dapat
                berbeda menurut kecepatan dan kondisi tiap orang; bukan
                pengukuran perangkat.
              </p>
              <ActionButton
                primary
                onClick={saveActivity}
                className="mt-[18px] w-full"
              >
                <Icon src={vector26} className="mr-2 h-[17px] w-[17px]" />
                Simpan aktivitas
              </ActionButton>
              {savedMessage && (
                <p
                  role="status"
                  className="mt-2 text-center text-xs font-semibold text-[#167653]"
                >
                  {savedMessage}
                </p>
              )}
            </Card>
            <section>
              <h2 className="mb-3.5 text-lg font-bold leading-[27px]">
                Sesuai energi 4/5 hari ini
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {recommendations.map((recommendation) => (
                  <article
                    key={recommendation.title}
                    className="rounded-2xl bg-[#eaf3e9] p-5"
                  >
                    <Icon
                      src={recommendation.icon}
                      className="h-[26px] w-[26px]"
                    />
                    <h3 className="mt-2.5 text-[15px] font-bold">
                      {recommendation.title}
                    </h3>
                    <p className="mt-2 text-xs font-semibold text-[#167653]">
                      {recommendation.detail}
                    </p>
                    <p className="mt-2 text-[11px] leading-[16.5px] text-[#728078]">
                      {recommendation.description}
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-[11px] text-[#167653]"
                    >
                      Pilih aktivitas →
                    </button>
                  </article>
                ))}
              </div>
              <p className="mt-3.5 text-[11px] leading-[16.5px] text-[#728078]">
                Opsional, bukan tambahan wajib. Berhenti dan istirahat bila
                merasa tidak nyaman.
              </p>
            </section>
          </div>
          <div className="flex flex-col gap-5">
            <Card className="p-[22px]">
              <h2 className="text-lg font-bold leading-[27px]">
                Isi ulang energimu
              </h2>
              <p className="mt-[3px] text-xs leading-[18px] text-[#728078]">
                Hidrasi hari ini
              </p>
              <div className="mt-[18px] flex items-center gap-[23px]">
                <div className="relative h-40 w-[82px] overflow-hidden rounded-[22px] border-2 border-[#c5dde3] bg-[#ecf5f7]">
                  <div className="absolute bottom-0 h-[106px] w-full bg-[#a8ccd7]" />
                  <div className="absolute top-[46px] -left-2 h-[18px] w-[100px] rounded-[50px] bg-[#a8ccd7]" />
                  <Icon
                    src={vector29}
                    className="relative ml-3 mt-3 h-[25px] w-[25px]"
                  />
                </div>
                <div>
                  <p className="text-[29px] leading-[43.5px]">
                    <span className="text-xs">ml</span>
                  </p>
                  <p className="text-xs text-[#728078]">dari 2.640 ml</p>
                  <span className="mt-2 inline-block rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[11px] font-semibold text-[#4b8dab]">
                    % tercapai
                  </span>
                  <p className="mt-2 text-[11px] text-[#728078]">Tersisa ml</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs">
                  <span>Target hari ini</span>
                  <span className="text-[#728078]">%</span>
                </div>
                <div className="mt-2 h-[7px] overflow-hidden rounded-[5px] bg-[#f0f3ec]">
                  <div
                    className="h-full rounded-[5px] bg-[#4b8dab]"
                    style={{
                      width: `${Math.min(100, (totalWater / 2640) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <ActionButton onClick={() => addWater(250)}>
                  +250 ml
                </ActionButton>
                <ActionButton primary onClick={() => addWater(500)}>
                  +500 ml
                </ActionButton>
              </div>
              <div className="mt-5 flex items-end gap-2.5">
                <label className="flex-1 text-[13px] font-semibold">
                  Jumlah lainnya
                  <span className="mt-[7px] flex min-h-[47px] items-center rounded-[10px] border border-[#e1e7df] px-3.5 py-[11px]">
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(event) =>
                        setCustomAmount(Number(event.target.value))
                      }
                      className="w-full bg-transparent text-sm font-normal outline-none"
                    />
                    <span className="text-xs font-normal text-[#728078]">
                      ml
                    </span>
                  </span>
                </label>
                <ActionButton onClick={() => addWater(customAmount)}>
                  Tambah
                </ActionButton>
              </div>
              <div className="my-[18px] h-px bg-[#e1e7df]" />
              {[
                ["Target dasar", "35 ml × 64 kg", "2.240 ml"],
                ["Bonus olahraga", "30 menit bersepeda intens", "+400 ml"],
              ].map(([title, description, value]) => (
                <div key={title} className="mb-3 flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-[13px] font-semibold">{title}</h3>
                    <p className="text-[11px] text-[#728078]">{description}</p>
                  </div>
                  <strong className="text-sm">{value}</strong>
                </div>
              ))}
              <p className="text-[10px] leading-[15px] text-[#728078]">
                Panduan bonus: 350–500 ml per 30 menit olahraga intens. Contoh
                ini memakai 400 ml, ditambahkan satu kali; yoga tidak menambah
                bonus.
              </p>
            </Card>
            <Card className="p-[22px]">
              <h2 className="text-lg font-bold leading-[27px]">
                Riwayat minum
              </h2>
              <p className="text-xs leading-[18px] text-[#728078]">
                {drinks.length} catatan • total ml
              </p>
              <div className="mt-[18px] space-y-3">
                {drinks.map((drink, index) => (
                  <div
                    key={`${drink.time}-${index}`}
                    className="flex items-center gap-3"
                  >
                    <Icon src={drink.icon} className="h-[18px] w-[18px]" />
                    <span className="flex-1 text-xs">{drink.time}</span>
                    <span className="text-[13px]">{drink.amount} ml</span>
                    <button
                      type="button"
                      aria-label={`Hapus catatan ${drink.time}`}
                      onClick={() =>
                        setDrinks((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <Icon src={drink.removeIcon} className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="my-[18px] h-px bg-[#e1e7df]" />
              <button
                type="button"
                onClick={removeLastDrink}
                disabled={!drinks.length}
                className="text-left text-[11px] font-semibold text-[#167653] disabled:opacity-40"
              >
                ↶ Batalkan catatan terakhir ({drinks.at(-1)?.amount ?? 0} ml)
              </button>
            </Card>
          </div>
        </div>
        <aside className="flex items-start gap-[11px] rounded-[10px] bg-[#eaf3e9] p-3.5">
          <Icon src={vector40} className="h-[18px] w-[18px]" />
          <p className="flex-1 text-xs leading-[18px] text-[#124b39]">
            Aktivitas tersimpan menambah sisa kalori. Hanya olahraga intens yang
            menambah target air. Menghapus aktivitas juga menyesuaikan kedua
            target secara otomatis.
          </p>
        </aside>
      </div>
      <footer className="flex items-start justify-between px-9 pb-6 pt-2 text-[10px] leading-[15px] text-[#728078]">
        <p>
          FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli
          gizi.
        </p>
        <p>FitBite © 2026</p>
      </footer>
    </main>
  );
};
