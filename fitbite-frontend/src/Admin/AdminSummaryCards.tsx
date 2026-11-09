import React from "react";
import { useLocation } from "react-router-dom";

const Svg: React.FC<{ size?: number; sw?: number; children: React.ReactNode }> = ({
  size = 18,
  sw = 1.8,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const StatIcon: React.FC<{ name: string }> = ({ name }) => {
  if (name === "fork")
    return (
      <Svg size={18}>
        <path d="M6 3v7a2 2 0 0 0 2 2v9" />
        <path d="M4 3v6M10 3v6M8 3v9" />
        <path d="M17 21V3c-2.5 1-4 3.5-4 7 0 2 1 3 4 3" />
      </Svg>
    );
  if (name === "check")
    return (
      <Svg size={18}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" />
      </Svg>
    );
  if (name === "activity")
    return (
      <Svg size={18}>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </Svg>
    );
  return (
    <Svg size={18}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6" />
      <path d="M18 14.8c2 .7 3.2 2.5 3.5 5.2" />
    </Svg>
  );
};

const metrics = [
  {
    label: "Makanan dalam katalog",
    value: "126",
    sub: "118 aktif • 8 nonaktif",
    icon: "fork",
  },
  {
    label: "Referensi terverifikasi",
    value: "112",
    sub: "14 menunggu tinjauan",
    icon: "check",
  },
  {
    label: "Aktivitas & MET",
    value: "18",
    sub: "6 kategori aktivitas utama",
    icon: "activity",
  },
  {
    label: "Akun pengguna",
    value: "248",
    sub: "240 aktif • 8 nonaktif",
    icon: "users",
  },
];

const highlightByPath: Record<string, string> = {
  "/admin/pengelolaan": "Makanan dalam katalog",
  "/admin/aktivitas": "Aktivitas & MET",
  "/admin/pantau": "Akun pengguna",
};

const defaultHighlight = "Referensi terverifikasi";

export const AdminSummaryCards: React.FC = () => {
  const { pathname } = useLocation();
  const highlightedLabel = highlightByPath[pathname] ?? defaultHighlight;

  return (
    <div
      aria-label="Ringkasan pengelolaan"
      className="grid grid-cols-2 xl:grid-cols-4 gap-4 w-full"
    >
      {metrics.map((s) => {
        const isHighlighted = s.label === highlightedLabel;
        return (
          <div
            key={s.label}
            className={`rounded-2xl border px-5 py-4 transition-all duration-300 hover:shadow-sm ${
              isHighlighted
                ? "bg-[#eaf3e9] border-[#cfe2d3]"
                : "bg-white border-[#e1e7df] hover:border-[#cfe2d3]"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-[#6b8c7a]">
              <span>{s.label}</span>
              <span className="text-[#124b39]">
                <StatIcon name={s.icon} />
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-tight mt-3 text-[#1d2926]">
              {s.value}
            </p>
            <p className="text-xs text-[#6b8c7a] mt-1.5">{s.sub}</p>
          </div>
        );
      })}
    </div>
  );
};
