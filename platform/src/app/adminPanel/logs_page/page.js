"use client";
import { useState, useMemo, useEffect } from "react";
import AdminSidebar from "@/app/adminPanel/components/Admin_Sidebar";

const ACTIONS = ["Issue Reported", "Issue Resolved", "Issue Approved"];
const PAGE_SIZE = 8;

// ─── Badge config ─────────────────────────────────────────────────────────────
const BADGE = {
  "Issue Reported": { text: "#854D0E", border: "#FDE047", dot: "#EAB308" },
  "Issue Resolved": { text: "#1E40AF", border: "#93C5FD", dot: "#3B82F6" },
  "Issue Approved": { text: "#166534", border: "#86EFAC", dot: "#22C55E" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Search:   () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Filter:   () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Reset:    () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  Close:    () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Chevron:  ({ dir }) => <svg className={`w-4 h-4 ${dir === "left" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  User:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Asset:    () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  Clock:    () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Log:      () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Timeline: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Desc:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Shield:   () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

// ─── Badge Component ──────────────────────────────────────────────────────────
function Badge({ action }) {
  const c = BADGE[action] || BADGE["Issue Reported"];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: c.dot }} />
      {action}
    </span>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function Drawer({ log, onClose, allLogs }) {
  const [tab, setTab] = useState("details");
  if (!log) return null;
  const timeline = allLogs
    .filter(l => l.assetId === log.assetId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl"
           style={{ background: "#fff", borderLeft: "1px solid #e2e8f0",
                    animation: "slideIn .25s cubic-bezier(.4,0,.2,1)" }}>
        {/* Drawer header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100"
             style={{ background: "linear-gradient(135deg,#EBF4F6,#D1F8EF)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                 style={{ background: "linear-gradient(135deg,#088395,#176B87)", color: "#fff" }}>
              <Icon.Log />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#088395" }}>Log Detail</p>
              <p className="text-sm font-bold" style={{ color: "#176B87", fontFamily: "'Playfair Display', serif" }}>{log.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/60 transition">
            <Icon.Close />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5 pt-3 gap-1">
          {[["details","Details"], ["timeline","Timeline"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="px-4 py-2 text-xs font-bold rounded-t-lg transition-all"
              style={{
                background: tab === key ? "#088395" : "transparent",
                color: tab === key ? "#fff" : "#64748b",
                borderBottom: tab === key ? "2px solid #088395" : "2px solid transparent"
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tab === "details" ? (
            <>
              <div className="rounded-2xl p-4 space-y-3" style={{ background: "#F8FAFC" }}>
                <Row icon={<Icon.Asset />} label="Asset ID" value={log.assetId} mono />
                <Row icon={<Icon.Asset />} label="Asset Name" value={log.assetName} />
                <Row icon={<Icon.User />}  label="Performed By" value={`${log.user} · ${log.role}`} />
                <Row icon={<Icon.Clock />} label="Timestamp" value={log.timestamp} />
                <Row icon={<Icon.Shield />} label="Action">
                  <Badge action={log.action} />
                </Row>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "#F8FAFC" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon.Desc />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{log.description}</p>
              </div>
              {/* Resolve description (only when resolved) */}
              {log.resolveDescription && (
                <div className="rounded-2xl p-4" style={{ background: "#DBEAFE" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon.Shield />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1E40AF" }}>Resolution Notes</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#1e3a5f" }}>{log.resolveDescription}</p>
                </div>
              )}
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-3 text-center" style={{ background: "#EBF4F6" }}>
                  <p className="text-2xl font-extrabold" style={{ color: "#088395", fontFamily: "'Playfair Display', serif" }}>
                    {timeline.length}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Total Events</p>
                </div>
                <div className="rounded-2xl p-3 text-center" style={{ background: "#D1F8EF" }}>
                  <p className="text-2xl font-extrabold" style={{ color: "#176B87", fontFamily: "'Playfair Display', serif" }}>
                    {timeline.filter(l => l.action === "Issue Resolved").length}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Resolved</p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-0">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Icon.Timeline /> Activity for {log.assetId}
              </p>
              <div className="relative pl-5">
                <div className="absolute left-2 top-0 bottom-0 w-px"
                     style={{ background: "linear-gradient(to bottom,#088395,#D1F8EF)" }} />
                {timeline.map((t) => (
                  <div key={t.id} className={`relative mb-5 ${t.id === log.id ? "opacity-100" : "opacity-70"}`}>
                    <div className="absolute -left-3 top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                         style={{ background: t.id === log.id ? "#088395" : BADGE[t.action]?.dot || "#94a3b8" }} />
                    <div className={`ml-3 rounded-xl p-3 transition-all ${t.id === log.id ? "ring-2 ring-[#088395]/30 shadow-sm" : ""}`}
                         style={{ background: t.id === log.id ? "#EBF4F6" : "#F8FAFC" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge action={t.action} />
                        <span className="text-xs text-slate-400">{t.timestamp.split(" ").slice(0, 3).join(" ")}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
                      <p className="text-xs font-medium mt-1.5" style={{ color: "#176B87" }}>
                        {t.user} · {t.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ icon, label, value, mono, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        {children || (
          <p className={`text-sm font-semibold text-slate-700 mt-0.5 ${mono ? "font-mono text-[#088395]" : ""}`}>{value}</p>
        )}
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: "1px solid #D1F8EF" }}>
      {[120, 90, 100, 130, 200, 70].map((w, i) => (
        <td key={i} style={{ padding: "14px 20px" }}>
          <div style={{ height: "14px", borderRadius: "6px", background: "linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", width: `${w}px`, maxWidth: "100%" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const [search, setSearch]       = useState("");
  const [assetFilter, setAsset]   = useState("");
  const [actionFilter, setAction] = useState("");
  const [dateFrom, setFrom]       = useState("");
  const [dateTo, setTo]           = useState("");
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/issueLogs");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        setError("Failed to load logs. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const ASSETS = useMemo(() => [...new Set(logs.map(l => l.assetId))], [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const q = search.toLowerCase();
      if (q && !l.assetId.toLowerCase().includes(q) && !l.user.toLowerCase().includes(q)) return false;
      if (assetFilter && l.assetId !== assetFilter) return false;
      if (actionFilter && l.action !== actionFilter) return false;
      if (dateFrom && l.timestamp < dateFrom) return false;
      if (dateTo   && l.timestamp.slice(0, 10) > dateTo) return false;
      return true;
    });
  }, [logs, search, assetFilter, actionFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function reset() {
    setSearch(""); setAsset(""); setAction("");
    setFrom(""); setTo(""); setPage(1);
  }

  const actionCounts = ACTIONS.reduce((a, k) => ({ ...a, [k]: logs.filter(l => l.action === k).length }), {});

  // ── Responsive sidebar offset ────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const containerStyle = {
    width: isMobile ? "100%" : "calc(100% - 255px)",
    minHeight: "100vh",
    backgroundColor: "#EBF4F6",
    padding: isMobile ? "1rem" : "2rem",
    marginLeft: isMobile ? "0" : "255px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    overflowX: "hidden",
  };

  return (
    <>
      <AdminSidebar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .fade-in  { animation: fadeUp .35s ease both; }
        .row-hover:hover { background: linear-gradient(90deg, #EBF4F6 0%, #f8fafc 100%) !important; cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: #a8cdd5; border-radius: 99px; }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px; }
      `}</style>

      <div style={containerStyle}>

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="fade-in" style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "3px solid #088395", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,#088395,#176B87)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(8,131,149,0.25)" }}>
                <svg style={{ width: "20px", height: "20px", color: "white" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? "1.75rem" : "2.25rem", fontWeight: "800", color: "#176B87", margin: 0, letterSpacing: "-0.5px", fontFamily: "'Playfair Display', serif" }}>
                  Activity Logs
                </h1>
                <p style={{ margin: "2px 0 0", fontSize: isMobile ? "12px" : "13px", color: "#3674B5", fontWeight: "500" }}>
                  Track all actions performed on lab assets and issues.
                </p>
              </div>
            </div>
          </div>
          {/* Mini stat pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              { label: "Total",    val: logs.length,                                        bg: "#EBF4F6", c: "#088395" },
              { label: "Pending",  val: logs.filter(l => l.action === "Issue Reported").length, bg: "#FEF9C3", c: "#854D0E" },
              { label: "Resolved", val: logs.filter(l => l.action === "Issue Resolved").length, bg: "#DBEAFE", c: "#1E40AF" },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: "12px", padding: "6px 14px", fontSize: "12px", fontWeight: "700", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 2px 6px rgba(8,131,149,0.08)", background: s.bg, color: s.c }}>
                {loading ? "…" : s.val} {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────── */}
        {error && (
          <div className="fade-in" style={{ borderRadius: "12px", padding: "14px 18px", marginBottom: "1rem", background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg style={{ width: "16px", height: "16px", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
            <button onClick={() => window.location.reload()} style={{ marginLeft: "auto", background: "#991B1B", color: "#fff", border: "none", borderRadius: "8px", padding: "4px 12px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>Retry</button>
          </div>
        )}

        {/* ── Filters ──────────────────────────────────────────────── */}
        <section className="fade-in" style={{ borderRadius: "16px", border: "1px solid rgba(8,131,149,0.12)", boxShadow: "0 4px 6px -1px rgba(8,131,149,0.08)", padding: isMobile ? "1rem" : "1.25rem", marginBottom: "1.25rem", background: "rgba(255,255,255,0.97)", animationDelay: ".05s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Icon.Filter />
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "#176B87" }}>Filters</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)", gap: "12px" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}><Icon.Search /></span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search ID or user…"
                style={{ width: "100%", borderRadius: "10px", border: "1px solid rgba(8,131,149,0.25)", backgroundColor: "#EBF4F6", padding: "10px 14px 10px 36px", fontSize: isMobile ? "12px" : "13px", color: "#176B87", outline: "none", boxSizing: "border-box" }} />
            </div>
            {/* Asset */}
            <select value={assetFilter} onChange={e => { setAsset(e.target.value); setPage(1); }}
              style={{ width: "100%", borderRadius: "10px", border: "1px solid rgba(8,131,149,0.25)", backgroundColor: "#EBF4F6", padding: "10px 32px 10px 14px", fontSize: isMobile ? "12px" : "13px", color: "#176B87", outline: "none", boxSizing: "border-box", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
              <option value="">All Assets</option>
              {ASSETS.map(a => <option key={a}>{a}</option>)}
            </select>
            {/* Action */}
            <select value={actionFilter} onChange={e => { setAction(e.target.value); setPage(1); }}
              style={{ width: "100%", borderRadius: "10px", border: "1px solid rgba(8,131,149,0.25)", backgroundColor: "#EBF4F6", padding: "10px 32px 10px 14px", fontSize: isMobile ? "12px" : "13px", color: "#176B87", outline: "none", boxSizing: "border-box", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}>
              <option value="">All Actions</option>
              {ACTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
            {/* Date From */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}><Icon.Calendar /></span>
              <input type="date" value={dateFrom} onChange={e => { setFrom(e.target.value); setPage(1); }}
                style={{ width: "100%", borderRadius: "10px", border: "1px solid rgba(8,131,149,0.25)", backgroundColor: "#EBF4F6", padding: "10px 14px 10px 36px", fontSize: isMobile ? "12px" : "13px", color: "#176B87", outline: "none", boxSizing: "border-box" }} />
            </div>
            {/* Date To + Reset */}
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex" }}><Icon.Calendar /></span>
                <input type="date" value={dateTo} onChange={e => { setTo(e.target.value); setPage(1); }}
                  style={{ width: "100%", borderRadius: "10px", border: "1px solid rgba(8,131,149,0.25)", backgroundColor: "#EBF4F6", padding: "10px 14px 10px 36px", fontSize: isMobile ? "12px" : "13px", color: "#176B87", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={reset}
                style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "10px", padding: "9px 14px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(8,131,149,0.25)", background: "white", color: "#176B87", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = "#dc2626"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(8,131,149,0.25)"; e.currentTarget.style.color = "#176B87"; }}>
                <Icon.Reset /> Reset
              </button>
            </div>
          </div>
          {/* Active filter chips */}
          {(search || assetFilter || actionFilter || dateFrom || dateTo) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #D1F8EF", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>Active:</span>
              {search && <Chip label={`"${search}"`} onRemove={() => setSearch("")} />}
              {assetFilter && <Chip label={assetFilter} onRemove={() => setAsset("")} />}
              {actionFilter && <Chip label={actionFilter} onRemove={() => setAction("")} />}
              {dateFrom && <Chip label={`From ${dateFrom}`} onRemove={() => setFrom("")} />}
              {dateTo && <Chip label={`To ${dateTo}`} onRemove={() => setTo("")} />}
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </section>

        {/* ── Action Summary Bar ────────────────────────────────────── */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: "1rem", marginBottom: "1.25rem", animationDelay: ".1s" }}>
          {ACTIONS.map(a => {
            const c = BADGE[a];
            const isActive = actionFilter === a;
            return (
              <button key={a} onClick={() => { setAction(isActive ? "" : a); setPage(1); }}
                style={{
                  borderRadius: "14px", padding: isMobile ? "12px" : "14px", textAlign: "left",
                  border: `0.5px solid ${isActive ? c.border : "rgba(8,131,149,0.12)"}`,
                  background: "#fff",
                  boxShadow: isActive ? `0 0 0 2px ${c.border}` : "0 1px 4px rgba(8,131,149,0.06)",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", marginBottom: "8px", background: c.dot }} />
                <p style={{ fontSize: "11px", fontWeight: "700", lineHeight: "1.3", color: c.text, margin: 0 }}>{a}</p>
                <p style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: "800", marginTop: "4px", color: isActive ? c.text : "#1e293b", fontFamily: "'Playfair Display', serif" }}>
                  {loading ? "…" : actionCounts[a]}
                </p>
              </button>
            );
          })}
        </div>

        {/* ── Table ────────────────────────────────────────────────── */}
        <section className="fade-in" style={{ borderRadius: "16px", border: "1px solid rgba(8,131,149,0.12)", boxShadow: "0 4px 6px -1px rgba(8,131,149,0.08)", overflow: "hidden", background: "rgba(255,255,255,0.97)", marginBottom: "1.5rem", animationDelay: ".15s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "14px 16px" : "16px 20px", borderBottom: "1px solid #D1F8EF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon.Log />
              <span style={{ fontSize: "15px", fontWeight: "700", color: "#176B87" }}>Logs History</span>
              <span style={{ borderRadius: "99px", padding: "2px 10px", fontSize: "11px", fontWeight: "700", background: "#EBF4F6", color: "#088395" }}>
                {loading ? "…" : filtered.length}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "#94a3b8" }}>
              {loading ? "Loading data…" : "Click any row for details"}
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? "12px" : "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#D1F8EF" }}>
                  {["Date & Time","Asset ID","Action","Performed By","Description","Status"].map(h => (
                    <th key={h} style={{ padding: isMobile ? "10px 12px" : "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "#176B87", borderBottom: "2px solid #088395", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <svg style={{ width: "48px", height: "48px", opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        <p style={{ fontWeight: "600" }}>No logs match your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((log, i) => (
                  <tr key={log.id}
                      onClick={() => setSelected(log)}
                      className="row-hover"
                      style={{ borderBottom: "1px solid #D1F8EF", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#EBF4F6", transition: "background 0.15s", cursor: "pointer" }}>
                    {/* Date */}
                    <td style={{ padding: isMobile ? "10px 12px" : "12px 20px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "4px", height: "32px", borderRadius: "99px", background: BADGE[log.action]?.dot || "#94a3b8", flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: "12px", fontWeight: "600", color: "#334155", margin: 0 }}>{log.timestamp.split(",")[0]}</p>
                          <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>{log.timestamp.split(",")[1]?.trim()}</p>
                        </div>
                      </div>
                    </td>
                    {/* Asset ID */}
                    <td style={{ padding: isMobile ? "10px 12px" : "12px 20px", whiteSpace: "nowrap" }}>
                      <p style={{ fontFamily: "monospace", fontWeight: "700", fontSize: "12px", color: "#088395", margin: 0 }}>{log.assetId}</p>
                      <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>{log.assetName}</p>
                    </td>
                    {/* Action badge */}
                    <td style={{ padding: isMobile ? "10px 12px" : "12px 20px", whiteSpace: "nowrap" }}>
                      <Badge action={log.action} />
                    </td>
                    {/* User */}
                    <td style={{ padding: isMobile ? "10px 12px" : "12px 20px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "white", background: `hsl(${(log.user?.charCodeAt(0) || 0) * 7 % 360},55%,45%)`, flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                          {log.user?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??"}
                        </div>
                        <div>
                          <p style={{ fontSize: "12px", fontWeight: "600", color: "#334155", margin: 0 }}>{log.user}</p>
                          <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>{log.role}</p>
                        </div>
                      </div>
                    </td>
                    {/* Description */}
                    <td style={{ padding: isMobile ? "10px 12px" : "12px 20px", maxWidth: "240px" }}>
                      <p style={{ fontSize: "12px", color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.description}</p>
                    </td>
                    {/* Status */}
                    <td style={{ padding: isMobile ? "10px 12px" : "12px 20px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: BADGE[log.action]?.text }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: BADGE[log.action]?.dot, display: "inline-block" }} />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────── */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: isMobile ? "12px 16px" : "12px 20px", borderTop: "1px solid #D1F8EF", backgroundColor: "#EBF4F6" }}>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
              Showing <strong style={{ color: "#334155" }}>{Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)}</strong> of <strong style={{ color: "#334155" }}>{filtered.length}</strong> logs
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <PagBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <Icon.Chevron dir="left" />
              </PagBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx-1] !== p - 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={i} style={{ padding: "0 8px", color: "#94a3b8", fontSize: "12px" }}>…</span>
                  ) : (
                    <PagBtn key={p} active={page === p} onClick={() => setPage(p)}>{p}</PagBtn>
                  )
                )}
              <PagBtn disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <Icon.Chevron dir="right" />
              </PagBtn>
            </div>
          </div>
        </section>
      </div>

      <Drawer log={selected} onClose={() => setSelected(null)} allLogs={logs} />
    </>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function Chip({ label, onRemove }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "99px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", background: "#EBF4F6", color: "#088395", border: "1px solid #a8cdd5" }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "13px", lineHeight: 1, padding: 0 }}>×</button>
    </span>
  );
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width: "30px", height: "30px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
        background: active ? "#088395" : disabled ? "#f1f5f9" : "#fff",
        color: active ? "#fff" : disabled ? "#cbd5e1" : "#475569",
        border: `1px solid ${active ? "#088395" : "#D1F8EF"}`,
        cursor: disabled ? "not-allowed" : "pointer",
      }}>
      {children}
    </button>
  );
}