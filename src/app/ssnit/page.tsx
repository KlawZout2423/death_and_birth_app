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

export default function SSNITDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard?role=ssnit");
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
        <div className="rounded-3xl border border-amber-200 bg-white/85 px-6 py-5 text-sm text-slate-600 shadow-lg shadow-amber-100/70">
          Loading SSNIT dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-amber-200/70 bg-white/90 shadow-[0_30px_80px_-42px_rgba(120,88,29,0.35)] backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="bg-[linear-gradient(135deg,#3f2a14_0%,#8a6422_58%,#d4a44f_100%)] px-8 py-10 text-white md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-100/85">SSNIT / Pension Desk</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
              Pension-office styling with a warmer, institutional benefits feel.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-amber-50/85 md:text-base">
              Review registry notices affecting benefits administration and track pension-related responses from
              a calmer, document-led workspace.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
              <AppIcon name="pension" className="h-4 w-4" />
              Benefits and pension review
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,#fffaf0_0%,#f8f0de_100%)] px-8 py-10 md:px-10">
            <div className="rounded-[1.75rem] border border-amber-100 bg-white/95 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-700 text-white">
                  <AppIcon name="file" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Benefits pulse</p>
                  <p className="text-sm text-slate-600">Reported cases that may affect pension administration.</p>
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                  <span className="text-slate-600">Pending notices</span>
                  <span className="font-semibold text-amber-800">{stats?.pendingNotifications ?? 0}</span>
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
        <StatCard
          title="Total Deaths"
          value={stats?.totalDeaths ?? 0}
          icon={<AppIcon name="pension" />}
          color="blue"
          href="/ssnit/notifications"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Link
          href="/ssnit/notifications"
          className="group rounded-[1.75rem] border border-amber-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#fff7e6_100%)] p-6 shadow-[0_18px_55px_-38px_rgba(120,88,29,0.45)] transition duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Benefits queue</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Notification Review</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Open pension-related notices, inspect registered cases, and keep SSNIT follow-up visible from a
                dedicated institution view.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-700 text-white transition group-hover:scale-105">
              <AppIcon name="notification" className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
            Open benefits queue
            <span className="transition group-hover:translate-x-1">-&gt;</span>
          </div>
        </Link>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Institution note</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Tailored for pension operations</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This SSNIT view now uses warmer document-desk styling and pension cues so it reads like a benefits
            office instead of a reused generic dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
