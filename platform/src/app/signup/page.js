"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./signup.module.css";
import { toast } from "react-toastify";

export default function SignupPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Backend logic unchanged ──
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match!");
      setLoading(false);
      return;
    }
    console.log("Signup details:", { email, password });

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      console.log(res);

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Signup failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Signup successful:", data);
      router.push("/onboarding");

    } catch (err) {
      console.error(err);
      setError("Something went wrong, try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === "Microsoft") {
      signIn("azure-ad", { callbackUrl: "/onboarding" });
    }
  };

  return (
    <div className={styles["signup-container"]}>

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

          {/* Center */}
          <div className={styles.leftCenter}>
            <div className={styles.tagline}>Smart Asset Management</div>
            <h1 className={styles.leftTitle}>
              Join Assetra<br/>
              <span>Get Started</span>
            </h1>
            <p className={styles.leftDesc}>
              Set up your account and start managing institutional assets
              with AI-powered intelligence from day one.
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
            <h2>Create account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSignup} className={styles.form}>

            {error && <div className={styles.errorMsg}>{error}</div>}

            {/* Name */}
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="name"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label>Confirm Password</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Loading..." : "Signup"}
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <span>or</span>
            </div>

            {/* Microsoft */}
            <div className={styles.socialButtons}>
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.microsoft}`}
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

            {/* Login link */}
            <p className={styles.switch}>
              Already have an account?{" "}
              <Link href="/login" className={styles.link}>
                Login
              </Link>
            </p>

          </form>
        </div>
      </div>

    </div>
  );
}