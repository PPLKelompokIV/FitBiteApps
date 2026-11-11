import { useState, useEffect, type ReactElement } from "react";
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
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type MealItem = {
  id_food_log?: number;
  name: string;
  detail: string;
  calories: string;
  nutrients?: [number, number, number]; // [Protein (g), Karbo (g), Lemak (g)]
};

type Meal = {
  name: string;
  time: string;
  calories: string;
  items: MealItem[];
  macros: string;
};

type CatalogFoodItem = {
  id_catalog: number;
  name: string;
  calPer100g: number;
  protPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  verified: boolean;
};

const catalogFoods: CatalogFoodItem[] = [
  {
    id_catalog: 1,
    name: "Nasi merah matang",
    calPer100g: 110,
    protPer100g: 2.6,
    carbPer100g: 23.0,
    fatPer100g: 0.9,
    verified: true,
  },
  {
    id_catalog: 2,
    name: "Nasi putih matang",
    calPer100g: 130,
    protPer100g: 2.4,
    carbPer100g: 28.0,
    fatPer100g: 0.2,
    verified: true,
  },
  {
    id_catalog: 3,
    name: "Ayam panggang",
    calPer100g: 183,
    protPer100g: 21.7,
    carbPer100g: 0.0,
    fatPer100g: 10.0,
    verified: true,
  },
  {
    id_catalog: 4,
    name: "Tempe panggang",
    calPer100g: 193,
    protPer100g: 13.3,
    carbPer100g: 16.0,
    fatPer100g: 6.7,
    verified: true,
  },
];

// Helper menghitung string macros & total kalori dari array items secara presisi
function recalculateMealSlot(meal: Meal, items: MealItem[]): Meal {
  let totalCal = 0;
  let totalP = 0;
  let totalK = 0;
  let totalL = 0;

  items.forEach((it) => {
    totalCal += Math.max(0, parseFloat(it.calories) || 0);
    if (it.nutrients && it.nutrients.length === 3) {
      totalP += Math.max(0, Number(it.nutrients[0]) || 0);
      totalK += Math.max(0, Number(it.nutrients[1]) || 0);
      totalL += Math.max(0, Number(it.nutrients[2]) || 0);
    }
  });

  return {
    ...meal,
    items,
    calories: `${Math.round(totalCal)} kkal`,
    macros: `Protein ${Math.round(totalP)} g  ·  Karbo ${Math.round(totalK)} g  ·  Lemak ${Math.round(totalL)} g`,
  };
}

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
        nutrients: [10, 27, 5],
      },
      {
        name: "Pisang",
        detail: "1 buah kecil • 100 g",
        calories: "90",
        nutrients: [1, 23, 0],
      },
      {
        name: "Yoghurt tawar",
        detail: "100 g",
        calories: "60",
        nutrients: [9, 0, 3],
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
        nutrients: [4, 35, 1],
      },
      {
        name: "Ayam panggang",
        detail: "120 g",
        calories: "220",
        nutrients: [26, 0, 12],
      },
      {
        name: "Tempe panggang",
        detail: "75 g",
        calories: "145",
        nutrients: [10, 12, 5],
      },
      {
        name: "Sayur bening",
        detail: "1 mangkuk • 150 g",
        calories: "70",
        nutrients: [2, 18, 1],
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
        nutrients: [10, 13, 9],
      },
      {
        name: "Tahu kukus",
        detail: "100 g",
        calories: "80",
        nutrients: [8, 2, 4],
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
        nutrients: [1, 15, 0],
      },
      {
        name: "Yoghurt tawar",
        detail: "150 g",
        calories: "90",
        nutrients: [9, 5, 3],
      },
    ],
    macros: "Protein 10 g  ·  Karbo 20 g  ·  Lemak 3 g",
  },
];

const recommendations = [
  {
    title: "Gado-gado, saus terpisah",
    detail: "250 g • 330 kkal • protein 18 g",
    gram: 250,
    cal: 330,
    prot: 18,
    carb: 32,
    fat: 14,
    image: fotoHidangan,
  },
  {
    title: "Pepes ikan & nasi merah",
    detail: "280 g • 420 kkal • protein 32 g",
    gram: 280,
    cal: 420,
    prot: 32,
    carb: 45,
    fat: 11,
    image: fotoHidangan3,
  },
  {
    title: "Soto ayam bening",
    detail: "350 g • 350 kkal • protein 27 g",
    gram: 350,
    cal: 350,
    prot: 27,
    carb: 30,
    fat: 12,
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
          } transition-all cursor-pointer ${
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

function MealCard({
  meal,
  onUpdateMeal,
  onDeleteFromServer,
}: {
  meal: Meal;
  onUpdateMeal?: (updated: Meal) => void;
  onDeleteFromServer?: (id_food_log?: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    detail: "",
    calories: "",
  });

  const handleStartEdit = (idx: number, item: MealItem) => {
    setEditingIndex(idx);
    setEditForm({
      name: item.name,
      detail: item.detail,
      calories: item.calories,
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSaveEdit = (idx: number) => {
    const newItems = [...meal.items];
    const oldCal = parseFloat(newItems[idx].calories) || 1;
    const parsedCal = Math.max(0, parseFloat(editForm.calories.replace(",", ".")) || 0);
    const ratio = oldCal > 0 ? parsedCal / oldCal : 1;

    const oldNutrients = newItems[idx].nutrients || [0, 0, 0];
    newItems[idx] = {
      ...newItems[idx],
      name: editForm.name.trim() || newItems[idx].name,
      detail: editForm.detail.trim(),
      calories: String(Math.round(parsedCal)),
      nutrients: [
        Number((oldNutrients[0] * ratio).toFixed(1)),
        Number((oldNutrients[1] * ratio).toFixed(1)),
        Number((oldNutrients[2] * ratio).toFixed(1)),
      ],
    };

    const updatedMeal = recalculateMealSlot(meal, newItems);
    onUpdateMeal?.(updatedMeal);
    setEditingIndex(null);
  };

  const handleDeleteItem = (idx: number) => {
    const targetItem = meal.items[idx];
    if (targetItem?.id_food_log) {
      onDeleteFromServer?.(targetItem.id_food_log);
    }
    const newItems = meal.items.filter((_, i) => i !== idx);
    const updatedMeal = recalculateMealSlot(meal, newItems);
    onUpdateMeal?.(updatedMeal);
    if (editingIndex === idx) {
      setEditingIndex(null);
    }
  };

  return (
    <article className="flex flex-col items-start gap-[13px] rounded-2xl border border-solid border-[#e1e7df] bg-white p-5 transition-shadow hover:shadow-xs">
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
          {meal.items.length === 0 ? (
            <p className={`text-xs text-[#728078] italic py-1 ${textClass}`}>
              Belum ada item makanan di slot ini.
            </p>
          ) : (
            meal.items.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="group flex w-full items-center gap-[13px] rounded-lg p-1 transition-colors hover:bg-[#f8faf6]"
              >
                {editingIndex === idx ? (
                  <div className="flex w-full flex-wrap items-center gap-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        placeholder="Nama makanan"
                        className="rounded border border-[#167653] bg-white px-2 py-1 text-xs font-semibold text-[#203d32] outline-none"
                      />
                      <input
                        type="text"
                        value={editForm.detail}
                        onChange={(e) =>
                          setEditForm({ ...editForm, detail: e.target.value })
                        }
                        placeholder="Porsi / Keterangan"
                        className="rounded border border-[#e1e7df] bg-white px-2 py-0.5 text-[10px] text-[#728078] outline-none"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        value={editForm.calories}
                        onChange={(e) =>
                          setEditForm({ ...editForm, calories: e.target.value })
                        }
                        placeholder="Kkal"
                        className="w-full rounded border border-[#e1e7df] bg-white px-2 py-1 text-center text-xs text-[#203d32] outline-none focus:border-[#167653]"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(idx)}
                        title="Simpan perubahan"
                        className="rounded-md bg-[#167653] p-1.5 text-white hover:bg-[#125f43] transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        title="Batal edit"
                        className="rounded-md border border-[#e1e7df] bg-white p-1.5 text-[#728078] hover:bg-[#f0f3ec] transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx, item)}
                        aria-label={`Edit ${item.name}`}
                        title="Edit porsi atau kalori"
                        className="rounded-md p-1.5 text-[#728078] transition-colors hover:bg-[#eaf3e9] hover:text-[#167653]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        aria-label={`Hapus ${item.name}`}
                        title="Hapus makanan ini"
                        className="rounded-md p-1.5 text-[#728078] opacity-60 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}

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
  placeholder,
  type = "text",
  min,
  step,
  onChange,
}: {
  label: string;
  value: string;
  unit?: string;
  placeholder?: string;
  type?: string;
  min?: string | number;
  step?: string | number;
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
          type={type}
          min={min}
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className={`min-w-0 flex-1 bg-transparent text-sm leading-[21px] text-[#203d32] outline-none placeholder:text-[#a0aba4] ${textClass}`}
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

function AddFoodPanel({
  onSubmitFoodLog,
  savingLoading,
}: {
  onSubmitFoodLog: (payload: {
    slotName: string;
    method: string;
    id_catalog?: number;
    name: string;
    portionMultiplier: number;
    baseGram: number;
    calPer100g: number;
    protPer100g: number;
    carbPer100g: number;
    fatPer100g: number;
    customDetail?: string;
  }) => Promise<boolean>;
  savingLoading: boolean;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Katalog");
  const [activeMeal, setActiveMeal] = useState("Makan siang");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogFoodItem>(
    catalogFoods[0]
  );
  const [portion, setPortion] = useState("1,5");
  const [barcode, setBarcode] = useState("8991234567890");
  const [notice, setNotice] = useState("");

  // Quick Add State
  const [qaName, setQaName] = useState("");
  const [qaPortion, setQaPortion] = useState("");
  const [qaCalories, setQaCalories] = useState("");
  const [qaProtein, setQaProtein] = useState("");
  const [qaCarb, setQaCarb] = useState("");
  const [qaFat, setQaFat] = useState("");
  const [qaError, setQaError] = useState("");

  // Filter daftar makanan katalog berdasarkan kata kunci
  const filteredCatalog = catalogFoods.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // Kalkulasi pratinjau makronutrien per porsi secara dinamis
  const parsedPortion = Math.max(0, parseFloat(portion.replace(",", ".")) || 0);
  const previewGram = Math.round(parsedPortion * 100);
  const previewCal = Math.round(selectedCatalog.calPer100g * parsedPortion);
  const previewProt = Number(
    (selectedCatalog.protPer100g * parsedPortion).toFixed(1)
  );
  const previewCarb = Number(
    (selectedCatalog.carbPer100g * parsedPortion).toFixed(1)
  );
  const previewFat = Number(
    (selectedCatalog.fatPer100g * parsedPortion).toFixed(1)
  );

  const handleAddCatalogItem = async () => {
    setNotice("");
    if (parsedPortion <= 0) {
      setNotice("Jumlah porsi harus lebih besar dari 0.");
      return;
    }

    const ok = await onSubmitFoodLog({
      slotName: activeMeal,
      method: "katalog",
      id_catalog: selectedCatalog.id_catalog,
      name: selectedCatalog.name,
      portionMultiplier: parsedPortion,
      baseGram: 100,
      calPer100g: selectedCatalog.calPer100g,
      protPer100g: selectedCatalog.protPer100g,
      carbPer100g: selectedCatalog.carbPer100g,
      fatPer100g: selectedCatalog.fatPer100g,
    });

    if (ok) {
      setNotice(
        `✓ ${selectedCatalog.name} (${previewCal} kkal) berhasil disimpan ke ${activeMeal}!`
      );
    }
  };

  const handleExecuteQuickAdd = async () => {
    setQaError("");
    setNotice("");
    const trimmedName = qaName.trim();
    if (!trimmedName) {
      setQaError("Nama makanan wajib diisi.");
      return;
    }

    const parsedCal = parseFloat(qaCalories.replace(",", "."));
    if (isNaN(parsedCal) || parsedCal <= 0) {
      setQaError("Jumlah kalori wajib diisi dan harus lebih dari 0 kkal.");
      return;
    }

    let p = 0;
    if (qaProtein.trim() !== "") {
      const parsedP = parseFloat(qaProtein.replace(",", "."));
      if (isNaN(parsedP) || parsedP < 0) {
        setQaError("Nilai protein harus berupa angka positif.");
        return;
      }
      p = parsedP;
    }

    let k = 0;
    if (qaCarb.trim() !== "") {
      const parsedK = parseFloat(qaCarb.replace(",", "."));
      if (isNaN(parsedK) || parsedK < 0) {
        setQaError("Nilai karbohidrat harus berupa angka positif.");
        return;
      }
      k = parsedK;
    }

    let l = 0;
    if (qaFat.trim() !== "") {
      const parsedL = parseFloat(qaFat.replace(",", "."));
      if (isNaN(parsedL) || parsedL < 0) {
        setQaError("Nilai lemak harus berupa angka positif.");
        return;
      }
      l = parsedL;
    }

    const ok = await onSubmitFoodLog({
      slotName: activeMeal,
      method: "quick_add",
      name: trimmedName,
      portionMultiplier: 1,
      baseGram: 100,
      calPer100g: parsedCal,
      protPer100g: p,
      carbPer100g: k,
      fatPer100g: l,
      customDetail: qaPortion.trim() || "Quick Add",
    });

    if (ok) {
      setNotice(
        `✓ ${trimmedName} (${Math.round(parsedCal)} kkal) berhasil dicatat ke ${activeMeal}!`
      );
      setQaName("");
      setQaPortion("");
      setQaCalories("");
      setQaProtein("");
      setQaCarb("");
      setQaFat("");
      setQaError("");
    }
  };

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
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari nama makanan (cth. Nasi merah, Ayam)..."
                  className={`min-w-0 flex-1 text-sm leading-[21px] text-[#203d32] outline-none placeholder:text-[#a0aba4] ${textClass}`}
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
                    onClick={() => setSearchQuery("")}
                    className={`rounded-full px-2.5 py-1 text-[11px] leading-[16.5px] transition-colors cursor-pointer ${
                      index === 0
                        ? "bg-[#eaf3e9] text-[#167653]"
                        : "bg-[#f0f3ec] text-[#728078] hover:bg-[#e4ebd0]"
                    } ${semiboldClass}`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>

            <div className="flex w-full flex-col items-start gap-2.5">
              {filteredCatalog.length === 0 ? (
                <p className="text-xs text-[#728078] py-2">
                  Makanan tidak ditemukan di katalog. Gunakan{" "}
                  <strong>Quick Add</strong> di bawah.
                </p>
              ) : (
                filteredCatalog.map((item) => {
                  const isSelected =
                    selectedCatalog.id_catalog === item.id_catalog;
                  return (
                    <button
                      key={item.id_catalog}
                      type="button"
                      onClick={() => setSelectedCatalog(item)}
                      className={`flex w-full items-start gap-3 rounded-[10px] p-[13px] text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#eaf3e9] border border-[#167653]/30"
                          : "bg-[#f8faf6] hover:bg-[#eaf3e9]/60"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-5 w-5 shrink-0 mt-0.5 ${
                          isSelected ? "text-[#167653]" : "text-[#a0aba4]"
                        }`}
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span
                          className={`text-[13px] leading-[19.5px] text-[#203d32] ${semiboldClass}`}
                        >
                          {item.name}
                        </span>
                        <span
                          className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
                        >
                          Per 100 g • {item.calPer100g} kkal • P{" "}
                          {String(item.protPer100g).replace(".", ",")} · K{" "}
                          {String(item.carbPer100g).replace(".", ",")} · L{" "}
                          {String(item.fatPer100g).replace(".", ",")} g
                        </span>
                      </span>
                      <span
                        className={`text-[11px] text-[#167653] ${semiboldClass}`}
                      >
                        {isSelected ? "Terverifikasi" : "Pilih"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="h-px w-full bg-[#e1e7df]" />
            <div className="flex w-full items-end gap-3.5">
              <Field
                label="Jumlah porsi"
                value={portion}
                onChange={setPortion}
                type="number"
                min="0.1"
                step="0.5"
              />
              <Field label="Basis porsi" value="100 g" />
            </div>
            <div className="flex w-full items-center gap-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <strong
                  className={`text-[22px] leading-[33px] text-[#203d32] ${boldClass}`}
                >
                  {previewCal} kkal
                </strong>
                <span
                  className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
                >
                  {previewGram} g • P {String(previewProt).replace(".", ",")} · K{" "}
                  {String(previewCarb).replace(".", ",")} · L{" "}
                  {String(previewFat).replace(".", ",")} g
                </span>
              </div>
              <button
                type="button"
                disabled={savingLoading}
                onClick={handleAddCatalogItem}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#167653] px-[18px] py-[11px] text-sm leading-[21px] text-white transition-colors hover:bg-[#125f43] disabled:opacity-60 cursor-pointer ${semiboldClass}`}
              >
                {savingLoading ? (
                  <Loader2 className="h-[17px] w-[17px] animate-spin" />
                ) : (
                  <Plus className="h-[17px] w-[17px]" />
                )}
                Tambah ke {activeMeal}
              </button>
            </div>
            <p
              className={`text-[10px] leading-[15px] text-[#728078] ${textClass}`}
            >
              Klik tombol di atas untuk menyimpan makanan ini ke jurnal{" "}
              {activeMeal} (tabel <code>food_log</code>).
            </p>
          </>
        )}

        {activeTab === "Quick Add" && (
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full flex-col gap-1">
              <span
                className={`text-[13px] leading-[19.5px] text-[#203d32] ${semiboldClass}`}
              >
                Catat Makanan Cepat (Quick Add)
              </span>
              <p
                className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
              >
                Masukkan nama makanan, kalori, dan makro opsional untuk dicatat
                ke <strong>{activeMeal}</strong>.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              <Field
                label="Nama makanan *"
                value={qaName}
                onChange={setQaName}
                placeholder="cth. Jus alpukat, Pisang goreng, Kopi latte"
              />
              <div className="flex w-full items-end gap-3.5">
                <Field
                  label="Porsi / Takaran (opsional)"
                  value={qaPortion}
                  onChange={setQaPortion}
                  placeholder="cth. 1 gelas, 1 porsi, 150 g"
                />
                <div className="w-[145px]">
                  <Field
                    label="Kalori *"
                    value={qaCalories}
                    onChange={setQaCalories}
                    type="number"
                    min="0"
                    step="any"
                    unit="kkal"
                    placeholder="150"
                  />
                </div>
              </div>
              <div className="flex w-full items-end gap-2.5">
                <Field
                  label="Protein (opsional)"
                  value={qaProtein}
                  onChange={setQaProtein}
                  type="number"
                  min="0"
                  step="any"
                  unit="g"
                  placeholder="0"
                />
                <Field
                  label="Karbo (opsional)"
                  value={qaCarb}
                  onChange={setQaCarb}
                  type="number"
                  min="0"
                  step="any"
                  unit="g"
                  placeholder="0"
                />
                <Field
                  label="Lemak (opsional)"
                  value={qaFat}
                  onChange={setQaFat}
                  type="number"
                  min="0"
                  step="any"
                  unit="g"
                  placeholder="0"
                />
              </div>
            </div>

            {qaError && (
              <p className="text-xs text-red-600 font-medium">{qaError}</p>
            )}

            <button
              type="button"
              disabled={savingLoading}
              onClick={handleExecuteQuickAdd}
              className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#167653] px-[18px] py-[11px] text-sm leading-[21px] text-white transition-colors hover:bg-[#125f43] disabled:opacity-60 cursor-pointer ${semiboldClass}`}
            >
              <Plus className="h-[17px] w-[17px]" />
              Tambah ke {activeMeal}
            </button>
          </div>
        )}

        {activeTab === "Foto AI" && (
          <div className="flex w-full flex-col items-start gap-3.5 rounded-[12px] bg-[#eaf3e9] p-4 text-[#203d32] border border-[#dcebb2]">
            <div className="flex items-center gap-2 font-bold text-xs text-[#167653]">
              <Sparkles className="h-4 w-4 shrink-0 text-[#167653]" />
              <span>Smart Food Recognition (Gemini Vision AI)</span>
            </div>
            <p className={`text-xs text-[#728078] leading-relaxed ${textClass}`}>
              Ambil foto piring makanmu atau unggah gambar untuk dideteksi porsi,
              kalori, dan makronutrisinya secara otomatis dalam hitungan detik.
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

        {activeTab === "Barcode" && (
          <div className="flex w-full flex-col items-start gap-3 rounded-[12px] bg-[#eaf3e9] p-4 text-[#203d32] border border-[#dcebb2]">
            <div className="flex items-center gap-2 font-bold text-xs text-[#167653]">
              <ScanBarcode className="h-4 w-4 text-[#167653]" />
              <span>Pindai Barcode Kemasan</span>
            </div>
            <p className={`text-xs text-[#728078] leading-relaxed ${textClass}`}>
              Arahkan kamera ke barcode produk makanan atau masukkan kode produk
              secara manual.
            </p>
          </div>
        )}

        {notice && (
          <div className="flex w-full items-center gap-2 rounded-lg bg-[#eaf3e9] px-3.5 py-2.5 text-xs text-[#167653] border border-[#dcebb2] font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#167653]" />
            <span>{notice}</span>
          </div>
        )}
      </section>

      {/* Bagian Cara Cepat Lainnya */}
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
              Target: {activeMeal}
            </span>
          </div>
          <div className="flex w-full items-end gap-3">
            <Field
              label="Nama makanan *"
              value={qaName}
              onChange={setQaName}
              placeholder="cth. Jus jambu tanpa gula"
            />
            <div className="w-[145px]">
              <Field
                label="Kalori *"
                value={qaCalories}
                onChange={setQaCalories}
                type="number"
                min="0"
                step="any"
                unit="kkal"
                placeholder="90"
              />
            </div>
          </div>
          <div className="flex w-full items-end gap-2.5">
            <Field
              label="Protein (opsional)"
              value={qaProtein}
              onChange={setQaProtein}
              type="number"
              min="0"
              step="any"
              unit="g"
              placeholder="0"
            />
            <Field
              label="Karbo (opsional)"
              value={qaCarb}
              onChange={setQaCarb}
              type="number"
              min="0"
              step="any"
              unit="g"
              placeholder="0"
            />
            <Field
              label="Lemak (opsional)"
              value={qaFat}
              onChange={setQaFat}
              type="number"
              min="0"
              step="any"
              unit="g"
              placeholder="0"
            />
          </div>
          {qaError && (
            <p className="text-xs text-red-600 font-medium">{qaError}</p>
          )}
          <button
            type="button"
            disabled={savingLoading}
            onClick={handleExecuteQuickAdd}
            className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-solid border-[#167653] bg-white px-[18px] py-[11px] text-sm text-[#167653] transition-colors hover:bg-[#eaf3e9] cursor-pointer ${semiboldClass}`}
          >
            <Plus className="h-4 w-4" />
            Catat manual ke {activeMeal}
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
              className={`min-h-11 rounded-[10px] border border-solid border-[#e1e7df] bg-white px-[18px] py-[11px] text-sm text-[#167653] transition-colors hover:bg-[#f0f3ec] cursor-pointer ${semiboldClass}`}
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

export const FoodJournalWorkspaceSection = (): ReactElement => {
  const [recommendationMeal, setRecommendationMeal] = useState("Makan siang");
  const [savingLoading, setSavingLoading] = useState(false);

  // Toast Notification Elegan (FIT-36)
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

  const showToast = (
    title: string,
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate] = useState<string>(() => {
    return localStorage.getItem("fitbite_journal_date") || todayStr;
  });

  const dateObj = new Date(selectedDate);
  const formattedDateLong = isNaN(dateObj.getTime())
    ? "Rabu, 11 November 2026"
    : dateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const formattedDateShort = isNaN(dateObj.getTime())
    ? "11 Nov 2026"
    : dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const [mealsList, setMealsList] = useState<Meal[]>(() => {
    try {
      const savedStr = localStorage.getItem("fitbite_journal_slots_v2");
      if (!savedStr) return defaultMeals;
      const savedSlots = JSON.parse(savedStr);
      return defaultMeals.map((dm) => {
        if (savedSlots[dm.name]) {
          const items: MealItem[] = savedSlots[dm.name].items || dm.items;
          return recalculateMealSlot(dm, items);
        }
        return recalculateMealSlot(dm, dm.items);
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

  // Fungsi helper akurat menghitung ringkasan nutrisi bagian atas dari semua slot makan
  const updateSummaryFromMeals = (meals: Meal[]) => {
    let totalCal = 0;
    let totalProt = 0;
    let totalCarb = 0;
    let totalFat = 0;

    meals.forEach((m) => {
      m.items.forEach((it) => {
        totalCal += Math.max(0, parseFloat(it.calories) || 0);
        if (it.nutrients && it.nutrients.length === 3) {
          totalProt += Math.max(0, Number(it.nutrients[0]) || 0);
          totalCarb += Math.max(0, Number(it.nutrients[1]) || 0);
          totalFat += Math.max(0, Number(it.nutrients[2]) || 0);
        }
      });
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

  // Sinkronkan ringkasan di awal dan ambil data dari PostgreSQL jika ada
  useEffect(() => {
    updateSummaryFromMeals(mealsList);

    axios
      .get(`http://127.0.0.1:8000/api/food-logs/1?tanggal=${selectedDate}`)
      .then((res) => {
        const dbLogs = res.data?.data;
        if (Array.isArray(dbLogs) && dbLogs.length > 0) {
          // Kelompokkan catatan dari tabel food_log ke 4 slot makan
          const grouped: Record<string, MealItem[]> = {
            Sarapan: [],
            "Makan siang": [],
            "Makan malam": [],
            Camilan: [],
          };

          dbLogs.forEach((row: any) => {
            const slotKey = grouped[row.slot_makan] ? row.slot_makan : "Makan siang";
            grouped[slotKey].push({
              id_food_log: row.id_food_log,
              name: row.nama_makanan,
              detail: `${Math.round(row.estimasi_gram)} g`,
              calories: String(Math.round(row.kalori)),
              nutrients: [
                Number(row.protein_g) || 0,
                Number(row.karbo_g) || 0,
                Number(row.lemak_g) || 0,
              ],
            });
          });

          const syncedMeals = defaultMeals.map((dm) => {
            if (grouped[dm.name] && grouped[dm.name].length > 0) {
              return recalculateMealSlot(dm, grouped[dm.name]);
            }
            return dm;
          });

          setMealsList(syncedMeals);
          updateSummaryFromMeals(syncedMeals);
        }
      })
      .catch(() => {
        // Jika belum ada log hari ini di DB, gunakan state lokal
      });
  }, [selectedDate]);

  const saveSlotsToLocal = (meals: Meal[]) => {
    try {
      const mapObj: Record<string, Meal> = {};
      meals.forEach((m) => {
        mapObj[m.name] = m;
      });
      localStorage.setItem("fitbite_journal_slots_v2", JSON.stringify(mapObj));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMealSlot = (updatedSlot: Meal) => {
    const newMeals = mealsList.map((m) =>
      m.name === updatedSlot.name ? updatedSlot : m
    );
    setMealsList(newMeals);
    updateSummaryFromMeals(newMeals);
    saveSlotsToLocal(newMeals);
  };

  const handleDeleteFromServer = (id_food_log?: number) => {
    if (!id_food_log) return;
    axios
      .delete(`http://127.0.0.1:8000/api/food-logs/${id_food_log}`)
      .catch((err) => console.warn("Gagal hapus log dari DB:", err));
  };

  // FIT-35 & FIT-36: Kirim POST ke /api/food-logs, update state slot makan & ringkasan kalori atas, lalu tampilkan Toast
  const handleSubmitFoodLog = async (payload: {
    slotName: string;
    method: string;
    id_catalog?: number;
    name: string;
    portionMultiplier: number;
    baseGram: number;
    calPer100g: number;
    protPer100g: number;
    carbPer100g: number;
    fatPer100g: number;
    customDetail?: string;
  }): Promise<boolean> => {
    setSavingLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/food-logs", {
        id_user: 1,
        id_catalog: payload.id_catalog ?? null,
        tanggal: selectedDate,
        slot_makan: payload.slotName,
        metode_input: payload.method,
        nama_makanan: payload.name,
        jumlah_porsi: payload.portionMultiplier,
        basis_gram: payload.baseGram,
        kalori_per_100g: payload.calPer100g,
        protein_per_100g: payload.protPer100g,
        karbo_per_100g: payload.carbPer100g,
        lemak_per_100g: payload.fatPer100g,
      });

      const savedRow = response.data?.data;
      const newMealItem: MealItem = {
        id_food_log: savedRow?.id_food_log,
        name: savedRow?.nama_makanan || payload.name,
        detail:
          payload.customDetail ||
          `${Math.round(savedRow?.estimasi_gram || payload.portionMultiplier * payload.baseGram)} g`,
        calories: String(
          Math.round(
            savedRow?.kalori ?? payload.calPer100g * payload.portionMultiplier
          )
        ),
        nutrients: [
          Number(
            savedRow?.protein_g ??
              (payload.protPer100g * payload.portionMultiplier).toFixed(1)
          ),
          Number(
            savedRow?.karbo_g ??
              (payload.carbPer100g * payload.portionMultiplier).toFixed(1)
          ),
          Number(
            savedRow?.lemak_g ??
              (payload.fatPer100g * payload.portionMultiplier).toFixed(1)
          ),
        ],
      };

      const newMeals = mealsList.map((m) => {
        if (m.name.toLowerCase() === payload.slotName.toLowerCase()) {
          return recalculateMealSlot(m, [...m.items, newMealItem]);
        }
        return m;
      });

      setMealsList(newMeals);
      updateSummaryFromMeals(newMeals);
      saveSlotsToLocal(newMeals);

      showToast(
        "Berhasil Dicatat ke Jurnal",
        response.data?.message ||
          `${newMealItem.name} (${newMealItem.calories} kkal) ditambahkan ke ${payload.slotName}.`,
        "success"
      );
      return true;
    } catch (error: any) {
      console.error("Error POST /api/food-logs:", error);
      const errMsg =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.detail ||
        "Pastikan server FastAPI (port 8000) aktif.";
      showToast("Gagal Menyimpan Makanan", String(errMsg), "error");
      return false;
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <main className="relative flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#f8faf6]">
      {/* Floating Toast Notification Elegan (FIT-36) */}
      <aside
        aria-live="polite"
        className={`fixed top-6 right-8 z-50 flex items-start gap-3.5 rounded-[14px] border px-4 py-3.5 shadow-[0_8px_24px_rgba(22,118,83,0.14)] transition-all duration-300 ease-out ${
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
          <strong className={`text-xs leading-[18px] text-[#203d32] ${boldClass}`}>
            {toast.title}
          </strong>
          <span className={`text-[11px] leading-[16px] text-[#5c6b62] ${textClass}`}>
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
          <button
            type="button"
            aria-label="Notifikasi"
            className="relative p-1 text-[#728078] hover:text-[#203d32] transition-colors"
          >
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

        {/* Banner Ringkasan Kalori Masuk & Makronutrien (FIT-36) */}
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
              <MealCard
                key={meal.name}
                meal={meal}
                onUpdateMeal={handleUpdateMealSlot}
                onDeleteFromServer={handleDeleteFromServer}
              />
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
            <AddFoodPanel
              onSubmitFoodLog={handleSubmitFoodLog}
              savingLoading={savingLoading}
            />
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
            {recommendations.map((rec) => (
              <article
                key={rec.title}
                className="flex flex-col gap-[13px] overflow-hidden rounded-2xl border border-solid border-[#e1e7df] bg-white p-3 shadow-xs hover:shadow-sm transition-shadow"
              >
                <img
                  className="h-[150px] w-full rounded-[10px] object-cover"
                  src={rec.image}
                  alt={rec.title}
                />
                <div className="flex flex-col gap-[7px] px-[5px] flex-1">
                  <h3
                    className={`text-[15px] leading-[22.5px] text-[#203d32] ${boldClass}`}
                  >
                    {rec.title}
                  </h3>
                  <p
                    className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass}`}
                  >
                    {rec.detail}
                  </p>
                  <p
                    className={`text-[11px] leading-[16.5px] text-[#728078] ${textClass} mt-auto pt-1`}
                  >
                    Sesuaikan porsi dan bahan sebelum mencatat.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingLoading}
                  onClick={() => {
                    handleSubmitFoodLog({
                      slotName: recommendationMeal,
                      method: "katalog",
                      name: rec.title,
                      portionMultiplier: 1,
                      baseGram: rec.gram,
                      calPer100g: rec.cal,
                      protPer100g: rec.prot,
                      carbPer100g: rec.carb,
                      fatPer100g: rec.fat,
                      customDetail: `${rec.gram} g`,
                    });
                  }}
                  className={`flex min-h-11 w-full items-center justify-center rounded-[10px] border border-solid border-[#e1e7df] bg-white px-[18px] py-[11px] text-sm text-[#167653] transition-colors hover:bg-[#eaf3e9] cursor-pointer ${semiboldClass}`}
                >
                  Pilih &amp; catat ke {recommendationMeal}
                </button>
              </article>
            ))}
          </div>
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