import { useState, useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import fotoHidangan from "../assets/foto-hidangan.png";
import fotoHidangan2 from "../assets/foto-hidangan-2.png";
import fotoHidangan3 from "../assets/foto-hidangan-3.png";
import {
  ChevronRight,
  ChevronDown,
  Bell,
  Calendar,
  Pencil,
  Search,
  CheckCircle2,
  Plus,
  ScanBarcode,
  Camera,
  Sparkles,
} from "lucide-react";

type Meal = {
  name: string;
  time: string;
  calories: string;
  items: {
    name: string;
    detail: string;
    calories: string;
  }[];
  macros: string;
};

const defaultMeals: Meal[] = [
  {
    name: "Sarapan",
    time: "07.30 WIB",
    calories: "350 kkal",
    items: [
      {
        name: "Oat matang",
        detail: "1 mangkuk • 200 g",
        calories: "200",
      },
      {
        name: "Pisang",
        detail: "1 buah kecil • 100 g",
        calories: "90",
      },
      {
        name: "Yoghurt tawar",
        detail: "100 g",
        calories: "60",
      },
    ],
    macros: "Protein 20 g  ·  Karbo 50 g  ·  Lemak 8 g",
  },
  {
    name: "Makan siang",
    time: "12.30 WIB",
    calories: "600 kkal",
    items: [
      {
        name: "Nasi merah",
        detail: "150 g",
        calories: "165",
      },
      {
        name: "Ayam panggang",
        detail: "120 g",
        calories: "220",
      },
      {
        name: "Tempe panggang",
        detail: "75 g",
        calories: "145",
      },
      {
        name: "Sayur bening",
        detail: "1 mangkuk • 150 g",
        calories: "70",
      },
    ],
    macros: "Protein 42 g  ·  Karbo 65 g  ·  Lemak 19 g",
  },
  {
    name: "Makan malam",
    time: "18.00 WIB",
    calories: "250 kkal",
    items: [
      {
        name: "Sup sayur",
        detail: "1 mangkuk • 250 g",
        calories: "170",
      },
      {
        name: "Tahu kukus",
        detail: "100 g",
        calories: "80",
      },
    ],
    macros: "Protein 18 g  ·  Karbo 15 g  ·  Lemak 13 g",
  },
  {
    name: "Camilan",
    time: "15.00 WIB",
    calories: "150 kkal",
    items: [
      {
        name: "Pepaya",
        detail: "150 g",
        calories: "60",
      },
      {
        name: "Yoghurt tawar",
        detail: "150 g",
        calories: "90",
      },
    ],
    macros: "Protein 10 g  ·  Karbo 20 g  ·  Lemak 3 g",
  },
];

const recommendations = [
  {
    title: "Gado-gado, saus terpisah",
    detail: "250 g • 330 kkal • protein 18 g",
    image: fotoHidangan,
  },
  {
    title: "Pepes ikan & nasi merah",
    detail: "280 g • 420 kkal • protein 32 g",
    image: fotoHidangan3,
  },
  {
    title: "Soto ayam bening",
    detail: "350 g • 350 kkal • protein 27 g",
    image: fotoHidangan2,
  },
];

const tabs = ["Katalog", "Foto AI", "Barcode", "Quick Add"];
const mealTabs = ["Sarapan", "Makan siang", "Makan malam", "Camilan"];

const textClass = "[font-family:'Inter-Regular',Helvetica] font-normal";
const mediumClass = "[font-family:'Inter-Medium',Helvetica] font-medium";
const semiboldClass = "[font-family:'Inter-SemiBold',Helvetica] font-semibold";
const boldClass = "[font-family:'Inter-Bold',Helvetica] font-bold";

function SegmentedTabs({
  values,
  selected,
  onSelect,
  small = false,
}: {
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
  small?: boolean;
}) {
  return (
    <div className="flex w-full gap-[5px] overflow-hidden rounded-[10px] bg-[#f0f3ec] p-[5px]">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={`flex flex-1 items-center justify-center rounded-[7px] px-3 ${
            small ? "py-[9px]" : "py-[9px]"
          } transition-all ${
            selected === value
              ? "bg-white shadow-xs"
              : "hover:bg-white/50 text-[#728078]"
          }`}
          aria-pressed={selected === value}
        >
          <span
            className={`whitespace-nowrap text-xs leading-[18px] ${
              selected === value
                ? `${boldClass} text-[#167653]`
                : `${mediumClass} text-[#728078]`
            }`}
          >
            {value}
          </span>
        </button>
      ))}
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <article className="flex flex-col items-start gap-[13px] rounded-2xl border border-solid border-[#e1e7df] bg-white p-5">
      <header className="flex w-full items-center justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className={`text-base leading-6 text-[#203d32] ${boldClass}`}>
            {meal.name}
          </h3>
          <p
            className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}
          >
            {meal.time}
          </p>
        </div>
        <span
          className={`rounded-full bg-[#eaf3e9] px-2.5 py-1 text-[11px] leading-[16.5px] text-[#167653] ${semiboldClass}`}
        >
          {meal.calories}
        </span>
        <button
          type="button"
          aria-label={`Buka ${meal.name}`}
          onClick={() => setIsOpen(!isOpen)}
          className="ml-2 rounded-md p-1 text-[#728078] transition-colors hover:bg-[#f0f3ec] hover:text-[#167653]"
        >
          <ChevronDown
            className={`h-[18px] w-[18px] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </header>

      {isOpen && (
        <>
          {meal.items.map((item) => (
            <div key={item.name} className="flex w-full items-center gap-[13px]">
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                <span
                  className={`text-xs leading-[18px] text-[#203d32] ${mediumClass}`}
                >
                  {item.name}
                </span>
                <span
                  className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}
                >
                  {item.detail}
                </span>
              </div>
              <span
                className={`text-xs leading-[18px] text-[#203d32] ${semiboldClass}`}
              >
                {item.calories} kkal
              </span>
              <button
                type="button"
                aria-label={`Edit ${item.name}`}
                className="rounded-md p-1.5 text-[#728078] transition-colors hover:bg-[#eaf3e9] hover:text-[#167653]"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <div className="h-px w-full bg-[#e1e7df]" />
          <p className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}>
            {meal.macros}
          </p>
        </>
      )}
    </article>
  );
}

function Field({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: string;
  unit?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col items-start gap-[7px]">
      <span
        className={`text-[13px] leading-[19.5px] text-[#203d32] ${semiboldClass}`}
      >
        {label}
      </span>
      <span className="flex min-h-[47px] w-full items-center gap-2.5 rounded-[10px] border border-solid border-[#e1e7df] bg-white px-3.5 py-[11px] focus-within:border-[#167653] transition-colors">
        <input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={`min-w-0 flex-1 bg-transparent text-sm leading-[21px] text-[#203d32] outline-none ${textClass}`}
          aria-label={label}
        />
        {unit && (
          <span
            className={`whitespace-nowrap text-xs leading-[18px] text-[#728078] ${textClass}`}
          >
            {unit}
          </span>
        )}
      </span>
    </label>
  );
}

function AddFoodPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Katalog");
  const [activeMeal, setActiveMeal] = useState("Makan siang");
  const [food, setFood] = useState("Nasi merah");
  const [portion, setPortion] = useState("1,5");
  const [manualName, setManualName] = useState("Jus jambu tanpa gula");
  const [manualCalories, setManualCalories] = useState("90");
  const [barcode, setBarcode] = useState("8991234567890");
  const [notice, setNotice] = useState("");

  return (
    <div className="flex flex-col items-start gap-[18px]">
      <section className="flex w-full flex-col items-start gap-[18px] rounded-[18px] border border-solid border-[#e1e7df] bg-white p-6 shadow-xs">
        <header>
          <h2 className={`text-lg leading-[27px] text-[#203d32] ${boldClass}`}>
            Tambah makanan
          </h2>
          <p className={`text-xs leading-[18px] text-[#728078] ${textClass}`}>
            Pilih cara yang paling nyaman untukmu.
          </p>
        </header>
        <SegmentedTabs
          values={tabs}
          selected={activeTab}
          onSelect={setActiveTab}
        />
        <SegmentedTabs
          values={mealTabs}
          selected={activeMeal}
          onSelect={setActiveMeal}
        />
        {activeTab === "Katalog" && (
          <>
            <label className="flex w-full flex-col items-start gap-[7px]">
              <span
                className={`text-[13px] leading-[19.5px] text-[#203d32] ${semiboldClass}`}
              >
                Cari di katalog
              </span>
              <span className="flex min-h-[47px] w-full items-center gap-2.5 rounded-[10px] border border-solid border-[#e1e7df] px-3.5 py-[11px] focus-within:border-[#167653] transition-colors">
                <input
                  value={food}
                  onChange={(event) => setFood(event.target.value)}
                  className={`min-w-0 flex-1 text-sm leading-[21px] text-[#203d32] outline-none ${textClass}`}
                  aria-label="Cari di katalog"
                />
                <Search className="h-[17px] w-[17px] text-[#728078]" />
              </span>
            </label>
            <div className="flex flex-wrap items-start gap-2">
              {["Semua makanan", "Terverifikasi", "Sering dicatat"].map(
                (filter, index) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setNotice(filter)}
                    className={`rounded-full px-2.5 py-1 text-[11px] leading-[16.5px] transition-colors ${
                      index === 0
                        ? "bg-[#eaf3e9] text-[#167653]"
                        : "bg-[#f0f3ec] text-[#728078] hover:bg-[#e4ebd0]"
                    } ${semiboldClass}`}
                  >
                    {filter}
                  </button>
                ),
              )}
            </div>
            <div className="flex w-full flex-col items-start gap-3">
              <button
                type="button"
                onClick={() => setNotice("Nasi merah matang ditambahkan")}
                className="flex w-full items-start gap-3 rounded-[10px] bg-[#eaf3e9] p-[13px] text-left transition-colors hover:bg-[#e1ede0]"
              >
                <CheckCircle2 className="h-5 w-5 text-[#167653] shrink-0 mt-0.5" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={`text-[13px] leading-[19.5px] text-[#203d32] ${textClass}`}
                  >
                    Nasi merah matang
                  </span>
                  <span
                    className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
                  >
                    Per 100 g • 110 kkal • P 2,6 · K 23 · L 0,9 g
                  </span>
                </span>
                <span className={`text-[11px] text-[#167653] ${semiboldClass}`}>
                  Terverifikasi
                </span>
              </button>
              <button
                type="button"
                onClick={() => setNotice("Nasi putih matang dipilih")}
                className="flex w-full items-center gap-3 rounded-[10px] p-2 text-left transition-colors hover:bg-[#f8faf6]"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span
                    className={`text-[13px] leading-[19.5px] text-[#203d32] ${semiboldClass}`}
                  >
                    Nasi putih matang
                  </span>
                  <span
                    className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
                  >
                    Per 100 g • 130 kkal
                  </span>
                </span>
                <span
                  className={`text-xs leading-[18px] text-[#167653] ${semiboldClass}`}
                >
                  Pilih
                </span>
              </button>
            </div>
            <div className="h-px w-full bg-[#e1e7df]" />
            <div className="flex w-full items-end gap-3.5">
              <Field
                label="Jumlah porsi"
                value={portion}
                onChange={setPortion}
              />
              <Field label="Basis porsi" value="100 g" />
            </div>
            <div className="flex w-full items-center gap-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <strong
                  className={`text-[22px] leading-[33px] text-[#203d32] ${boldClass}`}
                >
                  165 kkal
                </strong>
                <span
                  className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
                >
                  150 g • P 3,9 · K 34,5 · L 1,4 g
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNotice("Makanan ditambahkan ke jurnal")}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#167653] px-[18px] py-[11px] text-sm leading-[21px] text-white transition-colors hover:bg-[#125f43] ${semiboldClass}`}
              >
                <Plus className="h-[17px] w-[17px]" />
                Tambah ke jurnal
              </button>
            </div>
            <p
              className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}
            >
              Pratinjau tambahan — belum dimasukkan ke total hari ini.
            </p>
          </>
        )}

        {activeTab === "Foto AI" && (
          <div className="flex w-full flex-col items-start gap-3.5 rounded-[12px] bg-[#eaf3e9] p-4 text-[#203d32] border border-[#dcebb2]">
            <div className="flex items-center gap-2 font-bold text-xs text-[#167653]">
              <Sparkles className="h-4 w-4 shrink-0 text-[#167653]" />
              <span>Smart Food Recognition (9Router Vision AI)</span>
            </div>
            <p className={`text-xs text-[#728078] leading-relaxed ${textClass}`}>
              Ambil foto piring makanmu atau unggah gambar untuk dideteksi porsi, kalori, dan makronutrisinya secara otomatis dalam hitungan detik.
            </p>
            <button
              type="button"
              onClick={() => navigate("/foto-ai")}
              className={`inline-flex items-center gap-2 rounded-lg bg-[#167653] px-4 py-2.5 text-xs text-white transition-colors hover:bg-[#125f43] ${semiboldClass}`}
            >
              <Camera className="h-4 w-4" />
              <span>Buka Foto AI & Analisis Piring</span>
            </button>
          </div>
        )}

        {activeTab !== "Katalog" && activeTab !== "Foto AI" && (
          <div
            className={`rounded-[10px] bg-[#eaf3e9] p-4 text-sm text-[#203d32] ${textClass}`}
          >
            Fitur {activeTab} siap digunakan untuk menambahkan makanan.
          </div>
        )}
        {notice && (
          <p
            role="status"
            className={`text-xs text-[#167653] ${semiboldClass}`}
          >
            {notice}
          </p>
        )}
      </section>
      <section className="flex w-full flex-col items-start gap-[18px] rounded-[18px] border border-solid border-[#e1e7df] bg-white p-5 shadow-xs">
        <header>
          <h2 className={`text-lg leading-[27px] text-[#203d32] ${boldClass}`}>
            Cara cepat lainnya
          </h2>
          <p className={`text-xs leading-[18px] text-[#728078] ${textClass}`}>
            Alternatif saat makanan belum ada di katalog.
          </p>
        </header>
        <div className="flex w-full flex-col items-start gap-3">
          <div className="flex w-full items-center justify-between">
            <h3
              className={`text-sm leading-[21px] text-[#203d32] ${boldClass}`}
            >
              Quick Add
            </h3>
            <span
              className={`rounded-full bg-[#f0f3ec] px-2.5 py-1 text-[11px] text-[#728078] ${semiboldClass}`}
            >
              Input manual
            </span>
          </div>
          <div className="flex w-full items-end gap-3">
            <Field
              label="Nama makanan"
              value={manualName}
              onChange={setManualName}
            />
            <div className="w-[145px]">
              <Field
                label="Kalori"
                value={manualCalories}
                onChange={setManualCalories}
                unit="kkal"
              />
            </div>
          </div>
          <div className="flex w-full items-end gap-2.5">
            <Field label="Protein (opsional)" value="—" unit="g" />
            <Field label="Karbo (opsional)" value="—" unit="g" />
            <Field label="Lemak (opsional)" value="—" unit="g" />
          </div>
          <button
            type="button"
            onClick={() => setNotice(`${manualName} dicatat secara manual`)}
            className={`flex min-h-11 w-full items-center justify-center rounded-[10px] border border-solid border-[#e1e7df] bg-white px-[18px] py-[11px] text-sm text-[#167653] transition-colors hover:bg-[#f0f3ec] ${semiboldClass}`}
          >
            Catat manual
          </button>
        </div>
        <div className="h-px w-full bg-[#e1e7df]" />
        <div className="flex w-full flex-col items-start gap-2.5">
          <div className="flex w-full items-center gap-3">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#eaf3e9]">
              <ScanBarcode className="h-[19px] w-[19px] text-[#167653]" />
            </div>
            <div>
              <h3
                className={`text-[13px] leading-[19.5px] text-[#203d32] ${semiboldClass}`}
              >
                Barcode kemasan
              </h3>
              <p
                className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
              >
                Pindai kode, lalu periksa nilai pada label.
              </p>
            </div>
          </div>
          <div className="flex w-full items-end gap-2.5">
            <Field
              label="Tidak bisa memindai? Masukkan kode"
              value={barcode}
              onChange={setBarcode}
            />
            <button
              type="button"
              onClick={() => setNotice(`Mencari kode ${barcode}`)}
              className={`min-h-11 rounded-[10px] border border-solid border-[#e1e7df] bg-white px-[18px] py-[11px] text-sm text-[#167653] transition-colors hover:bg-[#f0f3ec] ${semiboldClass}`}
            >
              Cari kode
            </button>
          </div>
          <p
            className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}
          >
            Produk tidak ditemukan? Gunakan Quick Add di atas.
          </p>
        </div>
      </section>
    </div>
  );
}

export const FoodJournalWorkspaceSection = (): JSX.Element => {
  const [recommendationMeal, setRecommendationMeal] = useState("Makan siang");
  const [selectedRecommendation, setSelectedRecommendation] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return localStorage.getItem("fitbite_journal_date") || todayStr;
  });

  const dateObj = new Date(selectedDate);
  const formattedDateLong = isNaN(dateObj.getTime())
    ? "Senin, 19 Oktober 2026"
    : dateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const formattedDateShort = isNaN(dateObj.getTime())
    ? "19 Okt 2026"
    : dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const [mealsList, setMealsList] = useState<Meal[]>(() => {
    try {
      const savedStr = localStorage.getItem("fitbite_journal_slots");
      if (!savedStr) return defaultMeals;
      const savedSlots = JSON.parse(savedStr);
      return defaultMeals.map((dm) => {
        if (savedSlots[dm.name]) {
          return {
            ...dm,
            ...savedSlots[dm.name],
          };
        }
        return dm;
      });
    } catch {
      return defaultMeals;
    }
  });

  const [dailySummary, setDailySummary] = useState({
    totalCalories: "1.350 kkal",
    protein: "90 / 100 g",
    karbo: "150 / 190 g",
    lemak: "43 / 60 g",
    sisaEnergi: "608 kkal",
  });

  // Fungsi helper untuk menghitung akumulasi total ringkasan gizi
  const updateSummaryFromMeals = (meals: Meal[]) => {
    let totalCal = 0;
    let totalProt = 0;
    let totalCarb = 0;
    let totalFat = 0;

    meals.forEach((m) => {
      totalCal += parseFloat(m.calories) || 0;
      const match = m.macros?.match(
        /Protein\s+([\d.,]+)\s*g.*?Karbo\s+([\d.,]+)\s*g.*?Lemak\s+([\d.,]+)\s*g/i
      );
      if (match) {
        totalProt += parseFloat(match[1].replace(",", ".")) || 0;
        totalCarb += parseFloat(match[2].replace(",", ".")) || 0;
        totalFat += parseFloat(match[3].replace(",", ".")) || 0;
      }
    });

    const targetCal = 1958;
    const sisa = Math.max(0, targetCal - Math.round(totalCal));

    setDailySummary({
      totalCalories: `${Math.round(totalCal).toLocaleString("id-ID")} kkal`,
      protein: `${Math.round(totalProt)} / 100 g`,
      karbo: `${Math.round(totalCarb)} / 190 g`,
      lemak: `${Math.round(totalFat)} / 60 g`,
      sisaEnergi: `${sisa.toLocaleString("id-ID")} kkal`,
    });
  };

  useEffect(() => {
    // Sinkronkan data log harian dari backend FastAPI
    axios
      .get(`http://localhost:8000/api/meals/daily?date=${selectedDate}`)
      .then((res) => {
        if (res.data && res.data.meals) {
          const savedStr = localStorage.getItem("fitbite_journal_slots");
          const savedSlots = savedStr ? JSON.parse(savedStr) : {};

          const mergedMeals = res.data.meals.map((m: Meal) => {
            if (savedSlots[m.name]) {
              return { ...m, ...savedSlots[m.name] };
            }
            return m;
          });

          setMealsList(mergedMeals);
          updateSummaryFromMeals(mergedMeals);
        }
      })
      .catch((err) => {
        console.warn("Backend /api/meals/daily belum aktif atau error:", err);
        // Fallback hitung dari storage lokal
        updateSummaryFromMeals(mealsList);
      });
  }, [selectedDate]);

  return (
    <main className="relative flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#f8faf6]">
      <header className="sticky top-0 z-10 flex h-[78px] w-full shrink-0 items-center justify-between border-b border-solid border-[#e1e7df] bg-white px-9">
        <nav className="flex items-center gap-2" aria-label="Breadcrumb">
          <span
            className={`text-xs leading-[18px] text-[#728078] ${textClass}`}
          >
            Ruang sehat
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[#728078]" />
          <span
            className={`text-xs leading-[18px] text-[#203d32] ${semiboldClass}`}
          >
            Jurnal makanan
          </span>
        </nav>
        <div className="flex items-center gap-[18px]">
          <span
            className={`rounded-full bg-[#f0f3ec] px-2.5 py-1 text-[11px] text-[#728078] ${semiboldClass}`}
          >
            Data contoh
          </span>
          <button type="button" aria-label="Notifikasi" className="relative p-1 text-[#728078] hover:text-[#203d32] transition-colors">
            <Bell className="h-[19px] w-[19px]" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#167653] ring-2 ring-white" />
          </button>
          <div className="flex h-[33px] w-[33px] items-center justify-center rounded-[20px] bg-[#dcebb2]">
            <span
              className={`text-[11px] leading-[16.5px] text-[#203d32] ${boldClass}`}
            >
              NP
            </span>
          </div>
        </div>
      </header>
      <div className="flex w-full flex-col gap-6 px-9 pb-7 pt-[30px]">
        <section className="flex w-full items-center gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <h1
              className={`text-3xl leading-[37.5px] tracking-[-0.24px] text-[#203d32] ${textClass}`}
            >
              Makan dengan sadar, catat dengan mudah.
            </h1>
            <p
              className={`text-[13px] leading-[19.5px] text-[#728078] ${textClass}`}
            >
              {formattedDateLong} • Catatan hingga 18.30 WIB
            </p>
          </div>
          <button
            type="button"
            className={`flex min-h-11 items-center gap-2 rounded-[10px] border border-solid border-[#e1e7df] bg-white px-[18px] py-[11px] text-sm text-[#167653] transition-colors hover:bg-[#f0f3ec] ${semiboldClass}`}
          >
            <Calendar className="h-[17px] w-[17px]" />
            {formattedDateShort}
          </button>
        </section>
        <section
          className="flex w-full items-start rounded-[18px] bg-[#124b39] p-[22px] shadow-sm"
          aria-label="Ringkasan nutrisi"
        >
          {[
            ["Kalori masuk", dailySummary.totalCalories],
            ["Protein", dailySummary.protein],
            ["Karbohidrat", dailySummary.karbo],
            ["Lemak", dailySummary.lemak],
            ["Sisa energi", dailySummary.sisaEnergi],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-1 flex-col gap-[5px]">
              <span
                className={`text-[11px] leading-[16.5px] text-[#c1d4c8] ${textClass}`}
              >
                {label}
              </span>
              <strong
                className={`text-[21px] leading-[31.5px] text-white ${textClass}`}
              >
                {value}
              </strong>
            </div>
          ))}
        </section>
        <section className="flex w-full items-start gap-6">
          <div className="flex w-[520px] flex-col gap-4">
            {mealsList.map((meal) => (
              <MealCard key={meal.name} meal={meal} />
            ))}
            <p
              className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}
            >
              Kalori per item dalam kkal. Nutrisi dan porsi merupakan estimasi;
              pembulatan dapat membuat kalori sedikit berbeda dari perhitungan
              makro.
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <AddFoodPanel />
          </div>
        </section>
        <section className="flex w-full flex-col gap-[15px]">
          <div className="flex items-start justify-between">
            <h2
              className={`text-[19px] leading-[28.5px] text-[#203d32] ${boldClass}`}
            >
              Ide menu lokal untukmu
            </h2>
            <p
              className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
            >
              Rekomendasi bukan aturan • nilai estimasi
            </p>
          </div>
          <SegmentedTabs
            values={mealTabs}
            selected={recommendationMeal}
            onSelect={setRecommendationMeal}
          />
          <div className="grid grid-cols-3 gap-5">
            {recommendations.map((recommendation) => (
              <article
                key={recommendation.title}
                className="flex flex-col gap-[13px] overflow-hidden rounded-2xl border border-solid border-[#e1e7df] bg-white p-3 shadow-xs hover:shadow-sm transition-shadow"
              >
                <img
                  className="h-[150px] w-full rounded-[10px] object-cover"
                  src={recommendation.image}
                  alt={recommendation.title}
                />
                <div className="flex flex-col gap-[7px] px-[5px] flex-1">
                  <h3
                    className={`text-[15px] leading-[22.5px] text-[#203d32] ${boldClass}`}
                  >
                    {recommendation.title}
                  </h3>
                  <p
                    className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
                  >
                    {recommendation.detail}
                  </p>
                  <p
                    className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass} mt-auto pt-1`}
                  >
                    Sesuaikan porsi dan bahan sebelum mencatat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedRecommendation(recommendation.title)
                  }
                  className={`flex min-h-11 w-full items-center justify-center rounded-[10px] border border-solid border-[#e1e7df] bg-white px-[18px] py-[11px] text-sm text-[#167653] transition-colors hover:bg-[#eaf3e9] ${semiboldClass}`}
                >
                  Pilih &amp; catat
                </button>
              </article>
            ))}
          </div>
          {selectedRecommendation && (
            <p
              role="status"
              className={`text-xs text-[#167653] ${semiboldClass}`}
            >
              {selectedRecommendation} dipilih untuk dicatat.
            </p>
          )}
        </section>
      </div>
      <footer className="flex w-full items-start justify-between px-9 pb-6 pt-2">
        <p className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}>
          FitBite mendukung kebiasaan sehat, bukan pengganti dokter atau ahli
          gizi.
        </p>
        <span
          className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}
        >
          FitBite © 2026
        </span>
      </footer>
    </main>
  );
};

