import { useState, type ReactElement } from "react";
import {
  CalendarDays,
  HeartPulse,
  UtensilsCrossed,
  Droplets,
  ClipboardList,
  TrendingUp,
  Bell,
  Sparkles,
  LogOut,
} from "lucide-react";

type NavigationItem = {
  label: string;
  icon: (props: { className?: string }) => ReactElement;
};

const navigationItems: NavigationItem[] = [
  { label: "Hari ini", icon: CalendarDays },
  { label: "Body Check pagi", icon: HeartPulse },
  { label: "Jurnal makanan", icon: UtensilsCrossed },
  { label: "Aktivitas & hidrasi", icon: Droplets },
  { label: "Jurnal & evaluasi", icon: ClipboardList },
  { label: "Progres", icon: TrendingUp },
  { label: "Profil & pengingat", icon: Bell },
];

export const HealthAppSidebarSection = (): ReactElement => {
  const [activeItem, setActiveItem] = useState("Jurnal makanan");

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col items-start justify-between border-r border-[#e1e7df] bg-white p-5 overflow-y-auto">
      <div className="flex w-full flex-col gap-6">
        {/* Brand Header */}
        <header className="inline-flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#167653] text-[#dcebb2]"
            aria-hidden="true"
          >
            <svg
              className="h-[22px] w-[22px]"
              viewBox="0 0 36 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.8326 26.25C8.8326 24.2952 9.6895 22.6368 11.2485 21.6304M11.2485 21.6304C11.8828 21.2209 12.6333 20.9194 13.4895 20.7498C15.708 20.3098 17.9998 18.9164 18.9165 17.9997M11.2485 21.6304C11.6025 22.3886 12.1043 23.077 12.7326 23.6515C13.9204 24.7379 15.4731 25.3382 17.0828 25.3333C21.8681 25.3333 26.25 21.2081 26.25 16.1662C26.25 12.6644 25.3333 10.666 24.4166 8.8326C22.5831 11.106 21.2081 11.5827 15.9828 12.5911C14.396 12.8622 12.9691 13.7197 11.9851 14.9935C11.001 16.2674 10.5317 17.8646 10.6701 19.4683C10.7354 20.2239 10.9333 20.9549 11.2485 21.6304Z" />
            </svg>
          </div>
          <span className="font-extrabold text-[24px] tracking-tight text-[#124b39]">
            FitBite
          </span>
        </header>

        {/* Navigation Items */}
        <nav
          className="flex flex-col gap-1.5"
          aria-label="Navigasi FitBite"
        >
          <div className="px-2 pb-1 font-bold text-[10px] uppercase tracking-wider text-[#728078]">
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
                onClick={() => setActiveItem(item.label)}
                className={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-xs transition-colors ${
                  isActive
                    ? "bg-[#eaf3e9] font-bold text-[#167653]"
                    : "bg-transparent font-medium text-[#728078] hover:bg-[#f3f6f1] hover:text-[#203d32]"
                }`}
              >
                <IconComponent
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-[#167653]" : "text-[#728078]"
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Motivational Card */}
        <section className="flex flex-col gap-2 rounded-2xl bg-[#eaf3e9] p-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dcebb2] text-[#167653]">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="font-bold text-[13px] leading-snug text-[#124b39]">
            Konsisten, bukan sempurna.
          </h2>
          <p className="font-normal text-[11px] leading-relaxed text-[#728078]">
            Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
          </p>
        </section>
      </div>

      {/* User Footer */}
      <footer className="flex w-full flex-col gap-3.5 pt-4">
        <div className="h-px w-full bg-[#e1e7df]" />
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf3e9] font-bold text-xs text-[#167653]"
            aria-hidden="true"
          >
            NP
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="truncate font-semibold text-[13px] text-[#203d32]">
              Nadia Putri
            </div>
            <div className="truncate font-normal text-[11px] text-[#728078]">
              Anggota FitBite
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => undefined}
          className="flex items-center gap-1.5 text-left font-normal text-[11px] text-[#728078] transition-colors hover:text-[#167653]"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar dari akun</span>
        </button>
      </footer>
    </aside>
  );
};
