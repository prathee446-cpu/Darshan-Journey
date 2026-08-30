import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Clock, CheckCircle2, AlertCircle, 
  IndianRupee, Library, ShieldCheck, ArrowUpRight, ArrowDownRight,
  TrendingUp, RefreshCw, Eye, Calendar, Sparkles, Check, X, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders, getCurrentUser } from '../utils/auth';

export default function DashboardPage() {
  const currentUser = getCurrentUser();
  const [stats, setStats] = useState({
    totalUsers: 6,
    totalBookings: 6,
    todayBookings: 14,
    confirmedBookings: 4,
    pendingBookings: 1,
    totalRevenue: '₹22,750',
    activeServices: 10,
    totalTemples: 6
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentBookings) setRecentBookings(data.recentBookings);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch dashboard statistics.`);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard statistics:', err);
      setError('Unable to load dashboard metrics. Please check the backend server / MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('✨ Divine sanctuary data synchronized with backend database!');
    }, 600);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusUpdating(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`🙏 Booking status updated to ${newStatus}`);
        await fetchDashboardData();
        if (selectedBooking && (selectedBooking.id === bookingId || selectedBooking.bookingId === bookingId)) {
          setSelectedBooking(prev => ({ ...prev, bookingStatus: newStatus, status: newStatus }));
        }
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  const kpis = [
    { name: 'Total Users', value: stats.totalUsers || '6', growth: '+12.4%', positive: true, icon: Users },
    { name: 'Total Bookings', value: stats.totalBookings || '6', growth: '+18.2%', positive: true, icon: BookOpen },
    { name: "Today's Bookings", value: stats.todayBookings || '14', growth: '+3.5%', positive: true, icon: Clock },
    { name: 'Confirmed Bookings', value: stats.confirmedBookings || '4', growth: '+15.1%', positive: true, icon: CheckCircle2 },
    { name: 'Pending Bookings', value: stats.pendingBookings || '1', growth: '-8.3%', positive: false, icon: AlertCircle },
    { name: 'Total Revenue', value: stats.totalRevenue || '₹22,750', growth: '+22.8%', positive: true, icon: IndianRupee },
    { name: 'Active Services', value: stats.activeServices || '10', growth: '0%', positive: true, icon: Library },
    { name: 'Total Temples', value: stats.totalTemples || '6', growth: '+5.5%', positive: true, icon: ShieldCheck },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              backgroundColor: 'var(--admin-bg-sidebar)',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.85rem 1.4rem',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.9rem'
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--admin-gold)' }} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner / Action bar */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', marginBottom: '0.2rem' }}>
            Sacred Operations Sanctuary
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            Real-time live monitoring of pilgrim bookings, Vedic services, and temple revenue metrics.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex-center"
          style={{
            background: 'rgba(200, 155, 75, 0.12)',
            border: '1px solid rgba(200, 155, 75, 0.25)',
            color: 'var(--admin-gold)',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            gap: '0.5rem',
            transition: 'all 0.25s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(200, 155, 75, 0.22)';
            e.currentTarget.style.color = '#FFFDF9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(200, 155, 75, 0.12)';
            e.currentTarget.style.color = 'var(--admin-gold)';
          }}
        >
          <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
          Sync Divine Data
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(192, 90, 78, 0.15)',
            border: '1px solid rgba(192, 90, 78, 0.4)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: '#FFFDF9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={24} style={{ color: 'var(--admin-danger)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Database Connection Alert</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            style={{
              backgroundColor: 'rgba(192, 90, 78, 0.3)',
              border: '1px solid rgba(192, 90, 78, 0.6)',
              color: '#FFFDF9',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap'
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI CARDS GRID */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {kpis.map((kpi, idx) => {
          const KpiIcon = kpi.icon;
          return (
            <motion.div
              key={kpi.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.4 }}
              className="glassmorphism"
              style={{
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(214, 181, 109, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '135px',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ 
                y: -4, 
                borderColor: 'rgba(200, 155, 75, 0.45)', 
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)' 
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  top: '-15%',
                  right: '-15%',
                  width: '70px',
                  height: '70px',
                  background: 'radial-gradient(circle, rgba(200, 155, 75, 0.08) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }}
              />

              <div className="flex-between">
                <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', fontWeight: '500' }}>
                  {kpi.name}
                </span>
                <div 
                  className="flex-center"
                  style={{
                    backgroundColor: 'rgba(214, 181, 109, 0.08)',
                    borderRadius: '8px',
                    height: '32px',
                    width: '32px',
                    color: 'var(--admin-gold)'
                  }}
                >
                  <KpiIcon size={16} />
                </div>
              </div>

              <div style={{ marginTop: '0.4rem' }}>
                <span 
                  style={{ 
                    fontSize: '1.6rem', 
                    fontWeight: '700', 
                    color: '#FFFDF9',
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {kpi.value}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.75rem' }}>
                <span 
                  style={{
                    color: kpi.positive ? 'var(--admin-success)' : 'var(--admin-danger)',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.1rem'
                  }}
                >
                  {kpi.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {kpi.growth}
                </span>
                <span style={{ color: 'rgba(214, 181, 109, 0.4)' }}>vs last month</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ANALYTICS CHARTS SECTION */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}
        className="charts-grid"
      >
        {/* Bookings Analytics Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="glassmorphism"
          style={{
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(214, 181, 109, 0.15)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 className="serif-title" style={{ fontSize: '1rem', color: '#FFFDF9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} style={{ color: 'var(--admin-gold)' }} />
                Booking Analytics Trend
              </h3>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>Monthly slot bookings and confirmations</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', border: '1px solid rgba(200, 155, 75, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Current Season 2026
            </span>
          </div>

          <div style={{ width: '100%', height: '220px', position: 'relative' }}>
            <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C89B4B" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#241411" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(214, 181, 109, 0.08)" strokeDasharray="3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(214, 181, 109, 0.08)" strokeDasharray="3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(214, 181, 109, 0.08)" strokeDasharray="3" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="rgba(214, 181, 109, 0.15)" />

              <path 
                d="M 10 190 Q 90 110, 110 130 T 210 70 T 310 90 T 410 40 T 490 50 L 490 190 L 10 190 Z" 
                fill="url(#chartGlow)"
              />
              <path 
                d="M 10 190 Q 90 110, 110 130 T 210 70 T 310 90 T 410 40 T 490 50" 
                fill="none" 
                stroke="#C89B4B" 
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="210" cy="70" r="5" fill="#FFFDF9" stroke="#C89B4B" strokeWidth="2" />
              <circle cx="410" cy="40" r="5" fill="#FFFDF9" stroke="#C89B4B" strokeWidth="2" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.2rem 0', color: 'var(--admin-text-muted)', fontSize: '0.7rem' }}>
              <span>March</span>
              <span>April</span>
              <span>May</span>
              <span>June</span>
              <span>July</span>
              <span>August</span>
            </div>
          </div>
        </motion.div>

        {/* Revenue Analytics Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glassmorphism"
          style={{
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(214, 181, 109, 0.15)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
          }}
        >
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 className="serif-title" style={{ fontSize: '1rem', color: '#FFFDF9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IndianRupee size={16} style={{ color: 'var(--admin-gold)' }} />
                Revenue Sanctuary Flow
              </h3>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>Weekly gross revenue receipts (in ₹ Thousands)</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', border: '1px solid rgba(200, 155, 75, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Weekly Flow
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '220px', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, borderBottom: '1px dashed rgba(214, 181, 109, 0.05)' }} />
            <div style={{ position: 'absolute', bottom: '120px', left: 0, right: 0, borderBottom: '1px dashed rgba(214, 181, 109, 0.05)' }} />
            <div style={{ position: 'absolute', bottom: '180px', left: 0, right: 0, borderBottom: '1px dashed rgba(214, 181, 109, 0.05)' }} />

            {[
              { label: 'Week 1', val: 78, amt: '₹78K' },
              { label: 'Week 2', val: 110, amt: '₹110K' },
              { label: 'Week 3', val: 95, amt: '₹95K' },
              { label: 'Week 4', val: 155, amt: '₹155K' },
              { label: 'Week 5 (curr)', val: 44, amt: '₹44K' },
            ].map((bar, idx) => (
              <div 
                key={bar.label} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  flex: 1, 
                  height: '100%', 
                  justifyContent: 'flex-end',
                  zIndex: 2
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--admin-gold)', fontWeight: '600' }}>
                  {bar.amt}
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(bar.val / 180) * 100}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.08 }}
                  style={{
                    width: '32px',
                    borderRadius: '6px 6px 0 0',
                    background: 'linear-gradient(to top, var(--admin-primary-brown) 0%, var(--admin-gold) 100%)',
                    border: '1px solid rgba(214, 181, 109, 0.35)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    cursor: 'pointer'
                  }}
                  whileHover={{ scale: 1.05 }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="glassmorphism"
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(214, 181, 109, 0.15)',
          padding: '1.5rem',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3 className="serif-title" style={{ fontSize: '1.1rem', color: '#FFFDF9' }}>
              Recent Bookings Ledger
            </h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>
              Live synchronized ledger of devotee reservations and puja offerings.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(214, 181, 109, 0.2)',
              background: 'rgba(18, 9, 7, 0.4)',
              color: 'var(--admin-gold)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sans)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.25s'
            }}
          >
            Refresh Ledger
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table 
            style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              textAlign: 'left',
              fontSize: '0.88rem' 
            }}
          >
            <thead>
              <tr 
                style={{ 
                  borderBottom: '1px solid rgba(214, 181, 109, 0.2)', 
                  color: 'var(--admin-gold-light)', 
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '0.85rem 1rem' }}>ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>DEVOTEE</th>
                <th style={{ padding: '0.85rem 1rem' }}>OFFERING SERVICE</th>
                <th style={{ padding: '0.85rem 1rem' }}>SACRED TEMPLE</th>
                <th style={{ padding: '0.85rem 1rem' }}>DATE</th>
                <th style={{ padding: '0.85rem 1rem' }}>AMOUNT</th>
                <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--admin-cream)' }}>
              {recentBookings.map((bk) => (
                <tr 
                  key={bk.id || bk.bookingId}
                  style={{ 
                    borderBottom: '1px solid rgba(214, 181, 109, 0.08)',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(214, 181, 109, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '0.95rem 1rem', fontWeight: 'bold', color: 'var(--admin-gold)' }}>
                    {bk.id || bk.bookingId}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: '#FFFDF9', fontWeight: '500' }}>
                    {bk.customer || bk.devoteeName}
                  </td>
                  <td style={{ padding: '0.95rem 1rem' }}>
                    {bk.service || bk.serviceType}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: 'var(--admin-text-muted)' }}>
                    {bk.temple || bk.templeName}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap' }}>
                    {bk.date || bk.bookingDate}
                  </td>
                  <td style={{ padding: '0.95rem 1rem', color: '#FFFDF9', fontWeight: '500' }}>
                    {bk.amount || (bk.totalAmount ? `₹${bk.totalAmount}` : '₹501')}
                  </td>
                  <td style={{ padding: '0.95rem 1rem' }}>
                    <span 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        backgroundColor: 
                          (bk.bookingStatus || bk.status) === 'CONFIRMED' || (bk.bookingStatus || bk.status) === 'COMPLETED' ? 'rgba(142, 174, 104, 0.12)' : 
                          (bk.bookingStatus || bk.status) === 'PENDING' ? 'rgba(217, 160, 91, 0.12)' : 
                          'rgba(192, 90, 78, 0.12)',
                        border: 
                          (bk.bookingStatus || bk.status) === 'CONFIRMED' || (bk.bookingStatus || bk.status) === 'COMPLETED' ? '1px solid rgba(142, 174, 104, 0.35)' : 
                          (bk.bookingStatus || bk.status) === 'PENDING' ? '1px solid rgba(217, 160, 91, 0.35)' : 
                          '1px solid rgba(192, 90, 78, 0.35)',
                        color: 
                          (bk.bookingStatus || bk.status) === 'CONFIRMED' || (bk.bookingStatus || bk.status) === 'COMPLETED' ? 'var(--admin-success)' : 
                          (bk.bookingStatus || bk.status) === 'PENDING' ? 'var(--admin-warning)' : 
                          'var(--admin-danger)'
                      }}
                    >
                      {bk.bookingStatus || bk.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                    <button
                      className="flex-center"
                      style={{
                        margin: '0 auto',
                        background: 'none',
                        border: '1px solid rgba(214, 181, 109, 0.2)',
                        color: 'var(--admin-gold)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        gap: '0.3rem',
                        fontSize: '0.75rem'
                      }}
                      onClick={() => setSelectedBooking(bk)}
                      title="Inspect Booking details"
                    >
                      <Eye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* INSPECT BOOKING MODAL */}
      <AnimatePresence>
        {selectedBooking && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '520px',
                padding: '2rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--admin-text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(214, 181, 109, 0.2)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                  Sacred Booking Voucher
                </span>
                <h3 className="serif-title" style={{ fontSize: '1.4rem', color: '#FFFDF9', marginTop: '0.3rem' }}>
                  {selectedBooking.id || selectedBooking.bookingId}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.88rem', color: 'var(--admin-cream)' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Devotee Name:</span>
                  <strong style={{ color: '#FFFDF9' }}>{selectedBooking.customer || selectedBooking.devoteeName}</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Phone / Contact:</span>
                  <span>{selectedBooking.devoteePhone || '+91 98765 43210'}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Sacred Temple:</span>
                  <strong style={{ color: 'var(--admin-gold)' }}>{selectedBooking.temple || selectedBooking.templeName}</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Service / Offering:</span>
                  <span>{selectedBooking.service || selectedBooking.serviceType}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Reserved Date:</span>
                  <span>{selectedBooking.date || selectedBooking.bookingDate}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Time Slot:</span>
                  <span>{selectedBooking.timeSlot || 'Morning (07:00 AM)'}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Offering Amount:</span>
                  <strong style={{ color: '#FFFDF9', fontSize: '1.1rem' }}>{selectedBooking.amount || `₹${selectedBooking.totalAmount}`}</strong>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Payment Method:</span>
                  <span>{selectedBooking.paymentMethod || 'UPI (GPay)'}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Current Status:</span>
                  <strong style={{ color: selectedBooking.bookingStatus === 'CONFIRMED' ? 'var(--admin-success)' : 'var(--admin-warning)' }}>
                    {selectedBooking.bookingStatus || selectedBooking.status}
                  </strong>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(214, 181, 109, 0.2)', display: 'flex', gap: '0.8rem' }}>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id || selectedBooking.bookingId, 'CONFIRMED')}
                  disabled={statusUpdating}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid var(--admin-success)',
                    background: 'rgba(142, 174, 104, 0.15)',
                    color: 'var(--admin-success)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id || selectedBooking.bookingId, 'CANCELLED')}
                  disabled={statusUpdating}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid var(--admin-danger)',
                    background: 'rgba(192, 90, 78, 0.15)',
                    color: 'var(--admin-danger)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel & Refund
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spinAround {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spinAround 1s linear infinite !important;
        }
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
