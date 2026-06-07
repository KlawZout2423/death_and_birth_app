"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type NextOfKinPayload = {
  lookupStatus: "FOUND" | "NOT_FOUND";
  infoSource?: string;
  fullName: string;
  relation: string;
  contactNumber: string;
  address?: string;
  notes?: string;
};

export default function NextOfKinForm({
  deathRecordId,
  titleSuffix,
  variant = "bank",
}: {
  deathRecordId: string;
  titleSuffix: string;
  variant?: "bank" | "insurance" | "ssnit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<NextOfKinPayload>({
    lookupStatus: "FOUND",
    infoSource: "",
    fullName: "",
    relation: "",
    contactNumber: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const theme = themeByVariant[variant];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/next-of-kin?deathRecordId=${encodeURIComponent(deathRecordId)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load next-of-kin");
        }
        const body = await res.json();
        const item = body.item;
        if (item) {
          setForm({
            lookupStatus: item.lookupStatus === "NOT_FOUND" ? "NOT_FOUND" : "FOUND",
            infoSource: item.infoSource ?? "",
            fullName: item.fullName ?? "",
            relation: item.relation ?? "",
            contactNumber: item.contactNumber ?? "",
            address: item.address ?? "",
            notes: item.notes ?? "",
          });
        }
      } catch (e: any) {
        setError(e.message ?? "Failed to load next-of-kin");
      } finally {
        setLoading(false);
      }
    };

    if (deathRecordId) load();
  }, [deathRecordId]);

  const missingForFound =
    form.lookupStatus === "FOUND" &&
    (!form.fullName.trim() || !form.relation.trim() || !form.contactNumber.trim());
  const missingForNotFound = form.lookupStatus === "NOT_FOUND" && (form.notes ?? "").trim().length < 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missingForFound) {
      setError("Full name, relation, and contact number are required when record is found.");
      return;
    }
    if (missingForNotFound) {
      setError("Please add notes (at least 3 characters) to explain why no record was found.");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/next-of-kin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deathRecordId, ...form }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to save next-of-kin");
      setMessage("Next-of-kin saved.");
    } catch (e: any) {
      setError(e.message ?? "Failed to save next-of-kin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${theme.back}`}
          >
            <span aria-hidden>←</span>
            Back
          </button>
          <h1 className={`mt-4 text-3xl font-bold ${theme.title}`}>Next of Kin {titleSuffix}</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Capture next-of-kin details linked to a verified death notification.
        </p>
      </div>

      {(error || message) && (
        <div
          className={`rounded-xl border p-4 ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100"
              : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-300">Loading...</div>
        ) : (
          <form onSubmit={submit} className={`space-y-4 ${saving ? "pointer-events-none opacity-70" : ""}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Record found?" required>
                <select
                  value={form.lookupStatus}
                  onChange={(e) =>
                    setForm((p) => {
                      const next = e.target.value === "NOT_FOUND" ? "NOT_FOUND" : "FOUND";
                      return {
                        ...p,
                        lookupStatus: next,
                        ...(next === "NOT_FOUND"
                          ? { fullName: "", relation: "", contactNumber: "", address: "" }
                          : null),
                      };
                    })
                  }
                  className={inputClass}
                >
                  <option value="FOUND">Found (I have next-of-kin details)</option>
                  <option value="NOT_FOUND">Not found (no record / no beneficiary details)</option>
                </select>
              </Field>
              <Field label="Source of info">
                <input
                  value={form.infoSource ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, infoSource: e.target.value }))}
                  placeholder='e.g., "Bank records", "Customer file", "Phone call"'
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full name" required>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  required={form.lookupStatus === "FOUND"}
                  disabled={form.lookupStatus === "NOT_FOUND"}
                  className={inputClass}
                />
              </Field>
              <Field label="Relation" required>
                <input
                  value={form.relation}
                  onChange={(e) => setForm((p) => ({ ...p, relation: e.target.value }))}
                  required={form.lookupStatus === "FOUND"}
                  disabled={form.lookupStatus === "NOT_FOUND"}
                  className={inputClass}
                />
              </Field>
              <Field label="Contact number" required>
                <input
                  value={form.contactNumber}
                  onChange={(e) => setForm((p) => ({ ...p, contactNumber: e.target.value }))}
                  required={form.lookupStatus === "FOUND"}
                  disabled={form.lookupStatus === "NOT_FOUND"}
                  className={inputClass}
                />
              </Field>
              <Field label="Address">
                <input
                  value={form.address ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  disabled={form.lookupStatus === "NOT_FOUND"}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label={form.lookupStatus === "NOT_FOUND" ? "Notes (required)" : "Notes"}>
              <textarea
                rows={3}
                value={form.notes ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                required={form.lookupStatus === "NOT_FOUND"}
                className={inputClass}
              />
            </Field>

            <div className="flex justify-end">
              <button
                type="submit"
                className={`rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 ${theme.primary}`}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save next-of-kin"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

const themeByVariant = {
  bank: {
    title: "text-emerald-700 dark:text-emerald-200",
    primary: "bg-emerald-600 hover:bg-emerald-700",
    back: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100 dark:hover:bg-emerald-900/30",
  },
  insurance: {
    title: "text-sky-700 dark:text-sky-200",
    primary: "bg-sky-600 hover:bg-sky-700",
    back: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-100 dark:hover:bg-sky-900/30",
  },
  ssnit: {
    title: "text-amber-700 dark:text-amber-200",
    primary: "bg-amber-600 hover:bg-amber-700",
    back: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100 dark:hover:bg-amber-900/30",
  },
} as const;

