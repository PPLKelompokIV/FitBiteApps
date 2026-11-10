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
import identitasFitbite from "../assets/Identitas FitBite (1).png";

type NavigationItem = {
  label: string;
  icon: React.ElementType;
  active?: boolean;
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
    active: true,
  },
];

export const HealthNavigationSection = () => {
  const [activeItem, setActiveItem] = useState("Profil & pengingat");
  const [imgError, setImgError] = useState(false);

  const handleNavigation = (label: string): void => {
    setActiveItem(label);
  };

  return (
    <aside
      className="sticky top-0 flex h-screen w-[216px] shrink-0 flex-col items-start justify-between self-stretch border-r border-[#e1e7df] bg-white px-[18px] py-[28px]"
      aria-label="Navigasi FitBite"
    >
      <div className="flex flex-col items-start gap-[30px] w-full">
        {/* Logo Identitas FitBite */}
        <div className="flex items-center gap-2.5 px-1">
          {!imgError ? (
            <img
              className="h-7 w-auto max-w-[120px] object-contain"
              alt="Identitas FitBite"
              src={identitasFitbite}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#167653] text-white">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#203d32]">
                FitBite
              </span>
            </div>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav
          className="flex flex-col items-start gap-[6px] w-full"
          aria-label="Ruang sehatmu"
        >
          <h2 className="px-2.5 mb-1 font-bold text-[#728078] text-[10px] leading-[15px] tracking-wider uppercase">
            RUANG SEHATMU
          </h2>
          {navigationItems.map((item) => {
            const isActive =
              activeItem === item.label || (!activeItem && item.active);
            const IconComponent = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                className={`flex items-center gap-3 px-[12px] py-2.5 w-full rounded-[10px] transition-colors text-left ${
                  isActive
                    ? "bg-[#eaf3e9] text-[#167653] font-bold"
                    : "bg-transparent text-[#728078] font-medium hover:bg-[#f4f7f3]"
                }`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleNavigation(item.label)}
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
        <section
          className="flex flex-col items-start gap-2 p-4 w-full bg-[#eaf3e9] rounded-2xl"
          aria-label="Pesan motivasi"
        >
          <Sprout className="w-6 h-6 text-[#167653]" strokeWidth={1.8} />
          <h2 className="font-bold text-[#124b39] text-[13px] leading-[18.5px] mt-0.5">
            Konsisten, bukan sempurna.
          </h2>
          <p className="font-normal text-[#728078] text-[11px] leading-[16px]">
            Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
          </p>
        </section>
      </div>

      {/* Profil Bawah & Tombol Keluar */}
      <div className="flex flex-col items-start gap-3.5 w-full pt-6">
        <div className="w-full h-px bg-[#e1e7df]" aria-hidden="true" />
        <div className="flex items-center gap-3 w-full">
          <div
            className="flex w-[36px] h-[36px] shrink-0 items-center justify-center bg-[#eaf3e9] rounded-full text-[#167653]"
            aria-hidden="true"
          >
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
          className="inline-flex items-center gap-1 font-normal text-[#728078] hover:text-[#203d32] text-[11px] leading-[16.5px] transition-colors"
          onClick={() => undefined}
        >
          <span>Keluar dari akun</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};