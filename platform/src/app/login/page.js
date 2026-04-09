"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";

export default function LoginPage({ searchParams }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams?.callbackUrl;

  // ── Backend logic (with QR callback support) ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    console.log(res);

    if (res?.error) {
      setError(res.error);
      toast.error("Login failed! Wrong credentials");
      setLoading(false);
      return;
    }

    toast.success("Login successful!");

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();

    const userRes = await fetch("/api/auth/userDetails");
    const { user } = await userRes.json();

    const needsOnboarding =
      !user.PhoneNumber ||
      !user.ProfileImage ||
      !user.Location;

    if (needsOnboarding) {
      window.location.href = "/onboarding";
      return;
    }

    // If we came here from a QR scan, go back to that URL
    if (callbackUrl) {
      window.location.href = callbackUrl;
      return;
    }

    const role = sessionData?.user?.role;
    if (role === "admin") window.location.href = "/adminPanel";
    else if (role === "faculty") window.location.href = "/facultyPanel";
    else if (role === "lab_technician") window.location.href = "/lab_technicianPanel";
    else window.location.href = "/login";

    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    if (provider === "Microsoft") {
      signIn("azure-ad", { callbackUrl: "/redirectAfterLogin" });
    }
  };

  return (
    <div className={styles.loginContainer}>

      {/* ══ LEFT PANEL ══ */}
      <div className={styles.leftPanel}>
        <div className={styles.gridDots} />
        <div className={styles.leftContent}>

          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 36 40" fill="none">
                <path d="M18 2L33 11V29L18 38L3 29V11L18 2Z" stroke="white" strokeWidth="2"/>
                <path d="M18 13L18 22M13 18L18 22L23 18" stroke="rgba(209,248,239,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className={styles.logoText}>ASSETRA</span>
          </div>

          {/* Center content */}
          <div className={styles.leftCenter}>
            <div className={styles.tagline}>Smart Asset Management</div>
            <h1 className={styles.leftTitle}>
              Manage Assets<br/>
              <span>Intelligently</span>
            </h1>
            <p className={styles.leftDesc}>
              Centralized, audit-ready platform for all institutional assets.
              Track AMC, maintenance, depreciation and compliance — powered by AI.
            </p>
            <div className={styles.features}>
              {[
                "NAAC & NBA Compliant",
                "AI-Powered Insights",
                "Real-time Asset Tracking",
                "Automated AMC Alerts",
              ].map((f) => (
                <div className={styles.featureItem} key={f}>
                  <div className={styles.featureCheck}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom pills */}
          <div className={styles.leftBottom}>
            <span className={styles.pill}>ISO 27001</span>
            <span className={styles.pill}>99.9% Uptime</span>
            <span className={styles.pill}>AI Powered</span>
          </div>

        </div>
      </div>

      {/* ══ RIGHT PANEL — FORM ══ */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>

          <div className={styles.formHeader}>
            <h2>Welcome back</h2>
            <p>Login in to your Assetra account</p>
          </div>

          <form onSubmit={handleLogin}>

            {error && <div className={styles.errorMsg}>{error}</div>}

            {/* Email */}
            <div className={styles.inputGroup}>
              <label>Email</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <span>or</span>
            </div>

            {/* Microsoft */}
            <div className={styles.socialButtons}>
              <button
                type="button"
                className={styles.socialBtn}
                onClick={() => handleSocialLogin("Microsoft")}
              >
                <svg width="18" height="18" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Continue with Microsoft
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}