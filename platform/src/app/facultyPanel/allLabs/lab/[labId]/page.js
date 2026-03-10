'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Upload, ChevronDown, ChevronUp, Loader2, X, Edit, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

const LabInfoPage = () => {
  const { labId: id } = useParams();  
  const [labData, setLabData] = useState([]);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pcSearch, setPcSearch] = useState("");
  const [pcAssetFilter, setPcAssetFilter] = useState("all");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchLab = async () => {
    try {
      const res = await fetch(`/api/faculty/getLabById/${id}`);
      const data = await res.json();
      if (res.ok) {
        setLabData(data.lab);
        console.log(data.lab);

        const labsArray = Array.isArray(data.labs)
          ? data.labs
          : [data.lab || data.labs];

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

  const removeNotification = (notifId) => {
    setNotifications(notifications.filter(notif => notif.id !== notifId));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchLab()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleExpand = (expandId) => {
    setExpandedId(expandedId === expandId ? null : expandId);
  };

  const handleFileUpload = (subjectId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf, .docx";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF or DOCX files are allowed!");
        return;
      }

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      try {
        const res = await fetch("/api/admin/uploadListOfExperiment", {
          method: "POST",
          body: formDataUpload,
          headers: { "subject-id": subjectId },
        });

        const data = await res.json();
        if (data.success) {
          alert("File uploaded successfully");
          window.location.reload();
        } else {
          alert("Upload failed: " + data.error);
        }
      } catch (err) {
        console.error(err);
        alert("Error uploading file.");
      }
    };

    input.click();
  };

  const labPCs = labData?.PCs || [];
  const filteredPCs = labPCs.filter((pc) => {
    const name = (pc?.PC_Name || '').toLowerCase();
    const search = pcSearch.toLowerCase();
    const matchesSearch = !search || name.includes(search);
    const assetCount = Array.isArray(pc?.Assets) ? pc.Assets.length : 0;
    let matchesFilter = true;
    if (pcAssetFilter === 'withAssets') matchesFilter = assetCount > 0;
    else if (pcAssetFilter === 'withoutAssets') matchesFilter = assetCount === 0;
    return matchesSearch && matchesFilter;
  });

  const styles = {
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
    notificationBanner: {
      background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.95) 0%, rgba(251, 113, 133, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
      color: 'white',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    notifHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '14px'
    },
    notifType: {
      fontSize: '20px',
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      letterSpacing: '-0.3px'
    },
    notifyCloseBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    notifDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    notifRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '15px',
      opacity: 0.95,
      fontWeight: '500'
    },
    notifDescription: {
      marginTop: '10px',
      fontSize: '15px',
      lineHeight: '1.7',
      paddingTop: '14px',
      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
      fontWeight: '400'
    },
    labInfoCard: {
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    labHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '14px',
      paddingBottom: '16px',
      borderBottom: '2px solid #D1F8EF'
    },
    labTitle: {
      fontSize: '30px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    statusBadge: {
      padding: '8px 20px',
      borderRadius: '20px',
      fontSize: '15px',
      fontWeight: 700,
      background: '#D1F8EF',
      color: '#088395',
      border: '1px solid #088395',
      letterSpacing: '0.5px'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    infoLabel: {
      fontSize: '12px',
      color: '#3674B5',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    infoValue: {
      fontSize: '16px',
      color: '#176B87',
      fontWeight: 600
    },
    moreInfoSection: {
      marginTop: '28px',
      borderTop: '2px solid #D1F8EF',
      paddingTop: '28px'
    },
    moreInfoHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      cursor: 'pointer'
    },
    moreInfoTitle: {
      fontSize: '22px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      letterSpacing: '-0.3px'
    },
    toggleIcon: {
      fontSize: '20px',
      color: '#088395',
      transition: 'transform 0.3s ease'
    },
    moreInfoContent: {
      display: showMoreInfo ? 'block' : 'none',
    },
    infoSectionTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#176B87',
      marginBottom: '20px',
      marginTop: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    deviceCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      border: '2px solid rgba(8, 131, 149, 0.15)',
      boxShadow: '0 2px 8px rgba(8, 131, 149, 0.08)',
      transition: 'all 0.3s ease'
    },
    deviceCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '18px',
      paddingBottom: '14px',
      borderBottom: '2px solid #D1F8EF'
    },
    deviceType: {
      fontSize: '18px',
      fontWeight: 800,
      color: '#176B87',
      letterSpacing: '-0.3px'
    },
    deviceQuantity: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#088395',
      background: '#D1F8EF',
      padding: '6px 14px',
      borderRadius: '12px',
      border: '1px solid #088395'
    },
    deviceCardBody: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    },
    deviceDetail: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '10px'
    },
    deviceDetailLabel: {
      fontSize: '13px',
      color: '#3674B5',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      minWidth: '90px'
    },
    deviceDetailValue: {
      fontSize: '15px',
      color: '#176B87',
      fontWeight: 600,
      textAlign: 'right',
      flex: 1
    },
    specsBox: {
      background: '#D1F8EF',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      border: '2px solid rgba(8, 131, 149, 0.15)'
    },
    specsContent: {
      fontSize: '15px',
      color: '#176B87',
      lineHeight: '1.8',
      whiteSpace: 'pre-line',
      fontFamily: 'monospace',
      fontWeight: '500'
    },
    remarksBox: {
      background: '#D1F8EF',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
      border: '2px solid rgba(8, 131, 149, 0.15)'
    },
    emptyState: {
      textAlign: 'center',
      padding: '44px 24px',
      color: '#3674B5',
      fontSize: '15px',
      fontWeight: '600',
      fontStyle: 'italic'
    },
    // PC Section styles (matching admin panel)
    pcSection: {
      marginTop: '24px',
      marginBottom: '24px'
    },
    pcSectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    pcSectionTitle: {
      fontSize: '22px',
      fontWeight: 800,
      color: '#176B87',
      letterSpacing: '-0.3px'
    },
    pcSectionSubtitle: {
      fontSize: '13px',
      color: '#3674B5',
      fontWeight: 500
    },
    pcControlsRow: {
      display: 'flex',
      flexWrap: 'wrap',
      width: isMobile ? '100%' : '50%',
      gap: '12px',
      marginBottom: '16px',
      alignItems: 'center'
    },
    pcSearchInputWrapper: {
      flex: 1,
      minWidth: '220px'
    },
    pcSearchInput: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '10px',
      border: '2px solid rgba(8, 131, 149, 0.25)',
      fontSize: '14px',
      boxSizing: 'border-box',
      color: '#176B87'
    },
    pcFilterButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    pcFilterButton: {
      padding: '8px 12px',
      borderRadius: '999px',
      border: '1px solid #86B6F6',
      background: '#EBF4F6',
      color: '#176B87',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    pcFilterButtonActive: {
      background: '#088395',
      borderColor: '#088395',
      color: '#ffffff'
    },
    pcList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    pcRow: {
      background: 'white',
      borderRadius: '12px',
      padding: isMobile ? '1rem' : '1.1rem 1.4rem',
      boxShadow: '0 1px 3px rgba(8, 131, 149, 0.08)',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.75rem' : '1.25rem',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      transition: 'box-shadow 0.2s ease'
    },
    pcIconBox: {
      width: isMobile ? '42px' : '50px',
      height: isMobile ? '42px' : '50px',
      borderRadius: '10px',
      background: '#D1F8EF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    pcMainInfo: {
      flex: 1,
      minWidth: 0
    },
    pcCategory: {
      fontSize: '11px',
      fontWeight: 600,
      color: '#088395',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px'
    },
    pcName: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#176B87'
    },
    pcMetaSection: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.75rem' : '1.5rem',
      flexWrap: 'wrap'
    },
    pcMetaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      color: '#176B87',
      fontWeight: 500
    },
    pcMetaIcon: {
      color: '#088395',
      flexShrink: 0
    },
    assetsBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
      background: '#D1F8EF',
      color: '#088395'
    },
    pcActions: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      flexShrink: 0
    },
    pcIconButton: {
      width: isMobile ? '38px' : '40px',
      height: isMobile ? '38px' : '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px',
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    pcRedirectButton: {
      color: '#3674B5',
      background: 'rgba(134, 182, 246, 0.2)'
    },
    pcEmptyState: {
      padding: '1.75rem',
      textAlign: 'center',
      color: '#3674B5',
      fontSize: '14px',
      fontWeight: 500,
      background: 'white',
      borderRadius: '12px',
      border: '1px dashed rgba(8, 131, 149, 0.25)'
    },
    subjectListCard: {
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '24px',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    subjectListHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #D1F8EF'
    },
    subjectListTitle: {
      fontSize: '24px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    cardContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid rgba(8, 131, 149, 0.15)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    cardHeader: {
      padding: '22px 26px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    cardLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      flex: 1
    },
    avatar: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #D1F8EF 0%, #c8f5ec 100%)', // ← #B8F3E9 → #c8f5ec
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '700',
      color: '#088395'
    },
    cardInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    subjectTitle: {
      fontSize: '19px',
      fontWeight: '800',
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.3px'
    },
    courseCode: {
      fontSize: '15px',
      color: '#3674B5',
      fontWeight: '600'
    },
    cardRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    },
    uploadBadge: {
      padding: '7px 14px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700'
    },
    statusUploaded: {
      backgroundColor: '#D1F8EF',
      color: '#088395',
      border: '1px solid #088395'
    },
    statusPending: {
      backgroundColor: 'rgba(54, 116, 181, 0.1)', // ← #FFE8CC → Assetra blue tint
      color: '#3674B5',                             // ← #E67E22 → #3674B5
      border: '1px solid #3674B5'                  // ← #E67E22 → #3674B5
    },
    programCount: {
      padding: '7px 14px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '700',
      backgroundColor: 'rgba(134, 182, 246, 0.2)',
      color: '#3674B5',
      border: '1px solid #3674B5'
    },
    actionButtons: {
      display: "flex",
      gap: "10px",
    },
    iconButton: {
      width: "40px",
      height: "40px",
      background: "transparent",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    expandButton: {
      background: "#D1F8EF",
      color: "#088395",
      transition: "all 0.2s ease",
    },
    expandedContent: {
      borderTop: '2px solid #D1F8EF',
      padding: '26px',
      backgroundColor: '#EBF4F6'
    },
    section: {
      marginBottom: '26px'
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: '800',
      color: '#176B87',
      marginBottom: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    uploadSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '18px',
      backgroundColor: 'white',
      borderRadius: '10px',
      border: '2px dashed rgba(8, 131, 149, 0.3)'
    },
    uploadButton: {
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 18px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 2px 4px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    viewButtonStyle: {
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 700,
      transition: "all 0.25s ease",
      boxShadow: "0 2px 5px rgba(8, 131, 149, 0.3)",
      letterSpacing: '0.3px'
    },
    fileName: {
      fontSize: '15px',
      color: '#176B87',
      fontWeight: '600'
    },
    programsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '18px'
    },
    programCard: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '18px',
      border: '1px solid rgba(8, 131, 149, 0.15)'
    },
    programHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '14px'
    },
    programName: {
      fontSize: '16px',
      fontWeight: '800',
      color: '#176B87',
      marginBottom: '6px',
      letterSpacing: '-0.3px'
    },
    programBadge: {
      padding: '5px 10px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '700',
      backgroundColor: 'rgba(134, 182, 246, 0.2)',
      color: '#3674B5',
      border: '1px solid #3674B5'
    },
    programDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    detailRow: {
      display: 'flex',
      fontSize: '14px',
      color: '#176B87'
    },
    detailLabel: {
      fontWeight: '700',
      minWidth: '110px',
      color: '#3674B5'
    },
    detailValue: {
      color: '#176B87',
      fontWeight: '600'
    },
    timetableCard: {
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      overflowX: 'auto',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    timetableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      paddingBottom: '16px',
      borderBottom: '2px solid #D1F8EF'
    },
    weekNavigation: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px'
    },
    navButton: {
      padding: '10px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(8, 131, 149, 0.3)'
    },
    weekLabel: {
      fontSize: '17px',
      fontWeight: 700,
      color: '#176B87',
      letterSpacing: '-0.3px'
    },
    viewToggle: {
      display: 'flex',
      gap: '10px'
    },
    toggleButton: {
      padding: '10px 18px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      background: 'white',
      color: '#176B87',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px'
    },
    toggleButtonActive: {
      backgroundColor: '#D1F8EF',
      color: '#088395',
      borderColor: '#088395'
    },
    addButton: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    timetableGrid: {
      display: 'grid',
      gridTemplateColumns: '80px repeat(5, 1fr)',
      gridAutoRows: 'minmax(60px, auto)',
      gap: '1px',
      background: 'rgba(8, 131, 149, 0.2)',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    dayHeader: {
      background: '#D1F8EF',
      padding: '14px',
      textAlign: 'center',
      fontWeight: 800,
      fontSize: '15px',
      color: '#088395',
      letterSpacing: '0.3px'
    },
    timeSlot: {
      background: 'white',
      padding: '14px 8px',
      fontSize: '13px',
      color: '#3674B5',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 700
    },
    emptyCell: {
      background: 'white',
      minHeight: '60px',
      position: 'relative'
    },
    eventCell: {
      padding: '10px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 700,
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    eventTitle: {
      fontSize: '14px',
      fontWeight: 800,
      letterSpacing: '-0.2px'
    },
    eventDetails: {
      fontSize: '12px',
      opacity: 0.95,
      fontWeight: '600'
    },
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalTT: {
      backgroundColor: '#fff',
      borderRadius: '1rem',
      boxShadow: '0 20px 60px rgba(8, 131, 149, 0.3)',
      padding: '2rem',
      width: '400px',
      maxWidth: '90%',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    heading: {
      fontSize: '1.35rem',
      fontWeight: '800',
      marginBottom: '1rem',
      textAlign: 'center',
      color: '#176B87',
      letterSpacing: '-0.5px'
    },
    subHeading: {
      fontSize: '0.85rem',
      marginBottom: '1.5rem',
      textAlign: 'center',
      color: '#3674B5',
      fontWeight: '600'
    },
    select: {
      width: '100%',
      padding: '14px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      background: 'white',
      fontWeight: '500',
      color: '#176B87',
      cursor: 'pointer',
      marginBottom: '12px'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.85rem',
      marginTop: '8px'
    },
    cancelButton: {
      flex: 1,
      padding: '14px',
      background: 'white',
      color: '#176B87',
      border: '2px solid rgba(8, 131, 149, 0.3)',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px'
    },
    saveButton: {
      flex: 1,
      padding: '14px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    slotOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    slotModal: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(8, 131, 149, 0.3)',
      padding: '32px 36px',
      width: '90%',
      maxWidth: '540px',
      position: 'relative',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    slotModalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      paddingBottom: '18px',
      borderBottom: '2px solid #D1F8EF'
    },
    slotModalTitle: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    slotCloseButton: {
      background: 'transparent',
      border: 'none',
      color: '#3674B5',
      cursor: 'pointer',
      padding: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    },
    slotModalContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '22px'
    },
    slotInfoRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    slotInfoLabel: {
      fontSize: '13px',
      color: '#3674B5',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    slotInfoValue: {
      fontSize: '16px',
      color: '#176B87',
      fontWeight: 600,
      padding: '12px',
      background: '#EBF4F6',
      borderRadius: '10px',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    slotStatusBadge: {
      padding: '10px 20px',
      borderRadius: '20px',
      fontSize: '15px',
      fontWeight: 700,
      background: '#D1F8EF',
      color: '#088395',
      display: 'inline-block',
      width: 'fit-content',
      border: '1px solid #088395'
    },
    slotModalActions: {
      display: 'flex',
      gap: '14px',
      marginTop: '28px',
      paddingTop: '22px',
      borderTop: '1px solid rgba(8, 131, 149, 0.1)'
    },
    slotEditButton: {
      flex: 1,
      padding: '14px',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    slotDeleteButton: {
      flex: 1,
      padding: '14px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
      letterSpacing: '0.3px'
    },
    redirectButton: {
      color: '#EBF4F6'
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <Loader2 size={48} className="animate-spin" color="#088395" />
          <p style={styles.loaderText}>Loading lab details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Notification Banners */}
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
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
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
            <div style={styles.notifDescription}>
              {notif.description}
            </div>
          </div>
        </div>
      ))}

      {/* Lab Information Card */}
      {labData ? (
        <div style={styles.labInfoCard}>
          <div style={styles.labHeader}>
            <h1 style={styles.labTitle}>{labData?.Lab_Name}</h1>
            <span style={styles.statusBadge}>{labData?.Status?.toUpperCase()}</span>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab ID</span>
              <span style={styles.infoValue}>{labData?.Lab_ID}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab Name</span>
              <span style={styles.infoValue}>{labData?.Lab_Name}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Block</span>
              <span style={styles.infoValue}>{labData?.Block}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Lab Room</span>
              <span style={styles.infoValue}>{labData?.Lab_Room}</span>
            </div>
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
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Total Capacity</span>
              <span style={styles.infoValue}>{labData?.Total_Capacity}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Total PCs</span>
              <span style={styles.infoValue}>{labData?.PCs?.length}</span>
            </div>
          </div>

          {/* More Info Section */}
          <div style={styles.moreInfoSection}>
            <div
              style={styles.moreInfoHeader}
              onClick={() => setShowMoreInfo(!showMoreInfo)}
            >
              <h2 style={styles.moreInfoTitle}>
                More Information
                <span style={{
                  ...styles.toggleIcon,
                  transform: showMoreInfo ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </h2>
            </div>

            <div style={styles.moreInfoContent}>
              <div style={styles.infoSectionTitle}>
                <span>Hardware Specifications</span>
              </div>
              {labData.Hardware_Specifications ? (
                <div style={styles.specsBox}>
                  <div style={styles.specsContent}>{labData.Hardware_Specifications}</div>
                </div>
              ) : (
                <div style={styles.emptyState}>No hardware specifications added yet</div>
              )}

              <div style={styles.infoSectionTitle}>
                <span>Software Specifications</span>
              </div>
              {labData.Software_Specifications ? (
                <div style={styles.specsBox}>
                  <div style={styles.specsContent}>{labData.Software_Specifications}</div>
                </div>
              ) : (
                <div style={styles.emptyState}>No software specifications added yet</div>
              )}

              <div style={styles.infoSectionTitle}>
                <span>Screen Board / Projector Details</span>
              </div>
              {labData?.Device?.length > 0 ? (
                <div>
                  {labData.Device.map((device, index) => (
                    <div key={index} style={styles.deviceCard}>
                      <div style={styles.deviceCardHeader}>
                        <span style={styles.deviceType}>
                          {device.Device_Type
                            .split(" ")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </span>
                        <span style={styles.deviceQuantity}>Qty: {labData.Device?.length}</span>
                      </div>
                      <div style={styles.deviceCardBody}>
                        <div style={styles.deviceDetail}>
                          <span style={styles.deviceDetailLabel}>Brand</span>
                          <span style={styles.deviceDetailValue}>{device.Brand}</span>
                        </div>
                        <div style={styles.deviceDetail}>
                          <span style={styles.deviceDetailLabel}>Serial No.</span>
                          <span style={styles.deviceDetailValue}>{device.Serial_No}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>No screen/projector details added yet</div>
              )}

              <div style={styles.infoSectionTitle}>
                <span>Remarks</span>
              </div>
              <div style={styles.remarksBox}>
                <div style={styles.specsContent}>
                  {labData?.Remarks || 'No remarks added'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* PC Section */}
      <div style={styles.pcSection}>
        <div style={styles.pcSectionHeader}>
          <div>
            <h2 style={styles.pcSectionTitle}>Lab PCs</h2>
            <span style={styles.pcSectionSubtitle}>
              {labPCs.length} PC{labPCs.length === 1 ? '' : 's'} in this lab
            </span>
          </div>
        </div>

        <div style={styles.pcControlsRow}>
          <div style={styles.pcSearchInputWrapper}>
            <input
              type="text"
              placeholder="Search PC by name..."
              value={pcSearch}
              onChange={(e) => setPcSearch(e.target.value)}
              style={styles.pcSearchInput}
              onFocus={(e) => (e.target.style.borderColor = '#088395')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(8, 131, 149, 0.25)')}
            />
          </div>
          <div style={styles.pcFilterButtons}>
            <button
              type="button"
              style={{
                ...styles.pcFilterButton,
                ...(pcAssetFilter === 'all' ? styles.pcFilterButtonActive : {}),
              }}
              onClick={() => setPcAssetFilter('all')}
            >
              All PCs
            </button>
            <button
              type="button"
              style={{
                ...styles.pcFilterButton,
                ...(pcAssetFilter === 'withAssets' ? styles.pcFilterButtonActive : {}),
              }}
              onClick={() => setPcAssetFilter('withAssets')}
            >
              With Assets
            </button>
            <button
              type="button"
              style={{
                ...styles.pcFilterButton,
                ...(pcAssetFilter === 'withoutAssets' ? styles.pcFilterButtonActive : {}),
              }}
              onClick={() => setPcAssetFilter('withoutAssets')}
            >
              Without Assets
            </button>
          </div>
        </div>

        {filteredPCs.length > 0 ? (
          <div style={styles.pcList}>
            {filteredPCs.map((pc) => (
              <div
                key={pc._id || pc.id}
                style={styles.pcRow}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(8, 131, 149, 0.13)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(8, 131, 149, 0.08)';
                }}
              >
                <div style={styles.pcIconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#088395" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>

                <div style={styles.pcMainInfo}>
                  <div style={styles.pcCategory}># {labData?.Lab_Name}</div>
                  <div style={styles.pcName}>{pc.PC_Name}</div>
                </div>

                <div style={styles.pcMetaSection}>
                  <div style={styles.pcMetaItem}>
                    <svg style={styles.pcMetaIcon} width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
                    </svg>
                    <span>Assets:&nbsp;</span>
                    <span style={styles.assetsBadge}>
                      {(pc.Assets && pc.Assets.length) || 0} item{pc.Assets && pc.Assets.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div style={styles.pcActions}>
                  <button
                    type="button"
                    style={{ ...styles.pcIconButton, ...styles.pcRedirectButton }}
                    onClick={() => {
                      window.location.href = `/facultyPanel/allLabs/lab/${id}/asset/${pc._id}`;
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3674B5';
                      e.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="View PC details"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.pcEmptyState}>
            No PCs found for this lab.
          </div>
        )}
      </div>
    </div>
  );
};

export default LabInfoPage;