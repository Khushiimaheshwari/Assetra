"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronDown, Loader2, FileText, Info, Monitor, AlertTriangle } from 'lucide-react';

const emptyBreakdownLabForm = () => ({
  formName: '',
  dateOfReport: '',
  labName: '',
  reportedByName: '',
  reportedByDesignation: '',
  reportedIssue: '',
  equipment: [{ equipmentName: '', brand: '', serialNo: '', reportedIssue: '' }],
  department: '',
  reportedToName: '',
  reportedToDesignation: '',
});

export default function HandoverFormPage() {
  const { status: sessionStatus } = useSession();
  // ── Handover state ──
  const [handoverForms, setHandoverForms] = useState([]);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [loading, setLoading]             = useState(true);

  const [expandedForm, setExpandedForm]   = useState(null);
  const [newHandoverForm, setNewHandoverForm] = useState({
    formName: '', labName: '', handoverDate: '',
    handoverByName: '', handoverByDesignation: '',
    handoverToName: '', handoverToDesignation: '',
    purpose: '',
    equipment: [{ serialNo: '', equipmentType: '', brand: '', remarks: '' }],
    status: 'Pending'
  });

  // ── Breakdown state ──
  const [breakdownForms, setBreakdownForms]       = useState([]);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  const [expandedBreakdown, setExpandedBreakdown] = useState(null);
  const [newBreakdownForm, setNewBreakdownForm] = useState(emptyBreakdownLabForm);

  // ── Responsive ──
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Fetch handover forms ──
  const fetchHandoverForms = async () => {
    try {
      const res = await fetch("/api/handover-forms", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setHandoverForms(data.handoverForms);
      else console.error("Failed to fetch handover forms:", data.error);
    } catch {
      console.error("Network error fetching handover forms.");
    }
  };

  const fetchBreakdownForms = async () => {
    try {
      const res = await fetch("/api/breakdown-forms", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setBreakdownForms(data.breakdownForms);
      else console.error("Failed to fetch breakdown forms:", data.error);
    } catch {
      console.error("Network error fetching breakdown forms.");
    }
  };

  useEffect(() => {
    if (sessionStatus === "loading") return;
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchHandoverForms(), fetchBreakdownForms()]);
      setLoading(false);
    };
    load();
  }, [sessionStatus]);

  // ── Handover helpers ──
  const handleAddEquipment = () =>
    setNewHandoverForm(p => ({ ...p, equipment: [...p.equipment, { serialNo: '', equipmentType: '', brand: '', remarks: '' }] }));

  const handleRemoveEquipment = (i) =>
    setNewHandoverForm(p => ({ ...p, equipment: p.equipment.filter((_, idx) => idx !== i) }));

  const handleEquipmentChange = (i, field, val) => {
    const updated = [...newHandoverForm.equipment];
    updated[i][field] = val;
    setNewHandoverForm(p => ({ ...p, equipment: updated }));
  };

  const handleAddHandoverForm = async () => {
    if (!newHandoverForm.formName || !newHandoverForm.handoverByName || !newHandoverForm.handoverToName) {
      alert("Please fill in all required fields!"); return;
    }
    try {
      const res = await fetch("/api/handover-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newHandoverForm),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Handover form added successfully!");
        setShowAddModal(false);
        setNewHandoverForm({ formName: '', labName: '', handoverDate: '', handoverByName: '', handoverByDesignation: '', handoverToName: '', handoverToDesignation: '', purpose: '', equipment: [{ serialNo: '', equipmentType: '', brand: '', remarks: '' }], status: 'Pending' });
        fetchHandoverForms();
      } else alert(data.error || "Failed to add handover form");
    } catch { alert("Something went wrong."); }
  };

  // ── Breakdown helpers ──
  const handleAddBreakdownEquipment = () =>
    setNewBreakdownForm(p => ({ ...p, equipment: [...p.equipment, { equipmentName: '', brand: '', serialNo: '', reportedIssue: '' }] }));

  const handleRemoveBreakdownEquipment = (i) =>
    setNewBreakdownForm(p => ({ ...p, equipment: p.equipment.filter((_, idx) => idx !== i) }));

  const handleBreakdownEquipmentChange = (i, field, val) => {
    const updated = [...newBreakdownForm.equipment];
    updated[i][field] = val;
    setNewBreakdownForm(p => ({ ...p, equipment: updated }));
  };

  const handleAddBreakdownForm = async () => {
    if (!newBreakdownForm.formName || !newBreakdownForm.reportedByName || !newBreakdownForm.reportedIssue) {
      alert("Please fill in all required fields!"); return;
    }
    const payload = {
      formName: newBreakdownForm.formName,
      dateOfReport: newBreakdownForm.dateOfReport,
      labName: newBreakdownForm.labName,
      reportedByName: newBreakdownForm.reportedByName,
      reportedByDesignation: newBreakdownForm.reportedByDesignation,
      reportedIssue: newBreakdownForm.reportedIssue,
      equipment: newBreakdownForm.equipment,
      department: newBreakdownForm.department,
      reportedToName: newBreakdownForm.reportedToName,
      reportedToDesignation: newBreakdownForm.reportedToDesignation,
    };
    try {
      const res = await fetch("/api/breakdown-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Breakdown report submitted to admin.");
        setShowBreakdownModal(false);
        setNewBreakdownForm(emptyBreakdownLabForm());
        fetchBreakdownForms();
      } else alert(data.error || "Failed to submit breakdown form");
    } catch { alert("Something went wrong."); }
  };

  // ── Design tokens ──
  const C = { primary: '#088395', dark: '#176B87', sky: '#86B6F6', ice: '#EBF4F6', ocean: '#3674B5', mint: '#D1F8EF' };

  const containerStyle = {
    width: (isMobile || isTablet) ? '100%' : 'calc(100% - 255px)',
    minHeight: '100vh', backgroundColor: C.ice,
    padding: (isMobile || isTablet) ? '1rem' : '2rem',
    boxSizing: 'border-box', marginLeft: (isMobile || isTablet) ? '0' : '255px',
    overflowX: 'hidden',
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s', color: '#1f2937', backgroundColor: 'white',
  };

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '700',
    color: C.dark, marginBottom: '6px', letterSpacing: '0.03em',
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'resolved') return { backgroundColor: C.mint,    color: '#065f46' };
    if (s === 'in progress')                   return { backgroundColor: '#dbeafe', color: '#1e40af' };
    if (s === 'referred to vendor')            return { backgroundColor: '#ede9fe', color: '#5b21b6' };
    if (s === 'under observation')             return { backgroundColor: '#fef9c3', color: '#713f12' };
    return                                            { backgroundColor: '#fef3c7', color: '#92400e' };
  };

  const getApprovalStyle = (approvalStatus) => {
    if (approvalStatus === 'pending') return { backgroundColor: '#fef3c7', color: '#92400e' };
    if (approvalStatus === 'approved') return { backgroundColor: C.mint, color: '#065f46' };
    if (approvalStatus === 'rejected') return { backgroundColor: '#fee2e2', color: '#991b1b' };
    return { backgroundColor: '#f3f4f6', color: '#4b5563' };
  };

  // ── Reusable section header ──
  const SectionHeader = ({ icon, title, subtitle, onAdd, addLabel }) => (
    <div style={{
      backgroundColor: 'white', borderRadius: '16px',
      padding: isMobile ? '1.25rem' : '1.75rem 2rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 8px rgba(8,131,149,0.08)',
      borderBottom: `3px solid ${C.primary}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.6rem', fontWeight: '800', color: C.dark, margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
          <p style={{ color: C.primary, fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      {onAdd && (
        <button type="button" onClick={onAdd}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary}
          style={{ padding: '10px 22px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(8,131,149,0.25)' }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {addLabel}
        </button>
      )}
    </div>
  );



  // ── Reusable table column headers ──
  const TableHeader = ({ cols, template }) => (!isMobile && !isTablet) ? (
    <div style={{ display: 'grid', gridTemplateColumns: template, padding: '0.75rem 1.5rem', backgroundColor: 'white', borderRadius: '10px', marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(8,131,149,0.06)', gap: '0.5rem' }}>
      {cols.map((h, i) => (
        <div key={i} style={{ fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i === 0 ? 'left' : 'center' }}>{h}</div>
      ))}
    </div>
  ) : null;

  // ── Status badge ──
  const StatusBadge = ({ status }) => (
    <span style={{ padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px', ...getStatusStyle(status) }}>
      {status}
    </span>
  );

  if (loading || sessionStatus === "loading") {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
          <Loader2 size={48} className="animate-spin" color={C.primary} />
          <p style={{ color: C.dark, fontSize: '16px', fontWeight: '500' }}>Loading forms...</p>
        </div>
      </div>
    );
  }

  const HANDOVER_COLS = 'minmax(300px, 1.5fr) 160px 160px 140px 90px';
  const BREAKDOWN_COLS = 'minmax(300px, 1.5fr) 160px 160px 140px 90px';

  return (
    <div style={containerStyle}>

      {/* ════════════════════════════════════════
          SECTION 1 — EQUIPMENT HANDOVER FORMS
      ════════════════════════════════════════ */}
      <SectionHeader
        icon={<FileText size={24} color={C.primary} />}
        title="Equipment Handover Forms"
        subtitle="Submit handovers for admin approval"
        onAdd={() => setShowAddModal(true)}
        addLabel="Add New"
      />

      <TableHeader cols={['Form Details', 'Handover By', 'Handover To', 'Status', 'Actions']} template={HANDOVER_COLS} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        {handoverForms.length > 0 ? handoverForms.map((form, index) => (
          <div key={form._id} style={{ backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '1rem' : '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(8,131,149,0.07)', borderLeft: `4px solid ${C.primary}` }}>
            <div style={{ display: (isMobile || isTablet) ? 'flex' : 'grid', gridTemplateColumns: HANDOVER_COLS, flexDirection: (isMobile || isTablet) ? 'column' : undefined, alignItems: (isMobile || isTablet) ? undefined : 'center', gap: '0.75rem' }}>
              {/* Form info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '800', fontSize: '14px', color: C.primary }}>H{index + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.formName}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{form.labName || 'Lab not specified'} · {form.handoverDate}</p>
                </div>
              </div>
              {/* By */}
              <div style={{ textAlign: (isMobile || isTablet) ? 'left' : 'center' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{form.handoverByName}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{form.handoverByDesignation}</p>
              </div>
              {/* To */}
              <div style={{ textAlign: (isMobile || isTablet) ? 'left' : 'center' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{form.handoverToName}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{form.handoverToDesignation}</p>
              </div>
              {/* Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center', alignItems: (isMobile || isTablet) ? 'flex-start' : 'center' }}>
                <StatusBadge status={form.status} />
                {form.approvalStatus && form.approvalStatus !== 'not_required' && (
                  <span style={{ padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', ...getApprovalStyle(form.approvalStatus) }}>
                    {form.approvalStatus === 'pending' ? 'Awaiting approval' : form.approvalStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: (isMobile || isTablet) ? 'flex-start' : 'center', alignItems: 'center' }}>
                <button onClick={() => setExpandedForm(expandedForm === form._id ? null : form._id)}
                  style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: expandedForm === form._id ? 'rotate(180deg)' : 'rotate(0deg)', color: C.dark }}>
                  <ChevronDown size={16} />
                </button>
                <button onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                  style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill={C.primary}><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </button>
                <button onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                  style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>

            {/* Expanded handover */}
            {expandedForm === form._id && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.ice}` }}>
                {form.approvalStatus === 'pending' && (
                  <div style={{ backgroundColor: '#fffbeb', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', border: '1px solid #fde68a' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#92400e' }}>Waiting for admin approval before this handover is final.</p>
                  </div>
                )}
                {form.approvalStatus === 'rejected' && form.rejectionReason && (
                  <div style={{ backgroundColor: '#fef2f2', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>Rejection reason</p>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#374151' }}>{form.rejectionReason}</p>
                  </div>
                )}
                <div style={{ backgroundColor: C.mint, borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Info size={14} color="#065f46" />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Information</span>
                  </div>
                  {[{ label: 'Lab Name/Number', value: form.labName || 'N/A' }, { label: 'Purpose of Handover', value: form.purpose || 'N/A' }, { label: 'Date of Handover', value: form.handoverDate }].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? `1px solid rgba(6,95,70,0.1)` : 'none' }}>
                      <span style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>{row.label}</span>
                      <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                {form.equipment?.length > 0 && (
                  <div style={{ backgroundColor: C.ice, borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Monitor size={14} color={C.primary} />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware Details</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 10px', backgroundColor: C.primary, color: 'white', borderRadius: '20px', fontWeight: '700' }}>{form.equipment.length} item{form.equipment.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'white' }}>
                            {['S.No.', 'Equipment Type', 'Brand/Model', 'Serial No.', 'Remarks'].map((h, i) => (
                              <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: C.dark, borderBottom: `2px solid ${C.primary}`, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {form.equipment.map((item, idx) => (
                            <tr key={idx} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'white'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} style={{ transition: 'background 0.15s' }}>
                              <td style={{ padding: '8px 12px', color: C.dark, fontWeight: '700', borderBottom: `1px solid ${C.ice}` }}>{idx + 1}</td>
                              <td style={{ padding: '8px 12px', color: '#374151', borderBottom: `1px solid ${C.ice}` }}>{item.equipmentType}</td>
                              <td style={{ padding: '8px 12px', color: '#374151', borderBottom: `1px solid ${C.ice}` }}>{item.brand}</td>
                              <td style={{ padding: '8px 12px', color: '#374151', borderBottom: `1px solid ${C.ice}` }}>{item.serialNo}</td>
                              <td style={{ padding: '8px 12px', color: '#374151', borderBottom: `1px solid ${C.ice}` }}>{item.remarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(8,131,149,0.07)' }}>
            <FileText size={40} color={C.sky} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '600', color: C.dark, marginBottom: '0.5rem' }}>No handover forms found.</p>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Click <strong>Add New</strong> to create your first handover form.</p>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          SECTION 2 — BREAKDOWN FORMS
      ════════════════════════════════════════ */}
      <SectionHeader
        icon={<AlertTriangle size={24} color={C.primary} />}
        title="Breakdown Forms"
        subtitle="Report equipment failures — admin will record resolution and closure"
        onAdd={() => setShowBreakdownModal(true)}
        addLabel="Report breakdown"
      />

      <TableHeader cols={['Form Details', 'Reported By', 'Reported To', 'Status', 'Actions']} template={BREAKDOWN_COLS} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {breakdownForms.length > 0 ? breakdownForms.map((form, index) => (
          <div key={form._id} style={{ backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '1rem' : '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(8,131,149,0.07)', borderLeft: `4px solid #f59e0b` }}>
            <div style={{ display: (isMobile || isTablet) ? 'flex' : 'grid', gridTemplateColumns: BREAKDOWN_COLS, flexDirection: (isMobile || isTablet) ? 'column' : undefined, alignItems: (isMobile || isTablet) ? undefined : 'center', gap: '0.75rem' }}>
              {/* Form info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '800', fontSize: '14px', color: '#92400e' }}>B{index + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.formName}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{form.labName || 'Lab not specified'} · {form.dateOfReport}</p>
                </div>
              </div>
              {/* Reported By */}
              <div style={{ textAlign: (isMobile || isTablet) ? 'left' : 'center' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{form.reportedByName}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{form.reportedByDesignation}</p>
              </div>
              {/* Reported To */}
              <div style={{ textAlign: (isMobile || isTablet) ? 'left' : 'center' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{form.reportedToName}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{form.reportedToDesignation}</p>
              </div>
              {/* Status */}
              <div style={{ display: 'flex', justifyContent: (isMobile || isTablet) ? 'flex-start' : 'center' }}>
                <StatusBadge status={form.finalStatus || form.status} />
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: (isMobile || isTablet) ? 'flex-start' : 'center', alignItems: 'center' }}>
                <button onClick={() => setExpandedBreakdown(expandedBreakdown === form._id ? null : form._id)}
                  style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: expandedBreakdown === form._id ? 'rotate(180deg)' : 'rotate(0deg)', color: C.dark }}>
                  <ChevronDown size={16} />
                </button>
                <button onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                  style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill={C.primary}><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </button>
                <button onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                  style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>

            {/* Expanded breakdown */}
            {expandedBreakdown === form._id && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.ice}` }}>

                {/* General Info */}
                <div style={{ backgroundColor: '#fef3c7', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Info size={14} color="#92400e" />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Information</span>
                  </div>
                  {[
                    { label: 'Date of Report',    value: form.dateOfReport       || 'N/A' },
                    { label: 'Lab Name/Number',   value: form.labName            || 'N/A' },
                    { label: 'Reported Issue',    value: form.reportedIssue      || 'N/A' },
                    { label: 'Department',        value: form.department         || 'N/A' },
                  ].map((row, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < arr.length - 1 ? `1px solid rgba(146,64,14,0.1)` : 'none' }}>
                      <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>{row.label}</span>
                      <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500', maxWidth: '60%', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Hardware Details */}
                {form.equipment?.length > 0 && (
                  <div style={{ backgroundColor: C.ice, borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Monitor size={14} color={C.primary} />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware Details</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 10px', backgroundColor: C.primary, color: 'white', borderRadius: '20px', fontWeight: '700' }}>{form.equipment.length} item{form.equipment.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'white' }}>
                            {['S.No.', 'Equipment Name', 'Brand/Model', 'Serial No.', 'Reported Issue'].map((h, i) => (
                              <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: C.dark, borderBottom: `2px solid ${C.primary}`, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {form.equipment.map((item, idx) => (
                            <tr key={idx} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'white'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} style={{ transition: 'background 0.15s' }}>
                              <td style={{ padding: '8px 12px', color: C.dark, fontWeight: '700', borderBottom: `1px solid ${C.ice}` }}>{idx + 1}</td>
                              <td style={{ padding: '8px 12px', color: '#374151', borderBottom: `1px solid ${C.ice}` }}>{item.equipmentName}</td>
                              <td style={{ padding: '8px 12px', color: '#374151', borderBottom: `1px solid ${C.ice}` }}>{item.brand}</td>
                              <td style={{ padding: '8px 12px', color: '#374151', borderBottom: `1px solid ${C.ice}` }}>{item.serialNo}</td>
                              <td style={{ padding: '8px 12px', color: '#374151', borderBottom: `1px solid ${C.ice}` }}>{item.reportedIssue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Resolution */}
                <div style={{ backgroundColor: C.mint, borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Info size={14} color="#065f46" />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolution & Verification</span>
                  </div>
                  {[
                    { label: 'Action Taken', value: form.actionTaken || 'N/A' },
                    { label: 'Date of Resolution', value: form.dateOfResolution || 'N/A' },
                    { label: 'Resolution Remarks', value: form.resolutionRemarks || 'N/A' },
                    { label: 'Verified By (Admin)', value: form.verifiedByAdmin || 'N/A' },
                    { label: 'Verified By (Name)', value: form.verifiedByName || 'N/A' },
                    { label: 'Verified Date', value: form.verifiedByDate || 'N/A' },
                    { label: 'Final Status', value: form.finalStatus || 'N/A' },
                    { label: 'Closure Remarks', value: form.closureRemarks || 'N/A' },
                    { label: 'Approved By (Dean)', value: form.approvedBy || 'N/A' },
                  ].map((row, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < arr.length - 1 ? `1px solid rgba(6,95,70,0.1)` : 'none' }}>
                      <span style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>{row.label}</span>
                      <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500', maxWidth: '60%', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(8,131,149,0.07)' }}>
            <AlertTriangle size={40} color={C.sky} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '600', color: C.dark, marginBottom: '0.5rem' }}>No breakdown forms found.</p>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Click <strong>Add New</strong> to create your first breakdown form.</p>
          </div>
        )}
      </div>


      {/* ════════════════════════════════════════
          HANDOVER ADD MODAL
      ════════════════════════════════════════ */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? '1rem' : '0' }} onClick={() => setShowAddModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '0 1.25rem 1.25rem' : '0 2rem 1.5rem', width: isMobile ? '100%' : '90%', maxWidth: '760px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(8,131,149,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem', borderBottom: `2px solid ${C.ice}`, marginBottom: '1.25rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} color={C.primary} />
              </div>
              <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '800', color: C.dark, margin: 0 }}>Equipment Handover Form</h2>
              <button onClick={() => setShowAddModal(false)} style={{ marginLeft: 'auto', background: C.ice, border: 'none', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* General Info */}
            <div style={{ backgroundColor: C.mint, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <Info size={15} color="#065f46" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. General Information</span>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ ...labelStyle, color: '#065f46' }}>Form Name *</label>
                <input type="text" style={inputStyle} value={newHandoverForm.formName} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, formName: e.target.value })} placeholder="Enter form name" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div><label style={{ ...labelStyle, color: '#065f46' }}>Date of Handover *</label><input type="date" style={inputStyle} value={newHandoverForm.handoverDate} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverDate: e.target.value })} onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
                <div><label style={{ ...labelStyle, color: '#065f46' }}>Lab Name/Number</label><input type="text" style={inputStyle} value={newHandoverForm.labName} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, labName: e.target.value })} placeholder="Enter lab name" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div><label style={{ ...labelStyle, color: '#065f46' }}>Handover From (Name) *</label><input type="text" style={inputStyle} value={newHandoverForm.handoverByName} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverByName: e.target.value })} placeholder="Enter name" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
                <div><label style={{ ...labelStyle, color: '#065f46' }}>Designation</label><input type="text" style={inputStyle} value={newHandoverForm.handoverByDesignation} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverByDesignation: e.target.value })} placeholder="Enter designation" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div><label style={{ ...labelStyle, color: '#065f46' }}>Handover To (Name) *</label><input type="text" style={inputStyle} value={newHandoverForm.handoverToName} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverToName: e.target.value })} placeholder="Enter name" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
                <div><label style={{ ...labelStyle, color: '#065f46' }}>Designation</label><input type="text" style={inputStyle} value={newHandoverForm.handoverToDesignation} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverToDesignation: e.target.value })} placeholder="Enter designation" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
              </div>
              <div><label style={{ ...labelStyle, color: '#065f46' }}>Purpose of Handover</label><input type="text" style={inputStyle} value={newHandoverForm.purpose} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, purpose: e.target.value })} placeholder="Enter purpose" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
            </div>

            {/* Hardware */}
            <div style={{ backgroundColor: C.ice, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <Monitor size={15} color={C.primary} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Hardware Details</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ backgroundColor: 'white' }}>{['S.No.', 'Equipment Type', 'Brand/Model', 'Serial No.', 'Remarks', 'Action'].map((h, i) => (<th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', color: C.dark, borderBottom: `2px solid ${C.primary}`, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {newHandoverForm.equipment.map((item, index) => (
                      <tr key={index} style={{ borderBottom: `1px solid ${C.ice}` }}>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: C.dark }}>{index + 1}</td>
                        {['equipmentType', 'brand', 'serialNo', 'remarks'].map((field) => (
                          <td key={field} style={{ padding: '6px 8px' }}>
                            <input type="text" style={{ width: '100%', padding: '7px 10px', border: `1.5px solid #e2e8f0`, borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', transition: 'border-color 0.2s' }} value={item[field]} onChange={(e) => handleEquipmentChange(index, field, e.target.value)} placeholder={field === 'equipmentType' ? 'e.g., Monitor' : field === 'brand' ? 'e.g., Lenovo' : field === 'serialNo' ? 'e.g., SN123' : 'Optional'} onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                          </td>
                        ))}
                        <td style={{ padding: '6px 8px' }}>{newHandoverForm.equipment.length > 1 && (<button onClick={() => handleRemoveEquipment(index)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'} style={{ padding: '5px 10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Remove</button>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleAddEquipment} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#6b7280'; }} style={{ marginTop: '10px', padding: '8px 16px', border: '2px dashed #e2e8f0', borderRadius: '8px', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Add Equipment Row
              </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '12px 14px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#92400e' }}>This form is sent to an administrator for approval. Operational status will start as Pending.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => setShowAddModal(false)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.ice} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'} style={{ flex: 1, padding: '11px', backgroundColor: 'white', color: '#6b7280', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleAddHandoverForm} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary} style={{ flex: 1, padding: '11px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 8px rgba(8,131,149,0.25)' }}>Submit for approval</button>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════
          BREAKDOWN ADD MODAL
      ════════════════════════════════════════ */}
      {showBreakdownModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? '1rem' : '0' }} onClick={() => setShowBreakdownModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '0 1.25rem 1.25rem' : '0 2rem 1.5rem', width: isMobile ? '100%' : '90%', maxWidth: '760px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(8,131,149,0.2)' }} onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem', borderBottom: `2px solid ${C.ice}`, marginBottom: '1.25rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="#92400e" />
              </div>
              <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '800', color: C.dark, margin: 0 }}>Breakdown Form</h2>
              <button onClick={() => setShowBreakdownModal(false)} style={{ marginLeft: 'auto', background: C.ice, border: 'none', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Section 1: General Info */}
            <div style={{ backgroundColor: '#fef3c7', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <Info size={15} color="#92400e" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. General Information</span>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ ...labelStyle, color: '#92400e' }}>Form Name *</label>
                <input type="text" style={inputStyle} value={newBreakdownForm.formName} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, formName: e.target.value })} placeholder="Enter form name" onFocus={(e) => e.target.style.borderColor = '#f59e0b'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div><label style={{ ...labelStyle, color: '#92400e' }}>Date of Report *</label><input type="date" style={inputStyle} value={newBreakdownForm.dateOfReport} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, dateOfReport: e.target.value })} onFocus={(e) => e.target.style.borderColor = '#f59e0b'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
                <div><label style={{ ...labelStyle, color: '#92400e' }}>Lab Name/Number</label><input type="text" style={inputStyle} value={newBreakdownForm.labName} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, labName: e.target.value })} placeholder="Enter lab name/number" onFocus={(e) => e.target.style.borderColor = '#f59e0b'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div><label style={{ ...labelStyle, color: '#92400e' }}>Reported By (Name) *</label><input type="text" style={inputStyle} value={newBreakdownForm.reportedByName} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, reportedByName: e.target.value })} placeholder="Enter name" onFocus={(e) => e.target.style.borderColor = '#f59e0b'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
                <div><label style={{ ...labelStyle, color: '#92400e' }}>Designation</label><input type="text" style={inputStyle} value={newBreakdownForm.reportedByDesignation} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, reportedByDesignation: e.target.value })} placeholder="Enter designation" onFocus={(e) => e.target.style.borderColor = '#f59e0b'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
              </div>
              <div><label style={{ ...labelStyle, color: '#92400e' }}>Reported Issue *</label><input type="text" style={inputStyle} value={newBreakdownForm.reportedIssue} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, reportedIssue: e.target.value })} placeholder="Describe the issue" onFocus={(e) => e.target.style.borderColor = '#f59e0b'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
            </div>

            {/* Section 2: Hardware */}
            <div style={{ backgroundColor: C.ice, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <Monitor size={15} color={C.primary} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Hardware Details</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ backgroundColor: 'white' }}>{['S.No.', 'Equipment Name', 'Brand/Model', 'Serial No.', 'Reported Issue', 'Action'].map((h, i) => (<th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', color: C.dark, borderBottom: `2px solid ${C.primary}`, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {newBreakdownForm.equipment.map((item, index) => (
                      <tr key={index} style={{ borderBottom: `1px solid ${C.ice}` }}>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: C.dark }}>{index + 1}</td>
                        {['equipmentName', 'brand', 'serialNo', 'reportedIssue'].map((field) => (
                          <td key={field} style={{ padding: '6px 8px' }}>
                            <input type="text" style={{ width: '100%', padding: '7px 10px', border: `1.5px solid #e2e8f0`, borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', transition: 'border-color 0.2s' }} value={item[field]} onChange={(e) => handleBreakdownEquipmentChange(index, field, e.target.value)} placeholder={field === 'equipmentName' ? 'e.g., Monitor' : field === 'brand' ? 'e.g., Lenovo' : field === 'serialNo' ? 'e.g., SN123' : 'Describe issue'} onFocus={(e) => e.target.style.borderColor = '#f59e0b'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                          </td>
                        ))}
                        <td style={{ padding: '6px 8px' }}>{newBreakdownForm.equipment.length > 1 && (<button onClick={() => handleRemoveBreakdownEquipment(index)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'} style={{ padding: '5px 10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Remove</button>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleAddBreakdownEquipment} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#6b7280'; }} style={{ marginTop: '10px', padding: '8px 16px', border: '2px dashed #e2e8f0', borderRadius: '8px', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Add Equipment Row
              </button>
            </div>

            {/* Section 3: Reported To */}
            <div style={{ backgroundColor: C.mint, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <Info size={15} color="#065f46" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>3. Reported To</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div><label style={{ ...labelStyle, color: '#065f46' }}>Department</label><input type="text" style={inputStyle} value={newBreakdownForm.department} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, department: e.target.value })} placeholder="e.g., IT Department" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
                <div><label style={{ ...labelStyle, color: '#065f46' }}>Reported To (Name)</label><input type="text" style={inputStyle} value={newBreakdownForm.reportedToName} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, reportedToName: e.target.value })} placeholder="Enter name" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
              </div>
              <div><label style={{ ...labelStyle, color: '#065f46' }}>Designation</label><input type="text" style={inputStyle} value={newBreakdownForm.reportedToDesignation} onChange={(e) => setNewBreakdownForm({ ...newBreakdownForm, reportedToDesignation: e.target.value })} placeholder="Enter designation" onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} /></div>
            </div>

            <div style={{ marginBottom: '1rem', padding: '12px 14px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#92400e' }}>Resolution, verification, and closure are completed by an administrator after you submit.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => setShowBreakdownModal(false)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.ice} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'} style={{ flex: 1, padding: '11px', backgroundColor: 'white', color: '#6b7280', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleAddBreakdownForm} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary} style={{ flex: 1, padding: '11px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 8px rgba(8,131,149,0.25)' }}>Submit to admin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}