import { HealthNavigationSection } from "./HealthNavigationSection.tsx";
import { ProfileAndReminderSettingsSection } from "./ProfileAndReminderSettingsSection.tsx";

export const ProfilPengingat = () => {
  return (
    <main className="flex h-screen items-stretch overflow-hidden bg-[#f6f7f2] text-[#1f2d2a]">
      <HealthNavigationSection />
      <ProfileAndReminderSettingsSection />
    </main>
  );
};

export default ProfilPengingat;