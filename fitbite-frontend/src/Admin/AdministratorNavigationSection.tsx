import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import identitasFitbite from "../assets/Identitas FitBite.png";
import {
  LayoutDashboard,
  Utensils,
  Activity,
  Users,
  FileText,
  ShieldAlert,
  User,
  LogOut,
} from "lucide-react";

// Item tanpa `path` belum punya halaman, jadi belum berpindah saat diklik.
const navigationItems = [
  {
    label: "Ringkasan",
    icon: LayoutDashboard,
    path: undefined as string | undefined,
  },
  {
    label: "Katalog makanan",
    icon: Utensils,
    path: "/admin/pengelolaan" as string | undefined,
  },
  {
    label: "Aktivitas & MET",
    icon: Activity,
    path: "/admin/aktivitas" as string | undefined,
  },
  {
    label: "Akun pengguna",
    icon: Users,
    path: "/admin/pantau" as string | undefined,
  },
  {
    label: "Log pengelolaan",
    icon: FileText,
    path: undefined as string | undefined,
  },
];

export const AdministratorNavigationSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignedOut, setIsSignedOut] = useState(false);

  const handleSignOut = () => {
    setIsSignedOut(true);
  };

  return (
    <aside className="flex h-screen w-[216px] shrink-0 flex-col items-start gap-[33px] px-[18px] py-[30px] relative bg-[#124b39] border-r border-[#e1e7df]">
      <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
        <img className="h-7 w-auto object-contain" alt="FitBite" src={identitasFitbite} />
      </div>

      <nav
        className="flex flex-col items-start gap-[7px] relative self-stretch w-full flex-[0_0_auto]"
        aria-label="Navigasi administrator"
      >
        <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#adc4b9] text-[10px] tracking-[0] leading-[15px]">
          RUANG ADMINISTRATOR
        </div>
        {navigationItems.map((item) => {
          const isActive = !!item.path && location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                if (item.path) navigate(item.path);
              }}
              className={`flex items-center gap-2.5 px-[11px] py-3 relative self-stretch w-full flex-[0_0_auto] rounded-[10px] overflow-hidden text-left transition-colors ${
                isActive ? "bg-[#2d644e]" : "hover:bg-[#1a5b46]"
              }`}
            >
              <Icon className="w-[19px] h-[19px] text-white shrink-0" />
              <span
                className={`relative flex-1 mt-[-0.50px] ${
                  isActive
                    ? "[font-family:'Inter-Bold',Helvetica] font-bold"
                    : "[font-family:'Inter-Medium',Helvetica] font-medium"
                } text-white text-xs tracking-[0] leading-[18px]`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <section className="flex flex-col items-start gap-2.5 p-4 relative self-stretch w-full flex-[0_0_auto] bg-[#235841] rounded-2xl overflow-hidden">
        <ShieldAlert className="w-7 h-7 text-[#dcebb2]" />
        <h2 className="self-stretch [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[13px] leading-[19.5px] relative tracking-[0]">
          Privasi adalah batas.
        </h2>
        <p className="relative self-stretch [font-family:'Inter-Regular',Helvetica] font-normal text-[#c2d4c8] text-[11px] tracking-[0] leading-[16.5px]">
          Hanya katalog dan metadata akun. Data kesehatan tidak tersedia di area
          ini.
        </p>
      </section>

      <div className="flex-col items-start gap-4 flex relative self-stretch w-full flex-[0_0_auto]">
        <div className="relative self-stretch w-full h-px bg-[#2d644e]" />
        <div className="items-center gap-3 flex relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex w-[38px] h-[38px] items-center justify-center relative bg-[#eaf3e9] rounded-xl overflow-hidden text-[#124b39]">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start gap-[3px] relative flex-1 grow">
            <div className="self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-[13px] leading-[19.5px] relative tracking-[0]">
              Raka Pratama
            </div>
            <div className="relative self-stretch [font-family:'Inter-Regular',Helvetica] font-normal text-[#c2d4c8] text-[11px] tracking-[0] leading-[16.5px]">
              Administrator
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSignedOut}
          className="flex items-center gap-1.5 relative self-stretch text-left [font-family:'Inter-Regular',Helvetica] font-normal text-[#c2d4c8] text-[11px] tracking-[0] leading-[16.5px] hover:text-white transition-colors disabled:cursor-default"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isSignedOut ? "Anda telah keluar" : "Keluar dari akun"}
        </button>
      </div>
    </aside>
  );
};