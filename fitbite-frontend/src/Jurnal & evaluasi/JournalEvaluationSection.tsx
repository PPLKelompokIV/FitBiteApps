import React, { useState } from "react";
import {
  ChevronRight,
  Bell,
  Calendar,
  CheckCircle2,
  CalendarCheck,
  Sprout,
  ClipboardCheck,
  Bike,
  Flower2,
  ArrowRight,
} from "lucide-react";

type CalendarDay = {
  day: string;
  status?: "good" | "low" | "high" | "selected";
  muted?: boolean;
};

const calendarDays: CalendarDay[] = [
  { day: "", muted: true },
  { day: "", muted: true },
  { day: "", muted: true },
  { day: "", muted: true },
  { day: "", muted: true },
  { day: "", muted: true },
  { day: "", muted: true },
  { day: "1" },
  { day: "2" },
  { day: "3" },
  { day: "4" },
  { day: "5", status: "good" },
  { day: "6", status: "good" },
  { day: "7", status: "low" },
  { day: "8", status: "good" },
  { day: "9", status: "good" },
  { day: "10", status: "high" },
  { day: "11", status: "good" },
  { day: "12", status: "low" },
  { day: "13", status: "good" },
  { day: "14", status: "good" },
  { day: "15", status: "high" },
  { day: "16", status: "good" },
  { day: "17", status: "good" },
  { day: "18", status: "selected" },
  { day: "19", muted: true },
  { day: "20", muted: true },
  { day: "21", muted: true },
  { day: "22", muted: true },
  { day: "23", muted: true },
  { day: "24", muted: true },
  { day: "25", muted: true },
  { day: "26", muted: true },
  { day: "27", muted: true },
  { day: "28", muted: true },
  { day: "29", muted: true },
  { day: "30", muted: true },
  { day: "31", muted: true },
];

const mealItems = [
  ["Sarapan", "Oat, telur & buah", "400 kkal"],
  ["Makan siang", "Nasi merah, ayam & sayur", "620 kkal"],
  ["Makan malam", "Ikan, nasi & tumisan", "600 kkal"],
  ["Camilan", "Buah & yoghurt", "180 kkal"],
];

const evaluationRows = [
  ["Energi", "1.958 kkal", "1.800 kkal", "92% · tercapai", "good"],
  ["Protein", "100 g", "110 g", "+10 g", "good"],
  ["Karbohidrat", "190 g", "210 g", "+20 g", "low"],
  ["Lemak", "60 g", "58 g", "−2 g", "neutral"],
  ["Air minum", "2.640 ml", "2.640 ml", "100% · tercapai", "water"],
];

const activityItems = [
  {
    title: "Bersepeda intens",
    description: "30 menit • 6,0 MET",
    calories: "202 kkal",
    icon: Bike,
  },
  {
    title: "Yoga",
    description: "20 menit • 2,5 MET",
    calories: "56 kkal",
    icon: Flower2,
  },
];

const statusClasses: Record<string, string> = {
  good: "bg-[#eaf3e9] text-[#167653]",
  low: "bg-[#fbf2e2] text-[#a86c24]",
  high: "bg-[#fcf0ed] text-[#b15348]",
  neutral: "bg-[#f0f3ec] text-[#728078]",
  water: "bg-[#ecf5f7] text-[#4b8dab]",
};

const dayClasses: Record<string, string> = {
  good: "bg-[#eaf3e9] text-[#203d32] after:bg-[#167653]",
  low: "bg-[#fbf2e2] text-[#203d32] after:bg-[#a86c24]",
  high: "bg-[#fcf0ed] text-[#203d32] after:bg-[#b15348]",
  selected: "bg-[#167653] text-white after:bg-[#dcebb2]",
};

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`flex flex-col items-start gap-[18px] rounded-[18px] border border-[#e1e7df] bg-white p-6 ${className}`}
  >
    {children}
  </section>
);

const CardHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <header className="flex w-full items-center gap-3">
    <div className="flex flex-1 flex-col items-start gap-[2px]">
      <h2 className="text-[17px] font-bold leading-[25px] text-[#203d32]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs leading-[18px] text-[#728078]">{subtitle}</p>
      )}
    </div>
  </header>
);

export const JournalEvaluationSection = () => {
  const [selectedDay, setSelectedDay] = useState("18");

  return (
    <main className="relative flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#f6f7f2]">
      <div className="w-full">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-[72px] w-full shrink-0 items-center justify-between border-b border-[#e1e7df] bg-[#f6f7f2] px-9">
          <nav
            className="inline-flex items-center gap-2"
            aria-label="Breadcrumb"
          >
            <span className="text-xs leading-[18px] text-[#728078]">
              Ruang sehat
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#728078]" />
            <strong className="text-xs font-semibold leading-[18px] text-[#203d32]">
              Jurnal &amp; evaluasi
            </strong>
          </nav>

          <div className="inline-flex items-center gap-4">
            <span className="rounded-full bg-[#e8ece3] px-3 py-1 text-[11px] font-medium leading-[16.5px] text-[#5c6b62]">
              Data contoh
            </span>
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#e8ece3] transition-colors cursor-pointer"
            >
              <Bell className="h-[18px] w-[18px] text-[#203d32]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#167653]" />
            </button>
            <div
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#dcebb2]"
              aria-label="Profil NP"
            >
              <span className="text-[11px] font-bold leading-[16.5px] text-[#203d32]">
                NP
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex w-full flex-col gap-6 px-9 pb-7 pt-[28px]">
          {/* Baris Judul & Tombol Kembali ke Hari Ini */}
          <div className="flex w-full items-center justify-between gap-6">
            <div className="flex flex-1 flex-col items-start gap-1">
              <h1 className="text-[32px] font-normal leading-[40px] tracking-[-0.3px] text-[#203d32]">
                Lihat kembali, melangkah lebih sadar.
              </h1>
              <p className="text-[13px] leading-[19.5px] text-[#728078]">
                Pilih tanggal untuk melihat catatan dan evaluasi malam pukul
                20.00.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDay("18")}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#e1e7df] bg-white hover:bg-[#f4f7f3] px-[18px] py-[10px] text-xs font-semibold leading-[18px] text-[#167653] transition-colors cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-[#167653]" />
              <span>Kembali ke hari ini</span>
            </button>
          </div>

          {/* 2 Kolom Atas: Kalender (Kiri) & Evaluasi Malam (Kanan) */}
          <div className="flex w-full items-start gap-6">
            {/* Kolom Kiri: Kalender & Hari yang dipilih */}
            <aside className="flex w-[328px] shrink-0 flex-col gap-5">
              {/* Kartu Kalender */}
              <Card className="p-5">
                <div className="flex w-full items-center justify-between">
                  <h2 className="text-[17px] font-bold leading-[25px] text-[#203d32]">
                    Oktober 2026
                  </h2>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#167653]">
                    <button
                      type="button"
                      className="hover:opacity-75 px-1 cursor-pointer"
                      aria-label="Bulan sebelumnya"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="hover:opacity-75 px-1 cursor-pointer"
                      aria-label="Bulan berikutnya"
                    >
                      ›
                    </button>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>

                <div className="grid w-full grid-cols-7 gap-[5px]">
                  {["S", "S", "R", "K", "J", "S", "M"].map((day, index) => (
                    <div
                      key={`${day}-${index}`}
                      className="flex h-6 items-center justify-center text-center text-[10px] leading-[15px] text-[#728078]"
                    >
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((item, index) => (
                    <button
                      type="button"
                      key={`${item.day}-${index}`}
                      disabled={item.muted || !item.day}
                      aria-label={
                        item.day ? `Oktober ${item.day}` : "Tanggal kosong"
                      }
                      aria-pressed={selectedDay === item.day}
                      onClick={() => item.day && setSelectedDay(item.day)}
                      className={`relative flex h-9 items-center justify-center rounded-lg text-[11px] font-medium leading-[16.5px] transition-all ${
                        item.muted
                          ? "bg-transparent text-[#a9b1a9] cursor-default"
                          : item.status
                            ? `${dayClasses[item.status]} after:absolute after:bottom-[5px] after:h-[3px] after:w-[3px] after:rounded-full cursor-pointer`
                            : "bg-white text-[#203d32] hover:bg-[#f4f7f3] cursor-pointer"
                      } ${
                        selectedDay === item.day && item.status !== "selected"
                          ? "ring-1.5 ring-[#167653]"
                          : ""
                      }`}
                    >
                      {item.day}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {[
                    ["#167653", "Tercapai"],
                    ["#a86c24", "Kurang"],
                    ["#b15348", "Berlebih"],
                  ].map(([color, label]) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 text-[10px] leading-[15px] text-[#728078]"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {label}
                    </span>
                  ))}
                </div>

                <p className="text-[10px] leading-[15px] text-[#728078]">
                  Status energi: tercapai 90–110%, kurang &lt;90%, berlebih
                  &gt;110% dari target + olahraga. Tanggal tanpa warna belum
                  memiliki laporan.
                </p>
              </Card>

              {/* Kartu Hari yang dipilih */}
              <Card className="p-5">
                <CardHeading title="Hari yang dipilih" />
                <h3 className="-mt-2 text-[20px] font-bold leading-[28px] text-[#203d32]">
                  Minggu, 18 Oktober
                </h3>
                <span className="-mt-1 rounded-full bg-[#eaf3e9] px-2.5 py-1 text-[11px] font-semibold leading-[16px] text-[#167653]">
                  Riwayat • hanya baca
                </span>

                <div className="flex w-full items-center gap-3 pt-1">
                  <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167653]">
                    <CheckCircle2 className="h-[19px] w-[19px]" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold leading-[19px] text-[#203d32]">
                      Body Check selesai
                    </h4>
                    <p className="text-[11px] leading-[16px] text-[#728078]">
                      64,0 kg • tidur 7,5 jam • energi 4/5
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-[#e1e7df]" />

                <p className="text-[11px] leading-[16.5px] text-[#728078]">
                  Laporan tersimpan pukul 20.00 WIB. Hari lampau ditampilkan
                  sebagai ringkasan, bukan formulir pencatatan.
                </p>
              </Card>

              {/* Info Box Kiri Bawah */}
              <div className="flex items-start gap-2.5 rounded-[12px] bg-[#eaf3e9] p-3.5">
                <CalendarCheck className="h-4 w-4 shrink-0 text-[#167653] mt-0.5" />
                <p className="flex-1 text-[11px] leading-[16.5px] text-[#124b39]">
                  Evaluasi hari ini tersedia pada 20.00. Pengingat akan muncul
                  di aplikasi meski notifikasi browser tidak aktif.
                </p>
              </div>
            </aside>

            {/* Kolom Kanan: Evaluasi Malam & Catatan Pendamping */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              {/* Kartu Evaluasi Malam */}
              <Card>
                <div className="flex w-full items-start justify-between gap-3">
                  <CardHeading
                    title="Evaluasi malam"
                    subtitle="Minggu, 18 Oktober 2026 • 20.00 WIB"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold leading-[18px] text-[#167653] hover:underline shrink-0"
                  >
                    <span>Riwayat tersimpan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Lingkaran Skor 98 */}
                <div className="flex w-full items-center gap-[22px]">
                  <div className="flex h-[112px] w-[112px] shrink-0 flex-col items-center justify-center rounded-full bg-[#eaf3e9]">
                    <span className="text-[36px] font-normal leading-[42px] text-[#203d32]">
                      98
                    </span>
                    <span className="text-[10px] leading-[15px] text-[#728078] mt-0.5">
                      dari 100
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="rounded-full bg-[#eaf3e9] px-2.5 py-1 text-[11px] font-semibold leading-[16px] text-[#167653]">
                      Kebiasaanmu tercatat dengan baik
                    </span>
                    <h3 className="text-[17px] font-bold leading-[24px] text-[#203d32]">
                      Konsistensi yang layak dirayakan.
                    </h3>
                    <p className="text-xs leading-[18px] text-[#728078]">
                      Skor kepatuhan merangkum capaian target yang kamu catat.
                      Ini bukan nilai kesehatan atau diagnosis.
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-[#e1e7df]" />

                {/* Tabel Komponen Evaluasi */}
                <div className="w-full">
                  <div className="grid w-full grid-cols-[1fr_112px_112px_136px] gap-4 pb-2.5 text-[10px] font-semibold tracking-wider text-[#728078] uppercase">
                    <span>KOMPONEN</span>
                    <span>TARGET</span>
                    <span>AKTUAL</span>
                    <span>RINGKASAN</span>
                  </div>

                  <div className="flex flex-col divide-y divide-[#edf1eb]">
                    {evaluationRows.map(
                      ([name, target, actual, summary, tone]) => (
                        <div
                          key={name}
                          className="grid w-full grid-cols-[1fr_112px_112px_136px] items-center gap-4 py-3 text-xs leading-[18px]"
                        >
                          <strong className="font-semibold text-[#203d32]">
                            {name}
                          </strong>
                          <span className="text-[#728078]">{target}</span>
                          <span className="font-medium text-[#203d32]">
                            {actual}
                          </span>
                          <span>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-[16px] ${statusClasses[tone]}`}
                            >
                              {summary}
                            </span>
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <p className="text-[10px] leading-[15px] text-[#728078]">
                  Energi: 1.700 target dasar + 258 olahraga. Air: 2.240 dasar +
                  400 bonus. Skor contoh = rerata rasio energi, protein, karbo,
                  lemak, air (masing-masing maksimal 100%), dibulatkan.
                </p>
              </Card>

              {/* Kartu Hijau Tua: Catatan pendamping sehat */}
              <section className="flex flex-col gap-3.5 rounded-[18px] bg-[#124b39] p-6 text-white">
                <header className="flex w-full items-center gap-2.5">
                  <Sprout className="h-5 w-5 text-[#a3d9b8]" />
                  <h2 className="flex-1 text-[16px] font-medium leading-[24px]">
                    Catatan pendamping sehat
                  </h2>
                  <span className="rounded-full bg-[#eaf3e9] px-3 py-1 text-[11px] font-semibold leading-[16px] text-[#167653]">
                    Untuk besok
                  </span>
                </header>

                <div className="flex flex-col gap-2.5 pt-1">
                  <p className="text-xs leading-[19px] text-[#e2ede4]">
                    <span className="font-semibold text-[#a3d9b8] mr-2.5">
                      01
                    </span>
                    Protein sudah tercukupi. Coba bagi lauk sumber protein lebih
                    merata antara sarapan, siang, dan malam.
                  </p>
                  <p className="text-xs leading-[19px] text-[#e2ede4]">
                    <span className="font-semibold text-[#a3d9b8] mr-2.5">
                      02
                    </span>
                    Air mencapai target, termasuk bonus bersepeda. Siapkan botol
                    sebelum olahraga agar kebiasaan ini lebih mudah diulang.
                  </p>
                </div>

                <p className="text-[10px] leading-[15px] text-[#9ab8a8] pt-1">
                  Saran kebiasaan umum dari data contoh, bukan anjuran medis
                  individual.
                </p>
              </section>

              {/* Info Box Kanan Bawah */}
              <div className="flex items-start gap-2.5 rounded-[12px] bg-[#eaf3e9] p-3.5">
                <ClipboardCheck className="h-4 w-4 shrink-0 text-[#167653] mt-0.5" />
                <p className="flex-1 text-[11px] leading-[16.5px] text-[#124b39]">
                  Kelengkapan: 4 waktu makan, 2 aktivitas, dan 7 catatan air
                  terisi. Laporan hanya mewakili data yang dicatat; makanan atau
                  minuman yang terlewat dapat mengubah hasil.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Kolom Bawah: Makanan, Aktivitas, Hidrasi */}
          <div className="grid w-full grid-cols-3 gap-5">
            {/* Kartu 1: Makanan */}
            <Card>
              <CardHeading
                title="Makanan"
                subtitle="Total 1.800 kkal • 4 waktu makan"
              />
              <div className="flex w-full flex-col divide-y divide-[#edf1eb]">
                {mealItems.map(([title, description, calories]) => (
                  <div
                    key={title}
                    className="flex w-full items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-1 flex-col gap-[2px]">
                      <h3 className="text-[13px] font-semibold leading-[19px] text-[#203d32]">
                        {title}
                      </h3>
                      <p className="text-[11px] leading-[16px] text-[#728078]">
                        {description}
                      </p>
                    </div>
                    <strong className="text-xs font-bold leading-[18px] text-[#203d32]">
                      {calories}
                    </strong>
                  </div>
                ))}
              </div>
            </Card>

            {/* Kartu 2: Aktivitas */}
            <Card>
              <CardHeading
                title="Aktivitas"
                subtitle="Total 50 menit • 258 kkal"
              />
              <div className="flex w-full flex-col divide-y divide-[#edf1eb]">
                {activityItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex w-full items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167653]">
                        <IconComponent className="h-[18px] w-[18px]" />
                      </div>
                      <div className="flex flex-1 flex-col gap-[2px]">
                        <h3 className="text-[13px] font-semibold leading-[19px] text-[#203d32]">
                          {item.title}
                        </h3>
                        <p className="text-[11px] leading-[16px] text-[#728078]">
                          {item.description}
                        </p>
                      </div>
                      <strong className="text-xs font-bold leading-[18px] text-[#203d32]">
                        {item.calories}
                      </strong>
                    </div>
                  );
                })}
              </div>
              <div className="h-px w-full bg-[#e1e7df]" />
              <p className="text-[11px] leading-[16.5px] text-[#728078]">
                Sisa energi akhir: 158 kkal
              </p>
            </Card>

            {/* Kartu 3: Hidrasi */}
            <Card>
              <CardHeading title="Hidrasi" subtitle="Target tercapai" />
              <strong className="text-[30px] font-bold leading-[38px] text-[#203d32]">
                2.640 ml
              </strong>
              <div className="flex w-full flex-col gap-2 pt-1">
                <div className="flex justify-between text-xs leading-[18px] text-[#728078]">
                  <span className="font-semibold text-[#203d32]">
                    Dasar + bonus
                  </span>
                  <span>100%</span>
                </div>
                <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#f0f3ec]">
                  <div className="h-full w-full rounded-full bg-[#4b8dab]" />
                </div>
              </div>
              <p className="text-[11px] leading-[16.5px] text-[#728078]">
                7 catatan air • 2.240 ml dasar + 400 ml bonus olahraga, dihitung
                satu kali.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex w-full items-center justify-between px-9 pb-6 pt-2">
        <p className="text-[10px] leading-[15px] text-[#728078]">
          FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli
          gizi.
        </p>
        <span className="text-[10px] leading-[15px] text-[#728078]">
          FitBite © 2026
        </span>
      </footer>
    </main>
  );
};