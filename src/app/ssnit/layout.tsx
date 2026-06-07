import { ReactNode } from "react";
import { getSession } from "@/lib/session";
import DashboardLayout from "@/components/DashboardLayout";

export default async function SSNITLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const userName = session?.name ?? "User";

  return (
    <DashboardLayout role="ssnit" userName={userName}>
      {children}
    </DashboardLayout>
  );
}
