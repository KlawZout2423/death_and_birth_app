import { ReactNode } from "react";
import { getSession } from "@/lib/session";
import DashboardLayout from "@/components/DashboardLayout";

export default async function BankLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const userName = session?.name ?? "User";

  return (
    <DashboardLayout role="bank" userName={userName}>
      {children}
    </DashboardLayout>
  );
}
