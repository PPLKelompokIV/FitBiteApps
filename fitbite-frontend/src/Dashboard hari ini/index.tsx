import { PrimaryNavigationSection } from "./PrimaryNavigationSection";
import { WellnessDashboardSection } from "./WellnessDashboardSection";

export const DashboardHariIni = (): JSX.Element => {
  return (
    <div className="flex min-h-screen items-start bg-[#f6f7f2] text-[#18251f]">
      <PrimaryNavigationSection />
      <WellnessDashboardSection />
    </div>
  );
};

export default DashboardHariIni;
