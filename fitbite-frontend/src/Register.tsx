import { useState, type FormEvent, type ReactElement } from "react";
import identitasFitbite from "./assets/Identitas FitBite.png";
import lapisanKeterbacaan from "./assets/Lapisan keterbacaan.png";
import lariPagiDiTaman from "./assets/Lari pagi di taman.png";

const image = "";
const vector = "";
const vector2 = "";
const vector3 = "";
const vector4 = "";

export const BrandStorySection = () => {
  return (
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
            MULAI PERJALANANMU
          </div>
          <h1 className="relative font-poppins font-semibold text-white text-[34px] leading-[40px] tracking-tight">
            Mulai dari dirimu.
            <br />
            Tumbuh setiap hari.
          </h1>
          <p className="font-normal text-[#e1eadd] text-xs leading-relaxed max-w-[340px]">
            Kenali kebutuhan tubuh, nikmati makananmu, dan bangun rutinitas yang
            terasa pas.
          </p>
        </div>
      </div>

      {/* Card Info Bawah Kiri */}
      <aside className="relative z-10 flex flex-col w-full items-start gap-1.5 p-4 bg-[#ffffffd9] backdrop-blur-md rounded-[16px] shadow-sm hover:bg-white/90 transition-all duration-300">
        <div className="flex items-center gap-2 w-full">
          {vector && (
            <div className="relative w-4 h-4 shrink-0">
              <img
                className="w-full h-full object-contain"
                alt=""
                aria-hidden="true"
                src={vector}
              />
            </div>
          )}
          <p className="font-bold text-[#203d32] text-xs">
            Bukan tentang diet yang sempurna.
          </p>
        </div>
        <p className="font-normal text-[#728078] text-[11px] leading-relaxed">
          Tentang pilihan yang lebih sadar. Catat nutrisi, gerak, dan air
          minum dalam satu ruang yang ramah.
        </p>
      </aside>
    </section>
  );
};

export const AccountRegistrationSection = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Kata sandi harus memiliki setidaknya 8 karakter.");
      return;
    }

    if (!agreement) {
      setErrorMessage("Kamu harus menyetujui syarat dan ketentuan.");
      return;
    }

    setIsSubmitted(true);
  };

  return (
    <section
      aria-label="Pendaftaran Akun FitBite"
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
              RUANG SEHATMU DIMULAI
            </div>
          </div>
          <h2 className="font-bold text-[#203d32] text-[24px] leading-tight">
            Ruang sehatmu dimulai.
          </h2>
          <p className="font-normal text-[#728078] text-xs">
            Daftar akun, kenali tubuhmu, lalu bersama, bikin hidup terasa lebih ringan.
          </p>
        </header>

        {isSubmitted ? (
          <div
            role="status"
            className="w-full rounded-xl border border-[#c8d8a0] bg-[#edf3d8] p-5 text-[#183b36] shadow-sm animate-fade-in"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#167653] text-white font-bold text-xs">
              ✓
            </div>
            <h3 className="text-base font-bold">Akun berhasil dibuat</h3>
            <p className="mt-1 text-xs text-[#728078]">
              Selamat datang di FitBite. Kami siap menemani perjalanan sehatmu.
            </p>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="mt-4 text-xs font-semibold text-[#167653] underline underline-offset-4 hover:text-[#125f43] transition-colors"
            >
              Buat akun lain
            </button>
          </div>
        ) : (
          <form className="flex flex-col items-start gap-2.5 w-full" onSubmit={handleSubmit}>
            {/* Field Nama Lengkap */}
            <div className="flex flex-col items-start gap-1 w-full">
              <label htmlFor="full-name" className="text-[#203d32] text-[11px] font-semibold">
                Nama lengkap
              </label>
              <div className="flex min-h-[38px] items-center px-3 py-1 w-full bg-white rounded-lg border border-[#e1e7df] focus-within:border-[#167653] focus-within:ring-2 focus-within:ring-[#167653]/20 transition-all duration-200">
                <input
                  id="full-name"
                  type="text"
                  required
                  placeholder="Nadia Putri"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent outline-none font-normal text-[#203d32] text-xs placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Field Email */}
            <div className="flex flex-col items-start gap-1 w-full">
              <label htmlFor="email" className="text-[#203d32] text-[11px] font-semibold">
                Email
              </label>
              <div className="flex min-h-[38px] items-center gap-2 px-3 py-1 w-full bg-white rounded-lg border border-[#e1e7df] focus-within:border-[#167653] focus-within:ring-2 focus-within:ring-[#167653]/20 transition-all duration-200">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="nadia.putri@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none font-normal text-[#203d32] text-xs placeholder:text-gray-300"
                />
                {image && <img className="w-4 h-4" alt="" aria-hidden="true" src={image} />}
              </div>
            </div>

            {/* Field Password */}
            <div className="flex flex-col items-start gap-1 w-full">
              <label htmlFor="password" className="text-[#203d32] text-[11px] font-semibold">
                Kata sandi
              </label>
              <div className="flex min-h-[38px] items-center gap-2 px-3 py-1 w-full bg-white rounded-lg border border-[#e1e7df] focus-within:border-[#167653] focus-within:ring-2 focus-within:ring-[#167653]/20 transition-all duration-200">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none font-normal text-[#203d32] text-xs placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="w-4 h-4 shrink-0 text-[10px] text-gray-500 hover:text-[#167653] transition-colors"
                >
                  {vector2 ? <img className="w-full h-full" alt="" src={vector2} /> : (showPassword ? "🙈" : "👁️")}
                </button>
              </div>
            </div>

            {/* Checkbox Syarat & Ketentuan */}
            <div className="flex items-start gap-2 w-full pt-1">
              <input
                id="agreement"
                type="checkbox"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-[#167653] focus:ring-[#167653]"
              />
              <label htmlFor="agreement" className="text-[#728078] text-[10px] leading-tight cursor-pointer">
                Saya menyetujui{" "}
                <a href="#terms" className="font-semibold text-[#167653] hover:underline">
                  kebijakan privasi
                </a>{" "}
                serta{" "}
                <a href="#terms" className="font-semibold text-[#167653] hover:underline">
                  ketentuan penggunaan
                </a>{" "}
                FitBite.
              </label>
            </div>

            {errorMessage && (
              <p className="text-[10px] font-medium text-red-500 mt-0.5">{errorMessage}</p>
            )}

            {/* Tombol Daftar */}
            <button
              type="submit"
              className="flex min-h-[38px] items-center justify-center gap-2 px-4 py-2 w-full bg-[#167653] hover:bg-[#125f43] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg rounded-lg text-white font-semibold text-xs mt-1 cursor-pointer"
            >
              {vector3 && (
                <span className="w-4 h-4">
                  <img className="w-full h-full" alt="" aria-hidden="true" src={vector3} />
                </span>
              )}
              <span>Daftar</span>
            </button>
          </form>
        )}

        {/* Footer Link ke Login */}
        <p className="text-xs text-center w-full mt-1">
          <span className="text-[#728078]">Sudah punya akun? </span>
          <a href="/login" className="font-bold text-[#167653] hover:underline transition-all">
            Masuk di sini
          </a>
        </p>
      </div>

      {/* Footer Bawah */}
      <footer className="flex flex-col items-start gap-1 w-full pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 w-full">
          {vector4 && (
            <div className="w-3.5 h-3.5 shrink-0">
              <img className="w-full h-full" alt="" aria-hidden="true" src={vector4} />
            </div>
          )}
          <p className="text-[#728078] text-[10px]">
            Data kesehatanmu pribadi. Kamu yang memegang kendali.
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
  );
};

export const Daftar = () => {
  return (
    <main className="flex h-screen w-screen items-center justify-center p-4 bg-[#f6f7f2] overflow-hidden">
      <div className="flex w-full max-w-[1100px] h-full max-h-[680px] bg-white rounded-[24px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#e1e7df]">
        <BrandStorySection />
        <AccountRegistrationSection />
      </div>
    </main>
  );
};

export default Daftar;