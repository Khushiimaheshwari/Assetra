"use client";

import React from "react";
import { Loader2, ArrowLeft, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LabDetail({ params }) {
  const { id: labId } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [labData, setLabData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchLabDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/getLabDetail/${labId}`);
        const data = await res.json();
        if (data.labData) {
          console.log(data);
          setLabData(data.labData);
          setAssets(data.assets);
        }
      } catch (error) {
        console.error("Error loading lab detail:", error);
      } finally {
        setLoading(false);
      }
    };
    if (labId) {
      fetchLabDetail();
    }
  }, [labId]);

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
          <p style={{ color: '#176B87', fontSize: '16px', fontWeight: '500' }}>Loading lab details...</p>
        </div>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    if (status === 'Yes') return { backgroundColor: '#D1F8EF', color: '#065f46' };
    if (status === 'No') return { backgroundColor: '#fee2e2', color: '#991b1b' };
    return { backgroundColor: '#fef3c7', color: '#92400e' };
  };

  const badgeBase = {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: isMobile ? '0.65rem' : '0.75rem',
    fontWeight: '600',
    display: 'inline-block',
  };

  const th = {
    padding: isMobile ? '0.75rem 0.5rem' : '0.875rem 1rem',
    textAlign: 'left',
    fontWeight: '700',
    color: '#176B87',
    borderBottom: '2px solid #088395',
    whiteSpace: 'nowrap',
    fontSize: isMobile ? '0.7rem' : '0.8rem',
    letterSpacing: '0.03em',
    backgroundColor: '#EBF4F6',
  };

  const td = {
    padding: isMobile ? '0.65rem 0.5rem' : '0.875rem 1rem',
    color: '#374151',
    borderBottom: '1px solid #EBF4F6',
    fontSize: isMobile ? '0.7rem' : '0.875rem',
    fontWeight: '500',
  };

  const tdBold = {
    ...td,
    fontWeight: '700',
    color: '#176B87',
  };

  return (
    <div style={containerStyle}>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#EBF4F6';
          e.currentTarget.style.borderColor = '#088395';
          e.currentTarget.style.color = '#088395';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.color = '#374151';
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          color: '#374151',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '1rem',
          width: 'fit-content',
          transition: 'all 0.2s',
          boxShadow: '0 1px 3px rgba(8,131,149,0.06)',
        }}
      >
        <ArrowLeft size={16} />
        Back to Labs
      </button>

      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: isMobile ? '1.25rem' : '1.75rem 2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(8,131,149,0.08)',
        borderBottom: '3px solid #088395',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '12px',
          backgroundColor: '#EBF4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Monitor size={24} color="#088395" />
        </div>
        <div>
          <h1 style={{
            fontSize: isMobile ? '1.5rem' : '1.875rem',
            fontWeight: '800',
            color: '#176B87',
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            {labData.Lab_ID}
          </h1>
          <p style={{ color: '#088395', marginTop: '0.2rem', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
            Complete asset inventory and status
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: isMobile ? '1rem' : '1.5rem',
        boxShadow: '0 2px 8px rgba(8,131,149,0.07)',
        marginBottom: '1.5rem',
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: '700', color: '#176B87', margin: 0 }}>
            Asset Details
          </p>
          <p style={{ fontSize: '0.875rem', color: '#088395', marginTop: '0.2rem', fontWeight: '500' }}>
            All assets with their current status
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
            <thead>
              <tr>
                <th style={th}>PC No.</th>
                <th style={th}>Monitor</th>
                <th style={th}>Status</th>
                <th style={th}>Keyboard</th>
                <th style={th}>Status</th>
                <th style={th}>Mouse</th>
                <th style={th}>Status</th>
                <th style={th}>UPS</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr
                  key={index}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EBF4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={tdBold}>{asset.pcName}</td>
                  <td style={td}>{asset.monitor?.name || "-"}</td>
                  <td style={td}>
                    <span style={{ ...badgeBase, ...getStatusStyle(asset.monitor?.status) }}>
                      {asset.monitor?.status || "-"}
                    </span>
                  </td>
                  <td style={td}>{asset.keyboard?.name || "-"}</td>
                  <td style={td}>
                    <span style={{ ...badgeBase, ...getStatusStyle(asset.keyboard?.status) }}>
                      {asset.keyboard?.status || "-"}
                    </span>
                  </td>
                  <td style={td}>{asset.mouse?.name || "-"}</td>
                  <td style={td}>
                    <span style={{ ...badgeBase, ...getStatusStyle(asset.mouse?.status) }}>
                      {asset.mouse?.status || "-"}
                    </span>
                  </td>
                  <td style={td}>{asset.ups?.name || "-"}</td>
                  <td style={td}>
                    <span style={{ ...badgeBase, ...getStatusStyle(asset.ups?.status) }}>
                      {asset.ups?.status || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}