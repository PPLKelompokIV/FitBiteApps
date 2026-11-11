import { type ReactElement } from "react";
import { ActivityAndHydrationSection } from "./ActivityHydrationSection";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";

export const AktivitasHidrasi = (): ReactElement => {
  return (
    <div className="flex h-screen w-full items-stretch overflow-hidden bg-[#f6f7f2] text-[#17211b]">
      <HealthAppSidebarSection />
      <ActivityAndHydrationSection />
    </div>
  );
};

export default AktivitasHidrasi;
