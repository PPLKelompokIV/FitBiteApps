import React from 'react';

const HeaderSection = () => (
  <header className="flex w-full items-center px-6 py-4">
    <h1 className="text-lg font-semibold text-[#1f2a1f]">Profil Kesehatan</h1>
  </header>
);

const HealthProfileSetupSection = () => (
  <section className="flex w-full flex-col items-start px-6 py-4">
    <h2 className="text-base font-medium text-[#1f2a1f]">
      Pengaturan profil kesehatan
    </h2>
  </section>
);

export const ProfilKesehatan = () => {
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