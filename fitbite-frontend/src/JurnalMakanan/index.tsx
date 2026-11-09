import type { ReactElement } from "react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";
import { FoodJournalWorkspaceSection } from "./FoodJournalWorkspaceSection";

export const JurnalMakanan = (): ReactElement => {
  return (
    <div className="flex min-h-screen bg-[#f6f7f2] text-[#26332d]">
      <HealthAppSidebarSection />
      <FoodJournalWorkspaceSection />
    </div>
  );
};

export default JurnalMakanan;