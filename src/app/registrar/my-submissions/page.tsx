"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface Submission {
  id: string;
  name: string;
  type: "birth" | "death";
  date: string;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "CERTIFICATE_ISSUED" | "NOTIFIED";
  rejectionReason?: string | null;
}

export default function MySubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Submission["status"]>("all");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/my-submissions");
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [router]);

  const filteredSubmissions = submissions.filter((submission) => filter === "all" || submission.status === filter);

  const statusColors = {
    PENDING_VERIFICATION: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    VERIFIED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    CERTIFICATE_ISSUED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    NOTIFIED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  };

  return (
    <DashboardLayout role="registrar" userName="Registrar">
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">Records</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Track the birth and death records you have submitted for verification.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "CERTIFICATE_ISSUED", "NOTIFIED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                filter === tab
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
              }`}
            >
              {tab === "all" ? "All" : tab.replaceAll("_", " ")}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-zinc-600 dark:text-zinc-400">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 dark:text-zinc-400">No matching submissions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700">
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Record Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Submitted Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50">
                      <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{submission.name}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {submission.type === "birth" ? "Birth Record" : "Death Record"}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{new Date(submission.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[submission.status]}`}>
                          {submission.status.replaceAll("_", " ")}
                        </span>
                        {submission.status === "REJECTED" && submission.rejectionReason && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">Reason: {submission.rejectionReason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
