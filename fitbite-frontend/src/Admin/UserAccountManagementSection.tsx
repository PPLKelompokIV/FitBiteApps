import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Info,
  UserCheck,
  UserX,
  Eye,
  SearchX,
} from "lucide-react";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminSummaryCards } from "./AdminSummaryCards";

type User = {
  name: string;
  email: string;
  created: string;
  lastAccess: string;
  status: "Aktif" | "Nonaktif";
  id: string;
};

const users: User[] = [
  {
    name: "Nadia Putri",
    email: "nadia.putri@email.com",
    created: "5 Okt 2026",
    lastAccess: "19 Okt, 18.30",
    status: "Aktif",
    id: "FB-U-0001",
  },
  {
    name: "Dewi Lestari",
    email: "dewi.l@email.com",
    created: "8 Okt 2026",
    lastAccess: "19 Okt, 09.10",
    status: "Aktif",
    id: "FB-U-0002",
  },
  {
    name: "Andi Saputra",
    email: "andi.s@email.com",
    created: "10 Okt 2026",
    lastAccess: "15 Okt, 17.20",
    status: "Nonaktif",
    id: "FB-U-0003",
  },
  {
    name: "Bima Prasetyo",
    email: "bima.p@email.com",
    created: "11 Okt 2026",
    lastAccess: "19 Okt, 08.45",
    status: "Aktif",
    id: "FB-U-0004",
  },
  {
    name: "Siti Rahma",
    email: "siti.r@email.com",
    created: "12 Okt 2026",
    lastAccess: "18 Okt, 20.15",
    status: "Aktif",
    id: "FB-U-0005",
  },
  {
    name: "Fajar Ramadhan",
    email: "fajar.r@email.com",
    created: "14 Okt 2026",
    lastAccess: "18 Okt, 16.40",
    status: "Aktif",
    id: "FB-U-0006",
  },
  {
    name: "Maya Anindya",
    email: "maya.a@email.com",
    created: "16 Okt 2026",
    lastAccess: "19 Okt, 07.30",
    status: "Aktif",
    id: "FB-U-0007",
  },
];

const detailFields = [
  ["ID akun", "FB-U-0001"],
  ["Nama lengkap", "Nadia Putri"],
  ["Email", "nadia.putri@email.com"],
  ["Peran", "Pengguna"],
  ["Tanggal dibuat", "5 Oktober 2026"],
  ["Akses terakhir", "19 Oktober 2026, 18.30"],
  ["Status akun", "Aktif"],
];

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

export const UserAccountManagementSection: React.FC = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [selectedUser, setSelectedUser] = useState<User>(users[0]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.id.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        status === "Semua status" || user.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const isEmptySearch = query.trim().length > 0 && filteredUsers.length === 0;

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
                Ruang administrator • Senin, 19 Oktober 2026
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-[#124b39]">
              Hanya baca
            </span>
          </div>

          {/* Banner */}
          <div className="flex items-center gap-2 bg-[#eaf3e9] text-[#124b39] text-xs rounded-lg px-4 py-2.5">
            <IconShield />
            <span>
              Batas akses admin: hanya membaca metadata akun. Status akun tidak
              dapat diubah. Profil kesehatan, foto, dan jurnal pribadi tidak
              tersedia di area ini.
            </span>
          </div>

          {/* Stats */}
          <AdminSummaryCards />

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

          {/* AREA KONTEN TAB DENGAN ANIMASI */}
          <div className="animate-tab-content">
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
              {/* Tabel Akun */}
              <section className="bg-white rounded-2xl border border-[#e1e7df] p-6 shadow-sm min-w-0">
                <h2 className="text-base font-bold text-[#1d2926]">
                  Pantau akun pengguna
                </h2>
                <p className="text-xs text-[#6b8c7a] mt-0.5">
                  Cari dan pilih akun untuk membaca ringkasan metadata akun.
                </p>

                <form
                  className="grid grid-cols-[1fr_180px] gap-3 mt-4"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="flex flex-col gap-1">
                    <label className={labelCls}>Cari akun</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
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
                    <label className={labelCls}>Status akun</label>
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className={inputCls}
                    >
                      <option>Semua status</option>
                      <option>Aktif</option>
                      <option>Nonaktif</option>
                    </select>
                  </div>
                </form>

                <div className="mt-4 overflow-x-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-[#6b8c7a]">
                      Tidak ada akun yang cocok dengan pencarian.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f5f2] text-[11px] text-[#6b8c7a] uppercase tracking-wide">
                        <tr>
                          <th className="text-left px-4 py-3 rounded-l-lg">
                            Nama / Email
                          </th>
                          <th className="text-left px-4 py-3">Dibuat</th>
                          <th className="text-left px-4 py-3">Akses Terakhir</th>
                          <th className="text-center px-4 py-3">Status</th>
                          <th className="text-center px-4 py-3 rounded-r-lg">
                            Rincian
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`border-t border-[#f0f5f2] cursor-pointer transition-all duration-200 ${
                              selectedUser.id === user.id
                                ? "bg-[#eaf3e9]"
                                : "hover:bg-[#f6f9f7]"
                            } ${
                              user.status === "Aktif"
                                ? ""
                                : "opacity-60 grayscale-[30%]"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#1d2926]">
                                {user.name}
                              </p>
                              <p className="text-xs text-[#6b8c7a] mt-0.5">
                                {user.email}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-left text-[#4a7060] whitespace-nowrap">
                              {user.created}
                            </td>
                            <td className="px-4 py-3 text-left text-[#4a7060] whitespace-nowrap">
                              {user.lastAccess}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors duration-200 ${
                                  user.status === "Aktif"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {user.status === "Aktif" ? (
                                  <UserCheck className="w-3 h-3" />
                                ) : (
                                  <UserX className="w-3 h-3" />
                                )}
                                {user.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center gap-1 font-medium text-[#124b39] text-xs hover:underline">
                                Lihat
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#e1e7df] mt-2 pt-3 text-xs text-[#6b8c7a]">
                  <span>
                    {isEmptySearch
                      ? "Menampilkan 0 akun"
                      : `Menampilkan 1–${filteredUsers.length} dari 248 akun`}
                  </span>
                  <span className="tracking-wide">
                    ‹ <b className="text-[#124b39]">1</b> 2 3 … 36 ›
                  </span>
                </div>

                <p className="border-t border-[#e1e7df] mt-3 pt-3 text-xs text-[#6b8c7a] leading-relaxed">
                  Semua identitas dan metadata akun pada mockup adalah data
                  contoh. Status ditampilkan sebagai informasi, bukan kontrol
                  pengelolaan akun.
                </p>

                <div className="flex items-start gap-2.5 p-3.5 mt-3 bg-[#f0f5f2] rounded-xl">
                  <SearchX className="w-4 h-4 text-[#6b8c7a] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <div className="text-[#6b8c7a] text-[10px]">
                      CONTOH PENCARIAN • akun.tidakada@email.com
                    </div>
                    <div className="font-semibold text-[#1d2926] text-xs">
                      Akun tidak ditemukan
                    </div>
                    <p className="text-[#6b8c7a] text-xs">
                      Coba nama, email, atau ID akun lain, atau ubah filter
                      status.
                    </p>
                  </div>
                </div>
              </section>

              {/* Ringkasan Akun + Catatan */}
              <div className="flex flex-col gap-4 min-w-0">
                <aside className="flex flex-col bg-white rounded-2xl border border-[#e1e7df] p-6 gap-4 shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#1d2926]">
                      Ringkasan akun
                    </h2>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-[#124b39]">
                      Hanya baca
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex w-10 h-10 items-center justify-center bg-[#eaf3e9] rounded-xl text-[#124b39] shrink-0">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="font-semibold text-[#1d2926] text-sm truncate">
                        {selectedUser.name}
                      </div>
                      <p className="text-[#6b8c7a] text-xs">
                        Akun terpilih • data contoh
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                        selectedUser.status === "Aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {detailFields.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex flex-col gap-0.5 pb-2.5 border-b border-[#f0f5f2]"
                      >
                        <div className="text-[#6b8c7a] text-xs">{label}</div>
                        <div className="font-medium text-[#1d2926] text-sm">
                          {label === "Nama lengkap"
                            ? selectedUser.name
                            : label === "Email"
                              ? selectedUser.email
                              : label === "ID akun"
                                ? selectedUser.id
                                : label === "Status akun"
                                  ? selectedUser.status
                                  : value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-[#6b8c7a] leading-relaxed text-center">
                    Admin hanya dapat membaca ringkasan ini. Tidak ada akses
                    untuk mengubah metadata maupun status akun.
                  </p>
                </aside>

                <div className="flex gap-2 bg-[#eaf3e9] text-[#124b39] text-xs rounded-xl p-4 leading-relaxed border border-[#cfe2d3]">
                  <span className="mt-0.5 shrink-0">
                    <Info className="w-4 h-4" />
                  </span>
                  <p>
                    Privasi tetap terjaga. Ringkasan hanya memuat metadata akun,
                    tanpa profil kesehatan atau isi jurnal pengguna.
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
    </>
  );
};
