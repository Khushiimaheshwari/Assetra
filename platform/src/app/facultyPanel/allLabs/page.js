'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function LabManagement() {
  const [labs, setLabs] = useState([]);
  const [inchargeLab, setInchargeLab] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchLab();
    fetchInchargeLab();
  }, []);

  const totalLabs        = labs.length + inchargeLab.length;
  const activeLabs       = labs.filter(l => l.Status === 'active').length        + inchargeLab.filter(l => l.Status === 'active').length;
  const underMaintenance = labs.filter(l => l.Status === 'under maintenance').length + inchargeLab.filter(l => l.Status === 'under maintenance').length;

  const fetchLab = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/faculty/getLabs/");
      const data = await res.json();
      if (res.ok) { console.log(data); setLabs(data.labs); }
      else console.error("Failed to fetch lab:", data.error);
    } catch (err) { console.error("Error fetching lab:", err); }
    finally       { setLoading(false); }
  };

  const fetchInchargeLab = async () => {
    try {
      const res  = await fetch("/api/faculty/fetchInchargeLab/");
      const data = await res.json();
      if (res.ok) { console.log(data); setInchargeLab(data.inchargeLabs); }
      else console.error("Failed to fetch lab:", data.error);
    } catch (err) { console.error("Error fetching lab:", err); }
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

    // ── Header ──────────────────────────────────────────────────────
    header: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '1rem' : '0',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      background: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      border: '1px solid rgba(8,131,149,0.1)',
      borderBottom: '3px solid #088395',          // ← teal bottom accent
    },
    headerTitle: {
      fontSize: isMobile ? '22px' : isTablet ? '26px' : '30px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.5px',
    },

    // ── Stat Cards ───────────────────────────────────────────────────
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)',
      gap: isMobile ? '1rem' : '1.25rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    statCard: {
      background: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1.5rem' : '1.75rem',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      border: '1px solid rgba(8,131,149,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    statLabel: {
      fontSize: isMobile ? '13px' : '14px',
      color: '#176B87',
      marginBottom: '10px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    statValue: {
      fontSize: isMobile ? '32px' : isTablet ? '36px' : '40px',
      fontWeight: 800,
      color: '#088395',
      letterSpacing: '-1px',
    },

    // ── Incharge Section ─────────────────────────────────────────────
    cardContainerIncharge: {
      marginTop: isMobile ? '1.5rem' : '2rem',
      padding: isMobile ? '1.25rem' : '1.75rem',
      background: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      border: '1px solid rgba(8,131,149,0.1)',
      borderBottom: '3px solid #088395',
    },
    inchargeHeader: {
      fontSize: isMobile ? '17px' : isTablet ? '20px' : '22px',
      fontWeight: 800,
      color: '#176B87',
      margin: '0 0 1.25rem 0',
      letterSpacing: '-0.3px',
    },

    // ── Lab Cards ────────────────────────────────────────────────────
    cardContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '1rem' : '1.25rem',
    },
    card: {
      background: 'white',
      borderRadius: isMobile ? '12px' : '16px',
      padding: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
      boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(8,131,149,0.1)',
      cursor: 'pointer',
    },
    cardHeader: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
    },
    cardLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '1rem' : '1.25rem',
      flex: '1',
      minWidth: isMobile ? 'auto' : '250px',
    },
    labIcon: {
      width: isMobile ? '48px' : '56px',
      height: isMobile ? '48px' : '56px',
      borderRadius: isMobile ? '10px' : '12px',
      // ← was #B8F3E9 (off-palette) → now full Assetra gradient
      background: 'linear-gradient(135deg, #D1F8EF 0%, #c8f5ec 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#088395',
      flexShrink: 0,
      boxShadow: '0 2px 4px rgba(8,131,149,0.15)',
    },
    cardInfo: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    cardIdRow: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
    },
    cardId: {
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: 700,
      color: '#3674B5',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
    cardName: {
      fontSize: isMobile ? '17px' : '19px',
      fontWeight: 800,
      color: '#176B87',
      margin: 0,
      letterSpacing: '-0.3px',
    },

    // ── Status Badges ────────────────────────────────────────────────
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 12px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    statusActive: {
      background: '#D1F8EF',
      color: '#088395',
      border: '1px solid #088395',
    },
    // ← was orange (#FFE8CC / #E67E22) → now blue-teal Assetra tone
    statusMaintenance: {
      background: 'rgba(54,116,181,0.1)',
      color: '#3674B5',
      border: '1px solid #3674B5',
    },

    // ── Card Right / Details ─────────────────────────────────────────
    cardRight: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
    },
    cardDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      flex: isMobile ? '1' : 'auto',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: isMobile ? '13px' : '14px',
      color: '#176B87',
      gap: '4px',
      fontWeight: '500',
    },
    detailLabel: {
      fontWeight: 700,
      color: '#3674B5',
      marginRight: '6px',
    },
    detailValue: {
      fontWeight: 700,
      color: '#176B87',
    },
    // ← was #86B6F6 (off-palette) → now #a8cdd5 (Assetra soft)
    detailValueUnassigned: {
      fontWeight: 700,
      color: '#a8cdd5',
      fontStyle: 'italic',
    },

    // ── Action Buttons ───────────────────────────────────────────────
    actionButtons: {
      display: 'flex',
      gap: isMobile ? '8px' : '10px',
      alignItems: 'center',
      justifyContent: isMobile ? 'flex-start' : 'center',
    },
    iconButton: {
      width: isMobile ? '38px' : '40px',
      height: isMobile ? '38px' : '40px',
      background: 'transparent',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    viewButton: {
      color: '#3674B5',
      background: 'rgba(54,116,181,0.1)',
      border: '2px solid transparent',
    },
  };

  // ── Shared hover handlers ──────────────────────────────────────────
  const cardHoverIn  = (e) => {
    e.currentTarget.style.transform   = 'translateY(-2px)';
    e.currentTarget.style.boxShadow   = '0 10px 15px -3px rgba(8,131,149,0.15), 0 4px 6px -2px rgba(8,131,149,0.08)';
    e.currentTarget.style.borderColor = 'rgba(8,131,149,0.3)';
  };
  const cardHoverOut = (e) => {
    e.currentTarget.style.transform   = 'translateY(0)';
    e.currentTarget.style.boxShadow   = '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)';
    e.currentTarget.style.borderColor = 'rgba(8,131,149,0.1)';
  };
  const statHoverIn  = (e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8,131,149,0.2), 0 4px 6px -2px rgba(8,131,149,0.1)';
  };
  const statHoverOut = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)';
  };
  const btnHoverIn  = (e) => { e.currentTarget.style.borderColor = '#3674B5'; e.currentTarget.style.transform = 'scale(1.08)'; };
  const btnHoverOut = (e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; };

  // ── Lab Card (reusable) ────────────────────────────────────────────
  const LabCard = ({ lab, techName }) => (
    <div style={styles.card} onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}>
      <div style={styles.cardHeader}>

        {/* Left */}
        <div style={styles.cardLeft}>
          <div style={styles.labIcon}>
            <svg width={isMobile ? "22" : "26"} height={isMobile ? "22" : "26"} viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>
          <div style={styles.cardInfo}>
            <div style={styles.cardIdRow}>
              <span style={styles.cardId}>#{lab.Lab_Name}</span>
              <span style={{ ...styles.statusBadge, ...(lab.Status === 'Active' ? styles.statusActive : styles.statusMaintenance) }}>
                {lab.Status}
              </span>
            </div>
            <h3 style={styles.cardName}>{lab.Lab_ID}</h3>
          </div>
        </div>

        {/* Right */}
        <div style={styles.cardRight}>
          <div style={styles.cardDetails}>
            {/* Lab Room */}
            <div style={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '6px', color: '#3674B5' }}>
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
              </svg>
              <span style={styles.detailLabel}>Lab Room:</span>
              <span style={styles.detailValue}>{lab.Lab_Room}</span>
            </div>
            {/* Capacity */}
            <div style={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '6px', color: '#3674B5' }}>
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span style={styles.detailLabel}>Capacity:</span>
              <span style={styles.detailValue}>{lab.Total_Capacity}</span>
            </div>
            {/* Technician */}
            <div style={styles.detailItem}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '6px', color: '#3674B5' }}>
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              <span style={styles.detailLabel}>Technician:</span>
              {techName
                ? <span style={styles.detailValue}>{techName}</span>
                : <span style={styles.detailValueUnassigned}>Not Assigned</span>
              }
            </div>
          </div>

          {/* Arrow button */}
          <div style={styles.actionButtons}>
            <button
              style={{ ...styles.iconButton, ...styles.viewButton }}
              onClick={() => { window.location.href = `/facultyPanel/allLabs/lab/${lab._id}`; }}
              onMouseEnter={btnHoverIn}
              onMouseLeave={btnHoverOut}
            >
              <svg width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  const emptyState = (msg) => (
    <div style={{ textAlign: 'center', padding: isMobile ? '2.5rem 1.25rem' : '3.5rem 2rem', background: '#EBF4F6', borderRadius: '16px', color: '#176B87', border: '1px solid rgba(8,131,149,0.1)' }}>
      <p style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '600', margin: 0 }}>{msg}</p>
    </div>
  );

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

        {/* ── Header ── */}
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>My Labs</h1>
        </header>

        {/* ── Stats ── */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Labs',        value: totalLabs },
            { label: 'Active Labs',       value: activeLabs },
            { label: 'Under Maintenance', value: underMaintenance },
          ].map(s => (
            <div key={s.label} style={styles.statCard} onMouseEnter={statHoverIn} onMouseLeave={statHoverOut}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── My Labs list ── */}
        {labs.length > 0 ? (
          <div style={styles.cardContainer}>
            {labs.map(lab => (
              <LabCard
                key={lab._id}
                lab={lab}
                techName={
                  lab?.LabTechnician?.length > 0 && lab.LabTechnician
                    ? lab.LabTechnician[0]?.UserDetails?.Name
                    : null
                }
              />
            ))}
          </div>
        ) : (
          emptyState('No labs available.')
        )}

        {/* ── Lab Incharge section ── */}
        <div style={styles.cardContainerIncharge}>
          <h2 style={styles.inchargeHeader}>Lab Incharge</h2>
          {inchargeLab.length > 0 ? (
            <div style={styles.cardContainer}>
              {inchargeLab.map(lab => (
                <LabCard
                  key={lab._id}
                  lab={lab}
                  techName={
                    lab?.LabTechnician?.length > 0 && lab.LabTechnician
                      ? lab.LabTechnician[0]?.UserDetails?.Name
                      : null
                  }
                />
              ))}
            </div>
          ) : (
            emptyState('There are no labs in which you are the Lab Incharge.')
          )}
        </div>

      </main>
    </div>
  );
}