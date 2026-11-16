import { JournalEvaluationSection } from "./JournalEvaluationSection";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";

export default function JurnalEvaluasiPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f2] text-[#20251f]">
      <HealthAppSidebarSection />
      <JournalEvaluationSection />
    </div>
  );
}
