'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Loader2, Cpu, AlertTriangle, QrCode, PackagePlus, IndianRupee } from 'lucide-react';
import { toast } from 'react-toastify';

const AssetsPage = () => {
  const { assetId: id } = useParams();
  const { data: session } = useSession();

  // ── State (faculty logic — unchanged) ──
  const [faculty, setFaculty] = useState([]);
  const [pcData, setPcData] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
const [viewingQR, setViewingQR] = useState(null);
  const [viewingFinancial, setViewingFinancial] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [assets, setAssets] = useState([]);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [addingIssue, setAddingIssue] = useState(null);
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [issueForm, setIssueForm] = useState({
    asset_id: '',
    facultyId: '',
    issueDescription: ''
  });

  const assetTypes = ["Monitor", "Keyboard", "Mouse", "CPU", "UPS", "Other"];

  // ── Session (faculty logic — unchanged) ──
  useEffect(() => {
    if (session) {
      setFaculty(prev => ({
        ...prev,
        facultyName: session.user.name,
        facultyId: session.user.id
      }));
    }
  }, [session]);

  // ── Fetch (faculty logic — unchanged) ──
  const fetchPC = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/faculty/getPcById/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPcData(data.pc);
        setAssets(data.pc.Assets);
        console.log(data.pc.Assets);
      } else {
        console.error("Failed to fetch PC:", data.error);
      }
    } catch (err) {
      console.error("Error fetching PC:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPC(); }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredAssets = selectedType === "All"
    ? assets
    : assets.filter(asset => asset.Asset_Type === selectedType.toLowerCase());

  // ── Raise Issue (faculty logic — unchanged) ──
  const handleRaiseIssue = async () => {
    if (!issueForm.asset_id || !issueForm.facultyId || !issueForm.issueDescription) {
      toast.warning("Please fill all required fields"); return;
    }
    try {
      const res = await fetch("/api/faculty/raiseIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: issueForm.asset_id,
          facultyId: issueForm.facultyId,
          description: issueForm.issueDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Something went wrong!"); return; }
      toast.success("Issue raised successfully!");
      setAddingIssue(null);
      setIssueForm({ facultyId: '', issueDescription: '' });
      await fetchPC();
    } catch (err) {
      console.error("Raise Issue Error:", err);
      toast.error("Something went wrong while adding faculty.");
    }
  };

  // ── Approve Issue (faculty logic — unchanged) ──
  const handleApproveIssue = async (issueId, asset_id) => {
    if (!asset_id || !issueId) { toast.warning("Please fill all required fields"); return; }
    try {
      const res = await fetch("/api/faculty/approveIssueResolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id, issueId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Something went wrong!"); return; }
      toast.success("Resolve approved successfully!");
      setViewingIssue(null);
      await fetchPC();
    } catch (err) {
      console.error("Update Asset Error:", err);
      toast.error("Something went wrong while updating asset.");
    }
  };

  // ── Issue helpers (faculty logic — unchanged) ──
  const openIssueModal = (issue) => { setViewingIssue(issue); setCurrentIssueIndex(0); };
  const nextIssue = () => { if (!viewingIssue) return; setCurrentIssueIndex(p => p + 1 < viewingIssue.Issue_Reported.length ? p + 1 : p); };
  const prevIssue = () => { if (!viewingIssue) return; setCurrentIssueIndex(p => p - 1 >= 0 ? p - 1 : p); };

  function formatStatus(status) {
    if (!status) return "Pending";
    const map = { "pending": "Pending", "resolved by technician": "Resolved By Technician", "approved": "Approved" };
    return map[status] || status;
  }

  // ── QR download (faculty logic — unchanged) ──
  const handleDownloadQR = (qrCodeUrl, assetName) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_${assetName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Design tokens (admin UI) ──
  const C = { primary: '#088395', dark: '#176B87', sky: '#86B6F6', ice: '#EBF4F6', mint: '#D1F8EF' };

  const getIssueStatusColor = (status) => {
    switch (status) {
      case "pending":                return { backgroundColor: '#fef3c7', color: '#92400e' };
      case "resolved by technician": return { backgroundColor: C.mint,    color: '#065f46' };
      case "approved":               return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:                       return { backgroundColor: '#e5e7eb', color: '#374151' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Yes":   return { bg: '#d1fae5', text: '#065f46' };
      case "No":    return { bg: '#fee2e2', text: '#991b1b' };
      case "Other": return { bg: '#fef3c7', text: '#92400e' };
      default:      return { bg: '#e5e7eb', text: '#374151' };
    }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: `2px solid ${C.ice}`, borderRadius: '8px',
    fontSize: '13px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
    color: '#1f2937', backgroundColor: 'white',
  };

  // ── Styles (admin UI) ──
  const styles = {
    container: { width: isMobile ? '100%' : 'calc(100% - 255px)', minHeight: '100vh', backgroundColor: C.ice, padding: isMobile ? '1rem' : '2rem', boxSizing: 'border-box', marginLeft: isMobile ? '0' : '255px', overflowX: 'hidden' },
    loaderContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '1.25rem' : '1.75rem 2rem', boxShadow: '0 2px 8px rgba(8,131,149,0.08)', borderBottom: `3px solid ${C.primary}`, flexWrap: 'wrap', gap: '1rem' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
    headerIcon: { width: 48, height: 48, borderRadius: '12px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    headerTitle: { fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: '800', color: C.dark, margin: 0, letterSpacing: '-0.5px' },
    headerSub: { fontSize: '0.875rem', color: C.primary, fontWeight: '500', margin: 0 },
    filterSection: { backgroundColor: 'white', borderRadius: '12px', padding: isMobile ? '1rem' : '1.25rem 1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(8,131,149,0.06)' },
    filterLabel: { fontSize: '12px', fontWeight: '700', color: C.dark, marginBottom: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' },
    filterButtons: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    filterButton: { padding: '0.4rem 0.875rem', backgroundColor: C.ice, color: C.dark, border: '2px solid transparent', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease' },
    filterButtonActive: { backgroundColor: C.primary, color: 'white', border: `2px solid ${C.primary}` },
    infoBox: { background: 'white', border: `1px solid ${C.mint}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', borderLeft: `4px solid ${C.primary}` },
    infoText: { color: C.dark, fontSize: '13px', lineHeight: '1.6', margin: 0, fontWeight: '500' },
    assetGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
    assetCard: { backgroundColor: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(8,131,149,0.07)', borderLeft: `4px solid ${C.primary}`, transition: 'transform 0.2s ease, box-shadow 0.2s ease', position: 'relative' },
    assetName: { fontSize: '15px', fontWeight: '700', color: C.dark, marginBottom: '1rem' },
    assetDetail: { display: 'flex', alignItems: 'center', marginBottom: '0.6rem', fontSize: '13px' },
    detailLabel: { fontWeight: '600', color: C.dark, minWidth: '110px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' },
    detailValue: { color: C.primary, flex: 1, fontWeight: '500' },
    statusBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    issueBlock: { backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '20px', padding: '2px 12px', cursor: 'pointer', fontSize: '12px', color: '#92400e', fontWeight: '600', transition: 'all 0.2s' },
    noIssueText: { color: '#10b981', fontWeight: '500', fontSize: '13px' },
    addIssueBtn: { padding: '3px 12px', backgroundColor: C.ice, borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: C.primary, cursor: 'pointer', transition: 'all 0.2s', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' },
    qrImage: { width: '22px', height: '22px', display: 'block' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(23, 107, 135, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    issueModal: { backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', maxWidth: '480px', width: '100%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(8,131,149,0.2)', border: '1px solid rgba(8, 131, 149, 0.1)' },
    issueModalHeader: { fontSize: '20px', fontWeight: '800', color: C.dark, marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `2px solid ${C.mint}` },
    closeBtn: { background: C.ice, border: 'none', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
    issueDetailRow: { marginBottom: '12px', backgroundColor: C.ice, borderRadius: '8px', padding: '10px 14px' },
    issueDetailLabel: { fontSize: '11px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' },
    issueDetailValue: { fontSize: '14px', color: '#374151', lineHeight: '1.6' },
    issueStatusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    navButtons: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' },
    navBtn: { fontSize: '14px', fontWeight: '700', padding: '6px 14px', borderRadius: '8px', border: `2px solid ${C.ice}`, cursor: 'pointer', background: C.ice, color: C.dark, transition: 'all 0.15s' },
    approveButton: { padding: '11px', background: `linear-gradient(135deg, ${C.primary} 0%, #0a9fb5 100%)`, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '12px', boxShadow: '0 2px 8px rgba(8,131,149,0.25)', transition: 'background 0.2s' },
    formGroup: { marginBottom: '16px' },
    formLabel: { display: 'block', fontSize: '11px', fontWeight: '700', color: C.dark, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' },
    textarea: { width: '100%', padding: '10px 12px', border: `2px solid ${C.ice}`, borderRadius: '8px', fontSize: '14px', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s', outline: 'none', boxSizing: 'border-box', color: C.dark },
    submitBtn: { flex: 1, padding: '11px', backgroundColor: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(8,131,149,0.25)', width: '100%' },
    qrModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(23, 107, 135, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: isMobile ? '1rem' : '0' },
    qrModalContent: { background: 'white', borderRadius: '16px', padding: isMobile ? '1.5rem' : '2rem', maxWidth: '380px', width: '100%', textAlign: 'center', position: 'relative', boxShadow: '0 20px 60px rgba(8,131,149,0.2)', border: '1px solid rgba(8, 131, 149, 0.1)' },
    qrModalHeader: { fontSize: '18px', fontWeight: '700', color: C.dark, margin: 0 },
    qrModalImage: { width: isMobile ? '180px' : '220px', height: isMobile ? '180px' : '220px', margin: '0 auto 1.5rem', display: 'block', border: `2px solid ${C.mint}`, borderRadius: '10px' },
    downloadButton: { padding: '10px 24px', background: C.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', margin: '0 auto', transition: 'background 0.2s ease', boxShadow: '0 2px 8px rgba(8,131,149,0.25)' },
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', background: C.ice, border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.primary, transition: 'background 0.2s ease' },
    emptyState: { textAlign: 'center', padding: isMobile ? '2rem' : '3rem', color: C.primary, gridColumn: '1 / -1', fontWeight: '600' },
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
            <p style={styles.headerSub}>Asset inventory</p>
          </div>
        </div>
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
          filteredAssets.map((asset) => {
            const statusColors = getStatusColor(asset.Assest_Status);
            return (
              <div key={asset.id || asset._id} style={styles.assetCard}
                onMouseEnter={(e) => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(8,131,149,0.15)'; } }}
                onMouseLeave={(e) => { if (!isMobile) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(8,131,149,0.07)'; } }}
              >
                <div style={styles.assetName}>{asset.Asset_Name}</div>

                {/* Asset Type */}
                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                    Asset Type
                  </div>
                  <span style={{ ...styles.detailValue, textTransform: 'capitalize' }}>
                    {asset.Asset_Type === "cpu" || asset.Asset_Type === "ups" ? asset.Asset_Type.toUpperCase() : asset.Asset_Type}
                  </span>
                </div>

                {/* Brand */}
                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Brand
                  </div>
                  <span style={styles.detailValue}>{asset.Brand || "Not Specified"}</span>
                </div>

                {/* Status */}
                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Status
                  </div>
                  <span style={{ ...styles.statusBadge, backgroundColor: statusColors.bg, color: statusColors.text }}>
                    {asset.Assest_Status}
                  </span>
                </div>

                {/* Issues — faculty logic: show count + Add Issue button */}
                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Issues
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: '1 1 0%', gap: '0.5rem' }}>
                    {asset.Issue_Reported.length > 0 ? (
                      <div style={styles.issueBlock}
                        onClick={() => openIssueModal(asset)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fde68a'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
                      >
                        {asset.Issue_Reported.length} Issue{asset.Issue_Reported.length !== 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div style={styles.noIssueText}>No Issues</div>
                    )}
                    {/* Add Issue button — faculty only */}
                    <button
                      style={styles.addIssueBtn}
                      onClick={() => {
                        setAddingIssue(asset);
                        setIssueForm({ asset_id: asset._id, facultyId: faculty.facultyId, issueDescription: "" });
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.primary; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.ice; e.currentTarget.style.color = C.primary; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                      Add Issue
                    </button>
                  </div>
                </div>

                {/* QR Code */}
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
                  <div style={styles.detailLabel}><IndianRupee size={14} color={C.primary} />Financial</div>
                  <div onClick={() => setViewingFinancial(asset)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.primary; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.ice; e.currentTarget.style.color = C.primary; }}
                    style={{ padding: '3px 12px', backgroundColor: C.ice, borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: C.primary, cursor: 'pointer', transition: 'all 0.2s' }}>
                    View Details
                  </div>
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

      {/* ── View Issue Modal ── */}
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
                    { label: 'Asset Name',        value: viewingIssue.Asset_Name },
                    { label: 'Faculty Name',       value: issue.FacultyDetails?.UserDetails?.Name || "N/A" },
                    { label: 'Issue Description',  value: issue.IssueDescription },
                    ...(issue.Status === 'resolved by technician' ? [{ label: 'Resolve Description', value: issue.ResolveDescription }] : []),
                  ].map((row, i) => (
                    <div key={i} style={styles.issueDetailRow}>
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
                  {/* Approve button — faculty only */}
                  {issue.Status === 'resolved by technician' && (
                    <button style={styles.approveButton}
                      onClick={() => handleApproveIssue(issue._id, viewingIssue._id)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.dark}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = C.primary}
                    >
                      Approve Resolution
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Add Issue Modal ── */}
      {addingIssue && (
        <div style={styles.modalOverlay} onClick={() => setAddingIssue(null)}>
          <div style={styles.issueModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.issueModalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#92400e" />
                <span>Report Issue</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setAddingIssue(null)}>✕</button>
            </div>

            <div style={styles.issueDetailRow}>
              <div style={styles.issueDetailLabel}>Asset</div>
              <div style={styles.issueDetailValue}>{addingIssue.Asset_Name}</div>
            </div>
            <div style={{ ...styles.issueDetailRow, marginBottom: '16px' }}>
              <div style={styles.issueDetailLabel}>Faculty Name</div>
              <div style={styles.issueDetailValue}>{faculty.facultyName}</div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Issue Description *</label>
              <textarea
                style={styles.textarea}
                value={issueForm.issueDescription}
                onChange={(e) => setIssueForm({ ...issueForm, issueDescription: e.target.value })}
                placeholder="Describe the issue in detail..."
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = C.ice}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setAddingIssue(null)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = C.ice}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                style={{ flex: 1, padding: '11px', backgroundColor: 'white', color: '#6b7280', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.submitBtn, opacity: !issueForm.issueDescription ? 0.6 : 1, flex: 1 }}
                onClick={handleRaiseIssue}
                disabled={!issueForm.issueDescription}
                onMouseEnter={(e) => { if (issueForm.issueDescription) e.currentTarget.style.backgroundColor = C.dark; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = C.primary; }}
              >
                Raise Issue
              </button>
            </div>
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

      {/* ── Financial Details Modal ── */}
      {viewingFinancial && (
        <div style={styles.qrModal} onClick={() => setViewingFinancial(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '1.5rem' : '0 2rem 1.5rem', maxWidth: '500px', width: isMobile ? '100%' : '90%', position: 'relative', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(8,131,149,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem', borderBottom: `2px solid ${C.ice}`, marginBottom: '1.25rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: C.ice, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IndianRupee size={20} color={C.primary} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: C.dark }}>Financial Details</h2>
                <p style={{ margin: 0, fontSize: '12px', color: C.primary, fontWeight: '500' }}>{viewingFinancial.Asset_Name}</p>
              </div>
              <button style={{ marginLeft: 'auto', background: C.ice, border: 'none', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', color: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setViewingFinancial(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Purchase Year',        value: viewingFinancial.Financial_Details?.purchase_year        || '—' },
                { label: 'Purchase Cost (₹)',     value: viewingFinancial.Financial_Details?.purchase_cost        ? `₹${viewingFinancial.Financial_Details.purchase_cost}`        : '—' },
                { label: 'Scrap Value (₹)',       value: viewingFinancial.Financial_Details?.scrap_value          ? `₹${viewingFinancial.Financial_Details.scrap_value}`          : '—' },
                { label: 'Useful Life (Years)',   value: viewingFinancial.Financial_Details?.useful_life          ? `${viewingFinancial.Financial_Details.useful_life} yrs`        : '—' },
                { label: 'Breakdown Frequency',  value: viewingFinancial.Financial_Details?.breakdown_frequency  ?? '0' },
                { label: 'Maintenance Cost (₹)', value: viewingFinancial.Financial_Details?.total_maintenance_cost ? `₹${viewingFinancial.Financial_Details.total_maintenance_cost}` : '₹0' },
                { label: 'Usage Frequency',      value: viewingFinancial.Financial_Details?.usage_frequency      || '—' },
                { label: 'Warranty (Years)',      value: viewingFinancial.Financial_Details?.warranty             ? `${viewingFinancial.Financial_Details.warranty} yrs`           : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ backgroundColor: C.ice, borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: C.dark, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: C.primary }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetsPage;