import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { getAuthHeaders, getCurrentUser } from '../../utils/auth';

export default function TempleBookingsView() {
  const [bookings, setBookings] = useState([]);
  const [templeInfo, setTempleInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sub-admin/temple-dashboard', { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        setBookings(json.recentBookings || []);
        setTempleInfo(json.temple || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setToastMessage(`🙏 Booking updated to ${newStatus}`);
        setTimeout(() => setToastMessage(''), 4000);
        await fetchBookings();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const filtered = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchesTerm = (
      (b.bookingId || b.id || '').toLowerCase().includes(term) ||
      (b.devoteeName || b.userName || b.name || '').toLowerCase().includes(term) ||
      (b.serviceName || b.category || '').toLowerCase().includes(term)
    );
    const matchesStatus = filterStatus === 'ALL' || (b.bookingStatus || 'CONFIRMED') === filterStatus;
    return matchesTerm && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#1E2C1E', border: '1px solid #8EAE68', color: '#D4E7C5', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', margin: '0 0 0.25rem' }}>
            Temple Bookings Ledger — {templeInfo.name || 'Kapaleeshwarar Temple'}
          </h2>
          <p style={{ color: 'var(--admin-gold)', fontSize: '0.85rem', margin: 0 }}>
            Devotee reservations for all services in {templeInfo.city || 'Chennai'}
          </p>
        </div>

        <button
          onClick={fetchBookings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(214, 181, 109, 0.1)',
            border: '1px solid rgba(214, 181, 109, 0.25)',
            borderRadius: '8px',
            color: 'var(--admin-gold)',
            padding: '0.5rem 0.9rem',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin-slow' : ''} /> Refresh
        </button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.4)' }} />
          <input
            type="text"
            placeholder="Search by devotee, ID, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', borderRadius: '8px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                backgroundColor: filterStatus === status ? 'var(--admin-gold)' : 'rgba(214, 181, 109, 0.08)',
                color: filterStatus === status ? '#120907' : 'var(--admin-text-muted)',
                border: filterStatus === status ? '1px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.2)',
                borderRadius: '6px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div className="flex-center" style={{ padding: '3rem' }}>
            <RefreshCw size={24} className="spin-slow" style={{ color: '#8EAE68' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
            No bookings found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(18, 9, 7, 0.4)', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', color: 'var(--admin-gold)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Booking ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Devotee</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Service Offering</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id || b.bookingId} style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.08)', color: '#FFFDF9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: 'var(--admin-gold)', fontWeight: '700' }}>
                      {b.bookingId || b.id || 'BK-1001'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>
                      {b.devoteeName || b.userName || b.name || 'Devotee'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ backgroundColor: 'rgba(200, 155, 75, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--admin-gold)' }}>
                        {b.serviceName || b.subcategory || 'Ritual'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                      {b.date || b.bookingDate || 'Scheduled Slot'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>
                      ₹{b.totalAmount || b.amount || 501}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span 
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          backgroundColor: (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED') ? 'rgba(142, 174, 104, 0.15)' : 'rgba(200, 155, 75, 0.15)',
                          color: (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED') ? '#8EAE68' : 'var(--admin-gold)'
                        }}
                      >
                        {b.bookingStatus || 'CONFIRMED'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {b.bookingStatus !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id || b.bookingId, 'CONFIRMED')}
                            style={{
                              backgroundColor: 'rgba(142, 174, 104, 0.15)',
                              border: '1px solid rgba(142, 174, 104, 0.4)',
                              color: '#8EAE68',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </td>
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
