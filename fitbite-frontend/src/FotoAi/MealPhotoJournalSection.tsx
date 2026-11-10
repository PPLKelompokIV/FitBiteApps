import { useRef, useState, type ChangeEvent, type ReactElement } from "react";
import {
  ChevronRight,
  Bell,
  ArrowLeft,
  Info,
  RotateCcw,
  Upload,
  RefreshCw,
  Plus,
  Check,
  Trash2,
} from "lucide-react";

type Meal = {
  id: string;
  name: string;
  detail: string;
  portion: string;
  calories: string;
  nutrients: [string, string, string]; // [Protein, Karbo, Lemak]
};

const initialMeals: Meal[] = [
  {
    id: "1",
    name: "Nasi merah",
    detail: "Matang",
    portion: "150 g",
    calories: "165",
    nutrients: ["4", "35", "1"],
  },
  {
    id: "2",
    name: "Ayam panggang",
    detail: "Dengan bumbu",
    portion: "120 g",
    calories: "220",
    nutrients: ["26", "0", "12"],
  },
  {
    id: "3",
    name: "Tempe panggang",
    detail: "2 potong kecil",
    portion: "75 g",
    calories: "145",
    nutrients: ["10", "12", "5"],
  },
  {
    id: "4",
    name: "Sayur bening",
    detail: "1 mangkuk",
    portion: "150 g",
    calories: "70",
    nutrients: ["2", "18", "1"],
  },
];

const mealTypes = ["Sarapan", "Makan siang", "Makan malam", "Camilan"];

export const MealPhotoJournalSection = (): ReactElement => {
  const [selectedMealType, setSelectedMealType] = useState("Makan siang");
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rows, setRows] = useState<Meal[]>(initialMeals);
  
  // Tanggal & waktu default otomatis mengikuti hari dan jam saat ini
  const todayDateStr = new Date().toISOString().split("T")[0];
  const currentTimeStr = new Date().toTimeString().slice(0, 5);
  const [entryDate, setEntryDate] = useState(todayDateStr);
  const [entryTime, setEntryTime] = useState(currentTimeStr);

  const [photoPreview, setPhotoPreview] = useState<string>(
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  );
  const [photoInfo, setPhotoInfo] = useState({
    name: "makan-siang.jpg",
    size: "2,4 MB",
    isSample: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setPhotoInfo({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`,
        isSample: false,
      });
    }
  };

  const updateMeal = (
    id: string,
    field: "portion" | "calories" | "name" | "detail",
    value: string
  ) => {
    setRows((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const updateNutrient = (
    id: string,
    nutrientIndex: number,
    value: string
  ) => {
    setRows((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const newNutrients = [...item.nutrients] as [string, string, string];
        newNutrients[nutrientIndex] = value;
        return { ...item, nutrients: newNutrients };
      })
    );
  };

  const deleteMeal = (id: string) => {
    setRows((current) => current.filter((item) => item.id !== id));
  };

  const addMeal = () => {
    const newId = String(Date.now());
    setRows((current) => [
      ...current,
      {
        id: newId,
        name: "Komponen baru",
        detail: "Belum diatur",
        portion: "100 g",
        calories: "100",
        nutrients: ["5", "15", "2"],
      },
    ]);
  };

  // Hitung total ringkasan
  const totalCalories = rows.reduce((acc, row) => acc + (parseFloat(row.calories) || 0), 0);
  const totalProtein = rows.reduce((acc, row) => acc + (parseFloat(row.nutrients[0]) || 0), 0);
  const totalCarb = rows.reduce((acc, row) => acc + (parseFloat(row.nutrients[1]) || 0), 0);
  const totalFat = rows.reduce((acc, row) => acc + (parseFloat(row.nutrients[2]) || 0), 0);

  return (
    <main className="relative flex min-h-screen flex-1 flex-col bg-[#f8faf6]">
      {/* Top Header Navbar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-[#e1e7df] bg-white px-8">
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-xs">
          <span className="text-[#728078]">Ruang sehat</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#728078]" />
          <strong className="font-semibold text-[#203d32]">Jurnal makanan</strong>
        </nav>
        <div className="inline-flex items-center gap-4">
          <span className="rounded-full bg-[#f0f3ec] px-3 py-1 font-semibold text-[11px] text-[#728078]">
            Data contoh
          </span>
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#728078] hover:bg-[#f0f3ec] hover:text-[#203d32]"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#167653]" />
          </button>
          <div
            aria-label="Profil NP"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcebb2] font-bold text-xs text-[#203d32]"
          >
            NP
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex w-full flex-col gap-6 p-8">
        {/* Title and Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[11px] tracking-wider uppercase text-[#167653]">
              JURNAL MAKANAN / FOTO AI
            </span>
            <h1 className="font-bold text-2xl tracking-tight text-[#203d32]">
              Kenali isi piringmu.
            </h1>
            <p className="font-normal text-xs text-[#728078]">
              Senin, 19 Oktober 2026 • 12.25 WIB · Tinjauan makan siang sebelum disimpan
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e1e7df] bg-white px-4 py-2.5 font-semibold text-xs text-[#167653] transition-colors hover:bg-[#f8faf6]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke jurnal</span>
          </button>
        </div>

        {/* Info Banner Alert */}
        <aside className="flex items-start gap-3 rounded-xl bg-[#eaf3e9] p-4 text-[#124b39]">
          <Info className="h-5 w-5 shrink-0 text-[#167653]" />
          <p className="text-xs leading-relaxed">
            Ini estimasi AI, bukan pengukuran pasti. Periksa jenis makanan, porsi, minyak, dan saus sebelum menyimpan. Kamu bisa mengubah semua nilai.
          </p>
        </aside>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Kolom Kiri: Foto Makanan & Bantuan */}
          <section className="flex flex-col gap-5 lg:col-span-5">
            {/* Kartu Foto Makanan */}
            <article className="flex flex-col gap-4 rounded-2xl border border-[#e1e7df] bg-white p-5">
              <h2 className="font-bold text-base text-[#203d32]">Foto makananmu</h2>
              <div className="flex flex-col gap-2">
                <div className="relative h-64 w-full overflow-hidden rounded-xl bg-[#f0f3ec]">
                  <img
                    className="h-full w-full object-cover"
                    src={photoPreview}
                    alt="Foto hidangan makan siang"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#728078]">
                    {photoInfo.name} • {photoInfo.size}
                  </span>
                  {photoInfo.isSample && (
                    <span className="rounded-full bg-[#f0f3ec] px-2.5 py-0.5 font-semibold text-[10px] text-[#728078]">
                      Foto contoh
                    </span>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Foto */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e1e7df] bg-white px-3 py-2.5 font-semibold text-xs text-[#167653] transition-colors hover:bg-[#f8faf6]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Ambil ulang</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e1e7df] bg-white px-3 py-2.5 font-semibold text-xs text-[#167653] transition-colors hover:bg-[#f8faf6]"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Unggah foto</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileUpload}
                  aria-label="Unggah foto makanan"
                />
              </div>
              <p className="text-[11px] leading-relaxed text-[#728078]">
                Kamera tidak tersedia atau izin ditolak? Unggah foto dari perangkat. Format JPG/PNG, maksimal 10 MB.
              </p>
            </article>

            {/* Kartu Bantuan Hasil Belum Sesuai */}
            <article className="flex flex-col gap-3.5 rounded-2xl border border-[#e1e7df] bg-white p-5">
              <h2 className="font-bold text-base text-[#203d32]">Hasil belum sesuai?</h2>
              <p className="text-xs leading-relaxed text-[#728078]">
                Jika makanan tidak terdeteksi, gunakan foto yang lebih terang dan ambil dari atas. Tak perlu menunggu AI untuk tetap mencatat.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e1e7df] bg-white px-3 py-2.5 font-semibold text-xs text-[#167653] transition-colors hover:bg-[#f8faf6]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Coba lagi</span>
                </button>
                <button
                  type="button"
                  onClick={addMeal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#eaf3e9] px-3 py-2.5 font-semibold text-xs text-[#167653] transition-colors hover:bg-[#dcebb2]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Quick Add</span>
                </button>
              </div>
            </article>

            <p className="text-[11px] leading-relaxed text-[#728078]">
              Simulasi hasil untuk mockup. Gemini Vision direncanakan sebagai layanan analisis foto; tidak ada integrasi aktif pada tampilan ini.
            </p>
          </section>

          {/* Kolom Kanan: Rincian Nutrisi & Konfirmasi Simpan */}
          <section className="flex flex-col gap-5 lg:col-span-7">
            {/* Tabel Komponen Terdeteksi */}
            <article className="flex flex-col gap-4 rounded-2xl border border-[#e1e7df] bg-white p-6">
              <div>
                <h2 className="font-bold text-base text-[#203d32]">
                  {rows.length} komponen terdeteksi
                </h2>
                <p className="text-xs text-[#728078]">
                  Ubah porsi dan nutrisi jika berbeda dengan isi piringmu.
                </p>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-[#728078] pb-1 border-b border-[#e1e7df]">
                <span className="col-span-5">MAKANAN</span>
                <span className="col-span-2 text-center">PORSI</span>
                <span className="col-span-2 text-center">KKAL</span>
                <span className="col-span-3 text-center">P / K / L (g)</span>
              </div>

              {/* List of Meal Rows */}
              <div className="flex flex-col gap-3">
                {rows.map((meal) => (
                  <div
                    key={meal.id}
                    className="group grid grid-cols-12 items-center gap-2 rounded-lg p-1 hover:bg-[#f8faf6]"
                  >
                    {/* Nama Makanan & Detail */}
                    <div className="col-span-5 flex flex-col min-w-0 pr-1">
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => updateMeal(meal.id, "name", e.target.value)}
                        className="truncate font-semibold text-xs text-[#203d32] bg-transparent outline-none focus:text-[#167653]"
                      />
                      <input
                        type="text"
                        value={meal.detail}
                        onChange={(e) => updateMeal(meal.id, "detail", e.target.value)}
                        className="truncate text-[10px] text-[#728078] bg-transparent outline-none"
                      />
                    </div>

                    {/* Porsi */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={meal.portion}
                        onChange={(e) => updateMeal(meal.id, "portion", e.target.value)}
                        aria-label={`${meal.name} porsi`}
                        className="w-full rounded-md border border-[#e1e7df] bg-white px-2 py-1.5 text-center text-xs text-[#203d32] outline-none focus:border-[#167653]"
                      />
                    </div>

                    {/* Kalori */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={meal.calories}
                        onChange={(e) => updateMeal(meal.id, "calories", e.target.value)}
                        aria-label={`${meal.name} kalori`}
                        className="w-full rounded-md border border-[#e1e7df] bg-white px-2 py-1.5 text-center text-xs text-[#203d32] outline-none focus:border-[#167653]"
                      />
                    </div>

                    {/* Nutrisi [P / K / L] & Tombol Hapus */}
                    <div className="col-span-3 flex items-center gap-1">
                      {meal.nutrients.map((nutrient, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={nutrient}
                          onChange={(e) => updateNutrient(meal.id, idx, e.target.value)}
                          aria-label={`${meal.name} ${["protein", "karbohidrat", "lemak"][idx]}`}
                          className="w-full rounded-md border border-[#e1e7df] bg-white px-1 py-1.5 text-center text-xs text-[#203d32] outline-none focus:border-[#167653]"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => deleteMeal(meal.id)}
                        title="Hapus baris"
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#728078] hover:text-red-500 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-[#728078]">
                P = protein · K = karbohidrat · L = lemak. Ketuk nilai untuk mengoreksi.
              </p>

              <div className="h-px w-full bg-[#e1e7df]" />

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={addMeal}
                  className="font-semibold text-[#167653] hover:underline"
                >
                  + Tambah komponen yang terlewat
                </button>
                <span className="text-[11px] text-[#728078]">
                  Hapus item: arahkan kursor ke baris → ketuk ikon hapus
                </span>
              </div>
            </article>

            {/* Total Estimasi Ringkasan */}
            <article className="flex flex-col gap-4 rounded-2xl bg-[#eaf3e9] p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-[#203d32]">Total estimasi</h2>
                <span className="rounded-full bg-[#dcebb2] px-2.5 py-0.5 font-semibold text-[11px] text-[#167653]">
                  Belum masuk jurnal
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-[#728078]">Energi</span>
                  <strong className="font-bold text-lg text-[#203d32]">
                    {Math.round(totalCalories)} kkal
                  </strong>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#728078]">Protein</span>
                  <strong className="font-bold text-lg text-[#203d32]">
                    {Math.round(totalProtein)} g
                  </strong>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#728078]">Karbo</span>
                  <strong className="font-bold text-lg text-[#203d32]">
                    {Math.round(totalCarb)} g
                  </strong>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#728078]">Lemak</span>
                  <strong className="font-bold text-lg text-[#203d32]">
                    {Math.round(totalFat)} g
                  </strong>
                </div>
              </div>
            </article>

            {/* Form Simpan Sebagai */}
            <article className="flex flex-col gap-5 rounded-2xl border border-[#e1e7df] bg-white p-6">
              <h2 className="font-bold text-base text-[#203d32]">Simpan sebagai</h2>

              {/* Meal Types Tabs */}
              <div
                role="tablist"
                aria-label="Jenis waktu makan"
                className="flex items-center gap-1 rounded-xl bg-[#f0f3ec] p-1"
              >
                {mealTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="tab"
                    aria-selected={selectedMealType === type}
                    onClick={() => setSelectedMealType(type)}
                    className={`flex-1 rounded-lg py-2 text-center text-xs font-medium transition-colors ${
                      selectedMealType === type
                        ? "bg-white font-bold text-[#167653] shadow-xs"
                        : "text-[#728078] hover:text-[#203d32]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Input Tanggal & Waktu */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 cursor-pointer">
                  <span className="font-semibold text-xs text-[#203d32]">Tanggal</span>
                  <div className="flex items-center gap-2 rounded-xl border border-[#e1e7df] bg-white px-3.5 py-2.5">
                    <input
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      aria-label="Tanggal makan"
                      className="w-full bg-transparent text-xs text-[#203d32] outline-none cursor-pointer"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5 cursor-pointer">
                  <span className="font-semibold text-xs text-[#203d32]">Waktu makan</span>
                  <div className="flex items-center gap-2 rounded-xl border border-[#e1e7df] bg-white px-3.5 py-2.5">
                    <input
                      type="time"
                      value={entryTime}
                      onChange={(e) => setEntryTime(e.target.value)}
                      aria-label="Waktu makan"
                      className="w-full bg-transparent text-xs text-[#203d32] outline-none cursor-pointer"
                    />
                    <span className="text-xs text-[#728078]">WIB</span>
                  </div>
                </label>
              </div>

              {/* Checkbox Konfirmasi */}
              <label className="flex items-center gap-2 text-xs text-[#728078] cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#167653]"
                />
                <span>Saya sudah meninjau porsi dan estimasi nutrisi.</span>
              </label>

              {/* Submit Button */}
              <button
                type="button"
                disabled={!checked}
                onClick={() => setSaved(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#167653] px-4 py-3 font-semibold text-xs text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{saved ? "Tersimpan di jurnal" : "Simpan ke jurnal"}</span>
              </button>
            </article>
          </section>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-auto flex w-full items-center justify-between border-t border-[#e1e7df] bg-white px-8 py-4 text-[11px] text-[#728078]">
        <p>FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli gizi.</p>
        <span>FitBite © 2026</span>
      </footer>
    </main>
  );
};
