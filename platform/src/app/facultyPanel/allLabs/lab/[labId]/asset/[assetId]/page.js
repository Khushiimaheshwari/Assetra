'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Loader2, Cpu, AlertTriangle, QrCode } from 'lucide-react';

const AssetsPage = () => {
  const { assetId: id } = useParams();
  const { data: session } = useSession();
  const [faculty, setFaculty] = useState([]);
  const [pcData, setPcData] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [viewingQR, setViewingQR] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
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

  useEffect(() => {
    if (session) {
      setFaculty(prev => ({
        ...prev,
        facultyName: session.user.name,
        facultyId: session.user.id
      }));
    }
  }, [session]);

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

  useEffect(() => {
    fetchPC();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredAssets = selectedType === "All"
    ? assets
    : assets.filter(asset => asset.Asset_Type === selectedType.toLowerCase());

  const handleRaiseIssue = async () => {
    if (!issueForm.asset_id || !issueForm.facultyId || !issueForm.issueDescription) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      asset_id: issueForm.asset_id,
      facultyId: issueForm.facultyId,
      description: issueForm.issueDescription,
    };
    console.log(payload);

    try {
      const res = await fetch("/api/faculty/raiseIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong!");
        return;
      }

      alert("Issue raised successfully!");
      setAddingIssue(null);
      setIssueForm({ facultyId: '', issueDescription: '' });
      await fetchPC();

    } catch (err) {
      console.error("Raise Issue Error:", err);
      alert("Something went wrong while adding Faculty.");
    }
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

  const handleApproveIssue = async (issueId, asset_id) => {
    if (!asset_id || !issueId) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/faculty/approveIssueResolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id, issueId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong!");
        return;
      }

      alert("Resolve Approved successfully!");
      setViewingIssue(null);
      await fetchPC();

    } catch (err) {
      console.error("Update Asset Error:", err);
      alert("Something went wrong while updating asset.");
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

  // ── Assetra palette ──
  const getIssueStatusColor = (status) => {
    switch (status) {
      case "pending":                return { backgroundColor: '#fef3c7', color: '#92400e' };
      case "resolved by technician": return { backgroundColor: '#D1F8EF', color: '#088395' };
      case "approved":               return { backgroundColor: 'rgba(54,116,181,0.1)', color: '#3674B5' };
      default:                       return { backgroundColor: '#EBF4F6', color: '#176B87' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Yes":   return { bg: '#D1F8EF',                 text: '#088395' };
      case "No":    return { bg: 'rgba(54,116,181,0.1)',     text: '#3674B5' };
      case "Other": return { bg: '#fef3c7',                 text: '#92400e' };
      default:      return { bg: '#EBF4F6',                 text: '#176B87' };
    }
  };

  const styles = {
    // ── Layout ──────────────────────────────────────────────────────
    loaderContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#EBF4F6',
      flexDirection: 'column',
      gap: '1rem',
    },
    loaderText: {
      color: '#176B87',
      fontSize: '16px',
      fontWeight: '600',
    },
    container: {
      width: isMobile ? '100%' : isTablet ? 'calc(100% - 200px)' : 'calc(100% - 255px)',
      minHeight: '100vh',
      backgroundColor: '#EBF4F6',
      padding: isMobile ? '0.75rem' : isTablet ? '1.5rem' : '2rem',
      boxSizing: 'border-box',
      marginLeft: isMobile ? '0' : isTablet ? '200px' : '255px',
      overflowX: 'hidden',
    },

    // ── Header ──────────────────────────────────────────────────────
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      background: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      border: '1px solid rgba(8,131,149,0.1)',
      borderBottom: '3px solid #088395',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    headerIcon: {
      width: isMobile ? 44 : 52,
      height: isMobile ? 44 : 52,
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #D1F8EF 0%, #c8f5ec 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 4px rgba(8,131,149,0.15)',
    },
    headerTitle: {
      fontSize: isMobile ? '1.2rem' : isTablet ? '1.5rem' : '1.75rem',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px',
    },
    headerSub: {
      fontSize: '0.875rem',
      color: '#088395',
      fontWeight: 600,
      margin: 0,
    },

    // ── Filter ──────────────────────────────────────────────────────
    filterSection: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1rem' : '1.25rem 1.5rem',
      marginBottom: isMobile ? '1.25rem' : '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      border: '1px solid rgba(8,131,149,0.1)',
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#176B87',
      marginBottom: '0.75rem',
      display: 'block',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    filterButtons: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    filterButton: {
      padding: '0.4rem 0.875rem',
      backgroundColor: '#EBF4F6',
      color: '#176B87',
      border: '2px solid transparent',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '13px',
      transition: 'all 0.2s ease',
    },
    filterButtonActive: {
      backgroundColor: '#088395',
      color: 'white',
      border: '2px solid #088395',
    },

    // ── Info Box ────────────────────────────────────────────────────
    infoBox: {
      background: 'white',
      border: '1px solid rgba(8,131,149,0.1)',
      borderLeft: '4px solid #088395',
      borderRadius: '10px',
      padding: '12px 16px',
      marginBottom: isMobile ? '1.25rem' : '1.5rem',
    },
    infoText: {
      color: '#176B87',
      fontSize: '13px',
      lineHeight: '1.6',
      margin: 0,
      fontWeight: 500,
    },

    // ── Asset Grid ──────────────────────────────────────────────────
    assetGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: isMobile ? '1rem' : '1.25rem',
    },

    // ── Asset Card ──────────────────────────────────────────────────
    assetCard: {
      backgroundColor: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1.25rem' : '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      border: '1px solid rgba(8,131,149,0.1)',
      borderLeft: '4px solid #088395',
      transition: 'all 0.3s ease',
      position: 'relative',
    },
    assetName: {
      fontSize: isMobile ? '15px' : '17px',
      fontWeight: 800,
      color: '#176B87',
      marginBottom: '1rem',
      letterSpacing: '-0.3px',
    },
    assetDetail: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.6rem',
      fontSize: '13px',
    },
    detailLabel: {
      fontWeight: 700,
      color: '#3674B5',
      minWidth: '110px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
    },
    detailValue: {
      color: '#176B87',
      flex: 1,
      fontWeight: 600,
      fontSize: '13px',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },

    // ── Issue Row ───────────────────────────────────────────────────
    issueContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      gap: '0.5rem',
    },
    issueBlock: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fbbf24',
      borderRadius: '20px',
      padding: '3px 12px',
      cursor: 'pointer',
      fontSize: '12px',
      color: '#92400e',
      fontWeight: 700,
      transition: 'all 0.2s',
    },
    noIssueText: {
      color: '#088395',
      fontWeight: 600,
      fontSize: '13px',
    },
    addIssueBtn: {
      backgroundColor: '#088395',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '4px 12px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: 700,
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    qrImage: {
      width: '22px',
      height: '22px',
      display: 'block',
      borderRadius: '4px',
    },

    // ── Modal Overlay ───────────────────────────────────────────────
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },

    // ── Issue Modal ─────────────────────────────────────────────────
    issueModal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: isMobile ? '1.25rem' : '1.5rem',
      maxWidth: '480px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(8,131,149,0.3)',
      border: '1px solid rgba(8, 131, 149, 0.1)',
    },
    issueModalHeader: {
      fontSize: isMobile ? '17px' : '20px',
      fontWeight: 800,
      color: '#176B87',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '12px',
      borderBottom: '2px solid #D1F8EF',
      letterSpacing: '-0.3px',
    },
    closeBtn: {
      background: '#EBF4F6',
      border: 'none',
      width: 32,
      height: 32,
      borderRadius: '8px',
      cursor: 'pointer',
      color: '#176B87',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 700,
      transition: 'background 0.2s',
    },
    issueDetailRow: {
      marginBottom: '10px',
      backgroundColor: '#EBF4F6',
      borderRadius: '8px',
      padding: '10px 14px',
    },
    issueDetailLabel: {
      fontSize: '11px',
      fontWeight: 700,
      color: '#3674B5',
      textTransform: 'uppercase',
      marginBottom: '4px',
      letterSpacing: '0.05em',
    },
    issueDetailValue: {
      fontSize: '14px',
      color: '#176B87',
      lineHeight: '1.6',
      fontWeight: 500,
    },
    issueStatusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
    },
    navButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1rem',
      gap: '0.5rem',
    },
    navBtn: {
      fontSize: '14px',
      fontWeight: 700,
      padding: '6px 14px',
      borderRadius: '8px',
      border: '2px solid #EBF4F6',
      cursor: 'pointer',
      background: '#EBF4F6',
      color: '#176B87',
      transition: 'all 0.15s',
    },
    approveButton: {
      padding: isMobile ? '10px 14px' : '14px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      fontSize: isMobile ? '13px' : '15px',
      transition: 'all 0.3s ease',
      width: '100%',
      marginTop: '12px',
      boxShadow: '0 4px 6px rgba(8,131,149,0.3)',
      letterSpacing: '0.3px',
    },
    formGroup: {
      marginBottom: '16px',
    },
    formLabel: {
      display: 'block',
      fontSize: '11px',
      fontWeight: 700,
      color: '#176B87',
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    textarea: {
      width: '100%',
      padding: '14px',
      border: '2px solid rgba(8,131,149,0.2)',
      borderRadius: '10px',
      fontSize: '15px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      color: '#176B87',
      fontWeight: 500,
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '14px',
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8,131,149,0.3)',
      letterSpacing: '0.3px',
    },

    // ── QR Modal ────────────────────────────────────────────────────
    qrModal: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
    },
    qrModalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: isMobile ? '1.5rem' : '2rem',
      maxWidth: '380px',
      width: '100%',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 20px 60px rgba(8,131,149,0.3)',
      border: '1px solid rgba(8, 131, 149, 0.1)',
    },
    qrModalHeader: {
      fontSize: '18px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.3px',
    },
    qrModalImage: {
      width: isMobile ? '180px' : '220px',
      height: isMobile ? '180px' : '220px',
      margin: '0 auto 1.5rem',
      display: 'block',
      border: '2px solid #D1F8EF',
      borderRadius: '10px',
    },
    downloadButton: {
      padding: '14px 24px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: 'center',
      margin: '0 auto',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8,131,149,0.3)',
      letterSpacing: '0.3px',
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: '#EBF4F6',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#088395',
      transition: 'background 0.2s ease',
    },
    emptyState: {
      textAlign: 'center',
      padding: '44px 24px',
      color: '#3674B5',
      fontSize: '15px',
      fontWeight: 600,
      fontStyle: 'italic',
      gridColumn: '1 / -1',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <Loader2 size={48} className="animate-spin" color="#088395" />
          <p style={styles.loaderText}>Loading asset data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Cpu size={24} color="#088395" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>{pcData.PC_Name} · {pcData.Lab?.Lab_ID}</h1>
            <p style={styles.headerSub}>Asset inventory</p>
          </div>
        </div>
      </header>

      {/* Filter Section */}
      <div style={styles.filterSection}>
        <label style={styles.filterLabel}>Filter by Asset Type</label>
        <div style={styles.filterButtons}>
          <button
            style={{ ...styles.filterButton, ...(selectedType === "All" ? styles.filterButtonActive : {}) }}
            onClick={() => setSelectedType("All")}
          >
            All Types
          </button>
          {assetTypes.map(type => (
            <button
              key={type}
              style={{ ...styles.filterButton, ...(selectedType === type ? styles.filterButtonActive : {}) }}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          Showing <strong>{selectedType}</strong> assets for{' '}
          <strong>{pcData.PC_Name}</strong> in{' '}
          <strong>{pcData.Lab?.Lab_ID}</strong>
        </p>
      </div>

      {/* Asset Cards Grid */}
      <div style={styles.assetGrid}>
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => {
            const statusColors = getStatusColor(asset.Assest_Status);
            return (
              <div
                key={asset.id}
                style={styles.assetCard}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8,131,149,0.15), 0 4px 6px -2px rgba(8,131,149,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(8,131,149,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(8,131,149,0.1)';
                  }
                }}
              >
                <div style={styles.assetName}>{asset.Asset_Name}</div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#3674B5' }}>
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Asset Type
                  </div>
                  <div style={{ ...styles.detailValue, textTransform: 'capitalize' }}>
                    {asset.Asset_Type === "cpu" || asset.Asset_Type === "ups" ? asset.Asset_Type.toUpperCase() : asset.Asset_Type}
                  </div>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#3674B5' }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Brand Name
                  </div>
                  <div style={styles.detailValue}>
                    {asset.Brand || "Not Specified"}
                  </div>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#3674B5' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Status
                  </div>
                  <span style={{ ...styles.statusBadge, backgroundColor: statusColors.bg, color: statusColors.text }}>
                    {asset.Assest_Status === "Yes" ? "Yes" : asset.Assest_Status === "No" ? "No" : "Other"}
                  </span>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#3674B5' }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Issues
                  </div>
                  <div style={styles.issueContainer}>
                    {asset.Issue_Reported.length > 0 ? (
                      <div
                        style={styles.issueBlock}
                        onClick={() => openIssueModal(asset)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fde68a';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef3c7';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {asset.Issue_Reported.length} Issue{asset.Issue_Reported.length !== 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div style={styles.noIssueText}>No Issues</div>
                    )}

                    <button
                      style={styles.addIssueBtn}
                      onClick={() => {
                        setAddingIssue(asset);
                        setIssueForm({
                          asset_id: asset._id,
                          facultyId: faculty.facultyId,
                          issueDescription: ""
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#176B87';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#088395';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Issue
                    </button>
                  </div>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#3674B5' }}>
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                    </svg>
                    QR Code
                  </div>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => setViewingQR(asset)}
                    title="Click to view QR code"
                  >
                    <img src={asset.QR_Code} alt="QR Code" style={styles.qrImage} />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            No assets found for the selected type.
          </div>
        )}
      </div>

      {/* View Issue Modal */}
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
                <button style={styles.navBtn} onClick={prevIssue} disabled={currentIssueIndex === 0}>
                  ‹ Prev
                </button>
                <span style={{ fontSize: '13px', color: '#176B87', fontWeight: '700', alignSelf: 'center' }}>
                  {currentIssueIndex + 1} / {viewingIssue.Issue_Reported.length}
                </span>
                <button style={styles.navBtn} onClick={nextIssue} disabled={currentIssueIndex === viewingIssue.Issue_Reported.length - 1}>
                  Next ›
                </button>
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

                  {issue.Status === 'resolved by technician' && (
                    <button
                      style={styles.approveButton}
                      onClick={() => handleApproveIssue(issue._id, viewingIssue._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 10px rgba(8,131,149,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(8,131,149,0.3)';
                      }}
                    >
                      Approve
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {addingIssue && (
        <div style={styles.modalOverlay} onClick={() => setAddingIssue(null)}>
          <div style={styles.issueModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.issueModalHeader}>
              <span>Report Issue</span>
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
                onFocus={(e) => e.target.style.borderColor = '#088395'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8,131,149,0.2)'}
              />
            </div>

            <button
              style={{ ...styles.submitBtn, opacity: !issueForm.issueDescription ? 0.6 : 1 }}
              onClick={handleRaiseIssue}
              disabled={!issueForm.issueDescription}
              onMouseEnter={(e) => {
                if (issueForm.issueDescription) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 10px rgba(8,131,149,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(8,131,149,0.3)';
              }}
            >
              Raise Issue
            </button>
          </div>
        </div>
      )}

      {/* QR Code Viewer Modal */}
      {viewingQR && (
        <div style={styles.qrModal} onClick={() => setViewingQR(null)}>
          <div style={styles.qrModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.closeButton}
              onClick={() => setViewingQR(null)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#D1F8EF'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#EBF4F6'}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <QrCode size={20} color="#088395" />
              <h3 style={styles.qrModalHeader}>{viewingQR.Asset_Name}</h3>
            </div>

            <img src={viewingQR.QR_Code} alt="QR Code" style={styles.qrModalImage} />

            <button
              style={styles.downloadButton}
              onClick={() => handleDownloadQR(viewingQR.QR_Code, viewingQR.Asset_Name)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 10px rgba(8,131,149,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(8,131,149,0.3)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download QR Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetsPage;