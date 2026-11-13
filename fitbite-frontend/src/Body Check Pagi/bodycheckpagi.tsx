import { useState, useEffect, type ReactElement } from "react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";
import {
  BodyCheckHeader,
  BodyCheckBanner,
  BodyCheckFormSection,
  BodyCheckOverviewSection,
  BodyCheckFooter,
  type SleepQuality,
  type PlannedIntensity,
  type BodyCheckOverviewData,
} from "./bodycheckmainnavigation";

export const BodyCheckPagi = (): ReactElement => {
  // Form State
  const [weight, setWeight] = useState(() => localStorage.getItem("fitbite_berat_badan_kg")?.replace(".", ",") || "64,0");
  const [sleepDuration, setSleepDuration] = useState("7,5");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>("Nyenyak");
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [plannedIntensity, setPlannedIntensity] = useState<PlannedIntensity>("Tinggi");
  
  // UI & Overview State
  const [overview, setOverview] = useState<BodyCheckOverviewData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ambil data tersimpan jika ada di localStorage
  useEffect(() => {
    const savedTarget = localStorage.getItem("fitbite_target_cairan_ml");
    const savedWeight = localStorage.getItem("fitbite_berat_badan_kg");
    if (savedTarget && savedWeight) {
      const wNum = parseFloat(savedWeight);
      const targetNum = parseInt(savedTarget, 10);
      setOverview({
        calories: 1700,
        protein: 100,
        carbs: 190,
        fat: 60,
        bmr: 1319,
        tdee: 2000,
        water_ml: targetNum,
        water_formula: `35 ml × ${wNum} kg`,
      });
      setIsSaved(true);
    }
  }, []);

  const handleSave = async () => {
    const parsedWeight = parseFloat(weight.replace(",", ".")) || 64.0;
    const parsedSleep = parseFloat(sleepDuration.replace(",", ".")) || 7.5;

    try {
      const response = await fetch("http://localhost:8000/api/body-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parsedWeight,
          sleepDuration: parsedSleep,
          sleepQuality: sleepQuality,
          energyLevel: energyLevel,
          plannedIntensity: plannedIntensity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const resData = await response.json();
      const now = new Date();
      const timeFormatted = `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;

      if (resData.success && resData.overview) {
        setOverview(resData.overview);
        localStorage.setItem("fitbite_target_cairan_ml", resData.overview.water_ml.toString());
        localStorage.setItem("fitbite_berat_badan_kg", parsedWeight.toString());
        localStorage.setItem("fitbite_sleep_duration", sleepDuration);
        localStorage.setItem("fitbite_sleep_quality", sleepQuality);
        localStorage.setItem("fitbite_energy_level", energyLevel.toString());
        localStorage.setItem("fitbite_bodycheck_time", timeFormatted);
        setIsSaved(true);
        setToastMessage(`Body Check tersimpan! Target cairan dasar: ${resData.overview.water_ml.toLocaleString("id-ID")} ml (${resData.overview.water_formula})`);
      }
    } catch (err) {
      console.warn("Backend offline atau gagal terhubung, menggunakan kalkulasi otomatis:", err);
      const now = new Date();
      const timeFormatted = `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;
      const calculatedWater = Math.round(35 * parsedWeight);
      const calculatedFormula = `35 ml × ${parsedWeight} kg`;
      setOverview({
        calories: 1700,
        protein: 100,
        carbs: 190,
        fat: 60,
        bmr: 1319,
        tdee: 2000,
        water_ml: calculatedWater,
        water_formula: calculatedFormula,
      });
      localStorage.setItem("fitbite_target_cairan_ml", calculatedWater.toString());
      localStorage.setItem("fitbite_berat_badan_kg", parsedWeight.toString());
      localStorage.setItem("fitbite_sleep_duration", sleepDuration);
      localStorage.setItem("fitbite_sleep_quality", sleepQuality);
      localStorage.setItem("fitbite_energy_level", energyLevel.toString());
      localStorage.setItem("fitbite_bodycheck_time", timeFormatted);
      setIsSaved(true);
      setToastMessage(`Body Check tersimpan! Target cairan dasar: ${calculatedWater.toLocaleString("id-ID")} ml (${calculatedFormula})`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="flex h-screen items-stretch overflow-hidden bg-[#f6f7f2] font-sans text-[#1f2d2a]">
      <HealthAppSidebarSection />

      {/* Main Container */}
      <div className="relative flex h-screen min-h-0 flex-1 flex-col justify-between overflow-y-auto bg-[#f6f7f2]">
        <div className="w-full">
          {/* Top Header / Breadcrumb Bar */}
          <BodyCheckHeader />

          {/* Main Body Content */}
          <main className="flex w-full flex-col items-start gap-6 px-9 pb-7 pt-[28px]">
            <div className="w-full">
              {/* Title & Banner Info */}
              <BodyCheckBanner isSaved={isSaved} />

              {/* Two-Column Grid */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                {/* Form Input Section */}
                <BodyCheckFormSection
                  weight={weight}
                  setWeight={setWeight}
                  sleepDuration={sleepDuration}
                  setSleepDuration={setSleepDuration}
                  sleepQuality={sleepQuality}
                  setSleepQuality={setSleepQuality}
                  energyLevel={energyLevel}
                  setEnergyLevel={setEnergyLevel}
                  plannedIntensity={plannedIntensity}
                  setPlannedIntensity={setPlannedIntensity}
                  isSaved={isSaved}
                  onSave={handleSave}
                  toastMessage={toastMessage}
                />

                {/* Right Overview & Insights (Terkoneksi dinamis FIT-47) */}
                <BodyCheckOverviewSection overview={overview} weight={weight} />
              </div>
            </div>
          </main>
        </div>

        {/* Page Footer */}
        <div className="px-9">
          <BodyCheckFooter />
        </div>
      </div>
    </div>
  );
};

export default BodyCheckPagi;
