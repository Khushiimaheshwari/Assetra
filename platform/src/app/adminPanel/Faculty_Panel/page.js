"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Loader2, GraduationCap, Phone, MapPin, ShieldCheck, BookOpen, FlaskConical } from 'lucide-react';
import emailjs from "@emailjs/browser";

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [allLabs, setAllLabs] = useState([]);
  const [allDepartments, setAllDepartments] = useState([
    { Department: "SOET", Department_id: 1 },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [isLabAccessDropdownOpen, setIsLabAccessDropdownOpen] = useState(false);
  const [isLabInchargeDropdownOpen, setIsLabInchargeDropdownOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const labAccessDropdownRef = useRef(null);
  const labInchargeDropdownRef = useRef(null);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    labAccess: [],
    labIncharge: [],
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await fetch("/api/admin/getFaculty");
      if (!res.ok) throw new Error("Failed to fetch faculty");
      const data = await res.json();
      setFaculty(
        data.faculty.map(f => ({
          id: f._id,
          name: f.Name,
          email: f.Email,
          phoneNumber: f.PhoneNumber,
          profileImage: f.ProfileImage,
          department: f.Department,
          designation: f.Designation,
          location: f.Location,
          status: f.AccountStatus,
          labAccess: f.Labs || [],
          labIncharge: f.Incharge_Labs || [],
        }))
      );
    } catch (err) {
      console.error("Fetch Faculty Error:", err);
    }
  };

  const fetchLab = async () => {
    try {
      const res = await fetch("/api/admin/getLabs");
      if (!res.ok) throw new Error("Failed to fetch Labs");
      const data = await res.json();
      setAllLabs(
        data.labs.map(l => ({
          Lab: l.Lab_ID,
          Lab_id: l._id,
        }))
      );
    } catch (err) {
      console.error("Fetch Labs Error:", err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchFaculty(), fetchLab()]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const resetForm = () => {
    setNewFaculty({
      name: "",
      email: "",
      password: "",
      department: "",
      designation: "",
      labAccess: [],
      labIncharge: [],
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (labAccessDropdownRef.current && !labAccessDropdownRef.current.contains(event.target)) {
        setIsLabAccessDropdownOpen(false);
      }
      if (labInchargeDropdownRef.current && !labInchargeDropdownRef.current.contains(event.target)) {
        setIsLabInchargeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateRandomPassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // ── Lab Access handlers ──
  const handleLabAccessSelect = (labObj) => {
    setNewFaculty((prev) => {
      const alreadySelected = prev.labAccess.some(l => l.Lab_id === labObj.Lab_id);
      return {
        ...prev,
        labAccess: alreadySelected
          ? prev.labAccess.filter(l => l.Lab_id !== labObj.Lab_id)
          : [...prev.labAccess, labObj],
      };
    });
  };

  const handleRemoveLabAccess = (labId) => {
    setNewFaculty((prev) => ({
      ...prev,
      labAccess: prev.labAccess.filter(l => l.Lab_id !== labId),
    }));
  };

  // ── Lab Incharge handlers ──
  const handleLabInchargeSelect = (labObj) => {
    setNewFaculty((prev) => {
      const alreadySelected = prev.labIncharge.some(l => l.Lab_id === labObj.Lab_id);
      return {
        ...prev,
        labIncharge: alreadySelected
          ? prev.labIncharge.filter(l => l.Lab_id !== labObj.Lab_id)
          : [...prev.labIncharge, labObj],
      };
    });
  };

  const handleRemoveLabIncharge = (labId) => {
    setNewFaculty((prev) => ({
      ...prev,
      labIncharge: prev.labIncharge.filter(l => l.Lab_id !== labId),
    }));
  };

  const handleAddFaculty = async () => {
    if (!newFaculty.name || !newFaculty.email || !newFaculty.password) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    const payload = {
      name: newFaculty.name,
      email: newFaculty.email,
      password: newFaculty.password,
      department: newFaculty.department,
      designation: newFaculty.designation,
      labAccess: newFaculty.labAccess.map(l => l.Lab_id),
      labIncharge: newFaculty.labIncharge.map(l => l.Lab_id),
    };

    try {
      const res = await fetch("/api/admin/addFaculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Something went wrong!"); return; }

       // await emailjs.send(
      //   "service_2xk0xdb",  
      //   "template_mq4w3fc",    
      //   {
      //     to_name: newFaculty.name,
      //     to_email: newFaculty.email,
      //     password: newFaculty.password,
      //   },
      //   "JVeTTsN2NUeZ0UlPA"
      // );

      alert("Faculty added successfully!");
      setShowAddModal(false);
      resetForm();
      await fetchFaculty();
    } catch (err) {
      console.error("Add Faculty Error:", err);
      alert("Something went wrong while adding Faculty.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditFaculty = (user) => {
    setEditingFaculty(user);
    setShowAddModal(true);
    // Normalize labAccess/labIncharge to array of {Lab, Lab_id} objects
    setNewFaculty({
      ...user,
      labAccess: Array.isArray(user.labAccess)
        ? user.labAccess.map(l => typeof l === 'object' ? l : { Lab: l, Lab_id: l })
        : [],
      labIncharge: Array.isArray(user.labIncharge)
        ? user.labIncharge.map(l => typeof l === 'object' ? l : { Lab: l, Lab_id: l })
        : [],
    });
  };

  const handleUpdateFaculty = async () => {
    if (!newFaculty.name || !newFaculty.email) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    const payload = {
      name: newFaculty.name,
      email: newFaculty.email,
      password: newFaculty.password,
      department: newFaculty.department,
      designation: newFaculty.designation,
      labAccess: newFaculty.labAccess.map(l => l.Lab_id),
      labIncharge: newFaculty.labIncharge.map(l => l.Lab_id),
    };

    try {
      const res = await fetch("/api/admin/editFaculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Something went wrong!"); return; }

       // await emailjs.send(
      //   "service_2xk0xdb",  
      //   "template_mq4w3fc",    
      //   {
      //     to_name: newFaculty.name,
      //     to_email: newFaculty.email,
      //     password: newFaculty.password,
      //   },
      //   "JVeTTsN2NUeZ0UlPA"
      // );

      alert("Faculty updated successfully!");
      setShowAddModal(false);
      setEditingFaculty(null);
      resetForm();
      await fetchFaculty();
    } catch (err) {
      console.error("Edit Faculty Error:", err);
      alert("Something went wrong while editing Faculty.");
    } finally {
      setSaving(false);
    }
  };

  const C = {
    primary: '#088395', dark: '#176B87', sky: '#86B6F6',
    ice: '#EBF4F6', ocean: '#3674B5', mint: '#D1F8EF',
  };

  const containerStyle = {
    width: isMobile ? '100%' : 'calc(100% - 255px)',
    minHeight: '100vh', backgroundColor: C.ice,
    padding: isMobile ? '1rem' : '2rem',
    boxSizing: 'border-box', marginLeft: isMobile ? '0' : '255px',
    overflowX: 'hidden', fontFamily: "'Segoe UI', sans-serif",
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
    color: '#1f2937', backgroundColor: 'white',
  };

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '700',
    color: C.dark, marginBottom: '6px', letterSpacing: '0.03em',
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none' };

  // Reusable multi-select lab dropdown renderer
  const renderLabDropdown = ({
    label, selected, onSelect, onRemove,
    isOpen, setIsOpen, dropdownRef, placeholder,
  }) => (
    <div style={{ marginBottom: '1rem' }} ref={dropdownRef}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            minHeight: '44px', padding: '6px 12px',
            border: `2px solid ${isOpen ? C.primary : '#e2e8f0'}`,
            borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer',
            display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
            transition: 'border-color 0.2s',
          }}
        >
          {selected.length === 0 ? (
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>{placeholder}</span>
          ) : (
            selected.map((lab) => {
              const labName = typeof lab === 'object' ? lab.Lab : lab;
              const labId = typeof lab === 'object' ? lab.Lab_id : lab;
              return (
                <div key={labId} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: C.primary, color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                  <span>{labName}</span>
                  <button
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); onRemove(labId); }}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {isOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 16px rgba(8,131,149,0.12)', maxHeight: '200px', overflowY: 'auto', zIndex: 1100 }}>
            {allLabs.map((labObj) => {
              const isSelected = selected.some(l => (typeof l === 'object' ? l.Lab_id : l) === labObj.Lab_id);
              return (
                <div
                  key={labObj.Lab_id}
                  onClick={() => onSelect(labObj)}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = C.ice; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isSelected ? C.mint : 'transparent', color: isSelected ? '#065f46' : '#374151', fontWeight: isSelected ? '600' : '400' }}
                >
                  {labObj.Lab}
                  {isSelected && <span style={{ color: C.primary, fontSize: '16px' }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{ marginTop: '8px', padding: '8px 14px', backgroundColor: C.ice, borderRadius: '8px', fontSize: '13px', color: C.dark, fontWeight: '500' }}>
        <strong>Selected:</strong>{' '}
        {selected.length > 0
          ? selected.map((lab, i) => {
              const name = typeof lab === 'object' ? lab.Lab : lab;
              const id = typeof lab === 'object' ? lab.Lab_id : lab;
              return <span key={id}>{name}{i < selected.length - 1 ? ', ' : ''}</span>;
            })
          : 'None'}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
          <Loader2 size={48} className="animate-spin" color={C.primary} />
          <p style={{ color: C.dark, fontSize: '16px', fontWeight: '500' }}>Loading faculty data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: isMobile ? '1.25rem' : '1.75rem 2rem', marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(8,131,149,0.08)', borderBottom: `3px solid ${C.primary}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GraduationCap size={24} color={C.primary} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.875rem', fontWeight: '800', color: C.dark, margin: 0, letterSpacing: '-0.5px' }}>
              Faculty Management
            </h1>
            <p style={{ color: C.primary, fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
              Manage faculty accounts, subjects, and programs
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingFaculty(null); resetForm(); setShowAddModal(true); }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary}
          style={{ padding: '10px 22px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(8,131,149,0.25)' }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New
        </button>
      </div>

      {/* ── Card List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faculty && faculty.length > 0 ? (
          faculty.map((member) => (
            <div key={member.id} style={{
              backgroundColor: 'white', borderRadius: '14px',
              padding: isMobile ? '1rem' : '1.25rem 1.5rem',
              boxShadow: '0 2px 8px rgba(8,131,149,0.07)', borderLeft: `4px solid ${C.primary}`,
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Left: avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 220 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {member.profileImage
                      ? <img src={member.profileImage} alt="Profile" style={{ width: 48, height: 48, objectFit: 'cover' }} />
                      : <GraduationCap size={22} color={C.primary} />}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.dark }}>{member.name}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{member.email}</p>
                  </div>
                </div>

                {/* Right: designation + labs pills + status + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Designation + Department */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: C.dark }}>{member.designation || 'N/A'}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{member.department || 'No Department'}</p>
                  </div>

                  {/* Lab Access pill */}
                  <span style={{ backgroundColor: C.ice, color: C.dark, padding: '0.25rem 0.875rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {member.labAccess && member.labAccess.length > 0
                      ? `${member.labAccess.length} Lab${member.labAccess.length !== 1 ? 's' : ''}`
                      : 'No Labs'}
                  </span>

                  {/* Lab Incharge pill */}
                  <span style={{ backgroundColor: C.mint, color: '#065f46', padding: '0.25rem 0.875rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {member.labIncharge && member.labIncharge.length > 0
                      ? `${member.labIncharge.length} Incharge`
                      : 'No Incharge'}
                  </span>

                  {/* Status badge */}
                  <span style={{
                    padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    ...(member.status === 'active'
                      ? { backgroundColor: C.mint, color: '#065f46' }
                      : { backgroundColor: '#fee2e2', color: '#991b1b' }),
                  }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      {member.status === 'active'
                        ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}
                    </svg>
                    {(member?.status || "").charAt(0).toUpperCase() + (member?.status || "").slice(1)}
                  </span>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleEditFaculty(member)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                      style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill={C.primary}><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                      style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                    <button
                      onClick={() => setExpandedCard(expandedCard === member.id ? null : member.id)}
                      style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s, background 0.15s', transform: expandedCard === member.id ? 'rotate(180deg)' : 'rotate(0deg)', color: C.dark }}>
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {expandedCard === member.id && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.ice}` }}>
                  {/* Info blocks */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1rem' }}>
                    {[
                      { icon: <Phone size={14} color={C.primary} />, label: 'Phone', value: member.phoneNumber || 'Not provided' },
                      { icon: <MapPin size={14} color={C.primary} />, label: 'Location', value: member.location || 'Not specified' },
                      { icon: <ShieldCheck size={14} color={C.primary} />, label: 'Status', value: member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1) : 'Unknown' },
                    ].map((item, i) => (
                      <div key={i} style={{ backgroundColor: C.ice, borderRadius: '10px', padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          {item.icon}
                          <span style={{ fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Lab Access section */}
                  <div style={{ backgroundColor: C.ice, borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <FlaskConical size={14} color={C.primary} />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lab Access</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 10px', backgroundColor: C.primary, color: 'white', borderRadius: '20px', fontWeight: '700' }}>
                        {member.labAccess?.length || 0} lab{member.labAccess?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {member.labAccess && member.labAccess.length > 0 ? (
                        member.labAccess.map((lab, index) => (
                          <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: 'white', color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                            <FlaskConical size={12} />
                            {typeof lab === 'string' ? lab : lab.Lab_ID || lab.Lab || lab}
                          </span>
                        ))
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                          No lab access assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lab Incharge section */}
                  <div style={{ backgroundColor: C.mint, borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <ShieldCheck size={14} color="#065f46" />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lab Incharge</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 10px', backgroundColor: '#059669', color: 'white', borderRadius: '20px', fontWeight: '700' }}>
                        {member.labIncharge?.length || 0} lab{member.labIncharge?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {member.labIncharge && member.labIncharge.length > 0 ? (
                        member.labIncharge.map((lab, index) => (
                          <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: 'white', color: '#059669', border: '1.5px solid #10b981', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                            <ShieldCheck size={12} />
                            {typeof lab === 'string' ? lab : lab.Lab_ID || lab.Lab || lab}
                          </span>
                        ))
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                          No incharge labs assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subjects section */}
                  <div style={{ backgroundColor: C.mint, borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <BookOpen size={14} color="#065f46" />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects Taught</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 10px', backgroundColor: C.primary, color: 'white', borderRadius: '20px', fontWeight: '700' }}>
                        {member.programSubjectPairs?.length || 0}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {member.programSubjectPairs && member.programSubjectPairs.length > 0 ? (
                        member.programSubjectPairs.map((sub, index) => (
                          <div key={index} style={{ display: 'inline-flex', flexDirection: 'column', padding: '8px 12px', backgroundColor: 'white', color: '#059669', border: '1.5px solid #10b981', borderRadius: '8px', fontSize: '12px', fontWeight: '600', gap: '2px' }}>
                            <span>{sub.subjectName} {sub.subjectCode}</span>
                            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>
                              "{sub.programSection}" {sub.programName} Sem-{sub.programSemester} {sub.programGroup} Batch: {sub.programBatch}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                          No subjects assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 8px rgba(8,131,149,0.07)' }}>
            <GraduationCap size={40} color={C.sky} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '600', color: C.dark }}>No faculty members found.</p>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showAddModal && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? '1rem' : '0' }}
          onClick={() => { setShowAddModal(false); setEditingFaculty(null); setIsLabAccessDropdownOpen(false); setIsLabInchargeDropdownOpen(false); }}
        >
          <div
            style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '0 1.25rem 1.25rem' : '0 2rem 1.5rem', width: isMobile ? '100%' : '90%', maxWidth: '580px', maxHeight: isMobile ? '95vh' : '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(8,131,149,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky modal header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem', borderBottom: `2px solid ${C.ice}`, marginBottom: '1.25rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={20} color={C.primary} />
              </div>
              <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '800', color: C.dark, margin: 0 }}>
                {editingFaculty ? "Edit Faculty Member" : "Add New Faculty Member"}
              </h2>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Name</label>
              <input type="text" style={inputStyle} value={newFaculty.name} onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })} placeholder="Enter full name"
                onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" style={inputStyle} value={newFaculty.email} onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })} placeholder="Enter email"
                onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" style={{ ...inputStyle, flex: 1 }} value={newFaculty.password || ""} onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })} placeholder="Enter password"
                  onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                <button
                  onClick={() => setNewFaculty({ ...newFaculty, password: generateRandomPassword() })}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.backgroundColor = C.ice; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = 'white'; }}
                  style={{ padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                  title="Generate random password"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill={C.primary}>
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Department */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Department</label>
              <select style={selectStyle} value={newFaculty.department} onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}>
                <option value="">Select Department</option>
                {allDepartments.map((dept) => (
                  <option key={dept.Department_id} value={dept.Department}>{dept.Department}</option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Designation</label>
              <input type="text" style={inputStyle} value={newFaculty.designation} onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })} placeholder="e.g., Professor"
                onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
            </div>

            {/* Lab Access Dropdown */}
            {renderLabDropdown({
              label: "Lab Access",
              selected: newFaculty.labAccess,
              onSelect: handleLabAccessSelect,
              onRemove: handleRemoveLabAccess,
              isOpen: isLabAccessDropdownOpen,
              setIsOpen: setIsLabAccessDropdownOpen,
              dropdownRef: labAccessDropdownRef,
              placeholder: "Select lab access",
            })}

            {/* Lab Incharge Dropdown */}
            {renderLabDropdown({
              label: "Lab Incharge",
              selected: newFaculty.labIncharge,
              onSelect: handleLabInchargeSelect,
              onRemove: handleRemoveLabIncharge,
              isOpen: isLabInchargeDropdownOpen,
              setIsOpen: setIsLabInchargeDropdownOpen,
              dropdownRef: labInchargeDropdownRef,
              placeholder: "Select incharge labs",
            })}

            {/* Modal actions */}
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => { setShowAddModal(false); setEditingFaculty(null); setIsLabAccessDropdownOpen(false); setIsLabInchargeDropdownOpen(false); resetForm(); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.ice}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                style={{ flex: 1, padding: '11px', backgroundColor: 'white', color: '#6b7280', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'background 0.15s' }}
              >
                Cancel
              </button>
              <button
                onClick={editingFaculty ? handleUpdateFaculty : handleAddFaculty}
                disabled={saving}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = C.dark; }}
                onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = C.primary; }}
                style={{ flex: 1, padding: '11px', backgroundColor: saving ? '#9ca3af' : C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', transition: 'background 0.2s', boxShadow: saving ? 'none' : '0 2px 8px rgba(8,131,149,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {saving
                  ? <><Loader2 size={16} className="animate-spin" />{editingFaculty ? "Updating..." : "Adding..."}</>
                  : editingFaculty ? "Update Faculty" : "Add Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}