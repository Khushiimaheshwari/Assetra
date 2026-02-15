"use client";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell,  ResponsiveContainer, Tooltip } from 'recharts';

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
  const [assetBreakdown, setAssetBreakdown] = useState([]);

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
      const res = await fetch("/api/admin/getMetricsCount"); 
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
        setAssetCategoryData(data.assetCategoryData);
        setLabDistributionData(data.labDistributionData);
        setFacultyDistributionData(data.facultyDistributionData);
        console.log(data);
      }
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  }

  async function fetchAssetBreakdown() {
    try {
      const res = await fetch("/api/admin/getAssetBreakdown");

      const data = await res.json();

      if (data.assetBreakdown) {
        console.log(data);
        setAssetBreakdown(data.assetBreakdown)
      };
      
    } catch (err) {
      console.error("Failed to fetch asset breakdown:", err);
    }
  }

  useEffect(() => {
    fetchMetrics();
    fetchAssetBreakdown();
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
        x={x} 
        y={y} 
        fill="#000000" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const styles = {
    container: {
      width: isMobile ? '100%' : 'calc(100% - 255px)',
      minHeight: '100vh',
      backgroundColor: '#EBF4F6',
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
      width: '100%',
      backgroundColor: '#EBF4F6',
      flexDirection: 'column',
      gap: '1rem',
    },
    loaderText: {
      color: '#176B87',
      fontSize: '16px',
      fontWeight: '600',
    }
  }

  const containerStyle = {
    width: isMobile ? '100%' : 'calc(100% - 255px)',
    minHeight: '100vh',
    backgroundColor: '#EBF4F6',
    padding: isMobile ? '1rem' : '2rem',
    marginLeft: isMobile ? '0' : '255px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  };

  const headerStyle = { 
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '3px solid #088395'
  };
  
  const titleStyle = { 
    fontSize: isMobile ? '1.75rem' : '2.25rem', 
    fontWeight: '800', 
    color: '#176B87', 
    margin: 0,
    letterSpacing: '-0.5px'
  };

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
    gap: '1.25rem',
    marginBottom: '2rem'
  };

  const metricCardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '1.25rem' : '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
    border: '1px solid rgba(8, 131, 149, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const metricCardHoverStyle = {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 15px -3px rgba(8, 131, 149, 0.2), 0 4px 6px -2px rgba(8, 131, 149, 0.1)'
  };

  const metricHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  };

  const metricTitleStyle = { 
    color: '#176B87', 
    fontSize: isMobile ? '0.8rem' : '0.9rem', 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };
  
  const metricValueStyle = { 
    fontSize: isMobile ? '1.75rem' : '2.25rem', 
    fontWeight: '800', 
    color: '#088395', 
    marginBottom: '0.5rem',
    letterSpacing: '-1px'
  };

  const chartsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem'
  };

  const chartCardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '1.25rem' : '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
    border: '1px solid rgba(8, 131, 149, 0.1)',
    minHeight: isMobile ? '340px' : '420px'
  };

  const chartHeaderStyle = { 
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #D1F8EF'
  };
  
  const chartTitleStyle = { 
    fontSize: isMobile ? '1.1rem' : '1.25rem', 
    fontWeight: '700', 
    color: '#176B87', 
    marginBottom: '0.35rem' 
  };
  
  const chartSubtitleStyle = { 
    fontSize: isMobile ? '0.8rem' : '0.9rem', 
    color: '#3674B5',
    fontWeight: '500'
  };

  const detailsSectionStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '1.25rem' : '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)',
    border: '1px solid rgba(8, 131, 149, 0.1)',
    marginBottom: '2rem'
  };

  const tableStyle = { 
    width: '100%', 
    borderCollapse: 'collapse', 
    fontSize: isMobile ? '0.8rem' : '0.9rem' 
  };
  
  const theadStyle = { 
    backgroundColor: '#D1F8EF',
    borderRadius: '8px'
  };
  
  const thStyle = { 
    padding: isMobile ? '0.75rem' : '1rem 1.25rem', 
    textAlign: 'left', 
    fontWeight: '700', 
    color: '#176B87', 
    borderBottom: '2px solid #088395',
    textTransform: 'uppercase',
    fontSize: isMobile ? '0.75rem' : '0.85rem',
    letterSpacing: '0.5px'
  };
  
  const tdStyle = { 
    padding: isMobile ? '0.75rem' : '1rem 1.25rem', 
    color: '#176B87', 
    borderBottom: '1px solid #D1F8EF',
    fontWeight: '500'
  };

  const iconSize = isMobile ? '40px' : '48px';

  // Color configurations for metric cards
  const metricColors = [
    { bg: '#D1F8EF', icon: '#088395' }, // Mint bg, Primary icon
    { bg: 'rgba(134, 182, 246, 0.2)', icon: '#3674B5' }, // Sky blue bg, Ocean blue icon
    { bg: 'rgba(8, 131, 149, 0.15)', icon: '#176B87' }, // Primary tint bg, Dark teal icon
    { bg: 'rgba(54, 116, 181, 0.15)', icon: '#086788' }, // Ocean blue tint bg, Custom dark
    { bg: '#D1F8EF', icon: '#088395' }, // Mint bg, Primary icon
    { bg: 'rgba(134, 182, 246, 0.2)', icon: '#3674B5' }, // Sky blue bg, Ocean blue icon
  ];

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <Loader2 size={48} className="animate-spin" color="#088395" />
          <p style={styles.loaderText}>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Dashboard Overview</h1>
      </header>

      <div style={metricsGridStyle}>
        <div 
          style={metricCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8, 131, 149, 0.2), 0 4px 6px -2px rgba(8, 131, 149, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)';
          }}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8, 131, 149, 0.2), 0 4px 6px -2px rgba(8, 131, 149, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)';
          }}
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

        <div 
          style={metricCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8, 131, 149, 0.2), 0 4px 6px -2px rgba(8, 131, 149, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)';
          }}
        >
          <div style={metricHeaderStyle}>
            <div style={metricTitleStyle}>Lab Technicians</div>
            <div style={{ width: iconSize, height: iconSize, borderRadius: '12px', backgroundColor: metricColors[4].bg, color: metricColors[4].icon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <div style={metricValueStyle}>{metrics.totalTechnicians}</div>
        </div>

        <div 
          style={metricCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(8, 131, 149, 0.2), 0 4px 6px -2px rgba(8, 131, 149, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(8, 131, 149, 0.1), 0 2px 4px -1px rgba(8, 131, 149, 0.06)';
          }}
        >
          <div style={metricHeaderStyle}>
            <div style={metricTitleStyle}>Total Faculty</div>
            <div style={{ width: iconSize, height: iconSize, borderRadius: '12px', backgroundColor: metricColors[5].bg, color: metricColors[5].icon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
          </div>
          <div style={metricValueStyle}>{metrics.totalFaculty}</div>
        </div>
      </div>

      <div style={chartsGridStyle}>
        <div style={chartCardStyle}>
          <div style={chartHeaderStyle}>
            <div style={chartTitleStyle}>Asset Categories</div>
            <div style={chartSubtitleStyle}>Technical vs Non-Technical Distribution</div>
          </div>
          <div style={{ width: '100%', height: isMobile ? '220px' : '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={assetCategoryData} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={renderCustomLabel} 
                  outerRadius={isMobile ? 70 : 90} 
                  innerRadius={isMobile ? 40 : 55} 
                  dataKey="value" 
                  animationBegin={0} 
                  animationDuration={1500}
                >
                  {assetCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #088395', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.2)', 
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#176B87'
                  }} 
                />
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
                <Pie 
                  data={labDistributionData} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={renderCustomLabel} 
                  outerRadius={isMobile ? 70 : 90} 
                  innerRadius={isMobile ? 40 : 55} 
                  dataKey="value" 
                  animationBegin={0} 
                  animationDuration={1500}
                >
                  {labDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #088395', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.2)', 
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#176B87'
                  }} 
                />
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
                <Pie 
                  data={facultyDistributionData} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={renderCustomLabel} 
                  outerRadius={isMobile ? 70 : 90} 
                  innerRadius={isMobile ? 40 : 55} 
                  dataKey="value" 
                  animationBegin={0} 
                  animationDuration={1500}
                >
                  {facultyDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #088395', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px -1px rgba(8, 131, 149, 0.2)', 
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#176B87'
                  }} 
                />
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

      <div style={detailsSectionStyle}>
        <div style={chartHeaderStyle}>
          <div style={chartTitleStyle}>Detailed Asset Breakdown</div>
          <div style={chartSubtitleStyle}>Assets by category and brand</div>
        </div>
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>HP</th>
                <th style={thStyle}>Lenovo</th>
                <th style={thStyle}>Mac</th>
              </tr>
            </thead>
            <tbody>
              {assetBreakdown.map((item, index) => (
                <tr 
                  key={item.category} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D1F8EF'} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#EBF4F6'}
                >
                  <td style={{ ...tdStyle, fontWeight: '700', color: '#176B87' }}>{item.category}</td>
                  <td style={{ ...tdStyle, fontWeight: '700', color: '#088395', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>{item.total}</td>
                  <td style={tdStyle}>{item.hp}</td>
                  <td style={tdStyle}>{item.lenovo}</td>
                  <td style={tdStyle}>{item.imac}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}