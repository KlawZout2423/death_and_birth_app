"use client";

import { useEffect, useState } from "react";
import CertificatePreviewModal from "@/components/CertificatePreviewModal";

interface NotificationItem {
  id: string;
  deathRecordId: string;
  institution: string;
  status: string;
  deceasedName: string;
  gender?: string | null;
  dateOfBirth?: string;
  dateOfDeath: string;
  placeOfDeath?: string;
  certificateNumber?: string | null;
  sentAt: string;
}

export default function BankNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<NotificationItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markReceived = async (id: string) => {
    setActingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/notifications/${id}/receive`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to mark as received");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "RECEIVED" } : n)),
      );
    } catch (e: any) {
      setError(e.message ?? "Failed to mark as received");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {preview && (
        <CertificatePreviewModal
          deathRecordId={preview.deathRecordId}
          certificateNumber={preview.certificateNumber}
          deceasedName={preview.deceasedName}
          onClose={() => setPreview(null)}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Notifications</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Review death-record notifications sent to the bank.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-700">
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Deceased</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">DOB</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Date of Death</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Place of Death</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Certificate</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Sent At</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-600 dark:text-zinc-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">Loading...</td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">No notifications available.</td>
              </tr>
            ) : (
              notifications.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{item.deceasedName}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{new Date(item.dateOfDeath).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{item.placeOfDeath || "—"}</td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-900 dark:text-zinc-100">{item.certificateNumber || "—"}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{new Date(item.sentAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{item.status}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {item.certificateNumber && (
                        <button
                          type="button"
                          onClick={() => setPreview(item)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100 dark:hover:bg-blue-900/30"
                        >
                          📄 View Certificate
                        </button>
                      )}
                      <a
                        href={`/bank/next-of-kin?deathRecordId=${encodeURIComponent(item.deathRecordId)}`}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100 dark:hover:bg-emerald-900/30"
                      >
                        Next of kin
                      </a>
                      <button
                        type="button"
                        onClick={() => markReceived(item.id)}
                        disabled={item.status === "RECEIVED" || actingId === item.id}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                      >
                        {item.status === "RECEIVED" ? "Received" : "Mark as received"}
                      </button>
                    </div>
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
