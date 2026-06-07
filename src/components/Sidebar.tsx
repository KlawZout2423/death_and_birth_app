"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppIcon } from "@/components/AppIcon";

interface SidebarProps {
  role?: "registry" | "bank" | "ssnit" | "insurance" | "registrar" | "officer" | "admin";
  userName?: string;
}

const roleTheme = {
  registry: {
    shell: "bg-slate-950 text-white border-slate-800",
    panel: "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950",
    accent: "bg-blue-600/15 text-blue-200 border-blue-500/30",
    hover: "hover:bg-white/8",
    badge: "text-blue-200",
    title: "Civil Registry",
    mark: "CR",
  },
  bank: {
    shell: "bg-emerald-950 text-white border-emerald-900",
    panel: "bg-[linear-gradient(180deg,#052e2b_0%,#063f35_55%,#04251e_100%)]",
    accent: "bg-emerald-400/15 text-emerald-100 border-emerald-300/20",
    hover: "hover:bg-emerald-400/10",
    badge: "text-emerald-200",
    title: "Bank Operations",
    mark: "BK",
  },
  insurance: {
    shell: "bg-sky-950 text-white border-sky-900",
    panel: "bg-[linear-gradient(180deg,#08263d_0%,#0b3a58_58%,#071d2d_100%)]",
    accent: "bg-sky-400/15 text-sky-100 border-sky-300/20",
    hover: "hover:bg-sky-400/10",
    badge: "text-sky-200",
    title: "Insurance Desk",
    mark: "IN",
  },
  ssnit: {
    shell: "bg-stone-950 text-white border-stone-800",
    panel: "bg-[linear-gradient(180deg,#2b2112_0%,#47351a_58%,#1d170d_100%)]",
    accent: "bg-amber-300/15 text-amber-100 border-amber-200/20",
    hover: "hover:bg-amber-300/10",
    badge: "text-amber-200",
    title: "Pension Desk",
    mark: "PF",
  },
  registrar: {
    shell: "bg-slate-950 text-white border-slate-800",
    panel: "bg-[linear-gradient(180deg,#101827_0%,#162033_60%,#0d1420_100%)]",
    accent: "bg-indigo-400/15 text-indigo-100 border-indigo-300/20",
    hover: "hover:bg-white/8",
    badge: "text-indigo-200",
    title: "Records",
    mark: "RO",
  },
  officer: {
    shell: "bg-slate-950 text-white border-slate-800",
    panel: "bg-[linear-gradient(180deg,#101827_0%,#162033_60%,#0d1420_100%)]",
    accent: "bg-indigo-400/15 text-indigo-100 border-indigo-300/20",
    hover: "hover:bg-white/8",
    badge: "text-indigo-200",
    title: "Review Office",
    mark: "RV",
  },
  admin: {
    shell: "bg-slate-950 text-white border-slate-800",
    panel: "bg-[linear-gradient(180deg,#111827_0%,#1b2750_55%,#111827_100%)]",
    accent: "bg-blue-400/15 text-blue-100 border-blue-300/20",
    hover: "hover:bg-white/8",
    badge: "text-blue-200",
    title: "Registrar General",
    mark: "RG",
  },
} as const;

export default function Sidebar({ role = "registrar", userName = "User" }: SidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const theme = roleTheme[role];

  const basePath = role === "registry"
    ? "/registrar"
    : role === "bank"
    ? "/bank"
    : role === "ssnit"
    ? "/ssnit"
    : role === "insurance"
    ? "/insurance"
    : role === "registrar" 
    ? "/registrar"
    : "/dashboard";


  const handleLogout = async () => {
    const res = await fetch("/api/logout", { method: "POST" });
    if (!res.ok) return;
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={`flex h-screen border-r ${theme.shell}`}>
      <div className={`${isOpen ? "w-72" : "w-24"} ${theme.panel} transition-all duration-300 flex flex-col`}>
        <div className="p-5 border-b border-white/10">
          <div className={`flex items-center ${isOpen ? "gap-3" : "justify-center"}`}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.accent}`}>
              <span className="text-sm font-semibold tracking-[0.28em]">{theme.mark}</span>
            </div>
            {isOpen && (
              <div>
                <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/90">{theme.title}</h1>
                <p className="text-xs text-white/45">Death Records Network</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          {isOpen ? (
            <div className={`rounded-2xl border px-4 py-3 ${theme.accent}`}>
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className={`text-[11px] uppercase tracking-[0.25em] ${theme.badge}`}>{role}</p>
            </div>
          ) : (
            <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.accent}`}>
              <span className="text-sm font-semibold">{userName.slice(0, 1).toUpperCase()}</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink href={basePath} icon="dashboard" label="Dashboard" isOpen={isOpen} hoverClass={theme.hover} />

          {role === "registry" && (
            <>
              <NavLink href={`${basePath}/deaths`} icon="death" label="Deaths" isOpen={isOpen} hoverClass={theme.hover} />
              <NavLink href={`${basePath}/births`} icon="birth" label="Births" isOpen={isOpen} hoverClass={theme.hover} />
              <NavLink href={`${basePath}/notifications`} icon="notification" label="Notifications" isOpen={isOpen} hoverClass={theme.hover} />
              <NavLink href={`${basePath}/certificate`} icon="certificate" label="Certificates" isOpen={isOpen} hoverClass={theme.hover} />
            </>
          )}

          {role === "bank" && (
            <>
              <NavLink href={`${basePath}/notifications`} icon="bank" label="Bank Queue" isOpen={isOpen} hoverClass={theme.hover} />
            </>
          )}

          {role === "insurance" && (
            <>
              <NavLink href={`${basePath}/notifications`} icon="shield" label="Claims Queue" isOpen={isOpen} hoverClass={theme.hover} />
            </>
          )}

          {role === "ssnit" && (
            <>
              <NavLink href={`${basePath}/notifications`} icon="pension" label="Pension Queue" isOpen={isOpen} hoverClass={theme.hover} />
            </>
          )}

          {role === "registrar" && (
            <>
              <NavLink href="/registrar/register-death" icon="file" label="Register Death" isOpen={isOpen} hoverClass={theme.hover} />
              <NavLink href="/registrar/register-birth" icon="birth" label="Register Birth" isOpen={isOpen} hoverClass={theme.hover} />
              <NavLink href="/registrar/my-submissions" icon="trend" label="Records" isOpen={isOpen} hoverClass={theme.hover} />
            </>
          )}

          {role === "admin" && (
            <>
              <NavLink href="/dashboard/register-death" icon="file" label="Register Death" isOpen={isOpen} hoverClass={theme.hover} />
              <NavLink href="/dashboard/register-birth" icon="birth" label="Register Birth" isOpen={isOpen} hoverClass={theme.hover} />
            </>
          )}


          {(role === "officer" || role === "admin") && (
            <>
              <NavLink href="/dashboard/pending-records" icon="review" label="Review Records" isOpen={isOpen} hoverClass={theme.hover} />
            </>
          )}

          {role === "admin" && (
            <>
              <div className="pt-4 border-t border-white/10">
                {isOpen && <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.35em] text-white/40">Registrar General</p>}
                <NavLink href="/dashboard/certificates" icon="certificate" label="Certificates" isOpen={isOpen} hoverClass={theme.hover} />
                <NavLink href="/dashboard/reports" icon="reports" label="Reports" isOpen={isOpen} hoverClass={theme.hover} />
                <NavLink href="/dashboard/users" icon="users" label="User Management" isOpen={isOpen} hoverClass={theme.hover} />
              </div>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            onClick={handleLogout}
            className={`w-full rounded-2xl px-4 py-3 text-sm transition-colors bg-white/8 text-white ${theme.hover} ${!isOpen && "px-0"}`}
          >
            <span className={`flex items-center ${isOpen ? "gap-3 justify-start" : "justify-center"}`}>
              <AppIcon name="logout" className="h-5 w-5" />
              {isOpen && "Logout"}
            </span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
          >
            {isOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  isOpen,
  hoverClass,
}: {
  href: string;
  icon:
    | "dashboard"
    | "birth"
    | "death"
    | "notification"
    | "certificate"
    | "review"
    | "reports"
    | "users"
    | "settings"
    | "bank"
    | "shield"
    | "pension"
    | "file"
    | "trend";
  label: string;
  isOpen: boolean;
  hoverClass: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-white/88 transition-colors ${hoverClass} ${!isOpen && "justify-center px-0"}`}
      title={!isOpen ? label : ""}
    >
      <AppIcon name={icon} className="h-5 w-5 shrink-0" />
      {isOpen && <span className="text-sm">{label}</span>}
    </Link>
  );
}
