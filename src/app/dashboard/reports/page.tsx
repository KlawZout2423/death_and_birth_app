"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RangeKey = "30d" | "90d" | "1y";

type AnalyticsResponse = {
  summary: {
    births: number;
    deaths: number;
    records: number;
    regionsCovered: number;
  };
  regionComparison: Array<{ region: string; births: number; deaths: number }>;
  trends: Array<{ month: string; births: number; deaths: number }>;
};

const rangeOptions: Array<{ label: string; value: RangeKey }> = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 1 year", value: "1y" },
];

export default function ReportsPage() {
  const [range, setRange] = useState<RangeKey>("90d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/analytics/overview?range=${range}`);
        if (!response.ok) {
          throw new Error("Failed to load analytics data");
        }
        const payload = (await response.json()) as AnalyticsResponse;
        setData(payload);
      } catch (err) {
        console.error("Analytics fetch error", err);
        setError("Unable to load analytics right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [range]);

  const formattedTrends = useMemo(() => {
    return (data?.trends || []).map((item) => ({
      ...item,
      month: item.month,
    }));
  }, [data]);

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Smart Reports Panel</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Birth and death records by region with trend analytics.
            </p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat title="Births" value={data?.summary.births ?? 0} />
          <Stat title="Deaths" value={data?.summary.deaths ?? 0} />
          <Stat title="Total Records" value={data?.summary.records ?? 0} />
          <Stat title="Regions Covered" value={data?.summary.regionsCovered ?? 0} />
        </section>

        {loading ? <Card>Loading analytics...</Card> : null}
        {error ? <Card>{error}</Card> : null}

        {!loading && !error ? (
          <>
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Region Comparison (Top 10)</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <BarChart data={data?.regionComparison || []} margin={{ top: 12, right: 18, left: 0, bottom: 18 }}>
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
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Monthly Trend</h2>
              <div className="h-80 w-full">
                <ResponsiveContainer>
                  <LineChart data={formattedTrends} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
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
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">{children}</section>;
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}

