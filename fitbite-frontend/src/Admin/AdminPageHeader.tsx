import { ChevronRight } from "lucide-react";

type AdminPageHeaderProps = {
  currentPage: string;
};

const fontRegular = "[font-family:'Inter-Regular',Helvetica]";
const fontSemibold = "[font-family:'Inter-SemiBold',Helvetica]";

export const AdminPageHeader = ({ currentPage }: AdminPageHeaderProps) => (
  <header className="sticky top-0 z-10 flex h-[88px] w-full shrink-0 self-stretch items-center justify-between border-b border-[#e1e7df] bg-white px-9 py-0">
    <nav
      aria-label="Breadcrumb"
      className="inline-flex items-center gap-2"
    >
      <span
        className={`w-fit whitespace-nowrap text-xs font-normal leading-[18px] text-[#728078] ${fontRegular}`}
      >
        Pengelolaan
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-[#728078]" />
      <span
        className={`w-fit whitespace-nowrap text-xs font-semibold leading-[18px] text-[#203d32] ${fontSemibold}`}
      >
        {currentPage}
      </span>
    </nav>
    <div className="inline-flex items-start gap-[18px]">
      <span
        className={`inline-flex items-start rounded-[100px] bg-[#f0f3ec] px-2.5 py-1 text-[11px] font-semibold leading-[16.5px] text-[#728078] ${fontSemibold}`}
      >
        Data contoh
      </span>
      <span
        className={`inline-flex items-start rounded-[100px] bg-[#eaf3e9] px-2.5 py-1 text-[11px] font-semibold leading-[16.5px] text-[#167653] ${fontSemibold}`}
      >
        Akses terbatas
      </span>
    </div>
  </header>
);
