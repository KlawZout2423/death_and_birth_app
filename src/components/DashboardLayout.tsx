"use client";

import Sidebar from "@/components/Sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "registry" | "bank" | "ssnit" | "insurance" | "registrar" | "officer" | "admin";
  userName?: string;
}

const shellStyles = {
  registry: "bg-[radial-gradient(circle_at_top,_rgba(24,58,119,0.12),_transparent_42%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_55%,#f7f7f2_100%)]",
  bank: "bg-[radial-gradient(circle_at_top_left,_rgba(6,78,59,0.20),_transparent_35%),linear-gradient(160deg,#f3fbf8_0%,#e4f3ec_50%,#f6faf8_100%)]",
  insurance: "bg-[radial-gradient(circle_at_top_right,_rgba(15,76,129,0.18),_transparent_36%),linear-gradient(180deg,#f5fbff_0%,#ebf5fb_45%,#f7fafc_100%)]",
  ssnit: "bg-[radial-gradient(circle_at_top,_rgba(129,95,32,0.16),_transparent_34%),linear-gradient(180deg,#fffaf0_0%,#f8efd9_48%,#fbfaf6_100%)]",
  registrar: "bg-[linear-gradient(180deg,#f7f9fc_0%,#eef2f7_100%)]",
  officer: "bg-[linear-gradient(180deg,#f7f9fc_0%,#eef2f7_100%)]",
  admin: "bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.14),_transparent_34%),linear-gradient(180deg,#f6f9ff_0%,#edf2ff_50%,#f8fafc_100%)]",
} as const;

export default function DashboardLayout({ children, role = "registrar", userName = "User" }: DashboardLayoutProps) {
  return (
    <div className={`flex h-screen ${shellStyles[role]}`}>
      <Sidebar role={role} userName={userName} />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
