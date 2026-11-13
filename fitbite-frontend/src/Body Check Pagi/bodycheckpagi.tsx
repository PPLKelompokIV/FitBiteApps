import { useState, type ReactElement } from "react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";
import {
  BodyCheckHeader,
  BodyCheckBanner,
  BodyCheckFormSection,
  BodyCheckOverviewSection,
  BodyCheckFooter,
  type SleepQuality,
  type PlannedIntensity,
} from "./bodycheckmainnavigation";

export const BodyCheckPagi = (): ReactElement => {
  const [weight, setWeight] = useState("64,0");
  const [sleepDuration, setSleepDuration] = useState("7,5");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>("Nyenyak");
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [plannedIntensity, setPlannedIntensity] = useState<PlannedIntensity>("Tinggi");
  
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);

  const handleSave = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/body-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: parseFloat(weight.replace(',', '.')), 
          sleepDuration: parseFloat(sleepDuration.replace(',', '.')),
          sleepQuality: sleepQuality,
          energyLevel: energyLevel,
          plannedIntensity: plannedIntensity
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (responseData.overview) {
          setOverviewData(responseData.overview);
        }

        setIsSaved(true);
        setToastMessage("Body Check tersimpan!");
        setTimeout(() => {
          setToastMessage(null);
        }, 3000);
      } else {
        console.error("Backend menolak data");
      }
    } catch (error) {
      console.error("Gagal menghubungi backend:", error);
    }
  };

  return (
    <div className="flex h-screen items-stretch overflow-hidden bg-[#f6f7f2] font-sans text-[#1f2d2a]">
      <BodyCheckSidebar />

      <div className="relative flex h-screen min-h-0 flex-1 flex-col justify-between overflow-y-auto bg-[#f6f7f2]">
        <div className="w-full">
          <BodyCheckHeader />

          <main className="flex w-full flex-col items-start gap-6 px-9 pb-7 pt-[28px]">
            <div className="w-full">
              <BodyCheckBanner isSaved={isSaved} />

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
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

                <BodyCheckOverviewSection overviewData={overviewData} />
              </div>
            </div>
          </main>
        </div>

        <div className="px-9">
          <BodyCheckFooter />
        </div>
      </div>
    </div>
  );
};

export default BodyCheckPagi;