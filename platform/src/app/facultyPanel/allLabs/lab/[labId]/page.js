'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Upload, ChevronDown, ChevronUp, Loader2, X, Edit, Trash2, Calendar, Clock, AlertCircle, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useParams } from 'next/navigation';

/* ─────────────────────────────────────────────
   TOAST SYSTEM
───────────────────────────────────────────── */
let _addToast = null;

const toast = {
  success: (msg) => _addToast?.({ type: 'success', msg }),
  error:   (msg) => _addToast?.({ type: 'error',   msg }),
  warning: (msg) => _addToast?.({ type: 'warning', msg }),
};

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _addToast = (t) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3800);
    };
    return () => { _addToast = null; };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((x) => x.id !== id));

  const cfg = {
    success: { bg: '#D1F8EF', border: '#088395', color: '#065f46', Icon: CheckCircle,   label: 'Success' },
    error:   { bg: '#fee2e2', border: '#ef4444', color: '#991b1b', Icon: XCircle,       label: 'Error'   },
    warning: { bg: '#fef3c7', border: '#f59e0b', color: '#92400e', Icon: AlertTriangle, label: 'Warning' },
    info:    { bg: '#EBF4F6', border: '#176B87', color: '#176B87', Icon: Info,          label: 'Info'    },
  };

  return (
    <div style={{
      position: 'fixed', top: '1.25rem', right: '1.25rem',
      zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px',
      maxWidth: '360px', width: '90vw', pointerEvents: 'none',
    }}>
      {toasts.map((t) => {
        const c = cfg[t.type] || cfg.info;
        const { Icon } = c;
        return (
          <div key={t.id} style={{
            background: c.bg, border: `1.5px solid ${c.border}`,
            borderRadius: '14px', padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(8,131,149,0.18)',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            animation: 'toastIn 0.28s cubic-bezier(.4,0,.2,1)',
            fontFamily: "'Segoe UI', sans-serif", pointerEvents: 'all',
          }}>
            <style>{`
              @keyframes toastIn {
                from { opacity:0; transform:translateX(40px) scale(.95); }
                to   { opacity:1; transform:translateX(0) scale(1); }
              }
            `}</style>
            <Icon size={20} color={c.border} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: c.border, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: '3px' }}>{c.label}</div>
              <div style={{ fontSize: '14px', color: c.color, fontWeight: 500, lineHeight: 1.5 }}>{t.msg}</div>
            </div>
            <button onClick={() => remove(t.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: c.color, display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '6px' }}>
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
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
        toast.warning("Only PDF or DOCX files are allowed!");
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
          toast.success("File uploaded successfully!");
          window.location.reload();
        } else {
          toast.error("Upload failed: " + data.error);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error uploading file.");
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
    notificationBanner: {
      background: 'linear-gradient(135deg, rgba(253, 164, 175, 0.95) 0%, rgba(251, 113, 133, 0.95) 100%)',
      backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '24px',
      marginBottom: '20px', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
      color: 'white', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    notifHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
    notifType: { fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.3px' },
    notifyCloseBtn: { background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
    notifDetails: { display: 'flex', flexDirection: 'column', gap: '10px' },
    notifRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', opacity: 0.95, fontWeight: '500' },
    notifDescription: { marginTop: '10px', fontSize: '15px', lineHeight: '1.7', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.3)', fontWeight: '400' },
    labInfoCard: { background: 'white', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)', border: '1px solid rgba(8, 131, 149, 0.1)' },
    labHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px', paddingBottom: '16px', borderBottom: '2px solid #D1F8EF' },
    labTitle: { fontSize: '30px', fontWeight: 800, color: '#176B87', margin: 0, letterSpacing: '-0.5px' },
    statusBadge: { padding: '8px 20px', borderRadius: '20px', fontSize: '15px', fontWeight: 700, background: '#D1F8EF', color: '#088395', border: '1px solid #088395', letterSpacing: '0.5px' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
    infoLabel: { fontSize: '12px', color: '#3674B5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoValue: { fontSize: '16px', color: '#176B87', fontWeight: 600 },
    moreInfoSection: { marginTop: '28px', borderTop: '2px solid #D1F8EF', paddingTop: '28px' },
    moreInfoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', cursor: 'pointer' },
    moreInfoTitle: { fontSize: '22px', fontWeight: 800, color: '#176B87', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.3px' },
    toggleIcon: { fontSize: '20px', color: '#088395', transition: 'transform 0.3s ease' },
    moreInfoContent: { display: showMoreInfo ? 'block' : 'none' },
    infoSectionTitle: { fontSize: '18px', fontWeight: 700, color: '#176B87', marginBottom: '20px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' },
    deviceCard: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '2px solid rgba(8, 131, 149, 0.15)', boxShadow: '0 2px 8px rgba(8, 131, 149, 0.08)', transition: 'all 0.3s ease' },
    deviceCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '2px solid #D1F8EF' },
    deviceType: { fontSize: '18px', fontWeight: 800, color: '#176B87', letterSpacing: '-0.3px' },
    deviceQuantity: { fontSize: '14px', fontWeight: 700, color: '#088395', background: '#D1F8EF', padding: '6px 14px', borderRadius: '12px', border: '1px solid #088395' },
    deviceCardBody: { display: 'flex', flexDirection: 'column', gap: '14px' },
    deviceDetail: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
    deviceDetailLabel: { fontSize: '13px', color: '#3674B5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '90px' },
    deviceDetailValue: { fontSize: '15px', color: '#176B87', fontWeight: 600, textAlign: 'right', flex: 1 },
    specsBox: { background: '#D1F8EF', borderRadius: '12px', padding: '24px', marginBottom: '20px', border: '2px solid rgba(8, 131, 149, 0.15)' },
    specsContent: { fontSize: '15px', color: '#176B87', lineHeight: '1.8', whiteSpace: 'pre-line', fontFamily: 'monospace', fontWeight: '500' },
    remarksBox: { background: '#D1F8EF', borderRadius: '12px', padding: '24px', marginTop: '20px', border: '2px solid rgba(8, 131, 149, 0.15)' },
    emptyState: { textAlign: 'center', padding: '44px 24px', color: '#3674B5', fontSize: '15px', fontWeight: '600', fontStyle: 'italic' },
    pcSection: { marginTop: '24px', marginBottom: '24px' },
    pcSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' },
    pcSectionTitle: { fontSize: '22px', fontWeight: 800, color: '#176B87', letterSpacing: '-0.3px' },
    pcSectionSubtitle: { fontSize: '13px', color: '#3674B5', fontWeight: 500 },
    pcControlsRow: { display: 'flex', flexWrap: 'wrap', width: isMobile ? '100%' : '50%', gap: '12px', marginBottom: '16px', alignItems: 'center' },
    pcSearchInputWrapper: { flex: 1, minWidth: '220px' },
    pcSearchInput: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '2px solid rgba(8, 131, 149, 0.25)', fontSize: '14px', boxSizing: 'border-box', color: '#176B87' },
    pcFilterButtons: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    pcFilterButton: { padding: '8px 12px', borderRadius: '999px', border: '1px solid #86B6F6', background: '#EBF4F6', color: '#176B87', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' },
    pcFilterButtonActive: { background: '#088395', borderColor: '#088395', color: '#ffffff' },
    pcList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    pcRow: { background: 'white', borderRadius: '12px', padding: isMobile ? '1rem' : '1.1rem 1.4rem', boxShadow: '0 1px 3px rgba(8, 131, 149, 0.08)', display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.25rem', flexWrap: isMobile ? 'wrap' : 'nowrap', transition: 'box-shadow 0.2s ease' },
    pcIconBox: { width: isMobile ? '42px' : '50px', height: isMobile ? '42px' : '50px', borderRadius: '10px', background: '#D1F8EF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    pcMainInfo: { flex: 1, minWidth: 0 },
    pcCategory: { fontSize: '11px', fontWeight: 600, color: '#088395', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    pcName: { fontSize: '16px', fontWeight: 700, color: '#176B87' },
    pcMetaSection: { display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.5rem', flexWrap: 'wrap' },
    pcMetaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#176B87', fontWeight: 500 },
    pcMetaIcon: { color: '#088395', flexShrink: 0 },
    assetsBadge: { display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: '#D1F8EF', color: '#088395' },
    pcActions: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 },
    pcIconButton: { width: isMobile ? '38px' : '40px', height: isMobile ? '38px' : '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: '2px solid transparent', cursor: 'pointer', transition: 'all 0.3s ease' },
    pcRedirectButton: { color: '#3674B5', background: 'rgba(134, 182, 246, 0.2)' },
    pcEmptyState: { padding: '1.75rem', textAlign: 'center', color: '#3674B5', fontSize: '14px', fontWeight: 500, background: 'white', borderRadius: '12px', border: '1px dashed rgba(8, 131, 149, 0.25)' },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <ToastContainer />
        <div style={styles.loaderContainer}>
          <Loader2 size={48} className="animate-spin" color="#088395" />
          <p style={styles.loaderText}>Loading lab details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ToastContainer />

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
            <div style={styles.notifDescription}>{notif.description}</div>
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
            <div style={styles.moreInfoHeader} onClick={() => setShowMoreInfo(!showMoreInfo)}>
              <h2 style={styles.moreInfoTitle}>
                More Information
                <span style={{ ...styles.toggleIcon, transform: showMoreInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </h2>
            </div>

            <div style={styles.moreInfoContent}>
              <div style={styles.infoSectionTitle}><span>Hardware Specifications</span></div>
              {labData.Hardware_Specifications ? (
                <div style={styles.specsBox}><div style={styles.specsContent}>{labData.Hardware_Specifications}</div></div>
              ) : (
                <div style={styles.emptyState}>No hardware specifications added yet</div>
              )}

              <div style={styles.infoSectionTitle}><span>Software Specifications</span></div>
              {labData.Software_Specifications ? (
                <div style={styles.specsBox}><div style={styles.specsContent}>{labData.Software_Specifications}</div></div>
              ) : (
                <div style={styles.emptyState}>No software specifications added yet</div>
              )}

              <div style={styles.infoSectionTitle}><span>Screen Board / Projector Details</span></div>
              {labData?.Device?.length > 0 ? (
                <div>
                  {labData.Device.map((device, index) => (
                    <div key={index} style={styles.deviceCard}>
                      <div style={styles.deviceCardHeader}>
                        <span style={styles.deviceType}>
                          {device.Device_Type.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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

              <div style={styles.infoSectionTitle}><span>Remarks</span></div>
              <div style={styles.remarksBox}>
                <div style={styles.specsContent}>{labData?.Remarks || 'No remarks added'}</div>
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
            {[
              { key: 'all', label: 'All PCs' },
              { key: 'withAssets', label: 'With Assets' },
              { key: 'withoutAssets', label: 'Without Assets' },
            ].map(({ key, label }) => (
              <button key={key} type="button"
                style={{ ...styles.pcFilterButton, ...(pcAssetFilter === key ? styles.pcFilterButtonActive : {}) }}
                onClick={() => setPcAssetFilter(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredPCs.length > 0 ? (
          <div style={styles.pcList}>
            {filteredPCs.map((pc) => (
              <div key={pc._id || pc.id} style={styles.pcRow}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(8, 131, 149, 0.13)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(8, 131, 149, 0.08)'; }}>
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
                  <button type="button"
                    style={{ ...styles.pcIconButton, ...styles.pcRedirectButton }}
                    onClick={() => { window.location.href = `/facultyPanel/allLabs/lab/${id}/asset/${pc._id}`; }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3674B5'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                    title="View PC details">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.pcEmptyState}>No PCs found for this lab.</div>
        )}
      </div>
    </div>
  );
};

export default LabInfoPage;