"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { AppIcon } from "@/components/AppIcon";
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

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    idCheck: false,
    placeCheck: false,
    informantCheck: false,
    centerCheck: false,
  });

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isVerified = record?.status === "VERIFIED" || record?.status === "NOTIFIED" || record?.status === "CERTIFICATE_ISSUED";
  const isPending = record?.status === "PENDING_VERIFICATION";
  const isDeath = record?.type === "death";
  const isBirth = record?.type === "birth";
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
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Breadcrumbs / Nav */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/50 pb-5 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
              <span>/</span>
              <Link href="/dashboard/pending-records" className="hover:text-blue-600 transition">Queue</Link>
              <span>/</span>
              <span className="text-zinc-600 dark:text-zinc-400">Review</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold text-zinc-900 tracking-tight dark:text-white">
              Submission Verification
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Verify official registry details, inspect attachments, and approve certificate generation.
            </p>
          </div>
          <Link
            href="/dashboard/pending-records"
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 hover:shadow dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            ← Back to Queue
          </Link>
        </div>

        {/* Notifications */}
        {(error || message) && (
          <div
            className={`rounded-2xl border p-4 text-sm font-medium transition-all shadow-sm ${
              error
                ? "border-rose-200 bg-rose-50/60 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300"
                : "border-emerald-200 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{error ? "⚠️" : "✨"}</span>
              <p>{error ?? message}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-850 dark:bg-zinc-900 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading record details...</p>
            </div>
          </div>
        ) : !record ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-850 dark:bg-zinc-900">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Record Not Found</h3>
            <p className="mt-1 text-sm text-zinc-500">The requested record does not exist or has been deleted.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 xl:grid-cols-3 ${acting ? "pointer-events-none opacity-60" : ""}`}>
            {/* Left: Document View Sheet */}
            <div className="xl:col-span-2 space-y-6">
              {/* Official Document Sheet */}
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-[#fdfdfb] p-8 md:p-12 shadow-[0_15px_45px_-20px_rgba(0,0,0,0.08)] dark:bg-zinc-900 dark:border-zinc-800">
                {/* Faded Watermark background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
                  <span className="font-serif text-[8rem] font-bold tracking-[0.1em] uppercase rotate-[-25deg] text-zinc-900 dark:text-white">
                    {isBirth ? "BIRTH" : "DEATH"}
                  </span>
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between font-serif">
                  {/* Registry Seal & Header */}
                  <div className="text-center mb-8 border-b-2 border-zinc-200/60 pb-8 dark:border-zinc-800">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-800/20 bg-amber-50 dark:bg-zinc-800">
                      <span className="text-2xl">{isBirth ? "👶" : "🕊️"}</span>
                    </div>
                    <p className="font-serif text-[10px] font-semibold tracking-[0.35em] text-amber-900 uppercase dark:text-amber-500">
                      Republic of Ghana
                    </p>
                    <p className="mt-1 font-serif text-[11px] tracking-wider text-zinc-500 dark:text-zinc-400">
                      Births & Deaths Registry Department
                    </p>
                    <h2 className="mt-4 font-serif text-2xl font-bold tracking-wide text-zinc-900 dark:text-white">
                      Official {isBirth ? "Birth" : "Death"} Record Particulars
                    </h2>
                  </div>

                  {/* Main details partitioned like an official sheet */}
                  <div className="space-y-8">
                    {/* SECTION 1: Subject info */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900 border-b border-amber-900/10 pb-2 mb-4 dark:text-amber-500">
                        Particulars of {isBirth ? "Child" : "Deceased"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <DocField label={isBirth ? "Full Name of Child" : "Full Name of Deceased"} value={isBirth ? record.childName : (record.fullName || (record as any).deceasedName)} highlight />
                        <DocField label="Gender / Sex" value={record.gender || "—"} />
                        <DocField label="Date of Occurrence" value={formatDate(isBirth ? record.dateOfBirth : record.dateOfDeath)} />
                        <DocField label="Time of Occurrence" value={(isBirth ? record.timeOfBirth : record.timeOfDeath) || "—"} />
                        <DocField label="Place of Occurrence" value={isBirth ? record.placeOfBirth : record.placeOfDeath} />
                        {isBirth ? (
                          <>
                            <DocField label="Birth Type (Single/Multiple)" value={record.birthType || "—"} />
                          </>
                        ) : (
                          <>
                            <DocField label="National ID (GHA Card)" value={record.nationalId || "—"} mono />
                            <DocField label="Age at Occurrence" value={record.ageAtDeath ? `${record.ageAtDeath} years` : "—"} />
                            <DocField label="Cause of Death" value={record.causeOfDeath} wide />
                          </>
                        )}
                      </div>
                    </div>

                    {/* SECTION 2: Parents (Birth) or Informant (Death) */}
                    {isBirth ? (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900 border-b border-amber-900/10 pb-2 mb-4 dark:text-amber-500">
                          Particulars of Parentage
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <DocField label="Mother's Full Name" value={record.motherName} />
                          <DocField label="Father's Full Name" value={record.fatherName || "—"} />
                        </div>
                      </div>
                    ) : null}

                    {/* SECTION 3: Informant & Attendant */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-900 border-b border-amber-900/10 pb-2 mb-4 dark:text-amber-500">
                        Particulars of Registration & Source
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <DocField label="Informant Name" value={record.informantName || "—"} />
                        <DocField label="Informant Contact" value={record.informantContact || record.contactNumber || "—"} />
                        {isBirth ? (
                          <>
                            <DocField label="Registration Center" value={record.registrationCenter || "—"} />
                            <DocField label="Attendant Name" value={record.attendantName || "—"} />
                          </>
                        ) : (
                          <>
                            <DocField label="Relationship of Informant" value={(record as any).informantRelation || "—"} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verification Footer Seal / Signature area */}
                  <div className="mt-12 border-t border-zinc-200/60 pt-8 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                          Registry Stamp Reference
                        </p>
                        <p className="mt-1 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {record.id.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`h-16 w-16 rounded-full border-2 border-dashed flex items-center justify-center select-none font-serif text-[10px] font-extrabold uppercase tracking-widest ${
                          isVerified 
                            ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5 rotate-[-12deg] dark:border-emerald-500/20 dark:text-emerald-400"
                            : "border-zinc-300 text-zinc-400 rotate-[-12deg]"
                        }`}>
                          {isVerified ? "APPROVED" : "PENDING"}
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
                            Registrar Officer Account
                          </p>
                          <p className="font-serif text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {record.registrarEmail || "Not recorded"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sidebar controls and timeline */}
            <div className="space-y-6">
              {/* Administrative Control Box */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4 dark:border-zinc-700/50">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                    Control Panel
                  </h3>
                  <StatusBadge status={record.status} />
                </div>

                <div className="space-y-4">
                  {isPending && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={approve}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 text-xs shadow-md shadow-emerald-500/10 hover:shadow-lg transition cursor-pointer"
                      >
                        <AppIcon name="check" className="h-4 w-4" />
                        Verify
                      </button>
                      <button
                        onClick={reject}
                        className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-4 text-xs shadow-md shadow-rose-500/10 hover:shadow-lg transition cursor-pointer"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {isDeath && isVerified && (
                    <div className="space-y-3">
                      {canSendNotifications && (
                        <button
                          onClick={sendNotifications}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2.5 px-4 text-xs transition cursor-pointer dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
                        >
                          <AppIcon name="notification" className="h-4 w-4" />
                          {notificationsSent ? "Resend Notifications" : "Send Notifications"}
                        </button>
                      )}
                      <button
                        onClick={issueCertificate}
                        disabled={record.status === "CERTIFICATE_ISSUED"}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 px-4 text-xs shadow-md transition disabled:cursor-not-allowed cursor-pointer"
                      >
                        <AppIcon name="certificate" className="h-4 w-4" />
                        {record.status === "CERTIFICATE_ISSUED" ? "Certificate Issued" : "Issue Certificate"}
                      </button>
                      {(record.status === "CERTIFICATE_ISSUED" || hasCertificate) && (
                        <Link
                          href={`/certificate/${record.id}`}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 px-4 text-xs transition dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:bg-blue-950/40"
                        >
                          View Certificate →
                        </Link>
                      )}
                    </div>
                  )}

                  {!isDeath && isVerified && (
                    <div className="space-y-3">
                      <button
                        onClick={issueCertificate}
                        disabled={record.status === "CERTIFICATE_ISSUED"}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 px-4 text-xs shadow-md transition disabled:cursor-not-allowed cursor-pointer"
                      >
                        <AppIcon name="certificate" className="h-4 w-4" />
                        {record.status === "CERTIFICATE_ISSUED" ? "Certificate Issued" : "Issue Certificate"}
                      </button>
                      {(record.status === "CERTIFICATE_ISSUED" || hasCertificate) && (
                        <Link
                          href={`/certificate/${record.id}`}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 px-4 text-xs transition dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:bg-blue-950/40"
                        >
                          View Certificate →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 flex items-center gap-2 mb-4">
                  <AppIcon name="shield" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Verification Checklist
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "idCheck", label: "Verify identity documents" },
                    { key: "placeCheck", label: "Confirm event occurrence details" },
                    { key: "informantCheck", label: "Validate informant relationship" },
                    { key: "centerCheck", label: "Check registration center authority" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                        checklist[item.key]
                          ? "border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-900/10 dark:text-emerald-100"
                          : "border-zinc-100 bg-zinc-50/30 text-zinc-700 dark:border-zinc-700/30 dark:bg-zinc-800/50 dark:text-zinc-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={() => toggleCheck(item.key)}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Supporting Documents */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 mb-4 flex items-center gap-2">
                  📄 Supporting Documents
                </h3>
                <div className="space-y-3">
                  {record.documents?.length ? (
                    record.documents.map((url, idx) => (
                      <a
                        key={`${url}-${idx}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 transition dark:border-zinc-700/50 dark:bg-zinc-900/40 dark:text-white dark:hover:bg-zinc-900/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">📁</span>
                          <div>
                            <p className="font-semibold text-zinc-950 dark:text-white">Attachment {idx + 1}</p>
                            <p className="font-normal text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[150px]">{url}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">View →</span>
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 text-center py-4 dark:text-zinc-400">No documents attached.</p>
                  )}
                </div>
              </div>

              {/* Audit Timeline */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 mb-5 flex items-center gap-2">
                  <AppIcon name="clock" className="h-4 w-4 text-zinc-500" />
                  Audit Log Timeline
                </h3>
                <div className="relative border-l border-zinc-100 pl-4 space-y-6 dark:border-zinc-700/50">
                  {/* Event 1 */}
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-800">
                      <AppIcon name="check" className="h-2 w-2 text-white" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-zinc-950 dark:text-white">Record Submitted</p>
                      <p className="text-[10px] text-zinc-600 dark:text-zinc-400">By registrar {record.registrarEmail || "officer"}</p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{formatDateTime(record.createdAt)}</p>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div className="relative">
                    <span className={`absolute -left-[21px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-800 ${
                      isVerified 
                        ? "bg-emerald-500" 
                        : record.status === "REJECTED"
                          ? "bg-rose-500"
                          : "bg-blue-500"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-zinc-950 dark:text-white">
                        {isVerified 
                          ? "Verification Completed" 
                          : record.status === "REJECTED"
                            ? "Record Rejected"
                            : "Pending Officer Verification"
                        }
                      </p>
                      {record.verifiedByName && (
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400">By reviewer {record.verifiedByName}</p>
                      )}
                      {record.rejectionReason && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Reason: {record.rejectionReason}</p>
                      )}
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {formatDateTime(record.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Event 3: Certificate status */}
                  {(record.status === "CERTIFICATE_ISSUED" || hasCertificate) && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white dark:ring-zinc-800">
                        <AppIcon name="certificate" className="h-2.5 w-2.5 text-white" />
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-zinc-950 dark:text-white">Certificate Generated</p>
                        {record.certificateId && (
                          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">ID: {record.certificateId}</p>
                        )}
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{formatDateTime(record.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function DocField({
  label,
  value,
  highlight,
  wide,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
  wide?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={`space-y-1 ${wide ? "md:col-span-2" : ""}`}>
      <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <span
        className={`block border-b border-dashed border-zinc-200 dark:border-zinc-850 pb-1 text-sm font-medium ${
          highlight 
            ? "text-zinc-900 font-semibold dark:text-white" 
            : "text-zinc-800 dark:text-zinc-300"
        } ${mono ? "font-mono text-xs" : ""}`}
      >
        {value?.trim?.() ? value : "—"}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  if (normalized === "PENDING_VERIFICATION") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Pending Review
      </span>
    );
  }

  if (normalized === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Verified
      </span>
    );
  }

  if (normalized === "CERTIFICATE_ISSUED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Cert Issued
      </span>
    );
  }

  if (normalized === "NOTIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-400">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
        Notified Inst.
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      Rejected
    </span>
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

