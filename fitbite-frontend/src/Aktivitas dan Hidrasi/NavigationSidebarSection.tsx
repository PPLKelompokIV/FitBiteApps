import { useState } from "react";
import {
  Activity,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Leaf,
  LogOut,
  Sparkles,
  TrendingUp,
  UserRound,
  Utensils,
} from "lucide-react";

type NavigationItem = {
  label: string;
  icon: React.ElementType;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Hari ini",
    icon: LayoutDashboard,
  },
  {
    label: "Body Check pagi",
    icon: ClipboardCheck,
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
    icon: BookOpen,
  },
  {
    label: "Progres",
    icon: TrendingUp,
  },
  {
    label: "Profil & pengingat",
    icon: UserRound,
  },
];

type NavigationSidebarSectionProps = {
  activePage?: string;
  onNavigate?: (page: string) => void;
};

export const NavigationSidebarSection = ({
  activePage = "Aktivitas & hidrasi",
  onNavigate,
}: NavigationSidebarSectionProps): JSX.Element => {
  const [activeItem, setActiveItem] = useState(activePage);

  const handleNavigation = (label: string) => {
    setActiveItem(label);
    onNavigate?.(label);
  };

  return (
    <aside
      aria-label="Navigasi FitBite"
      className="sticky top-0 flex h-screen w-[72px] shrink-0 flex-col border-r border-[#e1e7df] bg-white px-2 py-6 sm:w-[216px] sm:px-[18px] sm:py-[30px]"
    >
      {/* LOGO */}
      <div className="mb-8 flex items-center justify-center gap-2.5 sm:justify-start">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#167653] text-white">
          <Leaf size={22} strokeWidth={2.2} />
        </div>

        <span className="hidden text-[23px] font-extrabold tracking-tight text-[#124b39] sm:block">
          FitBite
        </span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex w-full flex-col gap-[7px]">
        <p className="mb-1 hidden px-2 text-[10px] font-bold tracking-wide text-[#728078] sm:block">
          RUANG SEHATMU
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
              onClick={() => handleNavigation(item.label)}
              className={`flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[10px] px-2 py-3 text-left transition-colors sm:justify-start sm:px-[11px] ${
                isActive
                  ? "bg-[#eaf3e9] text-[#167653]"
                  : "bg-transparent text-[#728078] hover:bg-[#f5f7f2]"
              }`}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.3 : 1.8}
                className="shrink-0"
              />

              <span
                className={`hidden flex-1 text-xs sm:block ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* MOTIVATION CARD */}
      <section
        aria-label="Motivasi"
        className="mt-7 hidden flex-col gap-2.5 rounded-2xl bg-[#eaf3e9] p-4 sm:flex"
      >
        <Sparkles
          size={25}
          className="text-[#167653]"
        />

        <h3 className="text-[13px] font-bold leading-relaxed text-[#124b39]">
          Konsisten, bukan sempurna.
        </h3>

        <p className="text-[11px] leading-relaxed text-[#728078]">
          Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
        </p>
      </section>

      {/* USER PROFILE */}
      <div className="mt-auto flex flex-col gap-4 pt-5">
        <div className="h-px w-full bg-[#e1e7df]" />

        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-[#eaf3e9] text-[#167653]">
            <UserRound size={19} />
          </div>

          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-[13px] font-semibold text-[#203d32]">
              Nadia Putri
            </p>

            <p className="mt-0.5 text-[11px] text-[#728078]">
              Anggota FitBite
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            console.log("Tombol keluar akun diklik");
          }}
          className="hidden items-center gap-2 text-left text-[11px] text-[#728078] transition hover:text-[#167653] sm:flex"
        >
          <LogOut size={14} />
          Keluar dari akun
        </button>
      </div>
    </aside>
  );
};

export default NavigationSidebarSection;
