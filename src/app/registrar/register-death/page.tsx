"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DeathForm from "@/components/DeathForm";

export default function RegisterDeathPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/death-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit form");
      }

      const data = await res.json().catch(() => ({}));
      const recordId = data?.record?.id as string | undefined;
      if (recordId) {
        router.push(`/registrar/record/${encodeURIComponent(recordId)}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/registrar/my-submissions"), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout role="registrar" userName="Registrar">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
              Death Registration Submitted
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Your registration has been submitted successfully. Redirecting...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="registrar" userName="Registrar">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Register Death
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Complete all steps to register a new death certificate
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <DeathForm onSubmit={handleSubmit} isLoading={loading} regionOptions={regions} />
        </div>
      </div>
    </DashboardLayout>
  );
}
