"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppIcon } from "@/components/AppIcon";
import { StatCard } from "@/components/DashboardCards";

interface BankStats {
  pendingNotifications: number;
  respondedNotifications: number;
  totalDeaths: number;
}

export default function BankDashboard() {
  const [stats, setStats] = useState<BankStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard?role=bank");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load bank dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-3xl border border-emerald-200 bg-white/85 px-6 py-5 text-sm text-slate-600 shadow-lg shadow-emerald-100/70">
          Loading bank dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-white/90 shadow-[0_30px_80px_-42px_rgba(6,95,70,0.45)] backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="bg-[linear-gradient(135deg,#022c22_0%,#065f46_58%,#10b981_100%)] px-8 py-10 text-white md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-emerald-100/80">Bank Operations</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
              A treasury-style dashboard for incoming registry notices.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/85 md:text-base">
              Review confirmed death notifications, monitor handled cases, and keep account-related follow-up
              in one calm banking workspace.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
              <AppIcon name="vault" className="h-4 w-4" />
              Notification-led review queue
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,#f6fdf9_0%,#edf8f2_100%)] px-8 py-10 md:px-10">
            <div className="rounded-[1.75rem] border border-emerald-100 bg-white/95 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
                  <AppIcon name="trend" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ledger watch</p>
                  <p className="text-sm text-slate-600">Snapshot of notices requiring bank action.</p>
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                  <span className="text-slate-600">Pending review</span>
                  <span className="font-semibold text-emerald-800">{stats?.pendingNotifications ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white">
                  <span className="text-slate-300">Handled notices</span>
                  <span className="font-semibold">{stats?.respondedNotifications ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Pending Notifications"
          value={stats?.pendingNotifications ?? 0}
          icon={<AppIcon name="clock" />}
          color="yellow"
        />
        <StatCard
          title="Responded"
          value={stats?.respondedNotifications ?? 0}
          icon={<AppIcon name="check" />}
          color="green"
        />
        <StatCard title="Total Deaths" value={stats?.totalDeaths ?? 0} icon={<AppIcon name="bank" />} color="blue" href="/bank/notifications" />

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Link
          href="/bank/notifications"
          className="group rounded-[1.75rem] border border-emerald-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdf4_100%)] p-6 shadow-[0_18px_55px_-38px_rgba(6,95,70,0.55)] transition duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Action queue</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Notifications</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Open the institution inbox, inspect registry notices, and update handled cases from a single
                banking workflow.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white transition group-hover:scale-105">
              <AppIcon name="notification" className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
            Open banking inbox
            <span className="transition group-hover:translate-x-1">-&gt;</span>
          </div>
        </Link>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Institution note</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Designed for bank review</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The bank dashboard now emphasizes intake, vault-style status cues, and cleaner notification handling
            instead of sharing the registry look-and-feel.
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-4 text-white">
            <AppIcon name="vault" className="h-5 w-5" />
            <span className="text-sm text-slate-200">Institution-specific visual identity applied</span>
          </div>
        </div>
      </div>
    </div>
  );
}
