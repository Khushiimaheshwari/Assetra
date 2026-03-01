"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Loader2, UserCog, Phone, MapPin, ShieldCheck, FlaskConical } from 'lucide-react';
import emailjs from "@emailjs/browser";

export default function LabTechnicianManagement() {
  const [users, setUsers] = useState([]);
  const [allLabs, setAllLabs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phoneNumber: "", 
    labAccess: [],
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/getlabTechnicians");

      if(!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(
        data.technicians.map(t => ({
          id: t._id,
          name: t.Name,
          email: t.Email,
          phoneNumber: t.PhoneNumber,
          profileImage: t.ProfileImage,
          location: t.Location,
          status: t.AccountStatus,
          labAccess: t.Labs?.map(lab => lab.Lab_ID),
        }))
      );
      console.log(data);
      
    }catch (err) {
      console.error("Fetch Users Error:", err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await fetchUsers();
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchLab = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/getLabs");

      if(!res.ok) {
        throw new Error("Failed to fetch Labs");
      }

      const data = await res.json();
      setAllLabs(
        data.labs.map(l => ({
          Lab: l.Lab_ID,
          Lab_id: l._id,
        }))
      );
      console.log("Fetched labs",data);
      
    }catch (err) {
      console.error("Fetch Labs Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLab();
  }, []); 

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

 

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      phoneNumber: "",
      labAccess: [],
    });
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/admin/addLabTechnician", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          labAccess: newUser.labAccess.map(lab => lab.Lab_id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong!");
        return;
      }

      // await emailjs.send(
      //   "service_2xk0xdb",  
      //   "template_mq4w3fc",    
      //   {
      //     to_name: newUser.name,
      //     to_email: newUser.email,
      //     password: newUser.password,
      //   },
      //   "JVeTTsN2NUeZ0UlPA"
      // );

      setUsers([
        ...users,
        {
          id: users.length + 1,
          name: newUser.name,
          email: newUser.email,
        },
      ]);

      alert("Lab Technician added successfully!");
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        labAccess: [],
      });
      await fetchUsers();
      await fetchLab();
    } catch (err) {
      console.error("Add Lab Technician Error:", err);
      alert("Something went wrong while editing Lab Technician.");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);    
    setShowAddModal(true);
    setNewUser(user);
  };

  const handleUpdateUser = async () => {

    if (!newUser.name || !newUser.email) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/admin/editLabTechnician", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          labAccess: newUser.labAccess.map(lab => lab.Lab_id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong!");
        return;
      }

      if (newUser.password && newUser.password.trim() !== "") {
        // await emailjs.send(
        //   "service_2xk0xdb",  
        //   "template_mq4w3fc",    
        //   {
        //     to_name: newUser.name,
        //     to_email: newUser.email,
        //     password: newUser.password,
        //   },
        //   "JVeTTsN2NUeZ0UlPA"
        // );
      }

      setUsers([
        ...users,
        {
          id: users.length + 1,
          name: newUser.name,
          email: newUser.email,
        },
      ]);

    alert("Lab Technician updated successfully!");
    setUsers(users.map((u) => (u.id === editingUser.id ? newUser : u)));
    setShowAddModal(false);
    setEditingUser(null);
    setNewUser({
      name: "",
      email: "",
      password: "",
      labAccess: [],
    });
    await fetchUsers();
    await fetchLab()
  } catch (err) {
    console.error("Edit Lab Technician Error:", err);
    alert("Something went wrong while editing Lab Technician.");
  }
};

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleLabSelect = (selectedLab) => {
    setNewUser((prev) => {
      const alreadySelected = prev.labAccess.some(
        (lab) => lab.Lab_id === selectedLab.Lab_id
      );

      return {
        ...prev,
        labAccess: alreadySelected
          ? prev.labAccess.filter((lab) => lab.Lab_id !== selectedLab.Lab_id)
          : [...prev.labAccess, selectedLab],
      };
    });
  };

  const handleRemoveLab = (labIdToRemove) => {
  setNewUser((prev) => ({
    ...prev,
    labAccess: prev.labAccess.filter((lab) => lab.Lab_id !== labIdToRemove),
  }));
};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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
    border: `2px solid #e2e8f0`,
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#1f2937',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: C.dark,
    marginBottom: '6px',
    letterSpacing: '0.03em',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
          <Loader2 size={48} className="animate-spin" color={C.primary} />
          <p style={{ color: C.dark, fontSize: '16px', fontWeight: '500' }}>Loading technician data...</p>
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
            <UserCog size={24} color={C.primary} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.875rem', fontWeight: '800', color: C.dark, margin: 0, letterSpacing: '-0.5px' }}>
              Lab Technician Management
            </h1>
            <p style={{ color: C.primary, marginTop: '0.2rem', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
              Manage technician accounts and lab access
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingUser(null); resetForm(); setShowAddModal(true); }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary}
          style={{
            padding: '10px 22px',
            backgroundColor: C.primary,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(8,131,149,0.25)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New
        </button>
      </div>

      {/* ── Card List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {users && users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} style={{
              backgroundColor: 'white',
              borderRadius: '14px',
              padding: isMobile ? '1rem' : '1.25rem 1.5rem',
              boxShadow: '0 2px 8px rgba(8,131,149,0.07)',
              borderLeft: `4px solid ${C.primary}`,
              transition: 'box-shadow 0.2s',
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Left: avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 220 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '10px', backgroundColor: C.ice,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" style={{ width: 48, height: 48, objectFit: 'cover' }} />
                    ) : (
                      <UserCog size={22} color={C.primary} />
                    )}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: C.dark }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{user.email}</p>
                  </div>
                </div>

                {/* Right: labs pill + status + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Labs count pill */}
                  <span style={{
                    backgroundColor: C.ice, color: C.dark,
                    padding: '0.25rem 0.875rem', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: '700',
                  }}>
                    {user.labAccess && user.labAccess.length > 0 ? `${user.labAccess.length} Lab${user.labAccess.length !== 1 ? 's' : ''}` : 'No Labs'}
                  </span>

                  {/* Status badge */}
                  <span style={{
                    padding: '0.3rem 0.875rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    ...(user.status === 'active'
                      ? { backgroundColor: C.mint, color: '#065f46' }
                      : user.status === 'inactive'
                      ? { backgroundColor: '#fee2e2', color: '#991b1b' }
                      : { backgroundColor: '#fef3c7', color: '#92400e' }),
                  }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      {user.status === 'active' ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      )}
                    </svg>
                    {user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1)}
                  </span>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {/* Edit */}
                    <button
                      onClick={() => handleEditUser(user)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                      style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill={C.primary}>
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}
                      style={{ width: 34, height: 34, border: 'none', borderRadius: '8px', backgroundColor: C.ice, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {/* Expand */}
                    <button
                      onClick={() => setExpandedCard(expandedCard === user.id ? null : user.id)}
                      style={{
                        width: 34, height: 34, border: 'none', borderRadius: '8px',
                        backgroundColor: C.ice, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.2s, background 0.15s',
                        transform: expandedCard === user.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: C.dark,
                      }}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {expandedCard === user.id && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.ice}` }}>
                  {/* Info blocks */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', marginBottom: '1rem' }}>
                    {[
                      { icon: <Phone size={14} color={C.primary} />, label: 'Phone', value: user.phoneNumber || 'Not provided' },
                      { icon: <MapPin size={14} color={C.primary} />, label: 'Location', value: user.location || 'Not specified' },
                      { icon: <ShieldCheck size={14} color={C.primary} />, label: 'Status', value: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown' },
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

                  {/* Lab access */}
                  <div style={{ backgroundColor: C.mint, borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <FlaskConical size={14} color="#065f46" />
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lab Access</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 10px', backgroundColor: C.primary, color: 'white', borderRadius: '20px', fontWeight: '700' }}>
                        {user.labAccess?.length || 0} lab{user.labAccess?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {user.labAccess && user.labAccess.length > 0 ? (
                        user.labAccess.map((lab, index) => (
                          <span key={index} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px', backgroundColor: 'white',
                            color: '#059669', border: '1.5px solid #10b981',
                            borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                          }}>
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {typeof lab === "string" ? lab : lab || lab.Lab_ID}
                          </span>
                        ))
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                          No lab access assigned
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
            <UserCog size={40} color={C.sky} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '600', color: C.dark }}>No Lab Technicians found.</p>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showAddModal && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => { setShowAddModal(false); setEditingUser(null); }}
        >
          <div
            style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '1.25rem' : '2rem', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(8,131,149,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `2px solid ${C.ice}` }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCog size={20} color={C.primary} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: C.dark, margin: 0 }}>
                {editingUser ? "Edit Lab Technician" : "Add New Lab Technician"}
              </h2>
            </div>

            {/* Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                style={inputStyle}
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  style={{ ...inputStyle, flex: 1 }}
                  value={newUser.password || ""}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  onFocus={(e) => e.target.style.borderColor = C.primary}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  onClick={() => setNewUser({ ...newUser, password: generateRandomPassword() })}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.backgroundColor = C.ice; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = 'white'; }}
                  style={{ padding: '10px 12px', border: '2px solid #e2e8f0', borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                  title="Generate random password"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill={C.primary}>
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Lab Access */}
            <div style={{ marginBottom: '1rem' }} ref={dropdownRef}>
              <label style={labelStyle}>Lab Access</label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    minHeight: '44px',
                    padding: '6px 12px',
                    border: `2px solid ${isDropdownOpen ? C.primary : '#e2e8f0'}`,
                    borderRadius: '10px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    alignItems: 'center',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {newUser.labAccess.length === 0 ? (
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Select lab access</span>
                  ) : (
                    newUser.labAccess.map((lab, index) => {
                      const labName = typeof lab === "object" ? lab.Lab : lab;
                      const labId = typeof lab === "object" ? lab.Lab_id : index;
                      return (
                        <div key={labId} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: C.primary, color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                          <span>{labName}</span>
                          <button
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.85 }}
                            onClick={(e) => { e.stopPropagation(); handleRemoveLab(labId); }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {isDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 16px rgba(8,131,149,0.12)', maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}>
                    <div
                      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}
                      onClick={() => handleLabSelect("No Lab Access")}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.ice}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      No Lab Access
                    </div>
                    {allLabs.map((labObj) => {
                      const isSelected = newUser.labAccess.some((lab) => lab.Lab_id === labObj.Lab_id);
                      return (
                        <div
                          key={labObj.Lab_id}
                          onClick={() => handleLabSelect(labObj)}
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

              {/* Selected labs summary */}
              <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: C.ice, borderRadius: '8px', fontSize: '13px', color: C.dark, fontWeight: '500' }}>
                <strong>Selected:</strong>{' '}
                {newUser.labAccess.length > 0
                  ? newUser.labAccess.map((lab, index) => {
                      const labName = typeof lab === "object" ? lab.Lab : lab;
                      const labId = typeof lab === "object" ? lab.Lab_id : index;
                      return <span key={labId}>{labName}{index < newUser.labAccess.length - 1 ? ', ' : ''}</span>;
                    })
                  : 'None'}
              </div>
            </div>

            {/* Modal actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
              <button
                onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.ice}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                style={{ flex: 1, padding: '11px', backgroundColor: 'white', color: '#6b7280', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'background 0.15s' }}
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary}
                style={{ flex: 1, padding: '11px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(8,131,149,0.25)' }}
              >
                {editingUser ? "Update Technician" : "Add Technician"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}