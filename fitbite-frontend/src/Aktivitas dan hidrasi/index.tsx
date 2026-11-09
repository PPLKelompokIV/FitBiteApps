// @ts-nocheck
import React from "react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection"; // Sesuaikan path folder sidebar kalian
import { ChevronRight, Bell, Activity, Droplets, Flame } from "lucide-react";

export const ActivityAndHydrationSection = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f6f7f2] text-[#1f2d2a]">
      {/* 1. Sidebar Standar FitBite yang Nyambung ke Semua Halaman */}
      <HealthAppSidebarSection />

      {/* 2. Konten Utama Halaman Aktivitas & Hidrasi */}
      <main className="relative flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#f8faf6]">
        {/* Header Atas */}
        <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between border-b border-[#e1e7df] bg-white px-8">
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-xs">
            <span className="text-[#728078]">Ruang sehat</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#728078]" />
            <strong className="font-semibold text-[#203d32]">Aktivitas & hidrasi</strong>
          </nav>
          <div className="inline-flex items-center gap-4">
            <span className="rounded-full bg-[#f0f3ec] px-3 py-1 font-semibold text-[11px] text-[#728078]">
              Data contoh
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcebb2] font-bold text-xs text-[#203d32]">
              NP
            </div>
          </div>
        </header>

        {/* Isi Konten Aktivitas */}
        <div className="flex w-full flex-col gap-6 p-8">
          <div>
            <h1 className="font-bold text-2xl tracking-tight text-[#203d32]">
              Bergerak cukup. Minum teratur.
            </h1>
            <p className="font-normal text-xs text-[#728078]">
              Senin, 19 Oktober 2026 • Catatan hingga 18.30 WIB
            </p>
          </div>

          {/* Grid Statistik */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e1e7df] bg-white p-5">
              <span className="text-xs text-[#728078]">Durasi bergerak</span>
              <h3 className="text-2xl font-bold text-[#203d32] mt-1">50 menit</h3>
            </div>
            <div className="rounded-2xl border border-[#e1e7df] bg-white p-5">
              <span className="text-xs text-[#728078]">Energi terbakar</span>
              <h3 className="text-2xl font-bold text-[#203d32] mt-1">258 kkal</h3>
            </div>
            <div className="rounded-2xl border border-[#e1e7df] bg-white p-5">
              <span className="text-xs text-[#728078]">Bonus air olahraga</span>
              <h3 className="text-2xl font-bold text-[#167653] mt-1">400 ml</h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityAndHydrationSection;