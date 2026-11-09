import React, { useState } from "react";
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
} from "lucide-react";

type Reminder = {
  key: string;
  title: string;
  description: string;
  time: string;
  hasBorderBottom?: boolean;
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

const profileStats = [
  ["Usia • perempuan", "28 tahun", "12 April 1998"],
  ["Tinggi badan", "160 cm", ""],
  ["Berat awal • 5 Okt", "64,8 kg", ""],
  ["Berat kini • 19 Okt", "64,0 kg", ""],
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

  const toggleReminder = (index: number) => {
    setEnabledReminders((current) =>
      current.map((enabled, itemIndex) =>
        itemIndex === index ? !enabled : enabled
      )
    );
  };

  // Langsung ubah nilai waktu/interval secara inline tanpa prompt
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
          id_user: 1, // ID pengguna Nadia Putri
          jadwal: payloadJadwal,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorDetail =
          result.detail?.[0]?.msg ||
          result.detail ||
          "Format waktu atau interval tidak valid.";
        setToast({
          show: true,
          title: "Gagal Menyimpan",
          message: String(errorDetail),
          type: "error",
        });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
        return;
      }

      setSaved(true);
      setToast({
        show: true,
        title: "Pengaturan Tersimpan",
        message: "Jadwal pengingat harianmu berhasil diperbarui ke sistem.",
        type: "success",
      });

      setTimeout(() => {
        setSaved(false);
        setToast((prev) => ({ ...prev, show: false }));
      }, 3500);
    } catch (err) {
      console.error("Gagal koneksi ke server backend:", err);
      setToast({
        show: true,
        title: "Koneksi Gagal",
        message: "Tidak dapat terhubung ke server FastAPI (port 8000).",
        type: "error",
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
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
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-[72px] w-full shrink-0 items-center justify-between border-b border-[#e1e7df] bg-[#f6f7f2] px-9">
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
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#e8ece3] transition-colors"
            >
              <Bell className="h-[18px] w-[18px] text-[#203d32]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#167653]" />
            </button>
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

                <div className="flex w-full items-start gap-2.5 rounded-[12px] bg-[#eaf3e9] p-3.5">
                  <Target className="h-4 w-4 shrink-0 text-[#167653] mt-0.5" />
                  <p className="flex-1 text-[11px] leading-[16.5px] text-[#124b39]">
                    Perubahan profil akan digunakan pada perhitungan target Body
                    Check berikutnya.
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

                        {/* Input Waktu/Interval Inline Langsung di Kolom (Tanpa Prompt Browser) */}
                        <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e1e7df] bg-white px-2.5 py-1 text-xs font-medium text-[#203d32] focus-within:border-[#167653] focus-within:ring-1 focus-within:ring-[#167653] transition-colors shadow-2xs">
                          <input
                            type="text"
                            value={reminder.time}
                            onChange={(e) =>
                              handleDirectTimeChange(index, e.target.value)
                            }
                            aria-label={`Waktu ${reminder.title}`}
                            className="w-[50px] bg-transparent text-center text-xs font-medium text-[#203d32] outline-none"
                            placeholder={reminder.key === "minum_air" ? "2 jam" : "07.00"}
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

              {/* Kartu 5: Notifikasi dalam aplikasi (FIT-53) */}
              <Card
                title="Notifikasi dalam aplikasi"
                subtitle="1 belum dibaca"
                headerAction={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#167653] hover:underline mt-1"
                  >
                    <span>Tandai semua dibaca</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                }
              >
                {/* Notifikasi Belum Dibaca */}
                <div className="flex w-full items-start gap-3.5 rounded-xl bg-[#eaf3e9] p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#167653]">
                    <GlassWater className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#203d32]">
                      Seteguk lagi sore ini?
                    </p>
                    <p className="text-[11px] leading-[16.5px] text-[#5c6b62] mt-0.5">
                      Air hari ini 1.750 ml. Pengingat berikutnya pukul 19.00;
                      masih ada 890 ml menuju target.
                    </p>
                    <p className="text-[10px] text-[#728078] mt-1">
                      Hari ini • 18.25 WIB
                    </p>
                  </div>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#167653] mt-1.5" />
                </div>

                {/* Notifikasi Sudah Dibaca */}
                <div className="flex w-full flex-col divide-y divide-[#edf1eb]">
                  <div className="flex w-full items-center gap-3.5 pb-3.5">
                    <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167653]">
                      <CheckCircle2 className="h-[18px] w-[18px]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[13px] font-semibold text-[#203d32]">
                        Body Check pagi tersimpan
                      </h3>
                      <p className="text-[11px] text-[#728078]">
                        Target hari ini siap • 19 Okt, 06.48 WIB
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full items-center gap-3.5 pt-3.5">
                    <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167653]">
                      <ClipboardCheck className="h-[18px] w-[18px]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[13px] font-semibold text-[#203d32]">
                        Evaluasi Minggu siap dilihat
                      </h3>
                      <p className="text-[11px] text-[#728078]">
                        Lihat kembali kebiasaanmu • 18 Okt, 20.00 WIB
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#167653] hover:underline"
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