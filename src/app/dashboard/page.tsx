"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { AppIcon } from "@/components/AppIcon";
import { PendingRecordsTable, StatCard } from "@/components/DashboardCards";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DashboardRole = "registrar" | "bank" | "ssnit" | "insurance" | "admin";

interface AdminStats {
  totalRecords: number;
  pendingVerification: number;
  verifiedRecords: number;
  certificatesIssued: number;
}

interface PendingRecord {
  id: string;
  certificateId: string;
  name: string;
  type: "birth" | "death";
  date: string;
}

type RangeKey = "30d" | "90d" | "1y";

interface AnalyticsResponse {
  summary: {
    births: number;
    deaths: number;
    records: number;
    regionsCovered: number;
  };
  regionComparison: Array<{ region: string; births: number; deaths: number }>;
  trends: Array<{ month: string; births: number; deaths: number }>;
}

const adminActions = [
  {
    href: "/dashboard/pending-records",
    title: "Review Records",
    description: "Open verification tasks, inspect submitted details, and move cases through approval.",
    icon: "review" as const,
    tint: "from-blue-700/20 to-indigo-700/10",
  },
  {
    href: "/dashboard/certificates",
    title: "Certificates",
    description: "Issue certificates for verified death records and open printable certificate views.",
    icon: "certificate" as const,
    tint: "from-emerald-700/20 to-teal-700/10",
  },
  {
    href: "/dashboard/reports",
    title: "Reports",
    description: "View system activity, throughput, and verification/certification stats.",
    icon: "reports" as const,
    tint: "from-amber-600/20 to-orange-700/10",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<DashboardRole | null>(null);
  const [userName, setUserName] = useState("");
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [analyticsRange, setAnalyticsRange] = useState<RangeKey>("90d");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch("/api/user/role");
        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setRole(data.role);
        setUserName(data.name);

        if (data.dashboardPath && data.dashboardPath !== "/dashboard") {
          router.replace(data.dashboardPath);
          return;
        }

        if (data.role === "admin") {
          const statsRes = await fetch("/api/dashboard?role=admin");
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setAdminStats(statsData.stats);
            setPendingRecords(statsData.pendingRecords || []);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  useEffect(() => {
    if (role !== "admin") return;

    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      try {
        const response = await fetch(`/api/analytics/overview?range=${analyticsRange}`);
        if (!response.ok) {
          throw new Error("Failed to load analytics");
        }
        const payload = (await response.json()) as AnalyticsResponse;
        setAnalytics(payload);
      } catch (error) {
        console.error("Failed to load analytics", error);
        setAnalyticsError("Unable to load regional analytics.");
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [role, analyticsRange]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.14),_transparent_34%),linear-gradient(180deg,#f6f9ff_0%,#edf2ff_50%,#f8fafc_100%)]">
        <div className="rounded-3xl border border-blue-200 bg-white/85 px-6 py-5 text-center shadow-xl shadow-blue-100/70">
          <div className="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-blue-600 text-white">
            <AppIcon name="dashboard" className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return <div>Error loading dashboard</div>;
  }

  return (
    <DashboardLayout role={role} userName={userName}>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Registrar General Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Quickly see system totals and jump into the main workflows.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Records" value={adminStats?.totalRecords ?? 0} icon={<AppIcon name="file" />} color="blue" />
          <StatCard
            title="Pending Verification"
            value={adminStats?.pendingVerification ?? 0}
            icon={<AppIcon name="clock" />}
            color="yellow"
          />
          <StatCard
            title="Verified Records"
            value={adminStats?.verifiedRecords ?? 0}
            icon={<AppIcon name="check" />}
            color="green"
          />
          <StatCard
            title="Certificates issued"
            value={adminStats?.certificatesIssued ?? 0}
            icon={<AppIcon name="certificate" />}
            color="red"
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Quick actions
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/pending-records"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <AppIcon name="review" className="h-4 w-4" />
                Pending records
              </Link>
              <Link
                href="/dashboard/certificates"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <AppIcon name="certificate" className="h-4 w-4" />
                Certificates
              </Link>
              <Link
                href="/dashboard/register-death"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <AppIcon name="death" className="h-4 w-4" />
                Register death
              </Link>
              <Link
                href="/dashboard/register-birth"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <AppIcon name="birth" className="h-4 w-4" />
                Register birth
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-zinc-200/80 bg-white/85 p-6 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.25)] backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Pending Verification Queue</h2>
              <p className="mt-1 text-sm text-slate-600">
                The Registrar General verifies records from here. Any newly submitted death or birth record should appear below while it is still pending.
              </p>
            </div>
            <Link
              href="/dashboard/pending-records"
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <AppIcon name="review" className="h-4 w-4" />
              Open full queue
            </Link>
          </div>

          <PendingRecordsTable records={pendingRecords.slice(0, 6)} />
        </section>

        <section className="rounded-[1.75rem] border border-zinc-200/80 bg-white/85 p-6 shadow-[0_18px_55px_-40px_rgba(15,23,42,0.25)] backdrop-blur">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Smart Regional Analytics</h2>
              <p className="mt-1 text-sm text-slate-600">
                Birth and death patterns across regions for data-driven policy decisions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={analyticsRange}
                onChange={(e) => setAnalyticsRange(e.target.value as RangeKey)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800"
              >
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last 1 year</option>
              </select>
              <Link
                href="/dashboard/reports"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <AppIcon name="reports" className="h-4 w-4" />
                Open full reports
              </Link>
            </div>
          </div>

          {analyticsLoading ? (
            <p className="text-sm text-slate-500">Loading analytics...</p>
          ) : analyticsError ? (
            <p className="text-sm text-rose-600">{analyticsError}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Top Regions</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer>
                    <BarChart data={analytics?.regionComparison ?? []} margin={{ top: 8, right: 16, left: 0, bottom: 18 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" interval={0} angle={-22} textAnchor="end" height={62} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="births" fill="#3b82f6" />
                      <Bar dataKey="deaths" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Monthly Trend</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer>
                    <LineChart data={analytics?.trends ?? []} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="births" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="deaths" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
