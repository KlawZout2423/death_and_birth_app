"use client";

import { useEffect, useState, useRef } from "react";

interface CertPreviewData {
  deceasedName: string;
  gender?: string | null;
  dateOfBirth: string;
  dateOfDeath: string;
  timeOfDeath?: string | null;
  ageAtDeath?: number | null;
  placeOfDeath: string;
  causeOfDeath?: string | null;
  informantName?: string | null;
  informantRelation?: string | null;
  contactNumber?: string | null;
  certificateNumber: string;
  issuedAt?: string | null;
  status: string;
}

interface Props {
  deathRecordId: string;
  certificateNumber?: string | null;
  deceasedName: string;
  onClose: () => void;
}

export default function CertificatePreviewModal({
  deathRecordId,
  certificateNumber,
  deceasedName,
  onClose,
}: Props) {
  const [data, setData] = useState<CertPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/records/${deathRecordId}`);
        if (!res.ok) throw new Error("Failed to fetch record details");
        const json = await res.json();
        const r = json.record;
        setData({
          deceasedName: r.deceasedName ?? r.fullName ?? deceasedName,
          gender: r.gender,
          dateOfBirth: r.dateOfBirth,
          dateOfDeath: r.dateOfDeath,
          timeOfDeath: r.timeOfDeath,
          ageAtDeath: r.ageAtDeath,
          placeOfDeath: r.placeOfDeath,
          causeOfDeath: r.causeOfDeath,
          informantName: r.informantName,
          informantRelation: r.informantRelation,
          contactNumber: r.contactNumber,
          certificateNumber:
            r.certificateId ?? certificateNumber ?? `DR-${String(r.id).slice(-6).toUpperCase()}`,
          issuedAt: r.approvedAt ?? r.updatedAt ?? null,
          status: r.status,
        });
      } catch (e: any) {
        setError(e.message ?? "Unable to load certificate");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [deathRecordId, certificateNumber, deceasedName]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const fmt = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .cpv-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: cpv-fadeIn 0.2s ease;
        }
        @keyframes cpv-fadeIn { from { opacity:0 } to { opacity:1 } }

        .cpv-wrapper {
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 4px;
          animation: cpv-slideUp 0.25s ease;
          scrollbar-width: thin;
          scrollbar-color: #c9a227 #f0f4f8;
        }
        @keyframes cpv-slideUp { from { transform: translateY(24px); opacity:0 } to { transform: translateY(0); opacity:1 } }

        /* ── Top action bar ── */
        .cpv-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1a202c;
          padding: 0.6rem 1rem;
          border-radius: 4px 4px 0 0;
        }
        .cpv-topbar-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a0aec0;
        }
        .cpv-topbar-actions { display: flex; gap: 0.5rem; }
        .cpv-btn {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          padding: 0.35rem 0.85rem;
          transition: opacity 0.15s;
        }
        .cpv-btn:hover { opacity: 0.8; }
        .cpv-btn-print { background: #1a3a6b; color: #fff; }
        .cpv-btn-close { background: #4a5568; color: #fff; }

        /* ── Certificate shell ── */
        .cpv-outer {
          background: linear-gradient(145deg, #b8972d 0%, #e8c84a 30%, #c9a227 60%, #f0d060 80%, #b8972d 100%);
          padding: 8px;
        }
        .cpv-inner {
          border: 2px solid rgba(180,140,30,0.5);
          padding: 5px;
          background: #fff;
        }
        .cpv-body {
          background: #fff;
          position: relative;
          overflow: hidden;
        }

        /* Watermark */
        .cpv-watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 0;
        }
        .cpv-watermark span {
          font-family: 'Cinzel', serif;
          font-size: 5.5rem;
          font-weight: 700;
          color: rgba(26,58,107,0.04);
          letter-spacing: 0.12em;
          transform: rotate(-30deg);
          user-select: none;
          white-space: nowrap;
        }

        /* Corner ornaments */
        .cpv-corner {
          position: absolute;
          width: 32px;
          height: 32px;
          z-index: 2;
        }

        /* ── Header ── */
        .cpv-header {
          background: linear-gradient(135deg, #0d2654 0%, #1a3a6b 50%, #0d2654 100%);
          padding: 1.5rem 2rem 1.25rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .cpv-header-line {
          height: 2px;
          background: linear-gradient(90deg, transparent, #e8c84a, transparent);
          margin-bottom: 1rem;
        }
        .cpv-header-bottom-line {
          height: 2px;
          background: linear-gradient(90deg, transparent, #e8c84a, transparent);
          margin-top: 1rem;
        }
        .cpv-country {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          color: #e8c84a;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .cpv-ministry {
          font-family: 'EB Garamond', serif;
          font-size: 0.8rem;
          color: #a8c4e8;
          letter-spacing: 0.04em;
          margin-bottom: 0.6rem;
        }
        .cpv-seal-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 0.6rem;
        }
        .cpv-divider { flex:1; height:1px; background: linear-gradient(90deg,transparent,rgba(232,200,74,0.4),transparent); }
        .cpv-seal {
          width: 50px; height: 50px;
          border-radius: 50%;
          border: 2px solid #e8c84a;
          background: radial-gradient(circle, #1e4080 0%, #0d2654 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .cpv-title {
          font-family: 'Cinzel', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.04em;
        }
        .cpv-subtitle {
          font-family: 'EB Garamond', serif;
          font-size: 0.82rem;
          color: #a8c4e8;
          font-style: italic;
          letter-spacing: 0.06em;
          margin-top: 0.15rem;
        }

        /* ── Certificate ID banner ── */
        .cpv-id-banner {
          background: linear-gradient(90deg, #f7f9fc 0%, #eef2f8 50%, #f7f9fc 100%);
          border-top: 1px solid #d0d9e8;
          border-bottom: 1px solid #d0d9e8;
          padding: 0.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          position: relative;
          z-index: 1;
        }
        .cpv-id-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #64748b;
        }
        .cpv-id-value {
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a3a6b;
          letter-spacing: 0.1em;
        }
        .cpv-id-dot { width:4px; height:4px; border-radius:50%; background:#e8c84a; flex-shrink:0; }

        /* ── Preamble ── */
        .cpv-preamble {
          text-align: center;
          padding: 1rem 2rem 0.25rem;
          position: relative;
          z-index: 1;
        }
        .cpv-preamble p {
          font-family: 'EB Garamond', serif;
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.6;
        }
        .cpv-preamble strong {
          font-family: 'Cinzel', serif;
          font-size: 0.92rem;
          color: #0d2654;
        }

        /* ── Content ── */
        .cpv-content {
          padding: 1rem 2rem 0.75rem;
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 160px;
          gap: 1.5rem;
          align-items: start;
        }

        .cpv-section { margin-bottom: 1rem; }
        .cpv-section-title {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #1a3a6b;
          border-bottom: 1.5px solid #1a3a6b;
          padding-bottom: 0.3rem;
          margin-bottom: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .cpv-section-title::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 10px;
          background: #e8c84a;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .cpv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem 1.5rem; }
        .cpv-field { display: flex; flex-direction: column; gap: 0.05rem; }
        .cpv-field-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .cpv-field-value {
          font-family: 'EB Garamond', serif;
          font-size: 0.875rem;
          color: #1a202c;
          font-weight: 600;
          border-bottom: 1px dotted #cbd5e0;
          padding-bottom: 0.15rem;
          min-height: 1.2rem;
        }

        /* ── QR Panel ── */
        .cpv-qr-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          padding: 0.9rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: #f8fafd;
          text-align: center;
        }
        .cpv-qr-box {
          width: 90px; height: 90px;
          border: 2px solid #cbd5e0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .cpv-qr-box::before, .cpv-qr-box::after {
          content: '';
          position: absolute;
          width: 12px; height: 12px;
          border-color: #1a3a6b;
          border-style: solid;
        }
        .cpv-qr-box::before { top:-2px; left:-2px; border-width: 3px 0 0 3px; }
        .cpv-qr-box::after  { bottom:-2px; right:-2px; border-width: 0 3px 3px 0; }
        .cpv-qr-grid { display:grid; grid-template-columns: repeat(7,7px); grid-template-rows: repeat(7,7px); gap:1px; }
        .cpv-qr-grid span { display:block; background:#1a3a6b; border-radius:1px; }
        .cpv-qr-grid span.w { background:#fff; }
        .cpv-qr-label { font-family:'Inter',sans-serif; font-size:0.55rem; color:#94a3b8; letter-spacing:0.08em; text-transform:uppercase; }
        .cpv-qr-id { font-family:'Cinzel',serif; font-size:0.58rem; color:#1a3a6b; font-weight:600; letter-spacing:0.08em; word-break:break-all; }

        /* ── Signatures ── */
        .cpv-signatures {
          padding: 0 2rem 1rem;
          position: relative;
          z-index: 1;
        }
        .cpv-sig-divider { height:1px; background:linear-gradient(90deg,transparent,#cbd5e0,transparent); margin-bottom:1rem; }
        .cpv-sig-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; text-align:center; }
        .cpv-sig-line { width:100%; height:1px; background:#1a3a6b; margin-bottom:0.3rem; }
        .cpv-sig-name { font-family:'Cinzel',serif; font-size:0.58rem; font-weight:700; color:#1a3a6b; letter-spacing:0.08em; text-transform:uppercase; }
        .cpv-sig-role { font-family:'EB Garamond',serif; font-size:0.72rem; color:#64748b; font-style:italic; margin-top:0.05rem; }

        /* ── Footer ── */
        .cpv-footer {
          background: linear-gradient(135deg, #0d2654 0%, #1a3a6b 100%);
          padding: 0.6rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        .cpv-footer-topline { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#e8c84a,transparent); }
        .cpv-footer-label { font-family:'Inter',sans-serif; font-size:0.5rem; letter-spacing:0.12em; text-transform:uppercase; color:#7a9cc0; margin-bottom:0.1rem; }
        .cpv-footer-val { font-family:'EB Garamond',serif; font-size:0.78rem; color:#e2eaf4; }
        .cpv-footer-badge {
          display:inline-flex; align-items:center; gap:0.25rem;
          background:rgba(46,160,80,0.2);
          border:1px solid rgba(46,160,80,0.4);
          border-radius:20px;
          padding:0.15rem 0.6rem;
          font-family:'Inter',sans-serif;
          font-size:0.62rem;
          font-weight:600;
          color:#6ee7a0;
          letter-spacing:0.04em;
        }
        .cpv-footer-badge::before { content:''; width:5px; height:5px; border-radius:50%; background:#6ee7a0; flex-shrink:0; }

        /* Watermark banner for institutions */
        .cpv-institution-banner {
          background: rgba(234,179,8,0.08);
          border-top: 1px dashed rgba(180,140,30,0.4);
          border-bottom: 1px dashed rgba(180,140,30,0.4);
          padding: 0.4rem 2rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .cpv-institution-banner p {
          font-family: 'Cinzel', serif;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #92400e;
          text-transform: uppercase;
        }

        @media (max-width: 540px) {
          .cpv-content { grid-template-columns: 1fr; }
          .cpv-grid { grid-template-columns: 1fr; }
          .cpv-sig-row { grid-template-columns: 1fr; gap:0.6rem; }
          .cpv-footer { flex-direction:column; gap:0.5rem; text-align:center; }
        }
      `}</style>

      <div className="cpv-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="cpv-wrapper">
          {/* Top bar */}
          <div className="cpv-topbar">
            <span className="cpv-topbar-title">📄 Certificate Preview — Read Only</span>
            <div className="cpv-topbar-actions">
              <button className="cpv-btn cpv-btn-print" onClick={() => window.print()}>
                🖨 Print
              </button>
              <button className="cpv-btn cpv-btn-close" onClick={onClose}>
                ✕ Close
              </button>
            </div>
          </div>

          {/* Certificate */}
          <div className="cpv-outer">
            <div className="cpv-inner">
              <div className="cpv-body">

                {/* Watermark */}
                <div className="cpv-watermark"><span>OFFICIAL</span></div>

                {/* Corner ornaments */}
                <CpvCorner pos="tl" />
                <CpvCorner pos="tr" />
                <CpvCorner pos="bl" />
                <CpvCorner pos="br" />

                {/* Institution read-only notice */}
                <div className="cpv-institution-banner">
                  <p>For institutional reference only — Births &amp; Deaths Registry, Ghana</p>
                </div>

                {/* Header */}
                <div className="cpv-header">
                  <div className="cpv-header-line" />
                  <p className="cpv-country">Republic of Ghana</p>
                  <p className="cpv-ministry">Ministry of Local Government &amp; Rural Development</p>
                  <div className="cpv-seal-row">
                    <div className="cpv-divider" />
                    <div className="cpv-seal">🕊️</div>
                    <div className="cpv-divider" />
                  </div>
                  <h2 className="cpv-title">Certificate of Death</h2>
                  <p className="cpv-subtitle">
                    Issued under the Births and Deaths (Registration) Act, 1965 (Act 301)
                  </p>
                  <div className="cpv-header-bottom-line" />
                </div>

                {/* Loading / Error states */}
                {loading && (
                  <div style={{ padding: "3rem", textAlign: "center" }}>
                    <div style={{
                      margin: "0 auto 1rem",
                      width: 36, height: 36,
                      border: "3px solid #e2e8f0",
                      borderTopColor: "#1a3a6b",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }} />
                    <p style={{ fontFamily: "'EB Garamond', serif", color: "#64748b" }}>
                      Loading certificate…
                    </p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {error && (
                  <div style={{ padding: "2rem", textAlign: "center" }}>
                    <p style={{ fontFamily: "'EB Garamond', serif", color: "#dc2626", fontSize: "0.95rem" }}>
                      ⚠ {error}
                    </p>
                  </div>
                )}

                {data && !loading && (
                  <>
                    {/* ID Banner */}
                    <div className="cpv-id-banner">
                      <span className="cpv-id-label">Certificate No.</span>
                      <div className="cpv-id-dot" />
                      <span className="cpv-id-value">{data.certificateNumber}</span>
                      <div className="cpv-id-dot" />
                      <span className="cpv-id-label">Official Document</span>
                    </div>

                    {/* Preamble */}
                    <div className="cpv-preamble">
                      <p>
                        This is to certify that the death of{" "}
                        <strong>{data.deceasedName}</strong>{" "}
                        has been duly registered in the Births and Deaths Registry in accordance with the laws of Ghana.
                      </p>
                    </div>

                    {/* Main Content */}
                    <div className="cpv-content">
                      <div>
                        {/* Deceased particulars */}
                        <div className="cpv-section">
                          <div className="cpv-section-title">Deceased&apos;s Particulars</div>
                          <div className="cpv-grid">
                            <CpvField label="Full Name" value={data.deceasedName} />
                            <CpvField label="Gender" value={data.gender ?? undefined} />
                            <CpvField label="Date of Birth" value={fmt(data.dateOfBirth)} />
                            <CpvField label="Date of Death" value={fmt(data.dateOfDeath)} />
                            <CpvField label="Time of Death" value={data.timeOfDeath ?? undefined} />
                            <CpvField
                              label="Age at Death"
                              value={data.ageAtDeath != null ? `${data.ageAtDeath} years` : undefined}
                            />
                            <CpvField label="Place of Death" value={data.placeOfDeath} />
                            <CpvField label="Cause of Death" value={data.causeOfDeath ?? undefined} />
                          </div>
                        </div>

                        {/* Informant */}
                        <div className="cpv-section">
                          <div className="cpv-section-title">Informant Details</div>
                          <div className="cpv-grid">
                            <CpvField label="Informant Name" value={data.informantName ?? undefined} />
                            <CpvField label="Relationship" value={data.informantRelation ?? undefined} />
                            <CpvField label="Contact" value={data.contactNumber ?? undefined} />
                          </div>
                        </div>
                      </div>

                      {/* QR Panel */}
                      <div className="cpv-qr-panel">
                        <div className="cpv-qr-box">
                          <QRPattern />
                        </div>
                        <p className="cpv-qr-label">Scan to Verify</p>
                        <p className="cpv-qr-id">{data.certificateNumber}</p>
                        <div style={{ marginTop: "0.4rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem", width: "100%" }}>
                          <p className="cpv-qr-label" style={{ marginBottom: "0.2rem" }}>Date Issued</p>
                          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "0.78rem", color: "#1a202c", fontWeight: 600 }}>
                            {fmt(data.issuedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="cpv-signatures">
                      <div className="cpv-sig-divider" />
                      <div className="cpv-sig-row">
                        <div>
                          <div className="cpv-sig-line" />
                          <p className="cpv-sig-name">Registrar-General</p>
                          <p className="cpv-sig-role">Registrar-General&apos;s Department</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: "50%",
                            border: "2px solid #1a3a6b",
                            background: "linear-gradient(135deg,#eef2f8,#dce6f4)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.2rem", marginBottom: "0.3rem"
                          }}>⚖️</div>
                          <p className="cpv-sig-name" style={{ fontSize: "0.55rem" }}>Official Seal</p>
                          <p className="cpv-sig-role">Births &amp; Deaths Registry</p>
                        </div>
                        <div>
                          <div className="cpv-sig-line" />
                          <p className="cpv-sig-name">District Registrar</p>
                          <p className="cpv-sig-role">Local Registration Authority</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="cpv-footer">
                      <div className="cpv-footer-topline" />
                      <div>
                        <p className="cpv-footer-label">Registration Authority</p>
                        <p className="cpv-footer-val">Births &amp; Deaths Registry, Ghana</p>
                      </div>
                      <div>
                        <span className="cpv-footer-badge">
                          {data.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <div>
                        <p className="cpv-footer-label">Document Reference</p>
                        <p className="cpv-footer-val">{data.certificateNumber}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ── */
function CpvCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const transforms: Record<string, string> = { tl: "", tr: "scaleX(-1)", bl: "scaleY(-1)", br: "scale(-1)" };
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };
  return (
    <div style={{ position: "absolute", width: 32, height: 32, zIndex: 2, transform: transforms[pos], ...positions[pos] }}>
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M2 2 L14 2 L2 14 Z" fill="#c9a227" opacity="0.8" />
        <path d="M2 2 L8 2 L2 8 Z" fill="#e8c84a" opacity="0.6" />
        <line x1="2" y1="2" x2="30" y2="2" stroke="#c9a227" strokeWidth="1.5" />
        <line x1="2" y1="2" x2="2" y2="30" stroke="#c9a227" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function CpvField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="cpv-field">
      <span className="cpv-field-label">{label}</span>
      <span className="cpv-field-value">{value || "—"}</span>
    </div>
  );
}

function QRPattern() {
  const pattern = [
    [1,1,1,0,1,1,1],[1,0,1,0,1,0,1],[1,1,1,0,1,1,1],
    [0,0,0,0,0,0,0],[1,1,1,0,1,1,1],[1,0,1,0,0,1,0],[1,1,1,0,1,0,1],
  ];
  return (
    <div className="cpv-qr-grid">
      {pattern.flat().map((cell, i) => <span key={i} className={cell ? "" : "w"} />)}
    </div>
  );
}
