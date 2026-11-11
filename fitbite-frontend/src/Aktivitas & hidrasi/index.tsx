import { type ReactElement } from "react";
import { ActivityAndHydrationSection } from "./ActivityHydrationSection";
import { NavigationSidebarSection } from "./NavigationSidebarSection";

export const AktivitasHidrasi = (): ReactElement => {
  return (
    <div className="flex min-h-screen items-start bg-[#f6f7f2] text-[#17211b]">
      <NavigationSidebarSection />
      <ActivityAndHydrationSection />
    </div>
  );
};

export default AktivitasHidrasi;
