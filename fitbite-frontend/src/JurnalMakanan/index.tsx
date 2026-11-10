import type { ReactElement } from "react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";
import { FoodJournalWorkspaceSection } from "./FoodJournalWorkspaceSection";

export const JurnalMakanan = (): ReactElement => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f2] text-[#26332d]">
      <HealthAppSidebarSection />
      <FoodJournalWorkspaceSection />
    </div>
  );
};

export default JurnalMakanan;