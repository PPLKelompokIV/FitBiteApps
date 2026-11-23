import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  Loader2,
  Power,
  RotateCcw,
  SearchX,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminSummaryCards, type AdminAccountStats } from "./AdminSummaryCards";
import { getAuthToken } from "../utils/auth";

const API_BASE = "http://127.0.0.1:8000";
const PAGE_LIMIT = 10;

interface AdminUserRecord {
  id_user: string;
  kode_akun: string;
  nama: string;
  email: string;
  role: string;
  peran_label: string;
  status_akun: string;
  status_label: "Aktif" | "Nonaktif";
  created_at: string;
  tanggal_dibuat_singkat: string;
  tanggal_dibuat_lengkap: string;
  akses_terakhir_singkat: string;
  akses_terakhir_lengkap: string;
}

interface AdminUsersApiResponse {
  status: string;
  read_only: boolean;
  privacy_notice: string;
  summary: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    admin_count: number;
    regular_user_count: number;
  };
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  data: AdminUserRecord[];
}

const Svg: React.FC<{ size?: number; sw?: number; children: React.ReactNode }> = ({
  size = 16,
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

const IconShield = () => (
  <Svg size={16}>
    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
  </Svg>
);

const IconSearch = () => (
  <Svg size={16}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);

const formatTodayHeader = () => {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "Senin, 23 November 2026";
  }
};

export const UserAccountManagementSection: React.FC = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua status");
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [accountStats, setAccountStats] = useState<AdminAccountStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total_items: 0,
    total_pages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal Ringkasan Status Akun (FIT-65)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<AdminUserRecord | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Modal Konfirmasi Suspend / Aktifkan Akun (TC-PBI24-004)
  const [confirmTarget, setConfirmTarget] = useState<{
    user: AdminUserRecord;
    nextStatus: "active" | "inactive";
  } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Toast notifikasi halus
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text });
    window.setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  }, []);

  const fetchUsers = useCallback(
    async (searchText: string, selectedStatus: string, targetPage: number) => {
      const token = getAuthToken();
      if (!token) {
        setErrorMessage("Sesi administrator tidak ditemukan. Silakan masuk kembali.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(PAGE_LIMIT),
        });
        if (searchText.trim()) {
          params.set("search", searchText.trim());
        }
        if (selectedStatus === "Aktif") {
          params.set("status", "active");
        } else if (selectedStatus === "Nonaktif") {
          params.set("status", "inactive");
        } else {
          params.set("status", "all");
        }

        const res = await fetch(`${API_BASE}/api/admin/users?${params.toString()}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await res.json();
        if (!res.ok) {
          throw new Error(
            payload?.detail || "Gagal memuat daftar akun pengguna dari server."
          );
        }

        const typed = payload as AdminUsersApiResponse;
        setUsers(typed.data);
        setPagination(typed.pagination);
        setAccountStats({
          total: typed.summary.total_users,
          active: typed.summary.active_users,
          inactive: typed.summary.inactive_users,
        });

        setSelectedUser((prev) => {
          if (typed.data.length === 0) return null;
          if (prev) {
            const stillExists = typed.data.find((u) => u.id_user === prev.id_user);
            if (stillExists) return stillExists;
          }
          return typed.data[0];
        });
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Terjadi kesalahan saat memuat akun."
        );
        setUsers([]);
        setSelectedUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchUsers(query, statusFilter, page);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, statusFilter, page, fetchUsers]);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    if (!isModalOpen && !confirmTarget) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmTarget && !isUpdatingStatus) {
          setConfirmTarget(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, confirmTarget, isUpdatingStatus]);

  const handleOpenSummaryModal = async (user: AdminUserRecord) => {
    setSelectedUser(user);
    setModalUser(user);
    setIsModalOpen(true);

    const token = getAuthToken();
    if (!token) return;

    setIsModalLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${encodeURIComponent(user.id_user)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setModalUser(json.data as AdminUserRecord);
        }
      }
    } catch {
      // Tetap gunakan data baris terpilih jika detail gagal dimuat ulang
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleRequestToggleStatus = (user: AdminUserRecord) => {
    if (user.role === "admin") return;
    const nextStatus = user.status_label === "Aktif" ? "inactive" : "active";
    setConfirmTarget({ user, nextStatus });
  };

  const handleConfirmToggleStatus = async () => {
    if (!confirmTarget) return;
    const token = getAuthToken();
    if (!token) {
      showToast("error", "Sesi administrator berakhir. Silakan login kembali.");
      setConfirmTarget(null);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/users/${encodeURIComponent(confirmTarget.user.id_user)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status_akun: confirmTarget.nextStatus }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.detail || "Gagal mengubah status akun.");
      }

      const updatedUser = json.data as AdminUserRecord;
      setSelectedUser((prev) =>
        prev?.id_user === updatedUser.id_user ? updatedUser : prev
      );
      setModalUser((prev) =>
        prev?.id_user === updatedUser.id_user ? updatedUser : prev
      );

      setConfirmTarget(null);
      showToast("success", json.message || "Status akun berhasil diperbarui.");
      await fetchUsers(query, statusFilter, page);
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui status."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetFilters = () => {
    setQuery("");
    setStatusFilter("Semua status");
    setPage(1);
  };

  const startItem =
    pagination.total_items === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total_items
  );

  const isFiltered = query.trim().length > 0 || statusFilter !== "Semua status";

  const buildDetailFields = (user: AdminUserRecord) => [
    ["ID akun", user.kode_akun],
    ["UUID sistem", user.id_user],
    ["Nama lengkap", user.nama],
    ["Email", user.email],
    ["Peran", user.peran_label],
    ["Tanggal dibuat", user.tanggal_dibuat_lengkap],
    ["Akses terakhir", user.akses_terakhir_lengkap],
    ["Status akun", user.status_label],
  ];

  const inputCls =
    "w-full text-sm border border-[#d0dbd5] rounded-lg px-3 py-2 outline-none focus:border-[#124b39] bg-white transition-colors duration-200";
  const labelCls = "text-xs font-medium text-[#4a7060]";

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-tab-content {
          animation: fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Toast Notifikasi */}
      {toast && (
        <aside
          aria-live="polite"
          className={`fixed top-5 right-5 z-[60] flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-medium shadow-md transition-all ${
            toast.type === "success"
              ? "bg-[#eaf3e9] border-[#b9d7c0] text-[#124b39]"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="ml-1 opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      <main className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col bg-[#f6f7f2] text-[#1d2926]">
        <AdminPageHeader currentPage="Akun pengguna" />

        <div className="flex flex-col gap-5 p-8">
          {/* Hero */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-[#124b39]">
                PENGELOLAAN FITBITE
              </p>
              <h1 className="text-3xl font-medium tracking-tight text-[#1d2926] mt-1">
                Referensi rapi, pengalaman lebih baik.
              </h1>
              <p className="text-xs text-[#6b8c7a] mt-1.5">
                Ruang administrator • {formatTodayHeader()}
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-[#124b39]">
              Privasi NFR-03
            </span>
          </div>

          {/* Banner Privasi NFR-03 */}
          <div className="flex items-center gap-2 bg-[#eaf3e9] text-[#124b39] text-xs rounded-lg px-4 py-2.5">
            <IconShield />
            <span>
              Batas akses admin: hanya memantau metadata dan status aktif/nonaktif
              akun. Profil kesehatan, foto, dan jurnal pribadi tidak tersedia di
              area ini.
            </span>
          </div>

          {/* Stats Dinamis */}
          <AdminSummaryCards accountStats={accountStats} />

          {/* Tabs */}
          <div
            role="tablist"
            className="grid grid-cols-3 bg-[#eaf3e9] rounded-xl p-1 relative"
          >
            <Link
              to="/admin/pengelolaan"
              role="tab"
              aria-selected="false"
              className="py-2 text-center text-sm rounded-lg transition-all duration-300 ease-out relative z-10 text-[#4a7060] hover:bg-white/40"
            >
              Katalog makanan
            </Link>
            <Link
              to="/admin/aktivitas"
              role="tab"
              aria-selected="false"
              className="py-2 text-center text-sm rounded-lg transition-all duration-300 ease-out relative z-10 text-[#4a7060] hover:bg-white/40"
            >
              Aktivitas &amp; MET
            </Link>
            <button
              type="button"
              role="tab"
              aria-selected="true"
              aria-current="page"
              className="py-2 text-sm rounded-lg relative z-10 bg-white font-bold text-[#124b39] shadow-sm transform scale-[1.02]"
            >
              Akun pengguna
            </button>
          </div>

          {/* AREA KONTEN TAB */}
          <div className="animate-tab-content">
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
              {/* Tabel Akun (FIT-63) */}
              <section className="bg-white rounded-2xl border border-[#e1e7df] p-6 shadow-sm min-w-0">
                <h2 className="text-base font-bold text-[#1d2926]">
                  Pantau akun pengguna
                </h2>
                <p className="text-xs text-[#6b8c7a] mt-0.5">
                  Cari dan pilih akun untuk membaca ringkasan metadata serta
                  memantau status keaktifan akun.
                </p>

                <form
                  className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3 mt-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setPage(1);
                    fetchUsers(query, statusFilter, 1);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <label htmlFor="admin-user-search" className={labelCls}>
                      Cari akun
                    </label>
                    <div className="relative">
                      <input
                        id="admin-user-search"
                        type="text"
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          setPage(1);
                        }}
                        aria-label="Cari nama, email, atau ID akun"
                        placeholder="Cari nama, email, atau ID akun..."
                        className={`${inputCls} pr-9 transition-shadow focus:shadow-sm`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7060] pointer-events-none">
                        <IconSearch />
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="admin-status-filter" className={labelCls}>
                      Status akun
                    </label>
                    <select
                      id="admin-status-filter"
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setPage(1);
                      }}
                      className={inputCls}
                    >
                      <option>Semua status</option>
                      <option>Aktif</option>
                      <option>Nonaktif</option>
                    </select>
                  </div>
                </form>

                {/* Error Otorisasi / Server */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="mt-4 overflow-x-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 h-40 text-sm text-[#6b8c7a]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#124b39]" />
                      <span>Memuat daftar akun pengguna...</span>
                    </div>
                  ) : users.length === 0 ? (
                    /* Empty State Dinamis (FIT-65) */
                    <div
                      role="status"
                      data-testid="empty-user-state"
                      className="flex flex-col items-center justify-center text-center gap-2 py-10 px-4 bg-[#f6f9f7] border border-dashed border-[#cfe2d3] rounded-xl"
                    >
                      <div className="flex w-11 h-11 items-center justify-center rounded-full bg-[#eaf3e9] text-[#124b39]">
                        <SearchX className="w-5 h-5" />
                      </div>
                      {query.trim() && (
                        <div className="text-[11px] font-medium text-[#6b8c7a]">
                          PENCARIAN • &ldquo;{query.trim()}&rdquo;
                        </div>
                      )}
                      <h3 className="font-semibold text-[#1d2926] text-sm">
                        Akun pengguna tidak ditemukan
                      </h3>
                      <p className="text-xs text-[#6b8c7a] max-w-sm">
                        Tidak ada akun yang cocok dengan kata kunci atau filter
                        status yang dipilih. Coba nama, email, atau ID akun lain.
                      </p>
                      {isFiltered && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-[#d0dbd5] text-[#124b39] hover:bg-[#eaf3e9] transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset pencarian
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f5f2] text-[11px] text-[#6b8c7a] uppercase tracking-wide">
                        <tr>
                          <th className="text-left px-4 py-3 rounded-l-lg">
                            ID Akun
                          </th>
                          <th className="text-left px-4 py-3">Nama / Email</th>
                          <th className="text-left px-4 py-3">Dibuat</th>
                          <th className="text-left px-4 py-3">Akses Terakhir</th>
                          <th className="text-center px-4 py-3">Status</th>
                          <th className="text-center px-4 py-3 rounded-r-lg">
                            Rincian
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user.id_user}
                            onClick={() => setSelectedUser(user)}
                            className={`border-t border-[#f0f5f2] cursor-pointer transition-all duration-200 ${
                              selectedUser?.id_user === user.id_user
                                ? "bg-[#eaf3e9]"
                                : "hover:bg-[#f6f9f7]"
                            } ${
                              user.status_label === "Aktif"
                                ? ""
                                : "opacity-65 grayscale-[25%]"
                            }`}
                          >
                            <td className="px-4 py-3 text-xs font-mono text-[#4a7060] whitespace-nowrap">
                              {user.kode_akun}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#1d2926]">
                                {user.nama}
                              </p>
                              <p className="text-xs text-[#6b8c7a] mt-0.5">
                                {user.email}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-left text-[#4a7060] whitespace-nowrap">
                              {user.tanggal_dibuat_singkat}
                            </td>
                            <td className="px-4 py-3 text-left text-[#4a7060] whitespace-nowrap">
                              {user.akses_terakhir_singkat}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors duration-200 ${
                                  user.status_label === "Aktif"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {user.status_label === "Aktif" ? (
                                  <UserCheck className="w-3 h-3" />
                                ) : (
                                  <UserX className="w-3 h-3" />
                                )}
                                {user.status_label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenSummaryModal(user);
                                }}
                                aria-label={`Lihat ringkasan ${user.nama}`}
                                className="inline-flex items-center gap-1 font-medium text-[#124b39] text-xs hover:underline"
                              >
                                Lihat
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination Nyata */}
                <div className="flex items-center justify-between border-t border-[#e1e7df] mt-4 pt-3 text-xs text-[#6b8c7a]">
                  <span>
                    {pagination.total_items === 0
                      ? "Menampilkan 0 akun"
                      : `Menampilkan ${startItem}–${endItem} dari ${pagination.total_items} akun`}
                  </span>
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={pagination.page <= 1 || isLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      aria-label="Halaman sebelumnya"
                      className="p-1 rounded-md border border-[#d0dbd5] text-[#124b39] disabled:opacity-40 hover:bg-[#eaf3e9]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 font-medium text-[#124b39]">
                      Halaman {pagination.page} / {pagination.total_pages}
                    </span>
                    <button
                      type="button"
                      disabled={
                        pagination.page >= pagination.total_pages || isLoading
                      }
                      onClick={() =>
                        setPage((p) => Math.min(pagination.total_pages, p + 1))
                      }
                      aria-label="Halaman berikutnya"
                      className="p-1 rounded-md border border-[#d0dbd5] text-[#124b39] disabled:opacity-40 hover:bg-[#eaf3e9]"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="border-t border-[#e1e7df] mt-3 pt-3 text-xs text-[#6b8c7a] leading-relaxed">
                  Daftar diambil langsung dari metadata tabel{" "}
                  <code className="font-mono text-[#124b39]">users</code>. Data
                  kesehatan pribadi pengguna tetap terlindungi dan tidak diakses.
                </p>
              </section>

              {/* Panel Samping Ringkasan Akun + Catatan Privasi */}
              <div className="flex flex-col gap-4 min-w-0">
                <aside className="flex flex-col bg-white rounded-2xl border border-[#e1e7df] p-6 gap-4 shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#1d2926]">
                      Ringkasan akun
                    </h2>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-[#124b39]">
                      Metadata
                    </span>
                  </div>

                  {selectedUser ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex w-10 h-10 items-center justify-center bg-[#eaf3e9] rounded-xl text-[#124b39] shrink-0">
                          <Eye className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="font-semibold text-[#1d2926] text-sm truncate">
                            {selectedUser.nama}
                          </div>
                          <p className="text-[#6b8c7a] text-xs">
                            Akun terpilih • {selectedUser.peran_label}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                            selectedUser.status_label === "Aktif"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {selectedUser.status_label}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {buildDetailFields(selectedUser)
                          .filter(([label]) => label !== "UUID sistem")
                          .map(([label, value]) => (
                            <div
                              key={label}
                              className="flex flex-col gap-0.5 pb-2.5 border-b border-[#f0f5f2]"
                            >
                              <div className="text-[#6b8c7a] text-xs">
                                {label}
                              </div>
                              <div className="font-medium text-[#1d2926] text-sm break-all">
                                {value}
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenSummaryModal(selectedUser)}
                          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-[#eaf3e9] text-[#124b39] hover:bg-[#dcecdf] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Buka modal ringkasan status
                        </button>

                        {selectedUser.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => handleRequestToggleStatus(selectedUser)}
                            className={`w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border transition-colors ${
                              selectedUser.status_label === "Aktif"
                                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                : "bg-[#124b39] border-[#124b39] text-white hover:bg-[#0e3c2e]"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            {selectedUser.status_label === "Aktif"
                              ? "Nonaktifkan Akun"
                              : "Aktifkan Akun"}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-6 gap-2 text-xs text-[#6b8c7a]">
                      <SearchX className="w-5 h-5 text-[#6b8c7a]" />
                      <p>Belum ada akun yang terpilih untuk ditampilkan.</p>
                    </div>
                  )}
                </aside>

                <div className="flex gap-2 bg-[#eaf3e9] text-[#124b39] text-xs rounded-xl p-4 leading-relaxed border border-[#cfe2d3]">
                  <span className="mt-0.5 shrink-0">
                    <Info className="w-4 h-4" />
                  </span>
                  <p>
                    Privasi tetap terjaga (NFR-03). Ringkasan hanya memuat
                    metadata akun, tanpa profil kesehatan atau isi jurnal
                    pengguna.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-auto flex items-center justify-between px-8 pb-6 text-xs text-[#6b8c7a]">
          <span>
            Area administrasi • Tidak memuat data kesehatan pribadi pengguna.
          </span>
          <span>FitBite © 2026</span>
        </footer>
      </main>

      {/* Modal Ringkasan Status Akun (FIT-65) */}
      {isModalOpen && modalUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-ringkasan-akun-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d2926]/45 backdrop-blur-[1px] p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-[#e1e7df] shadow-xl p-6 flex flex-col gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2">
                  <h2
                    id="modal-ringkasan-akun-title"
                    className="text-base font-bold text-[#1d2926]"
                  >
                    Ringkasan Status Akun
                  </h2>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-[#124b39]">
                    Privasi NFR-03
                  </span>
                </div>
                <p className="text-xs text-[#6b8c7a] mt-0.5">
                  Metadata identitas dasar dan status keaktifan akun.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal ringkasan akun"
                className="p-1.5 rounded-lg text-[#6b8c7a] hover:bg-[#f0f5f2] hover:text-[#1d2926]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isModalLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-[#6b8c7a]">
                <Loader2 className="w-4 h-4 animate-spin text-[#124b39]" />
                <span>Memverifikasi ringkasan akun...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-xl bg-[#f6f9f7] border border-[#e1e7df] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1d2926] truncate">
                      {modalUser.nama}
                    </p>
                    <p className="text-xs text-[#6b8c7a] truncate">
                      {modalUser.email}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                      modalUser.status_label === "Aktif"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {modalUser.status_label === "Aktif" ? (
                      <UserCheck className="w-3 h-3" />
                    ) : (
                      <UserX className="w-3 h-3" />
                    )}
                    {modalUser.status_label}
                  </span>
                </div>

                <dl className="grid grid-cols-1 gap-2.5 text-sm">
                  {buildDetailFields(modalUser).map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 pb-2 border-b border-[#f0f5f2]"
                    >
                      <dt className="text-xs text-[#6b8c7a] shrink-0">{label}</dt>
                      <dd className="text-xs font-medium text-[#1d2926] text-right break-all">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex items-start gap-2 rounded-xl bg-[#eaf3e9] border border-[#cfe2d3] px-3.5 py-2.5 text-xs text-[#124b39]">
                  <IconShield />
                  <span>
                    Isolasi privasi NFR-03 aktif: data berat badan, tinggi badan,
                    jurnal makan, aktivitas, dan foto pribadi pengguna tidak
                    ditampilkan.
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-2">
              {modalUser.role !== "admin" && (
                <button
                  type="button"
                  onClick={() => handleRequestToggleStatus(modalUser)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    modalUser.status_label === "Aktif"
                      ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      : "bg-[#eaf3e9] border-[#cfe2d3] text-[#124b39] hover:bg-[#dcecdf]"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {modalUser.status_label === "Aktif"
                    ? "Nonaktifkan Akun"
                    : "Aktifkan Akun"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#124b39] text-white hover:bg-[#0e3c2e] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal Konfirmasi Suspend / Aktifkan Akun (TC-PBI24-004) */}
      {confirmTarget && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="modal-konfirmasi-status-title"
          className="fixed inset-0 z-[55] flex items-center justify-center bg-[#1d2926]/55 backdrop-blur-[1px] p-4"
          onClick={() => !isUpdatingStatus && setConfirmTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-[#e1e7df] shadow-xl p-6 flex flex-col gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex w-10 h-10 items-center justify-center rounded-xl shrink-0 ${
                  confirmTarget.nextStatus === "inactive"
                    ? "bg-red-50 text-red-600"
                    : "bg-[#eaf3e9] text-[#124b39]"
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3
                  id="modal-konfirmasi-status-title"
                  className="text-sm font-bold text-[#1d2926]"
                >
                  {confirmTarget.nextStatus === "inactive"
                    ? "Konfirmasi Nonaktifkan Akun"
                    : "Konfirmasi Aktifkan Akun"}
                </h3>
                <p className="text-xs text-[#6b8c7a] mt-1 leading-relaxed">
                  {confirmTarget.nextStatus === "inactive"
                    ? `Akun ${confirmTarget.user.nama} (${confirmTarget.user.email}) akan diubah menjadi Nonaktif dan tidak dapat login sampai diaktifkan kembali.`
                    : `Akun ${confirmTarget.user.nama} (${confirmTarget.user.email}) akan diaktifkan kembali agar pengguna dapat login seperti biasa.`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setConfirmTarget(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium border border-[#d0dbd5] text-[#4a7060] hover:bg-[#f6f9f7] disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleConfirmToggleStatus}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
                  confirmTarget.nextStatus === "inactive"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#124b39] hover:bg-[#0e3c2e]"
                }`}
              >
                {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {confirmTarget.nextStatus === "inactive"
                  ? "Ya, Nonaktifkan"
                  : "Ya, Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};