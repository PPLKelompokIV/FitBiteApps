import type { ReactElement } from "react";
import vector from "./vector.svg";

export const HeaderSection = (): ReactElement => {
  return (
    <header className="flex h-[86px] items-center justify-between px-[52px] py-0 relative self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#e1e7df]">
      <a
        href="/"
        aria-label="FitBite"
        className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
      >
        <span className="flex w-9 h-9 items-center justify-center relative bg-[#167653] rounded-xl overflow-hidden">
          <span className="relative w-[22px] h-[22px]">
            <img
              className="absolute w-[95.53%] h-[98.78%] top-0 left-[4.47%]"
              alt=""
              aria-hidden="true"
              src={vector}
            />
          </span>
        </span>
        <span className="relative w-fit [font-family:'Manrope-ExtraBold',Helvetica] font-extrabold text-[#124b39] text-[25px] tracking-[-0.25px] leading-[normal]">
          FitBite
        </span>
      </a>
      <div
        className="items-center gap-[18px] inline-flex relative flex-[0_0_auto]"
        aria-label="Informasi pengguna"
      >
        <span className="inline-flex items-start px-2.5 py-1 relative flex-[0_0_auto] bg-[#f0f3ec] rounded-[100px] overflow-hidden">
          <span className="w-fit mt-[-1.00px] text-[#728078] text-[11px] leading-[16.5px] whitespace-nowrap relative [font-family:'Inter-SemiBold',Helvetica] font-semibold tracking-[0]">
            Data contoh • 5 Okt 2026
          </span>
        </span>
        <span className="relative w-fit [font-family:'Inter-Regular',Helvetica] font-normal text-[#728078] text-xs tracking-[0] leading-[18px] whitespace-nowrap">
          Nadia Putri&nbsp;&nbsp;·&nbsp;&nbsp;Keluar
        </span>
      </div>
    </header>
  );
};
//