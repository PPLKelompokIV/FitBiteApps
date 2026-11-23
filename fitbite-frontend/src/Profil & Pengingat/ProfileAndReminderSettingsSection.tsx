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
  getAuthUser,
  getAuthUserInitials,
  getAuthUserName,
} from "../utils/auth";
import { subscribeBrowserPush } from "../utils/webPush";
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

// Lokasi file audio di dalam folder fitbite-frontend/public/notification.mp3
const SOUNDTRACK_PATH = "/notification.mp3";

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
    tautan_tujuan: "/bodycheckpagi",
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
  const authUser = getAuthUser();
  const activeUserId = (
    authUser as { id_user?: number | string } | null
  )?.id_user;
  const userInitials = getAuthUserInitials(authUser);
  const bellDropdownRef = useRef<HTMLDivElement | null>(null);
  const triggeredRemindersRef = useRef<Set<string>>(new Set());
  const reminderCheckInFlightRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [personalization, setPersonalization] = useState(true);
  const [foodPhotos, setFoodPhotos] = useState(false);
  const [remindersList, setRemindersList] = useState<Reminder[]>(defaultReminders);
  const [enabledReminders, setEnabledReminders] = useState<boolean[]>(
    defaultReminders.map(() => true)
  );
  const [remindersLoaded, setRemindersLoaded] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(false);
  const [browserPermissionStatus, setBrowserPermissionStatus] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [pushLoading, setPushLoading] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Suara Notifikasi (Soundtrack Custom)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Fungsi memutar file soundtrack dari folder public/notification.mp3
  const playNotificationSound = (forcePlay = false) => {
    if (!forcePlay && !soundEnabledRef.current) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUNDTRACK_PATH);
      }

      // Reset ke awal agar bisa diputar ulang dengan cepat saat diklik berkali-kali
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;

      audioRef.current.play().catch((err) => {
        console.warn(
          "Gagal memutar file /notification.mp3, pastikan file sudah ada di folder public/:",
          err
        );
        showToastMsg(
          "Suara tidak dapat diputar",
          "Coba aktifkan suara browser dan gunakan tombol Tes suara.",
          "error"
        );
      });
    } catch (err) {
      console.warn("Audio notifikasi tidak dapat diputar:", err);
      showToastMsg(
        "Suara tidak dapat diputar",
        "Coba aktifkan suara browser dan gunakan tombol Tes suara.",
        "error"
      );
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

  // 1. FIT-173: Cek izin notifikasi browser & sinkronkan Service Worker + Web Push otomatis
  useEffect(() => {
    if (!("Notification" in window)) {
      setBrowserPermissionStatus("unsupported");
      return;
    }

    const permission = Notification.permission;
    setBrowserPermissionStatus(permission);
    setBrowserPermission(permission === "granted");

    if (permission === "granted") {
      subscribeBrowserPush(activeUserId, authUser?.email)
        .then((res) => {
          setBrowserPermissionStatus(res.permission);
          setBrowserPermission(res.ok);
        })
        .catch((err) =>
          console.warn("Sinkronisasi Service Worker Web Push dilewati:", err)
        );
    }
  }, [activeUserId, authUser?.email]);

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
      } finally {
        setRemindersLoaded(true);
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

  // 4. Scheduler Real-Time saat tab terbuka dengan proteksi anti-duplikat & soundtrack
  useEffect(() => {
    if (!remindersLoaded) return;

    const checkReminderSchedule = async () => {
      if (reminderCheckInFlightRef.current) return;
      reminderCheckInFlightRef.current = true;

      try {
        const now = new Date();
        const currentHH = String(now.getHours()).padStart(2, "0");
        const currentMM = String(now.getMinutes()).padStart(2, "0");
        const currentTimeStr = `${currentHH}:${currentMM}`;
        const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const lastCheckKey = `fitbite_reminder_last_check_${dateStamp}`;
        const previousCheckTime = Number(localStorage.getItem(lastCheckKey)) || 0;
        let requestFailed = false;

        for (let i = 0; i < remindersList.length; i++) {
          if (!enabledReminders[i]) continue;

          const item = remindersList[i];
          const normalizedSchedule = item.time.trim().replace(".", ":");
          const scheduleMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(normalizedSchedule);
          if (!scheduleMatch) continue;

          const scheduledAt = new Date(now);
          scheduledAt.setHours(Number(scheduleMatch[1]), Number(scheduleMatch[2]), 0, 0);
          const isDue =
            now.getTime() >= scheduledAt.getTime() &&
            (currentTimeStr === normalizedSchedule ||
              (previousCheckTime > 0 &&
                previousCheckTime < scheduledAt.getTime()));
          if (!isDue) continue;

          const triggerKey = `${item.key}-${normalizedSchedule}-${dateStamp}`;
          const storageKey = `fitbite_triggered_${triggerKey}`;

          if (
            triggeredRemindersRef.current.has(triggerKey) ||
            localStorage.getItem(storageKey) === "true"
          ) {
            continue;
          }

          triggeredRemindersRef.current.add(triggerKey);

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
            if (!response.ok) {
              throw new Error(`Server mengembalikan ${response.status}`);
            }

            const resData = await response.json();
            if (Array.isArray(resData.data)) {
              setNotifications(resData.data);
            }
            localStorage.setItem(storageKey, "true");

            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              try {
                const browserNotification = new Notification(
                  `Pengingat: ${item.title}`,
                  {
                    body: `Sudah pukul ${normalizedSchedule.replace(":", ".")} WIB. ${item.description}`,
                    tag: triggerKey,
                    requireInteraction: true,
                    silent:
                      document.visibilityState === "visible" ||
                      !soundEnabledRef.current,
                  }
                );
                browserNotification.onclick = () => {
                  window.focus();
                  browserNotification.close();
                };
              } catch (error) {
                console.error("Gagal menampilkan notifikasi browser:", error);
              }
            }

            playNotificationSound();
            showToastMsg(
              `Pengingat: ${item.title}`,
              `Sudah pukul ${item.time} WIB. Cek ikon lonceng untuk mencatat logmu!`,
              "success"
            );
          } catch (err) {
            triggeredRemindersRef.current.delete(triggerKey);
            requestFailed = true;
            console.error("Gagal memicu notifikasi jadwal:", err);
          }
        }

        if (!requestFailed) {
          localStorage.setItem(lastCheckKey, String(now.getTime()));
        }
      } catch (error) {
        console.error("Gagal memeriksa jadwal pengingat:", error);
      } finally {
        reminderCheckInFlightRef.current = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkReminderSchedule();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    checkReminderSchedule();
    const intervalId = setInterval(checkReminderSchedule, 3000);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [remindersList, enabledReminders, remindersLoaded]);

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
        saluran: browserPermission ? "web_push" : "in_app",
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

  // FIT-173: Registrasi Service Worker (/sw.js) & permintaan izin Web Push API
  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setBrowserPermissionStatus("unsupported");
      setBrowserPermission(false);
      showToastMsg(
        "Notifikasi tidak didukung",
        "Browser ini tidak mendukung Web Push Notification.",
        "error"
      );
      return;
    }

    if (Notification.permission === "denied") {
      setBrowserPermissionStatus("denied");
      setBrowserPermission(false);
      showToastMsg(
        "Izin notifikasi diblokir",
        "Buka izin situs di sebelah alamat browser, ubah Notifikasi menjadi Izinkan, lalu muat ulang halaman.",
        "error"
      );
      return;
    }

    setPushLoading(true);
    try {
      const result = await subscribeBrowserPush(activeUserId, authUser?.email);
      setBrowserPermissionStatus(result.permission);
      setBrowserPermission(result.ok);

      if (result.ok) {
        showToastMsg("Web Push Aktif", result.message, "success");
      } else {
        showToastMsg("Izin notifikasi belum aktif", result.message, "error");
      }
    } catch (error) {
      console.error("Gagal mengaktifkan Service Worker / Web Push:", error);
      setBrowserPermissionStatus(Notification.permission);
      setBrowserPermission(false);
      showToastMsg(
        "Gagal mengaktifkan Web Push",
        error instanceof Error
          ? error.message
          : "Pastikan backend FastAPI menyala dan kunci VAPID sudah diatur di .env.",
        "error"
      );
    } finally {
      setPushLoading(false);
    }
  };

  // FIT-173 & FIT-174: Uji kirim Web Push VAPID dari server (dengan fallback notifikasi lokal)
  const testDesktopNotification = async () => {
    if (!("Notification" in window)) {
      showToastMsg(
        "Notifikasi tidak didukung",
        "Browser ini tidak mendukung notifikasi desktop.",
        "error"
      );
      return;
    }

    if (Notification.permission !== "granted") {
      await enableNotifications();
      return;
    }

    try {
      await subscribeBrowserPush(activeUserId, authUser?.email);
      const targetUserId = encodeURIComponent(String(activeUserId ?? 1));
      const res = await fetch(
        `http://127.0.0.1:8000/api/push/test/${targetUserId}`,
        { method: "POST" }
      );

      if (res.ok) {
        playNotificationSound(true);
        showToastMsg(
          "Tes Web Push terkirim",
          "Notifikasi dikirim dari server FastAPI melalui Service Worker (VAPID).",
          "success"
        );
        return;
      }
    } catch (err) {
      console.warn(
        "Tes Web Push via server gagal, beralih ke notifikasi desktop lokal:",
        err
      );
    }

    try {
      const browserNotification = new Notification("Tes notifikasi FitBite", {
        body: "Jika terlihat, notifikasi desktop FitBite sudah berfungsi.",
        requireInteraction: true,
      });
      playNotificationSound(true);
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };
      showToastMsg(
        "Tes notifikasi dikirim",
        "Jika popup tidak muncul, periksa pengaturan notifikasi browser dan Windows.",
        "success"
      );
    } catch (error) {
      console.error("Gagal menampilkan notifikasi uji:", error);
      showToastMsg(
        "Notifikasi desktop gagal",
        "Browser mengizinkan notifikasi, tetapi tidak dapat menampilkannya.",
        "error"
      );
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
                  className="absolute right-0 top-[46px] z-50 flex w-[380px] flex-col gap-3 rounded-[16px] border border-[#e1e7df] bg-white p-4 shadow-[0_12px_32px_rgba(32,61,50,0.14)]"
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

                  <div className="flex items-center justify-between gap-2 border-t border-[#edf1eb] pt-2 text-[10px] text-[#728078]">
                    <span className="truncate">Klik item ke halaman log</span>
                    <div className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
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
              <span className="text-[11px] font-bold text-[#203d32]">
                {userInitials}
              </span>
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
                    <span className="text-lg font-bold text-[#203d32]">
                      {userInitials}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold leading-[24px] text-[#203d32]">
                      {getAuthUserName(authUser)}
                    </h3>
                    <p className="text-[11px] leading-[16.5px] text-[#728078]">
                      {authUser?.role === "admin"
                        ? "Administrator FitBite"
                        : "Anggota FitBite"}
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between pt-1">
                  <div>
                    <h3 className="text-xs font-semibold leading-[18px] text-[#203d32]">
                      Email
                    </h3>
                    <p className="text-[11px] leading-[16.5px] text-[#728078]">
                      {authUser?.email || "Email belum tersedia"}
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

            {/* Kolom Kanan: Pengingat & Notifikasi (PBI-11, PBI-12, PBI-23) */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              {/* Kartu 4: Pengingat yang mendukungmu (FIT-49 & FIT-172) */}
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
                            {browserPermissionStatus === "denied"
                              ? "Notifikasi diblokir oleh browser"
                              : browserPermissionStatus === "unsupported"
                                ? "Browser tidak mendukung Web Push"
                                : "Notifikasi browser belum diizinkan"}
                          </p>
                          <p className="text-[11px] text-[#a86c24]">
                            {browserPermissionStatus === "denied"
                              ? "Izin harus diubah manual dari pengaturan situs browser; sementara ini pengingat tetap masuk ke In-App Notification."
                              : "Aktifkan Service Worker & Web Push agar pengingat terjadwal tetap muncul meski tab FitBite ditutup."}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={pushLoading}
                        onClick={enableNotifications}
                        className="min-h-[36px] shrink-0 rounded-[8px] border border-[#e1e7df] bg-white px-4 text-xs font-semibold text-[#167653] hover:bg-[#f8faf7] disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        {pushLoading ? "Mengaktifkan..." : "Aktifkan"}
                      </button>
                    </div>
                    <p className="text-[10px] leading-[14.5px] text-[#a86c24]">
                      {browserPermissionStatus === "denied"
                        ? "Chrome/Edge: klik ikon pengaturan di kiri alamat situs > Izin situs > Notifikasi > Izinkan, lalu muat ulang FitBite."
                        : "Izin mengikuti pengaturan browser. Saat diizinkan, Service Worker & Web Push akan mengirimkan pengingat meski tab ditutup; jika ditolak, pengingat otomatis beralih ke In-App Notification."}
                    </p>
                  </div>
                )}
                {browserPermission && (
                  <button
                    type="button"
                    onClick={testDesktopNotification}
                    className="mt-1 min-h-[36px] self-start rounded-[8px] border border-[#dce7dc] bg-white px-3 text-xs font-semibold text-[#167653] hover:bg-[#f8faf7] transition-colors cursor-pointer"
                  >
                    Tes Web Push &amp; notifikasi desktop
                  </button>
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