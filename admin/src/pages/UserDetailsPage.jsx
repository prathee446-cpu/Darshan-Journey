import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, 
  BookOpen, CreditCard, Sparkles, CheckCircle2, 
  AlertCircle, Shield, RefreshCw, ChevronRight,
  Clock, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuthHeaders } from '../utils/auth';

export default function UserDetailsPage() {
  const { id, userId } = useParams();
  const targetId = id || userId;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    if (!targetId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch user by ID
      const res = await fetch(`/api/users/${encodeURIComponent(targetId)}`, {
        headers: getAuthHeaders()
      });

      let userData = null;
      if (res.ok) {
        userData = await res.json();
      } else {
        // Fallback: fetch all users
        const allRes = await fetch('/api/users', { headers: getAuthHeaders() });
        if (allRes.ok) {
          const list = await allRes.json();
          userData = list.find(u => 
            String(u.id) === String(targetId) || 
            String(u._id) === String(targetId) ||
            (u.email && u.email.toLowerCase() === targetId.toLowerCase())
          );
        }
      }

      if (!userData) {
        throw new Error(`No devotee found matching identifier "${targetId}".`);
      }

      setUser(userData);

      // 2. Fetch bookings associated with this user
      const bookingsRes = await fetch('/api/bookings', { headers: getAuthHeaders() });
      if (bookingsRes.ok) {
        const allBookings = await bookingsRes.json();
        const devoteeBookings = (Array.isArray(allBookings) ? allBookings : []).filter(b => {
          const uName = (userData.name || '').toLowerCase();
          const uEmail = (userData.email || '').toLowerCase();
          const bName = (b.customer || b.devoteeName || '').toLowerCase();
          const bEmail = (b.email || b.devoteeEmail || '').toLowerCase();
          return (uEmail && bEmail === uEmail) || (uName && bName.includes(uName));
        });
        setUserBookings(devoteeBookings);
      }
    } catch (err) {
      console.error('Error fetching devotee details:', err);
      setError(err.message || 'Unable to load devotee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [targetId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Header & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: '1px solid rgba(214, 181, 109, 0.3)',
            color: 'var(--admin-gold)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={16} />
          Back to Devotees Directory
        </button>

        <button
          onClick={fetchUserData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(214, 181, 109, 0.1)',
            border: '1px solid rgba(214, 181, 109, 0.3)',
            color: 'var(--admin-gold)',
            padding: '0.5rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glassmorphism" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(214, 181, 109, 0.15)' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(214, 181, 109, 0.2)',
              borderTopColor: 'var(--admin-gold)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite'
            }} 
          />
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Loading devotee profile...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="glassmorphism" style={{ padding: '2.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(192, 90, 78, 0.4)' }}>
          <AlertCircle size={36} style={{ color: 'var(--admin-danger)', margin: '0 auto 1rem' }} />
          <h3 className="serif-title" style={{ fontSize: '1.25rem', color: '#FFFDF9', marginBottom: '0.5rem' }}>Devotee Not Found</h3>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>{error}</p>
          <button
            onClick={() => navigate('/admin/users')}
            style={{
              backgroundColor: 'var(--admin-primary-brown)',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Return to Users Directory
          </button>
        </div>
      )}

      {/* Devotee Profile Content */}
      {!loading && !error && user && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Profile Card */}
          <div 
            className="glassmorphism" 
            style={{ 
              borderRadius: '16px', 
              border: '1px solid rgba(214, 181, 109, 0.25)', 
              padding: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              alignItems: 'center',
              backgroundColor: 'rgba(25, 12, 10, 0.65)'
            }}
          >
            <div 
              className="flex-center"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'rgba(200, 155, 75, 0.2)',
                border: '2px solid var(--admin-gold)',
                color: 'var(--admin-gold)',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
              }}
            >
              {(user.name || 'D').charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span 
                  style={{ 
                    padding: '0.2rem 0.65rem', 
                    borderRadius: '12px', 
                    fontSize: '0.72rem', 
                    fontWeight: 'bold',
                    backgroundColor: user.status === 'VIP' ? 'rgba(200, 155, 75, 0.25)' : 'rgba(142, 174, 104, 0.15)',
                    border: user.status === 'VIP' ? '1px solid var(--admin-gold)' : '1px solid rgba(142, 174, 104, 0.4)',
                    color: user.status === 'VIP' ? 'var(--admin-gold)' : 'var(--admin-success)'
                  }}
                >
                  {user.status === 'VIP' ? '✨ VIP DEVOTEE' : 'VERIFIED DEVOTEE'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  ID: {user.id || user._id}
                </span>
              </div>

              <h1 className="serif-title" style={{ fontSize: '1.8rem', color: '#FFFDF9', margin: '0 0 0.5rem 0' }}>
                {user.name}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FFFDF9' }}>
                  <Mail size={14} style={{ color: 'var(--admin-gold)' }} />
                  {user.email}
                </span>
                {user.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} style={{ color: 'var(--admin-gold)' }} />
                    {user.phone}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} style={{ color: 'var(--admin-gold)' }} />
                  Member since {user.registrationDate || '2026-01-15'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>
                Total Seva Bookings
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--admin-gold)', fontFamily: 'var(--font-serif)' }}>
                {user.bookingCount || userBookings.length || 0}
              </span>
            </div>

            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>
                Total Offering Contribution
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#FFFDF9', fontFamily: 'var(--font-serif)' }}>
                {user.totalSpent || '₹0'}
              </span>
            </div>

            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.3rem' }}>
                Account Status
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--admin-success)', display: 'block', marginTop: '0.3rem' }}>
                Active & Verified
              </span>
            </div>
          </div>

          {/* Devotee Seva Reservation History */}
          <div className="glassmorphism" style={{ borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>
                Seva Reservations & Ledger ({userBookings.length})
              </h3>
            </div>

            {userBookings.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                <BookOpen size={30} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No reservation history recorded under this profile yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.15)', color: 'var(--admin-gold-light)', fontSize: '0.78rem' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>BOOKING REF</th>
                      <th style={{ padding: '0.85rem 1rem' }}>SEVA / SERVICE</th>
                      <th style={{ padding: '0.85rem 1rem' }}>TEMPLE</th>
                      <th style={{ padding: '0.85rem 1rem' }}>DATE</th>
                      <th style={{ padding: '0.85rem 1rem' }}>AMOUNT</th>
                      <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: 'var(--admin-cream)' }}>
                    {userBookings.map((b, idx) => (
                      <tr 
                        key={b.id || idx}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/bookings/${b.bookingId || b.id}`)}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: 'var(--admin-gold)' }}>
                          {b.bookingId || b.id}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#FFFDF9' }}>
                          {b.service || b.serviceType}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {b.temple || b.templeName}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {b.date || b.bookingDate}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold' }}>
                          {b.amount}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span 
                            style={{ 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '10px', 
                              fontSize: '0.72rem', 
                              fontWeight: 'bold',
                              backgroundColor: b.bookingStatus === 'CONFIRMED' || b.status === 'CONFIRMED' ? 'rgba(142, 174, 104, 0.15)' : 'rgba(200, 155, 75, 0.15)',
                              border: b.bookingStatus === 'CONFIRMED' || b.status === 'CONFIRMED' ? '1px solid rgba(142, 174, 104, 0.4)' : '1px solid var(--admin-gold)',
                              color: b.bookingStatus === 'CONFIRMED' || b.status === 'CONFIRMED' ? 'var(--admin-success)' : 'var(--admin-gold)'
                            }}
                          >
                            {b.bookingStatus || b.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/bookings/${b.bookingId || b.id}`);
                            }}
                            style={{
                              background: 'none',
                              border: '1px solid rgba(214, 181, 109, 0.3)',
                              color: 'var(--admin-gold)',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            View Booking
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
