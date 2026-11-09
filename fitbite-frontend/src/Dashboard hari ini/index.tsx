// @ts-nocheck
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  Bike,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Droplets,
  Flame,
  Footprints,
  Plus,
  Sparkles,
  Utensils,
  Wallet,
  Waves,
  Moon,
  Leaf,
  Salad,
  Sun,
  Heart,
} from "lucide-react";

import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";
import { MealLogModal } from "./MealLogModal";

const initialMeals = [
  {
    name: "Sarapan",
    detail: "07.30 • Oat, pisang, yoghurt",
    calories: 350,
    icon: "breakfast",
  },
  {
    name: "Makan siang",
    detail: "12.30 • Nasi merah, ayam, tempe, sayur",
    calories: 600,
    icon: "lunch",
  },
  {
    name: "Camilan",
    detail: "15.00 • Pepaya & yoghurt",
    calories: 150,
    icon: "snack",
  },
  {
    name: "Makan malam",
    detail: "18.00 • Sup sayur & tahu",
    calories: 250,
    icon: "dinner",
  },
];

const activities = [
  {
    name: "Bersepeda intens",
    detail: "16.00 • 30 menit · 6,0 MET",
    calories: 202,
    icon: Bike,
  },
  {
    name: "Yoga",
    detail: "17.00 • 20 menit · 2,5 MET",
    calories: 56,
    icon: Activity,
  },
];

const recommendations = [
  {
    title: "Gado-gado, saus terpisah",
    detail: "1 porsi 250 g • 330 kkal • protein 18 g",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Pepes ikan & nasi merah",
    detail: "1 porsi 280 g • 420 kkal • protein 32 g",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80",
  },
];

const nutrients = [
  { name: "Protein", value: "90 / 100 g", percent: 90, color: "#167653" },
  { name: "Karbohidrat", value: "150 / 190 g", percent: 79, color: "#8eab58" },
  { name: "Lemak", value: "43 / 60 g", percent: 72, color: "#cbab6d" },
];

const Card = ({ children, className = "" }) => (
  <section
    className={`min-w-0 rounded-[18px] border border-[#e1e7df] bg-white p-5 shadow-[0_1px_3px_rgba(31,54,42,0.04)] sm:p-6 ${className}`}
  >
    {children}
  </section>
);

const SectionTitle = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h2 className="text-[17px] font-bold leading-6 text-[#203d32]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-0.5 text-xs leading-[18px] text-[#728078]">
          {subtitle}
        </p>
      )}
    </div>
    {action}
  </div>
);

const SmallAction = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="shrink-0 text-xs font-semibold text-[#167653] transition hover:text-[#105b40]"
  >
    {children}
  </button>
);

const FoodIcon = ({ kind }) => {
  const Icon =
    kind === "breakfast"
      ? Sun
      : kind === "lunch"
        ? Utensils
        : kind === "snack"
          ? Salad
          : Moon;

  return (
    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-[#eaf3e9] text-[#167653]">
      <Icon size={19} strokeWidth={1.8} />
    </div>
  );
};

export const DashboardHariIni = () => {
  const navigate = useNavigate();
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [water, setWater] = useState(1750);
  const [mealList, setMealList] = useState([]);

  const displayedMeals = useMemo(
    () => [
      ...initialMeals,
      ...mealList.map((meal) => ({
        name: meal.name,
        detail: `${meal.time} • Dicatat hari ini`,
        calories: Number(meal.calories),
        icon: "snack",
      })),
    ],
    [mealList],
  );

  const waterTarget = 2640;
  const waterPercent = Math.min(100, (water / waterTarget) * 100);
  const remainingWater = Math.max(0, waterTarget - water);
  const handleSaveMeal = (newMeal) => {
    setMealList((previous) => [...previous, newMeal]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8faf6] text-[#203d32]">
      <HealthAppSidebarSection />

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-[#f8faf6]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-[66px] shrink-0 items-center justify-between border-b border-[#e1e7df] bg-white px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
            <span className="text-[#728078]">Ruang sehat</span>
            <ChevronRight size={14} className="text-[#728078]" />
            <strong className="font-semibold text-[#203d32]">Hari ini</strong>
          </nav>
          <div className="flex items-center gap-3 sm:gap-[18px]">
            <span className="rounded-full bg-[#f0f3ec] px-3 py-1.5 text-[11px] font-semibold text-[#728078]">
              Data contoh
            </span>
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative hidden text-[#728078] sm:block"
            >
              <Bell size={19} />
              <span className="absolute -right-0.5 top-0 h-1.5 w-1.5 rounded-full bg-[#167653]" />
            </button>
            <div
              aria-label="Profil Nadia Putri"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#dcebb2] text-[11px] font-bold text-[#203d32]"
            >
              NP
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-5 py-6 sm:gap-6 sm:px-8 sm:py-7">
          {/* Greeting and main actions */}
          <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h1 className="text-[25px] font-extrabold leading-tight tracking-[-0.5px] text-[#203d32] sm:text-[29px]">
                Hari baik dimulai dari pilihan kecil.
              </h1>
              <p className="mt-1.5 text-xs leading-[19px] text-[#728078] sm:text-[13px]">
                Halo, Nadia. Ini perjalanan sehatmu pada Senin, 19 Oktober 2026 • 18.30 WIB.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/foto-ai")}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border border-[#e1e7df] bg-white px-4 py-2.5 text-xs font-semibold text-[#167653] transition hover:bg-[#f5f8f3]"
              >
                <Sparkles size={16} />
                Foto AI
              </button>
              <button
                type="button"
                onClick={() => setIsMealModalOpen(true)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] bg-[#167653] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#126244]"
              >
                <Plus size={17} />
                Catat makanan
              </button>
            </div>
          </section>

          {/* Body check summary strip */}
          <section className="flex flex-col gap-4 rounded-[16px] bg-[#eaf3e9] px-5 py-4 lg:flex-row lg:items-center lg:gap-5">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#167653]">
                <CheckCircle2 size={21} />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#203d32]">
                  Body Check selesai
                </p>
                <p className="mt-0.5 text-[11px] text-[#728078]">
                  Tersimpan pukul 06.48
                </p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-[#ccdccc] lg:block" />
            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[10px] text-[#728078]">Berat</p>
                <p className="mt-1 text-xs text-[#203d32]">64,0 kg</p>
              </div>
              <div>
                <p className="text-[10px] text-[#728078]">Tidur</p>
                <p className="mt-1 text-xs text-[#203d32]">7,5 jam • nyenyak</p>
              </div>
              <div>
                <p className="text-[10px] text-[#728078]">Energi</p>
                <p className="mt-1 text-xs text-[#203d32]">4/5 • berenergi</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-[#167653]">
              Target dipersonalisasi
            </span>
          </section>

          {/* Energy and hydration */}
          <div className="grid grid-cols-1 items-stretch gap-5 2xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,0.95fr)]">
            <Card className="flex flex-col gap-5">
              <SectionTitle
                title="Keseimbangan energi"
                subtitle="Target harianmu, dengan ruang untuk bergerak."
              />

              <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)]">
                {/* Circular energy graphic */}
                <div className="relative mx-auto flex h-[190px] w-[190px] items-center justify-center">
                  <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                    <circle
                      cx="100"
                      cy="100"
                      r="84"
                      fill="none"
                      stroke="#eaf3e9"
                      strokeWidth="12"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="84"
                      fill="none"
                      stroke="#167653"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="528"
                      strokeDashoffset="150"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <Flame size={20} className="mb-1 text-[#167653]" />
                    <strong className="text-[40px] font-semibold leading-[1.1] text-[#203d32]">
                      608
                    </strong>
                    <span className="mt-1 text-xs text-[#728078]">
                      kkal tersisa
                    </span>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Masuk", value: "1.350", icon: Utensils },
                      { label: "Target", value: "1.700", icon: CircleUserRound },
                      { label: "Terbakar", value: "258", icon: Flame },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="min-w-0">
                          <Icon size={17} className="mb-2 text-[#167653]" />
                          <p className="text-[11px] text-[#728078]">{item.label}</p>
                          <p className="mt-1 text-xl font-bold leading-7 text-[#203d32] sm:text-[23px]">
                            {item.value}
                          </p>
                          <p className="text-[10px] text-[#728078]">kkal</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="rounded-[10px] bg-[#f0f3ec] p-3">
                    <p className="text-[11px] font-semibold text-[#203d32]">
                      Sisa = Target + Terbakar − Masuk
                    </p>
                    <p className="mt-1 text-[11px] text-[#728078]">
                      1.700 + 258 − 1.350 = 608 kkal
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-[#e1e7df]" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                {nutrients.map((nutrient) => (
                  <div key={nutrient.name} className="min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <strong className="text-xs font-medium text-[#203d32]">
                        {nutrient.name}
                      </strong>
                      <span className="whitespace-nowrap text-[11px] text-[#728078]">
                        {nutrient.value}
                      </span>
                    </div>
                    <div className="h-[7px] overflow-hidden rounded-full bg-[#f0f3ec]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${nutrient.percent}%`,
                          backgroundColor: nutrient.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Water card */}
            <Card className="flex flex-col gap-4">
              <SectionTitle
                title="Seteguk lagi, yuk."
                subtitle="Air minum hari ini"
              />
              <div className="flex items-center gap-5">
                <div className="relative h-[125px] w-[78px] shrink-0 overflow-hidden rounded-b-[18px] rounded-t-[8px] border-2 border-[#c5dde3] bg-[#ecf5f7]">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-[#a8ccd7] transition-all duration-300"
                    style={{ height: `${waterPercent}%` }}
                  />
                  <div
                    className="absolute left-0 w-full border-t border-white/50"
                    style={{ bottom: `${waterPercent}%` }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="whitespace-nowrap text-[27px] font-bold leading-9 text-[#203d32]">
                    {water.toLocaleString("id-ID")}
                    <span className="ml-1 text-[12px] font-normal text-[#728078]">
                      ml
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-[#728078]">
                    dari 2.640 ml • {Math.round(waterPercent)}%
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[#ecf5f7] px-2.5 py-1 text-[10px] font-semibold text-[#4b8dab]">
                    Tersisa {remainingWater.toLocaleString("id-ID")} ml
                  </span>
                </div>
              </div>
              <p className="text-[11px] leading-[17px] text-[#728078]">
                Dasar 2.240 + bonus olahraga 400 ml
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWater((value) => Math.min(waterTarget, value + 250))}
                  className="min-h-10 rounded-[9px] border border-[#e1e7df] bg-white px-3 text-xs font-semibold text-[#167653] transition hover:bg-[#f5f8f3]"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => setWater((value) => Math.min(waterTarget, value + 500))}
                  className="min-h-10 rounded-[9px] bg-[#167653] px-3 text-xs font-semibold text-white transition hover:bg-[#126244]"
                >
                  +500 ml
                </button>
              </div>
              <div className="h-px w-full bg-[#e1e7df]" />
              <div className="flex items-center gap-3">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-[#eaf3e9] text-[#167653]">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#203d32]">
                    Pengingat berikutnya
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#728078]">
                    19.00 • Minum air, beri jeda sejenak
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/aktivitas-hidrasi")}
                className="text-left text-[11px] font-medium text-[#167653] hover:underline"
              >
                Atur jumlah & lihat riwayat →
              </button>
            </Card>
          </div>

          {/* Meals and activities */}
          <div className="grid grid-cols-1 items-stretch gap-5 2xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,0.95fr)]">
            <Card className="flex flex-col gap-4">
              <SectionTitle
                title="Yang sudah kamu nikmati"
                subtitle={`${displayedMeals.length} waktu makan • semua nilai merupakan estimasi`}
                action={
                  <SmallAction onClick={() => navigate("/jurnal-makanan")}>
                    Buka jurnal →
                  </SmallAction>
                }
              />
              <div className="flex flex-col">
                {displayedMeals.map((meal, index) => (
                  <div
                    key={`${meal.name}-${index}`}
                    className={`flex items-center gap-3 py-2.5 ${
                      index !== displayedMeals.length - 1
                        ? "border-b border-[#edf0eb]"
                        : ""
                    }`}
                  >
                    <FoodIcon kind={meal.icon} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#203d32]">
                        {meal.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#728078]">
                        {meal.detail}
                      </p>
                    </div>
                    <strong className="whitespace-nowrap text-xs font-bold text-[#203d32]">
                      {Number(meal.calories).toLocaleString("id-ID")} kkal
                    </strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <SectionTitle
                title="Gerak yang berarti"
                subtitle="50 menit • 258 kkal terbakar"
                action={
                  <SmallAction onClick={() => navigate("/aktivitas-hidrasi")}>
                    Lihat aktivitas →
                  </SmallAction>
                }
              />
              <div className="flex flex-col">
                {activities.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className={`flex items-center gap-3 py-2.5 ${
                        index === 0 ? "border-b border-[#edf0eb]" : ""
                      }`}
                    >
                      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-[#eaf3e9] text-[#167653]">
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#203d32]">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#728078]">
                          {item.detail}
                        </p>
                      </div>
                      <strong className="whitespace-nowrap text-xs font-bold text-[#203d32]">
                        {item.calories} kkal
                      </strong>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-[10px] bg-[#fbf2e2] p-3.5 text-[#a86c24]">
                <p className="text-xs font-semibold">Evaluasi malam • 20.00</p>
                <p className="mt-1 text-[11px] leading-[17px]">
                  Lengkapi catatanmu sebelum melihat rangkuman hari ini.
                </p>
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <section className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[17px] font-bold leading-6 text-[#203d32]">
                Pilihan baik berikutnya
              </h2>
              <p className="text-right text-[10px] text-[#728078]">
                Porsi & nutrisi adalah estimasi
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_270px]">
              {recommendations.map((dish) => (
                <article
                  key={dish.title}
                  className="flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-[#e1e7df] bg-white p-3"
                >
                  <img
                    src={dish.image}
                    alt={dish.title}
                    className="h-[100px] w-[105px] shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-semibold leading-5 text-[#203d32]">
                      {dish.title}
                    </h3>
                    <p className="mt-1 text-[10px] leading-4 text-[#728078]">
                      {dish.detail}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsMealModalOpen(true)}
                      className="mt-2 text-left text-[11px] font-semibold text-[#167653] hover:underline"
                    >
                      Lihat & catat →
                    </button>
                  </div>
                </article>
              ))}
              <article className="flex min-h-[125px] flex-col items-start justify-center gap-2 rounded-2xl bg-[#dcebb2] p-5">
                <Footprints size={23} className="text-[#167653]" />
                <h3 className="text-[13px] font-bold text-[#203d32]">
                  Tutup hari dengan santai
                </h3>
                <p className="text-[11px] leading-[17px] text-[#405b4b]">
                  Jalan ringan 15 menit, bila tubuh masih nyaman. Tidak perlu mengejar angka.
                </p>
              </article>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex flex-col justify-between gap-2 border-t border-[#e1e7df] pt-4 text-[10px] text-[#728078] sm:flex-row">
            <p>
              FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli gizi.
            </p>
            <span>FitBite © 2026</span>
          </footer>
        </div>
      </main>

      <MealLogModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onSave={handleSaveMeal}
      />
    </div>
  );
};

export default DashboardHariIni;
