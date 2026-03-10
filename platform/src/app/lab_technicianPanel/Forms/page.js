"use client";

import React, { useEffect, useState } from 'react';
import { ChevronDown, Loader2, FileText, Info, Monitor } from 'lucide-react';

export default function HandoverFormPage() {
  const [handoverForms, setHandoverForms] = useState([]);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState(null);   // ← ADDED
  const [isMobile, setIsMobile]           = useState(false);
  const [isTablet, setIsTablet]           = useState(false);
  const [expandedForm, setExpandedForm]   = useState(null);
  const [newHandoverForm, setNewHandoverForm] = useState({
    formName: '',
    labName: '',
    handoverDate: '',
    handoverByName: '',
    handoverByDesignation: '',
    handoverToName: '',
    handoverToDesignation: '',
    purpose: '',
    equipment: [{ serialNo: '', equipmentType: '', brand: '', remarks: '' }],
    status: 'Pending'
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHandoverForms = async () => {
    try {
      setFetchError(null);                                     // ← ADDED
      const res = await fetch("/api/admin/getHandoverForms");
      const data = await res.json();
      if (res.ok) {
        setHandoverForms(data.handoverForms);
      } else {
        console.error("Failed to fetch handover forms:", data.error);
        setFetchError(data.error || "Failed to fetch handover forms."); // ← ADDED
      }
    } catch (err) {
      console.error("Error fetching handover forms:", err);
      setFetchError("Network error. Please check your connection.");    // ← ADDED
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await fetchHandoverForms();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // ── REMOVED: dummyHandoverForms array entirely ─────────────────────────────
  // ── CHANGED: use handoverForms directly (no fallback to dummy) ─────────────
  const displayForms = handoverForms;

  const handleAddEquipment = () => {
    setNewHandoverForm({
      ...newHandoverForm,
      equipment: [...newHandoverForm.equipment, { serialNo: '', equipmentType: '', brand: '', remarks: '' }]
    });
  };

  const handleRemoveEquipment = (index) => {
    const updatedEquipment = newHandoverForm.equipment.filter((_, i) => i !== index);
    setNewHandoverForm({ ...newHandoverForm, equipment: updatedEquipment });
  };

  const handleEquipmentChange = (index, field, value) => {
    const updatedEquipment = [...newHandoverForm.equipment];
    updatedEquipment[index][field] = value;
    setNewHandoverForm({ ...newHandoverForm, equipment: updatedEquipment });
  };

  const handleAddHandoverForm = async () => {
    if (!newHandoverForm.formName || !newHandoverForm.handoverByName || !newHandoverForm.handoverToName) {
      alert("Please fill in all required fields!");
      return;
    }

    const payload = {
      formName:               newHandoverForm.formName,
      labName:                newHandoverForm.labName,
      handoverDate:           newHandoverForm.handoverDate,
      handoverByName:         newHandoverForm.handoverByName,
      handoverByDesignation:  newHandoverForm.handoverByDesignation,
      handoverToName:         newHandoverForm.handoverToName,
      handoverToDesignation:  newHandoverForm.handoverToDesignation,
      purpose:                newHandoverForm.purpose,
      equipment:              newHandoverForm.equipment,
      status:                 newHandoverForm.status
    };

    try {
      const res = await fetch("/api/admin/addHandoverForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Handover form added successfully!");
        setShowAddModal(false);
        setNewHandoverForm({
          formName: '', labName: '', handoverDate: '',
          handoverByName: '', handoverByDesignation: '',
          handoverToName: '', handoverToDesignation: '',
          purpose: '', equipment: [{ serialNo: '', equipmentType: '', brand: '', remarks: '' }],
          status: 'Pending'
        });
        fetchHandoverForms();
      } else {
        alert(data.error || "Failed to add handover form");
      }
    } catch (error) {
      console.error("Error adding handover form:", error);
      alert("Something went wrong while adding the handover form.");
    }
  };

  // ── Design tokens ──
  const C = {
    primary: '#088395',
    dark: '#176B87',
    sky: '#86B6F6',
    ice: '#EBF4F6',
    ocean: '#3674B5',
    mint: '#D1F8EF',
  };

  const containerStyle = {
    width: (isMobile || isTablet) ? '100%' : 'calc(100% - 255px)',
    minHeight: '100vh',
    backgroundColor: C.ice,
    padding: (isMobile || isTablet) ? '1rem' : '2rem',
    boxSizing: 'border-box',
    marginLeft: (isMobile || isTablet) ? '0' : '255px',
    overflowX: 'hidden',
    fontFamily: "'Segoe UI', sans-serif",
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#1f2937',
    backgroundColor: 'white',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: C.dark,
    marginBottom: '6px',
    letterSpacing: '0.03em',
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed')   return { backgroundColor: C.mint,    color: '#065f46' };
    if (s === 'in progress') return { backgroundColor: '#dbeafe', color: '#1e40af' };
    return                          { backgroundColor: '#fef3c7', color: '#92400e' };
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
          <Loader2 size={48} className="animate-spin" color={C.primary} />
          <p style={{ color: C.dark, fontSize: '16px', fontWeight: '500' }}>Loading handover forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: isMobile ? '1.25rem' : '1.75rem 2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(8,131,149,0.08)',
        borderBottom: `3px solid ${C.primary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={24} color={C.primary} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.875rem', fontWeight: '800', color: C.dark, margin: 0, letterSpacing: '-0.5px' }}>
              Equipment Handover Forms
            </h1>
            <p style={{ color: C.primary, marginTop: '0.2rem', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
              Track and manage lab equipment handovers
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary}
          style={{
            padding: '10px 22px', backgroundColor: C.primary, color: 'white',
            border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
            transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(8,131,149,0.25)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New
        </button>
      </div>

      {/* ── ADDED: Fetch error banner ── */}
      {fetchError && (
        <div style={{
          backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px',
          padding: '12px 18px', marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          fontSize: '13px', fontWeight: '600', color: '#991B1B',
        }}>
          <span>⚠ {fetchError}</span>
          <button
            onClick={() => { setFetchError(null); fetchHandoverForms(); }}
            style={{ background: '#991B1B', color: '#fff', border: 'none', borderRadius: '8px', padding: '4px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table column header (desktop only) ── */}
      {!isMobile && !isTablet && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.5fr) 160px 160px 140px 90px',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'white',
          borderRadius: '10px',
          marginBottom: '0.75rem',
          boxShadow: '0 1px 3px rgba(8,131,149,0.06)',
          gap: '0.5rem',
        }}>
          {['Form Details', 'Handover By', 'Handover To', 'Status', 'Actions'].map((h, i) => (
            <div key={i} style={{ fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i === 0 ? 'left' : 'center' }}>
              {h}
            </div>
          ))}
        </div>
      )}

      {/* ── Card List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayForms && displayForms.length > 0 ? (
          displayForms.map((form, index) => (
            <div key={form._id} style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: isMobile ? '1rem' : '1.25rem 1.5rem',
              boxShadow: '0 2px 8px rgba(8,131,149,0.07)',
              borderLeft: `4px solid ${C.primary}`,
            }}>
              {/* Card row */}
              <div style={{
                display: (isMobile || isTablet) ? 'flex' : 'grid',
                gridTemplateColumns: 'minmax(300px, 1.5fr) 160px 160px 140px 90px',
                flexDirection: (isMobile || isTablet) ? 'column' : undefined,
                alignItems: (isMobile || isTablet) ? undefined : 'center',
                gap: '0.75rem',
              }}>
                {/* Form info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '10px', backgroundColor: C.ice,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontWeight: '800', fontSize: '14px', color: C.primary,
                  }}>
                    H{index + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {form.formName}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {form.labName || 'Lab not specified'} · {form.handoverDate}
                    </p>
                  </div>
                </div>

                {/* Handover By */}
                <div style={{ textAlign: (isMobile || isTablet) ? 'left' : 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{form.handoverByName}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{form.handoverByDesignation}</p>
                </div>

                {/* Handover To */}
                <div style={{ textAlign: (isMobile || isTablet) ? 'left' : 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{form.handoverToName}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{form.handoverToDesignation}</p>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', justifyContent: (isMobile || isTablet) ? 'flex-start' : 'center' }}>
                  <span style={{
                    padding: '0.3rem 0.875rem', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: '700',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    ...getStatusStyle(form.status),
                  }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      {form.status?.toLowerCase() === 'completed' ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : form.status?.toLowerCase() === 'in progress' ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      )}
                    </svg>
                    {form.status}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: (isMobile || isTablet) ? 'flex-start' : 'center', alignItems: 'center' }}>
                  <button
                    onClick={() => setExpandedForm(expandedForm === form._id ? null : form._id)}
                    style={{
                      width: 34, height: 34, border: 'none', borderRadius: '8px',
                      backgroundColor: C.ice, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.2s, background 0.15s',
                      transform: expandedForm === form._id ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: C.dark,
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                    style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill={C.primary}>
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                    style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {expandedForm === form._id && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.ice}` }}>

                  {/* General info */}
                  <div style={{ backgroundColor: C.mint, borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Info size={14} color="#065f46" />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Information</span>
                    </div>
                    {[
                      { label: 'Lab Name/Number',      value: form.labName    || 'N/A' },
                      { label: 'Purpose of Handover',  value: form.purpose    || 'N/A' },
                      { label: 'Date of Handover',     value: form.handoverDate },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? `1px solid rgba(6,95,70,0.1)` : 'none' }}>
                        <span style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>{row.label}</span>
                        <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Equipment table */}
                  {form.equipment && form.equipment.length > 0 && (
                    <div style={{ backgroundColor: C.ice, borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <Monitor size={14} color={C.primary} />
                        <span style={{ fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware Details</span>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 10px', backgroundColor: C.primary, color: 'white', borderRadius: '20px', fontWeight: '700' }}>
                          {form.equipment.length} item{form.equipment.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ backgroundColor: 'white' }}>
                              {['S.No.', 'Equipment Type', 'Brand/Model', 'Serial No.', 'Remarks'].map((h, i) => (
                                <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: C.dark, borderBottom: `2px solid ${C.primary}`, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {form.equipment.map((item, idx) => (
                              <tr key={idx}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                style={{ transition: 'background 0.15s' }}
                              >
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
          ))
        ) : (
          // ── CHANGED: empty state shown only when DB truly has no records ──
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(8,131,149,0.07)' }}>
            <FileText size={40} color={C.sky} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '600', color: C.dark, marginBottom: '0.5rem' }}>No handover forms found.</p>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              Click <strong>Add New</strong> to create your first handover form.
            </p>
          </div>
        )}
      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? '1rem' : '0' }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '0 1.25rem 1.25rem' : '0 2rem 1.5rem', width: isMobile ? '100%' : '90%', maxWidth: '760px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(8,131,149,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky modal header */}
            <div style={{
              position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10,
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem',
              borderBottom: `2px solid ${C.ice}`, marginBottom: '1.25rem',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} color={C.primary} />
              </div>
              <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '800', color: C.dark, margin: 0 }}>
                Equipment Handover Form
              </h2>
            </div>

            {/* Section 1: General Info */}
            <div style={{ backgroundColor: C.mint, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <Info size={15} color="#065f46" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. General Information</span>
              </div>

              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ ...labelStyle, color: '#065f46' }}>Form Name *</label>
                <input type="text" style={inputStyle} value={newHandoverForm.formName} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, formName: e.target.value })} placeholder="Enter form name"
                  onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ ...labelStyle, color: '#065f46' }}>Date of Handover *</label>
                  <input type="date" style={inputStyle} value={newHandoverForm.handoverDate} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverDate: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#065f46' }}>Lab Name/Number</label>
                  <input type="text" style={inputStyle} value={newHandoverForm.labName} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, labName: e.target.value })} placeholder="Enter lab name"
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ ...labelStyle, color: '#065f46' }}>Handover From (Name) *</label>
                  <input type="text" style={inputStyle} value={newHandoverForm.handoverByName} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverByName: e.target.value })} placeholder="Enter name"
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#065f46' }}>Designation</label>
                  <input type="text" style={inputStyle} value={newHandoverForm.handoverByDesignation} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverByDesignation: e.target.value })} placeholder="Enter designation"
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                <div>
                  <label style={{ ...labelStyle, color: '#065f46' }}>Handover To (Name) *</label>
                  <input type="text" style={inputStyle} value={newHandoverForm.handoverToName} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverToName: e.target.value })} placeholder="Enter name"
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#065f46' }}>Designation</label>
                  <input type="text" style={inputStyle} value={newHandoverForm.handoverToDesignation} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, handoverToDesignation: e.target.value })} placeholder="Enter designation"
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <div>
                <label style={{ ...labelStyle, color: '#065f46' }}>Purpose of Handover</label>
                <input type="text" style={inputStyle} value={newHandoverForm.purpose} onChange={(e) => setNewHandoverForm({ ...newHandoverForm, purpose: e.target.value })} placeholder="Enter purpose"
                  onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            </div>

            {/* Section 2: Hardware */}
            <div style={{ backgroundColor: C.ice, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <Monitor size={15} color={C.primary} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Hardware Details</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'white' }}>
                      {['S.No.', 'Equipment Type', 'Brand/Model', 'Serial No.', 'Remarks', 'Action'].map((h, i) => (
                        <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', color: C.dark, borderBottom: `2px solid ${C.primary}`, fontSize: '11px', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {newHandoverForm.equipment.map((item, index) => (
                      <tr key={index} style={{ borderBottom: `1px solid ${C.ice}` }}>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: C.dark }}>{index + 1}</td>
                        {['equipmentType', 'brand', 'serialNo', 'remarks'].map((field) => (
                          <td key={field} style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              style={{ width: '100%', padding: '7px 10px', border: `1.5px solid #e2e8f0`, borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', transition: 'border-color 0.2s' }}
                              value={item[field]}
                              onChange={(e) => handleEquipmentChange(index, field, e.target.value)}
                              placeholder={field === 'equipmentType' ? 'e.g., Monitor' : field === 'brand' ? 'e.g., Lenovo' : field === 'serialNo' ? 'e.g., SN123' : 'Optional'}
                              onFocus={(e) => e.target.style.borderColor = C.primary}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                          </td>
                        ))}
                        <td style={{ padding: '6px 8px' }}>
                          {newHandoverForm.equipment.length > 1 && (
                            <button
                              onClick={() => handleRemoveEquipment(index)}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                              style={{ padding: '5px 10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.15s', whiteSpace: 'nowrap' }}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleAddEquipment}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#6b7280'; }}
                style={{
                  marginTop: '10px', padding: '8px 16px',
                  border: '2px dashed #e2e8f0', borderRadius: '8px',
                  backgroundColor: 'transparent', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '600', color: '#6b7280',
                  display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Equipment Row
              </button>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Status</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={newHandoverForm.status}
                onChange={(e) => setNewHandoverForm({ ...newHandoverForm, status: e.target.value })}
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewHandoverForm({ formName: '', labName: '', handoverDate: '', handoverByName: '', handoverByDesignation: '', handoverToName: '', handoverToDesignation: '', purpose: '', equipment: [{ serialNo: '', equipmentType: '', brand: '', remarks: '' }], status: 'Pending' });
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.ice}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                style={{ flex: 1, padding: '11px', backgroundColor: 'white', color: '#6b7280', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'background 0.15s' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddHandoverForm}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary}
                style={{ flex: 1, padding: '11px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(8,131,149,0.25)' }}
              >
                Add Handover Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}