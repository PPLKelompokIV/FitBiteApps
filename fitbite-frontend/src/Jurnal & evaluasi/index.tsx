import { JournalEvaluationSection } from "./JournalEvaluationSection.tsx";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";

export const JurnalEvaluasi = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f2] text-[#20251f]">
      <HealthAppSidebarSection />
      <JournalEvaluationSection />
    </div>
  );
};

export default JurnalEvaluasi;