import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  Info,
  Sun,
  Utensils,
} from "lucide-react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";

type EvaluationStatus = "tercapai" | "kurang" | "berlebih";

type FoodLog = {
  id_food_log: number;
  slot_makan: string;
  nama_makanan: string;
  estimasi_gram: number;
  kalori: number;
  protein_g: number;
  karbo_g: number;
  lemak_g: number;
};

type WaterLog = {
  id_water_log: number;
  waktu: string;
  jumlah_ml: number;
  catatan: string | null;
};

type DailyLog = {
  tanggal: string;
  food_logs: FoodLog[];
  water_logs: WaterLog[];
};

type ActivityLog = {
  id: number;
  name: string;
  met: string;
  durationMinutes: number;
  calories: number;
  startTime: string;
};

type BodyCheckLog = {
  weight: string;
  sleepDuration: string;
  sleepQuality: string;
  energyLevel: string;
  time: string;
};

const calorieTarget = 1958;
const proteinTarget = 100;
const carbohydrateTarget = 190;
const fatTarget = 60;
const weekdayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const localDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatNumber = (value: number, digits = 0) =>
  value.toLocaleString("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const statusLabel: Record<EvaluationStatus, string> = {
  tercapai: "Tercapai",
  kurang: "Kurang",
  berlebih: "Berlebih",
};

const statusStyles: Record<EvaluationStatus, string> = {
  tercapai: "bg-[#e7f2e9] text-[#24784f]",
  kurang: "bg-[#fff4d8] text-[#a66a08]",
  berlebih: "bg-[#fce9e7] text-[#bd4c43]",
};

function getStatus(actual: number, target: number): EvaluationStatus {
  const ratio = target > 0 ? actual / target : 0;
  if (ratio < 0.9) return "kurang";
  if (ratio > 1.1) return "berlebih";
  return "tercapai";
}

function getDailyEvaluation(log: DailyLog | undefined, waterTarget: number): EvaluationStatus | null {
  if (!log) return null;

  const statuses: EvaluationStatus[] = [];
  if (log.food_logs.length > 0) {
    const calories = log.food_logs.reduce((sum, item) => sum + Number(item.kalori || 0), 0);
    statuses.push(getStatus(calories, calorieTarget));
  }
  if (log.water_logs.length > 0) {
    const water = log.water_logs.reduce((sum, item) => sum + Number(item.jumlah_ml || 0), 0);
    statuses.push(getStatus(water, waterTarget));
  }

  if (statuses.includes("berlebih")) return "berlebih";
  if (statuses.includes("kurang")) return "kurang";
  return statuses[0] ?? null;
}

function readActivityLogs(dateKey: string): ActivityLog[] {
  const raw = localStorage.getItem(`fitbite_activity_logs_${dateKey}`);
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Riwayat aktivitas ${dateKey} memiliki format yang tidak valid.`);
  }

  return parsed.filter(
    (item): item is ActivityLog =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      typeof item.name === "string" &&
      "durationMinutes" in item &&
      typeof item.durationMinutes === "number" &&
      "calories" in item &&
      typeof item.calories === "number" &&
      "startTime" in item &&
      typeof item.startTime === "string"
  );
}

function readTodayBodyCheck(dateKey: string): BodyCheckLog | null {
  if (dateKey !== localDateKey(new Date())) return null;

  const time = localStorage.getItem("fitbite_bodycheck_time");
  const weight = localStorage.getItem("fitbite_berat_badan_kg");
  const savedDate = localStorage.getItem("fitbite_bodycheck_date");
  if (!time || !weight || savedDate !== dateKey) return null;

  return {
    weight,
    sleepDuration: localStorage.getItem("fitbite_sleep_duration") ?? "-",
    sleepQuality: localStorage.getItem("fitbite_sleep_quality") ?? "-",
    energyLevel: localStorage.getItem("fitbite_energy_level") ?? "-",
    time,
  };
}

function getCalendarCells(monthDate: Date): Array<Date | null> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dateCells: Array<Date | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];

  while (dateCells.length % 7 !== 0) dateCells.push(null);
  return dateCells;
}

export default function JurnalEvaluasiPage(): ReactElement {
  const navigate = useNavigate();
  const today = new Date();
  const [monthDate, setMonthDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(today));
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [bodyCheck, setBodyCheck] = useState<BodyCheckLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;
  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(monthDate);
  const calendarCells = useMemo(() => getCalendarCells(monthDate), [monthDate]);
  const selectedLog = dailyLogs[selectedDate] ?? {
    tanggal: selectedDate,
    food_logs: [],
    water_logs: [],
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    fetch(`http://127.0.0.1:8000/api/daily-logs/1?year=${year}&month=${month}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Server mengembalikan ${response.status}.`);
        return response.json();
      })
      .then((response: { data?: unknown }) => {
        if (!Array.isArray(response.data)) {
          throw new Error("Format riwayat bulanan tidak valid.");
        }

        const logsByDate: Record<string, DailyLog> = {};
        (response.data as DailyLog[]).forEach((log) => {
          if (typeof log.tanggal === "string" && Array.isArray(log.food_logs) && Array.isArray(log.water_logs)) {
            logsByDate[log.tanggal] = log;
          }
        });
        setDailyLogs(logsByDate);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Gagal memuat riwayat bulanan.", error);
        setDailyLogs({});
        setLoadError("Riwayat belum dapat dimuat. Coba lagi setelah server terhubung.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [month, refreshKey, year]);

  useEffect(() => {
    setActivityError(null);
    try {
      setActivityLogs(readActivityLogs(selectedDate));
    } catch (error) {
      console.error("Gagal membaca riwayat aktivitas.", error);
      setActivityLogs([]);
      setActivityError("Riwayat aktivitas tersimpan tidak dapat dibaca.");
    }
    setBodyCheck(readTodayBodyCheck(selectedDate));
  }, [selectedDate]);

  const selectedDateObject = new Date(`${selectedDate}T00:00:00`);
  const selectedDateLabel = selectedDateObject.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const totalCalories = selectedLog.food_logs.reduce((sum, log) => sum + Number(log.kalori || 0), 0);
  const totalProtein = selectedLog.food_logs.reduce((sum, log) => sum + Number(log.protein_g || 0), 0);
  const totalCarbohydrate = selectedLog.food_logs.reduce((sum, log) => sum + Number(log.karbo_g || 0), 0);
  const totalFat = selectedLog.food_logs.reduce((sum, log) => sum + Number(log.lemak_g || 0), 0);
  const totalWater = selectedLog.water_logs.reduce((sum, log) => sum + Number(log.jumlah_ml || 0), 0);
  const waterTarget = (Number(localStorage.getItem("fitbite_target_cairan_ml")) || 2240) + 400;
  const evaluation =
    getDailyEvaluation(selectedLog, waterTarget);
  const caloriesPercent = selectedLog.food_logs.length
    ? Math.round((totalCalories / calorieTarget) * 100)
    : null;
  const waterPercent = selectedLog.water_logs.length
    ? Math.round((totalWater / waterTarget) * 100)
    : null;
  const hasAnyLog =
    selectedLog.food_logs.length > 0 ||
    selectedLog.water_logs.length > 0 ||
    activityLogs.length > 0 ||
    bodyCheck !== null;

  const changeMonth = (difference: number) => {
    const nextMonth = new Date(year, month - 1 + difference, 1);
    const currentDay = selectedDateObject.getDate();
    const nextDay = Math.min(currentDay, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate());
    setMonthDate(nextMonth);
    setSelectedDate(localDateKey(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextDay)));
  };

  const selectToday = () => {
    const currentDate = new Date();
    setMonthDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    setSelectedDate(localDateKey(currentDate));
  };

  const evaluationRows = [
    {
      label: "Energi",
      target: `${formatNumber(calorieTarget)} kkal`,
      actual: selectedLog.food_logs.length ? `${formatNumber(totalCalories)} kkal` : "—",
      status: selectedLog.food_logs.length ? getStatus(totalCalories, calorieTarget) : null,
    },
    {
      label: "Protein",
      target: `${proteinTarget} g`,
      actual: selectedLog.food_logs.length ? `${formatNumber(totalProtein)} g` : "—",
      status: selectedLog.food_logs.length ? getStatus(totalProtein, proteinTarget) : null,
    },
    {
      label: "Karbohidrat",
      target: `${carbohydrateTarget} g`,
      actual: selectedLog.food_logs.length ? `${formatNumber(totalCarbohydrate)} g` : "—",
      status: selectedLog.food_logs.length ? getStatus(totalCarbohydrate, carbohydrateTarget) : null,
    },
    {
      label: "Lemak",
      target: `${fatTarget} g`,
      actual: selectedLog.food_logs.length ? `${formatNumber(totalFat)} g` : "—",
      status: selectedLog.food_logs.length ? getStatus(totalFat, fatTarget) : null,
    },
    {
      label: "Air minum",
      target: `${formatNumber(waterTarget)} ml`,
      actual: selectedLog.water_logs.length ? `${formatNumber(totalWater)} ml` : "—",
      status: selectedLog.water_logs.length ? getStatus(totalWater, waterTarget) : null,
    },
  ];

  const groupedMeals = ["Sarapan", "Makan siang", "Makan malam", "Camilan"].map((slot) => ({
    slot,
    logs: selectedLog.food_logs.filter((log) =>
      slot === "Camilan" ? ["Camilan", "Snack"].includes(log.slot_makan) : log.slot_makan === slot
    ),
  }));
  const advice =
    totalProtein >= proteinTarget
      ? "Protein hari ini sudah mencukupi. Pertahankan sumber protein yang beragam."
      : "Pertimbangkan sumber protein seimbang pada waktu makan berikutnya.";
  const hydrationAdvice =
    totalWater >= waterTarget
      ? "Target cairan hari ini tercapai. Lanjutkan kebiasaan minum secara teratur."
      : "Minum secara bertahap dapat membantu memenuhi target cairan harian.";

  const renderJurnalKalender = () => (
    <section className="rounded-[17px] border border-[#e1e7df] bg-white p-4 shadow-[0_1px_3px_rgba(31,54,42,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-bold capitalize text-[#203d32]">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            onClick={() => changeMonth(-1)}
            className="rounded-md p-1.5 text-[#728078] hover:bg-[#f1f5f0]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Bulan berikutnya"
            onClick={() => changeMonth(1)}
            className="rounded-md p-1.5 text-[#728078] hover:bg-[#f1f5f0]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayLabels.map((label) => (
          <span key={label} className="pb-1 text-[9px] font-medium text-[#7d8c84]">
            {label}
          </span>
        ))}
        {calendarCells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;

          const dateKey = localDateKey(date);
          const log = dailyLogs[dateKey];
          const dayStatus = getDailyEvaluation(log, waterTarget);
          const isSelected = selectedDate === dateKey;
          const statusClass = dayStatus
            ? dayStatus === "tercapai"
              ? "bg-[#e7f2e9] text-[#24784f]"
              : dayStatus === "kurang"
                ? "bg-[#fff4d8] text-[#a66a08]"
                : "bg-[#fce9e7] text-[#bd4c43]"
            : "text-[#354a3e] hover:bg-[#f3f6f2]";

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              aria-pressed={isSelected}
              aria-label={`${date.getDate()} ${monthLabel}${dayStatus ? `, ${statusLabel[dayStatus]}` : ", belum ada evaluasi"}`}
              className={`relative flex h-8 items-center justify-center rounded-md text-[10px] font-medium transition-colors ${
                isSelected ? "bg-[#167653] text-white shadow-sm" : statusClass
              }`}
            >
              {date.getDate()}
              {dayStatus && (
                <span
                  className={`absolute bottom-[3px] h-1 w-1 rounded-full ${
                    isSelected
                      ? "bg-white"
                      : dayStatus === "tercapai"
                        ? "bg-[#24784f]"
                        : dayStatus === "kurang"
                          ? "bg-[#d49318]"
                          : "bg-[#bd4c43]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-[#edf1ec] pt-3 text-[9px] text-[#64736b]">
        {(["tercapai", "kurang", "berlebih"] as const).map((status) => (
          <span key={status} className="inline-flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "tercapai"
                  ? "bg-[#24784f]"
                  : status === "kurang"
                    ? "bg-[#d49318]"
                    : "bg-[#bd4c43]"
              }`}
            />
            {statusLabel[status]}
          </span>
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex min-h-screen bg-[#f7f9f5] text-[#203d32]">
      <HealthAppSidebarSection />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[62px] items-center justify-between border-b border-[#e1e7df] bg-white/95 px-5 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px]">
            <button type="button" onClick={selectToday} className="text-[#728078] hover:text-[#167653]">
              Ruang sehat
            </button>
            <ChevronRight className="h-3 w-3 text-[#9aa69e]" />
            <span className="font-semibold text-[#203d32]">Jurnal &amp; evaluasi</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#edf0eb] px-3 py-1 text-[10px] font-medium text-[#5c6b63]">
              {loadError ? "Sinkronisasi tertunda" : isLoading ? "Memuat data" : "Data tersimpan"}
            </span>
            <button
              type="button"
              onClick={() => navigate("/profil-pengingat")}
              aria-label="Buka pengingat"
              className="relative rounded-full p-2 text-[#5c6b63] hover:bg-[#edf0eb]"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#167653]" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/profil-pengingat")}
              aria-label="Buka profil"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e2f0e7] text-[10px] font-bold text-[#167653]"
            >
              NP
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-[25px] font-semibold tracking-[-0.4px] text-[#203d32]">
                Lihat kembali, melangkah lebih sadar.
              </h1>
              <p className="mt-1 text-[11px] text-[#728078]">
                Pilih tanggal untuk melihat catatan dan evaluasi harian secara read-only.
              </p>
            </div>
            <button
              type="button"
              onClick={selectToday}
              className="inline-flex min-h-9 items-center gap-2 self-start rounded-lg border border-[#dce5dc] bg-white px-3.5 text-[11px] font-semibold text-[#167653] hover:bg-[#f1f7f1] sm:self-auto"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Kembali ke hari ini
            </button>
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <div className="space-y-4">
              {renderJurnalKalender()}

              <section className="rounded-[17px] border border-[#e1e7df] bg-white p-4 shadow-[0_1px_3px_rgba(31,54,42,0.04)]">
                <h2 className="text-[13px] font-bold text-[#203d32]">Hari yang dipilih</h2>
                <p className="mt-1 text-[15px] font-bold capitalize text-[#203d32]">{selectedDateLabel}</p>
                <span className="mt-2 inline-flex rounded-full bg-[#eff5ef] px-2.5 py-1 text-[9px] font-semibold text-[#24784f]">
                  Riwayat • hanya baca
                </span>

                {bodyCheck && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f4f8f3] p-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e5f1e7] text-[#24784f]">
                      <Sun className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[#203d32]">Body Check selesai</p>
                      <p className="text-[9px] text-[#728078]">
                        {formatNumber(Number(bodyCheck.weight), 1)} kg • tidur {bodyCheck.sleepDuration} jam • energi {bodyCheck.energyLevel}/5
                      </p>
                    </div>
                  </div>
                )}
                {!bodyCheck && !hasAnyLog && !isLoading && !loadError && (
                  <p className="mt-3 text-[10px] leading-4 text-[#728078]">
                    Belum ada ringkasan tersimpan untuk tanggal ini.
                  </p>
                )}
              </section>
            </div>

            <div className="space-y-4">
              {loadError && (
                <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-[#f1c7c3] bg-[#fff3f1] px-4 py-3 text-[11px] text-[#9d3e37]">
                  <span>{loadError}</span>
                  <button
                    type="button"
                    onClick={() => setRefreshKey((key) => key + 1)}
                    className="shrink-0 font-semibold underline"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {isLoading ? (
                <section aria-live="polite" className="flex min-h-[300px] items-center justify-center rounded-[17px] border border-[#e1e7df] bg-white text-[12px] text-[#728078]">
                  Memuat riwayat...
                </section>
              ) : loadError && !hasAnyLog ? (
                <section className="flex min-h-[300px] flex-col items-center justify-center rounded-[17px] border border-[#e1e7df] bg-white px-6 text-center shadow-[0_1px_3px_rgba(31,54,42,0.04)]">
                  <Info className="h-6 w-6 text-[#a66a08]" />
                  <h2 className="mt-3 text-[14px] font-bold text-[#203d32]">
                    Riwayat tanggal ini belum dapat dipastikan.
                  </h2>
                  <p className="mt-1 max-w-[360px] text-[11px] leading-5 text-[#728078]">
                    Hubungkan ke server untuk memeriksa apakah ada catatan pada {selectedDateLabel}.
                  </p>
                </section>
              ) : !hasAnyLog ? (
                <section className="flex min-h-[300px] flex-col items-center justify-center rounded-[17px] border border-[#e1e7df] bg-white px-6 text-center shadow-[0_1px_3px_rgba(31,54,42,0.04)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff5ef] text-[#438264]">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <h2 className="mt-3 text-[14px] font-bold text-[#203d32]">
                    Belum ada data log pada tanggal ini.
                  </h2>
                  <p className="mt-1 max-w-[360px] text-[11px] leading-5 text-[#728078]">
                    Belum ada catatan makanan, aktivitas fisik, atau asupan cairan pada {selectedDateLabel}.
                  </p>
                </section>
              ) : (
                <>
                  <section className="rounded-[17px] border border-[#e1e7df] bg-white p-5 shadow-[0_1px_3px_rgba(31,54,42,0.04)] sm:p-6">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#edf1ec] pb-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-[15px] font-bold text-[#203d32]">Evaluasi malam</h2>
                          <span className="text-[9px] text-[#8b9991]">• {selectedDateLabel} • 20.00 WIB</span>
                        </div>
                        <p className="mt-1 text-[10px] text-[#728078]">
                          Ringkasan berdasarkan catatan yang tersimpan.
                        </p>
                      </div>
                      {evaluation ? (
                        <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[9px] font-semibold ${statusStyles[evaluation]}`}>
                          <Check className="h-3 w-3" />
                          {statusLabel[evaluation]}
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#f0f3ec] px-2.5 py-1 text-[9px] font-semibold text-[#728078]">
                          Evaluasi belum tersedia
                        </span>
                      )}
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[510px] text-left text-[10px]">
                        <thead className="text-[8px] uppercase tracking-wide text-[#8b9991]">
                          <tr>
                            <th className="pb-2 font-medium">Komponen</th>
                            <th className="pb-2 font-medium">Target</th>
                            <th className="pb-2 font-medium">Aktual</th>
                            <th className="pb-2 font-medium">Ringkasan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {evaluationRows.map((row) => (
                            <tr key={row.label} className="border-t border-[#f0f3ef]">
                              <th className="py-2 font-semibold text-[#42564a]">{row.label}</th>
                              <td className="py-2 text-[#728078]">{row.target}</td>
                              <td className="py-2 font-semibold text-[#203d32]">{row.actual}</td>
                              <td className="py-2">
                                {row.status ? (
                                  <span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${statusStyles[row.status]}`}>
                                    {statusLabel[row.status]}
                                  </span>
                                ) : (
                                  <span className="text-[#9aa69e]">Belum dicatat</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-[9px] leading-4 text-[#8b9991]">
                      Evaluasi energi: {caloriesPercent === null ? "belum dicatat" : `${formatNumber(caloriesPercent)}% dari target`} • Hidrasi: {waterPercent === null ? "belum dicatat" : `${formatNumber(waterPercent)}% dari target`}.
                      Ringkasan ini bukan diagnosis kesehatan.
                    </p>
                  </section>

                  <section className="rounded-[17px] bg-[#0f4938] p-5 text-white sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2 text-[13px] font-semibold">
                        <Info className="h-4 w-4 text-[#a8d1b3]" />
                        Catatan pendamping sehat
                      </h2>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[8px] font-medium text-[#d9eadc]">
                        Untuk besok
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-[10px] leading-[17px] text-[#e2eee5]">
                      <p><span className="mr-2 text-[#a8d1b3]">01</span>{advice}</p>
                      <p><span className="mr-2 text-[#a8d1b3]">02</span>{hydrationAdvice}</p>
                      <p className="text-[8px] text-[#bed4c4]">
                        Saran kebiasaan umum dari data contoh, bukan anjuran medis individual.
                      </p>
                    </div>
                  </section>

                  <div className="grid gap-3 rounded-xl border border-[#dcebdd] bg-[#edf6ed] px-4 py-3 text-[9px] leading-4 text-[#42664e] sm:grid-cols-2">
                    <p className="flex gap-2">
                      <Check className="mt-0.5 h-3 w-3 shrink-0" />
                      Kelengkapan: {selectedLog.food_logs.length} log makanan, {activityLogs.length} aktivitas, dan {selectedLog.water_logs.length} catatan air.
                    </p>
                    <p className="flex gap-2">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" />
                      Hanya data yang dicatat yang ditampilkan; catatan tidak dapat diubah dari halaman ini.
                    </p>
                  </div>

                  <div className="grid items-start gap-3 lg:grid-cols-3">
                    <section className="rounded-[16px] border border-[#e1e7df] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-1.5 text-[12px] font-bold text-[#203d32]">
                          <Utensils className="h-3.5 w-3.5 text-[#438264]" />
                          Makanan
                        </h2>
                        <span className="text-[9px] text-[#728078]">
                          {formatNumber(totalCalories)} kkal
                        </span>
                      </div>
                      <div className="mt-3 space-y-3">
                        {groupedMeals.map(({ slot, logs }) => logs.length > 0 && (
                          <div key={slot}>
                            <h3 className="text-[9px] font-semibold text-[#728078]">{slot}</h3>
                            {logs.map((log) => (
                              <div key={log.id_food_log} className="mt-1 flex justify-between gap-2 text-[9px]">
                                <span className="text-[#354a3e]">{log.nama_makanan}</span>
                                <span className="shrink-0 font-semibold text-[#203d32]">{formatNumber(Number(log.kalori))} kkal</span>
                              </div>
                            ))}
                          </div>
                        ))}
                        {selectedLog.food_logs.length === 0 && (
                          <p className="text-[9px] text-[#8b9991]">Belum ada log makanan.</p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-[16px] border border-[#e1e7df] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-1.5 text-[12px] font-bold text-[#203d32]">
                          <Activity className="h-3.5 w-3.5 text-[#438264]" />
                          Aktivitas
                        </h2>
                        <span className="text-[9px] text-[#728078]">
                          {activityLogs.reduce((sum, item) => sum + item.durationMinutes, 0)} menit
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {activityLogs.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-2 border-b border-[#f0f3ef] pb-2 last:border-0">
                            <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-[#eaf3e9] text-[#438264]">
                              <Flame className="h-3 w-3" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[9px] font-semibold text-[#354a3e]">{activity.name}</p>
                              <p className="text-[8px] text-[#8b9991]">
                                {activity.startTime} • {activity.durationMinutes} menit • {activity.met}
                              </p>
                            </div>
                            <span className="shrink-0 text-[9px] font-semibold text-[#203d32]">
                              {formatNumber(activity.calories)} kkal
                            </span>
                          </div>
                        ))}
                        {activityLogs.length === 0 && (
                          <p className="text-[9px] text-[#8b9991]">Belum ada log aktivitas.</p>
                        )}
                      </div>
                      {activityError && <p role="alert" className="mt-2 text-[9px] text-[#bd4c43]">{activityError}</p>}
                    </section>

                    <section className="rounded-[16px] border border-[#e1e7df] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-1.5 text-[12px] font-bold text-[#203d32]">
                          <Droplets className="h-3.5 w-3.5 text-[#4c8dae]" />
                          Hidrasi
                        </h2>
                        <span className="text-[9px] text-[#728078]">Target harian</span>
                      </div>
                      <p className="mt-3 text-[20px] font-bold text-[#203d32]">{formatNumber(totalWater)} ml</p>
                      <div className="mt-1 flex justify-between text-[8px] text-[#8b9991]">
                        <span>Dasar + bonus</span>
                        <span>{formatNumber(waterPercent)}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#edf1ec]">
                        <div
                          className="h-full rounded-full bg-[#4c8dae]"
                          style={{ width: `${Math.min(waterPercent, 100)}%` }}
                        />
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {selectedLog.water_logs.map((log) => (
                          <div key={log.id_water_log} className="flex justify-between gap-2 text-[9px]">
                            <span className="text-[#728078]">{log.waktu}{log.catatan ? ` • ${log.catatan}` : ""}</span>
                            <span className="shrink-0 font-semibold text-[#354a3e]">{formatNumber(log.jumlah_ml)} ml</span>
                          </div>
                        ))}
                        {selectedLog.water_logs.length === 0 && (
                          <p className="text-[9px] text-[#8b9991]">Belum ada log asupan cairan.</p>
                        )}
                      </div>
                    </section>
                  </div>
                </>
              )}

              <footer className="flex flex-col justify-between gap-2 py-2 text-[9px] text-[#8b9991] sm:flex-row">
                <span>FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli gizi.</span>
                <span>FitBite © 2026</span>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
