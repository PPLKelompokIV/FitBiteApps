import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Bell,
  Check,
  ChevronDown,
  Target,
  Download,
  Clock,
  BellOff,
  GlassWater,
  CheckCircle2,
  ClipboardCheck,
  LogOut,
  AlertTriangle,
  ArrowRight,
  Loader2,
  X,
  Utensils,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  calculateCalorieTargets,
  sampleCalorieProfile,
} from "../calorieTargets";

type Reminder = {
  key: string;
  title: string;
  description: string;
  time: string;
  hasBorderBottom?: boolean;
};

type NotificationItem = {
  id_notification: number;
  id_user: number;
  kategori: string;
  judul: string;
  pesan: string;
  waktu_kirim: string;
  tautan_tujuan: string;
  sudah_dibaca: boolean;
};

// 6 Pengingat harian FitBite sesuai ERD dan mock UI
const defaultReminders: Reminder[] = [
  {
    key: "body_check",
    title: "Body Check pagi",
    description: "Mulai hari dengan mengenali kondisi tubuh.",
    time: "06.30",
    hasBorderBottom: true,
  },
  {
    key: "sarapan",
    title: "Sarapan",
    description: "Pengingat catat makan pagi.",
    time: "07.30",
  },
  {
    key: "makan_siang",
    title: "Makan siang",
    description: "Beri jeda, nikmati, lalu catat.",
    time: "12.30",
  },
  {
    key: "makan_malam",
    title: "Makan malam",
    description: "Lengkapi jurnal makan harian.",
    time: "18.00",
    hasBorderBottom: true,
  },
  {
    key: "minum_air",
    title: "Minum air",
    description: "Setiap 2 jam, pukul 09.00–21.00.",
    time: "2 jam",
  },
  {
    key: "evaluasi_malam",
    title: "Evaluasi malam",
    description: "Laporan tersedia setiap hari pukul 20.00.",
    time: "20.00",
  },
];

const fallbackNotifications: NotificationItem[] = [
  {
    id_notification: 1,
    id_user: 1,
    kategori: "minum_air",
    judul: "Seteguk lagi sore ini?",
    pesan:
      "Air hari ini 1.750 ml. Pengingat berikutnya pukul 19.00; masih ada 890 ml menuju target.",
    waktu_kirim: "Hari ini • 18.25 WIB",
    tautan_tujuan: "/aktivitas-hidrasi",
    sudah_dibaca: false,
  },
  {
    id_notification: 2,
    id_user: 1,
    kategori: "body_check",
    judul: "Body Check pagi tersimpan",
    pesan: "Target hari ini siap • 19 Okt, 06.48 WIB",
    waktu_kirim: "19 Okt • 06.48 WIB",
    tautan_tujuan: "/body-check-pagi",
    sudah_dibaca: true,
  },
  {
    id_notification: 3,
    id_user: 1,
    kategori: "evaluasi_malam",
    judul: "Evaluasi Minggu siap dilihat",
    pesan: "Lihat kembali kebiasaanmu • 18 Okt, 20.00 WIB",
    waktu_kirim: "18 Okt • 20.00 WIB",
    tautan_tujuan: "/jurnal-evaluasi",
    sudah_dibaca: true,
  },
];

const calorieTargets = calculateCalorieTargets(sampleCalorieProfile);

const profileStats = [
  [
    `Usia • ${sampleCalorieProfile.sex === "female" ? "perempuan" : "laki-laki"}`,
    `${sampleCalorieProfile.age} tahun`,
    "12 April 1998",
  ],
  ["Tinggi badan", `${sampleCalorieProfile.heightCm} cm`, ""],
  ["Berat awal • 5 Okt", "64,8 kg", ""],
  [
    "Berat kini • 19 Okt",
    `${sampleCalorieProfile.weightKg.toLocaleString("id-ID", { minimumFractionDigits: 1 })} kg`,
    "",
  ],
];

const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative flex h-[22px] w-10 shrink-0 items-center rounded-full p-[3px] transition-colors cursor-pointer ${
      checked ? "justify-end bg-[#167653]" : "justify-start bg-[#dce2d9]"
    }`}
  >
    <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
  </button>
);

const SelectField = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) => (
  <label className="flex w-full flex-col items-start gap-[7px]">
    <span className="text-[13px] font-semibold leading-[19.5px] text-[#203d32]">
      {label}
    </span>
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[45px] w-full items-center justify-between gap-2.5 rounded-[10px] border border-[#e1e7df] bg-white px-3.5 py-2.5 text-left hover:border-[#c5d1c2] transition-colors"
    >
      <span className="flex-1 text-sm leading-[21px] text-[#203d32]">
        {value}
      </span>
      <ChevronDown className="h-4 w-4 text-[#728078]" />
    </button>
  </label>
);

const Card = ({
  title,
  subtitle,
  headerAction,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`flex w-full flex-col items-start gap-[18px] rounded-[18px] border border-[#e1e7df] bg-white p-[24px] ${className}`}
  >
    <div className="flex w-full items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[17px] font-bold leading-[25px] text-[#203d32]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs leading-[18px] text-[#728078]">{subtitle}</p>
        )}
      </div>
      {headerAction}
    </div>
    {children}
  </section>
);

export const ProfileAndReminderSettingsSection = () => {
  const navigate = useNavigate();
  const bellDropdownRef = useRef<HTMLDivElement | null>(null);
  const triggeredRemindersRef = useRef<Set<string>>(new Set());

  const [personalization, setPersonalization] = useState(true);
  const [foodPhotos, setFoodPhotos] = useState(false);
  const [remindersList, setRemindersList] = useState<Reminder[]>(defaultReminders);
  const [enabledReminders, setEnabledReminders] = useState<boolean[]>(
    defaultReminders.map(() => true)
  );
  const [browserPermission, setBrowserPermission] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Suara Notifikasi (Soundtrack)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Fungsi memutar soundtrack notifikasi (nada denting lembut 2 ketukan)
  const playNotificationSound = (forcePlay = false) => {
    if (!forcePlay && !soundEnabledRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const notes = [
        { freq: 587.33, start: 0, duration: 0.28 },    // Nada D5
        { freq: 880.0, start: 0.14, duration: 0.45 },    // Nada A5
      ];

      notes.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + start);

        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.24, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    } catch (err) {
      console.warn("Audio notifikasi tidak dapat diputar:", err);
    }
  };

  // State Notifikasi In-App (FIT-53, FIT-54, FIT-55, FIT-56)
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    fallbackNotifications
  );
  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState(false);

  // Hitung otomatis jumlah notifikasi yang belum dibaca (sudah_dibaca === false)
  const unreadCount = notifications.filter((n) => !n.sudah_dibaca).length;

  // State untuk Toast Notification Elegan
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  const showToastMsg = (
    title: string,
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // 1. Cek izin notifikasi browser secara otomatis saat halaman dibuka
  useEffect(() => {
    if ("Notification" in window) {
      setBrowserPermission(Notification.permission === "granted");
    }
  }, []);

  // Tutup dropdown lonceng saat klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bellDropdownRef.current &&
        !bellDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBellDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Ambil data konfigurasi jadwal dari database PostgreSQL via FastAPI
  useEffect(() => {
    const fetchSavedReminders = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/reminders/1");
        const resData = await response.json();

        const dataList = Array.isArray(resData) ? resData : resData.data || [];

        if (response.ok && Array.isArray(dataList) && dataList.length > 0) {
          setRemindersList((prevList) =>
            prevList.map((item) => {
              const matched = dataList.find(
                (d: { jenis_pengingat: string }) =>
                  d.jenis_pengingat === item.key
              );
              return matched ? { ...item, time: matched.waktu_jadwal } : item;
            })
          );

          setEnabledReminders(
            defaultReminders.map((item) => {
              const matched = dataList.find(
                (d: { jenis_pengingat: string }) =>
                  d.jenis_pengingat === item.key
              );
              return matched !== undefined ? Boolean(matched.status_aktif) : true;
            })
          );
        }
      } catch (err) {
        console.error("Gagal memuat jadwal dari database:", err);
      }
    };

    fetchSavedReminders();
  }, []);

  // 3. FIT-55: Ambil daftar notifikasi dari endpoint GET /api/notifications/1
  const fetchNotifications = async (autoSeed = true) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/notifications/1?auto_seed=${autoSeed}`
      );
      if (response.ok) {
        const resData = await response.json();
        if (Array.isArray(resData.data)) {
          setNotifications(resData.data);
        }
      }
    } catch (err) {
      console.warn("Menggunakan data notifikasi lokal:", err);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  // 4. Scheduler Real-Time dengan proteksi anti-duplikat & pemutar soundtrack notifikasi
  useEffect(() => {
    const checkReminderSchedule = async () => {
      const now = new Date();
      const currentHH = String(now.getHours()).padStart(2, "0");
      const currentMM = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHH}:${currentMM}`;
      const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      for (let i = 0; i < remindersList.length; i++) {
        if (!enabledReminders[i]) continue;

        const item = remindersList[i];
        const normalizedSchedule = item.time.trim().replace(".", ":");

        if (normalizedSchedule === currentTimeStr) {
          const triggerKey = `${item.key}-${currentTimeStr}-${dateStamp}`;
          const storageKey = `fitbite_triggered_${triggerKey}`;

          if (
            triggeredRemindersRef.current.has(triggerKey) ||
            localStorage.getItem(storageKey) === "true"
          ) {
            continue;
          }

          triggeredRemindersRef.current.add(triggerKey);
          localStorage.setItem(storageKey, "true");

          try {
            const response = await fetch(
              "http://127.0.0.1:8000/api/notifications/trigger",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_user: 1,
                  kategori: item.key,
                  waktu_jadwal: item.time,
                }),
              }
            );

            if (response.ok) {
              const resData = await response.json();
              if (Array.isArray(resData.data)) {
                setNotifications(resData.data);
              }
              playNotificationSound();
              showToastMsg(
                `Pengingat: ${item.title}`,
                `Sudah pukul ${item.time} WIB. Cek ikon lonceng untuk mencatat logmu!`,
                "success"
              );
            }
          } catch (err) {
            console.error("Gagal memicu notifikasi jadwal:", err);
          }
        }
      }
    };

    checkReminderSchedule();
    const intervalId = setInterval(checkReminderSchedule, 3000);
    return () => clearInterval(intervalId);
  }, [remindersList, enabledReminders]);

  // FIT-55 & FIT-56: Tandai 1 notifikasi sudah dibaca (PATCH) & arahkan (redirect) ke halaman log terkait
  const handleNotificationClick = async (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id_notification === item.id_notification
          ? { ...n, sudah_dibaca: true }
          : n
      )
    );

    try {
      await fetch(
        `http://127.0.0.1:8000/api/notifications/${item.id_notification}/read`,
        {
          method: "PATCH",
        }
      );
    } catch (err) {
      console.warn("Gagal update status baca ke server:", err);
    }

    setIsBellDropdownOpen(false);
    if (item.tautan_tujuan) {
      navigate(item.tautan_tujuan);
    }
  };

  // FIT-55: Tandai semua notifikasi telah dibaca (PATCH /read-all)
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, sudah_dibaca: true }))
    );

    try {
      await fetch("http://127.0.0.1:8000/api/notifications/user/1/read-all", {
        method: "PATCH",
      });
    } catch (err) {
      console.warn("Gagal menandai semua dibaca di server:", err);
    }

    showToastMsg(
      "Notifikasi Diperbarui",
      "Semua pemberitahuan telah ditandai sudah dibaca.",
      "success"
    );
  };

  // Helper untuk mengosongkan daftar notifikasi (pengujian Empty State FIT-53)
  const handleClearNotifications = async () => {
    setNotifications([]);
    try {
      await fetch("http://127.0.0.1:8000/api/notifications/user/1/clear", {
        method: "DELETE",
      });
    } catch {
      // Abaikan jika offline
    }
  };

  // Helper untuk mereset notifikasi bawaan sekaligus membersihkan flag trigger lokal
  const handleResetNotifications = async () => {
    triggeredRemindersRef.current.clear();
    Object.keys(localStorage)
      .filter((key) => key.startsWith("fitbite_triggered_"))
      .forEach((key) => localStorage.removeItem(key));

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/notifications/user/1/reset",
        {
          method: "POST",
        }
      );
      if (res.ok) {
        const resData = await res.json();
        setNotifications(resData.data || fallbackNotifications);
        return;
      }
    } catch {
      // Fallback
    }
    setNotifications(fallbackNotifications);
  };

  // Helper ikon berdasarkan kategori notifikasi
  const renderNotificationIcon = (kategori: string) => {
    switch (kategori) {
      case "minum_air":
        return <GlassWater className="h-[18px] w-[18px]" />;
      case "body_check":
        return <CheckCircle2 className="h-[18px] w-[18px]" />;
      case "evaluasi_malam":
        return <ClipboardCheck className="h-[18px] w-[18px]" />;
      default:
        return <Utensils className="h-[18px] w-[18px]" />;
    }
  };

  const toggleReminder = (index: number) => {
    setEnabledReminders((current) =>
      current.map((enabled, itemIndex) =>
        itemIndex === index ? !enabled : enabled
      )
    );
  };

  const handleDirectTimeChange = (index: number, newTime: string) => {
    setRemindersList((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, time: newTime } : item
      )
    );
  };

  // FIT-51 & FIT-52: Simpan jadwal ke FastAPI dan tampilkan Toast elegan
  const handleSimpanPengaturan = async () => {
    setLoading(true);
    try {
      const payloadJadwal = remindersList.map((item, index) => ({
        jenis_pengingat: item.key,
        waktu_jadwal: item.time,
        saluran: "in_app",
        status_aktif: enabledReminders[index],
      }));

      const response = await fetch("http://127.0.0.1:8000/api/reminders/save", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_user: 1,
          jadwal: payloadJadwal,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorDetail =
          result.detail?.[0]?.msg ||
          result.detail ||
          "Format waktu atau interval tidak valid.";
        showToastMsg("Gagal Menyimpan", String(errorDetail), "error");
        return;
      }

      setSaved(true);
      showToastMsg(
        "Pengaturan Tersimpan",
        "Jadwal pengingat harianmu berhasil diperbarui ke sistem.",
        "success"
      );
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error("Gagal koneksi ke server backend:", err);
      showToastMsg(
        "Koneksi Gagal",
        "Tidak dapat terhubung ke server FastAPI (port 8000).",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const enableNotifications = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setBrowserPermission(permission === "granted");
      });
    } else {
      setBrowserPermission(true);
    }
  };

  return (
    <div className="relative flex h-screen min-h-0 flex-1 flex-col justify-between overflow-y-auto bg-[#f6f7f2]">
      {/* Toast Notification Elegan - FitBite Theme */}
      <aside
        aria-live="polite"
        className={`fixed top-6 right-8 z-50 flex items-start gap-3.5 rounded-[14px] border px-4 py-3.5 shadow-[0_8px_24px_rgba(22,118,83,0.12)] transition-all duration-300 ease-out ${
          toast.show
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-4 opacity-0 pointer-events-none scale-95"
        } ${
          toast.type === "success"
            ? "border-[#cce1d8] bg-[#f2f7f4] text-[#167653]"
            : "border-[#e9cdc6] bg-[#fcf0ed] text-[#b15348]"
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            toast.type === "success"
              ? "bg-[#167653] text-white"
              : "bg-[#b15348] text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.3} />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>

        <div className="flex flex-col pr-3">
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

      <div className="w-full">
        {/* Top Header dengan Ikon Lonceng, Badge Counter & Dropdown Notifikasi (FIT-54) */}
        <header className="sticky top-0 z-30 flex h-[72px] w-full shrink-0 items-center justify-between border-b border-[#e1e7df] bg-[#f6f7f2] px-9">
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2">
            <span className="text-xs leading-[18px] text-[#728078]">
              Ruang sehat
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#728078]" />
            <strong className="text-xs font-semibold leading-[18px] text-[#203d32]">
              Profil &amp; pengingat
            </strong>
          </nav>

          <div className="inline-flex items-center gap-4">
            <span className="rounded-full bg-[#e8ece3] px-3 py-1 text-[11px] font-medium leading-[16.5px] text-[#5c6b62]">
              Data contoh
            </span>

            {/* Container Ikon Lonceng & Dropdown In-App Notification (FIT-54) */}
            <div ref={bellDropdownRef} className="relative">
              <button
                type="button"
                aria-label="Notifikasi"
                aria-expanded={isBellDropdownOpen}
                onClick={() => setIsBellDropdownOpen((prev) => !prev)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#e8ece3] transition-colors cursor-pointer"
              >
                <Bell className="h-[18px] w-[18px] text-[#203d32]" />
                {unreadCount > 0 && (
                  <span
                    data-testid="notification-badge"
                    className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#167653] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#f6f7f2]"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Daftar In-App Notification (FIT-54, FIT-55, FIT-56) */}
              {isBellDropdownOpen && (
                <div
                  role="region"
                  aria-label="Dropdown daftar notifikasi"
                  className="absolute right-0 top-[46px] z-50 flex w-[370px] flex-col gap-3 rounded-[16px] border border-[#e1e7df] bg-white p-4 shadow-[0_12px_32px_rgba(32,61,50,0.14)]"
                >
                  <div className="flex items-center justify-between border-b border-[#edf1eb] pb-2.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#203d32]">
                        Notifikasi
                      </h3>
                      <span className="rounded-full bg-[#eaf3e9] px-2 py-0.5 text-[10px] font-semibold text-[#167653]">
                        {unreadCount} belum dibaca
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Tombol Toggle Suara & Tes Soundtrack */}
                      <button
                        type="button"
                        onClick={() => {
                          const next = !soundEnabled;
                          setSoundEnabled(next);
                          if (next) playNotificationSound(true);
                        }}
                        title={
                          soundEnabled
                            ? "Suara notifikasi aktif (klik untuk bisukan)"
                            : "Suara notifikasi dibisukan (klik untuk aktifkan)"
                        }
                        className="rounded-md p-1 text-[#167653] hover:bg-[#eaf3e9] transition-colors cursor-pointer"
                      >
                        {soundEnabled ? (
                          <Volume2 className="h-3.5 w-3.5" />
                        ) : (
                          <VolumeX className="h-3.5 w-3.5 text-[#728078]" />
                        )}
                      </button>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-semibold text-[#167653] hover:underline cursor-pointer"
                        >
                          Tandai Semua Telah Dibaca
                        </button>
                      )}
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                      <BellOff className="h-6 w-6 text-[#728078]" />
                      <p className="text-xs font-semibold text-[#203d32]">
                        Daftar notifikasi masih kosong
                      </p>
                      <p className="text-[11px] text-[#728078]">
                        Belum ada riwayat pemberitahuan untuk saat ini.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetNotifications}
                        className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[#eaf3e9] px-3 py-1.5 text-[11px] font-semibold text-[#167653] hover:bg-[#dcebb2] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Muat ulang contoh</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-0.5">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id_notification}
                          type="button"
                          onClick={() => handleNotificationClick(notif)}
                          className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors cursor-pointer ${
                            !notif.sudah_dibaca
                              ? "bg-[#eaf3e9] hover:bg-[#dfeee0]"
                              : "bg-white hover:bg-[#f6f7f2]"
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#167653] shadow-2xs">
                            {renderNotificationIcon(notif.kategori)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#203d32]">
                              {notif.judul}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-[15px] text-[#5c6b62]">
                              {notif.pesan}
                            </p>
                            <p className="mt-1 text-[10px] text-[#728078]">
                              {notif.waktu_kirim}
                            </p>
                          </div>
                          {!notif.sudah_dibaca && (
                            <span
                              aria-label="Belum dibaca"
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#167653]"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-[#edf1eb] pt-2 text-[10px] text-[#728078]">
                    <span>Klik item untuk menuju halaman log</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => playNotificationSound(true)}
                        className="inline-flex items-center gap-1 font-medium text-[#167653] hover:underline cursor-pointer"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Tes suara</span>
                      </button>
                      {notifications.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleClearNotifications}
                          className="inline-flex items-center gap-1 text-[#b15348] hover:underline cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Kosongkan</span>
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleResetNotifications}
                        className="inline-flex items-center gap-1 text-[#167653] hover:underline cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#dcebb2]">
              <span className="text-[11px] font-bold text-[#203d32]">NP</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex w-full flex-col items-start gap-6 px-9 pb-7 pt-[28px]">
          {/* Judul & Tombol Simpan */}
          <div className="flex w-full items-center justify-between gap-6">
            <div>
              <h1 className="text-[32px] font-normal leading-[40px] tracking-[-0.3px] text-[#203d32]">
                Sehat dengan ritmemu sendiri.
              </h1>
              <p className="mt-1 text-[13px] leading-[19.5px] text-[#728078]">
                Atur profil, pengingat, dan kendali atas data pribadimu.
              </p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleSimpanPengaturan}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[10px] bg-[#167653] hover:bg-[#126244] disabled:opacity-60 px-[18px] py-[10px] text-white transition-colors cursor-pointer shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              )}
              <span className="text-xs font-semibold leading-[18px]">
                {loading
                  ? "Menyimpan..."
                  : saved
                  ? "Pengaturan tersimpan"
                  : "Simpan pengaturan"}
              </span>
            </button>
          </div>

          {/* 2 Kolom Utama */}
          <div className="flex w-full items-start gap-6">
            {/* Kolom Kiri: Profil & Privasi */}
            <div className="flex w-[380px] shrink-0 flex-col gap-5">
              {/* Kartu 1: Akun & profil tubuh */}
              <Card
                title="Akun & profil tubuh"
                headerAction={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#167653] hover:underline"
                  >
                    <span>Edit profil</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                }
              >
                <div className="flex w-full items-center gap-3.5">
                  <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#dcebb2]">
                    <span className="text-lg font-bold text-[#203d32]">NP</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold leading-[24px] text-[#203d32]">
                      Nadia Putri
                    </h3>
                    <p className="text-[11px] leading-[16.5px] text-[#728078]">
                      Bergabung 5 Oktober 2026
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between pt-1">
                  <div>
                    <h3 className="text-xs font-semibold leading-[18px] text-[#203d32]">
                      Email
                    </h3>
                    <p className="text-[11px] leading-[16.5px] text-[#728078]">
                      nadia.putri@email.com
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#167653] hover:underline"
                  >
                    Ubah
                  </button>
                </div>

                <div className="h-px w-full bg-[#e1e7df]" />

                <div className="grid w-full grid-cols-2 gap-y-4 gap-x-5">
                  {profileStats.map(([label, value, detail]) => (
                    <div key={label}>
                      <p className="text-[10px] leading-[15px] text-[#728078]">
                        {label}
                      </p>
                      <strong className="block text-[17px] font-bold leading-[24px] text-[#203d32] mt-0.5">
                        {value}
                      </strong>
                      {detail && (
                        <p className="text-[10px] leading-[14px] text-[#728078]">
                          {detail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-[10px] leading-[15px] text-[#728078]">
                  Berat terkini mengikuti Body Check terakhir.
                </p>
              </Card>

              {/* Kartu 2: Tujuan kesehatan */}
              <Card title="Tujuan kesehatan">
                <SelectField
                  label="Tujuan utama"
                  value="Turunkan berat badan"
                />

                <label className="flex w-full flex-col gap-[7px]">
                  <span className="text-[13px] font-semibold leading-[19.5px] text-[#203d32]">
                    Target berat
                  </span>
                  <span className="flex min-h-[45px] items-center rounded-[10px] border border-[#e1e7df] bg-white px-3.5 focus-within:border-[#167653]">
                    <input
                      aria-label="Target berat"
                      defaultValue="60,0"
                      className="w-full bg-transparent text-sm text-[#203d32] outline-none"
                    />
                    <span className="text-xs text-[#728078]">kg</span>
                  </span>
                </label>

                <SelectField
                  label="Aktivitas rutin"
                  value="Ringan • 1–3 hari/minggu"
                />

                <div
                  aria-label="Hasil estimasi kebutuhan kalori harian"
                  className="grid w-full grid-cols-3 gap-2"
                >
                  {[
                    ["BMR", calorieTargets.bmr],
                    ["TDEE", calorieTargets.tdee],
                    ["Sasaran kalori", calorieTargets.calorieTarget],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="min-w-0 rounded-[10px] bg-[#f0f3ec] p-2.5"
                    >
                      <p className="text-[10px] leading-[15px] text-[#728078]">
                        {label}
                      </p>
                      <strong className="mt-1 block text-sm font-bold text-[#203d32]">
                        {Number(value).toLocaleString("id-ID")}
                      </strong>
                      <span className="text-[10px] text-[#728078]">
                        kkal/hari
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] leading-[15px] text-[#728078]">
                  Estimasi Mifflin-St Jeor. Sasaran turun berat memakai defisit
                  15% dari TDEE; kebutuhan tiap orang dapat berbeda.
                </p>

                <div className="flex w-full items-start gap-2.5 rounded-[12px] bg-[#eaf3e9] p-3.5">
                  <Target className="h-4 w-4 shrink-0 text-[#167653] mt-0.5" />
                  <p className="flex-1 text-[11px] leading-[16.5px] text-[#124b39]">
                    Sasaran kalori harianmu sekitar{" "}
                    <strong>
                      {calorieTargets.calorieTarget.toLocaleString("id-ID")} kkal
                    </strong>
                    .
                  </p>
                </div>
              </Card>

              {/* Kartu 3: Privasi dalam kendalimu */}
              <Card title="Privasi dalam kendalimu">
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-[13px] font-semibold leading-[19px] text-[#203d32]">
                        Personalisasi target
                      </h3>
                      <p className="text-[11px] leading-[16px] text-[#728078]">
                        Gunakan profil dan Body Check untuk estimasi.
                      </p>
                    </div>
                    <Toggle
                      checked={personalization}
                      onChange={() => setPersonalization(!personalization)}
                      label="Personalisasi target"
                    />
                  </div>

                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-[13px] font-semibold leading-[19px] text-[#203d32]">
                        Simpan foto makanan
                      </h3>
                      <p className="text-[11px] leading-[16px] text-[#728078]">
                        Nonaktif: foto tidak disimpan setelah ditinjau.
                      </p>
                    </div>
                    <Toggle
                      checked={foodPhotos}
                      onChange={() => setFoodPhotos(!foodPhotos)}
                      label="Simpan foto makanan"
                    />
                  </div>
                </div>

                <div className="h-px w-full bg-[#e1e7df]" />

                <p className="text-[11px] leading-[16.5px] text-[#728078]">
                  Administrator tidak dapat melihat berat, riwayat kesehatan,
                  foto, maupun jurnalmu.
                </p>

                <button
                  type="button"
                  className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#e1e7df] bg-white hover:bg-[#f4f7f3] text-xs font-semibold text-[#167653] transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh data saya</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#167653] hover:underline"
                >
                  <span>Baca kebijakan privasi</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </Card>
            </div>

            {/* Kolom Kanan: Pengingat & Notifikasi (PBI-11 / FIT-49 & PBI-12 / FIT-53) */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              {/* Kartu 4: Pengingat yang mendukungmu (FIT-49) */}
              <Card
                title="Pengingat yang mendukungmu"
                subtitle="Waktu Indonesia Barat (WIB) • Atur sesuai rutinitasmu."
              >
                <div className="flex w-full flex-col">
                  {remindersList.map((reminder, index) => (
                    <React.Fragment key={reminder.title}>
                      <div className="flex w-full items-center gap-4 py-2.5 first:pt-0 last:pb-0">
                        <div className="flex-1">
                          <h3 className="text-[13px] font-semibold leading-[19px] text-[#203d32]">
                            {reminder.title}
                          </h3>
                          <p className="text-[11px] leading-[16px] text-[#728078]">
                            {reminder.description}
                          </p>
                        </div>

                        {/* Input Waktu/Interval Inline Langsung di Kolom */}
                        <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e1e7df] bg-white px-2.5 py-1 text-xs font-medium text-[#203d32] focus-within:border-[#167653] focus-within:ring-1 focus-within:ring-[#167653] transition-colors shadow-2xs">
                          <input
                            type="text"
                            value={reminder.time}
                            onChange={(e) =>
                              handleDirectTimeChange(index, e.target.value)
                            }
                            aria-label={`Waktu ${reminder.title}`}
                            className="w-[50px] bg-transparent text-center text-xs font-medium text-[#203d32] outline-none"
                            placeholder={
                              reminder.key === "minum_air" ? "2 jam" : "07.00"
                            }
                          />
                          <Clock className="h-3.5 w-3.5 text-[#728078] shrink-0" />
                        </div>

                        {/* Toggle Aktif/Nonaktif */}
                        <Toggle
                          checked={enabledReminders[index]}
                          onChange={() => toggleReminder(index)}
                          label={`${reminder.title} aktif`}
                        />
                      </div>

                      {reminder.hasBorderBottom && (
                        <div className="my-1.5 h-px w-full bg-[#edf1eb]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {!browserPermission && (
                  <div className="flex w-full flex-col gap-2.5 rounded-xl bg-[#faefd9] p-4 mt-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <BellOff className="h-4 w-4 shrink-0 text-[#a86c24] mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-[#945d1b]">
                            Notifikasi browser belum diizinkan
                          </p>
                          <p className="text-[11px] text-[#a86c24]">
                            Pengingat dalam aplikasi tetap aktif.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={enableNotifications}
                        className="min-h-[36px] shrink-0 rounded-[8px] border border-[#e1e7df] bg-white px-4 text-xs font-semibold text-[#167653] hover:bg-[#f8faf7] transition-colors"
                      >
                        Aktifkan
                      </button>
                    </div>
                    <p className="text-[10px] leading-[14.5px] text-[#a86c24]">
                      Izin mengikuti pengaturan browser. Saat ditolak, buka
                      daftar notifikasi di bawah atau ikon lonceng untuk melihat
                      pengingat.
                    </p>
                  </div>
                )}
              </Card>

              {/* Kartu 5: Notifikasi dalam aplikasi (FIT-53, FIT-55, FIT-56) */}
              <Card
                title="Notifikasi dalam aplikasi"
                subtitle={`${unreadCount} belum dibaca`}
                headerAction={
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#167653] hover:underline mt-1 cursor-pointer"
                  >
                    <span>Tandai semua dibaca</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                }
              >
                {notifications.length === 0 ? (
                  <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#e1e7df] bg-[#f8faf6] py-6 text-center">
                    <p className="text-xs font-semibold text-[#203d32]">
                      Daftar notifikasi masih kosong
                    </p>
                    <p className="text-[11px] text-[#728078]">
                      Belum ada riwayat pemberitahuan pengingat hari ini.
                    </p>
                  </div>
                ) : (
                  <div className="flex w-full flex-col gap-3">
                    {notifications.map((notif) =>
                      !notif.sudah_dibaca ? (
                        /* Notifikasi Belum Dibaca */
                        <button
                          key={notif.id_notification}
                          type="button"
                          onClick={() => handleNotificationClick(notif)}
                          className="flex w-full items-start gap-3.5 rounded-xl bg-[#eaf3e9] p-4 text-left hover:bg-[#dfeee0] transition-colors cursor-pointer"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#167653]">
                            {renderNotificationIcon(notif.kategori)}
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold text-[#203d32]">
                              {notif.judul}
                            </p>
                            <p className="text-[11px] leading-[16.5px] text-[#5c6b62] mt-0.5">
                              {notif.pesan}
                            </p>
                            <p className="text-[10px] text-[#728078] mt-1">
                              {notif.waktu_kirim}
                            </p>
                          </div>
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#167653] mt-1.5" />
                        </button>
                      ) : (
                        /* Notifikasi Sudah Dibaca */
                        <button
                          key={notif.id_notification}
                          type="button"
                          onClick={() => handleNotificationClick(notif)}
                          className="flex w-full items-center gap-3.5 rounded-xl border border-transparent p-2 text-left hover:border-[#e1e7df] hover:bg-[#f8faf6] transition-colors cursor-pointer"
                        >
                          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167653]">
                            {renderNotificationIcon(notif.kategori)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[13px] font-semibold text-[#203d32]">
                              {notif.judul}
                            </h3>
                            <p className="text-[11px] text-[#728078]">
                              {notif.pesan}
                            </p>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsBellDropdownOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#167653] hover:underline cursor-pointer"
                >
                  <span>Lihat semua notifikasi</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </Card>

              {/* Kartu 6: Selesai untuk sekarang? */}
              <div className="flex w-full items-center justify-between rounded-[18px] border border-[#e1e7df] bg-white px-6 py-4">
                <div>
                  <p className="text-[13px] font-semibold text-[#203d32]">
                    Selesai untuk sekarang?
                  </p>
                  <p className="text-[11px] text-[#728078]">
                    Keluar tidak menghapus catatanmu.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-[10px] border border-[#e1e7df] bg-white hover:bg-[#f4f7f3] px-4 text-xs font-semibold text-[#167653] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Zona Bahaya: Hapus Akun */}
          <section className="flex w-full flex-col gap-4 rounded-[18px] border border-[#e9cdc6] bg-[#fcf0ed] p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-[#b15348] mt-0.5" />
              <div className="flex-1">
                <h2 className="text-[15px] font-bold text-[#b15348]">
                  Hapus akun secara permanen
                </h2>
                <p className="text-xs leading-[18px] text-[#b15348] mt-0.5">
                  Profil, jurnal, dan riwayatmu akan dihapus. Tindakan ini tidak
                  dapat dibatalkan. Unduh data yang ingin kamu simpan terlebih
                  dahulu.
                </p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#b15348]">
                Perlu konfirmasi
              </span>
            </div>

            <div className="flex flex-wrap items-end gap-4 pt-1">
              <label className="flex w-full max-w-[440px] flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#203d32]">
                  Ketik HAPUS AKUN untuk mengonfirmasi
                </span>
                <input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="Ketik frasa konfirmasi di sini"
                  className="min-h-[42px] rounded-[10px] border border-[#e1e7df] bg-white px-3.5 text-xs text-[#203d32] outline-none focus:border-[#b15348]"
                />
              </label>

              <p className="flex-1 min-w-[200px] text-[10px] leading-[14px] text-[#b15348] pb-1.5">
                Belum ada penghapusan dilakukan. Aksi permanen hanya dilanjutkan
                setelah frasa cocok.
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmation("")}
                  className="min-h-[40px] rounded-[10px] border border-[#e1e7df] bg-white hover:bg-gray-50 px-4 text-xs font-semibold text-[#167653] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={confirmation !== "HAPUS AKUN"}
                  className="min-h-[40px] rounded-[10px] border border-[#ebcfc9] bg-white px-4 text-xs font-semibold text-[#b15348] disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[#fae3de] transition-colors"
                >
                  Hapus akun permanen
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex w-full items-center justify-between px-9 pb-6 pt-2 text-[10px] leading-[15px] text-[#728078]">
        <p>
          FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli
          gizi.
        </p>
        <span>FitBite © 2026</span>
      </footer>
    </div>
  );
};