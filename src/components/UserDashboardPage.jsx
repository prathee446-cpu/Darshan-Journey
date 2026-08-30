import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Calendar, Sparkles, Heart, Shield, CheckCircle2, 
  Clock, LogOut, MapPin, Edit3, ChevronRight, Compass, 
  Ticket, Phone, Flame, Sun, Star, ArrowRight, X, 
  ShieldCheck, HelpCircle, ExternalLink, Printer, AlertCircle, 
  Trash2, Filter, RefreshCw, Eye, Share2
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, cancelUserBooking } from '../services/bookingService';

export default function UserDashboardPage({ 
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToServices,
  onGoToLogin,
  onGoToAbout,
  onGoToContact,
  onGoToDashboard,
  onOpenBooking,
  onOpenDonate 
}) {
  const { user, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'wishlist' | 'profile'
  const [bookingFilter, setBookingFilter] = useState('all'); // 'all' | 'darshan' | 'pooja' | 'upcoming' | 'completed' | 'cancelled'
  const [toastMessage, setToastMessage] = useState(null);

  // Real User Bookings from MongoDB / Backend
  const [userBookings, setUserBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || user?.mobile || '');

  // Active Selected Ticket Details Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  // Saved Wishlist Temples per logged-in user
  const wishlistStorageKey = useMemo(() => {
    const userIdentifier = user?.id || user?._id || user?.email || 'guest';
    return `darshan_saved_temples_${userIdentifier}`;
  }, [user]);

  const [savedTemples, setSavedTemples] = useState(() => {
    try {
      const userIdentifier = user?.id || user?._id || user?.email || 'guest';
      const saved = localStorage.getItem(`darshan_saved_temples_${userIdentifier}`) || localStorage.getItem('darshan_saved_temples');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync saved temples to user localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(wishlistStorageKey, JSON.stringify(savedTemples));
    } catch { /* ignore */ }
  }, [savedTemples, wishlistStorageKey]);

  // Recommended Journey Pilgrimages (Curated Tamil Nadu Temples)
  const recommendedPilgrimages = [
    {
      id: 'rec-1',
      title: 'Arulmigu Meenakshi Amman Temple',
      location: 'Madurai, Tamil Nadu',
      deity: 'Goddess Meenakshi & Lord Sundareswarar',
      desc: 'Ancient spiritual epicenter featuring 14 towering gopurams and the sacred Golden Lotus Tank.',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?q=80&w=800&auto=format&fit=crop',
      category: 'Special VIP Darshan'
    },
    {
      id: 'rec-2',
      title: 'Brihadeeswarar Temple (Big Temple)',
      location: 'Thanjavur, Tamil Nadu',
      deity: 'Lord Shiva (Peruvudaiyar)',
      desc: 'UNESCO World Heritage landmark dedicated to Mahadeva with a 216-foot monolithic granite vimana.',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281358?q=80&w=800&auto=format&fit=crop',
      category: 'Maha Abhishekam'
    },
    {
      id: 'rec-3',
      title: 'Sri Ranganathaswamy Temple',
      location: 'Srirangam, Tamil Nadu',
      deity: 'Lord Ranganatha (Maha Vishnu)',
      desc: 'The largest functioning Hindu temple complex in the world on the sacred island of the Cauvery River.',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop',
      category: 'Vishnu Darshan'
    }
  ];

  // Fetch real user bookings from MongoDB on mount and user change
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const bookings = await getUserBookings();
      setUserBookings(Array.isArray(bookings) ? bookings : []);
    } catch (err) {
      console.warn('Failed to load bookings:', err);
      setUserBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditName(user.fullName || user.name || '');
      setEditPhone(user.phone || user.mobile || '');
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    showToast('Signed out successfully.');
    setTimeout(() => {
      if (onGoToLogin) onGoToLogin();
      else if (onGoToHome) onGoToHome();
    }, 300);
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    if (!user) return;

    const cleanName = editName.trim() || user.fullName || user.name || 'Devotee';
    const cleanPhone = editPhone.trim();

    if (updateUser) {
      updateUser({
        fullName: cleanName,
        name: cleanName,
        phone: cleanPhone,
        mobile: cleanPhone
      });
    }

    setIsEditingProfile(false);
    showToast('✅ Devotee profile updated successfully!');
  };

  const handleCancelBooking = async (booking) => {
    const bookingId = booking.bookingReference || booking.bookingId || booking._id;
    if (!bookingId) return;

    if (!window.confirm(`Are you sure you want to cancel booking ${bookingId} for ${booking.templeName || booking.temple}?`)) {
      return;
    }

    setCancellingBookingId(bookingId);
    try {
      const res = await cancelUserBooking(bookingId);
      if (res && res.success) {
        showToast('✅ Sacred booking cancelled successfully.');
        await fetchBookings();
        if (selectedTicket && (selectedTicket.bookingReference === bookingId || selectedTicket.bookingId === bookingId || selectedTicket._id === bookingId)) {
          setSelectedTicket(prev => ({ ...prev, bookingStatus: 'CANCELLED', status: 'CANCELLED' }));
        }
      } else {
        showToast(res.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      showToast('Error cancelling booking. Please try again.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const removeSavedTemple = (templeId) => {
    setSavedTemples(prev => prev.filter(t => t.id !== templeId && t._id !== templeId));
    showToast('Temple removed from sacred wishlist.');
  };

  const handleGetDirections = (location) => {
    const query = encodeURIComponent(location || 'Tamil Nadu Temple');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Real Authenticated Devotee Info
  const displayName = user?.fullName || user?.name || (user?.email ? user.email.split('@')[0] : 'Devotee');
  const userAvatarInitial = (displayName || 'D').charAt(0).toUpperCase();
  const userEmail = user?.email || 'devotee@darshanjourney.com';
  const isGoogleVerified = user?.provider === 'google' || user?.authProvider === 'google';

  // Dynamic Real Stats Calculated Strictly from Real Data
  const upcomingDarshans = useMemo(() => {
    return userBookings.filter(b => {
      const isDarshan = (b.bookingType || 'DARSHAN').toUpperCase() === 'DARSHAN';
      const status = (b.bookingStatus || b.status || 'CONFIRMED').toUpperCase();
      return isDarshan && status !== 'CANCELLED';
    });
  }, [userBookings]);

  const totalBookingsCount = userBookings.length;
  const upcomingDarshansCount = upcomingDarshans.length;

  const completedSevasCount = useMemo(() => {
    return userBookings.filter(b => {
      const isPooja = (b.bookingType || '').toUpperCase() === 'POOJA' || (b.bookingType || '').toUpperCase() === 'SEVA';
      const status = (b.bookingStatus || b.status || '').toUpperCase();
      return isPooja && status !== 'CANCELLED';
    }).length;
  }, [userBookings]);

  const savedTemplesCount = savedTemples.length;

  // Filtered Bookings for the Bookings Tab
  const filteredBookings = useMemo(() => {
    return userBookings.filter(b => {
      const bType = (b.bookingType || 'DARSHAN').toUpperCase();
      const bStatus = (b.bookingStatus || b.status || 'CONFIRMED').toUpperCase();

      if (bookingFilter === 'darshan') return bType === 'DARSHAN';
      if (bookingFilter === 'pooja') return bType === 'POOJA' || bType === 'SEVA';
      if (bookingFilter === 'upcoming') return bStatus === 'CONFIRMED' || bStatus === 'SCHEDULED';
      if (bookingFilter === 'completed') return bStatus === 'COMPLETED';
      if (bookingFilter === 'cancelled') return bStatus === 'CANCELLED';
      return true; // 'all'
    });
  }, [userBookings, bookingFilter]);

  // Real Dynamic Recent Activity Stream derived from user bookings & auth
  const recentActivities = useMemo(() => {
    const activities = [];

    // Add booking events
    userBookings.forEach((b) => {
      const isDarshan = (b.bookingType || 'DARSHAN').toUpperCase() === 'DARSHAN';
      const isCancelled = (b.bookingStatus || b.status || '').toUpperCase() === 'CANCELLED';
      const bRef = b.bookingReference || b.bookingId || b._id || 'DJ-BOOKING';

      activities.push({
        id: `act-${bRef}`,
        icon: isCancelled ? '❌' : (isDarshan ? '🛕' : '🙏'),
        title: isCancelled 
          ? `Booking Cancelled (${bRef})` 
          : (isDarshan ? `Darshan Pass Confirmed` : `Sacred Seva Scheduled`),
        desc: `${b.templeName || b.temple || 'Sacred Temple'} • ${b.darshanType || b.serviceName || 'Special Darshan'}`,
        timestamp: b.bookingDate || b.createdAt || 'Recent',
        tag: b.bookingStatus || b.status || 'CONFIRMED',
        status: b.bookingStatus || b.status || 'CONFIRMED'
      });
    });

    // Add user account verified / sign in event
    if (user) {
      activities.push({
        id: 'act-account-session',
        icon: '🛡️',
        title: isGoogleVerified ? 'Google Account Verified' : 'Devotee Account Active',
        desc: `Authenticated session active for ${userEmail}`,
        timestamp: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Active',
        tag: 'VERIFIED',
        status: 'VERIFIED'
      });
    }

    return activities.slice(0, 5);
  }, [userBookings, user, isGoogleVerified, userEmail]);

  return (
    <div className="home-website-wrapper" style={{ background: '#FAF6F0', minHeight: '100vh', color: '#341F1D', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* 1. TOP NAVBAR */}
      <Navbar 
        activePage="dashboard"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToLogin={onGoToLogin}
        onGoToAbout={onGoToAbout}
        onGoToContact={onGoToContact}
        onGoToDashboard={onGoToDashboard}
        onOpenBooking={onOpenBooking}
        onOpenDonate={onOpenDonate}
      />

      {/* 2. MAIN DASHBOARD CONTAINER */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 1.5rem 60px 1.5rem' }}>
        
        {/* ─── 2. PROFESSIONAL DEVOTEE DASHBOARD HEADER ─── */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)',
          border: '1.5px solid #EADBCA',
          borderRadius: '20px',
          padding: '1.5rem 1.8rem',
          marginBottom: '1.75rem',
          boxShadow: '0 6px 24px rgba(52, 31, 29, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.4rem'
        }}>
          {/* Left: User Profile Avatar & Welcome Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '62px',
              height: '62px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37 0%, #9B7536 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
              boxShadow: '0 4px 16px rgba(155, 117, 54, 0.28)',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2.5px solid #FFFFFF'
            }}>
              {user?.avatar && user.avatar.length > 2 && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                userAvatarInitial
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#2A1715',
                  margin: 0,
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  letterSpacing: '-0.02em'
                }}>
                  Welcome back, <strong>{displayName}</strong> 🙏
                </h1>
                
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#2E7D32',
                  background: 'rgba(46, 125, 50, 0.1)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(46, 125, 50, 0.2)'
                }}>
                  <ShieldCheck size={13} />
                  <span>{isGoogleVerified ? 'Google Verified' : 'Email Verified'}</span>
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
                flexWrap: 'wrap',
                marginTop: '0.35rem',
                fontSize: '0.86rem',
                color: '#7A6258'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="#8C6036" />
                  <span>{userEmail}</span>
                </span>
                {user?.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} color="#8C6036" />
                    <span>{user.phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Profile Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                background: 'rgba(200, 169, 106, 0.12)',
                border: '1.2px solid #C8A96A',
                color: '#6E4D2C',
                padding: '0.55rem 1.15rem',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(200, 169, 106, 0.22)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(200, 169, 106, 0.12)'}
            >
              <Edit3 size={15} color="#8C6036" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: '#FFFFFF',
                border: '1.2px solid rgba(217, 48, 37, 0.25)',
                color: '#D93025',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217, 48, 37, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ─── 3. DYNAMIC REAL STATS OVERVIEW (4 Interactive Cards) ─── */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.1rem',
          marginBottom: '1.75rem'
        }}>
          {/* Stat 1: Upcoming Darshans */}
          <div 
            onClick={() => { setActiveTab('bookings'); setBookingFilter('upcoming'); }}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADBCA',
              borderRadius: '16px',
              padding: '1.25rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(52, 31, 29, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(200, 169, 106, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8C6036',
              flexShrink: 0
            }}>
              <Ticket size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#2A1715', lineHeight: 1.1 }}>
                {upcomingDarshansCount}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2C28', marginTop: '0.15rem' }}>
                Upcoming Darshans
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7A6258', fontWeight: 500 }}>
                {upcomingDarshansCount > 0 ? `${upcomingDarshansCount} Active Pass(es)` : 'No pending passes'}
              </div>
            </div>
          </div>

          {/* Stat 2: Total Bookings */}
          <div 
            onClick={() => { setActiveTab('bookings'); setBookingFilter('all'); }}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADBCA',
              borderRadius: '16px',
              padding: '1.25rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(52, 31, 29, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(212, 175, 55, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9B7536',
              flexShrink: 0
            }}>
              <Calendar size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#2A1715', lineHeight: 1.1 }}>
                {totalBookingsCount}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2C28', marginTop: '0.15rem' }}>
                Total Bookings
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7A6258', fontWeight: 500 }}>
                All Darshans & Sevas
              </div>
            </div>
          </div>

          {/* Stat 3: Completed Sevas */}
          <div 
            onClick={() => { setActiveTab('bookings'); setBookingFilter('pooja'); }}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADBCA',
              borderRadius: '16px',
              padding: '1.25rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(52, 31, 29, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(217, 130, 43, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C05621',
              flexShrink: 0
            }}>
              <Flame size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#2A1715', lineHeight: 1.1 }}>
                {completedSevasCount}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2C28', marginTop: '0.15rem' }}>
                Completed Sevas
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7A6258', fontWeight: 500 }}>
                Pujas & Abhishekams
              </div>
            </div>
          </div>

          {/* Stat 4: Saved Temples */}
          <div 
            onClick={() => setActiveTab('wishlist')}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #EADBCA',
              borderRadius: '16px',
              padding: '1.25rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 4px 15px rgba(52, 31, 29, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(217, 48, 37, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C53030',
              flexShrink: 0
            }}>
              <Heart size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#2A1715', lineHeight: 1.1 }}>
                {savedTemplesCount}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4A2C28', marginTop: '0.15rem' }}>
                Saved Temples
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7A6258', fontWeight: 500 }}>
                In Sacred Wishlist
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. QUICK ACTIONS SECTION (5 Prominent Actions) ─── */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#8C6036',
            textTransform: 'uppercase',
            marginBottom: '0.65rem'
          }}>
            Quick Actions
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '0.85rem'
          }}>
            {/* 1. Book Darshan */}
            <button
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else window.location.href = '/quick-booking';
              }}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)',
                border: '1.5px solid #EADBCA',
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                color: '#2A1715',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 3px 12px rgba(52, 31, 29, 0.03)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: '1.25rem' }}>🛕</span>
              <span>Book Darshan</span>
            </button>

            {/* 2. Book Pooja/Seva */}
            <button
              onClick={() => {
                if (onGoToServices) onGoToServices();
                else window.location.href = '/services';
              }}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)',
                border: '1.5px solid #EADBCA',
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                color: '#2A1715',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 3px 12px rgba(52, 31, 29, 0.03)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: '1.25rem' }}>🙏</span>
              <span>Book Pooja / Seva</span>
            </button>

            {/* 3. My Bookings */}
            <button
              onClick={() => {
                setActiveTab('bookings');
                setBookingFilter('all');
              }}
              style={{
                background: activeTab === 'bookings' ? 'rgba(200, 169, 106, 0.16)' : '#FFFFFF',
                border: `1.5px solid ${activeTab === 'bookings' ? '#C8A96A' : '#EADBCA'}`,
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                color: '#2A1715',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 3px 12px rgba(52, 31, 29, 0.03)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { if (activeTab !== 'bookings') e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: '1.25rem' }}>🎫</span>
              <span>My Bookings ({totalBookingsCount})</span>
            </button>

            {/* 4. Saved Temples */}
            <button
              onClick={() => setActiveTab('wishlist')}
              style={{
                background: activeTab === 'wishlist' ? 'rgba(200, 169, 106, 0.16)' : '#FFFFFF',
                border: `1.5px solid ${activeTab === 'wishlist' ? '#C8A96A' : '#EADBCA'}`,
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                color: '#2A1715',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 3px 12px rgba(52, 31, 29, 0.03)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { if (activeTab !== 'wishlist') e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: '1.25rem' }}>❤️</span>
              <span>Saved Temples ({savedTemplesCount})</span>
            </button>

            {/* 5. Explore Temples */}
            <button
              onClick={() => {
                if (onExploreTemples) onExploreTemples();
                else window.location.href = '/explore';
              }}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)',
                border: '1.5px solid #EADBCA',
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                color: '#2A1715',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 3px 12px rgba(52, 31, 29, 0.03)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8A96A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EADBCA'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: '1.25rem' }}>🧭</span>
              <span>Explore Temples</span>
            </button>
          </div>
        </section>

        {/* ─── TAB NAVIGATION BAR ─── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
          borderBottom: '1.5px solid #EADBCA',
          paddingBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: <Compass size={16} /> },
              { id: 'bookings', label: `My Bookings & Passes (${totalBookingsCount})`, icon: <Ticket size={16} /> },
              { id: 'wishlist', label: `Saved Temples (${savedTemplesCount})`, icon: <Heart size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#2A1715' : '#FFFFFF',
                  color: activeTab === tab.id ? '#FFF8EA' : '#6E4D2C',
                  border: `1.5px solid ${activeTab === tab.id ? '#2A1715' : '#EADBCA'}`,
                  borderRadius: '12px',
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === tab.id ? '0 4px 12px rgba(42, 23, 21, 0.15)' : 'none'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={fetchBookings}
              style={{
                background: '#FFFFFF',
                border: '1.2px solid #EADBCA',
                borderRadius: '10px',
                padding: '0.5rem 0.9rem',
                fontSize: '0.82rem',
                color: '#8C6036',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Sync latest bookings from MongoDB"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* VIEW 0: MAIN DASHBOARD OVERVIEW TAB (Default Two-Column Layout) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1.15fr)',
            gap: '1.75rem',
            alignItems: 'start'
          }}>
            
            {/* ─── LEFT COLUMN: Upcoming Bookings & Temple Pilgrimages ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* 4. UPCOMING BOOKINGS SECTION */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #EADBCA',
                borderRadius: '18px',
                padding: '1.5rem 1.75rem',
                boxShadow: '0 4px 20px rgba(52, 31, 29, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.3rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(200, 169, 106, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8C6036'
                    }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.22rem', fontWeight: 800, color: '#2A1715', margin: 0 }}>
                        Upcoming Bookings & Passes
                      </h2>
                      <div style={{ fontSize: '0.78rem', color: '#7A6258' }}>
                        Live confirmed bookings from database
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('bookings');
                      setBookingFilter('upcoming');
                    }}
                    style={{
                      background: 'rgba(200, 169, 106, 0.1)',
                      border: '1px solid #C8A96A',
                      color: '#8C6036',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      padding: '0.4rem 0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <span>View All ({totalBookingsCount})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {isLoadingBookings ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#8C6036' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⏳</div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Loading your sacred bookings...</div>
                  </div>
                ) : upcomingDarshans.length === 0 ? (
                  <div style={{
                    background: '#FAF6F0',
                    border: '1.2px dashed #E6D8C5',
                    borderRadius: '14px',
                    padding: '2.2rem 1.5rem',
                    textAlign: 'center',
                    color: '#7A6258'
                  }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🛕</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2A1715', margin: '0 0 0.35rem 0' }}>
                      No Upcoming Bookings Found
                    </h3>
                    <p style={{ fontSize: '0.86rem', maxWidth: '400px', margin: '0 auto 1.25rem auto', lineHeight: 1.45 }}>
                      You have no active Darshan passes scheduled. Book a priority slot or order a sacred pooja to begin your journey.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => onOpenBooking ? onOpenBooking() : (window.location.href = '/quick-booking')}
                        style={{
                          background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                          color: '#1A0F0E',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.6rem 1.3rem',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(184, 142, 76, 0.3)'
                        }}
                      >
                        Book Darshan Slot
                      </button>
                      <button
                        onClick={() => onGoToServices ? onGoToServices() : (window.location.href = '/services')}
                        style={{
                          background: '#FFFFFF',
                          border: '1.2px solid #C8A96A',
                          color: '#6E4D2C',
                          borderRadius: '10px',
                          padding: '0.6rem 1.3rem',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Book Pooja / Seva
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {upcomingDarshans.slice(0, 3).map((booking) => {
                      const bRef = booking.bookingReference || booking.bookingId || booking._id;
                      const isDarshan = (booking.bookingType || 'DARSHAN').toUpperCase() === 'DARSHAN';
                      const bStatus = booking.bookingStatus || booking.status || 'CONFIRMED';

                      return (
                        <div
                          key={bRef}
                          style={{
                            background: '#FAF6F0',
                            border: '1.2px solid #E6D8C5',
                            borderRadius: '14px',
                            padding: '1.2rem 1.35rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            boxShadow: '0 2px 10px rgba(52, 31, 29, 0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 800, color: '#8C6036' }}>
                                {bRef}
                              </span>
                              <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '8px',
                                background: isDarshan ? 'rgba(200, 169, 106, 0.2)' : 'rgba(217, 130, 43, 0.18)',
                                color: isDarshan ? '#8C6036' : '#C05621'
                              }}>
                                {isDarshan ? '🛕 DARSHAN PASS' : '🙏 POOJA / SEVA'}
                              </span>
                            </div>

                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.65rem',
                              borderRadius: '12px',
                              background: 'rgba(46, 125, 50, 0.12)',
                              color: '#2E7D32'
                            }}>
                              {bStatus}
                            </span>
                          </div>

                          <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2A1715', margin: '0 0 0.2rem 0' }}>
                              {booking.templeName || booking.temple || 'Sacred Temple'}
                            </h3>
                            <div style={{ fontSize: '0.82rem', color: '#7A6258', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <MapPin size={13} color="#8C6036" />
                              <span>{booking.location || 'Tamil Nadu, India'}</span>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.85rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px dashed #DCC8B3'
                          }}>
                            <div style={{ fontSize: '0.84rem', color: '#4A2C28', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <Clock size={15} color="#8C6036" />
                              <span><strong>{booking.bookingDate}</strong> • {booking.bookingTime || booking.timeSlot || 'Slot Confirmed'}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => setSelectedTicket(booking)}
                                style={{
                                  background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                                  color: '#1A0F0E',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '0.45rem 0.95rem',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                <Eye size={14} />
                                <span>View Pass</span>
                              </button>
                              
                              <button
                                onClick={() => handleGetDirections(booking.location || booking.templeName)}
                                style={{
                                  background: '#FFFFFF',
                                  border: '1.2px solid #EADBCA',
                                  color: '#6E4D2C',
                                  borderRadius: '8px',
                                  padding: '0.45rem 0.85rem',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Directions
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 7. EXPLORE SACRED PILGRIMAGES & TEMPLES */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #EADBCA',
                borderRadius: '18px',
                padding: '1.5rem 1.75rem',
                boxShadow: '0 4px 20px rgba(52, 31, 29, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9B7536'
                    }}>
                      <Compass size={20} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2A1715', margin: 0 }}>
                        Continue Your Pilgrimage
                      </h2>
                      <div style={{ fontSize: '0.78rem', color: '#7A6258' }}>
                        Curated historic temple destinations
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onExploreTemples ? onExploreTemples() : (window.location.href = '/explore')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8C6036',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <span>Explore All</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recommendedPilgrimages.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#FAF6F0',
                        border: '1.2px solid #E6D8C5',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        padding: '0.95rem'
                      }}
                    >
                      <div style={{ width: '105px', height: '90px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2A1715', margin: 0 }}>
                              {item.title}
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: '#8C6036', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Star size={12} fill="#C8A96A" color="#C8A96A" /> {item.rating}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#7A6258', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                            <MapPin size={12} color="#8C6036" /> {item.location}
                          </div>

                          <p style={{ fontSize: '0.78rem', color: '#5C443C', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
                            {item.desc}
                          </p>
                        </div>

                        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#8C6036', background: 'rgba(200, 169, 106, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                            {item.category}
                          </span>

                          <button
                            onClick={() => onOpenBooking ? onOpenBooking() : (window.location.href = '/quick-booking')}
                            style={{
                              background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                              color: '#1A0F0E',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.38rem 0.85rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <span>Book Darshan</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ─── RIGHT COLUMN: Real Recent Activity, Devotee Profile & Support ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* 5. RECENT ACTIVITY SECTION (Dynamic from Real Data) */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #EADBCA',
                borderRadius: '18px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(52, 31, 29, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.15rem' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'rgba(200, 169, 106, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8C6036'
                  }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2A1715', margin: 0 }}>
                      Recent Activity
                    </h2>
                    <div style={{ fontSize: '0.75rem', color: '#7A6258' }}>
                      Real-time devotee activity logs
                    </div>
                  </div>
                </div>

                {recentActivities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#7A6258', fontSize: '0.84rem' }}>
                    No recent activity recorded yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {recentActivities.map((act) => (
                      <div
                        key={act.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.75rem 0.85rem',
                          background: '#FAF6F0',
                          borderRadius: '12px',
                          border: '1px solid #EDE1D2'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{act.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#2A1715' }}>
                              {act.title}
                            </div>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: act.status === 'CANCELLED' ? '#D93025' : '#2E7D32',
                              background: act.status === 'CANCELLED' ? 'rgba(217, 48, 37, 0.1)' : 'rgba(46, 125, 50, 0.1)',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '6px'
                            }}>
                              {act.tag}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#7A6258', marginTop: '0.15rem' }}>
                            {act.desc}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#9B7536', marginTop: '0.25rem', fontWeight: 600 }}>
                            {act.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DEVOTEE PROFILE CARD */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #EADBCA',
                borderRadius: '18px',
                padding: '1.4rem 1.5rem',
                boxShadow: '0 4px 15px rgba(52, 31, 29, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="#8C6036" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2A1715', margin: 0 }}>
                      Devotee Profile Details
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8C6036',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0E6D8', paddingBottom: '0.4rem' }}>
                    <span style={{ color: '#7A6258' }}>Full Name</span>
                    <span style={{ fontWeight: 700, color: '#2A1715' }}>{displayName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0E6D8', paddingBottom: '0.4rem' }}>
                    <span style={{ color: '#7A6258' }}>Email Address</span>
                    <span style={{ fontWeight: 600, color: '#2A1715' }}>{userEmail}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0E6D8', paddingBottom: '0.4rem' }}>
                    <span style={{ color: '#7A6258' }}>Mobile Phone</span>
                    <span style={{ fontWeight: 600, color: '#2A1715' }}>{user?.phone || user?.mobile || 'Not set'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#7A6258' }}>Auth Provider</span>
                    <span style={{ fontWeight: 700, color: '#8C6036' }}>{isGoogleVerified ? 'Google OAuth' : 'Local / OTP'}</span>
                  </div>
                </div>
              </div>

              {/* DAILY VEDIC BLESSING & AUSPICIOUS MUHURAT */}
              <div style={{
                background: 'linear-gradient(135deg, #2A1715 0%, #1A0F0E 100%)',
                color: '#FFF8EA',
                border: '1.5px solid #C8A96A',
                borderRadius: '18px',
                padding: '1.5rem',
                boxShadow: '0 6px 22px rgba(42, 23, 21, 0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
                  <Sparkles size={18} color="#D4AF37" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.08em', color: '#D4AF37', textTransform: 'uppercase' }}>
                    Daily Vedic Blessing
                  </span>
                </div>

                <blockquote style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  color: 'rgba(255, 248, 234, 0.9)'
                }}>
                  "May divine peace, health, and spiritual abundance guide your sacred pilgrimage and blessed family. Om Namah Shivaya."
                </blockquote>

                <div style={{
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase' }}>
                    Abhijit Muhurat Today
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#FFF8EA', fontWeight: 600, marginTop: '0.15rem' }}>
                    11:48 AM – 12:36 PM
                  </div>
                </div>
              </div>

              {/* DEVOTEE PILGRIMAGE ASSISTANCE */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #EADBCA',
                borderRadius: '18px',
                padding: '1.35rem 1.5rem',
                boxShadow: '0 4px 15px rgba(52, 31, 29, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <HelpCircle size={18} color="#8C6036" />
                  <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#2A1715', margin: 0 }}>
                    Devotee Support & Priest Desk
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#7A6258', margin: '0 0 0.85rem 0', lineHeight: 1.45 }}>
                  Need custom VIP seva arrangement or special priest assistance? Our devotee desk is here 24/7.
                </p>
                <button
                  onClick={() => onGoToContact ? onGoToContact() : (window.location.href = '/contact')}
                  style={{
                    width: '100%',
                    background: 'rgba(200, 169, 106, 0.12)',
                    border: '1.2px solid #C8A96A',
                    color: '#6E4D2C',
                    padding: '0.55rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Contact Support Desk
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: MY BOOKINGS & SEVAS TAB (Filterable & Actionable View) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.3rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A1715', margin: '0 0 0.25rem 0' }}>
                  My Sacred Bookings & Passes
                </h2>
                <p style={{ fontSize: '0.86rem', color: '#7A6258', margin: 0 }}>
                  Real-time persistent bookings belonging to <strong>{userEmail}</strong>
                </p>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {[
                  { id: 'all', label: `All (${userBookings.length})` },
                  { id: 'darshan', label: 'Darshan Passes' },
                  { id: 'pooja', label: 'Pooja & Sevas' },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setBookingFilter(filter.id)}
                    style={{
                      background: bookingFilter === filter.id ? 'linear-gradient(135deg, #C8A96A 0%, #967432 100%)' : '#FFFFFF',
                      color: bookingFilter === filter.id ? '#FFFFFF' : '#6E4D2C',
                      border: `1.2px solid ${bookingFilter === filter.id ? '#967432' : '#EADBCA'}`,
                      borderRadius: '20px',
                      padding: '0.4rem 0.95rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List / Empty State */}
            {isLoadingBookings ? (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #EADBCA' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>⏳</div>
                <div style={{ color: '#8C6036', fontWeight: 700 }}>Retrieving your bookings from database...</div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #EADBCA',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                color: '#7A6258'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛕</div>
                <h3 style={{ fontSize: '1.2rem', color: '#2A1715', margin: '0 0 0.5rem 0' }}>
                  {bookingFilter === 'all' ? 'No Bookings Found' : `No ${bookingFilter} bookings found`}
                </h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                  Start your sacred pilgrimage by booking a priority Darshan slot or ordering a sacred Pooja / Seva.
                </p>
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onOpenBooking ? onOpenBooking() : (window.location.href = '/quick-booking')}
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                      color: '#1A0F0E',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.65rem 1.4rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Book Darshan
                  </button>
                  <button
                    onClick={() => onGoToServices ? onGoToServices() : (window.location.href = '/services')}
                    style={{
                      background: 'rgba(200, 169, 106, 0.15)',
                      border: '1.2px solid #C8A96A',
                      color: '#6E4D2C',
                      borderRadius: '10px',
                      padding: '0.65rem 1.4rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Book Pooja / Seva
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {filteredBookings.map((booking) => {
                  const bRef = booking.bookingReference || booking.bookingId || booking._id;
                  const isDarshan = (booking.bookingType || 'DARSHAN').toUpperCase() === 'DARSHAN';
                  const isCancelled = (booking.bookingStatus || booking.status || '').toUpperCase() === 'CANCELLED';

                  return (
                    <div
                      key={bRef}
                      style={{
                        background: '#FFFFFF',
                        border: '1.5px solid #EADBCA',
                        borderRadius: '16px',
                        padding: '1.35rem 1.6rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.2rem',
                        boxShadow: '0 4px 18px rgba(52, 31, 29, 0.03)',
                        opacity: isCancelled ? 0.75 : 1
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 800, color: '#8C6036' }}>
                            {bRef}
                          </span>
                          
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.55rem',
                            borderRadius: '10px',
                            background: isDarshan ? 'rgba(200, 169, 106, 0.18)' : 'rgba(217, 130, 43, 0.18)',
                            color: isDarshan ? '#8C6036' : '#C05621'
                          }}>
                            {isDarshan ? '🛕 DARSHAN' : '🙏 POOJA / SEVA'}
                          </span>

                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.6rem',
                            borderRadius: '12px',
                            background: isCancelled ? 'rgba(217, 48, 37, 0.12)' : (booking.bookingStatus === 'COMPLETED' ? 'rgba(0,0,0,0.06)' : 'rgba(46, 125, 50, 0.12)'),
                            color: isCancelled ? '#D93025' : (booking.bookingStatus === 'COMPLETED' ? '#666' : '#2E7D32')
                          }}>
                            {booking.bookingStatus || booking.status || 'CONFIRMED'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#2A1715', margin: '0 0 0.25rem 0' }}>
                          {booking.templeName || booking.temple || 'Sacred Temple'}
                        </h3>
                        
                        <div style={{ fontSize: '0.85rem', color: '#7A6258', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
                          <MapPin size={14} color="#8C6036" />
                          <span>{booking.location || 'Tamil Nadu, India'}</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: '#4A2C28' }}>
                          <span><strong>Pass / Seva:</strong> {booking.darshanType || booking.serviceName || 'Special Darshan'}</span>
                          <span><strong>Date:</strong> {booking.bookingDate}</span>
                          <span><strong>Time:</strong> {booking.bookingTime || booking.timeSlot || 'Slot Confirmed'}</span>
                          <span><strong>Devotee:</strong> {booking.devoteeName || booking.customerName || displayName}</span>
                          <span><strong>Devotees:</strong> {booking.numberOfPeople || booking.devoteesCount || 1} Person(s)</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A1715' }}>
                          ₹{(booking.amount || booking.totalAmount || 0).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setSelectedTicket(booking)}
                            style={{
                              background: 'rgba(200, 169, 106, 0.15)',
                              border: '1.2px solid #C8A96A',
                              color: '#6E4D2C',
                              padding: '0.5rem 0.95rem',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <Eye size={14} />
                            <span>View Pass</span>
                          </button>
                          
                          <button
                            onClick={() => handleGetDirections(booking.location || booking.templeName)}
                            style={{
                              background: '#FFFFFF',
                              border: '1.2px solid #EADBCA',
                              color: '#7A6258',
                              padding: '0.5rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Directions
                          </button>

                          {!isCancelled && (
                            <button
                              disabled={cancellingBookingId === bRef}
                              onClick={() => handleCancelBooking(booking)}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid rgba(217, 48, 37, 0.3)',
                                color: '#D93025',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="Cancel this booking"
                            >
                              {cancellingBookingId === bRef ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: SAVED TEMPLES WISHLIST TAB                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === 'wishlist' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.3rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2A1715', margin: '0 0 0.25rem 0' }}>
                  Your Saved Temples & Sacred Wishlist
                </h2>
                <p style={{ fontSize: '0.86rem', color: '#7A6258', margin: 0 }}>
                  Sacred shrines bookmarked for future pilgrimages
                </p>
              </div>

              <button
                onClick={() => onExploreTemples ? onExploreTemples() : (window.location.href = '/explore')}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                  color: '#1A0F0E',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem 1.2rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Explore More Temples
              </button>
            </div>

            {savedTemples.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #EADBCA',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                color: '#7A6258'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❤️</div>
                <h3 style={{ fontSize: '1.2rem', color: '#2A1715', margin: '0 0 0.5rem 0' }}>
                  No Saved Temples Yet
                </h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                  Explore Tamil Nadu's sacred temples and tap the heart icon to save them to your pilgrimage wishlist.
                </p>
                <button
                  onClick={() => onExploreTemples ? onExploreTemples() : (window.location.href = '/explore')}
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                    color: '#1A0F0E',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.65rem 1.4rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Explore Temples Catalog
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.3rem' }}>
                {savedTemples.map((temple) => (
                  <div
                    key={temple.id || temple._id || temple.name}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #EADBCA',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 18px rgba(52, 31, 29, 0.03)'
                    }}
                  >
                    <div style={{ height: '170px', position: 'relative', background: '#F0E6D8' }}>
                      {temple.image ? (
                        <img src={temple.image} alt={temple.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                          🛕
                        </div>
                      )}
                      
                      <button
                        onClick={() => removeSavedTemple(temple.id || temple._id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          color: '#E53E3E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                        }}
                        title="Remove from saved wishlist"
                      >
                        <Heart size={16} fill="#E53E3E" />
                      </button>
                    </div>

                    <div style={{ padding: '1.2rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2A1715', margin: '0 0 0.25rem 0' }}>
                        {temple.name}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#7A6258', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.85rem' }}>
                        <MapPin size={13} color="#8C6036" />
                        <span>{temple.location || 'Tamil Nadu, India'}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => onOpenBooking ? onOpenBooking() : (window.location.href = '/quick-booking')}
                          style={{
                            flex: 1.2,
                            background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                            color: '#1A0F0E',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.55rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Book Darshan
                        </button>
                        <button
                          onClick={() => onExploreTemples ? onExploreTemples() : (window.location.href = '/explore')}
                          style={{
                            flex: 1,
                            background: 'rgba(200, 169, 106, 0.12)',
                            border: '1px solid #C8A96A',
                            color: '#6E4D2C',
                            borderRadius: '8px',
                            padding: '0.55rem',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </main>

      {/* ─── PROFILE & DEVOTEE SETTINGS MODAL ─── */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsProfileModalOpen(false); setIsEditingProfile(false); }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(18, 9, 8, 0.75)',
                backdropFilter: 'blur(6px)'
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '470px',
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1.5px solid #EADBCA',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
                padding: '2rem',
                zIndex: 10000,
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <button
                onClick={() => { setIsProfileModalOpen(false); setIsEditingProfile(false); }}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '66px',
                  height: '66px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #9B7536 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  margin: '0 auto 0.75rem auto',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 4px 15px rgba(155, 117, 54, 0.3)',
                  overflow: 'hidden'
                }}>
                  {user?.avatar && user.avatar.length > 2 && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                    <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    userAvatarInitial
                  )}
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2A1715', margin: '0 0 0.25rem 0' }}>
                  {displayName}
                </h2>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#2E7D32',
                  background: 'rgba(46, 125, 50, 0.1)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '12px'
                }}>
                  <ShieldCheck size={13} />
                  <span>{isGoogleVerified ? 'Google Account Verified' : 'Email Verified Account'}</span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#8C6036', marginBottom: '0.35rem' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={isEditingProfile ? editName : displayName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.2px solid #EADBCA',
                        fontSize: '0.92rem',
                        background: isEditingProfile ? '#FFFFFF' : '#FAF6F0',
                        color: '#2A1715',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#8C6036', marginBottom: '0.35rem' }}>
                      Email Address (Verified)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={userEmail}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.2px solid #EDE1D2',
                        fontSize: '0.92rem',
                        background: '#FAF6F0',
                        color: '#7A6258',
                        cursor: 'not-allowed',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#8C6036', marginBottom: '0.35rem' }}>
                      Phone / Mobile
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditingProfile}
                      placeholder="+91 98765 43210"
                      value={isEditingProfile ? editPhone : (user?.phone || user?.mobile || 'Not provided')}
                      onChange={(e) => setEditPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.2px solid #EADBCA',
                        fontSize: '0.92rem',
                        background: isEditingProfile ? '#FFFFFF' : '#FAF6F0',
                        color: '#2A1715',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#8C6036', marginBottom: '0.35rem' }}>
                        Username
                      </label>
                      <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', background: '#FAF6F0', border: '1.2px solid #EDE1D2', fontSize: '0.88rem', color: '#4A2C28', fontWeight: 600 }}>
                        @{user?.username || displayName.toLowerCase().replace(/\s+/g, '')}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#8C6036', marginBottom: '0.35rem' }}>
                        Auth Provider
                      </label>
                      <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', background: '#FAF6F0', border: '1.2px solid #EDE1D2', fontSize: '0.88rem', color: '#4A2C28', fontWeight: 600 }}>
                        {isGoogleVerified ? 'Google OAuth' : 'Local / OTP'}
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                  {isEditingProfile ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        style={{
                          flex: 1,
                          padding: '0.65rem',
                          borderRadius: '10px',
                          border: '1.2px solid #EADBCA',
                          background: '#FFFFFF',
                          color: '#7A6258',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          flex: 1.5,
                          padding: '0.65rem',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                          color: '#1A0F0E',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: '10px',
                        border: '1.2px solid #C8A96A',
                        background: 'rgba(200, 169, 106, 0.12)',
                        color: '#6E4D2C',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Edit3 size={15} /> Edit Personal Information
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(234, 67, 53, 0.25)',
                      background: 'rgba(234, 67, 53, 0.08)',
                      color: '#D93025',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <LogOut size={15} /> Sign Out of Darshan Journey
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DIGITAL PILGRIMAGE BOOKING TICKET MODAL ─── */}
      <AnimatePresence>
        {selectedTicket && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(18, 9, 8, 0.75)',
                backdropFilter: 'blur(6px)'
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '500px',
                background: '#FFFFFF',
                borderRadius: '22px',
                border: '1.5px solid #C8A96A',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
                padding: '2rem',
                zIndex: 10000,
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                <X size={18} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🕉️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2A1715', margin: '0 0 0.15rem 0' }}>
                  {((selectedTicket.bookingType || 'DARSHAN').toUpperCase() === 'DARSHAN') ? 'Sacred Darshan Entry Pass' : 'Temple Pooja & Seva Confirmation'}
                </h3>
                <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 800, color: '#8C6036' }}>
                  REF: {selectedTicket.bookingReference || selectedTicket.bookingId || selectedTicket._id}
                </div>
              </div>

              <div style={{
                background: '#FAF6F0',
                borderRadius: '14px',
                border: '1px solid #E6D8C5',
                padding: '1.2rem',
                marginBottom: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.88rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#8C6036', fontWeight: 700, textTransform: 'uppercase' }}>Temple & Shrine</div>
                  <div style={{ fontWeight: 800, color: '#2A1715', fontSize: '1rem' }}>{selectedTicket.templeName || selectedTicket.temple || 'Sacred Temple'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#7A6258' }}>{selectedTicket.location || 'Tamil Nadu, India'}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px dashed #DCC8B3' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#8C6036', fontWeight: 700, textTransform: 'uppercase' }}>Date & Slot</div>
                    <div style={{ fontWeight: 700, color: '#2A1715' }}>{selectedTicket.bookingDate}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7A6258' }}>{selectedTicket.bookingTime || selectedTicket.timeSlot || 'Slot Confirmed'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#8C6036', fontWeight: 700, textTransform: 'uppercase' }}>Booking Type</div>
                    <div style={{ fontWeight: 700, color: '#2A1715' }}>{selectedTicket.darshanType || selectedTicket.serviceName || 'Special Darshan'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7A6258' }}>{selectedTicket.numberOfPeople || selectedTicket.devoteesCount || 1} Devotee(s)</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px dashed #DCC8B3' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#8C6036', fontWeight: 700, textTransform: 'uppercase' }}>Devotee Name</div>
                    <div style={{ fontWeight: 700, color: '#2A1715' }}>{selectedTicket.devoteeName || selectedTicket.customerName || displayName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#7A6258' }}>{selectedTicket.mobile || selectedTicket.customerMobile || ''}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#8C6036', fontWeight: 700, textTransform: 'uppercase' }}>Payment & Status</div>
                    <div style={{ fontWeight: 800, color: '#2E7D32' }}>₹{(selectedTicket.amount || selectedTicket.totalAmount || 0).toLocaleString()} • {selectedTicket.paymentStatus || 'PAID'}</div>
                    <div style={{ fontSize: '0.78rem', color: '#8C6036', fontWeight: 700 }}>{selectedTicket.bookingStatus || selectedTicket.status || 'CONFIRMED'}</div>
                  </div>
                </div>

                <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed #DCC8B3', fontSize: '0.78rem', color: '#5C443C', lineHeight: 1.4 }}>
                  <strong>Pilgrimage Guidelines:</strong> {selectedTicket.instructions || 'Please arrive 15 minutes prior to your scheduled slot. Carry a government photo ID.'}
                </div>
              </div>

              {/* Scannable Verification QR */}
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <div style={{ display: 'inline-block', padding: '0.4rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E6D8C5' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`DARSHAN-JOURNEY|REF:${selectedTicket.bookingReference || selectedTicket.bookingId || selectedTicket._id}|TEMPLE:${selectedTicket.templeName || selectedTicket.temple}|DATE:${selectedTicket.bookingDate}|DEVOTEES:${selectedTicket.numberOfPeople || selectedTicket.devoteesCount || 1}`)}&color=341F1D&bgcolor=FFFFFF&margin=4&format=png`}
                    alt="Ticket QR Code"
                    width={130}
                    height={130}
                    style={{ display: 'block' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8C6036', marginTop: '0.3rem', fontWeight: 600 }}>
                  Scan at Sacred Sanctum Gate
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => {
                    showToast(`🎫 Pass ${selectedTicket.bookingReference || selectedTicket.bookingId || selectedTicket._id} printed.`);
                    window.print();
                  }}
                  style={{
                    flex: 1.5,
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B88E4C 100%)',
                    color: '#1A0F0E',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.65rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Printer size={15} /> Print / Save E-Pass
                </button>
                <button
                  onClick={() => handleGetDirections(selectedTicket.location || selectedTicket.templeName)}
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    border: '1.2px solid #C8A96A',
                    color: '#6E4D2C',
                    borderRadius: '10px',
                    padding: '0.65rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Open Maps
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              background: 'rgba(28, 18, 13, 0.95)',
              border: '1px solid #D4AF37',
              color: '#FFF8EA',
              padding: '0.85rem 1.4rem',
              borderRadius: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Sparkles size={18} color="#D4AF37" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FOOTER ─── */}
      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToContact={onGoToContact}
      />
    </div>
  );
}
