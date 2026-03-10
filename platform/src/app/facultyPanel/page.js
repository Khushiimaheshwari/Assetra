"use client";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalAssets: 0, 
    totalLabs: 0,
    totalTechnicians: 0,
    totalFaculty: 0,
  });
  const [assetCategoryData, setAssetCategoryData] = useState([]);
  const [labDistributionData, setLabDistributionData] = useState([]);
  const [facultyDistributionData, setFacultyDistributionData] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchMetrics()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  async function fetchMetrics() {
    try {
      const res = await fetch("/api/faculty/getMetricsCount"); 
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
        setAssetCategoryData(data.assetCategoryData);
        setLabDistributionData(data.labDistributionData);
        console.log(data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  }

  async function fetchFaculty() {
    try {
      const res = await fetch("/api/faculty/getFacultyDistribution"); 
      const data = await res.json();
      if (data.facultyDistributionData) {
        setFacultyDistributionData(data.facultyDistributionData);
        console.log(data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  }

  useEffect(() => {
    fetchMetrics();
    fetchFaculty();
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text 
        x={x} y={y} fill="#000000" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // ── Only styles changed below — all content/logic is identical to original ──

  const containerStyle = {
    width: isMobile ? '100%' : 'calc(100% - 255px)',
    minHeight: '100vh',
    backgroundColor: '#EBF4F6',                          // ← was #f9fafb
    padding: isMobile ? '1rem' : '2rem',
    marginLeft: isMobile ? '0' : '255px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    overflowX: 'hidden',
  };

  const loaderContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#EBF4F6',                          // ← was #f9fafb
    flexDirection: 'column',
    gap: '1rem',
  };

  const loaderTextStyle = {
    color: '#176B87',                                     // ← was #6b7280
    fontSize: '16px',
    fontWeight: '600',                                    // ← was 500
  };

  const headerStyle = { 
    marginBottom: '2rem',                                 // ← was 1.5rem
    paddingBottom: '1rem',
    borderBottom: '3px solid #088395',                   // ← added
  };

  const titleStyle = { 
    fontSize: isMobile ? '1.75rem' : '2.25rem',          // ← was 1.5/2rem
    fontWeight: '800',                                    // ← was bold
    color: '#176B87',                                     // ← was #1f2937
    margin: 0,
    letterSpacing: '-0.5px',                             // ← added
  };

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
    gap: '1.25rem',                                       // ← was 1rem
    marginBottom: '2rem',                                 // ← was 1.5rem
  };

  const metricCardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',                                 // ← was 12px
    padding: isMobile ? '1.25rem' : '1.5rem',            // ← was 1/1.25rem
    boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)', // ← teal shadow
    border: '1px solid rgba(8,131,149,0.1)',             // ← added teal border
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const metricHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',                                 // ← was 0.75rem
  };

  const metricTitleStyle = { 
    color: '#176B87',                                     // ← was #6b7280
    fontSize: isMobile ? '0.8rem' : '0.9rem',            // ← was 0.75/0.875rem
    fontWeight: '600',
    textTransform: 'uppercase',                          // ← added
    letterSpacing: '0.5px',                             // ← added
  };
  
  const metricValueStyle = { 
    fontSize: isMobile ? '1.75rem' : '2.25rem',          // ← was 1.5/1.875rem
    fontWeight: '800',                                    // ← was bold
    color: '#088395',                                     // ← was #1f2937
    marginBottom: '0.5rem',
    letterSpacing: '-1px',                               // ← added
  };

  const chartsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',                                       // ← was 1rem
    marginBottom: '2rem',                                 // ← was 1.5rem
  };

  const chartCardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',                                 // ← was 12px
    padding: isMobile ? '1.25rem' : '1.5rem',            // ← was 1/1.25rem
    boxShadow: '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)', // ← teal shadow
    border: '1px solid rgba(8,131,149,0.1)',             // ← added teal border
    minHeight: isMobile ? '340px' : '420px',             // ← was 320/400px
  };

  const chartHeaderStyle = { 
    marginBottom: '1.25rem',                              // ← was 1rem
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #D1F8EF',                   // ← added
  };

  const chartTitleStyle = { 
    fontSize: isMobile ? '1.1rem' : '1.25rem',           // ← was 1/1.125rem
    fontWeight: '700',
    color: '#176B87',                                     // ← was #1f2937
    marginBottom: '0.35rem',
  };

  const chartSubtitleStyle = { 
    fontSize: isMobile ? '0.8rem' : '0.9rem',            // ← was 0.75/0.875rem
    color: '#3674B5',                                     // ← was #6b7280
    fontWeight: '500',                                   // ← added
  };

  const tooltipStyle = {
    backgroundColor: '#fff', 
    border: '2px solid #088395',                         // ← was 1px gray
    borderRadius: '12px',                                // ← was 8px
    boxShadow: '0 4px 6px -1px rgba(8,131,149,0.2)', 
    fontSize: '12px',
    fontWeight: '600',                                   // ← added
    color: '#176B87',                                    // ← added
  };

  const iconSize = isMobile ? '40px' : '48px';

  // Icon bg/color pairs — same teal palette as admin dashboard
  const metricColors = [
    { bg: '#D1F8EF',                    icon: '#088395' },
    { bg: 'rgba(134,182,246,0.2)',       icon: '#3674B5' },
    { bg: 'rgba(8,131,149,0.15)',        icon: '#176B87' },
    { bg: 'rgba(54,116,181,0.15)',       icon: '#086788' },
    { bg: '#D1F8EF',                    icon: '#088395' },
    { bg: 'rgba(134,182,246,0.2)',       icon: '#3674B5' },
  ];

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loaderContainerStyle}>
          <Loader2 size={48} className="animate-spin" color="#088395" />
          <p style={loaderTextStyle}>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Overview</h1>
      </header>

      {/* ── Metric Cards — same 2 cards as original ── */}
      <div style={metricsGridStyle}>

        <div 
          style={metricCardStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8,131,149,0.2), 0 4px 6px -2px rgba(8,131,149,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)'; }}
        >
          <div style={metricHeaderStyle}>
            <div style={metricTitleStyle}>Total Assets</div>
            <div style={{ width: iconSize, height: iconSize, borderRadius: '12px', backgroundColor: metricColors[0].bg, color: metricColors[0].icon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div style={metricValueStyle}>{metrics.totalAssets.toLocaleString()}</div>
        </div>

        <div 
          style={metricCardStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8,131,149,0.2), 0 4px 6px -2px rgba(8,131,149,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8,131,149,0.1), 0 2px 4px -1px rgba(8,131,149,0.06)'; }}
        >
          <div style={metricHeaderStyle}>
            <div style={metricTitleStyle}>Total Labs</div>
            <div style={{ width: iconSize, height: iconSize, borderRadius: '12px', backgroundColor: metricColors[1].bg, color: metricColors[1].icon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-2h-1a1 1 0 110-2h1V9h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div style={metricValueStyle}>{metrics.totalLabs}</div>
        </div>

      </div>

      {/* ── Charts — same 3 pie charts as original ── */}
      <div style={chartsGridStyle}>

        <div style={chartCardStyle}>
          <div style={chartHeaderStyle}>
            <div style={chartTitleStyle}>Asset Categories</div>
            <div style={chartSubtitleStyle}>Technical vs Non-Technical Distribution</div>
          </div>
          <div style={{ width: '100%', height: isMobile ? '220px' : '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetCategoryData} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={isMobile ? 70 : 90} innerRadius={isMobile ? 40 : 55} dataKey="value" animationBegin={0} animationDuration={1500}>
                  {assetCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
            {assetCategoryData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                <span style={{ fontSize: isMobile ? '11px' : '13px', color: '#176B87', fontWeight: '600' }}>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div style={chartCardStyle}>
          <div style={chartHeaderStyle}>
            <div style={chartTitleStyle}>Lab Distribution</div>
            <div style={chartSubtitleStyle}>By Department Categories</div>
          </div>
          <div style={{ width: '100%', height: isMobile ? '220px' : '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={labDistributionData} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={isMobile ? 70 : 90} innerRadius={isMobile ? 40 : 55} dataKey="value" animationBegin={0} animationDuration={1500}>
                  {labDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            {labDistributionData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#176B87', fontWeight: '600' }}>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={chartsGridStyle}>

        <div style={chartCardStyle}>
          <div style={chartHeaderStyle}>
            <div style={chartTitleStyle}>Faculty Distribution</div>
            <div style={chartSubtitleStyle}>By Designation Type</div>
          </div>
          <div style={{ width: '100%', height: isMobile ? '220px' : '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={facultyDistributionData} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={isMobile ? 70 : 90} innerRadius={isMobile ? 40 : 55} dataKey="value" animationBegin={0} animationDuration={1500}>
                  {facultyDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
            {facultyDistributionData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                <span style={{ fontSize: isMobile ? '11px' : '13px', color: '#176B87', fontWeight: '600' }}>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}