import { useState } from "react";
import fotoHidangan from "./foto-hidangan.png";
import image from "./image.png";
import kaloriMasuk from "./kalori-masuk.svg";
import lintasanKalori from "./lintasan-kalori.svg";
import vector10 from "./vector-10.svg";
import vector11 from "./vector-11.svg";
import vector12 from "./vector-12.svg";
import vector13 from "./vector-13.svg";
import vector14 from "./vector-14.svg";
import vector15 from "./vector-15.svg";
import vector16 from "./vector-16.svg";
import vector17 from "./vector-17.svg";
import vector18 from "./vector-18.svg";
import vector19 from "./vector-19.svg";
import vector20 from "./vector-20.svg";
import vector21 from "./vector-21.svg";
import vector22 from "./vector-22.svg";
import vector23 from "./vector-23.svg";
import vector24 from "./vector-24.svg";
import vector25 from "./vector-25.svg";
import vector26 from "./vector-26.svg";

type Meal = {
  name: string;
  detail: string;
  calories: string;
  icon: string;
  iconClass?: string;
};

type Activity = {
  name: string;
  detail: string;
  calories: string;
  icon: string;
  iconClass?: string;
};

const meals: Meal[] = [
  {
    name: "Sarapan",
    detail: "07.30 • Oat, pisang, yoghurt",
    calories: "350 kkal",
    icon: vector20,
    iconClass: "w-[96.14%] h-[98.00%] top-[2.00%] left-[3.86%]",
  },
  {
    name: "Makan siang",
    detail: "12.30 • Nasi merah, ayam, tempe, sayur",
    calories: "600 kkal",
    icon: vector21,
  },
  {
    name: "Camilan",
    detail: "15.00 • Pepaya & yoghurt",
    calories: "150 kkal",
    icon: vector22,
  },
  {
    name: "Makan malam",
    detail: "18.00 • Sup sayur & tahu",
    calories: "250 kkal",
    icon: vector23,
    iconClass: "w-[91.98%] h-[91.91%] top-[8.09%] left-[8.02%]",
  },
];

const activities: Activity[] = [
  {
    name: "Bersepeda intens",
    detail: "16.00 • 30 menit · 6,0 MET",
    calories: "202 kkal",
    icon: vector24,
    iconClass: "w-[96.14%] h-[87.80%] top-[12.20%] left-[3.86%]",
  },
  {
    name: "Yoga",
    detail: "17.00 • 20 menit · 2,5 MET",
    calories: "56 kkal",
    icon: vector25,
    iconClass: "w-[79.48%] h-[87.80%] top-[12.20%] left-[20.52%]",
  },
];

const nutrients = [
  { name: "Protein", value: "90 / 100 g", width: "90%", color: "bg-[#167653]" },
  {
    name: "Karbohidrat",
    value: "150 / 190 g",
    width: "79%",
    color: "bg-[#8eab58]",
  },
  { name: "Lemak", value: "43 / 60 g", width: "72%", color: "bg-[#cbab6d]" },
];

const iconClass =
  "relative flex h-[19px] w-[19px] items-center justify-center overflow-hidden";

const ActionButton = ({
  children,
  primary = false,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-solid px-[18px] py-[11px] ${
      primary
        ? "border-transparent bg-[#167653] text-white"
        : "border-[#e1e7df] bg-white text-[#167653]"
    }`}
  >
    {children}
  </button>
);

const ActivityRow = ({
  item,
  divider = false,
}: {
  item: Activity;
  divider?: boolean;
}) => (
  <>
    {divider && (
      <div className="relative h-px w-full self-stretch bg-[#e1e7df]" />
    )}
    <div className="flex w-full items-center gap-3 self-stretch">
      <div className="flex h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-xl bg-[#eaf3e9]">
        <div className={iconClass}>
          <img
            className={`absolute ${
              item.iconClass ?? "w-[96.14%] h-[96.14%] top-[3.86%] left-[3.86%]"
            }`}
            alt=""
            src={item.icon}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-start gap-[3px]">
        <div className="[font-family:'Inter-SemiBold',Helvetica] text-[13px] font-semibold leading-[19.5px] text-[#203d32]">
          {item.name}
        </div>
        <p className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
          {item.detail}
        </p>
      </div>
      <div className="[font-family:'Inter-Bold',Helvetica] whitespace-nowrap text-sm font-bold leading-[21px] text-[#203d32]">
        {item.calories}
      </div>
    </div>
  </>
);

export const WellnessDashboardSection = (): JSX.Element => {
  const [water, setWater] = useState(1750);
  const _remaining = Math.max(0, 2640 - water);

  return (
    <main className="relative flex min-w-0 flex-1 grow flex-col items-start bg-[#f8faf6]">
      <header className="flex h-[78px] w-full items-center justify-between border-b border-[#e1e7df] bg-white px-9">
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2">
          <span className="[font-family:'Inter-Regular',Helvetica] text-xs leading-[18px] text-[#728078]">
            Ruang sehat
          </span>
          <span className="relative h-[13px] w-[13px]">
            <img
              className="absolute left-[30.96%] top-[18.46%] h-[81.54%] w-[69.04%]"
              alt=""
              src={vector10}
            />
          </span>
          <strong className="[font-family:'Inter-SemiBold',Helvetica] text-xs font-semibold leading-[18px] text-[#203d32]">
            Hari ini
          </strong>
        </nav>
        <div className="inline-flex items-center gap-[18px]">
          <span className="rounded-[100px] bg-[#f0f3ec] px-2.5 py-1 [font-family:'Inter-SemiBold',Helvetica] text-[11px] font-semibold leading-[16.5px] text-[#728078]">
            Data contoh
          </span>
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative inline-flex items-start gap-[5px]"
          >
            <span className="relative h-[19px] w-[19px]">
              <img
                className="absolute left-[8.03%] top-[3.86%] h-[96.14%] w-[91.97%]"
                alt=""
                src={vector11}
              />
            </span>
            <span className="h-1.5 w-1.5 rounded-[3px] bg-[#167653]" />
          </button>
          <div
            aria-label="Profil Nadia Putri"
            className="flex h-[33px] w-[33px] items-center justify-center rounded-[20px] bg-[#dcebb2]"
          >
            <span className="[font-family:'Inter-Bold',Helvetica] text-[11px] font-bold leading-[16.5px] text-[#203d32]">
              NP
            </span>
          </div>
        </div>
      </header>
      <div className="flex w-full flex-col items-start gap-6 px-9 pb-7 pt-[30px]">
        <section className="flex w-full items-center justify-between gap-6">
          <div className="flex flex-1 flex-col items-start gap-[5px]">
            <h1 className="[font-family:'Manrope-Regular',Helvetica] text-3xl font-normal leading-[37.5px] tracking-[-0.24px] text-[#203d32]">
              Hari baik dimulai dari pilihan kecil.
            </h1>
            <p className="[font-family:'Inter-Regular',Helvetica] text-[13px] leading-[19.5px] text-[#728078]">
              Halo, Nadia. Ini perjalanan sehatmu pada Senin, 19 Oktober 2026 •
              18.30 WIB.
            </p>
          </div>
          <div className="inline-flex items-start gap-2.5">
            <ActionButton>
              <span className="relative h-[17px] w-[17px]">
                <img
                  className="absolute left-[7.5%] top-[7.5%] h-[92.5%] w-[92.5%]"
                  alt=""
                  src={vector12}
                />
              </span>
              Foto AI
            </ActionButton>
            <ActionButton primary>
              <span className="relative h-[17px] w-[17px]">
                <img
                  className="absolute left-[15.83%] top-[15.83%] h-[84.17%] w-[84.17%]"
                  alt=""
                  src={vector13}
                />
              </span>
              Catat makanan
            </ActionButton>
          </div>
        </section>
        <section className="flex w-full items-center gap-6 overflow-hidden rounded-[18px] bg-[#eaf3e9] px-[22px] py-[17px]">
          <div className="inline-flex items-center gap-3">
            <span className="relative h-[27px] w-[27px]">
              <img
                className="absolute left-[5.18%] top-[5.18%] h-[94.82%] w-[94.82%]"
                alt=""
                src={vector14}
              />
            </span>
            <span className="flex flex-col gap-0.5">
              <strong className="[font-family:'Inter-Bold',Helvetica] text-[13px] font-bold leading-[19.5px] text-[#203d32]">
                Body Check selesai
              </strong>
              <small className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
                Tersimpan pukul 06.48
              </small>
            </span>
          </div>
          <div className="h-[30px] w-px bg-[#ccdccc]" />
          {[
            ["Berat", "64,0 kg"],
            ["Tidur", "7,5 jam • nyenyak"],
            ["Energi", "4/5 • berenergi"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-1 flex-col gap-[3px]">
              <span className="[font-family:'Inter-Regular',Helvetica] text-[10px] leading-[15px] text-[#728078]">
                {label}
              </span>
              <span className="[font-family:'Inter-Regular',Helvetica] text-xs leading-[18px] text-[#203d32]">
                {value}
              </span>
            </div>
          ))}
          <span className="rounded-[100px] bg-[#eaf3e9] px-2.5 py-1 [font-family:'Inter-SemiBold',Helvetica] whitespace-nowrap text-[11px] font-semibold leading-[16.5px] text-[#167653]">
            Target dipersonalisasi
          </span>
        </section>
        <div className="flex w-full items-start gap-6">
          <section className="flex w-[744px] flex-col gap-[18px] overflow-hidden rounded-[18px] border border-[#e1e7df] bg-white p-6">
            <div>
              <h2 className="[font-family:'Inter-Bold',Helvetica] text-lg font-bold leading-[27px] text-[#203d32]">
                Keseimbangan energi
              </h2>
              <p className="[font-family:'Inter-Regular',Helvetica] text-xs leading-[18px] text-[#728078]">
                Target harianmu, dengan ruang untuk bergerak.
              </p>
            </div>
            <div className="flex items-center gap-[38px]">
              <div className="relative flex h-52 w-52 items-center justify-center">
                <img
                  className="absolute left-0 top-0 h-52 w-52"
                  alt=""
                  src={lintasanKalori}
                />
                <img
                  className="absolute left-2 top-0 h-52 w-[200px]"
                  alt=""
                  src={kaloriMasuk}
                />
                <div className="relative flex w-[156px] flex-col items-center">
                  <span className="relative h-[23px] w-[23px]">
                    <img
                      className="absolute left-[17.13%] top-[6.02%] h-[93.98%] w-[82.87%]"
                      alt=""
                      src={vector15}
                    />
                  </span>
                  <strong className="[font-family:'Inter-Regular',Helvetica] text-[43px] font-normal leading-[64.5px] text-[#203d32]">
                    608
                  </strong>
                  <span className="[font-family:'Inter-Regular',Helvetica] text-center text-xs leading-[18px] text-[#728078]">
                    kkal tersisa
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-[17px]">
                <div className="flex w-full items-start gap-[15px]">
                  {[
                    ["Masuk", "1.350", vector16],
                    ["Target", "1.700", vector17],
                    ["Terbakar", "258", vector18],
                  ].map(([label, value, icon]) => (
                    <div
                      key={label}
                      className="flex flex-1 flex-col items-start gap-[7px]"
                    >
                      <span className="relative h-[18px] w-[18px]">
                        <img
                          className="absolute left-0 top-0 h-full w-full"
                          alt=""
                          src={icon}
                        />
                      </span>
                      <span className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
                        {label}
                      </span>
                      <strong className="[font-family:'Inter-Bold',Helvetica] text-[23px] font-bold leading-[34.5px] text-[#203d32]">
                        {value}
                      </strong>
                      <small className="[font-family:'Inter-Regular',Helvetica] text-[10px] leading-[15px] text-[#728078]">
                        kkal
                      </small>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-[3px] rounded-[10px] bg-[#f0f3ec] p-3">
                  <strong className="[font-family:'Inter-SemiBold',Helvetica] text-[11px] font-semibold leading-[16.5px] text-[#203d32]">
                    Sisa = Target + Terbakar − Masuk
                  </strong>
                  <span className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
                    1.700 + 258 − 1.350 = 608 kkal
                  </span>
                </div>
              </div>
            </div>
            <div className="h-px w-full bg-[#e1e7df]" />
            <div className="flex w-full items-start gap-6">
              {nutrients.map((nutrient) => (
                <div key={nutrient.name} className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <strong className="flex-1 [font-family:'Inter-Medium',Helvetica] text-xs font-medium leading-[18px] text-[#203d32]">
                      {nutrient.name}
                    </strong>
                    <span className="[font-family:'Inter-Regular',Helvetica] whitespace-nowrap text-xs leading-[18px] text-[#728078]">
                      {nutrient.value}
                    </span>
                  </div>
                  <div className="h-[7px] overflow-hidden rounded-[5px] bg-[#f0f3ec]">
                    <div
                      className={`h-[7px] rounded-[5px] ${nutrient.color}`}
                      style={{ width: nutrient.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="flex w-96 flex-col gap-[18px] overflow-hidden rounded-[18px] border border-[#e1e7df] bg-white p-6">
            <div>
              <h2 className="[font-family:'Inter-Bold',Helvetica] text-lg font-bold leading-[27px] text-[#203d32]">
                Seteguk lagi, yuk.
              </h2>
              <p className="[font-family:'Inter-Regular',Helvetica] text-xs leading-[18px] text-[#728078]">
                Air minum hari ini
              </p>
            </div>
            <div className="flex items-center gap-[21px]">
              <div className="relative h-[125px] w-[78px] overflow-hidden rounded-[8px_8px_20px_20px] border-2 border-[#c5dde3] bg-[#ecf5f7]">
                <div
                  className="absolute bottom-0 left-0 w-full bg-[#a8ccd7]"
                  style={{ height: `${Math.min(100, (water / 2640) * 100)}%` }}
                />
                <div className="absolute -left-2.5 top-[34px] h-5 w-[100px] rounded-[50px/10px] bg-[#a8ccd7]" />
              </div>
              <div className="flex flex-1 flex-col items-start gap-[5px]">
                <p className="[font-family:'Inter-Bold',Helvetica] text-[29px] font-bold leading-[43.5px] text-[#203d32]">
                  {" "}
                  <span className="text-[13px] font-normal text-[#728078]">
                    ml
                  </span>
                </p>
                <p className="[font-family:'Inter-Regular',Helvetica] text-xs leading-[18px] text-[#728078]">
                  dari 2.640 ml • %
                </p>
                <span className="rounded-[100px] bg-[#ecf5f7] px-2.5 py-1 [font-family:'Inter-SemiBold',Helvetica] text-[11px] font-semibold leading-[16.5px] text-[#4b8dab]">
                  Tersisa ml
                </span>
              </div>
            </div>
            <p className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
              Dasar 2.240 + bonus olahraga 400 ml
            </p>
            <div className="flex w-full gap-[9px]">
              <ActionButton
                onClick={() => setWater((value) => Math.min(2640, value + 250))}
              >
                +250 ml
              </ActionButton>
              <div className="flex-1">
                <ActionButton
                  primary
                  onClick={() =>
                    setWater((value) => Math.min(2640, value + 500))
                  }
                >
                  +500 ml
                </ActionButton>
              </div>
            </div>
            <div className="h-px w-full bg-[#e1e7df]" />
            <div className="flex items-center gap-3">
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#eaf3e9]">
                <span className="relative h-[19px] w-[19px]">
                  <img
                    className="absolute left-[8.03%] top-[3.86%] h-[96.14%] w-[91.97%]"
                    alt=""
                    src={vector19}
                  />
                </span>
              </div>
              <div>
                <strong className="[font-family:'Inter-SemiBold',Helvetica] text-[13px] font-semibold leading-[19.5px] text-[#203d32]">
                  Pengingat berikutnya
                </strong>
                <p className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
                  19.00 • Minum air, beri jeda sejenak
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-left [font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#167653]"
            >
              Atur jumlah &amp; lihat riwayat →
            </button>
          </section>
        </div>
        <div className="flex w-full items-start gap-6">
          <section className="flex w-[744px] flex-col gap-[18px] overflow-hidden rounded-[18px] border border-[#e1e7df] bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="[font-family:'Inter-Bold',Helvetica] text-lg font-bold leading-[27px] text-[#203d32]">
                  Yang sudah kamu nikmati
                </h2>
                <p className="[font-family:'Inter-Regular',Helvetica] text-xs leading-[18px] text-[#728078]">
                  4 waktu makan • semua nilai merupakan estimasi
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold leading-[18px] text-[#167653]"
              >
                Buka jurnal →
              </button>
            </div>
            {meals.map((meal) => (
              <div key={meal.name} className="flex w-full items-center gap-3">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#eaf3e9]">
                  <span className="relative h-[19px] w-[19px]">
                    <img
                      className={`absolute ${meal.iconClass ?? "left-[3.86%] top-[3.86%] h-[96.14%] w-[96.14%]"}`}
                      alt=""
                      src={meal.icon}
                    />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-[3px]">
                  <strong className="[font-family:'Inter-SemiBold',Helvetica] text-[13px] font-semibold leading-[19.5px] text-[#203d32]">
                    {meal.name}
                  </strong>
                  <p className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
                    {meal.detail}
                  </p>
                </div>
                <strong className="[font-family:'Inter-Bold',Helvetica] whitespace-nowrap text-sm font-bold leading-[21px] text-[#203d32]">
                  {meal.calories}
                </strong>
              </div>
            ))}
          </section>
          <section className="flex w-96 flex-col gap-[18px] overflow-hidden rounded-[18px] border border-[#e1e7df] bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="[font-family:'Inter-Bold',Helvetica] text-lg font-bold leading-[27px] text-[#203d32]">
                  Gerak yang berarti
                </h2>
                <p className="[font-family:'Inter-Regular',Helvetica] text-xs leading-[18px] text-[#728078]">
                  50 menit • 258 kkal terbakar
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold leading-[18px] text-[#167653]"
              >
                Lihat aktivitas →
              </button>
            </div>
            <ActivityRow item={activities[0]} />
            <ActivityRow item={activities[1]} divider />
            <div className="flex flex-col gap-[5px] rounded-[10px] bg-[#fbf2e2] p-3.5 text-[#a86c24]">
              <span className="text-xs leading-[18px]">
                Evaluasi malam • 20.00
              </span>
              <p className="text-[11px] leading-[16.5px]">
                Lengkapi catatanmu sebelum melihat rangkuman hari ini.
              </p>
            </div>
          </section>
        </div>
        <section className="flex w-full flex-col gap-4">
          <div className="flex w-full items-start justify-between">
            <h2 className="[font-family:'Inter-Bold',Helvetica] text-lg font-bold leading-[27px] text-[#203d32]">
              Pilihan baik berikutnya
            </h2>
            <p className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
              Porsi &amp; nutrisi adalah estimasi
            </p>
          </div>
          <div className="flex w-full items-start gap-5">
            {[
              {
                src: fotoHidangan,
                title: "Gado-gado, saus terpisah",
                detail: "1 porsi 250 g • 330 kkal • protein 18 g",
              },
              {
                src: image,
                title: "Pepes ikan & nasi merah",
                detail: "1 porsi 280 g • 420 kkal • protein 32 g",
              },
            ].map((dish) => (
              <article
                key={dish.title}
                className="flex flex-1 items-start gap-3.5 overflow-hidden rounded-2xl border border-[#e1e7df] bg-white p-3"
              >
                <img
                  className="h-[108px] w-28 object-cover"
                  alt={dish.title}
                  src={dish.src}
                />
                <div className="flex flex-1 flex-col items-start gap-[7px]">
                  <h3 className="[font-family:'Inter-Regular',Helvetica] text-[13px] leading-[19.5px] text-[#203d32]">
                    {dish.title}
                  </h3>
                  <p className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#728078]">
                    {dish.detail}
                  </p>
                  <button
                    type="button"
                    className="text-left [font-family:'Inter-SemiBold',Helvetica] text-[11px] font-semibold leading-[16.5px] text-[#167653]"
                  >
                    Lihat &amp; catat →
                  </button>
                </div>
              </article>
            ))}

            <article className="flex w-[270px] flex-col items-start gap-2.5 overflow-hidden rounded-2xl bg-[#dcebb2] p-5">
              <span className="relative h-[26px] w-[26px]">
                <img
                  className="absolute left-[9.23%] top-[5.06%] h-[94.94%] w-[90.77%]"
                  alt=""
                  src={vector26}
                />
              </span>
              <h3 className="[font-family:'Inter-Bold',Helvetica] text-sm font-bold leading-[21px] text-[#203d32]">
                Tutup hari dengan santai
              </h3>
              <p className="[font-family:'Inter-Regular',Helvetica] text-[11px] leading-[16.5px] text-[#203d32]">
                Jalan ringan 15 menit, bila tubuh masih nyaman. Tidak perlu
                mengejar angka.
              </p>
            </article>
          </div>
        </section>
      </div>
      <footer className="flex w-full items-start justify-between px-9 pb-6 pt-2">
        <p className="[font-family:'Inter-Regular',Helvetica] text-[10px] leading-[15px] text-[#728078]">
          FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli
          gizi.
        </p>
        <span className="[font-family:'Inter-Regular',Helvetica] text-[10px] leading-[15px] text-[#728078]">
          FitBite © 2026
        </span>
      </footer>
    </main>
  );
};
