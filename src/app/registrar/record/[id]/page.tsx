"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import type { Record as VitalRecord } from "@/lib/recordStore";

export default function RegistrarRecordPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [record, setRecord] = useState<VitalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/records/${id}`);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load record");
        const data = await res.json();
        setRecord(data.record as VitalRecord);
      } catch (e: any) {
        setError(e.message ?? "Failed to load record");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id, router]);

  const title = record?.type === "birth" ? "Birth record" : record?.type === "death" ? "Death record" : "Record";

  return (
    <DashboardLayout role="registrar" userName="Registrar">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              This is the record you just submitted. It will appear in “My Submissions” while it’s pending verification.
            </p>
          </div>
          <Link
            href="/registrar/my-submissions"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            ← Back to Records
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Loading...
          </div>
        ) : !record ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Record not found.
          </div>
        ) : (
          <RecordPreview record={record} />
        )}
      </div>
    </DashboardLayout>
  );
}

function RecordPreview({ record }: { record: VitalRecord }) {
  const isDeath = record.type === "death";

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div className="space-y-5 xl:col-span-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Record overview</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Record type" value={capitalize(record.type)} />
            <Info label="Status" value={record.status.replaceAll("_", " ")} />
            <Info label="Created" value={formatDateTime(record.createdAt)} />
            <Info label="Last updated" value={formatDateTime(record.updatedAt)} />
            <Info label="Record ID" value={record.id} mono />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            {isDeath ? "Deceased details" : "Child details"}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isDeath ? (
              <>
                <Info label="Full name" value={record.fullName} />
                <Info label="National ID" value={record.nationalId ?? "—"} mono />
                <Info label="Date of birth" value={formatDate(record.dateOfBirth)} />
                <Info label="Date of death" value={formatDate(record.dateOfDeath)} />
                <Info label="Time of death" value={record.timeOfDeath || "—"} />
                <Info label="Age at death" value={record.ageAtDeath ? String(record.ageAtDeath) : "—"} />
                <Info label="Gender" value={record.gender || "—"} />
                <Info label="Place of death" value={record.placeOfDeath} />
                <Info label="Cause of death" value={record.causeOfDeath} wide />
              </>
            ) : (
              <>
                <Info label="Child name" value={record.childName} />
                <Info label="Gender" value={record.gender || "—"} />
                <Info label="Date of birth" value={formatDate(record.dateOfBirth)} />
                <Info label="Time of birth" value={record.timeOfBirth || "—"} />
                <Info label="Place of birth" value={record.placeOfBirth} />
                <Info label="Birth type" value={record.birthType || "—"} />
                <Info label="Mother name" value={record.motherName} />
                <Info label="Father name" value={record.fatherName} />
                <Info label="Registration center" value={record.registrationCenter || "—"} wide />
                <Info label="Attendant name" value={record.attendantName || "—"} wide />
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Informant</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Name" value={record.informantName || "—"} />
            <Info label="Contact" value={record.informantContact || record.contactNumber || "—"} />
            {"informantRelation" in record ? <Info label="Relation" value={record.informantRelation || "—"} /> : null}
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Certificate</p>
          <div className="mt-4">
            {record.certificateId ? (
              <Link
                href={`/certificate/${record.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View official certificate →
              </Link>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Certificate not yet issued.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Documents</p>
          <div className="mt-4 space-y-3">
            {record.documents?.length ? (
              record.documents.map((url, idx) => (
                <a
                  key={`${url}-${idx}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
                >
                  Open document {idx + 1} →
                  <div className="mt-1 break-all text-xs font-normal text-zinc-600 dark:text-zinc-400">{url}</div>
                </a>
              ))
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">No documents attached.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
  wide,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">{label}</div>
      <div className={`mt-1 text-sm text-zinc-900 dark:text-zinc-100 ${mono ? "font-mono" : ""}`}>
        {value?.trim?.() ? value : "—"}
      </div>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function capitalize(value: string) {
  return value ? value.slice(0, 1).toUpperCase() + value.slice(1) : value;
}

