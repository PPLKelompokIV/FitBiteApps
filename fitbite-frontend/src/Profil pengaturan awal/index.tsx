import { HeaderSection } from "./HeaderSection";
import { HealthProfileSetupSection } from "./HealthProfileSetupSection";

export const ProfilKesehatan = (): JSX.Element => {
  return (
    <div className="flex min-h-[1100px] flex-col items-start relative bg-[#f6f7f2]">
      <HeaderSection />
      <main className="flex w-full flex-1 flex-col items-start">
        <HealthProfileSetupSection />
      </main>
      <footer className="flex w-full flex-[0_0_auto] items-start px-16 pb-7 pt-0">
        <p className="relative mt-[-1.00px] flex-1 [font-family:'Inter-Regular',Helvetica] text-[10px] font-normal leading-[15px] tracking-[0] text-[#728078]">
          FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli
          gizi.
        </p>
      </footer>
    </div>
  );
};
