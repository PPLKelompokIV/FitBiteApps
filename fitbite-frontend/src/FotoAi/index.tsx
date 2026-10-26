import { HealthAppSidebarSection } from "./HealthAppSidebarSection";
import { MealPhotoJournalSection } from "./MealPhotoJournalSection";

export const FotoAiTinjauHasil = (): JSX.Element => {
  return (
    <div className="flex min-h-screen bg-[#f6f7f2] text-[#1d2b24]">
      <HealthAppSidebarSection />
      <MealPhotoJournalSection />
    </div>
  );
};

export default FotoAiTinjauHasil;