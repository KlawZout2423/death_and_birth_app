"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

type CertificateItem = {
  id: string; // deathRecordId
  certificateRecordId: string;
  certificateId: string;
  name: string;
  type: "death";
  date: string;
  status: "CERTIFICATE_ISSUED";
};

type RecordItem = {
  id: string;
  type: "birth" | "death";
  status: string;
  deceasedName?: string;
  fullName?: string;
  childName?: string;
  createdAt: string;
  updatedAt: string;
};

export default function CertificatesPage() {
  const router = useRouter();
  const [issued, setIssued] = useState<CertificateItem[]>([]);
  const [verifiedDeaths, setVerifiedDeaths] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issuingId, setIssuingId] = useState<string | null>(null);

  const verifiedSorted = useMemo(() => {
    return [...verifiedDeaths].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [verifiedDeaths]);

  const issuedSorted = useMemo(() => {
    return [...issued].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [issued]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [certRes, verifiedRes] = await Promise.all([
        fetch("/api/certificates"),
        fetch("/api/records?type=death"),
      ]);

      if (certRes.status === 401 || verifiedRes.status === 401) {
        router.push("/login");
        return;
      }

      if (!certRes.ok) {
        const data = await certRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load certificates");
      }
      if (!verifiedRes.ok) {
        throw new Error("Failed to load verified records");
      }

      const certData = await certRes.json();
      const verifiedData = await verifiedRes.json();

      setIssued((certData.certificates ?? []) as CertificateItem[]);
      const verified = (verifiedData.records ?? []) as RecordItem[];
      const issuedIds = new Set<string>((certData.certificates ?? []).map((c: CertificateItem) => c.id));
      setVerifiedDeaths(
        verified.filter(
          (r) =>
            r.type === "death" &&
            (r.status === "VERIFIED" || r.status === "NOTIFIED") &&
            !issuedIds.has(r.id),
        ),
      );
    } catch (e: any) {
      setError(e.message ?? "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const issue = async (deathRecordId: string) => {
    setIssuingId(deathRecordId);
    setError(null);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deathRecordId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to issue certificate");
      await load();
    } catch (e: any) {
      setError(e.message ?? "Failed to issue certificate");
    } finally {
      setIssuingId(null);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Certificates</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Issue certificates for verified death records and review previously issued certificates.
            </p>
          </div>
          <Link
            href="/dashboard/pending-records"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Pending verification →
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
          <div className={issuingId ? "pointer-events-none opacity-70" : ""}>
            <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Ready to issue</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Death records that have been verified by the Registrar General but do not have a certificate yet.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-700">
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Record</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Verified date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifiedSorted.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                          No verified death records waiting for certificates.
                        </td>
                      </tr>
                    ) : (
                      verifiedSorted.map((r) => (
                        <tr key={r.id} className="border-t border-zinc-200 dark:border-zinc-700">
                          <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {r.deceasedName || r.fullName || r.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {new Date(r.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/dashboard/review/${r.id}`}
                                className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                              >
                                Review
                              </Link>
                              <button
                                onClick={() => issue(r.id)}
                                className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-blue-700"
                              >
                                Issue certificate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Issued certificates</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Certificates already issued (death records only).
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-700">
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Certificate #</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Issued</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedSorted.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                          No certificates issued yet.
                        </td>
                      </tr>
                    ) : (
                      issuedSorted.map((c) => (
                        <tr key={c.certificateRecordId} className="border-t border-zinc-200 dark:border-zinc-700">
                          <td className="px-6 py-4 text-sm font-mono text-zinc-900 dark:text-zinc-100">{c.certificateId}</td>
                          <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{c.name}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {new Date(c.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/certificate/${c.id}`}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                              View / Print
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

