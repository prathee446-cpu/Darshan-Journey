import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, IndianRupee, BookOpen, Calendar, 
  Download, Filter, Sparkles, ShieldCheck, PieChart, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuthHeaders } from '../utils/auth';
import { downloadCSV } from '../utils/csvExport';

export default function ReportsPage() {
  const [period, setPeriod] = useState('30d');
  const [reportData, setReportData] = useState({
    totalBookings: 856,
    grossRevenue: '₹4,82,450',
    averageOrderValue: '₹563',
    completionRate: '94.2%',
    categoryStats: [
      { category: 'Pooja & Rituals', count: 342, percentage: '40%', revenue: '₹2,14,500' },
      { category: 'Temple Prasadam', count: 215, percentage: '25%', revenue: '₹98,400' },
      { category: 'Spiritual Accessories', count: 120, percentage: '14%', revenue: '₹68,200' },
      { category: 'Brass Lamps & Idols', count: 95, percentage: '11%', revenue: '₹55,350' },
      { category: 'Devotional Attire', count: 84, percentage: '10%', revenue: '₹46,000' }
    ],
    topTemples: [
      { name: 'Meenakshi Sundareswarar Temple', bookings: 284, revenue: '₹1,62,000' },
      { name: 'Brihadeeswarar Temple', bookings: 210, revenue: '₹1,24,500' },
      { name: 'Kapaleeshwarar Temple', bookings: 165, revenue: '₹89,000' },
      { name: 'Ramanathaswamy Temple', bookings: 112, revenue: '₹62,450' },
      { name: 'Palani Murugan Temple', bookings: 85, revenue: '₹44,500' }
    ]
  });

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/reports?period=${period}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        setReportData(json);
      }
    } catch (err) {
      console.warn('Failed to fetch reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleExportCSV = () => {
    const csvRows = [
      ['Category', 'Bookings Count', 'Share', 'Revenue Generated'],
      ...reportData.categoryStats.map(c => [c.category, c.count, c.percentage, c.revenue]),
      [],
      ['Temple Name', 'Total Bookings', 'Revenue'],
      ...reportData.topTemples.map(t => [t.name, t.bookings, t.revenue])
    ];

    downloadCSV(`Darshan_Journey_Report_${period}.csv`, csvRows);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', marginBottom: '0.2rem' }}>
            Spiritual Insights & Analytics Reports
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            Deep-dive operational metrics, revenue distributions, devotional service performance, and shrine trends.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Period Filter */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(18, 9, 7, 0.8)', border: '1px solid rgba(214, 181, 109, 0.25)', borderRadius: '8px', padding: '0.2rem' }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '6m', label: '6 Months' },
              { id: '1y', label: '1 Year' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: period === tab.id ? 'var(--admin-gold)' : 'transparent',
                  color: period === tab.id ? '#241411' : 'var(--admin-text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: period === tab.id ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Gross Divine Revenue', value: reportData.grossRevenue || '₹4,82,450', icon: IndianRupee, color: 'var(--admin-gold)' },
          { label: 'Total Reservations', value: reportData.totalBookings || '856', icon: BookOpen, color: 'var(--admin-success)' },
          { label: 'Avg Offering Value', value: reportData.averageOrderValue || '₹563', icon: TrendingUp, color: 'var(--admin-gold-light)' },
          { label: 'Seva Fulfillment Rate', value: reportData.completionRate || '94.2%', icon: ShieldCheck, color: 'var(--admin-success)' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glassmorphism"
              style={{
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(214, 181, 109, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div className="flex-center" style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(214, 181, 109, 0.1)', color: kpi.color, border: '1px solid rgba(214, 181, 109, 0.2)' }}>
                <Icon size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', display: 'block' }}>{kpi.label}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FFFDF9' }}>{kpi.value}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Analytics Charts & Category Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Service Category Performance */}
        <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
          <h3 className="serif-title" style={{ fontSize: '1.1rem', color: '#FFFDF9', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={17} style={{ color: 'var(--admin-gold)' }} />
            Category Distribution & Revenue
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reportData.categoryStats.map(cat => (
              <div key={cat.category}>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#FFFDF9', fontWeight: '500' }}>{cat.category}</span>
                  <span style={{ color: 'var(--admin-gold)', fontWeight: 'bold' }}>{cat.revenue} ({cat.percentage})</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(18, 9, 7, 0.6)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: cat.percentage }}
                    transition={{ duration: 0.8 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, var(--admin-primary-brown), var(--admin-gold))', borderRadius: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Temples Leaderboard */}
        <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
          <h3 className="serif-title" style={{ fontSize: '1.1rem', color: '#FFFDF9', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={17} style={{ color: 'var(--admin-gold)' }} />
            Top Temple Sanctuaries (By Volume)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {reportData.topTemples.map((temple, idx) => (
              <div
                key={temple.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(18, 9, 7, 0.4)',
                  border: '1px solid rgba(214, 181, 109, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--admin-gold)', width: '20px' }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <span style={{ color: '#FFFDF9', fontSize: '0.88rem', fontWeight: '500', display: 'block' }}>{temple.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{temple.bookings} bookings</span>
                  </div>
                </div>

                <span style={{ fontWeight: 'bold', color: 'var(--admin-gold)', fontSize: '0.9rem' }}>
                  {temple.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
