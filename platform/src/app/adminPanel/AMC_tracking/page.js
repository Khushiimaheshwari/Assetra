"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/app/adminPanel/components/Admin_Sidebar"; // ← ADDED

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockContracts = [
  { id: "LAB16-PC3",  category: "Computer",     vendor: "Microtek",    type: "Comprehensive",     start: "2024-01-10", end: "2025-03-24", cost: 18000, contact: "9876543210" },
  { id: "SCI12-PR1",  category: "Printer",      vendor: "HP Services", type: "Non-Comprehensive",  start: "2024-03-01", end: "2025-08-01", cost: 12000, contact: "9812345670" },
  { id: "LAB08-SC2",  category: "Scanner",      vendor: "Canon Care",  type: "Comprehensive",     start: "2023-07-15", end: "2024-12-31", cost: 9500,  contact: "9900112233" },
  { id: "ADMIN-AC5",  category: "AC Unit",      vendor: "BlueStar",    type: "Comprehensive",     start: "2024-02-01", end: "2025-04-10", cost: 22000, contact: "9988776655" },
  { id: "LAB02-SV1",  category: "Server",       vendor: "Dell Tech",   type: "Comprehensive",     start: "2024-06-01", end: "2026-05-31", cost: 85000, contact: "9111223344" },
  { id: "PHY05-OS1",  category: "Oscilloscope", vendor: "Tektronix",   type: "Non-Comprehensive",  start: "2023-11-01", end: "2025-03-30", cost: 31000, contact: "9222334455" },
];

const mockHistory = [
  { assetId: "LAB16-PC3",  date: "2025-01-15", issue: "Fan replacement & cleaning",      tech: "Ravi Kumar",   cost: 1200 },
  { assetId: "SCI12-PR1",  date: "2025-02-03", issue: "Cartridge jam + roller fix",       tech: "Anita Shah",   cost: 850  },
  { assetId: "LAB08-SC2",  date: "2024-11-20", issue: "Sensor calibration",               tech: "Deepak Nair",  cost: 2000 },
  { assetId: "ADMIN-AC5",  date: "2025-01-28", issue: "Gas refill & compressor check",    tech: "Suresh Patel", cost: 3500 },
  { assetId: "PHY05-OS1",  date: "2025-02-22", issue: "Display flicker – board replaced", tech: "Meena Joshi",  cost: 7800 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysLeft(end) { return Math.ceil((new Date(end) - new Date()) / 86400000); }
function getStatus(end) {
  const d = daysLeft(end);
  if (d < 0)   return "Expired";
  if (d <= 30) return "Expiring Soon";
  return "Active";
}

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const BellIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);
const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
  </svg>
);
const EyeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
);
const EditIcon = ({ size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
);

// ─── InputField ───────────────────────────────────────────────────────────────
function InputField({ label, name, type = "text", value, onChange, options, isMobile }) {
  const inputStyle = {
    width: '100%',
    borderRadius: '10px',
    border: '1px solid rgba(8, 131, 149, 0.25)',
    backgroundColor: '#EBF4F6',
    padding: '10px 14px',
    fontSize: isMobile ? '13px' : '14px',
    color: '#176B87',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#176B87',
    marginBottom: '6px',
    display: 'block',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {options ? (
        <select name={name} value={value} onChange={onChange} style={inputStyle}>
          <option value="">Select…</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange}
               placeholder={`Enter ${label.toLowerCase()}`} style={inputStyle} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AMCDashboard() {
  const [contracts, setContracts] = useState(mockContracts);
  const [formOpen,  setFormOpen]  = useState(false);
  const [search,    setSearch]    = useState("");
  const [isMobile,  setIsMobile]  = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [form, setForm] = useState({
    id: "", category: "", vendor: "", type: "",
    start: "", end: "", cost: "", contact: "",
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Derived values ──
  const total    = contracts.length;
  const active   = contracts.filter(c => getStatus(c.end) === "Active").length;
  const expiring = contracts.filter(c => getStatus(c.end) === "Expiring Soon").length;
  const expired  = contracts.filter(c => getStatus(c.end) === "Expired").length;

  const filtered = contracts.filter(c =>
    [c.id, c.vendor, c.category].some(v =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  const alertList = contracts
    .map(c => ({ ...c, days: daysLeft(c.end) }))
    .filter(c => c.days >= 0 && c.days <= 30)
    .sort((a, b) => a.days - b.days);

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); }
  function handleSubmit() {
    if (!form.id || !form.vendor || !form.start || !form.end) return;
    setContracts(p => [{ ...form, cost: Number(form.cost) }, ...p]);
    setForm({ id: "", category: "", vendor: "", type: "", start: "", end: "", cost: "", contact: "" });
    setFormOpen(false);
  }

  // ── Styles (matching existing Dashboard pattern exactly) ──
  const containerStyle = {
    width: isMobile ? '100%' : 'calc(100% - 255px)',
    minHeight: '100vh',
    backgroundColor: '#EBF4F6',
    padding: isMobile ? '1rem' : '2rem',
    marginLeft: isMobile ? '0' : '255px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    overflowX: 'hidden',
  };

  const headerStyle = {
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '3px solid #088395',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  const titleStyle = {
    fontSize: isMobile ? '1.75rem' : '2.25rem',
    fontWeight: '800',
    color: '#176B87',
    margin: 0,
    letterSpacing: '-0.5px',
  };

  const summaryGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: '1.25rem',
    marginBottom: '2rem',
  };

  const cardBase = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '1.25rem' : '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
    border: '1px solid rgba(8, 131, 149, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
  };

  const sectionCardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '1.25rem' : '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
    border: '1px solid rgba(8, 131, 149, 0.1)',
    marginBottom: '1.5rem',
    overflowX: 'auto',
  };

  const sectionTitleStyle = {
    fontSize: isMobile ? '1.1rem' : '1.25rem',
    fontWeight: '700',
    color: '#176B87',
    marginBottom: '0.35rem',
  };

  const sectionHeaderStyle = {
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #D1F8EF',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: isMobile ? '0.8rem' : '0.9rem',
  };

  const thStyle = {
    padding: isMobile ? '0.75rem' : '1rem 1.25rem',
    textAlign: 'left',
    fontWeight: '700',
    color: '#176B87',
    borderBottom: '2px solid #088395',
    textTransform: 'uppercase',
    fontSize: isMobile ? '0.7rem' : '0.8rem',
    letterSpacing: '0.5px',
    backgroundColor: '#D1F8EF',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: isMobile ? '0.75rem' : '1rem 1.25rem',
    color: '#176B87',
    borderBottom: '1px solid #D1F8EF',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  };

  const iconSize = isMobile ? '40px' : '48px';

  const summaryCards = [
    { label: 'Total Assets Under AMC', value: total,    bg: '#D1F8EF',                    icon: '#088395',
      svg: <svg width={isMobile?"20":"24"} height={isMobile?"20":"24"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd"/></svg> },
    { label: 'Active AMC Contracts',   value: active,   bg: 'rgba(134,182,246,0.2)',      icon: '#3674B5',
      svg: <svg width={isMobile?"20":"24"} height={isMobile?"20":"24"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg> },
    { label: 'AMC Expiring Soon',      value: expiring, bg: 'rgba(251,191,36,0.15)',      icon: '#d97706',
      svg: <svg width={isMobile?"20":"24"} height={isMobile?"20":"24"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg> },
    { label: 'Expired AMC',            value: expired,  bg: 'rgba(239,68,68,0.12)',       icon: '#dc2626',
      svg: <svg width={isMobile?"20":"24"} height={isMobile?"20":"24"} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg> },
  ];

  const statusStyle = (st) => {
    const base = { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '99px', whiteSpace: 'nowrap' };
    if (st === "Active")        return { ...base, background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' };
    if (st === "Expiring Soon") return { ...base, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
    return                             { ...base, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
  };

  // ── ADDED: fragment wrapper + <AdminSidebar /> ──
  return (
    <>
      <AdminSidebar />

      <div style={containerStyle}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>AMC Tracking Dashboard</h1>
            <p style={{ margin: '4px 0 0', fontSize: isMobile ? '12px' : '13px', color: '#3674B5', fontWeight: '500' }}>
              Institutional Asset Management System · {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
              {alertList.length > 0 && (
                <span style={{ marginLeft: '12px', color: '#d97706', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <BellIcon size={14} /> {alertList.length} expiry alert{alertList.length > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setFormOpen(o => !o)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(8,131,149,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 4px 12px rgba(8,131,149,0.25)'; }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: isMobile ? '9px 16px' : '10px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#088395,#176B87)', color: 'white', fontSize: isMobile ? '13px' : '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(8,131,149,0.25)', transition: 'all 0.2s ease' }}
          >
            <PlusIcon size={isMobile ? 16 : 18} /> Add Contract
          </button>
        </header>

        {/* ── Summary Cards ───────────────────────────────────────────── */}
        <div style={summaryGridStyle}>
          {summaryCards.map((c, i) => (
            <div
              key={i}
              style={cardBase}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8,131,149,0.2), 0 4px 6px -2px rgba(8,131,149,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: '600', color: '#176B87', textTransform: 'uppercase', letterSpacing: '0.5px', maxWidth: '120px', lineHeight: '1.3' }}>{c.label}</div>
                <div style={{ width: iconSize, height: iconSize, borderRadius: '12px', backgroundColor: c.bg, color: c.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.svg}
                </div>
              </div>
              <div style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: '800', color: '#088395', letterSpacing: '-1px' }}>{c.value}</div>
              {/* decorative circle */}
              <div style={{ position: 'absolute', bottom: '-16px', right: '-16px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: c.icon, opacity: 0.07 }} />
            </div>
          ))}
        </div>

        {/* ── Add Contract Form ────────────────────────────────────────── */}
        {formOpen && (
          <div style={{ ...sectionCardStyle, marginBottom: '1.5rem' }}>
            <div style={sectionHeaderStyle}>
              <div style={sectionTitleStyle}>New AMC Contract</div>
              <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#3674B5', fontWeight: '500' }}>Fill in the details below</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(1,1fr)' : 'repeat(4,1fr)', gap: '1rem' }}>
              <InputField label="Asset ID"       name="id"       value={form.id}       onChange={handleChange} isMobile={isMobile} />
              <InputField label="Asset Category" name="category" value={form.category} onChange={handleChange} isMobile={isMobile}
                          options={["Computer","Printer","Scanner","Server","AC Unit","Oscilloscope","Projector","UPS","Other"]} />
              <InputField label="AMC Vendor"     name="vendor"   value={form.vendor}   onChange={handleChange} isMobile={isMobile} />
              <InputField label="AMC Type"       name="type"     value={form.type}     onChange={handleChange} isMobile={isMobile}
                          options={["Comprehensive","Non-Comprehensive"]} />
              <InputField label="Start Date"     name="start"    value={form.start}    onChange={handleChange} isMobile={isMobile} type="date" />
              <InputField label="End Date"       name="end"      value={form.end}      onChange={handleChange} isMobile={isMobile} type="date" />
              <InputField label="Cost (₹)"       name="cost"     value={form.cost}     onChange={handleChange} isMobile={isMobile} type="number" />
              <InputField label="Vendor Contact" name="contact"  value={form.contact}  onChange={handleChange} isMobile={isMobile} type="tel" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1.25rem' }}>
              <button
                onClick={() => setFormOpen(false)}
                style={{ padding: '9px 20px', borderRadius: '10px', border: '1px solid rgba(8,131,149,0.3)', background: 'white', color: '#176B87', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                style={{ padding: '9px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#088395,#176B87)', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(8,131,149,0.25)', transition: 'all 0.2s' }}
              >
                Add Contract
              </button>
            </div>
          </div>
        )}

        {/* ── Expiry Alerts ────────────────────────────────────────────── */}
        {alertList.length > 0 && (
          <div style={{ backgroundColor: '#fffbeb', borderRadius: '16px', border: '1px solid #fde68a', marginBottom: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(8,131,149,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '12px 16px' : '14px 20px', borderBottom: '1px solid #fde68a', backgroundColor: '#fef9c3' }}>
              <BellIcon size={16} />
              <span style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: '700', color: '#92400e' }}>AMC Expiry Alerts</span>
              <span style={{ marginLeft: 'auto', background: '#fde68a', color: '#92400e', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '99px' }}>
                {alertList.length}
              </span>
            </div>
            <div>
              {alertList.map((a, i) => (
                <div key={a.id} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '12px 20px', borderBottom: i < alertList.length - 1 ? '1px solid #fef3c7' : 'none', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#d97706', fontSize: '16px' }}>⚠</span>
                    <span style={{ fontWeight: '700', color: '#176B87', fontSize: isMobile ? '13px' : '14px' }}>{a.id}</span>
                    <span style={{ color: '#d1d5db' }}>·</span>
                    <span style={{ color: '#6b7280', fontSize: isMobile ? '12px' : '13px' }}>{a.vendor}</span>
                    <span style={{ color: '#d1d5db' }}>·</span>
                    <span style={{ color: '#9ca3af', fontSize: isMobile ? '11px' : '12px' }}>Expires {a.end}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '99px', background: a.days <= 10 ? '#fee2e2' : '#fef3c7', color: a.days <= 10 ? '#991b1b' : '#92400e', whiteSpace: 'nowrap' }}>
                    {a.days}d remaining
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Contracts Table ──────────────────────────────────────────── */}
        <div style={sectionCardStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={sectionTitleStyle}>AMC Contracts</div>
                <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#3674B5', fontWeight: '500' }}>All active and historical contracts</div>
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, vendor, category…"
                style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid rgba(8,131,149,0.25)', backgroundColor: '#EBF4F6', fontSize: isMobile ? '12px' : '13px', color: '#176B87', outline: 'none', width: isMobile ? '100%' : '240px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <table style={tableStyle}>
            <thead style={{ backgroundColor: '#D1F8EF' }}>
              <tr>
                {["Asset ID","Category","Vendor","Type","Start Date","End Date","Cost (₹)","Status","Actions"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    No contracts found.
                  </td>
                </tr>
              ) : filtered.map((c, i) => {
                const st = getStatus(c.end);
                return (
                  <tr
                    key={c.id + i}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: hoveredRow === i ? '#D1F8EF' : (i % 2 === 0 ? '#FFFFFF' : '#EBF4F6') }}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={{ ...tdStyle, fontWeight: '700', color: '#088395' }}>{c.id}</td>
                    <td style={tdStyle}>{c.category}</td>
                    <td style={{ ...tdStyle, fontWeight: '600' }}>{c.vendor}</td>
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: isMobile ? '11px' : '13px' }}>{c.type || "—"}</td>
                    <td style={tdStyle}>{c.start}</td>
                    <td style={tdStyle}>{c.end}</td>
                    <td style={{ ...tdStyle, fontWeight: '700', color: '#088395', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                      ₹{Number(c.cost).toLocaleString("en-IN")}
                    </td>
                    <td style={tdStyle}>
                      <span style={statusStyle(st)}>{st}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(8,131,149,0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = 'none'; }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', border: 'none', background: '#088395', color: 'white', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          <EyeIcon /> View
                        </button>
                        <button
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(54,116,181,0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = 'none'; }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', border: 'none', background: '#3674B5', color: 'white', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          <EditIcon /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ padding: isMobile ? '0.75rem 0 0' : '0.75rem 0.25rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', borderTop: '1px solid #D1F8EF', marginTop: '0.5rem' }}>
            <span>Showing {filtered.length} of {contracts.length} contracts</span>
            <span>Last updated: {new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        {/* ── Maintenance History ──────────────────────────────────────── */}
        <div style={sectionCardStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionTitleStyle}>Maintenance History</div>
            <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#3674B5', fontWeight: '500' }}>Past service records</div>
          </div>
          <table style={tableStyle}>
            <thead style={{ backgroundColor: '#D1F8EF' }}>
              <tr>
                {["Asset ID","Service Date","Issue / Work Done","Technician","Cost (₹)"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockHistory.map((h, i) => (
                <tr
                  key={i}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: hoveredRow === `h${i}` ? '#D1F8EF' : (i % 2 === 0 ? '#FFFFFF' : '#EBF4F6') }}
                  onMouseEnter={() => setHoveredRow(`h${i}`)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ ...tdStyle, fontWeight: '700', color: '#088395' }}>{h.assetId}</td>
                  <td style={tdStyle}>{h.date}</td>
                  <td style={{ ...tdStyle, whiteSpace: 'normal' }}>{h.issue}</td>
                  <td style={{ ...tdStyle, fontWeight: '600' }}>{h.tech}</td>
                  <td style={{ ...tdStyle, fontWeight: '700', color: '#088395', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>
                    ₹{h.cost.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
