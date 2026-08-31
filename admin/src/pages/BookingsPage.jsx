import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, Search, Filter, Eye, Check, X, 
  Sparkles, AlertCircle, Printer, Download, Clock,
  ChevronRight, ArrowLeft, Calendar, MapPin, Building2,
  User, Phone, Mail, QrCode, Gift, Utensils, CheckCircle2,
  XCircle, Plus, RefreshCw, CreditCard, Users, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '../utils/auth';

export default function BookingsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const templeId = params.templeId;
  const bookingId = params.bookingId || params.id;

  // Level 1: Temples with bookings state
  const [templeGroups, setTempleGroups] = useState([]);
  const [loadingTemples, setLoadingTemples] = useState(true);

  // Level 2: Bookings for selected temple
  const [templeBookings, setTempleBookings] = useState([]);
  const [currentTemple, setCurrentTemple] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Level 3: Individual Booking Details
  const [activeBooking, setActiveBooking] = useState(null);
  const [loadingBookingDetail, setLoadingBookingDetail] = useState(false);

  // UI Modals & Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState(null);

  // Modals for Level 3 Actions
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanForm, setScanForm] = useState({
    location: 'Main Temple Entrance',
    status: 'Scanned',
    scannedBy: 'Gate Scanner Staff',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  });

  const [isComplimentaryModalOpen, setIsComplimentaryModalOpen] = useState(false);
  const [complimentaryForm, setComplimentaryForm] = useState({
    status: 'Received',
    type: 'Complimentary Darshan Pass',
    quantity: 1,
    issuedAt: 'Main Seva Counter',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  });

  const [isAnnadhanamModalOpen, setIsAnnadhanamModalOpen] = useState(false);
  const [annadhanamForm, setAnnadhanamForm] = useState({
    status: 'Availed',
    quantity: 2,
    location: 'Annadhanam Dining Hall - Block A',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 1. Fetch Temples that have Bookings (Level 1)
  const fetchTempleGroups = async () => {
    setLoadingTemples(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings/temples', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setTempleGroups(Array.isArray(data) ? data : []);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch temple bookings.`);
      }
    } catch (err) {
      console.error('Failed to fetch temple groups:', err);
      setError('Unable to load temple bookings list. Please check the backend server / MongoDB connection.');
    } finally {
      setLoadingTemples(false);
    }
  };

  // 2. Fetch Bookings for a Specific Temple (Level 2)
  const fetchTempleBookings = async (tId) => {
    if (!tId) return;
    setLoadingBookings(true);
    setError(null);
    try {
      const res = await fetch(`/api/temples/${encodeURIComponent(tId)}/bookings`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const bList = Array.isArray(data) ? data : [];
        setTempleBookings(bList);

        // Also try to find temple metadata
        const matched = templeGroups.find(t => 
          String(t.id) === String(tId) || 
          String(t._id) === String(tId) || 
          String(t.templeId) === String(tId)
        );
        if (matched) {
          setCurrentTemple(matched);
        } else if (bList.length > 0) {
          setCurrentTemple({
            id: tId,
            name: bList[0].temple || bList[0].templeName || 'Temple',
            location: bList[0].templeLocation || bList[0].district || 'Tamil Nadu',
            image: 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80'
          });
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch bookings.`);
      }
    } catch (err) {
      console.error('Failed to fetch temple bookings:', err);
      setError('Unable to load bookings for this temple.');
    } finally {
      setLoadingBookings(false);
    }
  };

  // 3. Fetch Single Booking Detail (Level 3)
  const fetchBookingDetail = async (bId) => {
    if (!bId) return;
    setLoadingBookingDetail(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(bId)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setActiveBooking(data);
        if (data.complimentary) {
          setComplimentaryForm(prev => ({
            ...prev,
            ...data.complimentary
          }));
        }
        if (data.annadhanam) {
          setAnnadhanamForm(prev => ({
            ...prev,
            ...data.annadhanam
          }));
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Booking not found.`);
      }
    } catch (err) {
      console.error('Failed to fetch booking detail:', err);
      setError('Unable to load booking details.');
    } finally {
      setLoadingBookingDetail(false);
    }
  };

  // Lifecycle & Route sync
  useEffect(() => {
    fetchTempleGroups();
  }, []);

  useEffect(() => {
    if (templeId) {
      fetchTempleBookings(templeId);
    } else {
      setTempleBookings([]);
      setCurrentTemple(null);
    }
  }, [templeId, templeGroups]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail(bookingId);
    } else {
      setActiveBooking(null);
    }
  }, [bookingId]);

  // Update Status Action
  const handleUpdateStatus = async (bId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`🙏 Booking status updated to ${newStatus}`);
        if (templeId) fetchTempleBookings(templeId);
        fetchTempleGroups();
        if (activeBooking) {
          setActiveBooking(prev => ({ ...prev, bookingStatus: newStatus, status: newStatus }));
        }
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to update booking status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Submit Scan Check-In
  const handleRecordScan = async (e) => {
    e.preventDefault();
    if (!activeBooking) return;
    const targetId = activeBooking.bookingId || activeBooking.id || activeBooking._id;
    try {
      const res = await fetch(`/api/bookings/${targetId}/scans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(scanForm)
      });
      if (res.ok) {
        const resData = await res.json();
        showToast(`✅ Gate scan checkpoint recorded successfully!`);
        setIsScanModalOpen(false);
        setActiveBooking(resData.data || {
          ...activeBooking,
          scanHistory: [...(activeBooking.scanHistory || []), { ...scanForm, id: `scan-${Date.now()}` }]
        });
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to record scan checkpoint');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Submit Complimentary Update
  const handleSaveComplimentary = async (e) => {
    e.preventDefault();
    if (!activeBooking) return;
    const targetId = activeBooking.bookingId || activeBooking.id || activeBooking._id;
    try {
      const res = await fetch(`/api/bookings/${targetId}/complimentary`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(complimentaryForm)
      });
      if (res.ok) {
        const resData = await res.json();
        showToast(`🎁 Complimentary details updated successfully!`);
        setIsComplimentaryModalOpen(false);
        setActiveBooking(resData.data || { ...activeBooking, complimentary: complimentaryForm });
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to update complimentary details');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Submit Annadhanam Update
  const handleSaveAnnadhanam = async (e) => {
    e.preventDefault();
    if (!activeBooking) return;
    const targetId = activeBooking.bookingId || activeBooking.id || activeBooking._id;
    try {
      const res = await fetch(`/api/bookings/${targetId}/annadhanam`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(annadhanamForm)
      });
      if (res.ok) {
        const resData = await res.json();
        showToast(`🍲 Annadhanam benefit details updated successfully!`);
        setIsAnnadhanamModalOpen(false);
        setActiveBooking(resData.data || { ...activeBooking, annadhanam: annadhanamForm });
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to update Annadhanam details');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Filtered Temple Bookings (Level 2)
  const filteredBookings = useMemo(() => {
    return templeBookings.filter(b => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = !s || (
        (b.id || '').toLowerCase().includes(s) ||
        (b.bookingId || '').toLowerCase().includes(s) ||
        (b.customer || b.devoteeName || '').toLowerCase().includes(s) ||
        (b.service || b.serviceType || '').toLowerCase().includes(s) ||
        (b.devoteePhone || '').toLowerCase().includes(s)
      );
      const bStatus = (b.bookingStatus || b.status || 'CONFIRMED').toUpperCase();
      const matchesStatus = selectedStatus === 'ALL' || bStatus === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [templeBookings, searchTerm, selectedStatus]);

  // Overall Global Stats for Level 1
  const globalStats = useMemo(() => {
    return templeGroups.reduce((acc, t) => {
      acc.totalBookings += t.totalBookings || 0;
      acc.currentBookings += t.currentBookings || 0;
      acc.completedBookings += t.completedBookings || 0;
      acc.cancelledBookings += t.cancelledBookings || 0;
      acc.totalRevenue += t.totalRevenue || 0;
      return acc;
    }, { totalBookings: 0, currentBookings: 0, completedBookings: 0, cancelledBookings: 0, totalRevenue: 0 });
  }, [templeGroups]);

  // Level 2 Temple Specific Stats
  const templeSpecificStats = useMemo(() => {
    if (!templeBookings) return { total: 0, active: 0, completed: 0, cancelled: 0 };
    let total = templeBookings.length;
    let active = 0;
    let completed = 0;
    let cancelled = 0;
    templeBookings.forEach(b => {
      const st = (b.bookingStatus || b.status || 'CONFIRMED').toUpperCase();
      if (st === 'CONFIRMED' || st === 'PAID' || st === 'ACTIVE' || st === 'PENDING') active++;
      else if (st === 'COMPLETED' || st === 'USED') completed++;
      else if (st === 'CANCELLED' || st === 'REFUNDED') cancelled++;
    });
    return { total, active, completed, cancelled };
  }, [templeBookings]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', minHeight: '80vh' }}>
      
      {/* Toast Notification */}
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

      {/* Global Error Banner */}
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
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Database Notice</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (bookingId) fetchBookingDetail(bookingId);
              else if (templeId) fetchTempleBookings(templeId);
              else fetchTempleGroups();
            }}
            style={{
              backgroundColor: 'rgba(192, 90, 78, 0.3)',
              border: '1px solid rgba(192, 90, 78, 0.6)',
              color: '#FFFDF9',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.82rem'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: INDIVIDUAL BOOKING DETAILS                                       */}
      {/* ========================================================================= */}
      {bookingId && activeBooking && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Breadcrumb Hierarchy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/admin/bookings')}
              style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 500 }}
            >
              Bookings
            </button>
            <ChevronRight size={14} />
            <button
              onClick={() => navigate(`/admin/bookings/temple/${templeId || activeBooking.templeId || 't-1'}`)}
              style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 500 }}
            >
              {activeBooking.temple || activeBooking.templeName || 'Temple'} Bookings
            </button>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--admin-off-white)', fontWeight: 600 }}>
              Ref: {activeBooking.bookingId || activeBooking.id}
            </span>
          </div>

          {/* Action Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-gold)', fontWeight: 700 }}>
                BOOKING HIERARCHY — LEVEL 3 (DEVOTEE PASS)
              </span>
              <h1 className="serif-title" style={{ fontSize: '1.85rem', color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                Booking #{activeBooking.bookingId || activeBooking.id}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/admin/bookings/temple/${templeId || activeBooking.templeId || 't-1'}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  borderRadius: '8px',
                  color: 'var(--admin-off-white)',
                  cursor: 'pointer',
                  fontSize: '0.86rem'
                }}
              >
                <ArrowLeft size={16} />
                Back to {activeBooking.temple || activeBooking.templeName || 'Temple'} Bookings
              </button>

              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  backgroundColor: 'var(--admin-gold)',
                  border: '1px solid var(--admin-gold-light)',
                  borderRadius: '8px',
                  color: '#120907',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 600
                }}
              >
                <Printer size={16} />
                Print Devotee Pass
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            
            {/* Card 1: Devotee & Contact Information */}
            <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
                <User size={20} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>Devotee & Contact</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Primary Devotee</span>
                  <div style={{ fontWeight: 600, color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {activeBooking.customer || activeBooking.devoteeName || 'Devotee'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Phone Number</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {activeBooking.devoteePhone || 'Not provided'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Email Address</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                    {activeBooking.devoteeEmail || 'Not provided'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Devotees Count</span>
                  <div style={{ color: 'var(--admin-gold)', fontWeight: 600, marginTop: '0.2rem' }}>
                    {activeBooking.devoteesCount || (activeBooking.adults || 1) + (activeBooking.seniors || 0) + (activeBooking.children || 0)} Devotee(s)
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                      ({activeBooking.adults || 1} Adults, {activeBooking.seniors || 0} Seniors, {activeBooking.children || 0} Children)
                    </div>
                  </div>
                </div>
              </div>

              {activeBooking.address && (
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Address</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>{activeBooking.address}</div>
                </div>
              )}

              {activeBooking.emergencyContact && (
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Emergency Contact</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>{activeBooking.emergencyContact}</div>
                </div>
              )}

              {activeBooking.specialNotes && (
                <div style={{ fontSize: '0.85rem', backgroundColor: 'rgba(214, 181, 109, 0.08)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(214, 181, 109, 0.2)' }}>
                  <span style={{ color: 'var(--admin-gold)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Special Notes</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>{activeBooking.specialNotes}</div>
                </div>
              )}
            </div>

            {/* Card 2: Seva, Pooja & Financial Information */}
            <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
                <Building2 size={20} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>Seva & Payment Details</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Temple</span>
                  <div style={{ fontWeight: 600, color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {activeBooking.temple || activeBooking.templeName || 'Sacred Temple'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                    {activeBooking.templeLocation || activeBooking.district || 'Tamil Nadu'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Service / Seva</span>
                  <div style={{ fontWeight: 600, color: 'var(--admin-gold)', marginTop: '0.2rem' }}>
                    {activeBooking.service || activeBooking.serviceType || 'Special Pooja'}
                  </div>
                  {activeBooking.darshanType && typeof activeBooking.darshanType === 'object' && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                      Pass: {activeBooking.darshanType.name}
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Booking Date & Time</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {activeBooking.bookingDate || activeBooking.date || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--admin-gold)' }}>
                    {activeBooking.timeSlot || activeBooking.time || 'Morning Slot'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Amount & Method</span>
                  <div style={{ fontWeight: 700, color: '#8EAE68', marginTop: '0.2rem', fontSize: '1rem' }}>
                    {activeBooking.amount || `₹${activeBooking.totalAmount || 501}`}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                    {activeBooking.paymentMethod || 'UPI (GPay)'} • {activeBooking.paymentStatus || 'PAID'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.8rem 1rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Booking Status</span>
                  <div style={{ fontWeight: 600, color: 'var(--admin-off-white)' }}>
                    {activeBooking.bookingStatus || activeBooking.status || 'CONFIRMED'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(activeBooking.bookingId || activeBooking.id, st)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: (activeBooking.bookingStatus || activeBooking.status) === st ? '1px solid var(--admin-gold)' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: (activeBooking.bookingStatus || activeBooking.status) === st ? 'rgba(214, 181, 109, 0.25)' : 'transparent',
                        color: (activeBooking.bookingStatus || activeBooking.status) === st ? '#FFFDF9' : 'var(--admin-text-muted)',
                        cursor: 'pointer',
                        fontWeight: (activeBooking.bookingStatus || activeBooking.status) === st ? 600 : 400
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* SECTION 3: SCAN HISTORY (WHERE AND WHEN SCANNED)                      */}
          {/* ===================================================================== */}
          <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <QrCode size={22} style={{ color: 'var(--admin-gold)' }} />
                <div>
                  <h3 className="serif-title" style={{ fontSize: '1.2rem', color: '#FFFDF9', margin: 0 }}>Scan History</h3>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', margin: 0 }}>
                    Real-time verification log showing where and when this pass was scanned by temple staff.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsScanModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  backgroundColor: 'rgba(214, 181, 109, 0.15)',
                  border: '1px solid rgba(214, 181, 109, 0.4)',
                  borderRadius: '6px',
                  color: 'var(--admin-gold)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Plus size={15} />
                Record Scan / Check-In
              </button>
            </div>

            {Array.isArray(activeBooking.scanHistory) && activeBooking.scanHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {activeBooking.scanHistory.map((scan, idx) => (
                  <div
                    key={scan.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      backgroundColor: 'rgba(18, 9, 7, 0.5)',
                      border: '1px solid rgba(214, 181, 109, 0.15)',
                      borderRadius: '8px',
                      padding: '0.9rem 1.25rem',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(142, 174, 104, 0.2)',
                          color: '#8EAE68',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--admin-off-white)', fontSize: '0.92rem' }}>
                          {scan.gate || scan.location || 'Temple Gate'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.15rem' }}>
                          Scanned by: <span style={{ color: 'var(--admin-gold)' }}>{scan.scannedBy || 'Gate Scanner Staff'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8EAE68', fontSize: '0.85rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} />
                        {scan.status || 'Scanned'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
                        {scan.date || 'Today'} • {scan.time || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  borderRadius: '8px',
                  border: '1px dashed rgba(214, 181, 109, 0.2)',
                  color: 'var(--admin-text-muted)',
                  fontSize: '0.9rem'
                }}
              >
                <Clock size={28} style={{ color: 'var(--admin-gold)', margin: '0 auto 0.6rem', opacity: 0.7 }} />
                <div style={{ fontWeight: 500, color: 'var(--admin-off-white)', marginBottom: '0.25rem' }}>
                  No scan records found for this booking.
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                  The devotee has not passed through any gate scanners or verification checkpoints yet.
                </div>
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* SECTION 4 & 5: COMPLIMENTARY & ANNADHANAM DETAILS                     */}
          {/* ===================================================================== */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            
            {/* Complimentary Card */}
            <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Gift size={20} style={{ color: 'var(--admin-gold)' }} />
                  <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>Complimentary</h3>
                </div>

                <button
                  onClick={() => setIsComplimentaryModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: 'rgba(214, 181, 109, 0.1)',
                    border: '1px solid rgba(214, 181, 109, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--admin-gold)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Plus size={14} />
                  Update
                </button>
              </div>

              {activeBooking.complimentary && (activeBooking.complimentary.status === 'Received' || activeBooking.complimentary.status === 'Availed' || activeBooking.complimentary.quantity > 0) ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Status</span>
                    <div style={{ fontWeight: 600, color: '#8EAE68', marginTop: '0.2rem' }}>
                      {activeBooking.complimentary.status || 'Received'}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Quantity</span>
                    <div style={{ fontWeight: 700, color: 'var(--admin-gold)', marginTop: '0.2rem' }}>
                      {activeBooking.complimentary.quantity || 1} Unit(s)
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Item Type</span>
                    <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                      {activeBooking.complimentary.type || 'Complimentary Prasadam'}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Issued At</span>
                    <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                      {activeBooking.complimentary.issuedAt || 'Main Counter'}
                    </div>
                  </div>

                  {activeBooking.complimentary.date && (
                    <div style={{ gridColumn: 'span 2', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      Issued on {activeBooking.complimentary.date} {activeBooking.complimentary.time ? `at ${activeBooking.complimentary.time}` : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    borderRadius: '8px',
                    border: '1px dashed rgba(214, 181, 109, 0.2)',
                    color: 'var(--admin-text-muted)',
                    fontSize: '0.88rem'
                  }}
                >
                  <div style={{ color: 'var(--admin-off-white)', fontWeight: 500 }}>No complimentary recorded.</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>No complimentary items have been claimed for this booking.</div>
                </div>
              )}
            </div>

            {/* Annadhanam Card */}
            <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Utensils size={20} style={{ color: 'var(--admin-gold)' }} />
                  <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>Annadhanam Prasadam</h3>
                </div>

                <button
                  onClick={() => setIsAnnadhanamModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: 'rgba(214, 181, 109, 0.1)',
                    border: '1px solid rgba(214, 181, 109, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--admin-gold)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <Plus size={14} />
                  Update
                </button>
              </div>

              {activeBooking.annadhanam && (activeBooking.annadhanam.status === 'Availed' || activeBooking.annadhanam.status === 'Booked' || activeBooking.annadhanam.quantity > 0) ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Status</span>
                    <div style={{ fontWeight: 600, color: '#8EAE68', marginTop: '0.2rem' }}>
                      {activeBooking.annadhanam.status || 'Availed'}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Meals / Persons Availed</span>
                    <div style={{ fontWeight: 700, color: 'var(--admin-gold)', marginTop: '0.2rem', fontSize: '1.05rem' }}>
                      {activeBooking.annadhanam.quantity || activeBooking.devoteesCount || 1} Meal(s)
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Dining Hall Location</span>
                    <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                      {activeBooking.annadhanam.location || 'Temple Annadhanam Hall'}
                    </div>
                  </div>

                  {activeBooking.annadhanam.date && (
                    <div style={{ gridColumn: 'span 2', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      Availed on {activeBooking.annadhanam.date} {activeBooking.annadhanam.time ? `at ${activeBooking.annadhanam.time}` : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    borderRadius: '8px',
                    border: '1px dashed rgba(214, 181, 109, 0.2)',
                    color: 'var(--admin-text-muted)',
                    fontSize: '0.88rem'
                  }}
                >
                  <div style={{ color: 'var(--admin-off-white)', fontWeight: 500 }}>No Annadhanam recorded.</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>Annadhanam meals have not been availed for this booking reference.</div>
                </div>
              )}
            </div>

          </div>

          {/* RECORD SCAN MODAL */}
          <AnimatePresence>
            {isScanModalOpen && (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="glassmorphism"
                  style={{ width: '100%', maxWidth: '480px', backgroundColor: '#1E120D', border: '1px solid var(--admin-gold)', borderRadius: '12px', padding: '1.5rem', color: '#FFFDF9' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 className="serif-title" style={{ fontSize: '1.25rem', margin: 0 }}>Record Gate Check-In</h3>
                    <button onClick={() => setIsScanModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleRecordScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Scan Location / Gate</label>
                      <select
                        value={scanForm.location}
                        onChange={(e) => setScanForm({ ...scanForm, location: e.target.value, gate: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                      >
                        <option value="Main Temple Entrance">1. Main Temple Entrance</option>
                        <option value="Darshan Queue Verification">2. Darshan Queue Verification</option>
                        <option value="Sanctum Sanctorum Gate">3. Sanctum Sanctorum Gate</option>
                        <option value="Special Pooja Hall Entry">4. Special Pooja Hall Entry</option>
                        <option value="Prasadam Distribution Counter">5. Prasadam Distribution Counter</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Date</label>
                        <input
                          type="date"
                          value={scanForm.date}
                          onChange={(e) => setScanForm({ ...scanForm, date: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Time</label>
                        <input
                          type="text"
                          value={scanForm.time}
                          onChange={(e) => setScanForm({ ...scanForm, time: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Scanner / Staff Name</label>
                      <input
                        type="text"
                        value={scanForm.scannedBy}
                        onChange={(e) => setScanForm({ ...scanForm, scannedBy: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setIsScanModalOpen(false)}
                        style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#FFFDF9', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ padding: '0.6rem 1.4rem', borderRadius: '6px', backgroundColor: 'var(--admin-gold)', border: 'none', color: '#120907', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Confirm Check-In
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* COMPLIMENTARY MODAL */}
          <AnimatePresence>
            {isComplimentaryModalOpen && (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="glassmorphism"
                  style={{ width: '100%', maxWidth: '480px', backgroundColor: '#1E120D', border: '1px solid var(--admin-gold)', borderRadius: '12px', padding: '1.5rem', color: '#FFFDF9' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 className="serif-title" style={{ fontSize: '1.25rem', margin: 0 }}>Update Complimentary Details</h3>
                    <button onClick={() => setIsComplimentaryModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleSaveComplimentary} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Complimentary Item Type</label>
                      <input
                        type="text"
                        value={complimentaryForm.type}
                        onChange={(e) => setComplimentaryForm({ ...complimentaryForm, type: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={complimentaryForm.quantity}
                          onChange={(e) => setComplimentaryForm({ ...complimentaryForm, quantity: parseInt(e.target.value) || 1 })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Status</label>
                        <select
                          value={complimentaryForm.status}
                          onChange={(e) => setComplimentaryForm({ ...complimentaryForm, status: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                        >
                          <option value="Received">Received</option>
                          <option value="Availed">Availed</option>
                          <option value="Eligible">Eligible</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Issued At Counter / Location</label>
                      <input
                        type="text"
                        value={complimentaryForm.issuedAt}
                        onChange={(e) => setComplimentaryForm({ ...complimentaryForm, issuedAt: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setIsComplimentaryModalOpen(false)}
                        style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#FFFDF9', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ padding: '0.6rem 1.4rem', borderRadius: '6px', backgroundColor: 'var(--admin-gold)', border: 'none', color: '#120907', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Save Complimentary
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ANNADHANAM MODAL */}
          <AnimatePresence>
            {isAnnadhanamModalOpen && (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="glassmorphism"
                  style={{ width: '100%', maxWidth: '480px', backgroundColor: '#1E120D', border: '1px solid var(--admin-gold)', borderRadius: '12px', padding: '1.5rem', color: '#FFFDF9' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 className="serif-title" style={{ fontSize: '1.25rem', margin: 0 }}>Update Annadhanam Details</h3>
                    <button onClick={() => setIsAnnadhanamModalOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleSaveAnnadhanam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Meals / Persons Availed</label>
                        <input
                          type="number"
                          min="1"
                          value={annadhanamForm.quantity}
                          onChange={(e) => setAnnadhanamForm({ ...annadhanamForm, quantity: parseInt(e.target.value) || 1 })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Status</label>
                        <select
                          value={annadhanamForm.status}
                          onChange={(e) => setAnnadhanamForm({ ...annadhanamForm, status: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                        >
                          <option value="Availed">Availed</option>
                          <option value="Booked">Booked</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Annadhanam Hall Location</label>
                      <input
                        type="text"
                        value={annadhanamForm.location}
                        onChange={(e) => setAnnadhanamForm({ ...annadhanamForm, location: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Date</label>
                        <input
                          type="date"
                          value={annadhanamForm.date}
                          onChange={(e) => setAnnadhanamForm({ ...annadhanamForm, date: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.3rem' }}>Time</label>
                        <input
                          type="text"
                          value={annadhanamForm.time}
                          onChange={(e) => setAnnadhanamForm({ ...annadhanamForm, time: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', backgroundColor: '#120907', border: '1px solid rgba(214, 181, 109, 0.3)', color: '#FFFDF9', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setIsAnnadhanamModalOpen(false)}
                        style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: '#FFFDF9', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ padding: '0.6rem 1.4rem', borderRadius: '6px', backgroundColor: 'var(--admin-gold)', border: 'none', color: '#120907', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Save Annadhanam
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: TEMPLE BOOKING DASHBOARD (WHEN TEMPLE IS SELECTED)                */}
      {/* ========================================================================= */}
      {templeId && !bookingId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
            <button
              onClick={() => navigate('/admin/bookings')}
              style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 500 }}
            >
              Bookings
            </button>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--admin-off-white)', fontWeight: 600 }}>
              {currentTemple?.name || currentTemple?.templeName || 'Temple'} Bookings
            </span>
          </div>

          {/* Action Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-gold)', fontWeight: 700 }}>
                BOOKING HIERARCHY — LEVEL 2 (TEMPLE DASHBOARD)
              </span>
              <h1 className="serif-title" style={{ fontSize: '1.85rem', color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                {currentTemple?.name || currentTemple?.templeName || 'Temple'} Reservations
              </h1>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                Active bookings, queue status, and scan history for {currentTemple?.location || 'Tamil Nadu'}.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/admin/bookings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  borderRadius: '8px',
                  color: 'var(--admin-off-white)',
                  cursor: 'pointer',
                  fontSize: '0.86rem'
                }}
              >
                <ArrowLeft size={16} />
                Back to All Temples
              </button>

              <button
                onClick={() => fetchTempleBookings(templeId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  backgroundColor: 'rgba(214, 181, 109, 0.1)',
                  border: '1px solid rgba(214, 181, 109, 0.3)',
                  borderRadius: '8px',
                  color: 'var(--admin-gold)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={14} className={loadingBookings ? 'spin-slow' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* 4 Summary Stats Cards for Selected Temple */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Bookings</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--admin-gold)', marginTop: '0.2rem' }}>
                {templeSpecificStats.total}
              </div>
            </div>

            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current / Active</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8EAE68', marginTop: '0.2rem' }}>
                {templeSpecificStats.active}
              </div>
            </div>

            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                {templeSpecificStats.completed}
              </div>
            </div>

            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancelled / Refund</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--admin-danger)', marginTop: '0.2rem' }}>
                {templeSpecificStats.cancelled}
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="glassmorphism" style={{ padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.5)' }} />
              <input
                type="text"
                placeholder="Search by Devotee name, Booking Ref, Phone or Service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  color: '#FFFDF9',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Status Tab Badges */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    border: selectedStatus === status ? '1px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.15)',
                    backgroundColor: selectedStatus === status ? 'rgba(200, 155, 75, 0.18)' : 'transparent',
                    color: selectedStatus === status ? '#FFFDF9' : 'var(--admin-text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: selectedStatus === status ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table / List */}
          {filteredBookings.length > 0 ? (
            <div className="glassmorphism" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(214, 181, 109, 0.2)', color: 'var(--admin-gold)' }}>
                      <th style={{ padding: '1rem' }}>Booking ID</th>
                      <th style={{ padding: '1rem' }}>Devotee Name</th>
                      <th style={{ padding: '1rem' }}>Service / Seva</th>
                      <th style={{ padding: '1rem' }}>Scheduled Date</th>
                      <th style={{ padding: '1rem' }}>Devotees</th>
                      <th style={{ padding: '1rem' }}>Amount</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => {
                      const bId = b.bookingId || b.id || b._id;
                      const st = (b.bookingStatus || b.status || 'CONFIRMED').toUpperCase();
                      return (
                        <tr
                          key={bId}
                          onClick={() => navigate(`/admin/bookings/temple/${templeId}/booking/${bId}`)}
                          style={{
                            borderBottom: '1px solid rgba(214, 181, 109, 0.1)',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(214, 181, 109, 0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--admin-gold)' }}>
                            {bId}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--admin-off-white)' }}>
                              {b.customer || b.devoteeName || 'Devotee'}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                              {b.devoteePhone || b.devoteeEmail || ''}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--admin-off-white)' }}>
                            {b.service || b.serviceType || 'Special Darshan'}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: 'var(--admin-off-white)' }}>{b.bookingDate || b.date || 'N/A'}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--admin-gold)' }}>{b.timeSlot || b.time || 'Morning'}</div>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--admin-off-white)' }}>
                            {b.devoteesCount || (b.adults || 1) + (b.seniors || 0) + (b.children || 0)}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#8EAE68' }}>
                            {b.amount || `₹${b.totalAmount || 501}`}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: st === 'CONFIRMED' || st === 'PAID' ? 'rgba(142, 174, 104, 0.2)' : (st === 'CANCELLED' ? 'rgba(192, 90, 78, 0.2)' : 'rgba(214, 181, 109, 0.2)'),
                                color: st === 'CONFIRMED' || st === 'PAID' ? '#8EAE68' : (st === 'CANCELLED' ? '#C05A4E' : 'var(--admin-gold)')
                              }}
                            >
                              {st}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/bookings/temple/${templeId}/booking/${bId}`);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.45rem 0.85rem',
                                backgroundColor: 'rgba(214, 181, 109, 0.15)',
                                border: '1px solid rgba(214, 181, 109, 0.35)',
                                borderRadius: '6px',
                                color: 'var(--admin-gold)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              <Eye size={14} />
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div
              className="glassmorphism"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                borderRadius: '12px',
                color: 'var(--admin-text-muted)'
              }}
            >
              <BookOpen size={36} style={{ color: 'var(--admin-gold)', margin: '0 auto 0.75rem', opacity: 0.6 }} />
              <h3 className="serif-title" style={{ fontSize: '1.2rem', color: 'var(--admin-off-white)', marginBottom: '0.4rem' }}>
                No bookings found for this temple.
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                There are no devotee reservations matching your current search or status filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 1: TEMPLES WITH BOOKINGS DIRECTORY                                  */}
      {/* ========================================================================= */}
      {!templeId && !bookingId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          {/* Header */}
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-gold)', fontWeight: 700 }}>
                BOOKING HIERARCHY — LEVEL 1 (TEMPLES DIRECTORY)
              </span>
              <h2 className="serif-title" style={{ fontSize: '1.85rem', color: '#FFFDF9', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                Devotee Bookings Directory
              </h2>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                Select a sacred temple to view its active reservations ledger, check-in history, and devotee benefits.
              </p>
            </div>

            <button
              onClick={fetchTempleGroups}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(214, 181, 109, 0.1)',
                border: '1px solid rgba(214, 181, 109, 0.25)',
                color: 'var(--admin-gold)',
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loadingTemples ? 'spin-slow' : ''} />
              Refresh Directory
            </button>
          </div>

          {/* Global Statistics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temples with Bookings</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--admin-gold)', marginTop: '0.2rem' }}>
                {templeGroups.length}
              </div>
            </div>

            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Bookings</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                {globalStats.totalBookings}
              </div>
            </div>

            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active / Current</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8EAE68', marginTop: '0.2rem' }}>
                {globalStats.currentBookings}
              </div>
            </div>

            <div className="glassmorphism" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Seva Revenue</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--admin-gold)', marginTop: '0.2rem' }}>
                ₹{globalStats.totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Temples Cards Grid */}
          {templeGroups.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {templeGroups.map((t) => {
                const tTargetId = t.id || t.templeId || t._id;
                return (
                  <motion.div
                    key={tTargetId}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate(`/admin/bookings/temple/${tTargetId}`)}
                    className="glassmorphism"
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(214, 181, 109, 0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--admin-gold)';
                      e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(214, 181, 109, 0.2)';
                      e.currentTarget.style.backgroundColor = 'rgba(25, 12, 9, 0.55)';
                    }}
                  >
                    {/* Card Cover Image */}
                    <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                      <img
                        src={t.image || 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80'}
                        alt={t.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(18, 9, 7, 0.95), transparent)'
                        }}
                      />
                      
                      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <span
                          style={{
                            padding: '0.3rem 0.75rem',
                            backgroundColor: 'rgba(18, 9, 7, 0.85)',
                            border: '1px solid var(--admin-gold)',
                            borderRadius: '20px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: 'var(--admin-gold)'
                          }}
                        >
                          {t.currentBookings} Active
                        </span>
                      </div>

                      <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
                        <h3 className="serif-title" style={{ fontSize: '1.2rem', color: '#FFFDF9', margin: 0 }}>
                          {t.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.2rem' }}>
                          <MapPin size={13} style={{ color: 'var(--admin-gold)' }} />
                          {t.location}
                        </div>
                      </div>
                    </div>

                    {/* Card Body & Breakdown */}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Total</div>
                          <div style={{ fontWeight: 700, color: 'var(--admin-gold)', fontSize: '1.15rem' }}>{t.totalBookings}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Completed</div>
                          <div style={{ fontWeight: 700, color: '#FFFDF9', fontSize: '1.15rem' }}>{t.completedBookings}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Revenue</div>
                          <div style={{ fontWeight: 700, color: '#8EAE68', fontSize: '1rem' }}>₹{t.totalRevenue}</div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/bookings/temple/${tTargetId}`);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem',
                          backgroundColor: 'rgba(214, 181, 109, 0.12)',
                          border: '1px solid rgba(214, 181, 109, 0.35)',
                          borderRadius: '8px',
                          color: 'var(--admin-gold)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--admin-gold)';
                          e.currentTarget.style.color = '#120907';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(214, 181, 109, 0.12)';
                          e.currentTarget.style.color = 'var(--admin-gold)';
                        }}
                      >
                        View Bookings Dashboard
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div
              className="glassmorphism"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                borderRadius: '12px',
                color: 'var(--admin-text-muted)'
              }}
            >
              <BookOpen size={36} style={{ color: 'var(--admin-gold)', margin: '0 auto 0.75rem', opacity: 0.6 }} />
              <h3 className="serif-title" style={{ fontSize: '1.2rem', color: 'var(--admin-off-white)', marginBottom: '0.4rem' }}>
                No temple bookings found.
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                There are no active or recorded devotee bookings in the MongoDB database at this time.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
