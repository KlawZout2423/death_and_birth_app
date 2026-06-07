"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: "blue" | "green" | "yellow" | "red";
}

export function StatCard({ title, value, icon, color = "blue" }: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-50/90 border-blue-200 shadow-blue-100/60",
    green: "bg-emerald-50/90 border-emerald-200 shadow-emerald-100/60",
    yellow: "bg-amber-50/90 border-amber-200 shadow-amber-100/60",
    red: "bg-rose-50/90 border-rose-200 shadow-rose-100/60",
  };

  const textColorMap = {
    blue: "text-blue-600",
    green: "text-emerald-600",
    yellow: "text-amber-600",
    red: "text-rose-600",
  };

  const iconShellMap = {
    blue: "bg-blue-600 text-white",
    green: "bg-emerald-600 text-white",
    yellow: "bg-amber-500 text-white",
    red: "bg-rose-600 text-white",
  };

  return (
    <div className={`${colorMap[color]} border rounded-2xl p-6 shadow-lg backdrop-blur-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">{title}</p>
          <p className={`text-3xl font-bold ${textColorMap[color]} mt-2`}>{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md ${iconShellMap[color]}`}>
          <span className="h-6 w-6">{icon}</span>
        </div>
      </div>
    </div>
  );
}

interface RecentSubmissionProps {
  id: string;
  name: string;
  type: "birth" | "death";
  date: string;
  status: "draft" | "submitted" | "pending" | "approved" | "rejected";
}

export function RecentSubmissionsTable({ submissions }: { submissions: RecentSubmissionProps[] }) {
  const statusColors = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Submissions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-700">
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No submissions yet
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id} className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{sub.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100 capitalize">{sub.type}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{new Date(sub.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[sub.status]}`}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {sub.status === "approved" ? (
                      <a
                        href={`/certificate/${sub.id}`}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors inline-flex items-center gap-1"
                      >
                        📄 View Certificate
                      </a>
                    ) : sub.status === "pending" || sub.status === "submitted" ? (
                      <span className="text-zinc-500 dark:text-zinc-400 text-sm">Awaiting approval</span>
                    ) : sub.status === "rejected" ? (
                      <span className="text-red-600 dark:text-red-400 text-sm">Rejected</span>
                    ) : (
                      <a
                        href={`/dashboard/my-submissions/${sub.id}`}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Edit
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface PendingRecordProps {
  id: string;
  certificateId: string;
  name: string;
  type: "birth" | "death";
  date: string;
}

export function PendingRecordsTable({ records, onApprove, onReject }: { records: PendingRecordProps[]; onApprove?: (id: string) => void; onReject?: (id: string) => void }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pending Approvals</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-700">
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Certificate ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No pending records
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{record.certificateId}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{record.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100 capitalize">{record.type}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <a
                      href={`/dashboard/review/${record.id}`}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                    >
                      👁 View
                    </a>
                    <button onClick={() => onApprove?.(record.id)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                      ✅ Approve
                    </button>
                    <button onClick={() => onReject?.(record.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ApprovedRecordsTable({ records }: { records: PendingRecordProps[] }) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Approved Certificates</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-700">
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Certificate ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Approved Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No approved records yet
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{record.certificateId}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{record.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100 capitalize">{record.type}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {record.type === "death" ? (
                      <a
                        href={`/certificate/${record.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors inline-flex items-center gap-2"
                      >
                        📄 View Certificate
                      </a>
                    ) : (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">No certificate (birth record)</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
