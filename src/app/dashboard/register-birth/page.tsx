"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import BirthForm from "@/components/BirthForm";

export default function AdminRegisterBirthPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Array<{ id: string; name: string; code: string }>>([]);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await fetch("/api/regions");
        if (!res.ok) return;
        const data = await res.json();
        setRegions(data.regions || []);
      } catch {
        setRegions([]);
      }
    };
    loadRegions();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      // This app currently stores documents as URLs, so we only submit the core fields.
      const res = await fetch("/api/birth-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: data.childName,
          dateOfBirth: data.dateOfBirth,
          timeOfBirth: data.timeOfBirth || undefined,
          gender: data.gender || undefined,
          placeOfBirth: data.placeOfBirth,
          birthRegionId: data.birthRegionId || undefined,
          motherName: data.motherName,
          fatherName: data.fatherName,
          contactNumber: data.contactNumber,
          registrationCenter: undefined,
          attendantName: undefined,
          supportingDocumentUrl: undefined,
          verificationNotes: undefined,
          documents: [],
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to submit birth record");

      setMessage("Birth record submitted for verification.");
      const recordId = body?.record?.id as string | undefined;
      if (recordId) {
        router.push(`/dashboard/review/${encodeURIComponent(recordId)}`);
        return;
      }
      router.push("/dashboard/pending-records");
    } catch (e: any) {
      setError(e.message ?? "Failed to submit birth record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Register Birth (Registrar General)</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            The Registrar General can create records when necessary. The record will still go through verification workflow.
          </p>
        </div>

        {(error || message) && (
          <div
            className={`rounded-xl border p-4 ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-rose-100"
            }`}
          >
            {error ?? message}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <BirthForm onSubmit={onSubmit} isLoading={submitting} regionOptions={regions} />
        </div>
      </div>
    </DashboardLayout>
  );
}

