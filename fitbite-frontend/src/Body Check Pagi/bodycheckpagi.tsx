import { useState, type ReactElement } from "react";
import {
  BodyCheckSidebar,
  BodyCheckHeader,
  BodyCheckBanner,
  BodyCheckFormSection,
  BodyCheckOverviewSection,
  BodyCheckFooter,
  type SleepQuality,
  type PlannedIntensity,
} from "./bodycheckmainnavigation";

export const BodyCheckPagi = (): ReactElement => {
  // Form State initialized to match reference frame exactly
  const [weight, setWeight] = useState("64,0");
  const [sleepDuration, setSleepDuration] = useState("7,5");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>("Nyenyak");
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [plannedIntensity, setPlannedIntensity] = useState<PlannedIntensity>("Tinggi");
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setIsSaved(true);
    setToastMessage("Body Check tersimpan!");
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="flex h-screen items-stretch overflow-hidden bg-[#f6f7f2] font-sans text-[#1f2d2a]">
      {/* Sidebar Navigasi */}
      <BodyCheckSidebar />

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

                {/* Right Overview & Insights */}
                <BodyCheckOverviewSection />
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