import React, { useState } from "react";
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
  Leaf,
} from "lucide-react";
import identitasFitbite from "../assets/Identitas FitBite.png";

type NavigationItem = {
  label: string;
  icon: React.ElementType;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Hari ini",
    icon: LayoutGrid,
  },
  {
    label: "Body Check pagi",
    icon: Sun,
  },
  {
    label: "Jurnal makanan",
    icon: Utensils,
  },
  {
    label: "Aktivitas & hidrasi",
    icon: Activity,
  },
  {
    label: "Jurnal & evaluasi",
    icon: CalendarCheck,
  },
  {
    label: "Progres",
    icon: TrendingUp,
  },
  {
    label: "Profil & pengingat",
    icon: SlidersHorizontal,
  },
];

export const SidebarNavigationSection = () => {
  const [activeItem, setActiveItem] = useState("Jurnal & evaluasi");
  const [imgError, setImgError] = useState(false);

  return (
    <aside
      className="flex flex-col w-[216px] shrink-0 items-start justify-between px-[18px] py-[28px] self-stretch bg-white border-r border-[#e1e7df]"
      aria-label="Navigasi FitBite"
    >
      <div className="flex flex-col items-start gap-[30px] w-full">
        {/* Logo Identitas FitBite */}
        <div className="flex items-center gap-2.5 px-1">
          {!imgError ? (
            <img
              className="h-8 w-auto object-contain"
              alt="Identitas FitBite"
              src={identitasFitbite}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="inline-flex items-center gap-2.5">
              <div className="flex w-9 h-9 items-center justify-center bg-[#167653] rounded-xl text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="font-extrabold text-[#124b39] text-[22px] tracking-[-0.25px]">
                FitBite
              </div>
            </div>
          )}
        </div>

        {/* Menu Navigasi Utama */}
        <nav
          className="flex flex-col items-start gap-[6px] w-full"
          aria-label="Navigasi utama"
        >
          <div className="px-2.5 mb-1 font-bold text-[#728078] text-[10px] tracking-wider leading-[15px] uppercase">
            RUANG SEHATMU
          </div>
          {navigationItems.map((item) => {
            const isActive = activeItem === item.label;
            const IconComponent = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveItem(item.label)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-[12px] py-2.5 w-full rounded-[10px] border-0 text-left transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#eaf3e9] text-[#167653] font-bold"
                    : "bg-transparent text-[#728078] font-medium hover:bg-[#f4f7f3]"
                }`}
              >
                <IconComponent
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? "text-[#167653]" : "text-[#728078]"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className="flex-1 text-xs leading-[18px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Kartu Motivasi */}
        <section className="gap-2 p-4 bg-[#eaf3e9] rounded-2xl flex flex-col items-start w-full">
          <Sprout className="w-6 h-6 text-[#167653]" strokeWidth={1.8} />
          <div className="font-bold text-[#124b39] text-[13px] leading-[18.5px] mt-0.5">
            Konsisten, bukan sempurna.
          </div>
          <p className="font-normal text-[#728078] text-[11px] leading-[16px]">
            Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
          </p>
        </section>
      </div>

      {/* Profil Bawah & Tombol Keluar */}
      <div className="flex flex-col items-start gap-3.5 w-full pt-6">
        <div className="w-full h-px bg-[#e1e7df]" />
        <div className="items-center gap-3 flex w-full">
          <div className="flex w-[36px] h-[36px] shrink-0 items-center justify-center bg-[#eaf3e9] rounded-full text-[#167653]">
            <User className="w-[18px] h-[18px]" strokeWidth={2} />
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <div className="font-semibold text-[#203d32] text-[13px] leading-[18px] truncate w-full">
              Nadia Putri
            </div>
            <div className="font-normal text-[#728078] text-[11px] leading-[16px]">
              Anggota FitBite
            </div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-normal text-[#728078] hover:text-[#203d32] text-[11px] leading-[16.5px] text-left border-0 bg-transparent p-0 transition-colors cursor-pointer"
          onClick={() => undefined}
        >
          <span>Keluar dari akun</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};