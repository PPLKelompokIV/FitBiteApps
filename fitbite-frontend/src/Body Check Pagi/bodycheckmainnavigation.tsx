import type { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Sun,
  SunMedium,
  Utensils,
  Activity,
  CalendarCheck,
  TrendingUp,
  SlidersHorizontal,
  Sprout,
  User,
  ArrowUpRight,
  ChevronRight,
  Bell,
  Sparkles,
  Check,
  Heart,
  type LucideIcon,
} from "lucide-react";
import identitasFitbite from "../assets/Identitas FitBite (1).png";

// ==========================================
// 1. TYPES DEFINITIONS
// ==========================================

export type SleepQuality = "Kurang nyenyak" | "Cukup" | "Nyenyak";
export type PlannedIntensity = "Ringan" | "Sedang" | "Tinggi";
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export interface BodyCheckFormData {
  weight: string;
  sleepDuration: string;
  sleepQuality: SleepQuality;
  energyLevel: number;
  plannedIntensity: PlannedIntensity;
}

// ==========================================
// 2. SIDEBAR NAVIGATION
// ==========================================

interface NavigationItem {
  label: string;
  icon: LucideIcon;
  to: string;
}

const navigationItems: NavigationItem[] = [
  { label: "Hari ini", icon: LayoutGrid, to: "#hari-ini" },
  { label: "Body Check pagi", icon: Sun, to: "/bodycheckpagi" },
  { label: "Jurnal makanan", icon: Utensils, to: "/foto-ai" },
  { label: "Aktivitas & hidrasi", icon: Activity, to: "#aktivitas" },
  { label: "Jurnal & evaluasi", icon: CalendarCheck, to: "#jurnal" },
  { label: "Progres", icon: TrendingUp, to: "#progres" },
  { label: "Profil & pengingat", icon: SlidersHorizontal, to: "/profil-pengingat" },
];

export const BodyCheckSidebar = (): ReactElement => {
  const location = useLocation();

  return (
    <aside
      className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col items-start justify-between border-r border-[#e6ebe3] bg-white px-4 py-6 select-none overflow-y-auto"
      aria-label="Navigasi FitBite"
    >
      <div className="flex w-full flex-col items-start gap-6">
        {/* Logo */}
        <header className="inline-flex items-center px-1">
          <img
            className="h-7 w-auto max-w-[125px] object-contain"
            alt="FitBite"
            src={identitasFitbite}
          />
        </header>

        {/* Navigation Items */}
        <nav
          className="flex w-full flex-col items-start gap-1"
          aria-label="Ruang sehatmu"
        >
          <h2 className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#798880]">
            RUANG SEHATMU
          </h2>
          {navigationItems.map((item) => {
            const isActive =
              item.to === "/bodycheckpagi"
                ? location.pathname === "/bodycheckpagi"
                : location.pathname === item.to;
            const IconComponent = item.icon;
            const linkClassName = `flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors ${
              isActive
                ? "bg-[#eaf3e9] font-bold text-[#14533a]"
                : "bg-transparent font-medium text-[#728078] hover:bg-[#f4f7f3] hover:text-[#14533a]"
            }`;

            return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className={linkClassName}
              >
                <IconComponent
                  className={`h-[18px] w-[18px] shrink-0 ${
                    isActive ? "text-[#14533a]" : "text-[#728078]"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className="flex-1 text-xs leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Motivational Card */}
        <section
          className="flex w-full flex-col items-start gap-2 rounded-2xl bg-[#eaf3e9] p-4"
          aria-label="Pesan motivasi"
        >
          <Sprout className="h-5 w-5 text-[#14533a]" strokeWidth={2} />
          <h3 className="mt-0.5 text-[13px] font-bold leading-snug text-[#124b39]">
            Konsisten, bukan sempurna.
          </h3>
          <p className="text-[11px] font-normal leading-relaxed text-[#6f7e76]">
            Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
          </p>
        </section>
      </div>

      {/* User profile footer */}
      <footer className="flex w-full flex-col items-start gap-3 pt-6">
        <div className="flex w-full items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#14533a]"
            aria-hidden="true"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="w-full truncate text-[13px] font-semibold leading-tight text-[#1b3d30]">
              Nadia Putri
            </span>
            <span className="text-[11px] font-normal text-[#788880]">
              Anggota FitBite
            </span>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] font-normal text-[#788880] transition-colors hover:text-[#1b3d30]"
        >
          <span>Keluar dari akun</span>
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </footer>
    </aside>
  );
};

// ==========================================
// 3. TOP BREADCRUMB & HEADER
// ==========================================

export const BodyCheckHeader = (): ReactElement => {
  return (
    <header className="flex h-14 items-center justify-between px-6 pt-2 sm:px-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#718278]">
        <span className="hover:text-[#183d30] transition-colors cursor-pointer">
          Ruang sehat
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-[#9cb0a4]" />
        <span className="font-semibold text-[#183d30]">
          Body Check pagi
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-[#dbe2da] bg-[#eef2ec] px-3 py-1 text-xs font-medium text-[#56685f]">
          Data contoh
        </span>

        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#5a6c62] transition-colors hover:bg-[#eaf0e8] hover:text-[#183d30]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#186445]" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d3ded0] text-xs font-semibold text-[#2f4a3b]">
          NP
        </div>
      </div>
    </header>
  );
};

// ==========================================
// 4. TITLE & NOTICE BANNER
// ==========================================

interface BodyCheckBannerProps {
  isSaved: boolean;
}

export const BodyCheckBanner = ({ isSaved }: BodyCheckBannerProps): ReactElement => {
  return (
    <div>
      {/* Title Section */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a6e4d]">
          BODY CHECK PAGI
        </span>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-[#143d30] sm:text-[28px]">
          Selamat pagi, Nadia <span className="text-xl sm:text-2xl">☀️</span>
        </h1>
        <p className="mt-1 text-xs text-[#7a8c82]">
          Senin, 19 Oktober 2026 • 06.45 WIB •{" "}
          <span className={isSaved ? "text-[#1a6e4d] font-medium" : ""}>
            {isSaved ? "Tersimpan" : "Sebelum disimpan"}
          </span>
        </p>
      </div>

      {/* Information Notice Banner */}
      <section
        aria-label="Pemberitahuan Body Check"
        className="mt-5 flex items-center gap-3 rounded-2xl bg-[#eaf4ec] px-4 py-3 text-xs font-medium leading-relaxed text-[#22553f] sm:text-[13px]"
      >
        <SunMedium className="h-4 w-4 shrink-0 text-[#1a6e4d]" />
        <span>
          Satu check-in setiap hari. Luangkan satu menit sebelum memulai aktivitas;
          target akan ditetapkan setelah kamu menyimpan.
        </span>
      </section>
    </div>
  );
};

// ==========================================
// 5. MAIN FORM SECTION
// ==========================================

interface BodyCheckFormSectionProps {
  weight: string;
  setWeight: (v: string) => void;
  sleepDuration: string;
  setSleepDuration: (v: string) => void;
  sleepQuality: SleepQuality;
  setSleepQuality: (v: SleepQuality) => void;
  energyLevel: number;
  setEnergyLevel: (v: number) => void;
  plannedIntensity: PlannedIntensity;
  setPlannedIntensity: (v: PlannedIntensity) => void;
  isSaved: boolean;
  onSave: () => void;
  toastMessage: string | null;
}

export const BodyCheckFormSection = ({
  weight,
  setWeight,
  sleepDuration,
  setSleepDuration,
  sleepQuality,
  setSleepQuality,
  energyLevel,
  setEnergyLevel,
  plannedIntensity,
  setPlannedIntensity,
  isSaved,
  onSave,
  toastMessage,
}: BodyCheckFormSectionProps): ReactElement => {
  return (
    <div className="lg:col-span-8">
      {/* Form Card */}
      <div className="rounded-2xl border border-[#e5ebe4] bg-white p-6 shadow-xs sm:p-7">
        <h2 className="text-lg font-bold text-[#163e31] sm:text-xl">
          Bagaimana tubuhmu hari ini?
        </h2>
        <p className="mt-1 mb-6 text-xs text-[#7e8f85]">
          Tidak harus selalu bugar. Jawab sesuai yang kamu rasakan.
        </p>

        {/* Weight and Sleep Duration inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Weight Input */}
          <div>
            <label className="mb-2 block text-xs font-bold text-[#183d30]">
              Berat badan saat ini
            </label>
            <div className="flex items-center justify-between rounded-xl border border-[#e0e6de] bg-[#fbfdfb] px-3.5 py-2.5 transition-all focus-within:border-[#1a6e4d] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#1a6e4d]">
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-[#183d30] outline-none"
                placeholder="64,0"
              />
              <span className="select-none pl-2 text-xs font-normal text-[#809187]">
                kg
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#86968c]">
              Timbang di waktu yang konsisten.
            </p>
          </div>

          {/* Sleep Duration Input */}
          <div>
            <label className="mb-2 block text-xs font-bold text-[#183d30]">
              Durasi tidur semalam
            </label>
            <div className="flex items-center justify-between rounded-xl border border-[#e0e6de] bg-[#fbfdfb] px-3.5 py-2.5 transition-all focus-within:border-[#1a6e4d] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#1a6e4d]">
              <input
                type="text"
                value={sleepDuration}
                onChange={(e) => setSleepDuration(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-[#183d30] outline-none"
                placeholder="7,5"
              />
              <span className="select-none pl-2 text-xs font-normal text-[#809187]">
                jam
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#86968c]">
              Perkiraan sudah cukup.
            </p>
          </div>
        </div>

        {/* Sleep Quality Toggle */}
        <div className="mt-6">
          <label className="mb-2.5 block text-xs font-bold text-[#183d30]">
            Kualitas tidur
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#eef2ec] p-1">
            {(["Kurang nyenyak", "Cukup", "Nyenyak"] as const).map((item) => {
              const isSelected = sleepQuality === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSleepQuality(item)}
                  className={`cursor-pointer rounded-lg py-2 text-center text-xs transition-all ${
                    isSelected
                      ? "bg-white font-bold text-[#14533a] shadow-xs"
                      : "font-medium text-[#65766c] hover:text-[#183d30]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level (1-5) */}
        <div className="mt-6">
          <label className="mb-2.5 block text-xs font-bold text-[#183d30]">
            Energi pagi ini
          </label>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {[
              { value: 1, label: "Sangat lelah" },
              { value: 2, label: "Lelah" },
              { value: 3, label: "Cukup" },
              { value: 4, label: "Berenergi" },
              { value: 5, label: "Sangat segar" },
            ].map((item) => {
              const isSelected = energyLevel === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setEnergyLevel(item.value)}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl py-3.5 px-2 text-center transition-all ${
                    isSelected
                      ? "border-2 border-[#2b7e59] bg-[#edf7f0] text-[#14533a]"
                      : "border border-[#dce3da] bg-white text-[#183d30] hover:border-[#b4c8bb]"
                  }`}
                >
                  <span
                    className={`text-2xl font-bold ${
                      isSelected ? "text-[#14533a]" : "text-[#183d30]"
                    }`}
                  >
                    {item.value}
                  </span>
                  <span
                    className={`mt-1 text-[11px] leading-tight ${
                      isSelected
                        ? "font-semibold text-[#14533a]"
                        : "text-[#6b7c72]"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Planned Activity Intensity */}
        <div className="mt-6">
          <label className="mb-2.5 block text-xs font-bold text-[#183d30]">
            Intensitas aktivitas yang direncanakan
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#eef2ec] p-1">
            {(["Ringan", "Sedang", "Tinggi"] as const).map((item) => {
              const isSelected = plannedIntensity === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPlannedIntensity(item)}
                  className={`cursor-pointer rounded-lg py-2 text-center text-xs transition-all ${
                    isSelected
                      ? "bg-white font-bold text-[#14533a] shadow-xs"
                      : "font-medium text-[#65766c] hover:text-[#183d30]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-[11px] text-[#86968c]">
            Rencana: bersepeda intens selama 30 menit. Bisa berubah mengikuti
            kondisi tubuh.
          </p>
        </div>
      </div>

      {/* Form Footer Action */}
      <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <span className="text-xs text-[#7e8f85]">
          {isSaved
            ? "Body Check tersimpan untuk hari ini."
            : "Belum ada Body Check tersimpan untuk hari ini."}
        </span>
        <button
          type="button"
          onClick={onSave}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#13573e] px-6 py-3 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#0f4632] active:scale-95 whitespace-nowrap sm:text-sm"
        >
          <Check className="h-4 w-4 stroke-[2.5]" />
          <span>Simpan Body Check</span>
        </button>
      </div>

      {toastMessage && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#13573e] px-4 py-2 text-xs font-medium text-white shadow-md">
          <Check className="h-3.5 w-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. RIGHT OVERVIEW & METRICS CARDS
// ==========================================

export const BodyCheckOverviewSection = (): ReactElement => {
  return (
    <div className="space-y-4 lg:col-span-4">
      {/* 1. Dark Green Summary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f3d2f] p-6 text-white shadow-xs">
        {/* Top: Sparkles & Badge */}
        <div className="flex items-center justify-between">
          <Sparkles className="h-5 w-5 text-[#8ee0b6]" />
          <span className="rounded-full border border-[#2a6652] bg-[#1a513f] px-2.5 py-0.5 text-[11px] font-medium text-[#9ae6bf]">
            Pratinjau
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-4 text-sm font-semibold text-white/95">
          Titik awal hari ini
        </h2>

        {/* Value */}
        <div className="mt-2 flex items-baseline">
          <span className="text-4xl font-extrabold tracking-tight text-white">
            1.700
          </span>
          <span className="ml-1.5 text-sm font-medium text-[#9ae4c0]">
            kkal
          </span>
        </div>
        <p className="mt-1 text-xs text-[#8bbda7]">
          Target sebelum tambahan olahraga tercatat
        </p>

        {/* Macros Breakdown */}
        <div className="mt-5 grid grid-cols-3 gap-2 pt-2">
          <div>
            <span className="text-xs text-[#8cbda8]">Protein</span>
            <p className="mt-0.5 text-sm font-bold text-white">100 g</p>
          </div>
          <div>
            <span className="text-xs text-[#8cbda8]">Karbo</span>
            <p className="mt-0.5 text-sm font-bold text-white">190 g</p>
          </div>
          <div>
            <span className="text-xs text-[#8cbda8]">Lemak</span>
            <p className="mt-0.5 text-sm font-bold text-white">60 g</p>
          </div>
        </div>
      </div>

      {/* 2. Behind the Numbers Card */}
      <div className="rounded-2xl border border-[#e5ebe4] bg-white p-6 shadow-xs">
        <h2 className="mb-4 text-base font-bold text-[#163c2f]">
          Di balik angkanya
        </h2>

        <div className="space-y-4">
          {/* Metric 1: BMR */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#183d30]">BMR</h3>
              <p className="text-[11px] text-[#809187]">Mifflin–St Jeor</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs font-bold text-[#183d30] sm:text-sm">
              1.339 kkal
            </span>
          </div>

          {/* Metric 2: TDEE dinamis */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#183d30]">
                TDEE dinamis
              </h3>
              <p className="text-[11px] text-[#809187]">
                Estimasi aktivitas rutin hari ini
              </p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs font-bold text-[#183d30] sm:text-sm">
              2.000 kkal
            </span>
          </div>

          {/* Metric 3: Air dasar */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#183d30]">
                Air dasar
              </h3>
              <p className="text-[11px] text-[#809187]">35 ml × 64 kg</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs font-bold text-[#183d30] sm:text-sm">
              2.240 ml
            </span>
          </div>
        </div>

        {/* Footnote inside card */}
        <div className="mt-5 pt-1">
          <p className="text-[11px] leading-relaxed text-[#798b81]">
            Tidur dan energi membantu menyesuaikan estimasi TDEE. Defisit
            contoh: 300 kkal. Olahraga yang dicatat ditambahkan terpisah agar
            tidak dihitung dua kali.
          </p>
        </div>
      </div>

      {/* 3. Mindset / Disclaimer Card */}
      <div className="flex items-start gap-2.5 rounded-xl bg-[#eaf4ec] p-3.5">
        <Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#1f6a4a]" />
        <p className="text-xs font-medium leading-relaxed text-[#1e583f]">
          Angka adalah panduan, bukan diagnosis. Utamakan rasa nyaman dan
          kebutuhan tubuhmu.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 7. FOOTER
// ==========================================

export const BodyCheckFooter = (): ReactElement => {
  return (
    <footer className="mt-12 flex flex-col items-center justify-between gap-2 pt-6 pb-8 text-[11px] text-[#8c9c93] sm:flex-row">
      <p>
        FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli gizi.
      </p>
      <p>FitBite © 2026</p>
    </footer>
  );
};

