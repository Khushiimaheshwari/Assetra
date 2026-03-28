"use client";

import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "@/app/adminPanel/components/Admin_Sidebar";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysLeft(end) {
  if (!end) return null;
  return Math.ceil((new Date(end) - new Date()) / 86400000);
}
function getWarrantyStatus(end) {
  if (!end) return "No Warranty";
  const d = daysLeft(end);
  if (d < 0)   return "Expired";
  if (d <= 60) return "Expiring Soon";
  return "Active";
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtINR(n) {
  if (n == null || n === "") return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Bell:     () => <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  Plus:     () => <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 4v16m8-8H4"/></svg>,
  Close:    () => <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Shield:   () => <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Wrench:   () => <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  Calendar: () => <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Spinner:  () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#ccc"/><path d="M21 12a9 9 0 00-9-9" stroke="#088395"/></svg>,
  Asset:    () => <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  Check:    () => <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M20 6 9 17l-5-5"/></svg>,
};

// ─── Status badge configs ─────────────────────────────────────────────────────
const WARRANTY_BADGE = {
  "Active":        { bg: "#DCFCE7", text: "#166534", border: "#86EFAC", dot: "#22C55E" },
  "Expiring Soon": { bg: "#FEF9C3", text: "#854D0E", border: "#FDE047", dot: "#EAB308" },
  "Expired":       { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", dot: "#EF4444" },
  "No Warranty":   { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#94A3B8" },
};
const MAINT_BADGE = {
  "Scheduled":   { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD", dot: "#3B82F6" },
  "In Progress": { bg: "#FEF9C3", text: "#854D0E", border: "#FDE047", dot: "#EAB308" },
  "Completed":   { bg: "#DCFCE7", text: "#166534", border: "#86EFAC", dot: "#22C55E" },
  "Cancelled":   { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", dot: "#EF4444" },
};

function StatusBadge({ label, map }) {
  const c = map[label] || map["No Warranty"] || { bg:"#F1F5F9", text:"#475569", border:"#CBD5E1", dot:"#94A3B8" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:c.bg, color:c.text, border:`1px solid ${c.border}` }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
      {label}
    </span>
  );
}

// ─── InputField ───────────────────────────────────────────────────────────────
function Field({ label, name, type="text", value, onChange, options, isMobile, required }) {
  const base = { width:"100%", borderRadius:10, border:"2px solid #e2e8f0", backgroundColor:"white", padding:"9px 13px", fontSize: isMobile?13:14, color:"#176B87", outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s" };
  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      <label style={{ fontSize:13, fontWeight:700, color:"#176B87", marginBottom:6, letterSpacing:"0.03em" }}>
        {label}{required && <span style={{ color:"#EF4444" }}> *</span>}
      </label>
      {options ? (
        <select
          name={name} value={value} onChange={onChange}
          style={{ ...base, appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:30 }}
          onFocus={e => e.target.style.borderColor = "#088395"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        >
          <option value="">Select…</option>
          {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={`Enter ${label.toLowerCase()}`} style={base}
          onFocus={e => e.target.style.borderColor = "#088395"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />
      )}
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkRow({ cols }) {
  return (
    <tr style={{ borderBottom:"1px solid #D1F8EF" }}>
      {Array.from({length: cols}).map((_, i) => (
        <td key={i} style={{ padding:"14px 20px" }}>
          <div style={{ height:13, borderRadius:6, background:"linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite", width:["80%","60%","70%","55%","65%"][i%5] }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AMCDashboard() {
  const [contracts,    setContracts]    = useState([]);
  const [maintenance,  setMaintenance]  = useState([]);
  const [loadingC,     setLoadingC]     = useState(true);
  const [loadingM,     setLoadingM]     = useState(true);
  const [errorC,       setErrorC]       = useState(null);
  const [errorM,       setErrorM]       = useState(null);

  const [maintFormOpen, setMaintFormOpen] = useState(false);
  const [search,        setSearch]        = useState("");
  const [isMobile,      setIsMobile]      = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [saveOk,        setSaveOk]        = useState(false);
  const [cardFilter,    setCardFilter]    = useState("Expiring Soon");

  const [mForm, setMForm] = useState({
    assetObjectId: "",
    scheduledDate: "",
    serviceOfficerName: "",
    workDone: "",
    cost: "",
    status: "Scheduled",
    notes: "",
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoadingC(true); setErrorC(null);
        const res = await fetch("/api/admin/amc/contracts");
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setContracts(data.contracts || []);
      } catch (e) {
        setErrorC("Failed to load warranty contracts.");
      } finally {
        setLoadingC(false);
      }
    }
    load();
  }, []);

  async function loadMaintenance() {
    try {
      setLoadingM(true); setErrorM(null);
      const res = await fetch("/api/admin/amc/maintenance");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setMaintenance(data.maintenance || []);
    } catch (e) {
      setErrorM("Failed to load maintenance records.");
    } finally {
      setLoadingM(false);
    }
  }
  useEffect(() => { loadMaintenance(); }, []);

  const total    = contracts.length;
  const active   = contracts.filter(c => getWarrantyStatus(c.warrantyEnd) === "Active").length;
  const expiring = contracts.filter(c => getWarrantyStatus(c.warrantyEnd) === "Expiring Soon").length;
  const expired  = contracts.filter(c => getWarrantyStatus(c.warrantyEnd) === "Expired").length;

  const alertList = useMemo(() =>
    contracts
      .filter(c => { const d = daysLeft(c.warrantyEnd); return d !== null && d >= 0 && d <= 60; })
      .map(c => ({ ...c, days: daysLeft(c.warrantyEnd) }))
      .sort((a, b) => a.days - b.days),
    [contracts]
  );

  const CARD_STATUS_MAP = {
    "all":           null,
    "Active":        "Active",
    "Expiring Soon": "Expiring Soon",
    "Expired":       "Expired",
  };

  const filtered = useMemo(() =>
    contracts.filter(c => {
      if (cardFilter && cardFilter !== "all") {
        if (getWarrantyStatus(c.warrantyEnd) !== CARD_STATUS_MAP[cardFilter]) return false;
      }
      return [c.assetId, c.assetName, c.brand, c.lab, c.assetType].some(v =>
        (v || "").toLowerCase().includes(search.toLowerCase())
      );
    }),
    [contracts, search, cardFilter]
  );

  const assetOptions = useMemo(() =>
    contracts.map(c => ({ value: c._id, label: `${c.assetId} — ${c.assetName}` })),
    [contracts]
  );

  function handleMForm(e) {
    setMForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleAddMaintenance() {
    if (!mForm.assetObjectId || !mForm.scheduledDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/amc/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetObjectId:      mForm.assetObjectId,
          scheduledDate:      mForm.scheduledDate,
          serviceOfficerName: mForm.serviceOfficerName,
          workDone:           mForm.workDone,
          cost:               mForm.cost,
          status:             mForm.status,
          notes:              mForm.notes,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveOk(true);
      setMaintFormOpen(false);
      setMForm({ assetObjectId:"", scheduledDate:"", serviceOfficerName:"", workDone:"", cost:"", status:"Scheduled", notes:"" });
      await loadMaintenance();
      setTimeout(() => setSaveOk(false), 3000);
    } catch {
      alert("Failed to save maintenance record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const container = {
    width: isMobile ? "100%" : "calc(100% - 255px)",
    minHeight: "100vh",
    backgroundColor: "#EBF4F6",
    padding: isMobile ? "1rem" : "2rem",
    marginLeft: isMobile ? "0" : "255px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    overflowX: "hidden",
  };
  const card = {
    backgroundColor: "white",
    borderRadius: 16,
    padding: isMobile ? "1.25rem" : "1.5rem",
    boxShadow: "0 4px 6px -1px rgba(8,131,149,0.1)",
    border: "1px solid rgba(8,131,149,0.1)",
    marginBottom: "1.5rem",
    overflowX: "auto",
  };
  const th = {
    padding: isMobile ? "10px 12px" : "12px 20px",
    textAlign: "left",
    fontWeight: 700,
    color: "#176B87",
    borderBottom: "2px solid #088395",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: "0.5px",
    backgroundColor: "#D1F8EF",
    whiteSpace: "nowrap",
  };
  const td = { padding: isMobile ? "10px 12px" : "12px 20px", color: "#334155", borderBottom: "1px solid #D1F8EF", fontSize: isMobile ? 12 : 14, whiteSpace: "nowrap" };

  const summaryCards = [
    { filterKey:"all",           label:"Assets with Warranty",   value: loadingC?"…":total,    bg:"#D1F8EF",               icon:"#088395", accent:"#088395", Icon:Icon.Shield },
    { filterKey:"Active",        label:"Warranty Active",         value: loadingC?"…":active,   bg:"rgba(134,182,246,0.2)", icon:"#3674B5", accent:"#3674B5", Icon:Icon.Check  },
    { filterKey:"Expiring Soon", label:"Expiring within 60 days", value: loadingC?"…":expiring, bg:"rgba(251,191,36,0.15)", icon:"#d97706", accent:"#d97706", Icon:Icon.Bell   },
    { filterKey:"Expired",       label:"Warranty Expired",        value: loadingC?"…":expired,  bg:"rgba(239,68,68,0.12)",  icon:"#dc2626", accent:"#dc2626", Icon:Icon.Asset  },
  ];

  return (
    <>
      <AdminSidebar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .fade-in { animation: fadeUp .35s ease both; }
        .row-hover:hover { background: linear-gradient(90deg,#EBF4F6,#f8fafc) !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#a8cdd5; border-radius:99px; }
        .summary-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .summary-card:hover { transform: translateY(-4px) !important; box-shadow: 0 10px 20px rgba(8,131,149,0.18) !important; }
        .modal-overlay { animation: fadeIn 0.2s ease both; }
        .modal-content { animation: slideUp 0.25s ease both; }
      `}</style>

      <div style={container}>

        {/* ── Header ── */}
        <div className="fade-in" style={{ marginBottom:"1.5rem", paddingBottom:"1rem", borderBottom:"3px solid #088395", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#088395,#176B87)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(8,131,149,0.3)", color:"#fff" }}>
              <Icon.Shield />
            </div>
            <div>
              <h1 style={{ fontSize: isMobile?"1.6rem":"2.1rem", fontWeight:800, color:"#176B87", margin:0, fontFamily:"'Playfair Display',serif" }}>
                AMC Dashboard
              </h1>
              <p style={{ margin:"2px 0 0", fontSize:13, color:"#3674B5", fontWeight:500 }}>
                Warranty & Maintenance Tracking ·{" "}
                {alertList.length > 0 && (
                  <span style={{ color:"#d97706", fontWeight:700 }}>
                    <Icon.Bell /> {alertList.length} expiry alert{alertList.length !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMaintFormOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#088395,#176B87)", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(8,131,149,0.25)", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(8,131,149,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";   e.currentTarget.style.boxShadow="0 4px 12px rgba(8,131,149,0.25)"; }}
          >
            <Icon.Wrench /> Schedule Maintenance
          </button>
        </div>

        {/* ── Save success toast ── */}
        {saveOk && (
          <div className="fade-in" style={{ display:"flex", alignItems:"center", gap:8, borderRadius:12, padding:"12px 18px", marginBottom:"1rem", background:"#DCFCE7", border:"1px solid #86EFAC", color:"#166534", fontSize:13, fontWeight:600 }}>
            <Icon.Check /> Maintenance record saved successfully.
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="fade-in" style={{ display:"grid", gridTemplateColumns: isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:"1.25rem", marginBottom:"1.5rem", animationDelay:".05s" }}>
          {summaryCards.map((s) => {
            const isActive = cardFilter === s.filterKey;
            return (
              <div
                key={s.filterKey}
                className="summary-card"
                onClick={() => setCardFilter(isActive ? "all" : s.filterKey)}
                style={{
                  backgroundColor: "white", borderRadius: 16, padding: isMobile ? "1rem" : "1.25rem",
                  border: isActive ? `2px solid ${s.accent}` : "1px solid rgba(8,131,149,0.1)",
                  boxShadow: isActive ? `0 0 0 3px ${s.accent}22, 0 8px 16px rgba(8,131,149,0.14)` : "0 4px 6px -1px rgba(8,131,149,0.1)",
                  position: "relative", overflow: "hidden", cursor: "pointer",
                  transform: isActive ? "translateY(-4px)" : "translateY(0)", userSelect: "none",
                }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" }}>
                  <div style={{ fontSize: isMobile?11:12, fontWeight:600, color: isActive ? s.accent : "#64748b", textTransform:"uppercase", letterSpacing:"0.4px", lineHeight:1.4, maxWidth:120 }}>{s.label}</div>
                  <div style={{ width:40, height:40, borderRadius:10, background:s.bg, color:s.icon, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, outline: isActive ? `2px solid ${s.accent}44` : "none", outlineOffset:2 }}><s.Icon /></div>
                </div>
                <div style={{ fontSize: isMobile?"1.75rem":"2.25rem", fontWeight:800, color: isActive ? s.accent : "#088395", fontFamily:"'Playfair Display',serif" }}>{s.value}</div>
                {isActive && (
                  <div style={{ position:"absolute", bottom:10, right:12, fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.6px", padding:"2px 8px", borderRadius:99, background:s.accent, color:"#fff", opacity:0.9 }}>✓ Filtered</div>
                )}
                <div style={{ position:"absolute", bottom:-16, right:-16, width:70, height:70, borderRadius:"50%", background:s.icon, opacity: isActive ? 0.13 : 0.07 }} />
              </div>
            );
          })}
        </div>

        {/* ── Error banners ── */}
        {(errorC || errorM) && (
          <div style={{ borderRadius:12, padding:"12px 18px", marginBottom:"1rem", background:"#FEF2F2", border:"1px solid #FCA5A5", color:"#991B1B", fontSize:13, fontWeight:600 }}>
            {errorC || errorM}
            <button onClick={() => window.location.reload()} style={{ marginLeft:16, background:"#991B1B", color:"#fff", border:"none", borderRadius:8, padding:"3px 12px", fontSize:12, cursor:"pointer", fontWeight:600 }}>Retry</button>
          </div>
        )}

{/* ── Expiry Alerts ── */}

{alertList.length > 0 && (
  <div className="fade-in" style={{
    borderRadius: 16,
    border: "1px solid rgba(8,131,149,0.15)",
    marginBottom: "1.5rem",
    overflow: "hidden",
    backgroundColor: "white",
    boxShadow: "0 4px 6px -1px rgba(8,131,149,0.08)",
    animationDelay: ".1s",
  }}>

    {/* Header strip */}
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: isMobile ? "12px 16px" : "14px 22px",
      background: "linear-gradient(135deg,#088395,#176B87)",
      borderBottom: "none",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        flexShrink: 0,
      }}>
        <Icon.Bell />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Warranty Expiry Alerts</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>
          Assets expiring within 60 days
        </div>
      </div>
      <span style={{
        marginLeft: "auto", background: "rgba(255,255,255,0.2)",
        color: "#fff", fontSize: 12, fontWeight: 700,
        padding: "3px 12px", borderRadius: 99,
        border: "1px solid rgba(255,255,255,0.3)",
      }}>
        {alertList.length} alert{alertList.length !== 1 ? "s" : ""}
      </span>
    </div>

    {/* Alert rows */}
    {alertList.map((a, i) => {
      const isCritical = a.days <= 14;
      return (
        <div key={a._id} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "12px 16px" : "13px 22px",
          borderBottom: i < alertList.length - 1 ? "1px solid #EBF4F6" : "none",
          gap: 12, flexWrap: "wrap",
          backgroundColor: i % 2 === 0 ? "#fff" : "#F8FDFE",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#EBF4F6"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#fff" : "#F8FDFE"}
        >
          {/* Left: icon + asset info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: isCritical ? "#FEE2E2" : "#FEF9C3",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, color: isCritical ? "#dc2626" : "#d97706",
            }}>
              ⚠
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontFamily: "monospace", fontWeight: 700,
                  color: "#088395", fontSize: 13,
                  background: "#EBF4F6", padding: "1px 8px", borderRadius: 6,
                }}>
                  {a.assetId}
                </span>
                <span style={{ fontWeight: 600, color: "#176B87", fontSize: 14 }}>{a.assetName}</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 5, marginTop: 3,
                fontSize: 12, color: "#94a3b8",
              }}>
                <Icon.Calendar />
                Expires {fmtDate(a.warrantyEnd)}
              </div>
            </div>
          </div>

          {/* Right: days remaining badge */}
          <div style={{ flexShrink: 0 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 700,
              padding: "5px 14px", borderRadius: 99,
              background: isCritical ? "#FEE2E2" : "#FEF9C3",
              color: isCritical ? "#991b1b" : "#92400e",
              border: `1px solid ${isCritical ? "#FCA5A5" : "#FDE047"}`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isCritical ? "#EF4444" : "#EAB308",
                display: "inline-block",
              }} />
              {a.days}d remaining
            </span>
          </div>
        </div>
      );
    })}
  </div>
)}

        {/* ── Warranty / Contracts Table ── */}
        <div className="fade-in" style={{ ...card, animationDelay:".12s" }}>
          <div style={{ display:"flex", alignItems: isMobile?"flex-start":"center", justifyContent:"space-between", marginBottom:"1rem", paddingBottom:"0.75rem", borderBottom:"2px solid #D1F8EF", flexDirection: isMobile?"column":"row", gap:12 }}>
            <div>
              <div style={{ fontSize: isMobile?15:17, fontWeight:700, color:"#176B87", display:"flex", alignItems:"center", gap:8 }}>
                <Icon.Shield /> Warranty Contracts
                <span style={{ borderRadius:99, padding:"2px 10px", fontSize:11, fontWeight:700, background:"#EBF4F6", color:"#088395" }}>{loadingC ? "…" : filtered.length}</span>
              </div>
              <div style={{ fontSize:13, color:"#3674B5", marginTop:4, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                Derived from asset Financial Details
                {cardFilter && cardFilter !== "all" && (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99, background:"#EBF4F6", color:"#088395", border:"1px solid #a8cdd5" }}>
                    {cardFilter}
                    <button onClick={() => setCardFilter("all")} style={{ background:"none", border:"none", cursor:"pointer", color:"#088395", fontSize:14, lineHeight:1, padding:0, display:"flex", alignItems:"center" }}>×</button>
                  </span>
                )}
              </div>
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search ID, name, brand, lab…"
              style={{ padding:"9px 14px", borderRadius:10, border:"1px solid rgba(8,131,149,0.25)", backgroundColor:"#EBF4F6", fontSize:13, color:"#176B87", outline:"none", width: isMobile?"100%":240 }}
            />
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>{["Asset ID","Asset Name","Type","Brand","Lab","Purchase Year","Warranty (yrs)","Warranty End","Total Maint. Cost","Breakdown Freq.","Status"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loadingC
                  ? Array.from({length:5}).map((_,i) => <SkRow key={i} cols={11} />)
                  : filtered.length === 0
                  ? <tr><td colSpan={11} style={{ textAlign:"center", padding:"3rem", color:"#94a3b8", fontWeight:600 }}>No warranty records found</td></tr>
                  : filtered.map((c, i) => {
                    const st = getWarrantyStatus(c.warrantyEnd);
                    return (
                      <tr key={c._id} className="row-hover" style={{ backgroundColor: i%2===0?"#fff":"#EBF4F6", cursor:"default", transition:"background 0.15s" }}>
                        <td style={{ ...td, fontFamily:"monospace", fontWeight:700, color:"#088395" }}>{c.assetId}</td>
                        <td style={{ ...td, fontWeight:600 }}>{c.assetName}</td>
                        <td style={{ ...td, textTransform:"capitalize" }}>{c.assetType}</td>
                        <td style={td}>{c.brand}</td>
                        <td style={td}>{c.lab}</td>
                        <td style={td}>{c.purchaseYear || "—"}</td>
                        <td style={{ ...td, textAlign:"center" }}>{c.warrantyYears || "—"}</td>
                        <td style={td}>{fmtDate(c.warrantyEnd)}</td>
                        <td style={{ ...td, fontWeight:700, color:"#088395" }}>{fmtINR(c.totalMaintenanceCost)}</td>
                        <td style={{ ...td, textAlign:"center" }}>{c.breakdownFrequency ?? "—"}</td>
                        <td style={td}><StatusBadge label={st} map={WARRANTY_BADGE} /></td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"0.75rem 0 0", fontSize:12, color:"#9ca3af", borderTop:"1px solid #D1F8EF", marginTop:"0.5rem" }}>
            <span>Showing {filtered.length} of {contracts.length}</span>
            <span>Last updated: {new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        {/* ── Maintenance History Table ── */}
        <div className="fade-in" style={{ ...card, animationDelay:".18s" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", paddingBottom:"0.75rem", borderBottom:"2px solid #D1F8EF", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontSize: isMobile?15:17, fontWeight:700, color:"#176B87", display:"flex", alignItems:"center", gap:8 }}>
                <Icon.Wrench /> Maintenance Schedule
                <span style={{ borderRadius:99, padding:"2px 10px", fontSize:11, fontWeight:700, background:"#EBF4F6", color:"#088395" }}>{loadingM ? "…" : maintenance.length}</span>
              </div>
              <div style={{ fontSize:13, color:"#3674B5", marginTop:2 }}>All scheduled and completed service records</div>
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>{["Asset ID","Asset Name","Scheduled Date","Completed Date","Service Officer","Work Done","Cost (₹)","Status","Notes"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loadingM
                  ? Array.from({length:4}).map((_,i) => <SkRow key={i} cols={9} />)
                  : maintenance.length === 0
                  ? (
                    <tr><td colSpan={9} style={{ textAlign:"center", padding:"3rem", color:"#94a3b8", fontWeight:600 }}>
                      No maintenance records yet.{" "}
                      <button onClick={() => setMaintFormOpen(true)} style={{ background:"none", border:"none", color:"#088395", fontWeight:700, cursor:"pointer", fontSize:"inherit", textDecoration:"underline" }}>Schedule one now →</button>
                    </td></tr>
                  )
                  : maintenance.map((m, i) => (
                    <tr key={m._id} className="row-hover" style={{ backgroundColor: i%2===0?"#fff":"#EBF4F6", transition:"background 0.15s" }}>
                      <td style={{ ...td, fontFamily:"monospace", fontWeight:700, color:"#088395" }}>{m.assetId}</td>
                      <td style={{ ...td, fontWeight:600 }}>{m.assetName}</td>
                      <td style={td}><span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><Icon.Calendar /> {fmtDate(m.scheduledDate)}</span></td>
                      <td style={{ ...td, color: m.completedDate ? "#166534" : "#9ca3af" }}>{m.completedDate ? fmtDate(m.completedDate) : "—"}</td>
                      <td style={{ ...td, fontWeight:600 }}>{m.serviceOfficerName || "Unassigned"}</td>
                      <td style={{ ...td, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.workDone || "—"}</td>
                      <td style={{ ...td, fontWeight:700, color:"#088395" }}>{m.cost ? fmtINR(m.cost) : "—"}</td>
                      <td style={td}><StatusBadge label={m.status} map={MAINT_BADGE} /></td>
                      <td style={{ ...td, color:"#94a3b8", fontSize:12 }}>{m.notes || "—"}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Schedule Maintenance Modal Popup ── */}
      {maintFormOpen && (
        <div
          className="modal-overlay"
          onClick={() => setMaintFormOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "1rem",
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: "white", borderRadius: 16,
              padding: isMobile ? "1.25rem" : "2rem",
              width: "90%", maxWidth: 600,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(8,131,149,0.2)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.5rem", paddingBottom:"1rem", borderBottom:"2px solid #EBF4F6" }}>
              <div style={{ width:40, height:40, borderRadius:10, backgroundColor:"#EBF4F6", display:"flex", alignItems:"center", justifyContent:"center", color:"#088395", flexShrink:0 }}>
                <Icon.Wrench />
              </div>
              <div>
                <h2 style={{ fontSize:"1.25rem", fontWeight:800, color:"#176B87", margin:0 }}>Schedule Maintenance</h2>
                <p style={{ margin:"2px 0 0", fontSize:13, color:"#3674B5", fontWeight:500 }}>Log a new service or upcoming maintenance</p>
              </div>
              <button
                onClick={() => setMaintFormOpen(false)}
                style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:6, display:"flex", borderRadius:8, transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <Icon.Close />
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ marginBottom:"1rem" }}>
              <Field label="Asset" name="assetObjectId" value={mForm.assetObjectId} onChange={handleMForm} options={assetOptions} isMobile={isMobile} required />
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"repeat(2,1fr)", gap:"1rem" }}>
              <Field label="Scheduled Date" name="scheduledDate" type="date" value={mForm.scheduledDate} onChange={handleMForm} isMobile={isMobile} required />
              <Field label="Service Officer Name" name="serviceOfficerName" value={mForm.serviceOfficerName} onChange={handleMForm} isMobile={isMobile} />
              <Field label="Work to be Done" name="workDone" value={mForm.workDone} onChange={handleMForm} isMobile={isMobile} />
              <Field label="Estimated Cost (₹)" name="cost" type="number" value={mForm.cost} onChange={handleMForm} isMobile={isMobile} />
              <Field label="Status" name="status" value={mForm.status} onChange={handleMForm} options={["Scheduled","In Progress","Completed","Cancelled"]} isMobile={isMobile} />
            </div>
            <div style={{ marginTop:"1rem" }}>
              <Field label="Notes" name="notes" value={mForm.notes} onChange={handleMForm} isMobile={isMobile} />
            </div>

            {/* Modal Actions */}
            <div style={{ display:"flex", gap:12, marginTop:"1.5rem" }}>
              <button
                onClick={() => setMaintFormOpen(false)}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#EBF4F6"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}
                style={{ flex:1, padding:"11px", backgroundColor:"white", color:"#6b7280", border:"2px solid #e2e8f0", borderRadius:10, fontWeight:600, cursor:"pointer", fontSize:14, transition:"background 0.15s" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMaintenance}
                disabled={saving || !mForm.assetObjectId || !mForm.scheduledDate}
                style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", borderRadius:10, border:"none", background: saving?"#a8cdd5":"linear-gradient(135deg,#088395,#176B87)", color:"white", fontSize:14, fontWeight:700, cursor: saving?"not-allowed":"pointer", boxShadow:"0 4px 12px rgba(8,131,149,0.25)", opacity: (!mForm.assetObjectId || !mForm.scheduledDate) ? 0.6 : 1, transition:"opacity 0.2s" }}
              >
                {saving ? <><Icon.Spinner /> Saving…</> : <><Icon.Plus /> Save Record</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}