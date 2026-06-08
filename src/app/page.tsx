import { getSession } from "../lib/session";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }

        /* ── NAV ── */
        .lp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 64px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }
        .lp-nav-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
        }
        .lp-nav-logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #0d2654 0%, #1a56db 100%);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.05em;
        }
        .lp-nav-name {
          font-family: 'Sora', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: #0d2654;
          letter-spacing: -0.02em;
        }
        .lp-nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #0d2654;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.5rem 1.1rem;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .lp-nav-cta:hover { background: #1a3a6b; }

        /* ── HERO ── */
        .lp-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 80px 2rem 4rem;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(26,86,219,0.07) 0%, transparent 70%),
            #f8fafc;
          position: relative;
          overflow: hidden;
        }
        .lp-hero::before {
          content: '';
          position: absolute;
          top: 120px; right: -80px;
          width: 480px; height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(26,86,219,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .lp-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: -60px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(13,38,84,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .lp-hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .lp-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(26,86,219,0.08);
          border: 1px solid rgba(26,86,219,0.15);
          color: #1a56db;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.35rem 0.8rem;
          border-radius: 20px;
          margin-bottom: 1.5rem;
        }
        .lp-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #1a56db;
          animation: lp-pulse 2s ease infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .lp-hero-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: #0d2654;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
        }
        .lp-hero-title span {
          background: linear-gradient(135deg, #1a56db, #0d2654);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-hero-desc {
          font-size: 1rem;
          line-height: 1.75;
          color: #475569;
          max-width: 480px;
          margin-bottom: 2rem;
        }

        .lp-hero-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #0d2654 0%, #1a56db 100%);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.75rem 1.75rem;
          border-radius: 10px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 14px rgba(26,86,219,0.25);
        }
        .lp-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .lp-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fff;
          color: #0d2654;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.75rem 1.75rem;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid #e2e8f0;
          transition: background 0.2s, transform 0.2s;
        }
        .lp-btn-secondary:hover { background: #f1f5f9; transform: translateY(-1px); }

        /* Trusted logos row */
        .lp-trust {
          margin-top: 3rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .lp-trust-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .lp-trust-chips {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .lp-trust-chip {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.3rem 0.65rem;
          font-size: 0.72rem;
          font-weight: 600;
          color: #475569;
        }

        /* ── HERO VISUAL (right side) ── */
        .lp-hero-visual {
          position: relative;
        }
        .lp-card-stack {
          position: relative;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        /* Floating stat cards */
        .lp-stat-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem 1.25rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: absolute;
          min-width: 180px;
          animation: lp-float 4s ease-in-out infinite;
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .lp-stat-card:nth-child(2) { animation-delay: 1.3s; }
        .lp-stat-card:nth-child(3) { animation-delay: 2.6s; }

        .lp-stat-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .lp-stat-label { font-size: 0.7rem; color: #94a3b8; font-weight: 500; }
        .lp-stat-value { font-size: 1.05rem; font-weight: 700; color: #0d2654; font-family: 'Sora', sans-serif; }

        .lp-main-card {
          background: linear-gradient(145deg, #0d2654, #1a3a6b);
          border-radius: 20px;
          padding: 2rem;
          color: #fff;
          box-shadow: 0 20px 60px rgba(13,38,84,0.3);
          position: relative;
          overflow: hidden;
          margin: 2rem 0;
        }
        .lp-main-card::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }
        .lp-main-card-label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.5rem;
        }
        .lp-main-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }
        .lp-main-card-steps {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .lp-step {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
        }
        .lp-step-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .lp-step-text { font-size: 0.8rem; color: rgba(255,255,255,0.85); }

        /* ── FEATURES ── */
        .lp-features {
          padding: 5rem 2rem;
          background: #fff;
        }
        .lp-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #1a56db;
          text-align: center;
          margin-bottom: 0.6rem;
        }
        .lp-section-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          color: #0d2654;
          text-align: center;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .lp-section-desc {
          text-align: center;
          color: #64748b;
          font-size: 0.95rem;
          max-width: 520px;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }

        .lp-features-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .lp-feature-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.75rem;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .lp-feature-card:hover {
          border-color: #1a56db;
          box-shadow: 0 8px 30px rgba(26,86,219,0.1);
          transform: translateY(-2px);
        }
        .lp-feature-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        .lp-feature-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0d2654;
          margin-bottom: 0.5rem;
        }
        .lp-feature-desc { font-size: 0.85rem; color: #64748b; line-height: 1.65; }

        /* ── STATS BANNER ── */
        .lp-stats {
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #0d2654 0%, #1a3a6b 100%);
        }
        .lp-stats-inner {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          text-align: center;
        }
        .lp-stat-big { }
        .lp-stat-big-num {
          font-family: 'Sora', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.3rem;
        }
        .lp-stat-big-label { font-size: 0.85rem; color: rgba(255,255,255,0.55); }
        .lp-stats-divider {
          width: 1px;
          background: rgba(255,255,255,0.1);
          margin: 0 auto;
        }

        /* ── FOOTER ── */
        .lp-footer {
          padding: 2rem;
          background: #fff;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }
        .lp-footer p { font-size: 0.8rem; color: #94a3b8; }

        /* ── RESPONSIVE ── */

        /* Mobile: up to 479px */
        @media (max-width: 479px) {
          .lp-nav { padding: 0 1rem; height: 56px; }
          .lp-nav-name { display: none; }
          .lp-nav-cta { font-size: 0.75rem; padding: 0.4rem 0.85rem; }

          .lp-hero { padding: 72px 1.25rem 3rem; min-height: auto; }
          .lp-hero-inner { grid-template-columns: 1fr; gap: 0; }
          .lp-hero-visual { display: none; }
          .lp-hero-title { font-size: 1.75rem; }
          .lp-hero-desc { font-size: 0.9rem; margin-bottom: 1.5rem; }
          .lp-btn-primary, .lp-btn-secondary { width: 100%; justify-content: center; font-size: 0.875rem; }
          .lp-hero-actions { flex-direction: column; }
          .lp-trust { flex-direction: column; align-items: flex-start; gap: 0.5rem; }

          .lp-features { padding: 3rem 1.25rem; }
          .lp-features-grid { grid-template-columns: 1fr; gap: 1rem; }
          .lp-feature-card { padding: 1.25rem; }

          .lp-stats { padding: 2.5rem 1.25rem; }
          .lp-stats-inner { grid-template-columns: 1fr; gap: 1.5rem; }
          .lp-stat-big-num { font-size: 2rem; }

          .lp-footer { padding: 1.5rem 1.25rem; }
        }

        /* Small tablet: 480px – 767px */
        @media (min-width: 480px) and (max-width: 767px) {
          .lp-nav { padding: 0 1.5rem; }
          .lp-hero { padding: 80px 1.5rem 3.5rem; min-height: auto; }
          .lp-hero-inner { grid-template-columns: 1fr; gap: 2rem; }
          .lp-hero-visual { display: none; }
          .lp-hero-title { font-size: 2.2rem; }

          .lp-features { padding: 4rem 1.5rem; }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }

          .lp-stats-inner { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
          .lp-stat-big-num { font-size: 1.8rem; }
        }

        /* Tablet: 768px – 1023px */
        @media (min-width: 768px) and (max-width: 1023px) {
          .lp-hero { padding: 80px 2rem 4rem; }
          .lp-hero-inner { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .lp-hero-visual { display: block; }
          .lp-stat-card { min-width: 150px; padding: 0.75rem 1rem; }
          .lp-stat-card .lp-stat-value { font-size: 0.95rem; }
          .lp-main-card { padding: 1.5rem; }
          .lp-main-card-title { font-size: 1.1rem; }

          .lp-features { padding: 4rem 2rem; }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }

          .lp-stats-inner { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        }

        /* Desktop: 1024px+ — default styles apply, no override needed */
      `}</style>

      <div className="lp-root">

        {/* NAV */}
        <nav className="lp-nav">
          <a href="/" className="lp-nav-brand">
            <div className="lp-nav-logo">BDRS</div>
            <span className="lp-nav-name">Vital Registry</span>
          </a>
          {session ? (
            <a href="/dashboard" className="lp-nav-cta">
              Go to Dashboard →
            </a>
          ) : (
            <a href="/login" className="lp-nav-cta">
              Sign In →
            </a>
          )}
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-hero-inner">
            {/* Left: copy */}
            <div>
              <div className="lp-badge">
                <span className="lp-badge-dot" />
                Official Government System
              </div>
              <h1 className="lp-hero-title">
                Ghana&apos;s Digital<br />
                <span>Birth &amp; Death</span><br />
                Registry
              </h1>
              <p className="lp-hero-desc">
                A secure, government-grade platform for managing vital records. Streamline registrations, approvals, and certificate issuance — all in one place.
              </p>
              <div className="lp-hero-actions">
                {session ? (
                  <>
                    <a href="/dashboard" className="lp-btn-primary">
                      Access Dashboard →
                    </a>
                    <form action="/api/logout" method="post" style={{ display: "inline" }}>
                      <button
                        type="submit"
                        className="lp-btn-secondary"
                        style={{ cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", font: "inherit" }}
                      >
                        Sign Out
                      </button>
                    </form>
                  </>
                ) : (
                  <a href="/login" className="lp-btn-primary">
                    Sign In to System →
                  </a>
                )}
              </div>

              <div className="lp-trust">
                <span className="lp-trust-label">Serving</span>
                <div className="lp-trust-chips">
                  <span className="lp-trust-chip">Registry Officers</span>
                  <span className="lp-trust-chip">Banks</span>
                  <span className="lp-trust-chip">Insurance</span>
                  <span className="lp-trust-chip">SSNIT</span>
                </div>
              </div>
            </div>

            {/* Right: visual */}
            <div className="lp-hero-visual">
              <div className="lp-card-stack">
                {/* Floating stat cards */}
                <div className="lp-stat-card" style={{ top: 0, right: "-10px", animationDelay: "0s" }}>
                  <div className="lp-stat-icon" style={{ background: "rgba(26,86,219,0.08)" }}>📋</div>
                  <div>
                    <div className="lp-stat-label">Records Today</div>
                    <div className="lp-stat-value">124</div>
                  </div>
                </div>

                {/* Main card */}
                <div className="lp-main-card">
                  <div className="lp-main-card-label">Registration Workflow</div>
                  <div className="lp-main-card-title">Seamless end-to-end process</div>
                  <div className="lp-main-card-steps">
                    <div className="lp-step">
                      <div className="lp-step-num">1</div>
                      <span className="lp-step-text">Registrar submits birth or death record</span>
                    </div>
                    <div className="lp-step">
                      <div className="lp-step-num">2</div>
                      <span className="lp-step-text">Administrator reviews &amp; verifies</span>
                    </div>
                    <div className="lp-step">
                      <div className="lp-step-num">3</div>
                      <span className="lp-step-text">Official certificate is issued</span>
                    </div>
                    <div className="lp-step">
                      <div className="lp-step-num">4</div>
                      <span className="lp-step-text">Institutions are notified automatically</span>
                    </div>
                  </div>
                </div>

                {/* Second floating card */}
                <div className="lp-stat-card" style={{ bottom: "20px", left: "-10px", animationDelay: "2s" }}>
                  <div className="lp-stat-icon" style={{ background: "rgba(16,185,129,0.1)" }}>✅</div>
                  <div>
                    <div className="lp-stat-label">Approved</div>
                    <div className="lp-stat-value">10,000+</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="lp-features">
          <div className="lp-section-label">Platform features</div>
          <h2 className="lp-section-title">Everything in one system</h2>
          <p className="lp-section-desc">
            Designed for Ghana&apos;s Births &amp; Deaths Registry — secure workflows, official certificates, and institutional integration.
          </p>
          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: "rgba(26,86,219,0.08)" }}>🔐</div>
              <div className="lp-feature-title">Role-Based Access</div>
              <p className="lp-feature-desc">Registrars, administrators, and institutional officers each have tailored, secure access to only what they need.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: "rgba(16,185,129,0.1)" }}>⚡</div>
              <div className="lp-feature-title">Efficient Workflow</div>
              <p className="lp-feature-desc">Submit, review, and approve records through a guided multi-step process — reducing paperwork and eliminating errors.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: "rgba(245,158,11,0.1)" }}>📜</div>
              <div className="lp-feature-title">Official Certificates</div>
              <p className="lp-feature-desc">Generate government-grade birth and death certificates instantly upon approval, with a verifiable certificate number.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: "rgba(139,92,246,0.1)" }}>🏛️</div>
              <div className="lp-feature-title">Institutional Notifications</div>
              <p className="lp-feature-desc">Banks, insurance companies, and SSNIT receive automatic notifications for death records relevant to their operations.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: "rgba(239,68,68,0.08)" }}>📊</div>
              <div className="lp-feature-title">Analytics &amp; Reports</div>
              <p className="lp-feature-desc">Track registration trends, pending records, and generate reports across regions and time periods.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: "rgba(6,182,212,0.1)" }}>🛡️</div>
              <div className="lp-feature-title">Secure &amp; Compliant</div>
              <p className="lp-feature-desc">Session-based authentication, encrypted data handling, and compliance with data protection standards for vital records.</p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="lp-stats">
          <div className="lp-stats-inner">
            <div className="lp-stat-big">
              <div className="lp-stat-big-num">10K+</div>
              <div className="lp-stat-big-label">Records Processed</div>
            </div>
            <div className="lp-stat-big">
              <div className="lp-stat-big-num">99.9%</div>
              <div className="lp-stat-big-label">System Uptime</div>
            </div>
            <div className="lp-stat-big">
              <div className="lp-stat-big-num">24 / 7</div>
              <div className="lp-stat-big-label">Secure Access</div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <p>© 2026 Birth &amp; Death Registration System — Ministry of Local Government &amp; Rural Development, Ghana</p>
        </footer>

      </div>
    </>
  );
}
