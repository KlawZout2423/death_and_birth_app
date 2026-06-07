"use client";

import { useSearchParams } from "next/navigation";
import NextOfKinForm from "@/components/NextOfKinForm";

export default function InsuranceNextOfKinPage() {
  const searchParams = useSearchParams();
  const deathRecordId = searchParams.get("deathRecordId");

  if (!deathRecordId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Next of Kin</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Open this page from a notification.</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
          Missing <span className="font-mono">deathRecordId</span> in the URL.
        </div>
      </div>
    );
  }

  return (
    <NextOfKinForm deathRecordId={deathRecordId} titleSuffix="(Insurance)" variant="insurance" />
  );
}
