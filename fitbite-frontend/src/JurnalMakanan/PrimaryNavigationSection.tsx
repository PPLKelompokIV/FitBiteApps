import { useState } from "react";
import {
  LayoutGrid,
  Sun,
  Utensils,
  Activity,
  CalendarCheck,
  TrendingUp,
  SlidersHorizontal,
  Sprout,
  User,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

type NavigationItem = {
  label: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  { label: "Hari ini", icon: LayoutGrid },
  { label: "Body Check pagi", icon: Sun },
  { label: "Jurnal makanan", icon: Utensils },
  { label: "Aktivitas & hidrasi", icon: Activity },
  { label: "Jurnal & evaluasi", icon: CalendarCheck },
  { label: "Progres", icon: TrendingUp },
  { label: "Profil & pengingat", icon: SlidersHorizontal },
];

export const PrimaryNavigationSection = () => {
  const [activeItem, setActiveItem] = useState("Jurnal makanan");

  return (
    <aside
      aria-label="Navigasi utama"
      className="flex flex-col w-[216px] shrink-0 items-start gap-[33px] px-[18px] py-[30px] relative self-stretch bg-white border-r border-[#e1e7df]"
    >
      <a
        href="/"
        aria-label="FitBite beranda"
        className="inline-flex items-center gap-2.5 relative"
      >
        <span className="flex w-9 h-9 items-center justify-center bg-[#167653] rounded-xl text-white">
          <Utensils className="h-5 w-5" />
        </span>
        <span className="font-extrabold text-[#124b39] text-[25px] tracking-[-0.25px]">
          FitBite
        </span>
      </a>

      <nav
        aria-label="Ruang sehatmu"
        className="flex flex-col items-start gap-[7px] w-full"
      >
        <h2 className="text-[#728078] text-[10px] font-bold uppercase tracking-wider">
          RUANG SEHATMU
        </h2>
        {navigationItems.map((item) => {
          const isActive = activeItem === item.label;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActiveItem(item.label)}
              className={`flex items-center gap-2.5 px-3 py-2.5 w-full rounded-[10px] text-left transition-colors ${
                isActive
                  ? "bg-[#eaf3e9] font-bold text-[#167653]"
                  : "text-[#728078] hover:bg-[#f6f8f5]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-xs leading-[18px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <section
        aria-label="Motivasi"
        className="flex flex-col items-start gap-2.5 p-4 w-full bg-[#eaf3e9] rounded-2xl"
      >
        <Sprout className="h-6 w-6 text-[#167653]" />
        <h3 className="font-bold text-[#124b39] text-[13px] leading-[19.5px]">
          Konsisten, bukan sempurna.
        </h3>
        <p className="text-[#728078] text-[11px] leading-[16.5px]">
          Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
        </p>
      </section>

      <footer className="mt-auto flex flex-col items-start gap-4 w-full pt-4 border-t border-[#e1e7df]">
        <div className="flex items-center gap-3 w-full">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#eaf3e9] text-[#167653]">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-semibold text-[#203d32] truncate">
              Nadia Putri
            </span>
            <span className="text-[10px] text-[#728078]">Anggota FitBite</span>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[11px] text-[#728078] hover:text-[#203d32] transition-colors"
        >
          <span>Keluar dari akun</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </aside>
  );
};
export default PrimaryNavigationSection;
