"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function QrRedirectClient() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // If user is not logged in, send them to login with a callback back to this QR page
  useEffect(() => {
    if (!data) return;
    if (status === "loading") return;

    if (!session) {
      const currentUrl =
        typeof window !== "undefined" ? window.location.href : `/qrRedirect?data=${encodeURIComponent(data)}`;
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
      router.replace(loginUrl);
      return;
    }
  }, [data, session, status, router]);

  // Once we have a session, decode QR payload and redirect based on role
  useEffect(() => {
    if (!data || !session || status !== "authenticated") return;

    try {
      const qrPayload = JSON.parse(atob(data));

      const role = session.user.role;

      let redirectUrl = "";

      if (role === "admin") redirectUrl = qrPayload.admin;
      else if (role === "faculty") redirectUrl = qrPayload.faculty;
      else if (role === "lab_technician") redirectUrl = qrPayload.lab_technician;
      else {
        toast.error("Invalid role");
        return;
      }

      if (!redirectUrl) {
        toast.error("Invalid QR code!");
        return;
      }

      window.location.href = redirectUrl;
    } catch (err) {
      console.error("QR decode error:", err);
      toast.error("Invalid QR code!");
    }
  }, [data, session, status]);

  const styles = {
    container: {
      width: isMobile ? "100%" : "calc(100% - 255px)",
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      padding: isMobile ? "1rem" : "2rem",
      boxSizing: "border-box",
      marginLeft: isMobile ? "0" : "255px",
      overflowX: "hidden",
    },
    loaderContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100%",
      backgroundColor: "#f9fafb",
      flexDirection: "column",
      gap: "1rem",
    },
    loaderText: {
      color: "#6b7280",
      fontSize: "16px",
      fontWeight: "500",
    },
  };

  if (!data) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <p style={styles.loaderText}>Invalid QR code — missing data.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loaderContainer}>
        <Loader2 size={48} className="animate-spin" color="#10b981" />
        <p style={styles.loaderText}>Redirecting...</p>
      </div>
    </div>
  );
}
