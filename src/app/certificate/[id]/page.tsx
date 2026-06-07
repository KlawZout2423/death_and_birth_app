"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DeathRecord, Record as VitalRecord } from "@/lib/recordStore";

export default function CertificateView() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const [record, setRecord] = useState<VitalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch(`/api/records/${recordId}`);
        if (res.ok) {
          const data = await res.json();
          setRecord(data.record as VitalRecord | null);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch record", err);
      } finally {
        setLoading(false);
      }
    };

    if (recordId) fetchRecord();
  }, [recordId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#f0f4f8" }}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700"></div>
          <p style={{ color: "#4a5568", fontFamily: "Georgia, serif" }}>Loading certificate…</p>
        </div>
      </div>
    );
  }

  if (
    !record ||
    (record.status !== "VERIFIED" &&
      record.status !== "NOTIFIED" &&
      record.status !== "CERTIFICATE_ISSUED")
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#f0f4f8" }}>
        <div className="max-w-md text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="mb-2 text-2xl font-bold" style={{ color: "#1a202c", fontFamily: "Georgia, serif" }}>
            Certificate Not Available
          </h2>
          <p className="mb-6" style={{ color: "#4a5568" }}>
            This record has not yet been issued a certificate. Please check back once the record has been verified and approved.
          </p>
          <button
            onClick={() => router.back()}
            className="rounded-lg px-6 py-2 text-white font-semibold transition-colors"
            style={{ background: "#1a3a6b" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isBirth = record.type === "birth";
  const prefix = isBirth ? "BR" : "DR";
  const certificateId =
    record.certificateId || `${prefix}-${String(record.id).slice(-6).toUpperCase()}`;
  const issuedDate = new Date(record.approvedAt || record.updatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

        .cert-page {
          min-height: 100vh;
          background: #d6dde8;
          padding: 2rem 1rem;
          font-family: 'Inter', sans-serif;
        }

        .cert-actions {
          max-width: 860px;
          margin: 0 auto 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cert-actions button {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          padding: 0.5rem 1.25rem;
          transition: opacity 0.2s;
        }
        .cert-actions button:hover { opacity: 0.85; }
        .btn-back { background: #fff; color: #1a202c; border: 1px solid #cbd5e0 !important; }
        .btn-print { background: #1a3a6b; color: #fff; }

        /* ── Certificate Shell ── */
        .cert-shell {
          max-width: 860px;
          margin: 0 auto;
          position: relative;
        }

        /* Outer gold frame */
        .cert-outer-border {
          background: linear-gradient(145deg, #b8972d 0%, #e8c84a 30%, #c9a227 60%, #f0d060 80%, #b8972d 100%);
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Inner border line */
        .cert-inner-border {
          border: 2px solid rgba(180,140,30,0.6);
          padding: 6px;
          border-radius: 2px;
          background: #fff;
        }

        /* Main certificate body */
        .cert-body {
          background: #fff;
          position: relative;
          overflow: hidden;
        }

        /* Subtle texture overlay */
        .cert-body::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              rgba(26,58,107,0.015) 40px,
              rgba(26,58,107,0.015) 80px
            );
          pointer-events: none;
        }

        /* Watermark */
        .cert-watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 0;
        }
        .cert-watermark span {
          font-family: 'Cinzel', serif;
          font-size: 7rem;
          font-weight: 700;
          color: rgba(26, 58, 107, 0.04);
          letter-spacing: 0.1em;
          transform: rotate(-30deg);
          user-select: none;
          white-space: nowrap;
        }

        /* ── Header Band ── */
        .cert-header {
          background: linear-gradient(135deg, #0d2654 0%, #1a3a6b 50%, #0d2654 100%);
          padding: 2rem 2.5rem 1.5rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .cert-header-top-line {
          height: 3px;
          background: linear-gradient(90deg, transparent, #e8c84a, transparent);
          margin-bottom: 1.5rem;
        }
        .cert-country {
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.35em;
          color: #e8c84a;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }
        .cert-ministry {
          font-family: 'EB Garamond', serif;
          font-size: 1rem;
          color: #a8c4e8;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .cert-seal-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }
        .cert-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(232,200,74,0.5), transparent);
        }
        .cert-seal-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid #e8c84a;
          background: radial-gradient(circle, #1e4080 0%, #0d2654 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          flex-shrink: 0;
        }
        .cert-title {
          font-family: 'Cinzel', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }
        .cert-subtitle {
          font-family: 'EB Garamond', serif;
          font-size: 1rem;
          color: #a8c4e8;
          font-style: italic;
          letter-spacing: 0.08em;
        }
        .cert-header-bottom-line {
          height: 3px;
          background: linear-gradient(90deg, transparent, #e8c84a, transparent);
          margin-top: 1.5rem;
        }

        /* ── Certificate Number Banner ── */
        .cert-id-banner {
          background: linear-gradient(90deg, #f7f9fc 0%, #eef2f8 50%, #f7f9fc 100%);
          border-top: 1px solid #d0d9e8;
          border-bottom: 1px solid #d0d9e8;
          padding: 0.75rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          position: relative;
          z-index: 1;
        }
        .cert-id-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #64748b;
          text-transform: uppercase;
        }
        .cert-id-value {
          font-family: 'Cinzel', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a3a6b;
          letter-spacing: 0.12em;
        }
        .cert-id-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #e8c84a;
        }

        /* ── Opening Statement ── */
        .cert-preamble {
          text-align: center;
          padding: 1.5rem 3rem 0.5rem;
          position: relative;
          z-index: 1;
        }
        .cert-preamble p {
          font-family: 'EB Garamond', serif;
          font-size: 1rem;
          color: #374151;
          line-height: 1.7;
        }
        .cert-preamble strong {
          font-family: 'Cinzel', serif;
          font-size: 1.05rem;
          color: #0d2654;
        }

        /* ── Data Grid ── */
        .cert-content {
          padding: 1.5rem 2.5rem 1rem;
          position: relative;
          z-index: 1;
        }

        .cert-section {
          margin-bottom: 1.25rem;
        }

        .cert-section-title {
          font-family: 'Cinzel', serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #1a3a6b;
          padding-bottom: 0.4rem;
          border-bottom: 1.5px solid #1a3a6b;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cert-section-title::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 12px;
          background: #e8c84a;
          border-radius: 2px;
        }

        .cert-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem 2rem;
        }

        .cert-field {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .cert-field-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .cert-field-value {
          font-family: 'EB Garamond', serif;
          font-size: 0.975rem;
          color: #1a202c;
          font-weight: 600;
          border-bottom: 1px dotted #cbd5e0;
          padding-bottom: 0.2rem;
          min-height: 1.4rem;
        }

        /* ── Two-column layout ── */
        .cert-columns {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 2rem;
          align-items: start;
        }

        /* ── QR / Seal Panel ── */
        .cert-qr-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: #f8fafd;
          text-align: center;
        }
        .cert-qr-box {
          width: 110px;
          height: 110px;
          border: 2px solid #cbd5e0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        /* QR corner marks */
        .cert-qr-box::before,
        .cert-qr-box::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-color: #1a3a6b;
          border-style: solid;
        }
        .cert-qr-box::before { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
        .cert-qr-box::after  { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }
        .cert-qr-inner {
          display: grid;
          grid-template-columns: repeat(7,8px);
          grid-template-rows: repeat(7,8px);
          gap: 1px;
        }
        .cert-qr-inner span {
          display: block;
          background: #1a3a6b;
          border-radius: 1px;
        }
        .cert-qr-inner span.w { background: #fff; }
        .cert-qr-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.6rem;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cert-qr-id {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          color: #1a3a6b;
          font-weight: 600;
          letter-spacing: 0.1em;
          word-break: break-all;
        }

        /* ── Signature Section ── */
        .cert-signatures {
          padding: 0 2.5rem 1.5rem;
          position: relative;
          z-index: 1;
        }
        .cert-sig-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #cbd5e0, transparent);
          margin-bottom: 1.5rem;
        }
        .cert-sig-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.5rem;
          text-align: center;
        }
        .cert-sig-block {}
        .cert-sig-line {
          width: 100%;
          height: 1px;
          background: #1a3a6b;
          margin-bottom: 0.4rem;
        }
        .cert-sig-name {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          font-weight: 700;
          color: #1a3a6b;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .cert-sig-role {
          font-family: 'EB Garamond', serif;
          font-size: 0.8rem;
          color: #64748b;
          font-style: italic;
          margin-top: 0.1rem;
        }

        /* ── Footer ── */
        .cert-footer {
          background: linear-gradient(135deg, #0d2654 0%, #1a3a6b 100%);
          padding: 0.75rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        .cert-footer-line {
          height: 2px;
          background: linear-gradient(90deg, transparent, #e8c84a, transparent);
          margin-bottom: 0;
          position: absolute;
          top: 0; left: 0; right: 0;
        }
        .cert-footer-item {
          text-align: center;
        }
        .cert-footer-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #7a9cc0;
          margin-bottom: 0.15rem;
        }
        .cert-footer-value {
          font-family: 'EB Garamond', serif;
          font-size: 0.85rem;
          color: #e2eaf4;
        }
        .cert-footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(46,160,80,0.2);
          border: 1px solid rgba(46,160,80,0.4);
          border-radius: 20px;
          padding: 0.2rem 0.75rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          color: #6ee7a0;
          letter-spacing: 0.05em;
        }
        .cert-footer-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6ee7a0;
        }

        /* Corner ornaments */
        .cert-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          z-index: 2;
        }
        .cert-corner svg { width: 100%; height: 100%; }
        .cert-corner-tl { top: 0; left: 0; }
        .cert-corner-tr { top: 0; right: 0; transform: scaleX(-1); }
        .cert-corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
        .cert-corner-br { bottom: 0; right: 0; transform: scale(-1); }

        @media print {
          body { background: white !important; }
          .cert-page { background: white !important; padding: 0 !important; }
          .cert-actions { display: none !important; }
          .cert-outer-border { box-shadow: none !important; }
        }

        @media (max-width: 640px) {
          .cert-columns { grid-template-columns: 1fr; }
          .cert-fields-grid { grid-template-columns: 1fr; }
          .cert-sig-row { grid-template-columns: 1fr; gap: 1rem; }
          .cert-footer { flex-direction: column; gap: 0.75rem; text-align: center; }
          .cert-qr-panel { margin-top: 1rem; }
        }
      `}</style>

      <div className="cert-page">
        {/* Action Bar */}
        <div className="cert-actions print:hidden">
          <button className="btn-back" onClick={() => router.back()}>
            ← Back
          </button>
          <button className="btn-print" onClick={() => window.print()}>
            🖨 Print Certificate
          </button>
        </div>

        {/* Certificate Shell */}
        <div className="cert-shell">
          <div className="cert-outer-border">
            <div className="cert-inner-border">
              <div className="cert-body">

                {/* Watermark */}
                <div className="cert-watermark">
                  <span>OFFICIAL</span>
                </div>

                {/* Corner Ornaments */}
                <CornerOrnament position="tl" />
                <CornerOrnament position="tr" />
                <CornerOrnament position="bl" />
                <CornerOrnament position="br" />

                {/* ── Header ── */}
                <div className="cert-header">
                  <div className="cert-header-top-line" />
                  <p className="cert-country">Republic of Ghana</p>
                  <p className="cert-ministry">Ministry of Local Government &amp; Rural Development</p>
                  <div className="cert-seal-row">
                    <div className="cert-divider-line" />
                    <div className="cert-seal-circle">
                      {isBirth ? "🌟" : "🕊️"}
                    </div>
                    <div className="cert-divider-line" />
                  </div>
                  <h1 className="cert-title">
                    {isBirth ? "Certificate of Birth" : "Certificate of Death"}
                  </h1>
                  <p className="cert-subtitle">
                    {isBirth
                      ? "Issued under the Births and Deaths (Registration) Act, 1965 (Act 301)"
                      : "Issued under the Births and Deaths (Registration) Act, 1965 (Act 301)"}
                  </p>
                  <div className="cert-header-bottom-line" />
                </div>

                {/* Certificate ID Banner */}
                <div className="cert-id-banner">
                  <span className="cert-id-label">Certificate No.</span>
                  <div className="cert-id-dot" />
                  <span className="cert-id-value">{certificateId}</span>
                  <div className="cert-id-dot" />
                  <span className="cert-id-label">Official Document</span>
                </div>

                {/* Preamble */}
                <div className="cert-preamble">
                  <p>
                    {isBirth
                      ? <>This is to certify that the birth of{" "}
                          <strong>{(record as any).childName || "—"}</strong>{" "}
                          has been duly registered in the Births and Deaths Registry in accordance with the laws of Ghana.</>
                      : <>This is to certify that the death of{" "}
                          <strong>{(record as any).deceasedName || "—"}</strong>{" "}
                          has been duly registered in the Births and Deaths Registry in accordance with the laws of Ghana.</>
                    }
                  </p>
                </div>

                {/* Main Content */}
                <div className="cert-content">
                  <div className="cert-columns">

                    {/* Left: Data fields */}
                    <div>
                      {record.type === "birth" ? (
                        <>
                          <CertSection title="Child's Particulars">
                            <div className="cert-fields-grid">
                              <CertField label="Full Name" value={(record as any).childName} />
                              <CertField label="Gender" value={(record as any).gender || "—"} />
                              <CertField label="Date of Birth" value={new Date((record as any).dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} />
                              <CertField label="Time of Birth" value={(record as any).timeOfBirth || "Not recorded"} />
                              <CertField label="Place of Birth" value={(record as any).placeOfBirth} />
                            </div>
                          </CertSection>

                          <CertSection title="Parentage">
                            <div className="cert-fields-grid">
                              <CertField label="Mother's Name" value={(record as any).motherName} />
                              <CertField label="Father's Name" value={(record as any).fatherName} />
                            </div>
                          </CertSection>

                          <CertSection title="Registration Particulars">
                            <div className="cert-fields-grid">
                              <CertField label="Informant" value={(record as any).informantName || "—"} />
                              <CertField label="Contact" value={(record as any).contactNumber || "—"} />
                              <CertField label="Registration Centre" value={(record as any).registrationCenter || "—"} />
                            </div>
                          </CertSection>
                        </>
                      ) : (
                        <>
                          <CertSection title="Deceased's Particulars">
                            <div className="cert-fields-grid">
                              <CertField label="Full Name" value={(record as any).deceasedName} />
                              <CertField label="Gender" value={(record as any).gender || "—"} />
                              <CertField label="Date of Birth" value={new Date((record as any).dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} />
                              <CertField label="Date of Death" value={new Date((record as any).dateOfDeath).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} />
                              <CertField label="Time of Death" value={(record as any).timeOfDeath || "Not recorded"} />
                              <CertField label="Age at Death" value={(record as any).ageAtDeath ? `${(record as any).ageAtDeath} years` : "—"} />
                              <CertField label="Place of Death" value={(record as any).placeOfDeath} />
                              <CertField label="Cause of Death" value={(record as any).causeOfDeath} />
                            </div>
                          </CertSection>

                          <CertSection title="Informant Details">
                            <div className="cert-fields-grid">
                              <CertField label="Informant Name" value={(record as any).informantName} />
                              <CertField label="Relationship" value={(record as any).informantRelation || "—"} />
                              <CertField label="Contact" value={(record as any).contactNumber} />
                            </div>
                          </CertSection>
                        </>
                      )}
                    </div>

                    {/* Right: QR + Issued date */}
                    <div className="cert-qr-panel">
                      <div className="cert-qr-box">
                        <QRPattern />
                      </div>
                      <p className="cert-qr-label">Scan to Verify</p>
                      <p className="cert-qr-id">{certificateId}</p>
                      <div style={{ marginTop: "0.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem", width: "100%" }}>
                        <p className="cert-qr-label" style={{ marginBottom: "0.25rem" }}>Date Issued</p>
                        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "0.85rem", color: "#1a202c", fontWeight: 600 }}>
                          {issuedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="cert-signatures">
                  <div className="cert-sig-divider" />
                  <div className="cert-sig-row">
                    <div className="cert-sig-block">
                      <div className="cert-sig-line" />
                      <p className="cert-sig-name">Registrar-General</p>
                      <p className="cert-sig-role">Registrar-General's Department</p>
                    </div>
                    <div className="cert-sig-block">
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.4rem" }}>
                        <div style={{
                          width: 64, height: 64, borderRadius: "50%",
                          border: "2px solid #1a3a6b",
                          background: "linear-gradient(135deg, #eef2f8, #dce6f4)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "1.5rem"
                        }}>⚖️</div>
                      </div>
                      <p className="cert-sig-name" style={{ fontSize: "0.6rem" }}>Official Seal</p>
                      <p className="cert-sig-role">Births &amp; Deaths Registry</p>
                    </div>
                    <div className="cert-sig-block">
                      <div className="cert-sig-line" />
                      <p className="cert-sig-name">District Registrar</p>
                      <p className="cert-sig-role">Local Registration Authority</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="cert-footer">
                  <div className="cert-footer-line" />
                  <div className="cert-footer-item">
                    <p className="cert-footer-label">Registration Authority</p>
                    <p className="cert-footer-value">Births &amp; Deaths Registry, Ghana</p>
                  </div>
                  <div className="cert-footer-item">
                    <span className="cert-footer-badge">
                      {record.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="cert-footer-item">
                    <p className="cert-footer-label">Document Reference</p>
                    <p className="cert-footer-value">{certificateId}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ── */

function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const transforms: Record<string, string> = {
    tl: "",
    tr: "scaleX(-1)",
    bl: "scaleY(-1)",
    br: "scale(-1)",
  };
  const styles: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };

  return (
    <div
      style={{
        position: "absolute",
        width: 40,
        height: 40,
        zIndex: 2,
        transform: transforms[position],
        ...styles[position],
      }}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2 L16 2 L2 16 Z" fill="#c9a227" opacity="0.8" />
        <path d="M2 2 L10 2 L2 10 Z" fill="#e8c84a" opacity="0.6" />
        <line x1="2" y1="2" x2="36" y2="2" stroke="#c9a227" strokeWidth="2" />
        <line x1="2" y1="2" x2="2" y2="36" stroke="#c9a227" strokeWidth="2" />
      </svg>
    </div>
  );
}

function CertSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="cert-section">
      <div className="cert-section-title">{title}</div>
      {children}
    </div>
  );
}

function CertField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="cert-field">
      <span className="cert-field-label">{label}</span>
      <span className="cert-field-value">{value || "—"}</span>
    </div>
  );
}

function QRPattern() {
  // Decorative QR-style pattern (not functional, purely visual)
  const pattern = [
    [1,1,1,0,1,1,1],
    [1,0,1,0,1,0,1],
    [1,1,1,0,1,1,1],
    [0,0,0,0,0,0,0],
    [1,1,1,0,1,1,1],
    [1,0,1,0,0,1,0],
    [1,1,1,0,1,0,1],
  ];

  return (
    <div className="cert-qr-inner">
      {pattern.flat().map((cell, i) => (
        <span key={i} className={cell ? "" : "w"} />
      ))}
    </div>
  );
}
