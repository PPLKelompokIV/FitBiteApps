import { useState } from "react";
import areaTrenBerat from "./area-tren-berat.svg";
import batangEnergi from "./batang-energi.svg";
import garisTrenBerat from "./garis-tren-berat.svg";
import vector from "./vector.svg";
import vector11 from "./vector-11.svg";
import vector12 from "./vector-12.svg";
import vector13 from "./vector-13.svg";
import vector14 from "./vector-14.svg";
import vector15 from "./vector-15.svg";
import vector16 from "./vector-16.svg";
import vector17 from "./vector-17.svg";

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: string;
  highlighted?: boolean;
};

const metrics: Metric[] = [
  {
    label: "Berat terakhir",
    value: "64,0 kg",
    detail: "−0,8 kg dari awal 64,8 kg",
    icon: vector13,
    highlighted: true,
  },
  {
    label: "Rerata asupan",
    value: "1.726 kkal",
    detail: "Per hari • 14 hari tercatat",
    icon: vector14,
  },
  {
    label: "Rerata terbakar",
    value: "148 kkal",
    detail: "Per hari • aktivitas tercatat",
    icon: vector15,
  },
  {
    label: "Rerata hidrasi",
    value: "92%",
    detail: "Dari target harian masing-masing",
    icon: vector16,
  },
];

const hydrationData = [
  ["85", "h-[99.17px]"],
  ["100", "h-[116.67px]"],
  ["92", "h-[107.33px]"],
  ["80", "h-[93.33px]"],
  ["101", "h-[117.83px]"],
  ["95", "h-[110.83px]"],
  ["88", "h-[102.67px]"],
  ["100", "h-[116.67px]"],
  ["98", "h-[114.33px]"],
  ["105", "h-[122.5px]"],
  ["90", "h-[105px]"],
  ["94", "h-[109.67px]"],
  ["100", "h-[116.67px]"],
  ["66", "h-[77px]"],
];

const dates = ["6 Okt", "10 Okt", "14 Okt", "19 Okt*"];

export const ProgressDashboardSection = (): JSX.Element => {
  const [period, setPeriod] = useState("14 hari");

  return (
    <main className="flex min-h-screen flex-col items-start relative flex-1 grow bg-[#f8faf6]">
      <header className="flex h-[78px] items-center justify-between px-9 relative self-stretch w-full bg-white border-b border-[#e1e7df]">
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2">
          <span className="[font-family:'Inter-Regular',Helvetica] text-[#728078] text-xs leading-[18px]">
            Ruang sehat
          </span>
          <span className="relative w-[13px] h-[13px]">
            <img
              className="absolute w-[69.04%] h-[81.54%] top-[18.46%] left-[30.96%]"
              alt=""
              src={vector11}
            />
          </span>
          <strong className="[font-family:'Inter-SemiBold',Helvetica] text-[#203d32] text-xs leading-[18px]">
            Progres
          </strong>
        </nav>
        <div className="inline-flex items-center gap-[18px]">
          <span className="bg-[#f0f3ec] px-2.5 py-1 rounded-[100px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#728078] text-[11px] leading-[16.5px]">
            Data contoh
          </span>
          <span
            className="inline-flex items-center gap-[5px]"
            aria-label="Notifikasi aktif"
          >
            <img className="w-[19px] h-[19px]" alt="" src={vector12} />
            <span className="w-1.5 h-1.5 bg-[#167653] rounded-full" />
          </span>
          <div
            className="flex w-[33px] h-[33px] items-center justify-center bg-[#dcebb2] rounded-[20px]"
            aria-label="Profil NP"
          >
            <span className="[font-family:'Inter-Bold',Helvetica] font-bold text-[#203d32] text-[11px]">
              NP
            </span>
          </div>
        </div>
      </header>
      <section className="flex flex-col items-start gap-6 pt-[30px] pb-7 px-9 relative self-stretch w-full">
        <div className="flex items-center gap-6 relative self-stretch w-full">
          <div className="flex flex-col items-start gap-[5px] relative flex-1 grow">
            <h1 className="[font-family:'Manrope-Regular',Helvetica] font-normal text-[#203d32] text-3xl tracking-[-0.24px] leading-[37.5px]">
              Perubahan kecil, terlihat lebih jelas.
            </h1>
            <p className="[font-family:'Inter-Regular',Helvetica] text-[#728078] text-[13px] leading-[19.5px]">
              6–19 Oktober 2026 • Tren dari data yang kamu catat, bukan
              penilaian kesehatan.
            </p>
          </div>
          <div className="flex items-start gap-[5px] p-[5px] w-[243px] bg-[#f0f3ec] rounded-[10px]">
            {["7 hari", "14 hari", "30 hari"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                aria-pressed={period === item}
                className={`flex items-center justify-center px-3 py-[9px] flex-1 rounded-[7px] text-xs leading-[18px] ${
                  period === item
                    ? "[font-family:'Inter-Bold',Helvetica] font-bold text-[#167653] bg-white"
                    : "[font-family:'Inter-Medium',Helvetica] font-medium text-[#728078]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-[18px] self-stretch w-full">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`flex flex-col gap-[9px] p-5 rounded-[18px] overflow-hidden border border-[#e1e7df] ${
                metric.highlighted ? "bg-[#eaf3e9]" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-2 self-stretch">
                <span className="flex-1 [font-family:'Inter-Regular',Helvetica] text-[#728078] text-xs leading-[18px]">
                  {metric.label}
                </span>
                <img className="w-[18px] h-[18px]" alt="" src={metric.icon} />
              </div>
              <strong className="[font-family:'Inter-Bold',Helvetica] font-bold text-[#203d32] text-[28px] leading-[42px]">
                {metric.value}
              </strong>
              <p className="[font-family:'Inter-Regular',Helvetica] text-[#728078] text-[11px] leading-[16.5px]">
                {metric.detail}
              </p>
            </article>
          ))}
        </div>
        <div className="grid grid-cols-[minmax(0,788px)_340px] gap-6 self-stretch w-full">
          <article className="flex flex-col gap-[18px] p-6 bg-white rounded-[18px] border border-[#e1e7df]">
            <div>
              <h2 className="[font-family:'Inter-Bold',Helvetica] font-bold text-[#203d32] text-lg leading-[27px]">
                Perjalanan berat badan
              </h2>
              <p className="[font-family:'Inter-Regular',Helvetica] text-[#728078] text-xs leading-[18px]">
                Naik-turun harian bisa terjadi. Lihat arahnya, bukan satu angka.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="[font-family:'Inter-Regular',Helvetica] text-[#728078] text-[10px] leading-[15px]">
                Berat badan (kg)
              </span>
              <div className="relative w-full h-[228px]">
                {["65,0", "64,5", "64,0", "63,5"].map((value, index) => (
                  <div
                    key={value}
                    className="absolute left-0 flex w-full items-center gap-3.5"
                    style={{ top: `${12 + index * 60}px` }}
                  >
                    <span className="w-[30px] [font-family:'Inter-Regular',Helvetica] text-[#728078] text-[10px] leading-[15px]">
                      {value}
                    </span>
                    <span className="relative flex-1 h-px bg-[#e1e7df]" />
                  </div>
                ))}
                <img
                  className="absolute top-11 left-11 w-[calc(100%-50px)] h-[157px]"
                  alt="Area tren berat"
                  src={areaTrenBerat}
                />
                <img
                  className="absolute top-[43px] left-11 w-[calc(100%-50px)] h-[99px]"
                  alt="Garis tren berat"
                  src={garisTrenBerat}
                />
                <span className="absolute top-[135px] right-0 w-2.5 h-2.5 bg-[#167653] rounded-full border-2 border-white" />
                <span className="absolute top-[99px] right-8 px-2.5 py-[5px] bg-[#124b39] rounded-lg text-white text-[11px] leading-[16.5px]">
                  64,0 kg
                </span>
                <div className="absolute top-[211px] left-11 right-0 flex justify-between text-[#728078] text-[10px] leading-[15px]">
                  {dates.map((date) => (
                    <span key={date}></span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <p className="flex-1 [font-family:'Inter-Regular',Helvetica] text-[#728078] text-[10px] leading-[15px]">
                14 catatan • berat diukur saat Body Check pagi
              </p>
              <span className="bg-[#eaf3e9] px-2.5 py-1 rounded-[100px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#167653] text-[11px]">
                Tren menurun bertahap
              </span>
            </div>
          </article>
          <article className="flex flex-col gap-[18px] p-6 bg-white rounded-[18px] border border-[#e1e7df]">
            <h2 className="[font-family:'Inter-Bold',Helvetica] font-bold text-[#203d32] text-lg leading-[27px]">
              Menuju tujuanmu
            </h2>
            <img className="w-[29px] h-[29px]" alt="" src={vector17} />
            <strong className="[font-family:'Inter-Bold',Helvetica] font-bold text-[#203d32] text-3xl leading-[45px]">
              60,0 kg
            </strong>
            <span className="[font-family:'Inter-Regular',Helvetica] text-[#728078] text-xs leading-[18px]">
              Target yang kamu pilih
            </span>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs leading-[18px]">
                <strong className="font-medium text-[#203d32]">
                  Perjalanan dari 64,8 kg
                </strong>
                <span className="text-[#728078]">17%</span>
              </div>
              <div className="h-[7px] bg-[#f0f3ec] rounded-[5px] overflow-hidden">
                <div className="h-full w-[17%] bg-[#167653] rounded-[5px]" />
              </div>
            </div>
            <div className="h-px bg-[#e1e7df]" />
            <div className="flex gap-5">
              <div className="flex-1">
                <span className="block text-[#728078] text-[10px]">
                  Sudah berubah
                </span>
                <strong className="text-[#203d32] text-xl">0,8 kg</strong>
              </div>
              <div className="flex-1">
                <span className="block text-[#728078] text-[10px]">
                  Menuju target
                </span>
                <strong className="text-[#203d32] text-xl">4,0 kg</strong>
              </div>
            </div>
            <p className="text-[#728078] text-[11px] leading-[16.5px]">
              Tanpa tenggat kaku. Evaluasi tujuan bersama profesional bila
              perlu.
            </p>
          </article>
        </div>
        <div className="grid grid-cols-2 gap-6 self-stretch w-full">
          <article className="flex flex-col gap-[18px] p-6 bg-white rounded-[18px] border border-[#e1e7df]">
            <div>
              <h2 className="font-bold text-[#203d32] text-lg leading-[27px]">
                Asupan &amp; energi terbakar
              </h2>
              <p className="text-[#728078] text-xs leading-[18px]">
                Perbandingan harian selama 14 hari
              </p>
            </div>
            <div className="flex gap-5 text-[10px]">
              <span className="text-[#167653]">● Kalori masuk</span>
              <span className="text-[#a86c24]">● Kalori terbakar</span>
              <span className="text-[#728078]">Satuan: kkal</span>
            </div>
            <div className="flex items-end gap-[13px]">
              <div className="flex h-[165px] w-[30px] flex-col justify-between text-[#728078] text-[9px]">
                <span>2.200</span>
                <span>1.100</span>
                <span>0</span>
              </div>
              <img
                className="h-[165px] flex-1"
                alt="Batang energi"
                src={batangEnergi}
              />
            </div>
            <div className="flex justify-between pl-[43px] text-[#728078] text-[9px]">
              {dates.map((date) => (
                <span key={date}>{date}</span>
              ))}
            </div>
            <p className="text-[#728078] text-[10px]">
              19 Okt*: 1.350 kkal masuk • 258 kkal terbakar
            </p>
          </article>
          <article className="flex flex-col gap-[18px] p-6 bg-white rounded-[18px] border border-[#e1e7df]">
            <div>
              <h2 className="font-bold text-[#203d32] text-lg leading-[27px]">
                Konsistensi minum air
              </h2>
              <p className="text-[#728078] text-xs leading-[18px]">
                Target berubah mengikuti berat dan olahraga intens
              </p>
            </div>
            <p className="text-[#4b8dab] text-[10px]">
              ● Persentase target air harian (dasar + bonus)
            </p>
            <div className="flex items-end gap-[13px]">
              <div className="flex h-[165px] w-[30px] flex-col justify-between text-[#728078] text-[9px]">
                <span>120%</span>
                <span>60%</span>
                <span>0%</span>
              </div>
              <div className="flex h-[165px] flex-1 items-end gap-[13px] overflow-hidden">
                {hydrationData.map(([value, height], index) => (
                  <div
                    key={`${value}-${index}`}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-[5px]"
                  >
                    <span className="text-[#728078] text-[8px]">{value}</span>
                    <div
                      className={`w-full ${height} rounded-[4px_4px_0_0] ${index === hydrationData.length - 1 ? "bg-[#b4ced6]" : "bg-[#4b8dab]"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between pl-[43px] text-[#728078] text-[9px]">
              {dates.map((date) => (
                <span key={date}>{date}</span>
              ))}
            </div>
            <p className="text-[#728078] text-[10px]">
              19 Okt*: 1.750 / 2.640 ml • 66% tercapai
            </p>
          </article>
        </div>
        <aside className="flex items-start gap-[11px] p-3.5 self-stretch bg-[#eaf3e9] rounded-[10px]">
          <img className="w-[18px] h-[18px]" alt="" src={vector} />
          <p className="flex-1 text-[#124b39] text-xs leading-[18px]">
            *Data 19 Oktober masih berjalan hingga 18.30 WIB dan ikut dalam
            rerata. Grafik adalah data contoh; catatan yang kosong atau belum
            lengkap dapat memengaruhi tren. Fokus pada kebiasaan yang bisa kamu
            pertahankan.
          </p>
        </aside>
      </section>
      <footer className="flex items-start justify-between pt-2 pb-6 px-9 self-stretch">
        <p className="flex-1 text-[#728078] text-[10px] leading-[15px]">
          FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli
          gizi.
        </p>
        <span className="text-[#728078] text-[10px] leading-[15px]">
          FitBite © 2026
        </span>
      </footer>
    </main>
  );
};
