"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";
import { toast } from "react-toastify";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    avatar: ""
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // ── Backend logic unchanged ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          console.log(data.user);
        } else {
          console.error("Failed to fetch profile");
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setFormData({ ...formData, avatar: file });
    }
  };

  const generateRandomAvatar = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomId}`;
    setAvatarPreview(url);
    setFormData({ ...formData, avatar: url });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let res;
      if (formData.avatar instanceof File) {
        const data = new FormData();
        data.append("fullName", formData.fullName);
        data.append("phone", formData.phone);
        data.append("location", formData.location);
        data.append("profileImage", formData.avatar);
        res = await fetch("/api/auth/onboarding", { method: "POST", body: data });
      } else {
        res = await fetch("/api/auth/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            phone: formData.phone,
            location: formData.location,
            profileImage: formData.avatar,
          }),
        });
      }
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong");
      console.log("Profile Updated:", result);
      const role = user?.Role;
      if (role === "admin") window.location.href = "/adminPanel";
      else if (role === "lab_technician") window.location.href = "/lab_technicianPanel";
      else if (role === "faculty") window.location.href = "/facultyPanel";
      else router.push("/login");
    } catch (err) {
      console.error(err.message);
      toast.error("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formsWrapper}>

        {/* ══ STEP 1 ══ */}
        <form
          onSubmit={handleNextStep}
          className={styles.form}
          style={{
            transform: step === 1 ? "translateX(0)" : "translateX(-120%)",
            opacity: step === 1 ? 1 : 0,
            pointerEvents: step === 1 ? "auto" : "none"
          }}
        >
          <div className={styles.formBefore}></div>

          {/* Logo */}
          <div className={styles.formLogo}>
            <div className={styles.formLogoIcon}>
              <svg width="20" height="20" viewBox="0 0 36 40" fill="none">
                <path d="M18 2L33 11V29L18 38L3 29V11L18 2Z" stroke="white" strokeWidth="2"/>
                <path d="M18 13L18 22M13 18L18 22L23 18" stroke="rgba(209,248,239,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <h2 className={styles.title}>Complete Your Profile</h2>
          <p className={styles.subtitle}>Just a few more details to get you started</p>

          <div className={styles.inputGroup}>
            {/* Full Name */}
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
              </svg>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Location */}
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Next →
          </button>

          <div className={styles.progressIndicator}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: "50%" }}></div>
            </div>
            <span className={styles.progressText}>Step 1 of 2</span>
          </div>
        </form>

        {/* ══ STEP 2 ══ */}
        <form
          onSubmit={handleFinalSubmit}
          className={styles.form}
          style={{
            transform: step === 2 ? "translateX(0)" : "translateX(120%)",
            opacity: step === 2 ? 1 : 0,
            pointerEvents: step === 2 ? "auto" : "none"
          }}
        >
          <div className={styles.formBefore}></div>

          {/* ── Logo + Back button in same row ── */}
          <div className={styles.formLogoRow}>
            <button type="button" onClick={handleBackStep} className={styles.arrowBtn}>
              ← Back
            </button>
            <div className={styles.formLogoIcon}>
              <svg width="20" height="20" viewBox="0 0 36 40" fill="none">
                <path d="M18 2L33 11V29L18 38L3 29V11L18 2Z" stroke="white" strokeWidth="2"/>
                <path d="M18 13L18 22M13 18L18 22L23 18" stroke="rgba(209,248,239,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Spacer to keep logo centered */}
            <div style={{ width: "70px" }} />
          </div>

          <h2 className={styles.title}>Choose Your Avatar</h2>
          <p className={styles.subtitle}>Upload a photo or generate a random avatar</p>

          <div className={styles.avatarSection}>
            <div className={styles.avatarPreview}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarPlaceholder}></div>
              )}
            </div>

            <div className={styles.avatarButtons}>
              <label className={styles.uploadBtn}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                📁 Upload Photo
              </label>
              <button type="button" onClick={generateRandomAvatar} className={styles.randomBtn}>
                🎲 Random Avatar
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isUploading}>
            {isUploading ? "Saving..." : "Save & Continue"}
          </button>

          <div className={styles.progressIndicator}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: "100%" }}></div>
            </div>
            <span className={styles.progressText}>Step 2 of 2</span>
          </div>
        </form>

      </div>
    </div>
  );
}
