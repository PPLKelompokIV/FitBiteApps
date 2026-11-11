
import { ActivityAndHydrationSection } from "./ActivityAndHydrationSection";
import { NavigationSidebarSection } from "./NavigationSidebarSection";

export const AktivitasHidrasi = (): JSX.Element => {
  return (
    <div className="flex min-h-screen w-full bg-[#f7f9f5] text-[#203d32]">
      <NavigationSidebarSection activePage="Aktivitas & hidrasi" />

      <ActivityAndHydrationSection />
    </div>
  );
};

export default AktivitasHidrasi;
