"use client"
import React, { useEffect, useState } from 'react';
import { Loader2, Cpu, Sparkles, QrCode, AlertTriangle, PackagePlus } from 'lucide-react';
import { useParams } from "next/navigation"; 

function AssetsPage() {
  const { assetId: id } = useParams();
  const [pcData, setPcData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [viewingQR, setViewingQR] = useState(null);
  const [viewingAI, setViewingAI] = useState(null); 
  const [aiLoading, setAiLoading] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isMobile, setIsMobile] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [newAsset, setNewAsset] = useState({
    Asset_Name: "",
    Asset_Type: "Monitor",
    Assest_Status: "Yes",
    Brand: "",
    Issue_Reported: "",
    Financial_Details: {
      purchase_year: "",
      purchase_cost: "",
      scrap_value: "",
      useful_life: "",
      breakdown_frequency: 0,
      total_maintenance_cost: 0,
      usage_frequency: "",
      warranty: 0,
    }
  });

  const assetTypes = ["Monitor", "Keyboard", "Mouse", "CPU", "UPS", "Other"];

  const [assets, setAssets] = useState([]);

  const fetchPC = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/getPcById/${id}`);
      const data = await res.json();
      if (res.ok) {
        console.log(data);
        
        setPcData(data.pc);
        setAssets(data.pc.Assets || []);
      } else {
        console.error("Failed to fetch PC:", data.error);
      }
    } catch (err) {
      console.error("Error fetching PC:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPC();
  }, [id]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredAssets = selectedType === "All" 
    ? assets 
    : assets.filter(asset => asset.Asset_Type === selectedType.toLowerCase());

  const handleAddAsset = async () => {
    if (!newAsset.Asset_Name || !newAsset.Asset_Type || !newAsset.Assest_Status) {
      alert("Please fill all required fields");
      return;
    }
  
    setSaving(true);
    try {
      const res = await fetch("/api/admin/addAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Asset_Name: newAsset.Asset_Name,
          Asset_Type: newAsset.Asset_Type,
          Assest_Status: newAsset.Assest_Status,
          Brand: newAsset.Brand,
          PC: pcData._id,
          Lab: pcData.Lab?._id,
          Financial_Details: {
            purchase_year: Number(newAsset.Financial_Details.purchase_year),
            purchase_cost: Number(newAsset.Financial_Details.purchase_cost),
            scrap_value: Number(newAsset.Financial_Details.scrap_value),
            useful_life: Number(newAsset.Financial_Details.useful_life),
            breakdown_frequency: Number(newAsset.Financial_Details.breakdown_frequency || 0),
            total_maintenance_cost: Number(newAsset.Financial_Details.total_maintenance_cost || 0),
            usage_frequency: newAsset.Financial_Details.usage_frequency,
            warranty: Number(newAsset.Financial_Details.warranty || 0)
          }
        }), 
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong!");
        return;
      }

      alert("Asset added successfully!");
      setShowAddModal(false);
      resetForm();
      await fetchPC();
      
    } catch (err) {
      console.error("Asset Error:", err);
      alert("Something went wrong while adding asset.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowAddModal(true);
    setNewAsset(asset);
  };

  const handleUpdateAsset = async () => {
    if (!newAsset.Asset_Name || !newAsset.Asset_Type || !newAsset.Assest_Status) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/updateAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAsset.id || editingAsset._id,
          Asset_Name: newAsset.Asset_Name,
          Asset_Type: newAsset.Asset_Type,
          Assest_Status: newAsset.Assest_Status,
          Brand: newAsset.Brand,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong!");
        return;
      }

      alert("Asset updated successfully!");
      setShowAddModal(false);
      setEditingAsset(null);
      resetForm();
      await fetchPC();
      
    } catch (err) {
      console.error("Update Asset Error:", err);
      alert("Something went wrong while updating asset.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/deleteAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assetId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete asset");
        return;
      }

      alert("Asset deleted successfully!");
      await fetchPC();
      
    } catch (err) {
      console.error("Delete Asset Error:", err);
      alert("Something went wrong while deleting asset.");
    }
  };

  const resetForm = () => {
    setNewAsset({
      Asset_Name: "",
      Asset_Type: "Monitor",
      Assest_Status: "Yes",
      Brand: "",
      Issue_Reported: "",
      Financial_Details: {
        purchase_year: "",
        purchase_cost: "",
        scrap_value: "",
        useful_life: "",
        breakdown_frequency: "",
        total_maintenance_cost: "",
        usage_frequency: "", 
        warranty: ""
      }
    });
  };

  const openIssueModal = (issue) => {
    setViewingIssue(issue);
    setCurrentIssueIndex(0);
  };

  const nextIssue = () => {
    if (!viewingIssue) return;
    setCurrentIssueIndex((prev) => 
      prev + 1 < viewingIssue.Issue_Reported.length ? prev + 1 : prev
    );
  };

  const prevIssue = () => {
    if (!viewingIssue) return;
    setCurrentIssueIndex((prev) =>
      prev - 1 >= 0 ? prev - 1 : prev
    );
  };

  function formatStatus(status) {
    if (!status) return "Pending";

    const map = {
      "pending": "Pending",
      "resolved by technician": "Resolved By Technician",
      "approved": "Approved"
    };

    return map[status] || status;
  }

  const getIssueStatusColor = (status) => {
    switch(status) {      
      case "pending": return { backgroundColor: '#fef3c7', color: '#92400e' };
      case "resolved by technician": return { backgroundColor: '#d1fae5', color: '#065f46' };
      case "approved": return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#e5e7eb', color: '#374151' };
    }
  };

  const handleDownloadQR = (qrCodeUrl, assetName) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_${assetName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Yes": return { bg: '#d1fae5', text: '#065f46' };
      case "No": return { bg: '#fee2e2', text: '#991b1b' };
      case "Other": return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#e5e7eb', text: '#374151' };
    }
  };

  const handleGenerateAI = async () => {
    try {
      setAiLoading(true);
  
      const response = await fetch("/api/ai/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assetId: viewingAI._id
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.error || "AI generation failed");
        return;
      }
  
      setViewingAI(prev => ({
        ...prev,
        AI_Predictions: data.AI_Predictions
      }));
  
    } catch (error) {
      console.error("AI generation error:", error);
      alert("Something went wrong while generating AI report.");
    } finally {
      setAiLoading(false);
    }
  };
  
  const C = { primary: '#088395', dark: '#176B87', sky: '#86B6F6', ice: '#EBF4F6', mint: '#D1F8EF' };

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    border: '2px solid #EBF4F6', borderRadius: '8px', fontSize: '13px',
    boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
    color: '#1f2937', backgroundColor: 'white',
  };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '700', color: C.dark, marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  const styles = {
    container: {
      width: isMobile ? '100%' : 'calc(100% - 255px)',
      minHeight: '100vh', backgroundColor: C.ice,
      padding: isMobile ? '1rem' : '2rem',
      boxSizing: 'border-box', marginLeft: isMobile ? '0' : '255px',
      overflowX: 'hidden', fontFamily: "'Segoe UI', sans-serif",
    },
    loaderContainer: {
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: '1rem',
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '1.5rem', backgroundColor: 'white',
      borderRadius: '16px', padding: isMobile ? '1.25rem' : '1.75rem 2rem',
      boxShadow: '0 2px 8px rgba(8,131,149,0.08)', borderBottom: `3px solid ${C.primary}`,
      flexWrap: 'wrap', gap: '1rem',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    headerIcon: {
      width: 48, height: 48, borderRadius: '12px', backgroundColor: C.ice,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    headerTitle: { fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: '800', color: C.dark, margin: 0, letterSpacing: '-0.5px' },
    headerSub: { fontSize: '0.875rem', color: C.primary, fontWeight: '500', margin: 0 },
    addButton: {
      padding: isMobile ? '10px 18px' : '10px 22px', backgroundColor: C.primary, color: 'white',
      border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
      transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(8,131,149,0.25)',
    },
    filterSection: {
      backgroundColor: 'white', borderRadius: '12px',
      padding: isMobile ? '1rem' : '1.25rem 1.5rem', marginBottom: '1.5rem',
      boxShadow: '0 2px 8px rgba(8,131,149,0.06)',
    },
    filterLabel: { fontSize: '12px', fontWeight: '700', color: C.dark, marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' },
    filterButtons: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    filterButton: {
      padding: '0.4rem 0.875rem', backgroundColor: C.ice, color: C.dark,
      border: '2px solid transparent', borderRadius: '8px', fontWeight: '600',
      cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease',
    },
    filterButtonActive: { backgroundColor: C.primary, color: 'white', border: `2px solid ${C.primary}` },
    infoBox: {
      background: 'white', border: `1px solid ${C.mint}`,
      borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem',
      borderLeft: `4px solid ${C.primary}`,
    },
    infoText: { color: C.dark, fontSize: '13px', lineHeight: '1.6', margin: 0, fontWeight: '500' },
    assetGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
    },
    assetCard: {
      backgroundColor: 'white', borderRadius: '14px', padding: '1.25rem',
      boxShadow: '0 2px 8px rgba(8,131,149,0.07)', borderLeft: `4px solid ${C.primary}`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease', position: 'relative',
    },
    assetName: { fontSize: '15px', fontWeight: '700', color: C.dark, marginBottom: '1rem' },
    assetDetail: { display: 'flex', alignItems: 'center', marginBottom: '0.6rem', fontSize: '13px' },
    detailLabel: { fontWeight: '600', color: C.dark, minWidth: '110px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' },
    detailValue: { color: C.primary, flex: 1, fontWeight: '500' },
    issueBlock: {
      backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '20px',
      padding: '2px 12px', cursor: 'pointer', fontSize: '12px', color: '#92400e',
      fontWeight: '600', transition: 'all 0.2s',
    },
    noIssueText: { color: '#10b981', fontWeight: '500', fontSize: '13px' },
    statusBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    actionButtons: {
      display: 'flex', gap: '0.5rem', marginTop: '1rem',
      paddingTop: '1rem', borderTop: `1px solid ${C.ice}`,
    },
    iconButton: {
      padding: '0.5rem', backgroundColor: C.ice, border: 'none', borderRadius: '8px',
      cursor: 'pointer', transition: 'background 0.2s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1,
    },
    // ── Issue Modal ──
    modalOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
    },
    issueModal: {
      backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem',
      maxWidth: '480px', width: '100%', maxHeight: '80vh', overflow: 'auto',
      boxShadow: '0 20px 60px rgba(8,131,149,0.2)',
    },
    issueModalHeader: {
      fontSize: '18px', fontWeight: '800', color: C.dark,
      marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    closeBtn: {
      background: C.ice, border: 'none', width: 32, height: 32, borderRadius: '8px',
      cursor: 'pointer', color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    issueDetailRow: { marginBottom: '14px' },
    issueDetailLabel: { fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' },
    issueDetailValue: { fontSize: '14px', color: '#374151', lineHeight: '1.6' },
    issueStatusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    navButtons: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' },
    navBtn: {
      fontSize: '18px', fontWeight: 'bold', padding: '4px 14px', borderRadius: '8px',
      border: `2px solid ${C.ice}`, cursor: 'pointer', background: C.ice, color: C.dark, transition: 'all 0.15s',
    },
    // ── QR Modal ──
    qrModal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem',
    },
    qrModalContent: {
      background: 'white', borderRadius: '16px', padding: isMobile ? '1.5rem' : '2rem',
      maxWidth: '380px', width: '100%', textAlign: 'center', position: 'relative',
      boxShadow: '0 20px 60px rgba(8,131,149,0.2)',
    },
    qrModalHeader: { fontSize: '18px', fontWeight: '700', color: C.dark, marginBottom: '1.5rem' },
    qrModalImage: {
      width: isMobile ? '180px' : '220px', height: isMobile ? '180px' : '220px',
      margin: '0 auto 1.5rem', display: 'block',
      border: `2px solid ${C.mint}`, borderRadius: '10px',
    },
    qrImage: { width: '22px', height: '22px', display: 'block' },
    downloadButton: {
      padding: '10px 24px', background: C.primary, color: 'white', border: 'none',
      borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px',
      display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
      margin: '0 auto', transition: 'background 0.2s ease',
      boxShadow: '0 2px 8px rgba(8,131,149,0.25)',
    },
    closeButton: {
      position: 'absolute', top: '1rem', right: '1rem', background: C.ice,
      border: 'none', borderRadius: '50%', width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: C.primary, transition: 'background 0.2s ease',
    },
    emptyState: { textAlign: 'center', padding: '3rem', color: C.primary, gridColumn: '1 / -1' },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <Loader2 size={48} className="animate-spin" color={C.primary} />
          <p style={{ color: C.dark, fontSize: '16px', fontWeight: '500' }}>Loading asset data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}><Cpu size={24} color={C.primary} /></div>
          <div>
            <h1 style={styles.headerTitle}>{pcData.PC_Name} · {pcData.Lab?.Lab_ID}</h1>
            <p style={styles.headerSub}>Asset inventory and management</p>
          </div>
        </div>
        <button
          style={styles.addButton}
          onClick={() => setShowAddModal(true)}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Asset
        </button>
      </header>

      {/* ── Filter ── */}
      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>Filter by Asset Type</label>
        <div style={styles.filterButtons}>
          <button style={{ ...styles.filterButton, ...(selectedType === "All" ? styles.filterButtonActive : {}) }} onClick={() => setSelectedType("All")}>All Types</button>
          {assetTypes.map(type => (
            <button key={type} style={{ ...styles.filterButton, ...(selectedType === type ? styles.filterButtonActive : {}) }} onClick={() => setSelectedType(type)}>{type}</button>
          ))}
        </div>
      </div>

      {/* ── Info Box ── */}
      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          Showing <strong>{selectedType}</strong> assets for <strong>{pcData.PC_Name}</strong> in <strong>{pcData.Lab?.Lab_ID}</strong>
        </p>
      </div>

      {/* ── Asset Cards ── */}
      <div style={styles.assetGrid}>
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => {
            const statusColors = getStatusColor(asset.Assest_Status);
            return (
              <div key={asset.id || asset._id} style={styles.assetCard}
                onMouseEnter={(e) => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(8,131,149,0.15)'; } }}
                onMouseLeave={(e) => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(8,131,149,0.07)'; } }}
              >
                <div style={styles.assetName}>{asset.Asset_Name}</div>

                {[
                  { icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>, label: 'Asset Type', value: <span style={{ ...styles.detailValue, textTransform: 'capitalize' }}>{asset.Asset_Type === "cpu" || asset.Asset_Type === "ups" ? asset.Asset_Type.toUpperCase() : asset.Asset_Type}</span> },
                  { icon: <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>, label: 'Brand', value: <span style={styles.detailValue}>{asset.Brand || "Not Specified"}</span> },
                ].map((row, i) => (
                  <div key={i} style={styles.assetDetail}>
                    <div style={styles.detailLabel}>{row.icon}{row.label}</div>
                    {row.value}
                  </div>
                ))}

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Status
                  </div>
                  <span style={{ ...styles.statusBadge, backgroundColor: statusColors.bg, color: statusColors.text }}>
                    {asset.Assest_Status}
                  </span>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Issues
                  </div>
                  <div style={{ flex: 1 }}>
                    {asset.Issue_Reported.length > 0 ? (
                      <div style={styles.issueBlock}
                        onClick={() => openIssueModal(asset)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fde68a'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef3c7'; }}
                      >
                        {asset.Issue_Reported.length} Issue{asset.Issue_Reported.length !== 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div style={styles.noIssueText}>No Issues</div>
                    )}
                  </div>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" /></svg>
                    QR Code
                  </div>
                  <div style={{ cursor: 'pointer' }} onClick={() => setViewingQR(asset)} title="Click to view QR code">
                    <img src={asset.QR_Code} alt="QR" style={{ width: 22, height: 22, display: 'block' }} />
                  </div>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <Sparkles size={14} color={C.primary} />
                    AI Insights
                  </div>
                  <div
                    onClick={() => setViewingAI(asset)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.primary; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.ice; e.currentTarget.style.color = C.primary; }}
                    style={{ padding: '3px 12px', backgroundColor: C.ice, borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: C.primary, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    View Report
                  </div>
                </div>

                <div style={styles.actionButtons}>
                  <button style={{ ...styles.iconButton, color: C.primary }} onClick={() => handleEditAsset(asset)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.mint}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  </button>
                  <button style={{ ...styles.iconButton, color: '#ef4444' }} onClick={() => handleDeleteAsset(asset.id || asset._id)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.ice}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <PackagePlus size={40} color={C.sky} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '600', color: C.dark }}>No assets found for the selected type.</p>
          </div>
        )}
      </div>

      {/* ── Issue Modal ── */}
      {viewingIssue && (
        <div style={styles.modalOverlay} onClick={() => setViewingIssue(null)}>
          <div style={styles.issueModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.issueModalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#92400e" />
                <span>Issue Details</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setViewingIssue(null)}>✕</button>
            </div>

            {viewingIssue.Issue_Reported.length > 1 && (
              <div style={styles.navButtons}>
                <button style={styles.navBtn} onClick={prevIssue} disabled={currentIssueIndex === 0}>‹ Prev</button>
                <span style={{ fontSize: '13px', color: C.dark, fontWeight: '600', alignSelf: 'center' }}>
                  {currentIssueIndex + 1} / {viewingIssue.Issue_Reported.length}
                </span>
                <button style={styles.navBtn} onClick={nextIssue} disabled={currentIssueIndex === viewingIssue.Issue_Reported.length - 1}>Next ›</button>
              </div>
            )}

            {(() => {
              const issue = viewingIssue.Issue_Reported[currentIssueIndex];
              return (
                <>
                  {[
                    { label: 'Asset Name', value: viewingIssue.Asset_Name },
                    { label: 'Faculty Name', value: issue.FacultyDetails?.Name || "N/A" },
                    { label: 'Issue Description', value: issue.IssueDescription },
                    ...(issue.Status === 'resolved by technician' ? [{ label: 'Resolve Description', value: issue.ResolveDescription }] : []),
                  ].map((row, i) => (
                    <div key={i} style={{ ...styles.issueDetailRow, backgroundColor: C.ice, borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={styles.issueDetailLabel}>{row.label}</div>
                      <div style={styles.issueDetailValue}>{row.value}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: '10px' }}>
                    <div style={styles.issueDetailLabel}>Status</div>
                    <span style={{ ...styles.issueStatusBadge, ...getIssueStatusColor(issue.Status) }}>
                      {formatStatus(issue.Status)}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── QR Modal ── */}
      {viewingQR && (
        <div style={styles.qrModal} onClick={() => setViewingQR(null)}>
          <div style={styles.qrModalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={() => setViewingQR(null)}
              onMouseEnter={(e) => e.currentTarget.style.background = C.mint}
              onMouseLeave={(e) => e.currentTarget.style.background = C.ice}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <QrCode size={20} color={C.primary} />
              <h3 style={styles.qrModalHeader}>{viewingQR.Asset_Name}</h3>
            </div>
            <img src={viewingQR.QR_Code} alt="QR Code" style={styles.qrModalImage} />
            <button style={styles.downloadButton} onClick={() => handleDownloadQR(viewingQR.QR_Code, viewingQR.Asset_Name)}
              onMouseEnter={(e) => e.currentTarget.style.background = C.dark}
              onMouseLeave={(e) => e.currentTarget.style.background = C.primary}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* AI Asset Intelligence Report Modal */}
      {viewingAI && (
        <div style={styles.qrModal} onClick={() => setViewingAI(null)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: isMobile ? '1.5rem' : '0 2rem 1.5rem',
            maxWidth: '480px', width: isMobile ? '100%' : '90%',
            position: 'relative', maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(8,131,149,0.2)',
          }} onClick={(e) => e.stopPropagation()}>

            <div style={{
              position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10,
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem',
              borderBottom: `2px solid ${C.ice}`, marginBottom: '1.25rem',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={20} color={C.primary} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: C.dark }}>AI Asset Intelligence</h2>
                <p style={{ margin: 0, fontSize: '12px', color: C.primary, fontWeight: '500' }}>{viewingAI.Asset_Name}</p>
              </div>
              <button
                style={{ marginLeft: 'auto', background: C.ice, border: 'none', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setViewingAI(null)}
              >✕</button>
            </div>

            {viewingAI.AI_Predictions ? (
              <div>
                {[
                  {
                    label: 'Failure Probability',
                    value: `${(viewingAI.AI_Predictions.failureProbability * 100).toFixed(2)}%`,
                    accent: viewingAI.AI_Predictions.failureProbability > 0.6 ? '#fee2e2' : C.mint,
                    textColor: viewingAI.AI_Predictions.failureProbability > 0.6 ? '#991b1b' : '#065f46',
                  },
                  {
                    label: 'Failure Prediction',
                    value: viewingAI.AI_Predictions.failurePrediction === 1 ? 'High Risk' : 'Low Risk',
                    accent: viewingAI.AI_Predictions.failurePrediction === 1 ? '#fee2e2' : C.mint,
                    textColor: viewingAI.AI_Predictions.failurePrediction === 1 ? '#991b1b' : '#065f46',
                  },
                  { label: 'Remaining Life', value: `${viewingAI.AI_Predictions.remainingLifePrediction?.toFixed(1)} Years`, accent: C.ice, textColor: C.dark },
                  { label: 'Predicted Book Value', value: `₹${viewingAI.AI_Predictions.depreciationPrediction?.toFixed(0)}`, accent: C.ice, textColor: C.dark },
                  { label: 'Next Year Maintenance', value: `₹${viewingAI.AI_Predictions.maintenanceCostPrediction?.toFixed(0)}`, accent: C.ice, textColor: C.dark },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: '10px', marginBottom: '8px',
                    backgroundColor: row.accent,
                  }}>
                    <span style={{ fontSize: '13px', color: C.dark, fontWeight: '600' }}>{row.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: row.textColor }}>{row.value}</span>
                  </div>
                ))}

                {/* Recommendation */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', borderRadius: '10px', marginBottom: '1.25rem',
                  backgroundColor: viewingAI.AI_Predictions.recommendation === 'Replace' ? '#fee2e2' : C.mint,
                  border: `2px solid ${viewingAI.AI_Predictions.recommendation === 'Replace' ? '#fca5a5' : '#6ee7b7'}`,
                }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark }}>Recommendation</span>
                  <span style={{
                    fontSize: '15px', fontWeight: '800',
                    color: viewingAI.AI_Predictions.recommendation === 'Replace' ? '#991b1b' : '#065f46',
                  }}>
                    {viewingAI.AI_Predictions.recommendation}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: C.primary, fontSize: '14px', fontWeight: '500' }}>
                <Sparkles size={36} color={C.sky} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                No AI predictions yet. Generate a report below.
              </div>
            )}

            {/* Generate / Regenerate */}
            <button
              onClick={handleGenerateAI}
              disabled={aiLoading}
              onMouseEnter={(e) => { if (!aiLoading) e.currentTarget.style.backgroundColor = C.dark; }}
              onMouseLeave={(e) => { if (!aiLoading) e.currentTarget.style.backgroundColor = C.primary; }}
              style={{
                width: '100%', padding: '11px', backgroundColor: aiLoading ? '#9ca3af' : C.primary,
                color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700',
                cursor: aiLoading ? 'not-allowed' : 'pointer', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s', boxShadow: aiLoading ? 'none' : '0 2px 8px rgba(8,131,149,0.25)',
              }}
            >
              {aiLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><Sparkles size={16} />{viewingAI.AI_Predictions ? 'Regenerate AI Report' : 'Generate AI Report'}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? '1rem' : '0' }}
          onClick={() => { setShowAddModal(false); setEditingAsset(null); resetForm(); }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: isMobile ? '0 1.25rem 1.25rem' : '0 2rem 1.5rem',
            width: isMobile ? '100%' : '90%', maxWidth: '560px',
            maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(8,131,149,0.2)',
          }} onClick={(e) => e.stopPropagation()}>

            <div style={{
              position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10,
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem',
              borderBottom: `2px solid ${C.ice}`, marginBottom: '1.25rem',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PackagePlus size={20} color={C.primary} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: C.dark }}>
                {editingAsset ? "Edit Asset" : "Add New Asset"}
              </h2>
            </div>

            {/* Basic Info */}
            <div style={{ backgroundColor: C.ice, borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.875rem', fontSize: '11px', fontWeight: '800', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Asset Name</label>
                  <input type="text" style={inputStyle} value={newAsset.Asset_Name} onChange={(e) => setNewAsset({ ...newAsset, Asset_Name: e.target.value })} placeholder="e.g., Monitor-01"
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = C.ice} />
                </div>
                <div>
                  <label style={labelStyle}>Asset Type</label>
                  <select style={selectStyle} value={newAsset.Asset_Type} onChange={(e) => setNewAsset({ ...newAsset, Asset_Type: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = C.ice}>
                    {assetTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Brand Name</label>
                  <input type="text" style={inputStyle} value={newAsset.Brand} onChange={(e) => setNewAsset({ ...newAsset, Brand: e.target.value })} placeholder="e.g., Dell"
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = C.ice} />
                </div>
                <div>
                  <label style={labelStyle}>Asset Status</label>
                  <select style={selectStyle} value={newAsset.Assest_Status} onChange={(e) => setNewAsset({ ...newAsset, Assest_Status: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = C.primary} onBlur={(e) => e.target.style.borderColor = C.ice}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div style={{ backgroundColor: C.ice, borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.875rem', fontSize: '11px', fontWeight: '800', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Purchase Year', key: 'purchase_year', placeholder: 'e.g., 2021' },
                  { label: 'Purchase Cost (₹)', key: 'purchase_cost', placeholder: 'e.g., 15000' },
                  { label: 'Scrap Value (₹)', key: 'scrap_value', placeholder: 'e.g., 500' },
                  { label: 'Useful Life (Years)', key: 'useful_life', placeholder: 'e.g., 5' },
                  { label: 'Breakdown Frequency', key: 'breakdown_frequency', placeholder: 'e.g., 2' },
                  { label: 'Maintenance Cost (₹)', key: 'total_maintenance_cost', placeholder: 'e.g., 2000' },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ ...labelStyle, color: '#065f46' }}>{field.label}</label>
                    <input type="number" style={{ ...inputStyle, backgroundColor: 'white' }}
                      value={newAsset.Financial_Details[field.key]}
                      onChange={(e) => setNewAsset({ ...newAsset, Financial_Details: { ...newAsset.Financial_Details, [field.key]: e.target.value } })}
                      placeholder={field.placeholder}
                      onFocus={(e) => e.target.style.borderColor = C.primary}
                      onBlur={(e) => e.target.style.borderColor = C.ice}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ ...labelStyle, color: '#065f46' }}>Usage Frequency</label>
                  <select
                    style={{ ...selectStyle, backgroundColor: 'white' }}
                    value={newAsset.Financial_Details.usage_frequency || ""}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        Financial_Details: {
                          ...newAsset.Financial_Details,
                          usage_frequency: e.target.value
                        }
                      })
                    }
                    onFocus={(e) => (e.target.style.borderColor = '#088395')}
                    onBlur={(e) => (e.target.style.borderColor = '#EBF4F6')}
                  >
                    <option value="">Select Usage</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label style={{ ...labelStyle, color: '#065f46' }}>Warranty (Years)</label>
                  <input
                    type="number"
                    style={{ ...inputStyle, backgroundColor: 'white' }}
                    value={newAsset.Financial_Details.warranty || ""}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        Financial_Details: {
                          ...newAsset.Financial_Details,
                          warranty: e.target.value
                        }
                      })
                    }
                    placeholder="e.g., 5"
                    onFocus={(e) => (e.target.style.borderColor = '#088395')}
                    onBlur={(e) => (e.target.style.borderColor = '#EBF4F6')}
                  />
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => { setShowAddModal(false); setEditingAsset(null); resetForm(); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.ice}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                style={{ flex: 1, padding: '11px', backgroundColor: 'white', color: '#6b7280', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'background 0.15s' }}
              >
                Cancel
              </button>
              <button
                onClick={editingAsset ? handleUpdateAsset : handleAddAsset}
                disabled={saving}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = C.dark; }}
                onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = C.primary; }}
                style={{
                  flex: 1, padding: '11px', backgroundColor: saving ? '#9ca3af' : C.primary,
                  color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700',
                  cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'background 0.2s', boxShadow: saving ? 'none' : '0 2px 8px rgba(8,131,149,0.25)',
                }}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" />{editingAsset ? "Updating..." : "Adding..."}</>
                ) : (
                  editingAsset ? "Update Asset" : "Add Asset"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetsPage;