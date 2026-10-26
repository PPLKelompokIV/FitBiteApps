import { useState, type ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
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
import identitasFitbite from "../assets/Identitas FitBite (1).png";

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  to?: string;
};

const navigationItems: NavigationItem[] = [
  { label: "Hari ini", icon: LayoutGrid },
  { label: "Body Check pagi", icon: Sun },
  { label: "Jurnal makanan", icon: Utensils, to: "/foto-ai" },
  { label: "Aktivitas & hidrasi", icon: Activity },
  { label: "Jurnal & evaluasi", icon: CalendarCheck },
  { label: "Progres", icon: TrendingUp },
  { label: "Profil & pengingat", icon: SlidersHorizontal, to: "/profil-pengingat" },
];

export const HealthAppSidebarSection = (): ReactElement => {
  const [activeItem, setActiveItem] = useState("Jurnal makanan");
  const location = useLocation();

  return (
    <aside
      className="sticky top-0 flex h-screen w-[216px] shrink-0 flex-col items-start justify-between self-stretch border-r border-[#e1e7df] bg-white px-[18px] py-[28px]"
      aria-label="Navigasi FitBite"
    >
      <div className="flex w-full flex-col items-start gap-[30px]">
        <header className="inline-flex items-center gap-2.5">
          <img
            className="h-7 w-auto max-w-[120px] object-contain px-1"
            alt="Identitas FitBite"
            src={identitasFitbite}
          />
        </header>

        {/* Navigation Items */}
        <nav
          className="flex w-full flex-col items-start gap-[6px]"
          aria-label="Ruang sehatmu"
        >
          <h2 className="mb-1 px-2.5 text-[10px] font-bold uppercase leading-[15px] tracking-wider text-[#728078]">
            RUANG SEHATMU
          </h2>
          {navigationItems.map((item) => {
            const isActive = item.to
              ? location.pathname === item.to
              : activeItem === item.label;
            const IconComponent = item.icon;
            const className = `flex w-full items-center gap-3 rounded-[10px] px-[12px] py-2.5 text-left transition-colors ${
              isActive
                ? "bg-[#eaf3e9] font-bold text-[#167653]"
                : "bg-transparent font-medium text-[#728078] hover:bg-[#f4f7f3]"
            }`;

            return (
              item.to ? (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={className}
                >
                  <IconComponent
                    className={`h-[18px] w-[18px] shrink-0 ${
                      isActive ? "text-[#167653]" : "text-[#728078]"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="flex-1 text-xs leading-[18px]">{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setActiveItem(item.label)}
                  className={className}
                >
                  <IconComponent
                    className={`h-[18px] w-[18px] shrink-0 ${
                      isActive ? "text-[#167653]" : "text-[#728078]"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="flex-1 text-xs leading-[18px]">{item.label}</span>
                </button>
              )
            );
          })}
        </nav>

        {/* Motivational Card */}
        <section
          className="flex w-full flex-col items-start gap-2 rounded-2xl bg-[#eaf3e9] p-4"
          aria-label="Pesan motivasi"
        >
          <Sprout className="h-6 w-6 text-[#167653]" strokeWidth={1.8} />
          <h2 className="mt-0.5 text-[13px] font-bold leading-[18.5px] text-[#124b39]">
            Konsisten, bukan sempurna.
          </h2>
          <p className="text-[11px] font-normal leading-[16px] text-[#728078]">
            Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
          </p>
        </section>
      </div>

      <footer className="flex w-full flex-col items-start gap-3.5 pt-6">
        <div className="h-px w-full bg-[#e1e7df]" aria-hidden="true" />
        <div className="flex w-full items-center gap-3">
          <div
            className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167653]"
            aria-hidden="true"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <div className="w-full truncate text-[13px] font-semibold leading-[18px] text-[#203d32]">
              Nadia Putri
            </div>
            <div className="text-[11px] font-normal leading-[16px] text-[#728078]">
              Anggota FitBite
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => undefined}
          className="inline-flex items-center gap-1 text-[11px] font-normal leading-[16.5px] text-[#728078] transition-colors hover:text-[#203d32]"
        >
          <span>Keluar dari akun</span>
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </footer>
    </aside>
  );
};
