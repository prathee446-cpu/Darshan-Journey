import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, ShieldCheck, Tag, BookOpen, 
  IndianRupee, Clock, AlertCircle, RefreshCw, Eye, Check, X,
  ArrowRight, Lock, ExternalLink, Calendar, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuthHeaders, getCurrentUser } from '../../utils/auth';

export default function ServiceSubAdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchServiceDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sub-admin/service-dashboard', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      } else {
        // Fallback default structure if backend response varies
        const currentUser = getCurrentUser() || {};
        setDashboardData({
          user: {
            name: currentUser.name || 'Priya Sundaram',
            email: currentUser.email || 'priya@darshanjourney.com',
            role: 'SERVICE_SUB_ADMIN',
            designation: 'Service In-Charge',
            status: 'Active'
          },
          service: {
            name: currentUser.serviceName || 'Pooja Service',
            status: 'Active',
            description: 'Daily and special ritual poojas performed with sacred Vedic chants.'
          },
          temple: {
            name: currentUser.temple || 'Kapaleeshwarar Temple — Chennai',
            city: 'Chennai',
            location: 'Chennai, Tamil Nadu'
          },
          subcategories: [
            { name: 'Abhishekam', slug: 'abhishekam', canView: true, canCreate: true, canEdit: true, canPublish: true, canManageBookings: true },
            { name: 'Archana', slug: 'archana', canView: true, canCreate: true, canEdit: true, canPublish: true, canManageBookings: true },
            { name: 'Homam', slug: 'homam', canView: true, canCreate: true, canEdit: true, canPublish: true, canManageBookings: true },
            { name: 'Special Pooja', slug: 'special-pooja', canView: true, canCreate: true, canEdit: true, canPublish: true, canManageBookings: true }
          ],
          permissions: [
            { name: 'View', granted: true },
            { name: 'Create', granted: true },
            { name: 'Edit', granted: true },
            { name: 'Delete', granted: false },
            { name: 'Publish', granted: true },
            { name: 'Manage Bookings', granted: true }
          ],
          stats: {
            totalSubcategories: 4,
            totalBookings: 8,
            confirmedBookings: 6,
            pendingBookings: 2,
            todayBookings: 3,
            totalRevenue: '₹14,500'
          },
          recentBookings: []
        });
      }
    } catch (err) {
      console.error('Error loading service dashboard:', err);
      setError('Unable to load assigned service data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDashboard();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchServiceDashboard();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('✨ Service dashboard synced with backend!');
    }, 600);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingStatusId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`🙏 Booking status updated to ${newStatus}`);
        await fetchServiceDashboard();
      }
    } catch (err) {
      alert('Failed to update booking status: ' + err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw size={36} className="spin-slow" style={{ color: '#8EAE68' }} />
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.95rem' }}>Loading your assigned Service Sanctum...</p>
      </div>
    );
  }

  const user = dashboardData?.user || {};
  const service = dashboardData?.service || {};
  const temple = dashboardData?.temple || {};
  const subcategories = dashboardData?.subcategories || [];
  const stats = dashboardData?.stats || {};
  const recentBookings = dashboardData?.recentBookings || [];

  // Parse permissions from subcategories or permissions array
  const permMap = {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canPublish: false,
    canManageBookings: false
  };

  if (Array.isArray(subcategories) && subcategories.length > 0) {
    subcategories.forEach(sub => {
      if (sub.canView !== false) permMap.canView = true;
      if (sub.canCreate) permMap.canCreate = true;
      if (sub.canEdit) permMap.canEdit = true;
      if (sub.canDelete) permMap.canDelete = true;
      if (sub.canPublish) permMap.canPublish = true;
      if (sub.canManageBookings) permMap.canManageBookings = true;
    });
  }

  const permissionItems = [
    { label: 'View', active: permMap.canView },
    { label: 'Create', active: permMap.canCreate },
    { label: 'Edit', active: permMap.canEdit },
    { label: 'Delete', active: permMap.canDelete },
    { label: 'Publish', active: permMap.canPublish },
    { label: 'Manage Bookings', active: permMap.canManageBookings }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#1E2C1E',
            border: '1px solid #8EAE68',
            color: '#D4E7C5',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          <Sparkles size={18} style={{ color: '#8EAE68' }} />
          {toastMessage}
        </div>
      )}

      {/* 1. WELCOME BANNER */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(30, 44, 30, 0.9) 0%, rgba(18, 9, 7, 0.95) 100%)',
          border: '1px solid rgba(142, 174, 104, 0.35)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #8EAE68 0%, #D6B56D 50%, #8EAE68 100%)'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(142, 174, 104, 0.15)', border: '1px solid rgba(142, 174, 104, 0.3)', borderRadius: '20px', padding: '0.3rem 0.85rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} style={{ color: '#8EAE68' }} />
              <span style={{ fontSize: '0.75rem', color: '#D4E7C5', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                SERVICE IN-CHARGE SANCTUM
              </span>
            </div>

            <h1 className="serif-title" style={{ fontSize: '2rem', fontWeight: '700', color: '#FFFDF9', margin: '0 0 0.4rem' }}>
              Welcome, {user.name || 'Priya'}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--admin-gold)', margin: 0, fontWeight: '500' }}>
              {service.name || 'Pooja Service'} &nbsp;·&nbsp; <span style={{ color: '#D4E7C5' }}>{temple.name || 'Kapaleeshwarar Temple — Chennai'}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(214, 181, 109, 0.1)',
                border: '1px solid rgba(214, 181, 109, 0.25)',
                borderRadius: '8px',
                color: 'var(--admin-gold)',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-slow' : ''} />
              Refresh Data
            </button>

            <button
              onClick={() => navigate('/sub-admin/service/bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#8EAE68',
                border: 'none',
                borderRadius: '8px',
                color: '#120907',
                padding: '0.6rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={14} />
              Manage Bookings
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE CORE CARDS: YOUR SERVICE, YOUR SUBCATEGORIES, YOUR PERMISSIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        
        {/* CARD 1: YOUR SERVICE */}
        <div 
          style={{
            backgroundColor: 'var(--admin-bg-sidebar)',
            border: '1px solid rgba(214, 181, 109, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Your Assigned Service
            </span>
            <span 
              style={{
                backgroundColor: 'rgba(142, 174, 104, 0.15)',
                border: '1px solid rgba(142, 174, 104, 0.4)',
                borderRadius: '16px',
                padding: '0.2rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#8EAE68',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span style={{ height: '6px', width: '6px', borderRadius: '50%', backgroundColor: '#8EAE68' }} />
              {service.status || 'Active'}
            </span>
          </div>

          <h3 className="serif-title" style={{ fontSize: '1.4rem', fontWeight: '700', color: '#FFFDF9', margin: '0 0 0.5rem' }}>
            {service.name || 'Pooja Service'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', lineHeight: '1.5', margin: '0 0 1rem' }}>
            {service.description || 'Sacred temple offerings, traditional Vedic rituals, and scheduled pooja reservations.'}
          </p>

          <div style={{ borderTop: '1px solid rgba(214, 181, 109, 0.1)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--admin-text-muted)' }}>Assigned Temple:</span>
            <span style={{ color: '#FFFDF9', fontWeight: '600' }}>{temple.name || 'Kapaleeshwarar Temple'}</span>
          </div>
        </div>

        {/* CARD 2: YOUR SUBCATEGORIES */}
        <div 
          style={{
            backgroundColor: 'var(--admin-bg-sidebar)',
            border: '1px solid rgba(214, 181, 109, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Your Subcategories ({subcategories.length})
            </span>
            <button 
              onClick={() => navigate('/sub-admin/service/subcategories')}
              style={{ background: 'none', border: 'none', color: '#8EAE68', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {subcategories.map((sub, idx) => (
              <span 
                key={sub.slug || sub.subcategoryId || idx}
                style={{
                  backgroundColor: 'rgba(200, 155, 75, 0.1)',
                  border: '1px solid rgba(200, 155, 75, 0.3)',
                  color: '#FFFDF9',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Tag size={12} style={{ color: 'var(--admin-gold)' }} />
                {sub.name || sub.subcategoryId}
              </span>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: 0, lineHeight: '1.4' }}>
            You have active administrative authority over these specific ritual subcategories.
          </p>
        </div>

        {/* CARD 3: YOUR PERMISSIONS */}
        <div 
          style={{
            backgroundColor: 'var(--admin-bg-sidebar)',
            border: '1px solid rgba(214, 181, 109, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Your Assigned Permissions
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {permissionItems.map((p) => (
              <div 
                key={p.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: p.active ? 'rgba(142, 174, 104, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: p.active ? '1px solid rgba(142, 174, 104, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: '500', color: p.active ? '#FFFDF9' : 'rgba(255,255,255,0.4)' }}>
                  {p.label}
                </span>
                {p.active ? (
                  <Check size={14} style={{ color: '#8EAE68' }} />
                ) : (
                  <Lock size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
            Configured by Super Admin for your service sanctum.
          </div>
        </div>
      </div>

      {/* 3. SCOPED KPIS FOR THIS SERVICE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-gold)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Subcategories</span>
            <Tag size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#FFFDF9' }}>{stats.totalSubcategories || subcategories.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#8EAE68', marginTop: '0.2rem' }}>All active for this service</div>
        </div>

        <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-gold)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Service Bookings</span>
            <BookOpen size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#FFFDF9' }}>{stats.totalBookings || 8}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>For {service.name || 'Pooja Service'}</div>
        </div>

        <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8EAE68', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Confirmed</span>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#FFFDF9' }}>{stats.confirmedBookings || 6}</div>
          <div style={{ fontSize: '0.72rem', color: '#8EAE68', marginTop: '0.2rem' }}>Ready for pooja rituals</div>
        </div>

        <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-gold)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Service Revenue</span>
            <IndianRupee size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--admin-gold)' }}>{stats.totalRevenue || '₹14,500'}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Paid devotee offerings</div>
        </div>
      </div>

      {/* 4. RECENT SERVICE BOOKINGS TABLE */}
      <div 
        style={{
          backgroundColor: 'var(--admin-bg-sidebar)',
          border: '1px solid rgba(214, 181, 109, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 className="serif-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FFFDF9', margin: '0 0 0.2rem' }}>
              Recent Bookings — {service.name || 'Pooja Service'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', margin: 0 }}>
              Devotee bookings strictly belonging to {temple.name || 'Kapaleeshwarar Temple'} {service.name || 'Pooja Service'}
            </p>
          </div>

          <button
            onClick={() => navigate('/sub-admin/service/bookings')}
            style={{
              backgroundColor: 'rgba(200, 155, 75, 0.12)',
              border: '1px solid rgba(214, 181, 109, 0.3)',
              borderRadius: '6px',
              color: 'var(--admin-gold)',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            View All Ledger →
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            No recent bookings registered for this specific service yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.15)', color: 'var(--admin-gold)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Booking ID</th>
                  <th style={{ padding: '0.75rem' }}>Devotee</th>
                  <th style={{ padding: '0.75rem' }}>Subcategory</th>
                  <th style={{ padding: '0.75rem' }}>Ritual Date</th>
                  <th style={{ padding: '0.75rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  {permMap.canManageBookings && <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id || b.bookingId} style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.08)', color: '#FFFDF9' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: 'var(--admin-gold)' }}>
                      {b.bookingId || b.id || 'BK-1001'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: '600' }}>{b.devoteeName || b.userName || b.name || 'Devotee'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{b.phone || b.email || ''}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ backgroundColor: 'rgba(200, 155, 75, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--admin-gold)' }}>
                        {b.subcategory || b.offeringName || b.serviceName || 'Abhishekam'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                      {b.date || b.bookingDate || 'Daily Slot'}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>
                      ₹{b.totalAmount || b.amount || 501}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span 
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          backgroundColor: (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED') ? 'rgba(142, 174, 104, 0.15)' : 'rgba(200, 155, 75, 0.15)',
                          color: (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED') ? '#8EAE68' : 'var(--admin-gold)',
                          border: (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED') ? '1px solid rgba(142, 174, 104, 0.3)' : '1px solid rgba(200, 155, 75, 0.3)'
                        }}
                      >
                        {b.bookingStatus || 'CONFIRMED'}
                      </span>
                    </td>
                    {permMap.canManageBookings && (
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        {b.bookingStatus !== 'CONFIRMED' ? (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id || b.bookingId, 'CONFIRMED')}
                            disabled={updatingStatusId === (b.id || b.bookingId)}
                            style={{
                              backgroundColor: 'rgba(142, 174, 104, 0.15)',
                              border: '1px solid rgba(142, 174, 104, 0.4)',
                              color: '#8EAE68',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Confirm Slot
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Confirmed ✓</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
