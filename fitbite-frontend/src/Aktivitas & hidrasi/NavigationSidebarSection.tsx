import React from "react";
import {
  LayoutDashboard,
  Activity,
  Utensils,
  Footprints,
  BookOpen,
  TrendingUp,
  User,
  Heart,
  LogOut,
} from "lucide-react";

type NavigationItem = {
  label: string;
  icon: React.ElementType;
};

const navigationItems: NavigationItem[] = [
  { label: "Hari ini", icon: LayoutDashboard },
  { label: "Body Check pagi", icon: Activity },
  { label: "Jurnal makanan", icon: Utensils },
  { label: "Aktivitas & hidrasi", icon: Footprints },
  { label: "Jurnal & evaluasi", icon: BookOpen },
  { label: "Progres", icon: TrendingUp },
  { label: "Profil & pengingat", icon: User },
];

interface NavigationSidebarProps {
  activeItem?: string;
  onSelect?: (label: string) => void;
}

export const NavigationSidebarSection: React.FC<NavigationSidebarProps> = ({
  activeItem = "Aktivitas & hidrasi",
  onSelect,
}) => {
  return (
    <aside
      aria-label="Navigasi FitBite"
      className="flex flex-col w-[216px] items-start gap-[33px] px-[18px] py-[30px] relative self-stretch bg-white border-r border-[#e1e7df] shrink-0"
    >
      {/* Logo Brand */}
      <div className="inline-flex items-center gap-2.5 relative">
        <div className="flex w-9 h-9 items-center justify-center relative bg-[#167653] rounded-xl overflow-hidden text-white shadow-sm">
          <Footprints className="w-5 h-5" />
        </div>
        <div className="relative font-extrabold text-[#124b39] text-[25px] tracking-[-0.25px]">
          FitBite
        </div>
      </div>

      {/* Navigasi Menu */}
      <nav className="flex flex-col items-start gap-[7px] relative self-stretch w-full">
        <div className="relative self-stretch font-bold text-[#728078] text-[10px] tracking-[0] leading-[15px]">
          RUANG SEHATMU
        </div>
        {navigationItems.map((item) => {
          const isActive = activeItem === item.label;
          const IconComponent = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect?.(item.label)}
              className={`flex items-center gap-2.5 px-[11px] py-3 relative self-stretch w-full rounded-[10px] overflow-hidden text-left transition-colors ${
                isActive ? "bg-[#eaf3e9]" : "bg-transparent hover:bg-[#f6f7f2]"
              }`}
            >
              <IconComponent
                className={`w-[19px] h-[19px] shrink-0 ${
                  isActive ? "text-[#167653]" : "text-[#728078]"
                }`}
              />
              <span
                className={`relative flex-1 text-xs leading-[18px] ${
                  isActive
                    ? "font-bold text-[#167653]"
                    : "font-medium text-[#728078]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Kotak Motivasi */}
      <section
        aria-label="Motivasi"
        className="flex flex-col items-start gap-2.5 p-4 relative self-stretch w-full bg-[#eaf3e9] rounded-2xl overflow-hidden"
      >
        <div className="text-[#167653]">
          <Heart className="w-6 h-6 fill-[#167653]/20" />
        </div>
        <div className="self-stretch font-bold text-[#124b39] text-[13px] leading-[19.5px]">
          Konsisten, bukan sempurna.
        </div>
        <p className="self-stretch font-normal text-[#728078] text-[11px] leading-[16.5px]">
          Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
        </p>
      </section>

      {/* Profil Pengguna & Keluar */}
      <div className="flex flex-col items-start gap-4 relative self-stretch w-full mt-auto">
        <div className="relative self-stretch w-full h-px bg-[#e1e7df]" role="separator" />
        <div className="items-center gap-3 self-stretch w-full flex relative">
          <div className="flex w-[38px] h-[38px] items-center justify-center relative bg-[#eaf3e9] rounded-xl overflow-hidden text-[#167653] font-semibold text-sm">
            NP
          </div>
          <div className="flex flex-col items-start gap-[3px] relative flex-1 grow">
            <div className="relative self-stretch font-semibold text-[#203d32] text-[13px] leading-[19.5px]">
              Nadia Putri
            </div>
            <div className="relative self-stretch font-normal text-[#728078] text-[11px] leading-[16.5px]">
              Anggota FitBite
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {}}
          className="self-stretch text-left font-normal text-[#728078] text-[11px] leading-[16.5px] hover:text-[#167653] transition-colors flex items-center gap-1"
        >
          Keluar dari akun <LogOut className="w-3 h-3 inline" />
        </button>
      </div>
    </aside>
  );
};