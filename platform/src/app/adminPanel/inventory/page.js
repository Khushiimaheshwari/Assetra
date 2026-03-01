"use client";
import { Loader2, FlaskConical, Monitor, CheckCircle2, XCircle, Wrench, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";

export default function LabOverview() {
  const [loading, setLoading] = useState(true);
  const [labDetails, setLabDetails] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchLabData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/labAssetSummary");
        const data = await res.json();
        console.log(data);
        if (data.summary) {
          setLabDetails(data.summary);
        }
      } catch (error) {
        console.error("Error loading lab data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabData();
  }, []);

  // Derived summary stats
  const totalAssets = labDetails.reduce((s, l) => s + (l.totalAssets || 0), 0);
  const totalActive = labDetails.reduce((s, l) => s + (l.activeAssets || 0), 0);
  const totalMaintenance = labDetails.reduce((s, l) => s + (l.underMaintenance || 0), 0);
  const totalNonActive = labDetails.reduce((s, l) => s + (l.nonActiveAssets || 0), 0);

  const containerStyle = {
    width: isMobile ? '100%' : 'calc(100% - 255px)',
    minHeight: '100vh',
    backgroundColor: '#EBF4F6',
    padding: isMobile ? '1rem' : '2rem',
    boxSizing: 'border-box',
    marginLeft: isMobile ? '0' : '255px',
    overflowX: 'hidden',
    transition: 'all 0.3s ease',
    fontFamily: "'Segoe UI', sans-serif",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: '100vh', flexDirection: 'column', gap: '1rem'
        }}>
          <Loader2 size={48} className="animate-spin" color="#088395" />
          <p style={{ color: '#176B87', fontSize: '16px', fontWeight: '500' }}>Loading lab data...</p>
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
        borderBottom: '3px solid #088395',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '1.5rem' : '1.875rem',
            fontWeight: '800',
            color: '#176B87',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            Lab Inventory
          </h1>
          <p style={{ color: '#088395', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
            Asset distribution across all laboratory facilities
          </p>
        </div>
        <div style={{
          backgroundColor: '#EBF4F6',
          borderRadius: '10px',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#176B87',
          fontWeight: '600',
          fontSize: '0.875rem',
        }}>
          <LayoutGrid size={16} color="#088395" />
          {labDetails.length} Labs Total
        </div>
      </div>

      {/* ── Table Section ── */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: isMobile ? '1rem' : '1.5rem',
        boxShadow: '0 2px 8px rgba(8,131,149,0.07)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: '700', color: '#176B87', margin: 0 }}>
            Laboratory Details
          </p>
          <p style={{ fontSize: '0.875rem', color: '#088395', marginTop: '0.2rem', fontWeight: '500' }}>
            Click a row to view detailed lab assets
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#EBF4F6' }}>
                {['Lab ID', 'PC Count', 'Total Assets', 'Active Assets', 'Non Active Assets', 'Under Maintenance'].map((h, i) => (
                  <th key={i} style={{
                    padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem',
                    textAlign: 'left',
                    fontWeight: '700',
                    color: '#176B87',
                    borderBottom: '2px solid #088395',
                    whiteSpace: 'nowrap',
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    letterSpacing: '0.03em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labDetails.map((lab) => (
                <tr
                  key={lab.labId}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => { window.location.href = `/adminPanel/inventory/labDetails/${lab.id}`; }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBF4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Lab ID */}
                  <td style={{
                    padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem',
                    borderBottom: '1px solid #EBF4F6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '8px',
                        backgroundColor: '#EBF4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Monitor size={16} color="#088395" />
                      </div>
                      <span style={{ fontWeight: '700', color: '#176B87' }}>{lab.labId}</span>
                    </div>
                  </td>

                  {/* PC Count */}
                  <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem', color: '#374151', borderBottom: '1px solid #EBF4F6', fontWeight: '500' }}>
                    {lab.pcCount}
                  </td>

                  {/* Total Assets */}
                  <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem', borderBottom: '1px solid #EBF4F6' }}>
                    <span style={{
                      fontWeight: '700', color: '#088395',
                      backgroundColor: '#EBF4F6',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                    }}>
                      {lab.totalAssets}
                    </span>
                  </td>

                  {/* Active */}
                  <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem', borderBottom: '1px solid #EBF4F6' }}>
                    <span style={{
                      backgroundColor: '#D1F8EF',
                      color: '#065f46',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      fontWeight: '600',
                      display: 'inline-block',
                    }}>
                      {lab.activeAssets}
                    </span>
                  </td>

                  {/* Non Active */}
                  <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem', borderBottom: '1px solid #EBF4F6' }}>
                    <span style={{
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      fontWeight: '600',
                      display: 'inline-block',
                    }}>
                      {lab.nonActiveAssets}
                    </span>
                  </td>

                  {/* Under Maintenance */}
                  <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem', borderBottom: '1px solid #EBF4F6' }}>
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      fontWeight: '600',
                      display: 'inline-block',
                    }}>
                      {lab.underMaintenance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {labDetails.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#088395' }}>
              <FlaskConical size={40} color="#86B6F6" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: '600', color: '#176B87' }}>No lab data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}