'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Upload, ChevronDown, ChevronUp, Loader2, X, Edit, Trash2, Calendar, Clock, AlertCircle, Cpu, Sparkles, QrCode, AlertTriangle, PackagePlus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';

const LabInfo = () => {
  const { nonTechLabId: id } = useParams();  
  const [labData, setLabData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifyFormData, setNotifyFormData] = useState({
    eventType: '',
    date: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const [assets, setAssets] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [savingAsset, setSavingAsset] = useState(false);
  const [viewingQR, setViewingQR] = useState(null);
  const [viewingAI, setViewingAI] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
  const [assetSearch, setAssetSearch] = useState("");
  const [newAsset, setNewAsset] = useState({
    Asset_Name: "",
    Assest_Status: "Yes",
    Financial_Details: {
      purchase_year: "",
      purchase_cost: "",
      useful_life: "",
      breakdown_frequency: 0,
      total_maintenance_cost: 0,
      usage_frequency: "",
      warranty: 0,
    }
  }); 

  const fetchLab = async () => {
    try {
      const res = await fetch(`/api/admin/getNonTechLabById/${id}`);
      const data = await res.json();
      if (res.ok) {
        setLabData(data.lab);
        setAssets(data.lab?.NonTechAssets || []);
        const notifyEvents = data.lab?.NotifyEvent || [];
        const formattedNotifications = notifyEvents.map((e) => ({
          id: e._id,
          eventType: e.EventType,
          date: new Date(e.Date).toISOString().split("T")[0], 
          startTime: e.StartTime,
          endTime: e.EndTime,
          description: e.Description,
        }));
        setNotifications(formattedNotifications);
      } else {
        console.error("Failed to fetch lab:", data.error);
      }
    } catch (err) {
      console.error("Error fetching lab:", err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchLab()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNotifyFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "eventType" && value !== "Other" && { customEventType: "" })
    }));
  };

  const eventTypes = ["Exam","Placement Drive","Workshop","Seminar","Maintenance","Other"];

  const handleSubmitNotification = async () => {
    if(!notifyFormData.eventType || !notifyFormData.date || !notifyFormData.startTime || !notifyFormData.endTime || !notifyFormData.description) {
      toast.warning("Please fill in all required fields!");
      return;
    }
    const payload = {
      eventType: notifyFormData.eventType,
      date: notifyFormData.date,
      startTime: notifyFormData.startTime,
      endTime: notifyFormData.endTime,
      description: notifyFormData.description,
    };
    try {
      const res = await fetch(`/api/admin/addEventNotify/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Event notification added successfully!");
        setNotifications(data.eventNotify);
        setNotifyFormData({ eventType: '', date: '', startTime: '', endTime: '', description: '' });
        setShowNotifyForm(false);
        fetchLab();
      } else {
        toast.error(data.error || "Failed to add info");
      }
    } catch (error) {
      console.error("Error adding info:", error);
      toast.error("Something went wrong while adding the info.");
    }
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const resetAssetForm = () => {
    setNewAsset({
      Asset_Name: "",
      Assest_Status: "Yes",
      Financial_Details: {
        purchase_year: "", purchase_cost: "",
        useful_life: "", breakdown_frequency: "", total_maintenance_cost: "", usage_frequency: "", warranty: ""
      }
    });
  };

  const handleAddAsset = async () => {
    if (!newAsset.Asset_Name || !newAsset.Assest_Status) {
      toast.warning("Please fill all required fields"); return;
    }
    setSavingAsset(true);
    try {
      const res = await fetch("/api/admin/addNonTechAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Asset_Name: newAsset.Asset_Name,
          Assest_Status: newAsset.Assest_Status,
          Lab: id,
          Financial_Details: {
            purchase_year: Number(newAsset.Financial_Details.purchase_year),
            purchase_cost: Number(newAsset.Financial_Details.purchase_cost),
            useful_life: Number(newAsset.Financial_Details.useful_life),
            breakdown_frequency: Number(newAsset.Financial_Details.breakdown_frequency || 0),
            total_maintenance_cost: Number(newAsset.Financial_Details.total_maintenance_cost || 0),
            usage_frequency: newAsset.Financial_Details.usage_frequency,
            warranty: Number(newAsset.Financial_Details.warranty || 0),
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Something went wrong!"); return; }
      toast.success("Asset added successfully!");
      setShowAddAssetModal(false);
      resetAssetForm();
      await fetchLab();
    } catch (err) {
      console.error("Asset Error:", err);
      toast.error("Something went wrong while adding asset.");
    } finally {
      setSavingAsset(false);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setNewAsset(asset);
    setShowAddAssetModal(true);
  };

  const handleUpdateAsset = async () => {
    if (!newAsset.Asset_Name || !newAsset.Asset_Type || !newAsset.Assest_Status) {
      toast.warning("Please fill all required fields"); return;
    }
    setSavingAsset(true);
    try {
      const res = await fetch("/api/admin/updateAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAsset.id || editingAsset._id,
          Asset_Name: newAsset.Asset_Name,
          Asset_Type: newAsset.Asset_Type,
          Assest_Status: newAsset.Assest_Status,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Something went wrong!"); return; }
      toast.success("Asset updated successfully!");
      setShowAddAssetModal(false);
      setEditingAsset(null);
      resetAssetForm();
      await fetchLab();
    } catch (err) {
      console.error("Update Asset Error:", err);
      toast.error("Something went wrong while updating asset.");
    } finally {
      setSavingAsset(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await fetch("/api/admin/deleteAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assetId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to delete asset"); return; }
      toast.success("Asset deleted successfully!");
      await fetchLab();
    } catch (err) {
      console.error("Delete Asset Error:", err);
      toast.error("Something went wrong while deleting asset.");
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

  const handleGenerateAI = async () => {
    try {
      setAiLoading(true);
      const response = await fetch("/api/ai/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: viewingAI._id })
      });
      const data = await response.json();
      if (!response.ok) { toast.error(data.error || "AI generation failed"); return; }
      setViewingAI(prev => ({ ...prev, AI_Predictions: data.AI_Predictions }));
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Something went wrong while generating AI report.");
    } finally {
      setAiLoading(false);
    }
  };

  const openIssueModal = (asset) => {
    setViewingIssue(asset);
    setCurrentIssueIndex(0);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Yes": return { bg: '#d1fae5', text: '#065f46' };
      case "No": return { bg: '#fee2e2', text: '#991b1b' };
      case "Other": return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#e5e7eb', text: '#374151' };
    }
  };

  const getIssueStatusColor = (status) => {
    switch(status) {
      case "pending": return { backgroundColor: '#fef3c7', color: '#92400e' };
      case "resolved by technician": return { backgroundColor: '#d1fae5', color: '#065f46' };
      case "approved": return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#e5e7eb', color: '#374151' };
    }
  };

  function formatStatus(status) {
    const map = {
      "pending": "Pending",
      "resolved by technician": "Resolved By Technician",
      "approved": "Approved"
    };
    return map[status] || status || "Pending";
  }

  const styles = {
    loaderContainer: {
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', width: '100%', backgroundColor: '#EBF4F6',
      flexDirection: 'column', gap: '1rem',
    },
    loaderText: { color: '#176B87', fontSize: '16px', fontWeight: '600' },
    container: {
      width: isMobile ? '100%' : isTablet ? 'calc(100% - 200px)' : 'calc(100% - 255px)',
      minHeight: '100vh', backgroundColor: '#EBF4F6',
      padding: isMobile ? '0.75rem' : isTablet ? '1.5rem' : '2rem',
      boxSizing: 'border-box',
      marginLeft: isMobile ? '0' : isTablet ? '200px' : '255px',
      overflowX: 'hidden',
    },
    headerSection: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
    },
    addNotifyBtn: {
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white', border: 'none', borderRadius: '12px',
      fontSize: '15px', fontWeight: 700, cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(8, 131, 149, 0.3)', letterSpacing: '0.3px'
    },
    notificationBanner: {
      background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.95) 0%, rgba(251, 113, 133, 0.95) 100%)',
      backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '24px',
      marginBottom: '20px', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
      color: 'white', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    notifHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
    notifType: { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.3px' },
    notifyCloseBtn: {
      background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white',
      borderRadius: '50%', width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.2s ease'
    },
    notifDetails: { display: 'flex', flexDirection: 'column', gap: '10px' },
    notifRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', opacity: 0.95, fontWeight: '500' },
    notifDescription: { marginTop: '10px', fontSize: '15px', lineHeight: '1.7', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.3)', fontWeight: '400' },
    notifyModalOverlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(23, 107, 135, 0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    },
    notifyModalContent: {
      background: 'white', borderRadius: '20px', padding: '36px',
      maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(8, 131, 149, 0.3)', border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    notifyModalHeader: {
      fontSize: '26px', fontWeight: 800, color: '#176B87', marginBottom: '28px',
      paddingBottom: '16px', borderBottom: '2px solid #D1F8EF', letterSpacing: '-0.5px'
    },
    notifyFormGroup: { marginBottom: '24px' },
    notifyLabel: {
      display: 'block', fontSize: '14px', fontWeight: 700, color: '#176B87',
      marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    notifyInput: {
      width: '100%', padding: '14px', border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px', fontSize: '15px', transition: 'all 0.3s ease',
      boxSizing: 'border-box', fontWeight: '500', color: '#176B87'
    },
    notifyTextarea: {
      width: '100%', padding: '14px', border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px', fontSize: '15px', minHeight: '120px', resize: 'vertical',
      fontFamily: 'inherit', boxSizing: 'border-box', fontWeight: '500', color: '#176B87'
    },
    notifyButtonGroup: {
      display: 'flex', gap: '14px', marginTop: '28px',
      paddingTop: '20px', borderTop: '1px solid rgba(8, 131, 149, 0.1)'
    },
    notifySubmitBtn: {
      flex: 1, padding: '14px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px',
      fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)', letterSpacing: '0.3px'
    },
    notifyCancelBtn: {
      flex: 1, padding: '14px', backgroundColor: 'white', color: '#176B87',
      border: '2px solid rgba(8, 131, 149, 0.3)', borderRadius: '10px',
      fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease', letterSpacing: '0.3px'
    },
    labInfoCard: {
      background: 'white', backdropFilter: 'blur(20px)', borderRadius: '16px',
      padding: '28px', marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    labHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '24px', flexWrap: 'wrap', gap: '14px',
      paddingBottom: '16px', borderBottom: '2px solid #D1F8EF'
    },
    labTitle: { fontSize: '30px', fontWeight: 800, color: '#176B87', margin: 0, letterSpacing: '-0.5px' },
    statusBadge: {
      padding: '8px 20px', borderRadius: '20px', fontSize: '15px', fontWeight: 700,
      background: '#D1F8EF', color: '#088395', border: '1px solid #088395', letterSpacing: '0.5px'
    },
    infoGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px', marginTop: '20px'
    },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
    infoLabel: { fontSize: '12px', color: '#3674B5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoValue: { fontSize: '16px', color: '#176B87', fontWeight: 600 },
    addButton: {
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white', border: 'none', borderRadius: '10px',
      padding: '10px 20px', fontSize: '15px', fontWeight: 700,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
      transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)', letterSpacing: '0.3px'
    },
    modal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(23, 107, 135, 0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    },
    modalContent: {
      background: 'white', borderRadius: '20px', padding: '32px 36px',
      width: '90%', maxWidth: '640px', maxHeight: '95vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(8, 131, 149, 0.3)', border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    modalHeader: {
      fontSize: '26px', fontWeight: 800, color: '#176B87', marginBottom: '24px',
      marginTop: 0, paddingBottom: '16px', borderBottom: '2px solid #D1F8EF', letterSpacing: '-0.5px'
    },
    formGroup: { marginBottom: '24px' },
    label: {
      display: 'block', fontSize: '14px', fontWeight: 700, color: '#176B87',
      marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    input: {
      width: '100%', padding: '14px', border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px', fontSize: '15px', transition: 'all 0.3s ease',
      boxSizing: 'border-box', fontWeight: '500', color: '#176B87'
    },
    select: {
      width: '100%', padding: '14px', border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px', fontSize: '15px', transition: 'all 0.3s ease',
      boxSizing: 'border-box', background: 'white', fontWeight: '500',
      color: '#176B87', cursor: 'pointer'
    },
    modalActions: {
      display: 'flex', gap: '14px', marginTop: '28px',
      paddingTop: '20px', borderTop: '1px solid rgba(8, 131, 149, 0.1)'
    },
    cancelButton: {
      flex: 1, padding: '14px', background: 'white', color: '#176B87',
      border: '2px solid rgba(8, 131, 149, 0.3)', borderRadius: '10px',
      fontWeight: 700, cursor: 'pointer', fontSize: '15px', transition: 'all 0.3s ease', letterSpacing: '0.3px'
    },
    saveButton: {
      flex: 1, padding: '14px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white', border: 'none', borderRadius: '10px',
      fontWeight: 700, cursor: 'pointer', fontSize: '15px', transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)', letterSpacing: '0.3px'
    },
    // ── Asset Section styles ──
    assetSection: { marginTop: '24px', marginBottom: '24px' },
    assetSectionHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '16px', flexWrap: 'wrap', gap: '12px'
    },
    assetSectionTitle: { fontSize: '22px', fontWeight: 800, color: '#176B87', letterSpacing: '-0.3px' },
    assetSectionSubtitle: { fontSize: '13px', color: '#3674B5', fontWeight: 500 },
    filterSection: {
      backgroundColor: 'white', borderRadius: '12px',
      padding: '1rem 1.25rem', marginBottom: '1rem',
      boxShadow: '0 2px 8px rgba(8,131,149,0.06)',
    },
    filterButtons: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '8px' },
    filterButton: {
      padding: '0.4rem 0.875rem', backgroundColor: '#EBF4F6', color: '#176B87',
      border: '2px solid transparent', borderRadius: '8px', fontWeight: '600',
      cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s ease',
    },
    filterButtonActive: { backgroundColor: '#088395', color: 'white', border: '2px solid #088395' },
    assetGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
    },
    assetCard: {
      backgroundColor: 'white', borderRadius: '14px', padding: '1.25rem',
      boxShadow: '0 2px 8px rgba(8,131,149,0.07)', borderLeft: '4px solid #088395',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease', position: 'relative',
    },
    assetName: { fontSize: '15px', fontWeight: '700', color: '#176B87', marginBottom: '1rem' },
    assetDetail: { display: 'flex', alignItems: 'center', marginBottom: '0.6rem', fontSize: '13px' },
    assetDetailLabel: {
      fontWeight: '600', color: '#176B87', minWidth: '110px',
      display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px'
    },
    assetDetailValue: { color: '#088395', flex: 1, fontWeight: '500' },
    statusBadgeAsset: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    issueBlock: {
      backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '20px',
      padding: '2px 12px', cursor: 'pointer', fontSize: '12px', color: '#92400e',
      fontWeight: '600', transition: 'all 0.2s', display: 'inline-block',
    },
    noIssueText: { color: '#10b981', fontWeight: '500', fontSize: '13px' },
    assetActionButtons: {
      display: 'flex', gap: '0.5rem', marginTop: '1rem',
      paddingTop: '1rem', borderTop: '1px solid #EBF4F6',
    },
    assetIconButton: {
      padding: '0.5rem', backgroundColor: '#EBF4F6', border: 'none', borderRadius: '8px',
      cursor: 'pointer', transition: 'background 0.2s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1,
    },
    // Issue Modal
    issueModalOverlay: {
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
      fontSize: '18px', fontWeight: '800', color: '#176B87',
      marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    closeBtn: {
      background: '#EBF4F6', border: 'none', width: 32, height: 32, borderRadius: '8px',
      cursor: 'pointer', color: '#176B87', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    navButtons: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '0.5rem' },
    navBtn: {
      fontSize: '18px', fontWeight: 'bold', padding: '4px 14px', borderRadius: '8px',
      border: '2px solid #EBF4F6', cursor: 'pointer', background: '#EBF4F6', color: '#176B87', transition: 'all 0.15s',
    },
    // QR Modal
    qrModal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem',
    },
    qrModalContent: {
      background: 'white', borderRadius: '16px',
      padding: isMobile ? '1.5rem' : '2rem',
      maxWidth: '380px', width: '100%', textAlign: 'center', position: 'relative',
      boxShadow: '0 20px 60px rgba(8,131,149,0.2)',
    },
    downloadButton: {
      padding: '10px 24px', background: '#088395', color: 'white', border: 'none',
      borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px',
      display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
      margin: '0 auto', transition: 'background 0.2s ease',
      boxShadow: '0 2px 8px rgba(8,131,149,0.25)',
    },
    qrCloseButton: {
      position: 'absolute', top: '1rem', right: '1rem', background: '#EBF4F6',
      border: 'none', borderRadius: '50%', width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: '#088395', transition: 'background 0.2s ease',
    },
  };

  const inputStyleModal = {
    width: '100%', padding: '9px 12px',
    border: '2px solid #EBF4F6', borderRadius: '8px', fontSize: '13px',
    boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s',
    color: '#1f2937', backgroundColor: 'white',
  };
  const labelStyleModal = {
    display: 'block', fontSize: '11px', fontWeight: '700', color: '#176B87',
    marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase'
  };
  const selectStyleModal = { ...inputStyleModal, cursor: 'pointer' };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <Loader2 size={48} className="animate-spin" color="#088395" />
          <p style={styles.loaderText}>Loading lab data...</p>
        </div>
      </div>
    );
  }

  const filteredAssets = assets.filter(a => {
    const matchType = selectedType === "All" || a.Asset_Type === selectedType;
    const matchSearch = !assetSearch || (a.Asset_Name || '').toLowerCase().includes(assetSearch.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div style={styles.container}>

      {/* ── Add Notification Button ── */}
      <div style={styles.headerSection}>
        <div></div>
        <button
          style={styles.addNotifyBtn}
          onClick={() => setShowNotifyForm(true)}
          onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(8, 131, 149, 0.4)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(8, 131, 149, 0.3)'; }}
        >
          <Plus size={20} />
          Add Notification
        </button>
      </div>

      {/* ── Notification Banners ── */}
      {notifications.map(notif => (
        <div key={notif.id} style={styles.notificationBanner}>
          <div style={styles.notifHeader}>
            <div style={styles.notifType}>
              <AlertCircle size={24} />
              {notif.eventType}
            </div>
            <button
              style={styles.notifyCloseBtn}
              onClick={() => removeNotification(notif.id)}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              <X size={18} />
            </button>
          </div>
          <div style={styles.notifDetails}>
            <div style={styles.notifRow}>
              <Calendar size={18} />
              <strong>Date:</strong> {new Date(notif.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={styles.notifRow}>
              <Clock size={18} />
              <strong>Time:</strong> {notif.startTime} - {notif.endTime}
            </div>
            <div style={styles.notifDescription}>{notif.description}</div>
          </div>
        </div>
      ))}

      {/* ── Notification Form Modal ── */}
      {showNotifyForm && (
        <div style={styles.notifyModalOverlay} onClick={() => setShowNotifyForm(false)}>
          <div style={styles.notifyModalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.notifyModalHeader}>Add Lab Notification</h2>
            <div style={styles.notifyFormGroup}>
              <label style={styles.notifyLabel}>Event Type *</label>
              <select name="eventType" value={notifyFormData.eventType} onChange={handleInputChange} style={styles.notifyInput}
                onFocus={(e) => (e.target.style.borderColor = "#088395")} onBlur={(e) => (e.target.style.borderColor = "rgba(8, 131, 149, 0.2)")}>
                <option value="">Select event type</option>
                {eventTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
              </select>
            </div>
            {notifyFormData.eventType === "Other" && (
              <div style={styles.notifyFormGroup}>
                <label style={styles.notifyLabel}>Specify Event *</label>
                <input type="text" name="customEventType" value={notifyFormData.customEventType || ""} onChange={handleInputChange} placeholder="Enter event name" style={styles.notifyInput}
                  onFocus={(e) => (e.target.style.borderColor = "#088395")} onBlur={(e) => (e.target.style.borderColor = "rgba(8, 131, 149, 0.2)")} />
              </div>
            )}
            <div style={styles.formGroup}>
              <label style={styles.notifyLabel}>Date *</label>
              <input type="date" name="date" value={notifyFormData.date} onChange={handleInputChange} style={styles.notifyInput}
                onFocus={(e) => e.target.style.borderColor = '#088395'} onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.notifyLabel}>Time Period *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <input type="time" name="startTime" value={notifyFormData.startTime} onChange={handleInputChange} style={styles.notifyInput}
                  onFocus={(e) => e.target.style.borderColor = '#088395'} onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'} />
                <input type="time" name="endTime" value={notifyFormData.endTime} onChange={handleInputChange} style={styles.notifyInput}
                  onFocus={(e) => e.target.style.borderColor = '#088395'} onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'} />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.notifyLabel}>Description *</label>
              <textarea name="description" value={notifyFormData.description} onChange={handleInputChange} style={styles.notifyTextarea} placeholder="Enter event details..."
                onFocus={(e) => e.target.style.borderColor = '#088395'} onBlur={(e) => e.target.style.borderColor = 'rgba(8, 131, 149, 0.2)'} />
            </div>
            <div style={styles.notifyButtonGroup}>
              <button style={styles.notifyCancelBtn} onClick={() => setShowNotifyForm(false)}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(8, 131, 149, 0.05)'; e.target.style.borderColor = '#088395'; }}
                onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = 'rgba(8, 131, 149, 0.3)'; }}>Cancel</button>
              <button style={styles.notifySubmitBtn} onClick={handleSubmitNotification}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; }}>Add Notification</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lab Information Card ── */}
      {labData ? (
        <div style={styles.labInfoCard}>
          <div style={styles.labHeader}>
            <h1 style={styles.labTitle}>{labData?.Lab_Name}</h1>
            <span style={styles.statusBadge}>{labData?.Status?.toUpperCase()}</span>
          </div>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Lab ID</span><span style={styles.infoValue}>{labData?.Lab_ID}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Lab Name</span><span style={styles.infoValue}>{labData?.Lab_Name}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Block</span><span style={styles.infoValue}>{labData?.Block}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Lab Room</span><span style={styles.infoValue}>{labData?.Lab_Room}</span></div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab Technician</span>
              <span style={styles.infoValue}>{labData?.LabTechnician?.[0]?.UserDetails?.Name}</span>
              <span style={styles.infoValue}>{labData?.LabTechnician?.[0]?.UserDetails?.Email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab Incharge</span>
              <span style={styles.infoValue}>{labData?.Lab_Incharge?.[0]?.UserDetails?.Name}</span>
              <span style={styles.infoValue}>{labData?.Lab_Incharge?.[0]?.UserDetails?.Email}</span>
            </div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Total Capacity</span><span style={styles.infoValue}>{labData?.Total_Capacity}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Total Assets</span><span style={styles.infoValue}>{assets.length}</span></div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* ══════════════════════════════════════════
          ASSETS SECTION
      ══════════════════════════════════════════ */}
      <div style={styles.assetSection}>
        {/* Section Header */}
        <div style={styles.assetSectionHeader}>
          <div>
            <h2 style={styles.assetSectionTitle}>Lab Assets</h2>
            <span style={styles.assetSectionSubtitle}>
              {assets.length} asset{assets.length === 1 ? '' : 's'} in this lab
            </span>
          </div>
          <button
            style={styles.addButton}
            onClick={() => { setEditingAsset(null); resetAssetForm(); setShowAddAssetModal(true); }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 10px rgba(8,131,149,0.4)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 6px rgba(8,131,149,0.3)'; }}
          >
            <PackagePlus size={18} />
            Add New Asset
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍  Search asset by name..."
          value={assetSearch}
          onChange={(e) => setAssetSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', marginBottom: '16px',
            border: '2px solid rgba(8,131,149,0.2)', borderRadius: '10px',
            fontSize: '14px', fontWeight: '500', color: '#176B87',
            background: 'white', outline: 'none', boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(8,131,149,0.06)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#088395'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8,131,149,0.1)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(8,131,149,0.2)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(8,131,149,0.06)'; }}
        />

        {/* Asset Cards Grid */}
        {filteredAssets.length > 0 ? (
          <div style={styles.assetGrid}>
            {filteredAssets.map(asset => {
              const statusColors = getStatusColor(asset.Assest_Status);
              return (
                <div
                  key={asset._id || asset.id}
                  style={styles.assetCard}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(8,131,149,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(8,131,149,0.07)'; }}
                >
                  <div style={styles.assetName}>{asset.Asset_Name}</div>

                  {/* Status */}
                  <div style={styles.assetDetail}>
                    <div style={styles.assetDetailLabel}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Status
                    </div>
                    <span style={{ ...styles.statusBadgeAsset, backgroundColor: statusColors.bg, color: statusColors.text }}>
                      {asset.Assest_Status}
                    </span>
                  </div>

                  {/* Issues */}
                  <div style={styles.assetDetail}>
                    <div style={styles.assetDetailLabel}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      Issues
                    </div>
                    <div style={{ flex: 1 }}>
                      {asset.Issue_Reported?.length > 0 ? (
                        <div
                          style={styles.issueBlock}
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

                  {/* QR Code */}
                  <div style={styles.assetDetail}>
                    <div style={styles.assetDetailLabel}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" /></svg>
                      QR Code
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={() => asset.QR_Code && setViewingQR(asset)} title="Click to view QR">
                      {asset.QR_Code
                        ? <img src={asset.QR_Code} alt="QR" style={{ width: 22, height: 22, display: 'block' }} />
                        : <span style={{ fontSize: '12px', color: '#9ca3af' }}>N/A</span>}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div style={styles.assetDetail}>
                    <div style={styles.assetDetailLabel}>
                      <Sparkles size={14} color="#088395" />
                      AI Insights
                    </div>
                    <div
                      onClick={() => setViewingAI(asset)}
                      style={{ padding: '3px 12px', backgroundColor: '#EBF4F6', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#088395', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#088395'; e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EBF4F6'; e.currentTarget.style.color = '#088395'; }}
                    >
                      View Report
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.assetActionButtons}>
                    <button
                      style={{ ...styles.assetIconButton, color: '#088395' }}
                      onClick={() => handleEditAsset(asset)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1F8EF'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EBF4F6'}
                      title="Edit Asset"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                    <button
                      style={{ ...styles.assetIconButton, color: '#ef4444' }}
                      onClick={() => handleDeleteAsset(asset._id || asset.id)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EBF4F6'}
                      title="Delete Asset"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#088395', background: 'white', borderRadius: '12px', border: '1px dashed rgba(8,131,149,0.25)' }}>
            <PackagePlus size={40} color="#86B6F6" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ fontWeight: '600', color: '#176B87', margin: 0 }}>No assets found. Add your first asset!</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          ISSUE MODAL
      ══════════════════════════════════════════ */}
      {viewingIssue && (
        <div style={styles.issueModalOverlay} onClick={() => setViewingIssue(null)}>
          <div style={styles.issueModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.issueModalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#92400e" />
                <span>Issue Details</span>
              </div>
              <button style={styles.closeBtn} onClick={() => setViewingIssue(null)}>✕</button>
            </div>

            {viewingIssue.Issue_Reported?.length > 1 && (
              <div style={styles.navButtons}>
                <button style={styles.navBtn} onClick={() => setCurrentIssueIndex(p => Math.max(p - 1, 0))} disabled={currentIssueIndex === 0}>‹ Prev</button>
                <span style={{ fontSize: '13px', color: '#176B87', fontWeight: '600', alignSelf: 'center' }}>
                  {currentIssueIndex + 1} / {viewingIssue.Issue_Reported.length}
                </span>
                <button style={styles.navBtn} onClick={() => setCurrentIssueIndex(p => Math.min(p + 1, viewingIssue.Issue_Reported.length - 1))} disabled={currentIssueIndex === viewingIssue.Issue_Reported.length - 1}>Next ›</button>
              </div>
            )}

            {(() => {
              const issue = viewingIssue.Issue_Reported[currentIssueIndex];
              return (
                <>
                  {[
                    { label: 'Asset Name', value: viewingIssue.Asset_Name },
                    { label: 'Faculty Name', value: issue?.FacultyDetails?.UserDetails?.Name || "N/A" },
                    { label: 'Issue Description', value: issue?.IssueDescription },
                    ...(issue?.Status === 'resolved by technician' ? [{ label: 'Resolve Description', value: issue?.ResolveDescription }] : []),
                  ].map((row, i) => (
                    <div key={i} style={{ marginBottom: '10px', backgroundColor: '#EBF4F6', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#176B87', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{row.label}</div>
                      <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>{row.value}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#176B87', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Status</div>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...getIssueStatusColor(issue?.Status) }}>
                      {formatStatus(issue?.Status)}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          QR MODAL
      ══════════════════════════════════════════ */}
      {viewingQR && viewingQR.QR_Code && (
        <div style={styles.qrModal} onClick={() => setViewingQR(null)}>
          <div style={styles.qrModalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.qrCloseButton} onClick={() => setViewingQR(null)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#D1F8EF'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#EBF4F6'}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <QrCode size={20} color="#088395" />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#176B87', margin: 0 }}>{viewingQR.Asset_Name}</h3>
            </div>
            <img src={viewingQR.QR_Code} alt="QR Code" style={{ width: isMobile ? '180px' : '220px', height: isMobile ? '180px' : '220px', margin: '0 auto 1.5rem', display: 'block', border: '2px solid #D1F8EF', borderRadius: '10px' }} />
            <button style={styles.downloadButton}
              onClick={() => handleDownloadQR(viewingQR.QR_Code, viewingQR.Asset_Name)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#176B87'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#088395'}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          AI MODAL
      ══════════════════════════════════════════ */}
      {viewingAI && (
        <div style={styles.qrModal} onClick={() => setViewingAI(null)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: isMobile ? '0 1.25rem 1.25rem' : '0 2rem 1.5rem',
            maxWidth: '480px', width: isMobile ? '100%' : '90%',
            position: 'relative', maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(8,131,149,0.2)',
          }} onClick={(e) => e.stopPropagation()}>

            <div style={{
              position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10,
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem',
              borderBottom: '2px solid #EBF4F6', marginBottom: '1.25rem',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#EBF4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={20} color="#088395" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#176B87' }}>AI Asset Intelligence</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#088395', fontWeight: '500' }}>{viewingAI.Asset_Name}</p>
              </div>
              <button style={{ marginLeft: 'auto', background: '#EBF4F6', border: 'none', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', color: '#176B87', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setViewingAI(null)}>✕</button>
            </div>

            {viewingAI.AI_Predictions ? (
              <div>
                {[
                  { label: 'Failure Probability', value: `${(viewingAI.AI_Predictions.failureProbability * 100).toFixed(2)}%`, accent: viewingAI.AI_Predictions.failureProbability > 0.6 ? '#fee2e2' : '#D1F8EF', textColor: viewingAI.AI_Predictions.failureProbability > 0.6 ? '#991b1b' : '#065f46' },
                  { label: 'Failure Prediction', value: viewingAI.AI_Predictions.failurePrediction === 1 ? 'High Risk' : 'Low Risk', accent: viewingAI.AI_Predictions.failurePrediction === 1 ? '#fee2e2' : '#D1F8EF', textColor: viewingAI.AI_Predictions.failurePrediction === 1 ? '#991b1b' : '#065f46' },
                  { label: 'Remaining Life', value: `${viewingAI.AI_Predictions.remainingLifePrediction?.toFixed(1)} Years`, accent: '#EBF4F6', textColor: '#176B87' },
                  { label: 'Predicted Book Value', value: `₹${viewingAI.AI_Predictions.depreciationPrediction?.toFixed(0)}`, accent: '#EBF4F6', textColor: '#176B87' },
                  { label: 'Next Year Maintenance', value: `₹${viewingAI.AI_Predictions.maintenanceCostPrediction?.toFixed(0)}`, accent: '#EBF4F6', textColor: '#176B87' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', marginBottom: '8px', backgroundColor: row.accent }}>
                    <span style={{ fontSize: '13px', color: '#176B87', fontWeight: '600' }}>{row.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: row.textColor }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', marginBottom: '1.25rem', backgroundColor: viewingAI.AI_Predictions.recommendation === 'Replace' ? '#fee2e2' : '#D1F8EF', border: `2px solid ${viewingAI.AI_Predictions.recommendation === 'Replace' ? '#fca5a5' : '#6ee7b7'}` }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#176B87' }}>Recommendation</span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: viewingAI.AI_Predictions.recommendation === 'Replace' ? '#991b1b' : '#065f46' }}>
                    {viewingAI.AI_Predictions.recommendation}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#088395', fontSize: '14px', fontWeight: '500' }}>
                <Sparkles size={36} color="#86B6F6" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                No AI predictions yet. Generate a report below.
              </div>
            )}

            <button
              onClick={handleGenerateAI}
              disabled={aiLoading}
              onMouseEnter={(e) => { if (!aiLoading) e.currentTarget.style.backgroundColor = '#176B87'; }}
              onMouseLeave={(e) => { if (!aiLoading) e.currentTarget.style.backgroundColor = '#088395'; }}
              style={{ width: '100%', padding: '11px', backgroundColor: aiLoading ? '#9ca3af' : '#088395', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: aiLoading ? 'not-allowed' : 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', boxShadow: aiLoading ? 'none' : '0 2px 8px rgba(8,131,149,0.25)' }}
            >
              {aiLoading
                ? (<><Loader2 size={16} className="animate-spin" /> Processing...</>)
                : (<><Sparkles size={16} />{viewingAI.AI_Predictions ? 'Regenerate AI Report' : 'Generate AI Report'}</>)
              }
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ADD / EDIT ASSET MODAL
      ══════════════════════════════════════════ */}
      {showAddAssetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: isMobile ? '1rem' : '0' }}
          onClick={() => { setShowAddAssetModal(false); setEditingAsset(null); resetAssetForm(); }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: isMobile ? '0 1.25rem 1.25rem' : '0 2rem 1.5rem',
            width: isMobile ? '100%' : '90%', maxWidth: '560px',
            maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(8,131,149,0.2)',
          }} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: isMobile ? '1.25rem 0 1rem' : '1.5rem 0 1rem', borderBottom: '2px solid #EBF4F6', marginBottom: '1.25rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#EBF4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PackagePlus size={20} color="#088395" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#176B87' }}>
                {editingAsset ? "Edit Asset" : "Add New Asset"}
              </h2>
            </div>

            {/* Basic Info Section */}
            <div style={{ backgroundColor: '#EBF4F6', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.875rem', fontSize: '11px', fontWeight: '800', color: '#176B87', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyleModal}>Asset Name</label>
                  <input type="text" style={inputStyleModal}
                    value={newAsset.Asset_Name}
                    onChange={(e) => setNewAsset({ ...newAsset, Asset_Name: e.target.value })}
                    placeholder="e.g., Projector-01"
                    onFocus={(e) => e.target.style.borderColor = '#088395'}
                    onBlur={(e) => e.target.style.borderColor = '#EBF4F6'} />
                </div>
                
                <div>
                  <label style={labelStyleModal}>Asset Status</label>
                  <select style={selectStyleModal}
                    value={newAsset.Assest_Status}
                    onChange={(e) => setNewAsset({ ...newAsset, Assest_Status: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = '#088395'}
                    onBlur={(e) => e.target.style.borderColor = '#EBF4F6'}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Details Section */}
            <div style={{ backgroundColor: '#EBF4F6', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <p style={{ margin: '0 0 0.875rem', fontSize: '11px', fontWeight: '800', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Purchase Year', key: 'purchase_year', placeholder: 'e.g., 2021' },
                  { label: 'Purchase Cost (₹)', key: 'purchase_cost', placeholder: 'e.g., 15000' },
                  { label: 'Useful Life (Years)', key: 'useful_life', placeholder: 'e.g., 5' },
                  { label: 'Breakdown Frequency', key: 'breakdown_frequency', placeholder: 'e.g., 2' },
                  { label: 'Maintenance Cost (₹)', key: 'total_maintenance_cost', placeholder: 'e.g., 2000' },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ ...labelStyleModal, color: '#065f46' }}>{field.label}</label>
                    <input type="number"
                      style={{ ...inputStyleModal, backgroundColor: 'white' }}
                      value={newAsset.Financial_Details[field.key]}
                      onChange={(e) => setNewAsset({ ...newAsset, Financial_Details: { ...newAsset.Financial_Details, [field.key]: e.target.value } })}
                      placeholder={field.placeholder}
                      onFocus={(e) => e.target.style.borderColor = '#088395'}
                      onBlur={(e) => e.target.style.borderColor = '#EBF4F6'} />
                  </div>
                ))}
                {/* Usage Frequency */}
                <div>
                  <label style={{ ...labelStyleModal, color: '#065f46' }}>Usage Frequency</label>
                  <select
                    style={{ ...selectStyleModal, backgroundColor: 'white' }}
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

                {/* Warranty */}
                <div>
                  <label style={{ ...labelStyleModal, color: '#065f46' }}>Warranty (Years)</label>
                  <input
                    type="number"
                    style={{ ...inputStyleModal, backgroundColor: 'white' }}
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

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => { setShowAddAssetModal(false); setEditingAsset(null); resetAssetForm(); }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBF4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                style={{ flex: 1, padding: '11px', backgroundColor: 'white', color: '#6b7280', border: '2px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'background 0.15s' }}
              >Cancel</button>
              <button
                onClick={editingAsset ? handleUpdateAsset : handleAddAsset}
                disabled={savingAsset}
                onMouseEnter={(e) => { if (!savingAsset) e.currentTarget.style.backgroundColor = '#176B87'; }}
                onMouseLeave={(e) => { if (!savingAsset) e.currentTarget.style.backgroundColor = '#088395'; }}
                style={{ flex: 1, padding: '11px', backgroundColor: savingAsset ? '#9ca3af' : '#088395', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: savingAsset ? 'not-allowed' : 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', boxShadow: savingAsset ? 'none' : '0 2px 8px rgba(8,131,149,0.25)' }}
              >
                {savingAsset
                  ? (<><Loader2 size={16} className="animate-spin" />{editingAsset ? "Updating..." : "Adding..."}</>)
                  : (editingAsset ? "Update Asset" : "Add Asset")
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LabInfo;