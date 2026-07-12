import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import QrRedirectClient from "./QrRedirectClient";

function QrRedirectFallback() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f9fafb",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <Loader2 size={48} className="animate-spin" color="#10b981" />
      <p style={{ color: "#6b7280", fontSize: "16px", fontWeight: "500" }}>Redirecting...</p>
    </div>
  );
}

export default function QrRedirectPage() {
  return (
    <Suspense fallback={<QrRedirectFallback />}>
      <QrRedirectClient />
    </Suspense>
  );
}
