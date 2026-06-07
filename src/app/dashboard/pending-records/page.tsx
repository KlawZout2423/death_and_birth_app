"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { PendingRecordsTable } from "@/components/DashboardCards";

type PendingItem = {
  id: string;
  certificateId: string;
  name: string;
  type: "birth" | "death";
  date: string;
};

export default function PendingRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard?role=admin");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load pending records");
      const data = await res.json();
      setRecords((data.pendingRecords ?? []) as PendingItem[]);
    } catch (e: any) {
      setError(e.message ?? "Failed to load pending records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id: string) => {
    setActionLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/records/${id}/approve`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Approval failed");
      await load();
    } catch (e: any) {
      setError(e.message ?? "Approval failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt("Rejection reason");
    if (!reason) return;

    setActionLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/records/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Rejection failed");
      await load();
    } catch (e: any) {
      setError(e.message ?? "Rejection failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Pending Verification</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Records submitted by registrars appear here for Registrar General verification.
            </p>
          </div>
          <Link
            href="/dashboard/certificates"
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Certificates →
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Loading...
          </div>
        ) : (
          <div className={actionLoadingId ? "pointer-events-none opacity-70" : ""}>
            <PendingRecordsTable records={sorted} onApprove={approve} onReject={reject} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

