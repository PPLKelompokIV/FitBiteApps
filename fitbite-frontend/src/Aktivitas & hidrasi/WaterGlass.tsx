import React from "react";

interface WaterGlassProps {
  progress: number; // 0 - 100+
  className?: string;
}

export const WaterGlass: React.FC<WaterGlassProps> = ({
  progress,
  className = "",
}) => {
  // Clamp progress between 0 and 100 for visual fill
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const fillFraction = clampedProgress / 100;
  
  // Total fillable height inside the glass cavity (from y=143 up to y=16)
  const maxFillHeight = 127;
  const liquidHeight = fillFraction * maxFillHeight;
  const surfaceY = 143 - liquidHeight;
  
  // Radius of the water surface ellipse based on taper
  const surfaceRx = 23 + fillFraction * 9.5; // rx from 23 (bottom) to 32.5 (top)

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 84 160"
        className="h-40 w-[84px] drop-shadow-sm select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradien Air Biru Segar */}
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Gradien Kilau Kaca Sisi Kiri */}
          <linearGradient id="glassSheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
          </linearGradient>

          {/* Gradien Dasar Kaca Tebal */}
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.85" />
          </linearGradient>

          {/* Clip path bentuk rongga dalam gelas (tapered tumbler) */}
          <clipPath id="glassInnerClip">
            <path d="M 10 12 L 18 141 Q 19 146 25 146 L 59 146 Q 65 146 66 141 L 74 12 Z" />
          </clipPath>
        </defs>

        {/* 1. Latar Belakang Transparan Gelas (Rongga Dalam Kosong) */}
        <path
          d="M 10 12 L 18 141 Q 19 146 25 146 L 59 146 Q 65 146 66 141 L 74 12 Z"
          fill="#f0f9ff"
          fillOpacity="0.55"
        />

        {/* 2. Isi Air (Liquid Fill dengan Animasi Halus) */}
        <g clipPath="url(#glassInnerClip)">
          {/* Air Utama */}
          <rect
            x="0"
            y={surfaceY}
            width="84"
            height={liquidHeight + 15}
            fill="url(#waterGradient)"
            className="transition-all duration-500 ease-out"
          />

          {/* Permukaan Air / Meniscus 3D */}
          {clampedProgress > 2 && (
            <ellipse
              cx="42"
              cy={surfaceY}
              rx={surfaceRx}
              ry="3.5"
              fill="#bae6fd"
              fillOpacity="0.95"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Gelembung Udara Halus di Dalam Air */}
          {clampedProgress > 25 && (
            <g className="transition-opacity duration-500" opacity="0.65">
              <circle cx="32" cy={Math.min(136, surfaceY + liquidHeight * 0.45)} r="1.8" fill="#ffffff" />
              <circle cx="52" cy={Math.min(138, surfaceY + liquidHeight * 0.7)} r="2.2" fill="#ffffff" />
              <circle cx="40" cy={Math.min(134, surfaceY + liquidHeight * 0.25)} r="1.5" fill="#ffffff" />
              <circle cx="48" cy={Math.min(140, surfaceY + liquidHeight * 0.85)} r="1.2" fill="#ffffff" />
            </g>
          )}
        </g>

        {/* 3. Garis Takaran Gelas (Graduation Ticks) */}
        <g opacity="0.55" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round">
          {/* Takaran 75% */}
          <line x1="64" y1="48" x2="70" y2="48" />
          {/* Takaran 50% */}
          <line x1="61" y1="80" x2="68" y2="80" />
          {/* Takaran 25% */}
          <line x1="59" y1="112" x2="65" y2="112" />
        </g>

        {/* 4. Dasar Kaca Tebal (Solid Heavy Glass Base) */}
        <path
          d="M 17 143 L 17 147 Q 18 154 25 154 L 59 154 Q 66 154 67 147 L 67 143 Z"
          fill="url(#baseGradient)"
          stroke="#93c5fd"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* 5. Garis Dinding Luar Gelas (Outer Glass Stroke) */}
        <path
          d="M 8 10 L 17 145 Q 18 154 25 154 L 59 154 Q 66 154 67 145 L 76 10"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 6. Bibir / Mulut Gelas Atas (Top Rim Ellipse) */}
        <ellipse
          cx="42"
          cy="10"
          rx="34"
          ry="5.5"
          fill="#f8fafc"
          fillOpacity="0.4"
          stroke="#93c5fd"
          strokeWidth="2.2"
        />

        {/* 7. Kilau Refleksi Kaca (Glass Sheen Highlight) */}
        {/* Kilau lengkung kiri */}
        <path
          d="M 14 18 L 21 140"
          stroke="url(#glassSheen)"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.65"
        />
        {/* Kilau tipis kanan */}
        <path
          d="M 70 20 L 64 138"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Kilau dasar gelas */}
        <line
          x1="26"
          y1="150"
          x2="58"
          y2="150"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* Persentase / Ikon di Tengah jika dibutuhkan */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
        {clampedProgress === 0 && (
          <span className="text-[10px] font-semibold text-[#64748b]/70">Kosong</span>
        )}
      </div>
    </div>
  );
};

export default WaterGlass;
