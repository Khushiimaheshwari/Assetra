'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function LabManagement() {
  const [labs, setLabs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [labIncharge, setLabIncharge] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLab, setNewLab] = useState({
    id: '',
    name: '',
    block: '',
    labRoom: '',
    capacity: '',
    status: 'Active',
    technician: '',
    incharge: '',
  });

  const labIDs = Array.from({ length: 30 }, (_, i) => ({
    ID: `Lab ${i + 1}`,
  }));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalLabs = labs.length;
  const activeLabs = labs.filter(lab => lab.Status === 'active').length;
  const underMaintenance = labs.filter(lab => lab.Status === 'under maintenance').length;

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchLab(),
          fetchTechnicians(),
          fetchLabIncharge()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await fetch("/api/admin/getlabTechnicians");
      const data = await res.json();
      if (res.ok) {
        setTechnicians(data.technicians);
      } else {
        console.error("Failed to fetch technicians:", data.error);
      }
    } catch (err) {
      console.error("Error fetching technicians:", err);
    }
  };
 
  const fetchLabIncharge = async () => {
    try {
      const res = await fetch("/api/admin/getFaculty");
      const data = await res.json();
      if (res.ok) {
        setLabIncharge(data.faculty);
      } else {
        console.error("Failed to fetch faculty:", data.error);
      }
    } catch (err) {
      console.error("Error fetching faculty:", err);
    }
  };

  const fetchLab = async () => {
    try {
      const res = await fetch("/api/admin/getLabs");
      const data = await res.json();
      if (res.ok) {
        setLabs(data.labs);
      } else {
        console.error("Failed to fetch lab:", data.error);
      }
    } catch (err) {
      console.error("Error fetching lab:", err);
    }
  };

  const handleAddLab = async () => {
    if (!newLab.name || !newLab.block || !newLab.capacity) {
      alert("Please fill in all required fields!");
      return;
    }

    setSaving(true);
    const payload = {
      labId: newLab.id,
      labName: newLab.name,
      block: newLab.block,
      labRoom: newLab.labRoom,
      capacity: newLab.capacity,
      status: newLab.status,
      technician: newLab.technician,
      incharge: newLab.incharge,
    };
    
    try {
      const res = await fetch("/api/admin/addLab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Lab added successfully!");
        setShowAddModal(false);
        resetForm();
        await fetchLab();
      } else {
        alert(data.error || "Failed to add lab");
      }
    } catch (error) {
      console.error("Error adding lab:", error);
      alert("Something went wrong while adding the lab.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditLab = (lab) => {
    setEditingLab(lab);
    setShowAddModal(true);
    setNewLab({
      id: lab.Lab_ID || "",
      name: lab.Lab_Name || "",
      block: lab.Block || "",
      labRoom: lab.Lab_Room || "",
      capacity: lab.Total_Capacity || "",
      status: lab.Status || "Active",
      technician: lab.LabTechnician?.[0]?._id || "",   
      incharge: lab.Lab_Incharge?.[0]?._id || "",
    });
  };

  const handleUpdateLab = async () => {
    if (!newLab.name || !newLab.block || !newLab.capacity) {
      alert("Please fill in all required fields!");
      return;
    }

    setSaving(true);
    const payload = {
      Lab_ID: newLab.id,
      Lab_Name: newLab.name,
      Block: newLab.block,
      Lab_Room: newLab.labRoom,
      Total_Capacity: newLab.capacity,
      Status: newLab.status,
      LabTechnician: newLab.technician,
      LabIncharge: newLab.incharge,
    };
    
    try {
      const res = await fetch(`/api/admin/editLabs/${editingLab._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Lab updated successfully!");
        setShowAddModal(false);
        setEditingLab(null);
        resetForm();
        await fetchLab();
      } else {
        alert(data.error || "Failed to update lab");
      }
    } catch (err) {
      console.error("Error updating lab:", err);
      alert("Something went wrong while updating the lab.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLab = async (labId) => {
    if (!window.confirm("Are you sure you want to delete this lab?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/deleteLab/${labId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert("Lab deleted successfully!");
        await fetchLab();
      } else {
        alert(data.error || "Failed to delete lab");
      }
    } catch (err) {
      console.error("Error deleting lab:", err);
      alert("Something went wrong while deleting the lab.");
    }
  };

  const resetForm = () => {
    setNewLab({
      id: '',
      name: '',
      block: '',
      labRoom: '',
      capacity: '',
      status: 'Active',
      technician: '',
      incharge: '',
    });
  };

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
      width: isMobile ? '100%' : 'calc(100% - 255px)',
      minHeight: '100vh',
      backgroundColor: '#EBF4F6',
      padding: isMobile ? '1rem' : '2rem',
      boxSizing: 'border-box',
      marginLeft: isMobile ? '0' : '255px',
      overflowX: 'hidden',
    },
    mainContent: {
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '1rem' : '0',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      border: '1px solid rgba(8, 131, 149, 0.1)',
      borderBottom: '3px solid #088395'
    },
    headerTitle: {
      fontSize: isMobile ? '22px' : isTablet ? '26px' : '30px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px'
    },
    addButton: {
      padding: isMobile ? '0.65rem 1.25rem' : '0.85rem 1.75rem',
      background: 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: isMobile ? '13px' : '15px',
      transition: 'all 0.3s ease',
      width: isMobile ? 'auto' : 'auto',
      justifyContent: 'center',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: isMobile ? '1rem' : '1.25rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    statCard: {
      background: 'white',
      backdropFilter: 'blur(20px)',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1.5rem' : '1.75rem',
      boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
      border: '1px solid rgba(8, 131, 149, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    statLabel: {
      fontSize: isMobile ? '13px' : '14px',
      color: '#176B87',
      marginBottom: '10px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statValue: {
      fontSize: isMobile ? '32px' : isTablet ? '36px' : '40px',
      fontWeight: 800,
      color: '#088395',
      letterSpacing: '-1px'
    },
    cardContainer: {
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? '1rem' : '1.25rem',
    },
    card: {
      background: "white",
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
      boxShadow: "0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)",
      transition: "all 0.3s ease",
      border: "1px solid rgba(8, 131, 149, 0.1)",
      cursor: 'pointer'
    },
    cardHeader: {
      display: "flex",
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: "space-between",
      gap: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
    },
    cardLeft: {
      display: "flex",
      alignItems: "center",
      gap: isMobile ? '1rem' : '1.25rem',
      flex: "1",
      minWidth: isMobile ? 'auto' : '250px',
    },
    labIcon: {
      width: isMobile ? '48px' : '56px',
      height: isMobile ? '48px' : '56px',
      borderRadius: isMobile ? '10px' : '12px',
      background: "linear-gradient(135deg, #D1F8EF 0%, #B8F3E9 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#088395",
      flexShrink: 0,
      boxShadow: '0 2px 4px rgba(8, 131, 149, 0.15)'
    },
    cardInfo: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    cardIdRow: {
      display: "flex",
      alignItems: "center",
      flexWrap: 'wrap',
      gap: "12px",
    },
    cardId: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: 700,
      color: "#3674B5",
      letterSpacing: "0.5px",
      textTransform: 'uppercase'
    },
    cardName: {
      fontSize: isMobile ? '17px' : '19px',
      fontWeight: 800,
      color: "#176B87",
      margin: 0,
      letterSpacing: '-0.3px'
    },
    statusBadge: {
      display: "inline-flex",
      alignItems: "center",
      padding: "5px 12px",
      borderRadius: "8px",
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    statusActive: {
      background: "#D1F8EF",
      color: "#088395",
      border: '1px solid #088395'
    },
    statusMaintenance: {
      background: "#FFE8CC",
      color: "#E67E22",
      border: '1px solid #E67E22'
    },
    cardRight: {
      display: "flex",
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
    },
    cardDetails: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      flex: isMobile ? '1' : 'auto',
    },
    detailItem: {
      display: "flex",
      alignItems: "center",
      fontSize: isMobile ? '13px' : '14px',
      color: "#176B87",
      gap: "4px",
      fontWeight: '500'
    },
    detailLabel: {
      fontWeight: 700,
      color: "#3674B5",
      marginRight: "6px",
    },
    detailValue: {
      fontWeight: 700,
      color: "#176B87",
    },
    actionButtons: {
      display: "flex",
      gap: isMobile ? '8px' : '10px',
      alignItems: "center",
      justifyContent: isMobile ? 'flex-start' : 'center',
    },
    iconButton: {
      width: isMobile ? '38px' : '40px',
      height: isMobile ? '38px' : '40px',
      background: "transparent",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    editButton: {
      color: "#088395",
      background: "#D1F8EF",
      border: '2px solid transparent'
    },
    deleteButton: {
      color: "#E74C3C",
      background: "#FADBD8",
      border: '2px solid transparent'
    },
    viewButton: {
      color: "#3674B5",
      background: "rgba(134, 182, 246, 0.2)",
      border: '2px solid transparent'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(23, 107, 135, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '1rem' : '2rem',
    },
    modalContent: {
      background: 'white',
      borderRadius: isMobile ? '16px' : '20px',
      padding: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
      width: '100%',
      maxWidth: isMobile ? '100%' : isTablet ? '540px' : '640px',
      maxHeight: isMobile ? '90vh' : '95vh',
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(8, 131, 149, 0.2), 0 10px 10px -5px rgba(8, 131, 149, 0.1)',
      border: '1px solid rgba(8, 131, 149, 0.1)'
    },
    modalHeader: {
      fontSize: isMobile ? '22px' : '26px',
      fontWeight: 800,
      color: '#176B87',
      marginBottom: isMobile ? '1.25rem' : '1.5rem',
      marginTop: 0,
      paddingBottom: '1rem',
      borderBottom: '2px solid #D1F8EF',
      letterSpacing: '-0.5px'
    },
    formGroup: {
      marginBottom: isMobile ? '1.25rem' : '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: 700,
      color: '#176B87',
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: isMobile ? '12px' : '14px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px',
      fontSize: isMobile ? '14px' : '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      fontWeight: '500',
      color: '#176B87'
    },
    select: {
      width: '100%',
      padding: isMobile ? '12px' : '14px',
      border: '2px solid rgba(8, 131, 149, 0.2)',
      borderRadius: '10px',
      fontSize: isMobile ? '14px' : '15px',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      background: 'white',
      fontWeight: '500',
      color: '#176B87',
      cursor: 'pointer'
    },
    modalActions: {
      display: 'flex',
      flexDirection: 'row',
      gap: isMobile ? '1rem' : '1.25rem',
      marginTop: isMobile ? '1.5rem' : '1.75rem',
      paddingTop: '1.25rem',
      borderTop: '1px solid rgba(8, 131, 149, 0.1)'
    },
    cancelButton: {
      flex: 1,
      padding: isMobile ? '12px' : '14px',
      background: 'white',
      color: '#176B87',
      border: '2px solid rgba(8, 131, 149, 0.3)',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: isMobile ? '14px' : '15px',
      transition: 'all 0.3s ease',
      letterSpacing: '0.3px'
    },
    saveButton: {
      flex: 1,
      padding: isMobile ? '12px' : '14px',
      background: saving ? '#86B6F6' : 'linear-gradient(135deg, #088395 0%, #0a9fb5 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: 700,
      cursor: saving ? 'not-allowed' : 'pointer',
      fontSize: isMobile ? '14px' : '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.3s ease',
      boxShadow: saving ? 'none' : '0 4px 6px -1px rgba(8, 131, 149, 0.3)',
      letterSpacing: '0.3px'
    }
  };

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

  return (
    <div style={styles.container}>
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Lab Management</h1>
          <button 
            style={styles.addButton} 
            onClick={() => setShowAddModal(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 10px -1px rgba(8, 131, 149, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.3)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Add New Lab
          </button>
        </header>

        <div style={styles.statsGrid}>
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8, 131, 149, 0.2), 0 4px 6px -2px rgba(8, 131, 149, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)';
            }}
          >
            <div style={styles.statLabel}>Total Labs</div>
            <div style={styles.statValue}>{totalLabs}</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8, 131, 149, 0.2), 0 4px 6px -2px rgba(8, 131, 149, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)';
            }}
          >
            <div style={styles.statLabel}>Active Labs</div>
            <div style={styles.statValue}>{activeLabs}</div>
          </div>
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8, 131, 149, 0.2), 0 4px 6px -2px rgba(8, 131, 149, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)';
            }}
          >
            <div style={styles.statLabel}>Under Maintenance</div>
            <div style={styles.statValue}>{underMaintenance}</div>
          </div>
        </div>

        {labs.length > 0 ? (
          <div style={styles.cardContainer}>
            {labs.map((lab) => (
              <div 
                key={lab._id} 
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8, 131, 149, 0.15), 0 4px 6px -2px rgba(8, 131, 149, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.1)';
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.cardLeft}>
                    <div style={styles.labIcon}>
                      <svg width={isMobile ? "22" : "26"} height={isMobile ? "22" : "26"} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div style={styles.cardInfo}>
                      <div style={styles.cardIdRow}>
                        <span style={styles.cardId}>#{lab.Lab_Name}</span>
                        <span style={{...styles.statusBadge, ...(lab.Status === 'Active' ? styles.statusActive : styles.statusMaintenance)}}>
                          {lab.Status}
                        </span>
                      </div>
                      <h3 style={styles.cardName}>{lab.Lab_ID}</h3>
                    </div>
                  </div>

                  <div style={styles.cardRight}>
                    <div style={styles.cardDetails}>
                      <div style={styles.detailItem}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: "6px", color: '#3674B5' }}>
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        <span style={styles.detailLabel}>Lab Room:</span>
                        <span style={styles.detailValue}>{lab.Lab_Room}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: "6px", color: '#3674B5' }}>
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span style={styles.detailLabel}>Capacity:</span>
                        <span style={styles.detailValue}>{lab.Total_Capacity}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: "6px", color: '#3674B5' }}>
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span style={styles.detailLabel}>Technician:</span>
                        {lab?.LabTechnician?.length === 0 ? (
                          <span style={{ ...styles.detailValue, fontStyle: 'italic', color: '#86B6F6' }}>Not Assigned</span>
                        ) : (
                          lab.LabTechnician ? (                            
                            <span style={styles.detailValue}>{lab?.LabTechnician[0]?.Name}</span>
                            ) : (
                            <span style={{ ...styles.detailValue, fontStyle: 'italic', color: '#86B6F6' }}>Not Assigned</span>
                            )
                          )
                        }
                      </div>
                    </div>

                    <div style={styles.actionButtons}>
                      <button 
                        style={{ ...styles.iconButton, ...styles.editButton }} 
                        onClick={() => handleEditLab(lab)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#088395';
                          e.currentTarget.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        style={{ ...styles.iconButton, ...styles.deleteButton }} 
                        onClick={() => handleDeleteLab(lab._id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#E74C3C';
                          e.currentTarget.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button 
                        style={{ ...styles.iconButton, ...styles.viewButton }} 
                        onClick={() => { window.location.href = `/adminPanel/lab_management/lab/${lab._id}`; }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#3674B5';
                          e.currentTarget.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: isMobile ? '2.5rem 1.25rem' : '3.5rem 2rem', background: 'white', borderRadius: '16px', color: '#176B87', border: '1px solid rgba(8, 131, 149, 0.1)', boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1)' }}>
            <p style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '600', margin: 0 }}>No labs available. Please add a new lab.</p>
          </div>
        )}
        
        {showAddModal && (
          <div style={styles.modal} onClick={() => { setShowAddModal(false); setEditingLab(null); resetForm(); }}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalHeader}>{editingLab ? 'Update Lab' : 'Add New Lab'}</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Lab ID</label>
                <select
                    style={styles.select}
                    value={newLab.id}
                    onChange={(e) => setNewLab({ ...newLab, id: e.target.value })}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#088395'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                  >
                    <option value="">Select Lab</option>
                    {labIDs.map((lab) => (
                      <option key={lab.ID} value={lab.ID}>
                        {lab.ID}
                      </option>
                    ))}
                  </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Lab Name</label>
                <select 
                  style={styles.select} 
                  value={newLab.name} 
                  onChange={(e) => setNewLab({...newLab, name: e.target.value})}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#088395'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                >
                  <option value="">Select Lab Name</option>
                  <option value="Computer Science Lab">Computer Science Lab</option>
                  <option value="Chemistry Lab">Chemistry Lab</option>
                  <option value="Mechanics Lab">Mechanics Lab</option>
                  <option value="Electronics Lab">Electronics Lab</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Block</label>
                      <input 
                        type="text" 
                        style={styles.input} 
                        value={newLab.block} 
                        onChange={(e) => setNewLab({...newLab, block: e.target.value})} 
                        placeholder="Enter Block" 
                        onFocus={(e) => e.currentTarget.style.borderColor = '#088395'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Lab Room</label>
                      <input 
                        type="text" 
                        style={styles.input} 
                        value={newLab.labRoom} 
                        onChange={(e) => setNewLab({...newLab, labRoom: e.target.value})} 
                        placeholder="Enter labRoom" 
                        onFocus={(e) => e.currentTarget.style.borderColor = '#088395'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                      />
                    </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Capacity</label>
                <input 
                  type="number" 
                  style={styles.input} 
                  value={newLab.capacity} 
                  onChange={(e) => setNewLab({...newLab, capacity: e.target.value})} 
                  placeholder="Enter capacity" 
                  onFocus={(e) => e.currentTarget.style.borderColor = '#088395'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select 
                  style={styles.select} 
                  value={newLab.status} 
                  onChange={(e) => setNewLab({...newLab, status: e.target.value})}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#088395'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                >
                  <option value="Active">Active</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Lab technician</label>
                <select 
                  style={styles.input} 
                  value={newLab.technician} 
                  onChange={(e) => setNewLab({ ...newLab, technician: e.target.value })}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#088395'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                >
                  <option value="">Select Lab technician</option>
                  {technicians.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.Name} ({tech.Email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Lab incharge</label>
                <select 
                  style={styles.input} 
                  value={newLab.incharge} 
                  onChange={(e) => setNewLab({ ...newLab, incharge: e.target.value })}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#088395'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.2)'}
                >
                  <option value="">Select Lab incharge</option>
                  {labIncharge.map((incharge) => (
                    <option key={incharge._id} value={incharge._id}>
                      {incharge.Name} ({incharge.Email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelButton} 
                  onClick={() => { setShowAddModal(false); setEditingLab(null); resetForm(); }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(8, 131, 149, 0.05)';
                    e.currentTarget.style.borderColor = '#088395';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = 'rgba(8, 131, 149, 0.3)';
                  }}
                >
                  Cancel
                </button>
                <button 
                  style={styles.saveButton} 
                  onClick={editingLab ? handleUpdateLab : handleAddLab}
                  disabled={saving}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 10px -1px rgba(8, 131, 149, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.3)';
                    }
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {editingLab ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingLab ? 'Update Lab' : 'Add Lab'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}