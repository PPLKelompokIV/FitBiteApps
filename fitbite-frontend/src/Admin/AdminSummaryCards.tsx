import {
  Activity,
  CheckCircle2,
  Utensils,
  Users,
  type LucideIcon,
} from "lucide-react";

const metrics: {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  highlighted?: boolean;
}[] = [
  {
    label: "Makanan dalam katalog",
    value: "126",
    description: "118 aktif • 8 nonaktif",
    icon: Utensils,
  },
  {
    label: "Referensi terverifikasi",
    value: "112",
    description: "14 menunggu tinjauan",
    icon: CheckCircle2,
    highlighted: true,
  },
  {
    label: "Aktivitas & MET",
    value: "18",
    description: "6 kategori aktivitas utama",
    icon: Activity,
  },
  {
    label: "Akun pengguna",
    value: "248",
    description: "240 aktif • 8 nonaktif",
    icon: Users,
  },
];

const fontRegular = "[font-family:'Inter-Regular',Helvetica]";
const fontBold = "[font-family:'Inter-Bold',Helvetica]";

export const AdminSummaryCards = () => (
  <section
    aria-label="Ringkasan pengelolaan"
    className="grid w-full grid-cols-1 items-start gap-[18px] sm:grid-cols-2 xl:grid-cols-4"
  >
    {metrics.map((metric) => {
      const Icon = metric.icon;
      return (
        <article
          key={metric.label}
          className={`flex min-w-0 flex-col items-start gap-[9px] rounded-[18px] border border-[#e1e7df] p-5 ${
            metric.highlighted ? "bg-[#eaf3e9]" : "bg-white"
          }`}
        >
          <div className="flex w-full items-start gap-2">
            <span
              className={`mt-[-1px] flex-1 text-xs leading-[18px] text-[#728078] ${fontRegular}`}
            >
              {metric.label}
            </span>
            <Icon className="h-[18px] w-[18px] shrink-0 text-[#167653]" />
          </div>
          <div
            className={`text-[28px] font-bold leading-[42px] text-[#203d32] ${fontBold}`}
          >
            {metric.value}
          </div>
          <p
            className={`w-full text-[11px] leading-[16.5px] text-[#728078] ${fontRegular}`}
          >
            {metric.description}
          </p>
        </article>
      );
    })}
  </section>
);
