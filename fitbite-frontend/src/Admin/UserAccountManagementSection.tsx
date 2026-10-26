import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  Search,
  ChevronDown,
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

const fontRegular = "[font-family:'Inter-Regular',Helvetica]";
const fontMedium = "[font-family:'Inter-Medium',Helvetica]";
const fontSemibold = "[font-family:'Inter-SemiBold',Helvetica]";
const fontBold = "[font-family:'Inter-Bold',Helvetica]";

export const UserAccountManagementSection = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [selectedUser, setSelectedUser] = useState<User>(users[0]);
  const [activeTab, setActiveTab] = useState<"aktivitas" | "akun">("akun");
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

  return (
    <main className="flex h-screen min-h-0 min-w-0 flex-1 grow flex-col items-start relative overflow-y-auto bg-[#f8faf6]">
      <AdminPageHeader currentPage="Akun pengguna" />

      <section className="flex-col items-start pt-[30px] pb-0 px-9 flex gap-6 relative self-stretch w-full">
        <div className="items-center flex gap-6 relative self-stretch w-full">
          <div className="flex flex-col items-start gap-[5px] relative flex-1 grow">
            <div
              className={`self-stretch mt-[-1px] ${fontBold} font-bold text-[#167653] text-[11px] leading-[16.5px]`}
            >
              PENGELOLAAN FITBITE
            </div>
            <h1
              className={`relative self-stretch ${fontRegular} font-normal text-[#203d32] text-3xl tracking-[-0.24px] leading-[37.5px]`}
            >
              Referensi rapi, pengalaman lebih baik.
            </h1>
            <p
              className={`self-stretch ${fontRegular} font-normal text-[#728078] text-[13px] leading-[19.5px]`}
            >
              Ruang administrator • Senin, 19 Oktober 2026
            </p>
          </div>
          <span
            className={`inline-flex px-2.5 py-1 ${fontSemibold} font-semibold text-[#167653] text-[11px] leading-[16.5px] bg-[#eaf3e9] rounded-[100px]`}
          >
            Hanya baca
          </span>
        </div>

        <div
          role="note"
          className="flex items-start gap-[11px] p-3.5 relative self-stretch w-full bg-[#eaf3e9] rounded-[10px]"
        >
          <ShieldCheck className="w-5 h-5 text-[#167653] shrink-0" />
          <p
            className={`flex-1 mt-[-1px] ${fontRegular} font-normal text-[#124b39] text-xs leading-[18px]`}
          >
            Batas akses admin: hanya membaca metadata akun. Status akun tidak
            dapat diubah. Profil kesehatan, foto, dan jurnal pribadi tidak
            tersedia di area ini.
          </p>
        </div>

        <AdminSummaryCards />

        <div
          role="tablist"
          className="flex items-start gap-[5px] rounded-[10px] bg-[#f0f3ec] p-[5px] relative self-stretch w-full"
        >
          <Link
            to="/admin/pengelolaan"
            role="tab"
            aria-selected="false"
            className={`flex items-start justify-center px-3 py-[9px] relative flex-1 grow rounded-[7px] ${fontMedium} font-medium text-[#728078] text-xs leading-[18px] hover:bg-white/70`}
          >
            Katalog makanan
          </Link>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "aktivitas"}
            onClick={() => setActiveTab("aktivitas")}
            className={`flex items-start justify-center px-3 py-[9px] relative flex-1 grow rounded-[7px] ${
              activeTab === "aktivitas"
                ? `bg-white ${fontBold} font-bold text-[#167653]`
                : `${fontMedium} font-medium text-[#728078]`
            } text-xs leading-[18px]`}
          >
            Aktivitas &amp; MET
          </button>
          <Link
            to="/admin/pantau"
            role="tab"
            aria-selected={activeTab === "akun"}
            aria-current="page"
            onClick={() => setActiveTab("akun")}
            className={`flex items-start justify-center px-3 py-[9px] relative flex-1 grow rounded-[7px] ${
              activeTab === "akun"
                ? `bg-white ${fontBold} font-bold text-[#167653]`
                : `${fontMedium} font-medium text-[#728078]`
            } text-xs leading-[18px]`}
          >
            Akun pengguna
          </Link>
        </div>
      </section>

      <section className="flex flex-col items-stretch gap-6 pt-6 pb-7 px-9 relative self-stretch w-full xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="flex w-full min-w-0 flex-col items-start gap-[18px] p-[22px] relative bg-white rounded-[18px] border border-[#e1e7df]">
          <div className="flex flex-col items-start gap-[3px] relative self-stretch w-full">
            <h2
              className={`relative self-stretch mt-[-1px] ${fontBold} font-bold text-[#203d32] text-lg leading-[27px]`}
            >
              Pantau akun pengguna
            </h2>
            <p
              className={`self-stretch ${fontRegular} font-normal text-[#728078] text-xs leading-[18px]`}
            >
              Cari dan pilih akun untuk membaca ringkasan metadata akun.
            </p>
          </div>

          <form
            className="flex items-end gap-3 relative self-stretch w-full"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="flex flex-col items-start gap-[7px] relative flex-1 grow">
              <span
                className={`self-stretch mt-[-1px] ${fontSemibold} font-semibold text-[#203d32] text-[13px] leading-[19.5px]`}
              >
                Cari akun
              </span>
              <span className="flex min-h-[47px] items-center gap-2.5 px-3.5 py-[11px] w-full bg-white rounded-[10px] border border-[#e1e7df]">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Cari nama, email, atau ID akun"
                  placeholder="Cari nama, email, atau ID akun..."
                  className={`relative flex-1 outline-none ${fontRegular} font-normal text-[#203d32] text-sm leading-[21px] placeholder:text-[#a0aca5]`}
                />
                <Search className="w-4 h-4 text-[#728078]" />
              </span>
            </label>

            <label className="flex flex-col w-[200px] items-start gap-[7px] relative">
              <span
                className={`self-stretch mt-[-1px] ${fontSemibold} font-semibold text-[#203d32] text-[13px] leading-[19.5px]`}
              >
                Status akun
              </span>
              <span className="relative w-full">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className={`flex min-h-[47px] appearance-none items-center px-3.5 py-[11px] w-full bg-white rounded-[10px] border border-[#e1e7df] outline-none ${fontRegular} text-[#203d32] text-sm leading-[21px]`}
                >
                  <option>Semua status</option>
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#728078] pointer-events-none" />
              </span>
            </label>
          </form>

          <div className="flex items-start gap-3 p-2.5 relative self-stretch w-full bg-[#f0f3ec] rounded-lg">
            <div
              className={`flex-1 mt-[-1px] ${fontRegular} text-[#728078] text-[9px] leading-[13.5px]`}
            >
              NAMA / EMAIL
            </div>
            <div
              className={`relative w-[88px] mt-[-1px] ${fontRegular} text-[#728078] text-[9px] leading-[13.5px]`}
            >
              DIBUAT
            </div>
            <div
              className={`relative w-[90px] mt-[-1px] ${fontRegular} text-[#728078] text-[9px] leading-[13.5px]`}
            >
              AKSES TERAKHIR
            </div>
            <div
              className={`relative w-20 mt-[-1px] ${fontRegular} text-[#728078] text-[9px] leading-[13.5px]`}
            >
              STATUS
            </div>
            <div
              className={`relative w-14 mt-[-1px] ${fontRegular} text-[#728078] text-[9px] leading-[13.5px]`}
            >
              RINCIAN
            </div>
          </div>

          <div className="flex flex-col items-start relative self-stretch w-full">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUser(user)}
                className={`min-h-[67px] items-center gap-3 px-2.5 py-3.5 flex relative self-stretch w-full text-left border-b border-[#e1e7df] ${
                  selectedUser.id === user.id ? "bg-[#eaf3e9]" : "bg-white"
                }`}
              >
                <span className="flex-col items-start gap-[3px] flex-1 grow">
                  <span
                    className={`block self-stretch mt-[-1px] ${fontSemibold} font-semibold text-[#203d32] text-xs leading-[18px]`}
                  >
                    {user.name}
                  </span>
                  <span
                    className={`block self-stretch ${fontRegular} text-[#728078] text-[10px] leading-[15px]`}
                  >
                    {user.email}
                  </span>
                </span>
                <span
                  className={`relative w-[88px] ${fontRegular} text-[#203d32] text-[10px] leading-[15px]`}
                >
                  {user.created}
                </span>
                <span
                  className={`relative w-[90px] ${fontRegular} text-[#203d32] text-[10px] leading-[15px]`}
                >
                  {user.lastAccess}
                </span>
                <span className="flex w-20 items-start relative">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 ${fontSemibold} text-[11px] leading-[16.5px] rounded-[100px] ${
                      user.status === "Aktif"
                        ? "bg-[#eaf3e9] text-[#167653]"
                        : "bg-[#f0f3ec] text-[#728078]"
                    }`}
                  >
                    {user.status === "Aktif" ? (
                      <UserCheck className="w-3 h-3" />
                    ) : (
                      <UserX className="w-3 h-3" />
                    )}
                    {user.status}
                  </span>
                </span>
                <span className="flex w-14 items-center gap-[5px]">
                  <span
                    className={`${fontSemibold} font-semibold text-[#167653] text-[11px]`}
                  >
                    Lihat
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#167653]" />
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-start justify-between relative self-stretch w-full">
            <p
              className={`relative ${fontRegular} text-[#728078] text-[10px] leading-[15px]`}
            >
              {isEmptySearch
                ? "Menampilkan 0 akun"
                : `Menampilkan 1–${filteredUsers.length} dari 248 akun`}
            </p>
            <div
              className={`${fontRegular} text-[#167653] text-[11px] leading-[16.5px]`}
            >
              ‹&nbsp;&nbsp;1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;…&nbsp;&nbsp;36&nbsp;&nbsp;›
            </div>
          </div>

          <p
            className={`self-stretch ${fontRegular} text-[#728078] text-[10px] leading-[15px]`}
          >
            Semua identitas dan metadata akun pada mockup adalah data contoh.
            Status ditampilkan sebagai informasi, bukan kontrol pengelolaan akun.
          </p>

          <div className="flex items-start gap-[11px] p-3.5 relative self-stretch w-full bg-[#f0f3ec] rounded-[10px]">
            <SearchX className="w-5 h-5 text-[#728078] shrink-0" />
            <div className="flex flex-col items-start gap-1 relative flex-1 grow">
              <div
                className={`${fontRegular} text-[#728078] text-[10px] leading-[15px]`}
              >
                CONTOH PENCARIAN • akun.tidakada@email.com
              </div>
              <div
                className={`${fontSemibold} font-semibold text-[#203d32] text-xs leading-[18px]`}
              >
                Akun tidak ditemukan
              </div>
              <p
                className={`${fontRegular} text-[#728078] text-[11px] leading-[16.5px]`}
              >
                Coba nama, email, atau ID akun lain, atau ubah filter status.
              </p>
            </div>
          </div>
        </article>

        <aside className="flex w-full min-w-0 flex-col items-start gap-[18px] relative xl:-translate-x-[5px]">
          <article className="flex flex-col items-start gap-[18px] p-[22px] relative self-stretch bg-white rounded-[18px] border border-[#e1e7df]">
            <div className="flex items-center justify-between relative self-stretch w-full">
              <h2
                className={`${fontBold} font-bold text-[#203d32] text-lg leading-[27px]`}
              >
                Ringkasan akun
              </h2>
              <span
                className={`${fontSemibold} px-2.5 py-1 text-[#167653] text-[11px] bg-[#eaf3e9] rounded-[100px]`}
              >
                Hanya baca
              </span>
            </div>
            <div className="items-center gap-3 self-stretch w-full flex">
              <div className="flex w-[42px] h-[42px] items-center justify-center bg-[#eaf3e9] rounded-xl text-[#167653]">
                <Eye className="w-[22px] h-[22px]" />
              </div>
              <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                <div
                  className={`${fontSemibold} font-semibold text-[#203d32] text-[15px] leading-[22.5px]`}
                >
                  {selectedUser.name}
                </div>
                <p
                  className={`${fontRegular} text-[#728078] text-[11px] leading-[16.5px]`}
                >
                  Akun terpilih • data contoh
                </p>
              </div>
              <span
                className={`${fontSemibold} px-2.5 py-1 text-[#167653] text-[11px] bg-[#eaf3e9] rounded-[100px]`}
              >
                {selectedUser.status}
              </span>
            </div>

            {detailFields.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col items-start gap-1 pt-0 pb-3 relative self-stretch border-b border-[#e1e7df]"
              >
                <div
                  className={`${fontRegular} text-[#728078] text-[11px] leading-[16.5px]`}
                >
                  {label}
                </div>
                <div
                  className={`${fontMedium} font-medium text-[#203d32] text-[13px] leading-[19.5px]`}
                >
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

            <p
              className={`${fontRegular} text-[#728078] text-[10px] leading-[15px]`}
            >
              Admin hanya dapat membaca ringkasan ini. Tidak ada akses untuk
              mengubah metadata maupun status akun.
            </p>
          </article>

          <div className="flex items-start gap-[11px] p-3.5 relative self-stretch w-full bg-[#eaf3e9] rounded-[10px]">
            <Info className="w-5 h-5 text-[#167653] shrink-0" />
            <p
              className={`flex-1 mt-[-1px] ${fontRegular} text-[#124b39] text-xs leading-[18px]`}
            >
              Privasi tetap terjaga. Ringkasan hanya memuat metadata akun, tanpa
              profil kesehatan atau isi jurnal pengguna.
            </p>
          </div>
        </aside>
      </section>

      <footer className="flex items-start justify-between pt-2 pb-6 px-9 relative self-stretch w-full">
        <p
          className={`${fontRegular} text-[#728078] text-[10px] leading-[15px]`}
        >
          Area administrasi • Tidak memuat data kesehatan pribadi pengguna.
        </p>
        <p
          className={`${fontRegular} text-[#728078] text-[10px] leading-[15px]`}
        >
          FitBite © 2026
        </p>
      </footer>
    </main>
  );
};