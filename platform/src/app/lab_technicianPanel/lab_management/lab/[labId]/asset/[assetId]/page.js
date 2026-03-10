"use client"
import React, { useEffect, useState } from 'react';
import { Loader2, Cpu } from 'lucide-react';
import { useParams } from "next/navigation";

function AssetsPage() {
  const { assetId: id } = useParams();
  const [pcData, setPcData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [viewingQR, setViewingQR] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isMobile, setIsMobile] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAsset, setNewAsset] = useState({
    Asset_Name: "",
    Asset_Type: "Monitor",
    Assest_Status: "Yes",
    Brand: "",
    QR_Code: ""
  });
  const [viewingIssue, setViewingIssue] = useState(null);
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [issueForm, setIssueForm] = useState({
    resolveDescription: ''
  });
  const assetTypes = ["Monitor", "Keyboard", "Mouse", "CPU", "UPS", "Other"];

  // ── Color palette from second code ──
  const C = {
    primary: '#088395',
    dark:    '#176B87',
    sky:     '#3674B5',
    ice:     '#EBF4F6',
    mint:    '#D1F8EF',
  };

  const fetchPC = async () => { 
    setLoading(true);
    try {
      const res = await fetch(`/api/lab_technician/getPcById/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPcData(data.pc);
        setAssets(data.pc.Assets || []);
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
      const res = await fetch("/api/lab_technician/addAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Asset_Name: newAsset.Asset_Name,
          Asset_Type: newAsset.Asset_Type,
          Assest_Status: newAsset.Assest_Status,
          Brand: newAsset.Brand,
          PC: pcData._id,
          Lab: pcData.Lab?._id,
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
      const res = await fetch("/api/lab_technician/updateAsset", {
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
      const res = await fetch("/api/lab_technician/deleteAsset", {
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
      QR_Code: ""
    });
  };

  const openIssueModal = (issue) => {
    setViewingIssue(issue);
    setCurrentIssueIndex(0);
    setIssueForm({ resolveDescription: "" });
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
      "accepted": "Accepted"
    };
    return map[status] || status;
  }

  const handleResolveIssue = async (issueId, assetId) => {
    if (!assetId || !issueId || !issueForm.resolveDescription) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/lab_technician/resolveIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          issueId,
          resolveDescription: issueForm.resolveDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong!");
        return;
      }

      alert("Issue Resolved successfully!");
      setViewingIssue(null);
      await fetchPC();
    } catch (err) {
      console.error("Update Asset Error:", err);
      alert("Something went wrong while updating asset.");
    } finally {
      setSaving(false);
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

  // ── Status colours updated to match second code's palette ──
  const getIssueStatusColor = (status) => {
    switch(status) {      
      case "pending":                return { backgroundColor: '#fef3c7', color: '#92400e' };
      case "resolved by technician": return { backgroundColor: C.mint,   color: C.dark   };
      case "accepted":               return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:                       return { backgroundColor: C.ice,    color: C.dark   };
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Yes":   return { bg: C.mint,    text: C.dark   };
      case "No":    return { bg: '#fee2e2', text: '#991b1b' };
      case "Other": return { bg: '#fef3c7', text: '#92400e' };
      default:      return { bg: C.ice,     text: C.dark   };
    }
  };

  // ── Styles: same structure as original, palette replaced from second code ──
  const styles = {
    container: {
      width: isMobile ? '100%' : 'calc(100% - 255px)',
      minHeight: '100vh',
      backgroundColor: C.ice,
      padding: isMobile ? '1rem' : '2rem',
      boxSizing: 'border-box',
      marginLeft: isMobile ? '0' : '255px',
      overflowX: 'hidden',
    },
    loaderContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '1rem',
    },
    // ── Header: border, shadow, font weights match second code's labInfoCard ──
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: isMobile ? '1.25rem' : '1.75rem 2rem',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      borderBottom: `2px solid ${C.mint}`,
      flexWrap: 'wrap',
      gap: '1rem',
      border: `1px solid rgba(8,131,149,0.1)`,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    headerIcon: {
      width: 50,
      height: 50,
      borderRadius: '12px',
      background: `linear-gradient(135deg, ${C.mint} 0%, #c8f5ec 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    headerTitle: {
      fontSize: isMobile ? '1.25rem' : '1.75rem',
      fontWeight: '800',
      color: C.dark,
      margin: 0,
      letterSpacing: '-0.5px',
    },
    headerSub: {
      fontSize: '12px',
      color: C.sky,
      fontWeight: '700',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    addButton: {
      padding: isMobile ? '10px 18px' : '10px 20px',
      background: `linear-gradient(135deg, ${C.primary} 0%, #0a9fb5 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: isMobile ? '13px' : '15px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8,131,149,0.3)',
      letterSpacing: '0.3px',
    },
    // ── Filter section: matches second code's card style ──
    filterSection: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: isMobile ? '1rem' : '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      border: '1px solid rgba(8,131,149,0.1)',
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: '700',
      color: C.dark,
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
      padding: '8px 12px',
      backgroundColor: C.ice,
      color: C.dark,
      border: '1px solid rgba(8,131,149,0.25)',
      borderRadius: '999px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s ease',
    },
    filterButtonActive: {
      backgroundColor: C.primary,
      color: 'white',
      border: `1px solid ${C.primary}`,
    },
    infoBox: {
      background: 'white',
      border: `1px solid rgba(8,131,149,0.1)`,
      borderRadius: '12px',
      padding: '12px 16px',
      marginBottom: '1.5rem',
      borderLeft: `4px solid ${C.primary}`,
      boxShadow: '0 2px 4px -1px rgba(8,131,149,0.06)',
    },
    infoText: {
      color: C.dark,
      fontSize: '14px',
      lineHeight: '1.6',
      margin: 0,
      fontWeight: '500',
    },
    assetGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
    },
    // ── Asset card: matches second code's deviceCard / labInfoCard ──
    assetCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      border: `2px solid rgba(8,131,149,0.15)`,
      transition: 'all 0.3s ease',
      position: 'relative',
    },
    assetName: {
      fontSize: '18px',
      fontWeight: '800',
      color: C.dark,
      marginBottom: '1rem',
      letterSpacing: '-0.3px',
      paddingBottom: '14px',
      borderBottom: `2px solid ${C.mint}`,
    },
    assetDetail: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.6rem',
      fontSize: '13px',
    },
    detailLabel: {
      fontWeight: '700',
      color: C.sky,
      minWidth: '110px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    detailValue: {
      color: C.dark,
      flex: 1,
      fontWeight: '600',
      fontSize: '15px',
    },
    statusBadge: {
      display: 'inline-block',
      padding: '5px 14px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '700',
      border: `1px solid ${C.primary}`,
    },
    issueContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
    },
    issueBlock: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fbbf24',
      borderRadius: '12px',
      padding: '4px 14px',
      cursor: 'pointer',
      fontSize: '12px',
      color: '#92400e',
      fontWeight: '700',
      transition: 'all 0.2s',
    },
    noIssueText: {
      color: C.primary,
      fontWeight: '600',
      fontSize: '14px',
    },
    qrImage: {
      width: '22px',
      height: '22px',
      display: 'block',
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      paddingTop: '14px',
      borderTop: `2px solid ${C.mint}`,
    },
    iconButton: {
      padding: isMobile ? '0.625rem' : '0.5rem',
      background: C.ice,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    editButton: {
      color: C.primary,
    },
    deleteButton: {
      color: '#ef4444',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(23,107,135,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    },
    issueModal: {
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '32px 36px',
      maxWidth: '480px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(8,131,149,0.3)',
      border: '1px solid rgba(8,131,149,0.1)',
    },
    issueModalHeader: {
      fontSize: '26px',
      fontWeight: '800',
      color: C.dark,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '16px',
      borderBottom: `2px solid ${C.mint}`,
      letterSpacing: '-0.5px',
    },
    closeBtn: {
      background: C.ice,
      border: 'none',
      width: 32,
      height: 32,
      borderRadius: '8px',
      cursor: 'pointer',
      color: C.dark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
    },
    issueDetailRow: {
      marginBottom: '12px',
    },
    issueDetailLabel: {
      fontSize: '11px',
      fontWeight: '700',
      color: C.sky,
      textTransform: 'uppercase',
      marginBottom: '4px',
      letterSpacing: '0.5px',
    },
    issueDetailValue: {
      fontSize: '15px',
      color: C.dark,
      lineHeight: '1.6',
      fontWeight: '600',
    },
    issueStatusBadge: {
      display: 'inline-block',
      padding: '5px 14px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '700',
    },
    navButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '1rem',
      gap: '0.5rem',
    },
    navBtn: {
      fontSize: '14px',
      fontWeight: '700',
      padding: '8px 14px',
      borderRadius: '8px',
      border: `2px solid rgba(8,131,149,0.2)`,
      cursor: 'pointer',
      background: C.ice,
      color: C.dark,
      transition: 'all 0.2s ease',
    },
    formGroup: {
      marginBottom: '20px',
    },
    formLabel: {
      display: 'block',
      fontSize: '11px',
      fontWeight: '700',
      color: C.dark,
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    textarea: {
      width: '100%',
      padding: '14px',
      border: `2px solid rgba(8,131,149,0.2)`,
      borderRadius: '10px',
      fontSize: '15px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      color: C.dark,
      fontWeight: '500',
    },
    resolveButton: {
      background: `linear-gradient(135deg, ${C.primary} 0%, #0a9fb5 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '14px 24px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8,131,149,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '12px',
      letterSpacing: '0.3px',
    },
    resolvedIssue: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      padding: '5px 0px',
    },
    resolvedText: {
      color: C.sky,
      fontSize: '15px',
      marginTop: '10px',
      fontWeight: '600',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(23,107,135,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '1rem' : '0',
    },
    modalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: isMobile ? '1.5rem' : '32px 36px',
      width: isMobile ? '100%' : '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(8,131,149,0.3)',
      border: '1px solid rgba(8,131,149,0.1)',
    },
    modalHeader: {
      fontSize: isMobile ? '20px' : '26px',
      fontWeight: 800,
      color: C.dark,
      marginBottom: '1.5rem',
      paddingBottom: '16px',
      borderBottom: `2px solid ${C.mint}`,
      letterSpacing: '-0.5px',
    },
    label: {
      display: 'block',
      fontSize: '11px',
      fontWeight: '700',
      color: C.dark,
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      width: '100%',
      padding: isMobile ? '0.625rem' : '14px',
      border: `2px solid rgba(8,131,149,0.2)`,
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      color: C.dark,
      fontWeight: '500',
    },
    select: {
      width: '100%',
      padding: isMobile ? '0.625rem' : '14px',
      border: `2px solid rgba(8,131,149,0.2)`,
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      background: 'white',
      color: C.dark,
      fontWeight: '500',
      cursor: 'pointer',
    },
    modalActions: {
      display: 'flex',
      gap: '14px',
      marginTop: '28px',
      paddingTop: '20px',
      borderTop: `1px solid rgba(8,131,149,0.1)`,
      flexDirection: isMobile ? 'column' : 'row',
    },
    cancelButton: {
      flex: 1,
      padding: '14px',
      background: 'white',
      color: C.dark,
      border: `2px solid rgba(8,131,149,0.3)`,
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px',
    },
    saveButton: {
      flex: 1,
      padding: '14px',
      background: saving ? '#9ca3af' : `linear-gradient(135deg, ${C.primary} 0%, #0a9fb5 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: saving ? 'not-allowed' : 'pointer',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: saving ? 'none' : '0 4px 6px rgba(8,131,149,0.3)',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px',
    },
    emptyState: {
      textAlign: 'center',
      padding: isMobile ? '2rem' : '44px 24px',
      color: C.sky,
      gridColumn: '1 / -1',
      fontWeight: '600',
      fontSize: '15px',
      fontStyle: 'italic',
    },
    qrModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(23,107,135,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: isMobile ? '1rem' : '0',
    },
    qrModalContent: {
      background: 'white',
      borderRadius: '20px',
      padding: isMobile ? '1.5rem' : '32px 36px',
      maxWidth: '380px',
      width: '100%',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 20px 60px rgba(8,131,149,0.3)',
      border: '1px solid rgba(8,131,149,0.1)',
    },
    qrModalHeader: {
      fontSize: '20px',
      fontWeight: '800',
      color: C.dark,
      margin: 0,
      letterSpacing: '-0.3px',
    },
    qrModalImage: {
      width: isMobile ? '180px' : '220px',
      height: isMobile ? '180px' : '220px',
      margin: '0 auto 1.5rem',
      display: 'block',
      border: `2px solid ${C.mint}`,
      borderRadius: '10px',
    },
    downloadButton: {
      padding: '10px 24px',
      background: `linear-gradient(135deg, ${C.primary} 0%, #0a9fb5 100%)`,
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '700',
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
      background: C.ice,
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: C.primary,
      transition: 'background 0.2s ease',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <Loader2 size={48} className="animate-spin" color={C.primary} />
          <p style={{ color: C.dark, fontSize: '16px', fontWeight: '600' }}>Loading asset data...</p>
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
            <Cpu size={24} color={C.primary} />
          </div>
          <div>
            <h1 style={styles.headerTitle}>{pcData.PC_Name} · {pcData.Lab?.Lab_ID}</h1>
            <p style={styles.headerSub}>Asset inventory</p>
          </div>
        </div>
        <button
          style={styles.addButton}
          onClick={() => setShowAddModal(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 10px rgba(8,131,149,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(8,131,149,0.3)';
          }}
        >
          <span style={{ fontSize: '20px' }}>+</span>
          Add New Asset
        </button>
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
          <strong>{selectedType}</strong> is selected. Now all info of{' '}
          <strong>{selectedType}</strong> in{' '}
          <strong>{pcData.PC_Name}</strong> of{' '}
          <strong>{pcData.Lab?.Lab_ID}</strong> will be displayed.
        </p>
      </div>

      {/* Asset Cards Grid */}
      <div style={styles.assetGrid}>
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => {
            const statusColors = getStatusColor(asset.Assest_Status);
            return (
              <div
                key={asset.id || asset._id}
                style={styles.assetCard}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(8,131,149,0.18)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={styles.assetName}>{asset.Asset_Name}</div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: C.sky }}>
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                    Asset Type
                  </div>
                  <div style={{ ...styles.detailValue, textTransform: 'capitalize' }}>
                    {asset.Asset_Type === "cpu" || asset.Asset_Type === "ups" ? asset.Asset_Type.toUpperCase() : asset.Asset_Type}
                  </div>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: C.sky }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    Brand Name
                  </div>
                  <div style={styles.detailValue}>
                    {asset.Brand || "Not Specified"}
                  </div>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: C.sky }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Status
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    border: `1px solid ${statusColors.text}`,
                  }}>
                    {asset.Assest_Status === "Yes" ? "Yes" : asset.Assest_Status === "No" ? "No" : "Other"}
                  </span>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: C.sky }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
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
                  </div>
                </div>

                <div style={styles.assetDetail}>
                  <div style={styles.detailLabel}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ color: C.sky }}>
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd"/>
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z"/>
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

                <div style={styles.actionButtons}>
                  <button
                    style={{ ...styles.iconButton, ...styles.editButton }}
                    onClick={() => handleEditAsset(asset)}
                    title="Edit Asset"
                    onMouseEnter={(e) => e.currentTarget.style.background = C.mint}
                    onMouseLeave={(e) => e.currentTarget.style.background = C.ice}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  </button>
                  <button
                    style={{ ...styles.iconButton, ...styles.deleteButton }}
                    onClick={() => handleDeleteAsset(asset.id || asset._id)}
                    title="Delete Asset"
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = C.ice}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <p>No assets found for the selected type.</p>
          </div>
        )}
      </div>

      {/* View Issue Modal */}
      {viewingIssue && (
        <div style={styles.modalOverlay} onClick={() => setViewingIssue(null)}>
          <div style={styles.issueModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.issueModalHeader}>
              <span>Issue Details</span>
              <button style={styles.closeBtn} onClick={() => setViewingIssue(null)}>✕</button>
            </div>

            {viewingIssue.Issue_Reported.length > 1 && (
              <div style={styles.navButtons}>
                <button style={styles.navBtn} onClick={prevIssue} disabled={currentIssueIndex === 0}>‹ Prev</button>
                <span style={{ fontSize: '13px', color: C.dark, fontWeight: '700', alignSelf: 'center' }}>
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
                    { label: 'Faculty Name',       value: issue?.FacultyDetails?.Name || "N/A" },
                    { label: 'Issue Description',  value: issue?.IssueDescription },
                    ...(issue?.Status === 'resolved by technician' ? [{ label: 'Resolve Description', value: issue?.ResolveDescription }] : []),
                  ].map((row, i) => (
                    <div key={i} style={{ ...styles.issueDetailRow, backgroundColor: C.ice, borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={styles.issueDetailLabel}>{row.label}</div>
                      <div style={styles.issueDetailValue}>{row.value}</div>
                    </div>
                  ))}

                  <div style={{ marginTop: '10px', marginBottom: '12px' }}>
                    <div style={styles.issueDetailLabel}>Status</div>
                    <span style={{ ...styles.issueStatusBadge, ...getIssueStatusColor(issue?.Status) }}>
                      {formatStatus(issue?.Status)}
                    </span>
                  </div>

                  {issue?.Status === 'pending' ? (
                    <>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Issue Resolve Description *</label>
                        <textarea
                          style={styles.textarea}
                          value={issueForm.resolveDescription}
                          onChange={(e) => setIssueForm({ ...issueForm, resolveDescription: e.target.value })}
                          placeholder="Describe how you resolved the issue..."
                          onFocus={(e) => e.target.style.borderColor = C.primary}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(8,131,149,0.2)'}
                        />
                      </div>
                      <button
                        style={{ ...styles.resolveButton, opacity: !issueForm.resolveDescription ? 0.6 : 1 }}
                        onClick={() => handleResolveIssue(issue._id, viewingIssue._id)}
                        disabled={!issueForm.resolveDescription}
                        onMouseEnter={(e) => {
                          if (issueForm.resolveDescription) {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 10px rgba(8,131,149,0.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(8,131,149,0.3)';
                        }}
                      >
                        Issue Resolved
                      </button>
                    </>
                  ) : (
                    <div style={styles.resolvedIssue}>
                      <p style={styles.resolvedText}>Not Yet Approved by the faculty!</p>
                    </div>
                  )}
                </>
              );
            })()}
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
              onMouseEnter={(e) => e.currentTarget.style.background = C.mint}
              onMouseLeave={(e) => e.currentTarget.style.background = C.ice}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '16px', borderBottom: `2px solid ${C.mint}` }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ color: C.primary }}>
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd"/>
              </svg>
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
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={styles.modal} onClick={() => {
          setShowAddModal(false);
          setEditingAsset(null);
          resetForm();
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalHeader}>
              {editingAsset ? "Edit Asset" : "Add New Asset"}
            </h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Asset Name</label>
              <input
                type="text"
                style={styles.input}
                value={newAsset.Asset_Name}
                onChange={(e) => setNewAsset({ ...newAsset, Asset_Name: e.target.value })}
                placeholder="Enter asset name"
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8,131,149,0.2)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Asset Type</label>
              <select
                style={styles.select}
                value={newAsset.Asset_Type}
                onChange={(e) => setNewAsset({ ...newAsset, Asset_Type: e.target.value })}
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8,131,149,0.2)'}
              >
                {assetTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Brand Name</label>
              <input
                type="text"
                style={styles.input}
                value={newAsset.Brand}
                onChange={(e) => setNewAsset({ ...newAsset, Brand: e.target.value })}
                placeholder="Enter brand name"
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8,131,149,0.2)'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Asset Status</label>
              <select
                style={styles.select}
                value={newAsset.Assest_Status}
                onChange={(e) => setNewAsset({ ...newAsset, Assest_Status: e.target.value })}
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8,131,149,0.2)'}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>QR Code URL (Optional)</label>
              <input
                type="text"
                style={styles.input}
                value={newAsset.QR_Code}
                onChange={(e) => setNewAsset({ ...newAsset, QR_Code: e.target.value })}
                placeholder="Enter QR code URL"
                onFocus={(e) => e.target.style.borderColor = C.primary}
                onBlur={(e) => e.target.style.borderColor = 'rgba(8,131,149,0.2)'}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAsset(null);
                  resetForm();
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(8,131,149,0.05)';
                  e.target.style.borderColor = C.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = 'rgba(8,131,149,0.3)';
                }}
              >
                Cancel
              </button>
              <button
                style={styles.saveButton}
                onClick={editingAsset ? handleUpdateAsset : handleAddAsset}
                disabled={saving}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 10px rgba(8,131,149,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px rgba(8,131,149,0.3)';
                  }
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {editingAsset ? "Updating..." : "Adding..."}
                  </>
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