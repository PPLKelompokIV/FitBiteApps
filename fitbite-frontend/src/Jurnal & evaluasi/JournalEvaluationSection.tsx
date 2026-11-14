import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  Footprints,
  Info,
  Sprout,
  X,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";
const USER_ID = 1;

const EMPTY_LOG_BANNER_TEXT =
  "Data hari ini belum lengkap. Silakan catat konsumsi makanan dan aktivitas Anda untuk evaluasi akurat";

type EvaluationRow = {
  komponen: string;
  target: string;
  aktual: string;
  ringkasan: string;
  tone: string;
};

type EvaluationDetail = {
  target_energi_dasar: number;
  kalori_olahraga: number;
  target_energi: number;
  aktual_energi: number;
  target_air_dasar: number;
  bonus_air_olahraga: number;
  target_air: number;
  aktual_air: number;
  jumlah_log_makan: number;
  jumlah_log_aktivitas: number;
  durasi_olahraga: number;
  jumlah_log_air: number;
};

type Evaluation = {
  id_evaluation?: number;
  tanggal_evaluasi: string;
  is_log_kosong?: boolean;
  pesan_state_kosong?: string | null;
  badge_evaluasi_kalori?: string;
  judul_status?: string;
  pesan_apresiasi?: string;
  skor_kepatuhan: number;
  status_energi: string;
  status_tone: string;
  persentase_energi: number;
  tipe_pemicu?: string;
  waktu_evaluasi?: string;
  ringkasan_tabel?: EvaluationRow[];
  detail?: EvaluationDetail;
  saran_korektif?: Array<{ nomor: string; teks: string }>;
};

type FoodLog = {
  id_food_log: number;
  nama_makanan: string;
  slot_makan: string;
  kalori: number;
};

type ActivityLog = {
  id_activity_log: number;
  nama_aktivitas: string;
  durasi_menit: number;
  waktu_mulai: string;
  met: number;
  kalori_terbakar: number;
};

type WaterLog = {
  id_water_log: number;
  waktu: string;
  jumlah_ml: number;
};

type ApiEnvelope<T> = {
  status: string;
  is_log_kosong?: boolean;
  message?: string;
  data: T;
};

type CalendarEntry = {
  status: string;
  status_energi: string;
  skor_kepatuhan: number;
};

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
};

const DEFAULT_DETAIL: EvaluationDetail = {
  target_energi_dasar: 1700,
  kalori_olahraga: 0,
  target_energi: 1700,
  aktual_energi: 0,
  target_air_dasar: 2240,
  bonus_air_olahraga: 0,
  target_air: 2240,
  aktual_air: 0,
  jumlah_log_makan: 0,
  jumlah_log_aktivitas: 0,
  durasi_olahraga: 0,
  jumlah_log_air: 0,
};

const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
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

const localDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatApiError = (body: unknown, fallback: string) => {
  if (
    typeof body === "object" &&
    body !== null &&
    "detail" in body &&
    typeof body.detail === "string"
  ) {
    return body.detail;
  }
  return fallback;
};

const readJson = async <T,>(response: Response, fallback: string): Promise<T> => {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Respons server bukan JSON yang valid.");
  }
  if (!response.ok) {
    throw new Error(formatApiError(body, fallback));
  }
  return body as T;
};

export const JournalEvaluationSection = () => {
  const today = localDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [calendarData, setCalendarData] = useState<Record<string, CalendarEntry>>({});
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [notice, setNotice] = useState("");
  const [calendarReload, setCalendarReload] = useState(0);

  // Floating Toast Notification (Seragam dengan halaman Sidebar lainnya)
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "warning" | "error";
  }>({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  const showToast = (
    title: string,
    message: string,
    type: "success" | "warning" | "error" = "success"
  ) => {
    setToast({ show: true, title, message, type });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const monthYear = visibleMonth.getFullYear();
  const monthNumber = visibleMonth.getMonth() + 1;
  const monthLabel = visibleMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const selectedDateObject = new Date(`${selectedDate}T00:00:00`);
  const selectedDateLabel = selectedDateObject.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const selectedDateShort = selectedDateObject.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(monthYear, monthNumber - 1, 1).getDay();
    const numberOfDays = new Date(monthYear, monthNumber, 0).getDate();
    return [
      ...Array<number | null>(firstWeekday).fill(null),
      ...Array.from({ length: numberOfDays }, (_, index) => index + 1),
    ];
  }, [monthNumber, monthYear]);

  useEffect(() => {
    let active = true;
    setCalendarError("");
    fetch(
      `${API_BASE}/api/evaluations/${USER_ID}/calendar?year=${monthYear}&month=${monthNumber}`
    )
      .then((response) =>
        readJson<ApiEnvelope<Record<string, CalendarEntry>>>(
          response,
          "Gagal memuat kalender evaluasi."
        )
      )
      .then((result) => {
        if (active) setCalendarData(result.data || {});
      })
      .catch((requestError: unknown) => {
        if (active) {
          setCalendarError(
            requestError instanceof Error
              ? requestError.message
              : "Gagal memuat kalender evaluasi."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [calendarReload, monthNumber, monthYear]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    const loadDay = async () => {
      try {
        const [evaluationResponse, foodResponse, activityResponse, waterResponse] =
          await Promise.all([
            fetch(`${API_BASE}/api/evaluations/${USER_ID}/${selectedDate}`),
            fetch(
              `${API_BASE}/api/food-logs/${USER_ID}?tanggal=${selectedDate}`
            ),
            fetch(
              `${API_BASE}/api/activity-logs/${USER_ID}?tanggal=${selectedDate}`
            ),
            fetch(
              `${API_BASE}/api/water-logs/${USER_ID}?tanggal=${selectedDate}`
            ),
          ]);

        let nextEvaluation: Evaluation | null = null;
        if (evaluationResponse.status !== 404) {
          const result = await readJson<ApiEnvelope<Evaluation>>(
            evaluationResponse,
            "Gagal memuat laporan evaluasi."
          );
          // Jika status dari backend adalah "empty" (belum ada record di DB), set null agar tidak crash
          if (result.status !== "empty" && result.data?.id_evaluation) {
            nextEvaluation = result.data;
          }
        }

        const [foodResult, activityResult, waterResult] = await Promise.all([
          readJson<ApiEnvelope<FoodLog[]>>(
            foodResponse,
            "Gagal memuat catatan makanan."
          ),
          readJson<ApiEnvelope<ActivityLog[]>>(
            activityResponse,
            "Gagal memuat catatan aktivitas."
          ),
          readJson<ApiEnvelope<WaterLog[]>>(
            waterResponse,
            "Gagal memuat catatan hidrasi."
          ),
        ]);

        if (active) {
          setEvaluation(nextEvaluation);
          setFoodLogs(foodResult.data || []);
          setActivityLogs(activityResult.data || []);
          setWaterLogs(waterResult.data || []);
        }
      } catch (requestError: unknown) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Gagal memuat catatan harian."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadDay();
    return () => {
      active = false;
    };
  }, [calendarReload, selectedDate]);

  useEffect(() => {
    if (selectedDate !== today) return;
    const refresh = window.setInterval(() => {
      setCalendarReload((current) => current + 1);
    }, 60_000);
    return () => window.clearInterval(refresh);
  }, [selectedDate, today]);

  const handleTriggerEvaluation = async () => {
    setIsTriggering(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`${API_BASE}/api/evaluations/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_user: USER_ID, tanggal: selectedDate }),
      });
      const result = await readJson<
        ApiEnvelope<Evaluation> & { notifikasi?: { pesan: string } }
      >(response, "Gagal membuat evaluasi.");

      setEvaluation(result.data);
      const isKosong =
        Boolean(result.data?.is_log_kosong) ||
        (foodLogs.length === 0 &&
          activityLogs.length === 0 &&
          waterLogs.length === 0);

      const messageText = isKosong
        ? EMPTY_LOG_BANNER_TEXT
        : result.message ??
          result.notifikasi?.pesan ??
          "Evaluasi berhasil disimpan dan notifikasi dibuat.";

      setNotice(messageText);
      showToast(
        isKosong ? "Data Belum Lengkap" : "Evaluasi Malam Tersimpan",
        messageText,
        isKosong ? "warning" : "success"
      );
      setCalendarReload((current) => current + 1);
    } catch (requestError: unknown) {
      const errMsg =
        requestError instanceof Error
          ? requestError.message
          : "Gagal membuat evaluasi.";
      setError(errMsg);
      showToast("Gagal Membuat Evaluasi", errMsg, "error");
    } finally {
      setIsTriggering(false);
    }
  };

  const shiftMonth = (delta: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1)
    );
  };

  const selectCalendarDay = (day: number) => {
    const dateString = localDateString(
      new Date(monthYear, monthNumber - 1, day)
    );
    if (dateString > today) return;
    setSelectedDate(dateString);
    setNotice("");
  };

  const totalFoodCalories = foodLogs.reduce(
    (total, log) => total + Number(log.kalori || 0),
    0
  );
  const totalActivityCalories = activityLogs.reduce(
    (total, log) => total + Number(log.kalori_terbakar || 0),
    0
  );
  const totalActivityMinutes = activityLogs.reduce(
    (total, log) => total + Number(log.durasi_menit || 0),
    0
  );
  const totalWater = waterLogs.reduce(
    (total, log) => total + Number(log.jumlah_ml || 0),
    0
  );

  // Deteksi apakah hari yang dipilih belum memiliki catatan makanan/minuman sama sekali (TC-PBI13-005)
  const isDayLogsEmpty =
    !isLoading &&
    foodLogs.length === 0 &&
    waterLogs.length === 0 &&
    activityLogs.length === 0 &&
    (!evaluation ||
      Boolean(evaluation.is_log_kosong) ||
      (Number(evaluation.detail?.aktual_energi ?? 0) === 0 &&
        Number(evaluation.detail?.aktual_air ?? 0) === 0));

  const safeDetail = evaluation?.detail ?? DEFAULT_DETAIL;
  const safeRows = evaluation?.ringkasan_tabel ?? [];
  const safeSuggestions = evaluation?.saran_korektif ?? [];

  return (
    <main className="relative flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#f6f7f2]">
      {/* Floating Toast Notification Elegan (Seragam dengan Sidebar lainnya) */}
      <aside
        aria-live="polite"
        className={`fixed top-6 right-8 z-50 flex max-w-[420px] items-start gap-3.5 rounded-[14px] border px-4 py-3.5 shadow-[0_8px_24px_rgba(22,118,83,0.14)] transition-all duration-300 ease-out ${
          toast.show
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-4 opacity-0 pointer-events-none scale-95"
        } ${
          toast.type === "success"
            ? "border-[#cce1d8] bg-[#f2f7f4] text-[#167653]"
            : toast.type === "warning"
              ? "border-[#ebd8b7] bg-[#faefd9] text-[#945d1b]"
              : "border-[#e9cdc6] bg-[#fcf0ed] text-[#b15348]"
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
            toast.type === "success"
              ? "bg-[#167653]"
              : toast.type === "warning"
                ? "bg-[#a86c24]"
                : "bg-[#b15348]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.3} />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>

        <div className="flex flex-col pr-2">
          <strong className="text-xs font-bold leading-[18px] text-[#203d32]">
            {toast.title}
          </strong>
          <span className="text-[11px] leading-[16px] text-[#5c6b62]">
            {toast.message}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setToast((prev) => ({ ...prev, show: false }))}
          className="ml-auto -mr-1 -mt-1 rounded-md p-1 text-[#728078] hover:bg-[#e1e7df]/60 hover:text-[#203d32] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </aside>

      <header className="sticky top-0 z-20 flex h-[72px] w-full shrink-0 items-center justify-between border-b border-[#e1e7df] bg-[#f6f7f2] px-9">
        <nav className="inline-flex items-center gap-2" aria-label="Breadcrumb">
          <span className="text-xs text-[#728078]">Ruang sehat</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#728078]" />
          <strong className="text-xs font-semibold text-[#203d32]">
            Jurnal &amp; evaluasi
          </strong>
        </nav>
        <div className="inline-flex items-center gap-4">
          <span className="rounded-full bg-[#e8ece3] px-3 py-1 text-[11px] font-medium text-[#5c6b62]">
            {error
              ? "Tidak tersinkron"
              : isLoading
                ? "Memuat data"
                : "Data tersinkron"}
          </span>
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#e8ece3]"
          >
            <Bell className="h-[18px] w-[18px] text-[#203d32]" />
          </button>
          <div
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#dcebb2]"
            aria-label="Profil"
          >
            <span className="text-[11px] font-bold text-[#203d32]">NP</span>
          </div>
        </div>
      </header>

      <div className="flex w-full flex-col gap-6 px-9 pb-7 pt-[28px]">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-normal leading-10 tracking-[-0.3px] text-[#203d32]">
              Lihat kembali, melangkah lebih sadar.
            </h1>
            <p className="text-[13px] text-[#728078]">
              Evaluasi membaca catatan makanan, aktivitas, dan hidrasi yang sudah
              tersimpan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(today);
                setVisibleMonth(
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                );
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] border border-[#e1e7df] bg-white px-[18px] py-[10px] text-xs font-semibold text-[#167653] hover:bg-[#f4f7f3] cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              Hari ini
            </button>
            <button
              type="button"
              onClick={handleTriggerEvaluation}
              disabled={isLoading || isTriggering || selectedDate > today}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-[10px] bg-[#167653] px-[18px] py-[10px] text-xs font-semibold text-white transition-colors hover:bg-[#125c41] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isTriggering ? "Menyimpan..." : "Hitung & simpan evaluasi"}
            </button>
          </div>
        </div>

        {/* Banner Alert Error */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-[14px] border border-[#e9cdc6] bg-[#fcf0ed] px-4 py-3 text-xs font-medium text-[#b15348]"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Banner Informatif State Kosong (TC-PBI13-005) atau Notifikasi Sukses Simpan */}
        {(isDayLogsEmpty || notice) && (
          <div
            role="status"
            className={`flex w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-3.5 text-xs transition-all ${
              isDayLogsEmpty
                ? "border-[#ebd8b7] bg-[#faefd9] text-[#945d1b]"
                : "border-[#cce1d8] bg-[#eaf3e9] text-[#124b39]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isDayLogsEmpty
                    ? "bg-[#a86c24] text-white"
                    : "bg-[#167653] text-white"
                }`}
              >
                {isDayLogsEmpty ? (
                  <Info className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <strong className="text-xs font-bold">
                  {isDayLogsEmpty
                    ? "Catatan Harian Belum Lengkap"
                    : "Evaluasi Malam Tersimpan"}
                </strong>
                <span className="text-[11px]">
                  {isDayLogsEmpty ? EMPTY_LOG_BANNER_TEXT : notice}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDayLogsEmpty && (
                <a
                  href="/jurnal-makanan"
                  className="shrink-0 rounded-[8px] border border-[#e1e7df] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#167653] hover:bg-[#f8faf7] transition-colors"
                >
                  Catat Makanan →
                </a>
              )}
              {notice && !isDayLogsEmpty && (
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  className="rounded-md p-1 text-[#728078] hover:text-[#203d32]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex w-full items-start gap-6 max-xl:flex-col">
          <aside className="flex w-[328px] shrink-0 flex-col gap-5 max-xl:w-full">
            <Card className="p-5">
              <div className="flex w-full items-center justify-between">
                <h2 className="text-[17px] font-bold text-[#203d32]">
                  {monthLabel}
                </h2>
                <div className="inline-flex items-center gap-2 text-[#167653]">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    aria-label="Bulan sebelumnya"
                    className="rounded p-1 hover:bg-[#eaf3e9] cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    aria-label="Bulan berikutnya"
                    className="rounded p-1 hover:bg-[#eaf3e9] cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid w-full grid-cols-7 gap-[5px]">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                  <div
                    key={day}
                    className="flex h-6 items-center justify-center text-[10px] text-[#728078]"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <span key={`empty-${index}`} className="h-9" />;
                  }
                  const dateString = localDateString(
                    new Date(monthYear, monthNumber - 1, day)
                  );
                  const dayStatus = calendarData[String(day)]?.status;
                  const isSelected = selectedDate === dateString;
                  const isFuture = dateString > today;
                  return (
                    <button
                      type="button"
                      key={day}
                      disabled={isFuture}
                      aria-label={`${day} ${monthLabel}`}
                      aria-pressed={isSelected}
                      onClick={() => selectCalendarDay(day)}
                      className={`relative flex h-9 items-center justify-center rounded-lg text-[11px] font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:text-[#c2c9c1] ${
                        dayStatus && dayClasses[dayStatus]
                          ? `${dayClasses[dayStatus]} after:absolute after:bottom-[5px] after:h-[3px] after:w-[3px] after:rounded-full`
                          : "bg-white text-[#203d32] hover:bg-[#f4f7f3]"
                      } ${isSelected ? "ring-2 ring-[#167653]" : ""}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {calendarError && (
                <p role="alert" className="text-[11px] text-red-700">
                  {calendarError}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {[
                  ["#167653", "Tercapai"],
                  ["#a86c24", "Kurang"],
                  ["#b15348", "Berlebih"],
                ].map(([color, label]) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-[10px] text-[#728078]"
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
                Tanggal tanpa penanda belum memiliki evaluasi tersimpan.
              </p>
            </Card>

            <Card className="p-5">
              <CardHeading title="Hari yang dipilih" />
              <h3 className="-mt-2 text-[20px] font-bold text-[#203d32]">
                {selectedDateLabel}
              </h3>
              <span className="-mt-1 rounded-full bg-[#eaf3e9] px-2.5 py-1 text-[11px] font-semibold text-[#167653]">
                {evaluation ? "Laporan tersimpan" : "Belum ada laporan"}
              </span>
              <div className="flex w-full items-center gap-3 pt-1">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167653]">
                  {evaluation ? (
                    <CheckCircle2 className="h-[19px] w-[19px]" />
                  ) : (
                    <CalendarCheck className="h-[19px] w-[19px]" />
                  )}
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-[#203d32]">
                    {evaluation?.waktu_evaluasi
                      ? `Evaluasi ${evaluation.waktu_evaluasi}`
                      : "Catatan harian"}
                  </h4>
                  <p className="text-[11px] text-[#728078]">
                    {foodLogs.length} makanan • {activityLogs.length} aktivitas
                    • {waterLogs.length} catatan air
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-[#e1e7df]" />
              <p className="text-[11px] leading-[16.5px] text-[#728078]">
                Halaman ini adalah ringkasan, bukan formulir pencatatan. Tambahkan
                log melalui Jurnal makanan atau Aktivitas &amp; hidrasi, lalu
                hitung evaluasinya.
              </p>
            </Card>

            <div className="flex items-start gap-2.5 rounded-[12px] bg-[#eaf3e9] p-3.5">
              <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#167653]" />
              <p className="flex-1 text-[11px] leading-[16.5px] text-[#124b39]">
                Evaluasi otomatis dijalankan server pukul 20.00 WIB. Tombol
                “Hitung &amp; simpan evaluasi” menjalankannya kapan saja.
              </p>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <Card>
              <div className="flex w-full flex-wrap items-start justify-between gap-3">
                <CardHeading
                  title="Evaluasi malam"
                  subtitle={`${selectedDateLabel} • ${
                    evaluation?.waktu_evaluasi ?? "Belum dihitung"
                  }`}
                />
                {evaluation && (
                  <span className="rounded-full bg-[#f0f3ec] px-3 py-1 text-[11px] font-semibold text-[#5c6b62]">
                    {evaluation.tipe_pemicu === "otomatis_20_00"
                      ? "Otomatis 20.00"
                      : "Pemicu manual"}
                  </span>
                )}
              </div>

              {isLoading ? (
                <p className="text-sm text-[#728078]">Memuat catatan harian...</p>
              ) : evaluation ? (
                <>
                  <div className="flex w-full items-center gap-[22px] max-sm:flex-col max-sm:items-start">
                    <div className="flex h-[112px] w-[112px] shrink-0 flex-col items-center justify-center rounded-full bg-[#eaf3e9]">
                      <span className="text-[36px] font-normal leading-[42px] text-[#203d32]">
                        {evaluation.skor_kepatuhan}
                      </span>
                      <span className="mt-0.5 text-[10px] text-[#728078]">
                        dari 100
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          statusClasses[evaluation.status_tone] ??
                          statusClasses.neutral
                        }`}
                      >
                        {evaluation.badge_evaluasi_kalori
                          ? `${evaluation.badge_evaluasi_kalori} • ${evaluation.persentase_energi}% dari target`
                          : `Energi ${evaluation.status_energi} • ${evaluation.persentase_energi}% dari target`}
                      </span>
                      <h3 className="text-[17px] font-bold text-[#203d32]">
                        {evaluation.judul_status ??
                          (evaluation.status_energi === "tercapai"
                            ? "Target Kalori Tercapai Optimal! Capaian energi berada di rentang target."
                            : evaluation.status_energi === "berlebih"
                              ? "Surplus Kalori — Asupan energi melewati target harian."
                              : "Asupan Kurang — Asupan energi masih di bawah target.")}
                      </h3>
                      <p className="text-xs text-[#728078]">
                        {evaluation.pesan_apresiasi ??
                          "Skor merangkum capaian dari log yang tersimpan. Ini bukan nilai kesehatan atau diagnosis."}
                      </p>
                    </div>
                  </div>

                  {safeRows.length > 0 && (
                    <>
                      <div className="h-px w-full bg-[#e1e7df]" />
                      <div className="w-full overflow-x-auto">
                        <div className="min-w-[620px]">
                          <div className="grid grid-cols-[1fr_112px_112px_136px] gap-4 pb-2.5 text-[10px] font-semibold tracking-wider text-[#728078] uppercase">
                            <span>Komponen</span>
                            <span>Target</span>
                            <span>Aktual</span>
                            <span>Ringkasan</span>
                          </div>
                          <div className="flex flex-col divide-y divide-[#edf1eb]">
                            {safeRows.map((row) => (
                              <div
                                key={row.komponen}
                                className="grid grid-cols-[1fr_112px_112px_136px] items-center gap-4 py-3 text-xs"
                              >
                                <strong className="font-semibold text-[#203d32]">
                                  {row.komponen}
                                </strong>
                                <span className="text-[#728078]">
                                  {row.target}
                                </span>
                                <span className="font-medium text-[#203d32]">
                                  {row.aktual}
                                </span>
                                <span
                                  className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                    statusClasses[row.tone] ??
                                    statusClasses.neutral
                                  }`}
                                >
                                  {row.ringkasan}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <p className="text-[10px] leading-[15px] text-[#728078]">
                    Target energi {safeDetail.target_energi_dasar} kkal dasar +{" "}
                    {safeDetail.kalori_olahraga} kkal aktivitas. Target air{" "}
                    {safeDetail.target_air_dasar} ml dasar +{" "}
                    {safeDetail.bonus_air_olahraga} ml bonus aktivitas.
                  </p>
                </>
              ) : (
                <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e1e7df] bg-[#f6f7f2] p-5">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-[#167653]" />
                    <h3 className="text-sm font-semibold text-[#203d32]">
                      Belum ada laporan evaluasi untuk {selectedDateShort}
                    </h3>
                  </div>
                  <p className="text-xs leading-5 text-[#5c6b62]">
                    {isDayLogsEmpty
                      ? EMPTY_LOG_BANNER_TEXT
                      : "Catatan makanan, aktivitas, dan air pada tanggal ini sudah siap dihitung. Klik tombol “Hitung & simpan evaluasi” di kanan atas untuk membuat laporan."}
                  </p>
                </div>
              )}
            </Card>

            <section className="flex flex-col gap-3.5 rounded-[18px] bg-[#124b39] p-6 text-white">
              <header className="flex w-full items-center gap-2.5">
                <Sprout className="h-5 w-5 text-[#a3d9b8]" />
                <h2 className="flex-1 text-[16px] font-medium">
                  Catatan pendamping sehat (Saran Korektif untuk Besok)
                </h2>
                <span className="rounded-full bg-[#eaf3e9] px-3 py-1 text-[11px] font-semibold text-[#167653]">
                  Untuk besok
                </span>
              </header>
              {safeSuggestions.length > 0 ? (
                <div className="flex flex-col gap-2.5 pt-1">
                  {safeSuggestions.map((suggestion) => (
                    <p
                      key={suggestion.nomor}
                      className="text-xs leading-[19px] text-[#e2ede4]"
                    >
                      <span className="mr-2.5 font-semibold text-[#a3d9b8]">
                        {suggestion.nomor}
                      </span>
                      {suggestion.teks}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-[19px] text-[#e2ede4]">
                  {isDayLogsEmpty
                    ? EMPTY_LOG_BANNER_TEXT
                    : "Saran akan muncul setelah laporan evaluasi dibuat."}
                </p>
              )}
              <p className="pt-1 text-[10px] text-[#9ab8a8]">
                Saran kebiasaan umum dari data yang dicatat, bukan anjuran medis
                individual.
              </p>
            </section>

            <div className="flex items-start gap-2.5 rounded-[12px] bg-[#eaf3e9] p-3.5">
              <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#167653]" />
              <p className="flex-1 text-[11px] leading-[16.5px] text-[#124b39]">
                Kelengkapan: {foodLogs.length} log makanan,{" "}
                {activityLogs.length} aktivitas, dan {waterLogs.length} catatan
                air. Laporan hanya mewakili data yang dicatat.
              </p>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-3 gap-5 max-lg:grid-cols-1">
          <Card>
            <CardHeading
              title="Makanan"
              subtitle={`${Math.round(totalFoodCalories).toLocaleString("id-ID")} kkal • ${foodLogs.length} catatan`}
            />
            {foodLogs.length ? (
              <div className="flex w-full flex-col divide-y divide-[#edf1eb]">
                {foodLogs.map((log) => (
                  <div
                    key={log.id_food_log}
                    className="flex w-full items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <h3 className="text-[13px] font-semibold text-[#203d32]">
                        {log.slot_makan}
                      </h3>
                      <p className="text-[11px] text-[#728078]">
                        {log.nama_makanan}
                      </p>
                    </div>
                    <strong className="text-xs text-[#203d32]">
                      {Math.round(log.kalori)} kkal
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#728078]">
                Belum ada catatan makanan pada tanggal ini.{" "}
                <a
                  className="font-semibold text-[#167653] hover:underline"
                  href="/jurnal-makanan"
                >
                  Buka Jurnal makanan
                </a>
                .
              </p>
            )}
          </Card>

          <Card>
            <CardHeading
              title="Aktivitas"
              subtitle={`${totalActivityMinutes} menit • ${Math.round(totalActivityCalories)} kkal`}
            />
            {activityLogs.length ? (
              <div className="flex w-full flex-col divide-y divide-[#edf1eb]">
                {activityLogs.map((log) => (
                  <div
                    key={log.id_activity_log}
                    className="flex w-full items-center gap-3 py-3"
                  >
                    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167653]">
                      <Footprints className="h-[18px] w-[18px]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[13px] font-semibold text-[#203d32]">
                        {log.nama_aktivitas}
                      </h3>
                      <p className="text-[11px] text-[#728078]">
                        {log.waktu_mulai} • {log.durasi_menit} menit •{" "}
                        {log.met.toLocaleString("id-ID")} MET
                      </p>
                    </div>
                    <strong className="text-xs text-[#203d32]">
                      {Math.round(log.kalori_terbakar)} kkal
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#728078]">
                Belum ada aktivitas tersimpan.{" "}
                <a
                  className="font-semibold text-[#167653] hover:underline"
                  href="/aktivitas-hidrasi"
                >
                  Catat aktivitas
                </a>
                .
              </p>
            )}
          </Card>

          <Card>
            <CardHeading
              title="Hidrasi"
              subtitle={`${totalWater.toLocaleString("id-ID")} ml • ${waterLogs.length} catatan`}
            />
            {waterLogs.length ? (
              <div className="flex w-full flex-col divide-y divide-[#edf1eb]">
                {waterLogs.map((log) => (
                  <div
                    key={log.id_water_log}
                    className="flex w-full items-center justify-between gap-3 py-2.5"
                  >
                    <span className="inline-flex items-center gap-2 text-xs text-[#203d32]">
                      <Droplets className="h-4 w-4 text-[#4b8dab]" />
                      {log.waktu}
                    </span>
                    <strong className="text-xs text-[#203d32]">
                      {log.jumlah_ml} ml
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#728078]">
                Belum ada catatan air pada tanggal ini.
              </p>
            )}
          </Card>
        </div>

        <aside className="flex items-start gap-[11px] rounded-[10px] bg-[#eaf3e9] p-3.5 text-xs text-[#124b39]">
          <Activity className="h-[18px] w-[18px] shrink-0 text-[#167653]" />
          <p>
            Catatan makanan dan hidrasi dibaca dari jurnal masing-masing.
            Aktivitas yang disimpan juga menyesuaikan target energi dan bonus air
            olahraga.
          </p>
          <ArrowRight className="hidden h-4 w-4 shrink-0 text-[#167653] sm:block" />
        </aside>
      </div>
    </main>
  );
};