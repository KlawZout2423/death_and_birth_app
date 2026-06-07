"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

const emptyForm = {
  childName: "",
  dateOfBirth: "",
  timeOfBirth: "",
  gender: "",
  placeOfBirth: "",
  birthRegionId: "",
  birthType: "",
  motherName: "",
  fatherName: "",
  informantName: "",
  contactNumber: "",
  registrationCenter: "",
  attendantName: "",
  supportingDocumentUrl: "",
  verificationNotes: "",
};

export default function RegisterBirthPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/birth-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: form.childName,
          dateOfBirth: form.dateOfBirth,
          timeOfBirth: form.timeOfBirth || undefined,
          gender: form.gender || undefined,
          placeOfBirth: form.placeOfBirth,
          birthRegionId: form.birthRegionId || undefined,
          birthType: form.birthType || undefined,
          motherName: form.motherName,
          fatherName: form.fatherName,
          informantName: form.informantName || undefined,
          contactNumber: form.contactNumber || undefined,
          registrationCenter: form.registrationCenter || undefined,
          attendantName: form.attendantName || undefined,
          supportingDocumentUrl: form.supportingDocumentUrl || undefined,
          verificationNotes: form.verificationNotes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register birth");

      const recordId = data?.record?.id as string | undefined;
      if (recordId) {
        router.push(`/registrar/record/${encodeURIComponent(recordId)}`);
        return;
      }

      setMessage("Birth record submitted for verification.");
      setForm(emptyForm);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="registrar" userName="Registrar">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">Birth Registration</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Record a birth and attach the key verification details the review team will need.
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-900 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-100">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Child Name" required><input value={form.childName} onChange={(e) => setForm((prev) => ({ ...prev, childName: e.target.value }))} required className={inputClass} /></Field>
            <Field label="Date of Birth" required><input type="date" value={form.dateOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} required className={inputClass} /></Field>
            <Field label="Time of Birth"><input type="time" value={form.timeOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, timeOfBirth: e.target.value }))} className={inputClass} /></Field>
            <Field label="Gender"><input value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} className={inputClass} /></Field>
            <Field label="Place of Birth" required><input value={form.placeOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, placeOfBirth: e.target.value }))} required className={inputClass} /></Field>
            <Field label="Region">
              <select value={form.birthRegionId} onChange={(e) => setForm((prev) => ({ ...prev, birthRegionId: e.target.value }))} className={inputClass}>
                <option value="">Select region (optional)</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name} ({region.code})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Birth Type"><input value={form.birthType} onChange={(e) => setForm((prev) => ({ ...prev, birthType: e.target.value }))} className={inputClass} /></Field>
            <Field label="Mother Name" required><input value={form.motherName} onChange={(e) => setForm((prev) => ({ ...prev, motherName: e.target.value }))} required className={inputClass} /></Field>
            <Field label="Father Name" required><input value={form.fatherName} onChange={(e) => setForm((prev) => ({ ...prev, fatherName: e.target.value }))} required className={inputClass} /></Field>
            <Field label="Informant Name"><input value={form.informantName} onChange={(e) => setForm((prev) => ({ ...prev, informantName: e.target.value }))} className={inputClass} /></Field>
            <Field label="Informant Contact"><input value={form.contactNumber} onChange={(e) => setForm((prev) => ({ ...prev, contactNumber: e.target.value }))} className={inputClass} /></Field>
            <Field label="Registration Center"><input value={form.registrationCenter} onChange={(e) => setForm((prev) => ({ ...prev, registrationCenter: e.target.value }))} className={inputClass} /></Field>
            <Field label="Attendant / Midwife"><input value={form.attendantName} onChange={(e) => setForm((prev) => ({ ...prev, attendantName: e.target.value }))} className={inputClass} /></Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Supporting Document URL"><input value={form.supportingDocumentUrl} onChange={(e) => setForm((prev) => ({ ...prev, supportingDocumentUrl: e.target.value }))} className={inputClass} /></Field>
            <Field label="Verification Notes"><textarea value={form.verificationNotes} onChange={(e) => setForm((prev) => ({ ...prev, verificationNotes: e.target.value }))} rows={3} className={inputClass} /></Field>
          </div>

          <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/70 p-4 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-100">
            Add the clinic slip, declaration link, or other supporting document URL here so the review officer can verify the process quickly.
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="rounded-xl bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700 disabled:opacity-60">
              {saving ? "Submitting..." : "Submit Birth Record"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}{required ? " *" : ""}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";
