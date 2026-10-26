import { AdministratorNavigationSection } from "./AdministratorNavigationSection.tsx";
import { UserAccountManagementSection } from "./UserAccountManagementSection.tsx";

export const AdminPantauAkun = () => {
  return (
    <div className="flex h-screen items-start overflow-hidden bg-[#f6f7f2] text-[#1d2926]">
      <AdministratorNavigationSection />
      <UserAccountManagementSection />
    </div>
  );
};

export default AdminPantauAkun;