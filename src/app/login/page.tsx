"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      if (redirect) {
        router.push(redirect);
      } else {
        try {
          const roleRes = await fetch("/api/user/role");
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            const dashboardPath = (roleData.dashboardPath as string | undefined) ?? "/dashboard";
            router.push(dashboardPath);
          } else {
            router.push("/dashboard");
          }
        } catch {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');

        * { box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Inter', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          background: linear-gradient(160deg, #0d2654 0%, #1a3a6b 60%, #1e4a8a 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
        }
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          position: relative;
          z-index: 1;
        }
        .login-brand-logo {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.05em;
        }
        .login-brand-name {
          font-family: 'Sora', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          letter-spacing: -0.01em;
        }

        .login-left-body {
          position: relative;
          z-index: 1;
        }
        .login-left-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 0.3rem 0.8rem;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 1.5rem;
        }
        .login-left-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #34d399;
          animation: lp-pulse 2s ease infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .login-left-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }
        .login-left-title span {
          color: rgba(255,255,255,0.45);
        }
        .login-left-desc {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 340px;
          margin-bottom: 2.5rem;
        }

        /* Feature list */
        .login-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .login-feature {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .login-feature-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        .login-feature-text {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
        }

        .login-left-footer {
          position: relative;
          z-index: 1;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.3);
        }

        /* ── RIGHT PANEL ── */
        .login-right {
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
          position: relative;
        }
        .login-right-inner {
          width: 100%;
          max-width: 380px;
          margin: 0 auto;
        }

        .login-right-header {
          margin-bottom: 2rem;
        }
        .login-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: color 0.15s;
        }
        .login-back:hover { color: #0d2654; }
        .login-greeting {
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #0d2654;
          letter-spacing: -0.03em;
          margin-bottom: 0.35rem;
        }
        .login-subline {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        /* Form */
        .login-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        .login-error {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          font-size: 0.82rem;
          color: #c53030;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .login-field {
          margin-bottom: 1.1rem;
        }
        .login-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.4rem;
          letter-spacing: 0.01em;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input {
          width: 100%;
          padding: 0.7rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          color: #0f172a;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .login-input::placeholder { color: #cbd5e1; }
        .login-input:focus {
          border-color: #1a56db;
          box-shadow: 0 0 0 3px rgba(26,86,219,0.1);
        }
        .login-input-pw { padding-right: 2.75rem; }
        .login-pw-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          padding: 0;
          transition: color 0.15s;
        }
        .login-pw-toggle:hover { color: #0d2654; }

        .login-submit {
          width: 100%;
          padding: 0.8rem;
          background: linear-gradient(135deg, #0d2654 0%, #1a56db 100%);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 14px rgba(26,86,219,0.2);
        }
        .login-submit:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.25rem 0 0;
        }
        .login-divider-line { flex: 1; height: 1px; background: #f1f5f9; }
        .login-divider-text { font-size: 0.72rem; color: #cbd5e1; }

        .login-right-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: #cbd5e1;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        /* ── RESPONSIVE ── */

        /* Mobile: up to 479px — single column, no brand panel */
        @media (max-width: 479px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right {
            padding: 2rem 1.25rem;
            background: linear-gradient(160deg, #0d2654 0%, #1a3a6b 40%, #f8fafc 40%);
          }
          .login-right-inner { max-width: 100%; }
          .login-back { color: #94a3b8; }
          .login-greeting { font-size: 1.4rem; }
          .login-card { padding: 1.25rem; }
          .login-submit { font-size: 0.875rem; }

          /* Show a compact brand strip at the top on mobile */
          .login-mobile-brand {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: 2rem;
          }
          .login-mobile-brand-logo {
            width: 36px; height: 36px;
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Sora', sans-serif;
            font-size: 0.6rem; font-weight: 700; color: #fff;
          }
          .login-mobile-brand-name {
            font-family: 'Sora', sans-serif;
            font-size: 0.85rem; font-weight: 700;
            color: rgba(255,255,255,0.9);
          }
          .login-right-header { margin-bottom: 1.25rem; }
          .login-back { color: rgba(255,255,255,0.6); }
          .login-back:hover { color: #fff; }
          .login-greeting { color: #fff; }
          .login-subline { color: rgba(255,255,255,0.6); }
          .login-right-footer { color: rgba(255,255,255,0.3); }
        }

        /* Small tablet: 480px – 767px */
        @media (min-width: 480px) and (max-width: 767px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left {
            /* Collapse to a horizontal header strip */
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 1.25rem 2rem;
            min-height: auto;
          }
          .login-left-body { display: none; }
          .login-left-footer { display: none; }
          .login-right { padding: 2.5rem 2rem; min-height: calc(100vh - 80px); }
          .login-right-inner { max-width: 420px; }
        }

        /* Tablet: 768px – 1023px */
        @media (min-width: 768px) and (max-width: 1023px) {
          .login-root { grid-template-columns: 0.9fr 1.1fr; }
          .login-left { padding: 2.5rem; }
          .login-left-title { font-size: 1.75rem; }
          .login-left-desc { font-size: 0.82rem; max-width: 280px; margin-bottom: 1.75rem; }
          .login-features { gap: 0.6rem; }
          .login-feature-text { font-size: 0.78rem; }
          .login-right { padding: 2.5rem; }
        }

        /* Desktop: 1024px+ — default styles, no override needed */

        /* Ensure mobile brand strip hidden on larger screens */
        @media (min-width: 480px) {
          .login-mobile-brand { display: none; }
        }
      `}</style>

      <div className="login-root">
        {/* LEFT: Brand panel */}
        <div className="login-left">
          <a href="/" className="login-brand">
            <div className="login-brand-logo">BDRS</div>
            <span className="login-brand-name">Vital Registry</span>
          </a>

          <div className="login-left-body">
            <div className="login-left-tag">
              <span className="login-left-dot" />
              Secure Government Portal
            </div>
            <h1 className="login-left-title">
              Ghana&apos;s<br />
              <span>Official</span> Vital<br />
              Records System
            </h1>
            <p className="login-left-desc">
              Manage birth and death registrations with government-grade security, role-based workflows, and instant certificate issuance.
            </p>
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">🔐</div>
                <span className="login-feature-text">Role-based access for all user types</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">📜</div>
                <span className="login-feature-text">Official certificate generation</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">🏛️</div>
                <span className="login-feature-text">Automatic institutional notifications</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">📊</div>
                <span className="login-feature-text">Analytics and reporting dashboard</span>
              </div>
            </div>
          </div>

          <div className="login-left-footer">
            © 2026 Ministry of Local Government &amp; Rural Development
          </div>
        </div>

        {/* RIGHT: Login form */}
        <div className="login-right">
          <div className="login-right-inner">
            {/* Mobile-only brand strip */}
            <div className="login-mobile-brand">
              <div className="login-mobile-brand-logo">BDRS</div>
              <span className="login-mobile-brand-name">Vital Registry</span>
            </div>

            <div className="login-right-header">
              <a href="/" className="login-back">
                ← Back to home
              </a>
              <h2 className="login-greeting">Welcome back</h2>
              <p className="login-subline">Sign in to access your workspace</p>
            </div>

            <div className="login-card">
              {error && (
                <div className="login-error">
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="login-field">
                  <label className="login-label" htmlFor="login-email">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gov.gh"
                    className="login-input"
                    autoComplete="email"
                  />
                </div>

                <div className="login-field">
                  <label className="login-label" htmlFor="login-password">
                    Password
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="login-input login-input-pw"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="login-pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="login-submit">
                  {submitting ? (
                    <>
                      <svg className="spin" width="16" height="16" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                        <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    "Sign In →"
                  )}
                </button>

                <div className="login-divider">
                  <div className="login-divider-line" />
                  <span className="login-divider-text">Authorised personnel only</span>
                  <div className="login-divider-line" />
                </div>
              </form>
            </div>

            <div className="login-right-footer">
              Births &amp; Deaths Registry · Ghana · 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8fafc" }} />}>
      <LoginForm />
    </Suspense>
  );
}
