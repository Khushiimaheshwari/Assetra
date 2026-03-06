"use client";

import { useState } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockContracts = [
  { id: "LAB16-PC3",  category: "Computer",     vendor: "Microtek",    start: "2024-01-10", end: "2025-03-24", cost: 18000, contact: "9876543210" },
  { id: "SCI12-PR1",  category: "Printer",      vendor: "HP Services", start: "2024-03-01", end: "2025-08-01", cost: 12000, contact: "9812345670" },
  { id: "LAB08-SC2",  category: "Scanner",      vendor: "Canon Care",  start: "2023-07-15", end: "2024-12-31", cost: 9500,  contact: "9900112233" },
  { id: "ADMIN-AC5",  category: "AC Unit",       vendor: "BlueStar",    start: "2024-02-01", end: "2025-04-10", cost: 22000, contact: "9988776655" },
  { id: "LAB02-SV1",  category: "Server",        vendor: "Dell Tech",   start: "2024-06-01", end: "2026-05-31", cost: 85000, contact: "9111223344" },
  { id: "PHY05-OS1",  category: "Oscilloscope", vendor: "Tektronix",   start: "2023-11-01", end: "2025-03-30", cost: 31000, contact: "9222334455" },
];

const mockHistory = [
  { assetId: "LAB16-PC3",  date: "2025-01-15", issue: "Fan replacement & cleaning",       tech: "Ravi Kumar",   cost: 1200 },
  { assetId: "SCI12-PR1",  date: "2025-02-03", issue: "Cartridge jam + roller fix",        tech: "Anita Shah",   cost: 850  },
  { assetId: "LAB08-SC2",  date: "2024-11-20", issue: "Sensor calibration",                tech: "Deepak Nair",  cost: 2000 },
  { assetId: "ADMIN-AC5",  date: "2025-01-28", issue: "Gas refill & compressor check",     tech: "Suresh Patel", cost: 3500 },
  { assetId: "PHY05-OS1",  date: "2025-02-22", issue: "Display flicker – board replaced", tech: "Meena Joshi",  cost: 7800 },
];

const alertAssets = [
  { id: "LAB16-PC3",  vendor: "Microtek",    days: 18, end: "2025-03-24" },
  { id: "PHY05-OS1",  vendor: "Tektronix",   days: 24, end: "2025-03-30" },
  { id: "ADMIN-AC5",  vendor: "BlueStar",    days: 35, end: "2025-04-10" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysLeft(end) {
  const ms = new Date(end) - new Date();
  return Math.ceil(ms / 86400000);
}

function getStatus(end) {
  const d = daysLeft(end);
  if (d < 0)  return "Expired";
  if (d <= 30) return "Expiring Soon";
  return "Active";
}

const statusStyle = {
  Active:        "bg-emerald-100 text-emerald-700 border border-emerald-300",
  "Expiring Soon":"bg-amber-100  text-amber-700  border border-amber-300",
  Expired:       "bg-red-100    text-red-700    border border-red-300",
};

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icons = {
  Assets:   () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
  Contract: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Clock:    () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Expired:  () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Bell:     () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Eye:      () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Edit:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Plus:     () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  History:  () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon: Icon, accent, bg }) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-md p-5 flex flex-col gap-3 border border-white/60"
         style={{ background: bg }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide uppercase" style={{ color: "#176B87" }}>{label}</span>
        <div className="rounded-xl p-2" style={{ background: accent + "22" }}>
          <div style={{ color: accent }}><Icon /></div>
        </div>
      </div>
      <p className="text-4xl font-extrabold" style={{ color: "#088395", fontFamily: "'DM Serif Display', Georgia, serif" }}>{value}</p>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10" style={{ background: accent }} />
    </div>
  );
}

function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="rounded-lg p-2 shadow-sm" style={{ background: "#D1F8EF", color: "#088395" }}>
        <Icon />
      </div>
      <h2 className="text-xl font-bold tracking-tight" style={{ color: "#176B87", fontFamily: "'DM Serif Display', Georgia, serif" }}>
        {title}
      </h2>
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange, options }) {
  const base = "w-full rounded-xl border border-[#a8cdd5] bg-white/80 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#088395]/40 focus:border-[#088395] transition-all placeholder-gray-400";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-[#176B87]">{label}</label>
      {options ? (
        <select name={name} value={value} onChange={onChange} className={base}>
          <option value="">Select…</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange}
               placeholder={`Enter ${label.toLowerCase()}`} className={base} />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AMCDashboard() {
  const [contracts, setContracts]   = useState(mockContracts);
  const [formOpen,  setFormOpen]    = useState(false);
  const [form, setForm] = useState({
    id: "", category: "", vendor: "", type: "", start: "", end: "", cost: "", contact: ""
  });
  const [search, setSearch] = useState("");

  // Summary stats
  const total       = contracts.length;
  const active      = contracts.filter(c => getStatus(c.end) === "Active").length;
  const expiring    = contracts.filter(c => getStatus(c.end) === "Expiring Soon").length;
  const expired     = contracts.filter(c => getStatus(c.end) === "Expired").length;

  const filtered = contracts.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.vendor.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    if (!form.id || !form.vendor || !form.start || !form.end) return;
    setContracts(p => [{ ...form, cost: Number(form.cost) }, ...p]);
    setForm({ id: "", category: "", vendor: "", type: "", start: "", end: "", cost: "", contact: "" });
    setFormOpen(false);
  }

  const alertList = contracts
    .map(c => ({ ...c, days: daysLeft(c.end) }))
    .filter(c => c.days >= 0 && c.days <= 30)
    .sort((a, b) => a.days - b.days);

  return (
    <>
      {/* Google Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #EBF4F6; }
        ::-webkit-scrollbar-thumb { background: #a8cdd5; border-radius: 99px; }
        .fade-in { animation: fadeUp .4s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .card-hover { transition: transform .2s ease, box-shadow .2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(8,131,149,.13); }
      `}</style>

      <div className="min-h-screen" style={{ background: "linear-gradient(145deg, #EBF4F6 0%, #c8e4ea 40%, #D1F8EF 100%)" }}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-[#a8cdd5]/40 shadow-sm"
                style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)" }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl p-2.5 shadow" style={{ background: "linear-gradient(135deg,#088395,#176B87)" }}>
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold leading-tight"
                    style={{ color: "#088395", fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  AMC Tracking Dashboard
                </h1>
                <p className="text-xs text-[#176B87]/70 font-medium">
                  Institutional Asset Management System · {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {alertList.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold"
                     style={{ background: "#fff3cd", color: "#856404" }}>
                  <Icons.Bell />
                  {alertList.length} expiry alert{alertList.length > 1 ? "s" : ""}
                </div>
              )}
              <button onClick={() => setFormOpen(o => !o)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#088395,#176B87)" }}>
                <Icons.Plus />
                Add Contract
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* ── Summary Cards ─────────────────────────────────────── */}
          <section className="fade-in grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Assets Under AMC" value={total}   icon={Icons.Assets}   accent="#088395" bg="linear-gradient(135deg,#D1F8EF,#c8f5ec)" />
            <SummaryCard label="Active AMC Contracts"   value={active}  icon={Icons.Contract} accent="#3674B5" bg="linear-gradient(135deg,#EBF4F6,#c8e4ea)" />
            <SummaryCard label="AMC Expiring Soon"      value={expiring} icon={Icons.Clock}   accent="#d97706" bg="linear-gradient(135deg,#fffbeb,#fef3c7)" />
            <SummaryCard label="Expired AMC"            value={expired} icon={Icons.Expired}  accent="#dc2626" bg="linear-gradient(135deg,#fff5f5,#fee2e2)" />
          </section>

          {/* ── Add AMC Contract Form ─────────────────────────────── */}
          {formOpen && (
            <section className="fade-in rounded-2xl border border-[#a8cdd5]/50 shadow-lg p-6"
                     style={{ background: "rgba(255,255,255,0.97)" }}>
              <SectionHeader title="Add AMC Contract" icon={Icons.Plus} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="Asset ID"       name="id"       value={form.id}       onChange={handleChange} />
                <InputField label="Asset Category" name="category" value={form.category} onChange={handleChange}
                            options={["Computer","Printer","Scanner","Server","AC Unit","Oscilloscope","Projector","UPS","Other"]} />
                <InputField label="AMC Vendor"     name="vendor"   value={form.vendor}   onChange={handleChange} />
                <InputField label="AMC Type"       name="type"     value={form.type}     onChange={handleChange}
                            options={["Comprehensive","Non-Comprehensive"]} />
                <InputField label="AMC Start Date" name="start"    value={form.start}    onChange={handleChange} type="date" />
                <InputField label="AMC End Date"   name="end"      value={form.end}      onChange={handleChange} type="date" />
                <InputField label="AMC Cost (₹)"   name="cost"     value={form.cost}     onChange={handleChange} type="number" />
                <InputField label="Vendor Contact"  name="contact"  value={form.contact}  onChange={handleChange} type="tel" />
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setFormOpen(false)}
                  className="px-5 py-2 rounded-xl border border-[#a8cdd5] text-sm font-semibold text-[#176B87] bg-white hover:bg-[#EBF4F6] transition">
                  Cancel
                </button>
                <button onClick={handleSubmit}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white shadow transition active:scale-95"
                  style={{ background: "linear-gradient(135deg,#088395,#176B87)" }}>
                  Add AMC Contract
                </button>
              </div>
            </section>
          )}

          {/* ── Expiry Alert Panel ────────────────────────────────── */}
          {alertList.length > 0 && (
            <section className="fade-in rounded-2xl border border-amber-200 shadow-md overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-3" style={{ background: "#fffbeb" }}>
                <Icons.Bell />
                <h2 className="text-base font-bold text-amber-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  AMC Expiry Alerts
                </h2>
              </div>
              <div className="divide-y divide-amber-100" style={{ background: "rgba(255,251,235,0.6)" }}>
                {alertList.map(a => (
                  <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 text-lg">⚠</span>
                      <div>
                        <span className="font-semibold text-amber-900 text-sm">AMC Expiring Soon</span>
                        <span className="mx-2 text-amber-400">–</span>
                        <span className="font-bold text-[#176B87] text-sm">{a.id}</span>
                        <span className="mx-2 text-amber-400">–</span>
                        <span className="text-sm text-amber-700">Vendor: <strong>{a.vendor}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-amber-600 text-xs">Expires: {a.end}</span>
                      <span className="rounded-full px-3 py-0.5 font-bold text-xs"
                            style={{ background: a.days <= 10 ? "#fee2e2" : "#fef3c7",
                                     color: a.days <= 10 ? "#dc2626" : "#92400e" }}>
                        {a.days} day{a.days !== 1 ? "s" : ""} remaining
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Contracts Table ───────────────────────────────────── */}
          <section className="fade-in rounded-2xl border border-[#a8cdd5]/40 shadow-md overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.97)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-[#EBF4F6]">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2" style={{ background: "#D1F8EF", color: "#088395" }}><Icons.Contract /></div>
                <h2 className="text-xl font-bold" style={{ color: "#176B87", fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  AMC Contracts
                </h2>
              </div>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, vendor, category…"
                className="rounded-xl border border-[#a8cdd5] bg-[#EBF4F6] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#088395]/40 w-full sm:w-64"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#EBF4F6" }}>
                    {["Asset ID","Category","Vendor","Type","Start Date","End Date","Cost (₹)","Status","Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                          style={{ color: "#176B87" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBF4F6]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No contracts found.</td></tr>
                  ) : filtered.map((c, i) => {
                    const st = getStatus(c.end);
                    return (
                      <tr key={c.id + i} className="card-hover group transition-colors hover:bg-[#EBF4F6]/50">
                        <td className="px-4 py-3 font-bold text-[#088395]">{c.id}</td>
                        <td className="px-4 py-3 text-gray-600">{c.category}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{c.vendor}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{c.type || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{c.start}</td>
                        <td className="px-4 py-3 text-gray-500">{c.end}</td>
                        <td className="px-4 py-3 font-semibold text-gray-700">₹{Number(c.cost).toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[st]}`}>{st}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-white transition active:scale-95"
                                    style={{ background: "#088395" }}>
                              <Icons.Eye /> View
                            </button>
                            <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-white transition active:scale-95"
                                    style={{ background: "#3674B5" }}>
                              <Icons.Edit /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-[#EBF4F6] text-xs text-gray-400 flex justify-between">
              <span>Showing {filtered.length} of {contracts.length} contracts</span>
              <span>Last updated: {new Date().toLocaleDateString("en-IN")}</span>
            </div>
          </section>

          {/* ── Maintenance History ───────────────────────────────── */}
          <section className="fade-in rounded-2xl border border-[#a8cdd5]/40 shadow-md overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.97)" }}>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#EBF4F6]">
              <div className="rounded-lg p-2" style={{ background: "#D1F8EF", color: "#088395" }}><Icons.History /></div>
              <h2 className="text-xl font-bold" style={{ color: "#176B87", fontFamily: "'DM Serif Display', Georgia, serif" }}>
                Maintenance History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#EBF4F6" }}>
                    {["Asset ID","Service Date","Issue","Technician","Cost (₹)"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                          style={{ color: "#176B87" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBF4F6]">
                  {mockHistory.map((h, i) => (
                    <tr key={i} className="transition-colors hover:bg-[#EBF4F6]/50">
                      <td className="px-4 py-3 font-bold text-[#088395]">{h.assetId}</td>
                      <td className="px-4 py-3 text-gray-500">{h.date}</td>
                      <td className="px-4 py-3 text-gray-700">{h.issue}</td>
                      <td className="px-4 py-3 font-medium text-gray-700">{h.tech}</td>
                      <td className="px-4 py-3 font-semibold text-gray-700">₹{h.cost.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Footer ────────────────────────────────────────────── */}
          <footer className="text-center text-xs py-4" style={{ color: "#176B87", opacity: 0.6 }}>
            AMC Tracking Dashboard · Institutional Asset Management System · {new Date().getFullYear()}
          </footer>
        </main>
      </div>
    </>
  );
}