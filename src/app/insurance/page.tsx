"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppIcon } from "@/components/AppIcon";
import { StatCard } from "@/components/DashboardCards";

interface Stats {
  pendingNotifications: number;
  respondedNotifications: number;
  totalDeaths: number;
}

export default function InsuranceDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard?role=insurance");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-3xl border border-sky-200 bg-white/85 px-6 py-5 text-sm text-slate-600 shadow-lg shadow-sky-100/70">
          Loading insurance dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-sky-200/70 bg-white/90 shadow-[0_30px_80px_-42px_rgba(14,116,144,0.35)] backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="bg-[linear-gradient(135deg,#082f49_0%,#0f4c81_58%,#38bdf8_100%)] px-8 py-10 text-white md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-100/80">Insurance Desk</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
              A claims-ready workspace with a steadier policy and risk feel.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-50/85 md:text-base">
              Review institutional notices, track acknowledged cases, and work through insured record follow-up
              with a calmer claims-oriented layout.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
              <AppIcon name="shield" className="h-4 w-4" />
              Policy and claims operations
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,#f5fbff_0%,#eef8fe_100%)] px-8 py-10 md:px-10">
            <div className="rounded-[1.75rem] border border-sky-100 bg-white/95 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-700 text-white">
                  <AppIcon name="shield" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Risk watch</p>
                  <p className="text-sm text-slate-600">Quick claims intake summary for reported deaths.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
                  <span className="text-slate-600">Pending notices</span>
                  <span className="font-semibold text-sky-800">{stats?.pendingNotifications ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white">
                  <span className="text-slate-300">Responded</span>
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
        <StatCard title="Total Deaths" value={stats?.totalDeaths ?? 0} icon={<AppIcon name="shield" />} color="blue" href="/insurance/notifications" />

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Link
          href="/insurance/notifications"
          className="group rounded-[1.75rem] border border-sky-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#eff8ff_100%)] p-6 shadow-[0_18px_55px_-38px_rgba(14,116,144,0.45)] transition duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Claims inbox</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Notification Review</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Open insurer notifications, confirm which records have been handled, and keep the response trail
                visible for the institution team.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-700 text-white transition group-hover:scale-105">
              <AppIcon name="notification" className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-800">
            Open claims queue
            <span className="transition group-hover:translate-x-1">-&gt;</span>
          </div>
        </Link>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Institution note</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Tailored for insurers</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This view now leans into claim review, shield motifs, and cleaner policy-desk styling so it no
            longer feels like a reused registry page.
          </p>
        </div>
      </div>
    </div>
  );
}
