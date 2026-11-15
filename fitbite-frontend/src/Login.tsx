import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import identitasFitbite from "./assets/Identitas FitBite.png";
import lapisanKeterbacaan from "./assets/Lapisan keterbacaan.png";
import lariPagiDiTaman from "./assets/Lari pagi di taman.png";
import { setAuthSession } from "./utils/auth";
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";

export const Masuk = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("budi@fitbite.com");
  const [password, setPassword] = useState("Budi123!");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFillDemo = (type: "user" | "admin") => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (type === "admin") {
      setEmail("admin@fitbite.com");
      setPassword("Admin123!");
    } else {
      setEmail("budi@fitbite.com");
      setPassword("Budi123!");
    }
  };

  return (
    <main className="flex h-screen w-screen items-center justify-center p-4 bg-[#f6f7f2] overflow-hidden">
      {/* Efek Card: Tambah hover shadow & transisi halus */}
      <div className="flex w-full max-w-[1100px] h-full max-h-[680px] bg-white rounded-[24px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#e1e7df]">
        
        {/* Section Kiri - Banner / Gambar */}
        <section
          aria-label="Tentang FitBite"
          className="flex flex-col w-[45%] h-full items-start justify-between p-8 relative bg-[#124b39] overflow-hidden shrink-0"
        >
          <img
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            alt="Lari pagi di taman"
            src={lariPagiDiTaman}
          />
          <img
            className="absolute top-0 left-0 w-full h-full object-cover"
            alt=""
            aria-hidden="true"
            src={lapisanKeterbacaan}
          />

          {/* Header & Logo Kiri */}
          <div className="relative z-10 flex flex-col items-start gap-4 w-full">
            <img
              className="relative h-7 object-contain"
              alt="FitBite"
              src={identitasFitbite}
            />
            <div className="flex flex-col items-start gap-2 pt-2 w-full">
              <div className="relative font-bold text-[#dcebb2] text-[10px] tracking-wider uppercase">
                TEMAN SEHAT, SETIAP HARI
              </div>
              <h1 className="relative font-poppins font-semibold text-white text-[34px] leading-[40px] tracking-tight">
                Langkah kecil.
                <br />
                Tubuh lebih baik.
              </h1>
              <p className="font-normal text-[#e1eadd] text-xs leading-relaxed max-w-[340px]">
                Kenali kebutuhan tubuh, nikmati makananmu, dan bangun rutinitas yang
                terasa pas.
              </p>
            </div>
          </div>

          {/* Card Info Bawah Kiri dengan Efek Glassmorphism & Hover */}
          <aside className="relative z-10 flex flex-col w-full items-start gap-1.5 p-4 bg-[#ffffffd9] backdrop-blur-md rounded-[16px] shadow-sm hover:bg-white/90 transition-all duration-300">
            <div className="flex items-center gap-2 w-full">
              <ShieldCheck className="w-4 h-4 text-[#167653] shrink-0" />
              <p className="font-bold text-[#203d32] text-xs">
                Sistem Keamanan 4A Terintegrasi
              </p>
            </div>
            <p className="font-normal text-[#728078] text-[11px] leading-relaxed">
              Dilengkapi Authentication kriptografis, Authorization berbasis peran (Admin/User),
              dan pencatatan audit sesi yang aman.
            </p>
          </aside>
        </section>

        {/* Section Kanan - Form Login */}
        <section
          aria-label="Masuk ke FitBite"
          className="flex flex-col justify-between items-start p-8 relative flex-1 h-full bg-white overflow-hidden"
        >
          {/* Link Bantuan Atas */}
          <div className="flex items-start justify-end w-full">
            <p className="text-xs leading-4">
              <span className="text-[#728078]">Butuh bantuan?&nbsp;&nbsp;</span>
              <a className="text-[#167653] font-medium hover:underline transition-all" href="mailto:bantuan@fitbite.id">
                Hubungi kami ↗
              </a>
            </p>
          </div>

          {/* Container Form Utama */}
          <div className="flex flex-col items-start gap-3 w-full max-w-[380px] mx-auto my-auto">
            <header className="flex flex-col items-start gap-1 w-full">
              <div className="inline-flex items-start px-2.5 py-0.5 bg-[#eaf3e9] rounded-full">
                <div className="text-[#167653] text-[9px] font-semibold tracking-wider uppercase">
                  SELAMAT DATANG KEMBALI
                </div>
              </div>
              <h2 className="font-bold text-[#203d32] text-[26px] leading-tight">
                Senang melihatmu lagi.
              </h2>
              <p className="font-normal text-[#728078] text-xs">
                Masuk dan lanjutkan perjalanan sehatmu bersama FitBite.
              </p>
            </header>

            {/* Quick Demo Selector untuk Pengujian */}
            <div className="flex items-center gap-2 w-full py-1">
              <span className="text-[10px] text-[#728078] font-medium">Akun Uji:</span>
              <button
                type="button"
                onClick={() => handleFillDemo("user")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f5ec] hover:bg-[#e2edd9] text-[#167653] text-[10px] font-semibold transition-colors cursor-pointer border border-[#c9ddc1]"
              >
                <UserCheck className="w-3 h-3" />
                User (Budi)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fdf3e7] hover:bg-[#fae3cc] text-[#b45309] text-[10px] font-semibold transition-colors cursor-pointer border border-[#fed7aa]"
              >
                <ShieldCheck className="w-3 h-3" />
                Admin
              </button>
            </div>

            {/* Notifikasi Error */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 w-full p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-shake"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Notifikasi Sukses */}
            {successMessage && (
              <div
                role="status"
                className="flex items-center gap-2 w-full p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="flex-1 font-medium">{successMessage}</span>
              </div>
            )}

            <form className="flex flex-col items-start gap-3 w-full" onSubmit={handleSubmit}>
              {/* Field Email dengan Efek Focus Glow */}
              <div className="flex flex-col items-start gap-1 w-full">
                <label
                  htmlFor="email"
                  className="text-[#203d32] text-[12px] font-semibold"
                >
                  Email
                </label>
                <div className="flex min-h-[40px] items-center gap-2 px-3 py-1.5 w-full bg-white rounded-lg border border-[#e1e7df] focus-within:border-[#167653] focus-within:ring-2 focus-within:ring-[#167653]/20 transition-all duration-200">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-transparent outline-none font-normal text-[#203d32] text-xs"
                  />
                </div>
              </div>

              {/* Field Password dengan Efek Focus Glow */}
              <div className="flex flex-col items-start gap-1 w-full">
                <label
                  htmlFor="password"
                  className="text-[#203d32] text-[12px] font-semibold"
                >
                  Kata sandi
                </label>
                <div className="flex min-h-[40px] items-center gap-2 px-3 py-1.5 w-full bg-white rounded-lg border border-[#e1e7df] focus-within:border-[#167653] focus-within:ring-2 focus-within:ring-[#167653]/20 transition-all duration-200">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none font-normal text-[#203d32] text-xs"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-xs text-gray-400 hover:text-[#167653] transition-colors p-1"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Checkbox Remember & Lupa Password */}
              <div className="flex items-center justify-between w-full pt-0.5">
                <label className="flex items-center gap-1.5 text-[#728078] text-[11px] cursor-pointer hover:text-[#203d32] transition-colors">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="rounded border-gray-300 text-[#167653] focus:ring-[#167653]"
                  />
                  Ingat saya
                </label>
                <a
                  href="#forgot-password"
                  className="font-semibold text-[#167653] text-[11px] hover:underline transition-all"
                >
                  Lupa kata sandi?
                </a>
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex min-h-[40px] items-center justify-center gap-2 px-4 py-2 w-full bg-[#167653] hover:bg-[#125f43] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg rounded-lg text-white font-semibold text-xs mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi kredensial...</span>
                  </>
                ) : (
                  <span>Masuk</span>
                )}
              </button>
            </form>

            {/* Footer Form Register */}
            <p className="text-xs text-center w-full">
              <span className="text-[#728078]">Baru di FitBite? </span>
              <Link to="/register" className="font-bold text-[#167653] hover:underline transition-all">
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* Footer Bawah */}
          <footer className="flex flex-col items-start gap-1 w-full pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 w-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#167653] shrink-0" />
              <p className="text-[#728078] text-[10px]">
                Data kesehatanmu pribadi. Kamu yang memegang kendali penuh.
              </p>
            </div>
            <p className="text-[#728078] text-[9px]">
              FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli gizi.
            </p>
            <p className="text-[#728078] text-[9px]">
              © 2026 FitBite · Kebijakan privasi · Ketentuan penggunaan
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default Masuk;
