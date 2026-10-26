import { useState } from "react";
import image from "./image.svg";
import vector from "./vector.svg";
import vector2 from "./vector-2.svg";
import vector3 from "./vector-3.svg";
import vector4 from "./vector-4.svg";
import vector5 from "./vector-5.svg";
import vector6 from "./vector-6.svg";
import vector7 from "./vector-7.svg";
import vector8 from "./vector-8.svg";
import vector9 from "./vector-9.svg";

type NavigationItem = {
  label: string;
  icon: string;
  iconClassName: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Hari ini",
    icon: image,
    iconClassName: "absolute w-[91.97%] h-[91.97%] top-[8.03%] left-[8.03%]",
  },
  {
    label: "Body Check pagi",
    icon: vector2,
    iconClassName: "absolute w-[96.14%] h-[96.14%] top-[3.86%] left-[3.86%]",
  },
  {
    label: "Jurnal makanan",
    icon: vector3,
    iconClassName: "absolute w-[91.97%] h-[96.14%] top-[3.86%] left-[8.03%]",
  },
  {
    label: "Aktivitas & hidrasi",
    icon: vector4,
    iconClassName: "absolute w-[96.14%] h-[96.14%] top-[3.86%] left-[3.86%]",
  },
  {
    label: "Jurnal & evaluasi",
    icon: vector5,
    iconClassName: "absolute w-[91.97%] h-[96.14%] top-[3.86%] left-[8.03%]",
  },
  {
    label: "Progres",
    icon: vector6,
    iconClassName: "absolute w-[96.14%] h-[91.97%] top-[8.03%] left-[3.86%]",
  },
  {
    label: "Profil & pengingat",
    icon: vector7,
    iconClassName: "absolute w-[87.80%] h-[87.80%] top-[12.20%] left-[12.20%]",
  },
];

export const PrimaryNavigationSection = (): JSX.Element => {
  const [activeItem, setActiveItem] = useState("Hari ini");

  return (
    <aside className="flex flex-col w-[216px] items-start gap-[33px] px-[18px] py-[30px] relative self-stretch bg-white border-r [border-right-style:solid] border-[#e1e7df]">
      <header className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
        <div
          className="flex w-9 h-9 items-center justify-center relative bg-[#167653] rounded-xl overflow-hidden"
          aria-hidden="true"
        >
          <div className="relative w-[22px] h-[22px]">
            <img
              className="absolute w-[95.53%] h-[98.78%] top-0 left-[4.47%]"
              alt=""
              src={vector}
            />
          </div>
        </div>
        <div className="relative w-fit [font-family:'Manrope-ExtraBold',Helvetica] font-extrabold text-[#124b39] text-[25px] tracking-[-0.25px] leading-[normal]">
          FitBite
        </div>
      </header>
      <nav
        className="flex flex-col items-start gap-[7px] relative self-stretch w-full flex-[0_0_auto]"
        aria-label="Navigasi utama"
      >
        <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[#728078] text-[10px] tracking-[0] leading-[15px]">
          RUANG SEHATMU
        </div>
        {navigationItems.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActiveItem(item.label)}
              className={`flex items-center gap-2.5 px-[11px] py-3 relative self-stretch w-full flex-[0_0_auto] rounded-[10px] overflow-hidden text-left ${
                isActive ? "bg-[#eaf3e9]" : "bg-transparent"
              }`}
            >
              <span className="relative w-[19px] h-[19px]" aria-hidden="true">
                <img className={item.iconClassName} alt="" src={item.icon} />
              </span>
              <span
                className={`relative flex-1 mt-[-0.50px] ${
                  isActive
                    ? "[font-family:'Inter-Bold',Helvetica] font-bold text-[#167653]"
                    : "[font-family:'Inter-Medium',Helvetica] font-medium text-[#728078]"
                } text-xs tracking-[0] leading-[18px]`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <section
        className="flex flex-col items-start gap-2.5 p-4 relative self-stretch w-full flex-[0_0_auto] bg-[#eaf3e9] rounded-2xl overflow-hidden"
        aria-labelledby="consistency-message"
      >
        <div className="relative w-7 h-7" aria-hidden="true">
          <img
            className="absolute w-[86.37%] h-[90.54%] top-[9.46%] left-[13.63%]"
            alt=""
            src={vector8}
          />
        </div>
        <h2
          id="consistency-message"
          className="self-stretch [font-family:'Inter-Bold',Helvetica] font-bold text-[#124b39] text-[13px] leading-[19.5px] relative tracking-[0]"
        >
          Konsisten, bukan sempurna.
        </h2>
        <p className="self-stretch [font-family:'Inter-Regular',Helvetica] font-normal text-[#728078] text-[11px] leading-[16.5px] relative tracking-[0]">
          Satu pilihan baik hari ini adalah langkah maju untuk dirimu.
        </p>
      </section>
      <footer className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
        <div
          className="relative self-stretch w-full h-px bg-[#e1e7df]"
          aria-hidden="true"
        />
        <div className="flex items-center gap-3 relative self-stretch w-full flex-[0_0_auto]">
          <div
            className="flex w-[38px] h-[38px] items-center justify-center relative bg-[#eaf3e9] rounded-xl overflow-hidden"
            aria-hidden="true"
          >
            <div className="relative w-[19px] h-[19px]">
              <img
                className="absolute w-[96.14%] h-[96.14%] top-[3.86%] left-[3.86%]"
                alt=""
                src={vector9}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-[3px] relative flex-1 grow">
            <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#203d32] text-[13px] tracking-[0] leading-[19.5px]">
              Nadia Putri
            </div>
            <div className="relative self-stretch [font-family:'Inter-Regular',Helvetica] font-normal text-[#728078] text-[11px] tracking-[0] leading-[16.5px]">
              Anggota FitBite
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => undefined}
          className="self-stretch text-left [font-family:'Inter-Regular',Helvetica] font-normal text-[#728078] text-[11px] leading-[16.5px] relative tracking-[0]"
        >
          Keluar dari akun&nbsp;&nbsp;↗
        </button>
      </footer>
    </aside>
  );
};
