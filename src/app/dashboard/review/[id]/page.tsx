"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import type { Record as VitalRecord } from "@/lib/recordStore";

export default function ReviewRecordPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [record, setRecord] = useState<VitalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isVerified = record?.status === "VERIFIED" || record?.status === "NOTIFIED" || record?.status === "CERTIFICATE_ISSUED";
  const isPending = record?.status === "PENDING_VERIFICATION";
  const isDeath = record?.type === "death";
  const hasCertificate = Boolean((record as any)?.certificateId);
  const canSendNotifications = isDeath && (record?.status === "VERIFIED" || record?.status === "NOTIFIED" || record?.status === "CERTIFICATE_ISSUED");
  const notificationsSent = record?.status === "NOTIFIED";

  const displayName = useMemo(() => {
    if (!record) return "";
    return record.type === "birth" ? record.childName : record.deceasedName;
  }, [record]);

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

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const approve = async () => {
    setActing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/records/${id}/approve`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Approval failed");
      setMessage("Record verified.");
      await load();
    } catch (e: any) {
      setError(e.message ?? "Approval failed");
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    const reason = window.prompt("Rejection reason");
    if (!reason) return;
    setActing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/records/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Rejection failed");
      setMessage("Record rejected.");
      await load();
    } catch (e: any) {
      setError(e.message ?? "Rejection failed");
    } finally {
      setActing(false);
    }
  };

  const issueCertificate = async () => {
    setActing(true);
    setError(null);
    setMessage(null);
    try {
      const body = isDeath
        ? { deathRecordId: id }
        : { birthRecordId: id };
      const res = await fetch(`/api/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Certificate issuance failed");
      setMessage("Certificate issued.");
      await load();
    } catch (e: any) {
      setError(e.message ?? "Certificate issuance failed");
    } finally {
      setActing(false);
    }
  };

  const sendNotifications = async () => {
    setActing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send notifications");
      setMessage("Notifications sent to institutions.");
      await load();
    } catch (e: any) {
      setError(e.message ?? "Failed to send notifications");
    } finally {
      setActing(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Review Record</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Verify submissions and issue certificates (death records only).
            </p>
          </div>
          <Link
            href="/dashboard/pending-records"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            ← Back to pending
          </Link>
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

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Loading...
          </div>
        ) : !record ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Record not found.
          </div>
        ) : (
          <div className={`space-y-5 ${acting ? "pointer-events-none opacity-70" : ""}`}>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Type: <span className="font-semibold capitalize">{record.type}</span> · Status:{" "}
                    <span className="font-semibold">{record.status.replaceAll("_", " ")}</span> ·{" "}
                    <span className="font-mono text-xs">{record.id}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Chip label={`Created ${formatDateTime(record.createdAt)}`} />
                    <Chip label={`Updated ${formatDateTime(record.updatedAt)}`} />
                    {record.registrarEmail ? <Chip label={`Submitted by ${record.registrarEmail}`} /> : null}
                    {record.verifiedByName ? <Chip label={`Verified by ${record.verifiedByName}`} /> : null}
                    {record.rejectionReason ? <Chip variant="danger" label={`Rejection: ${record.rejectionReason}`} /> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={approve}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Verify
                      </button>
                      <button
                        onClick={reject}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {isDeath && isVerified && (
                    <>
                      {canSendNotifications && (
                        <button
                          onClick={sendNotifications}
                          className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          {notificationsSent ? "Resend Notifications" : "Send Notifications"}
                        </button>
                      )}
                      <button
                        onClick={issueCertificate}
                        disabled={record.status === "CERTIFICATE_ISSUED"}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        Issue Certificate
                      </button>
                      {(record.status === "CERTIFICATE_ISSUED" || hasCertificate) && (
                        <Link
                          href={`/certificate/${record.id}`}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          View Certificate →
                        </Link>
                      )}
                    </>
                  )}

                  {!isDeath && isVerified && (
                    <>
                      <button
                        onClick={issueCertificate}
                        disabled={record.status === "CERTIFICATE_ISSUED"}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        Issue Birth Certificate
                      </button>
                      {(record.status === "CERTIFICATE_ISSUED" || hasCertificate) && (
                        <Link
                          href={`/certificate/${record.id}`}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          View Certificate →
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <RecordPreview record={record} />
          </div>
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
            <Info label="Registrar" value={record.registrarEmail ?? "—"} mono />
            <Info label="Reviewer" value={record.verifiedByName ?? "—"} />
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

        {"certificateId" in record && record.type === "death" ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Certificate</p>
            <div className="mt-4 space-y-3">
              <Info label="Certificate number" value={record.certificateId ?? "—"} mono />
              <Info label="Issued at" value={record.approvedAt ? formatDateTime(record.approvedAt) : "—"} />
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Raw record (debug)</p>
          <details className="mt-4">
            <summary className="cursor-pointer select-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-900/60">
              Show JSON
            </summary>
            <pre className="mt-3 max-h-[520px] overflow-auto rounded-xl bg-zinc-950 p-4 text-xs text-zinc-100">
              {JSON.stringify(record, null, 2)}
            </pre>
          </details>
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

function Chip({ label, variant }: { label: string; variant?: "danger" }) {
  const cls =
    variant === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-100"
      : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200";
  return <span className={`rounded-full border px-3 py-1 ${cls}`}>{label}</span>;
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

