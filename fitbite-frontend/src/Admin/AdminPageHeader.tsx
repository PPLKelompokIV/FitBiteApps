import React from "react";

type AdminPageHeaderProps = {
  currentPage: string;
};

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ currentPage }) => (
  <header className="flex items-center justify-between px-8 py-4 border-b border-[#e1e7df] bg-white shrink-0 w-full">
    <nav className="flex items-center gap-2 text-xs text-[#6b8c7a]" aria-label="Breadcrumb">
      <span>Pengelolaan</span>
      <span aria-hidden="true">›</span>
      <span className="font-semibold text-[#1d2926] transition-all duration-300">{currentPage}</span>
    </nav>
    <div className="flex items-center gap-2">
      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#eaf0e8] text-[#4a7060]">Data contoh</span>
      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-[#124b39]">
        Akses terbatas
      </span>
    </div>
  </header>
);
