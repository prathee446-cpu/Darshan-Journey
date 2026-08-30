import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Calendar, Sparkles, Heart, Shield, CheckCircle2, 
  Clock, LogOut, Settings, MapPin, ExternalLink, Bell, Edit3, 
  BookOpen, ChevronRight, Award, Compass, Ticket, Phone, ArrowLeft,
  Flame, Sun, Star, Navigation, PlusCircle
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import GoldParticles from './GoldParticles';
import darshanLogo from '../assets/darshan-logo.jpeg';
import { useAuth } from '../context/AuthContext';

export default function UserDashboardPage({ 
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToLogin,
  onGoToContact,
  onOpenBooking,
  onOpenDonate 
}) {
  const { user: authUser, updateUser, logout } = useAuth();

  // Default fallback user state
  const defaultUser = {
    name: 'Devotee',
    email: 'devotee@darshanjourney.com',
    avatar: 'D',
    membership: 'Devotee Member',
    provider: 'email'
  };

  const [user, setUser] = useState(authUser || defaultUser);
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState(null);

  // Editable Profile State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(authUser?.name || authUser?.fullName || 'Devotee');
  const [editPhone, setEditPhone] = useState(authUser?.phone || authUser?.mobile || '');
  const [editAvatar, setEditAvatar] = useState(authUser?.avatar || '');
  const [editPassword, setEditPassword] = useState('');

  // Sample User Bookings Data
  const [userBookings, setUserBookings] = useState([
    {
      id: 'DJ-28491',
      temple: 'Arulmigu Meenakshi Sundareswarar Temple',
      location: 'Madurai, Tamil Nadu',
      type: 'Special VIP Darshan',
      date: '18 August 2026',
      time: '10:30 AM – 11:00 AM',
      devotees: 2,
      status: 'Confirmed',
      price: '₹500'
    },
    {
      id: 'SEVA-2026-3109',
      temple: 'Brihadeeswarar Temple (Big Temple)',
      location: 'Thanjavur, Tamil Nadu',
      type: 'Maha Rudrabhishekam Seva',
      date: '24 August 2026',
      time: '06:00 AM - 07:30 AM',
      devotees: 1,
      status: 'Upcoming',
      price: '₹1,200'
    },
    {
      id: 'PUJA-2026-1042',
      temple: 'Ramanathaswamy Temple',
      location: 'Rameswaram, Tamil Nadu',
      type: 'Agni Theertham Holy Bath & Puja',
      date: '12 July 2026',
      time: '05:00 AM - 06:30 AM',
      devotees: 4,
      status: 'Completed',
      price: '₹800'
    }
  ]);

  // Sample Saved Temples Data
  const [savedTemples, setSavedTemples] = useState([
    {
      id: 'meenakshi',
      name: 'Meenakshi Amman Temple',
      location: 'Madurai, Tamil Nadu',
      deity: 'Goddess Meenakshi & Lord Sundareswarar',
      rating: '4.9',
      reviews: '2,450',
      image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'ranganathaswamy',
      name: 'Ranganathaswamy Temple',
      location: 'Srirangam, Tamil Nadu',
      deity: 'Lord Ranganatha (Vishnu)',
      rating: '4.8',
      reviews: '1,890',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'brihadeeswarar',
      name: 'Brihadeeswarar Temple',
      location: 'Thanjavur, Tamil Nadu',
      deity: 'Lord Shiva (Peruvudaiyar)',
      rating: '4.9',
      reviews: '3,120',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281358?q=80&w=800&auto=format&fit=crop'
    }
  ]);

  // Sample Explore Temples
  const exploreTemplesList = [
    {
      id: 'meenakshi-exp',
      name: 'Meenakshi Amman Temple',
      location: 'Madurai',
      rating: '4.9',
      reviews: '2.4k',
      image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'ranganathaswamy-exp',
      name: 'Ranganathaswamy Temple',
      location: 'Srirangam',
      rating: '4.8',
      reviews: '1.8k',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'brihadeeswarar-exp',
      name: 'Brihadeeswarar Temple',
      location: 'Thanjavur',
      rating: '4.9',
      reviews: '3.1k',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281358?q=80&w=800&auto=format&fit=crop'
    }
  ];

  // Recent Activity Items
  const recentActivities = [
    {
      date: '18 Aug',
      icon: '🛕',
      title: 'Darshan booked',
      details: 'Meenakshi Amman Temple',
      type: 'booking'
    },
    {
      date: '12 Aug',
      icon: '🙏',
      title: 'Seva completed',
      details: 'Special Pooja',
      type: 'seva'
    },
    {
      date: '08 Aug',
      icon: '❤️',
      title: 'Temple saved',
      details: 'Srirangam Temple',
      type: 'saved'
    }
  ];

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setEditName(authUser.name || authUser.fullName || 'Devotee');
      setEditPhone(authUser.phone || authUser.mobile || '');
      setEditAvatar(authUser.avatar || '');
    }
  }, [authUser]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('darshan_user');
    }
    showToast('Signed out successfully.');
    setTimeout(() => {
      if (onGoToLogin) onGoToLogin();
      else if (onGoToHome) onGoToHome();
    }, 600);
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    if (!user) return;

    const cleanName = editName.trim() || user.name || 'Devotee';
    const cleanPhone = editPhone.trim();

    const updatedUser = {
      ...user,
      name: cleanName,
      fullName: cleanName,
      phone: cleanPhone,
      mobile: cleanPhone
    };

    if (updateUser) {
      updateUser({
        fullName: cleanName,
        phone: cleanPhone,
        mobile: cleanPhone
      });
    } else {
      localStorage.setItem('darshan_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    setIsEditProfileModalOpen(false);
    setEditPassword('');
    showToast('✅ Profile updated successfully!');
  };

  const removeSavedTemple = (templeId) => {
    setSavedTemples(prev => prev.filter(t => t.id !== templeId));
    showToast('Temple removed from saved wishlist.');
  };

  const handleGetDirections = (location) => {
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="home-website-wrapper" style={{ background: 'linear-gradient(135deg, #FAF4EC 0%, #F5EBE0 50%, #EFE1D1 100%)', minHeight: '100vh', color: '#341F1D', fontFamily: 'Plus Jakarta Sans, sans-serif', position: 'relative' }}>
      
      {/* Navigation Bar */}
      <Navbar 
        activePage="dashboard"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToLogin={onGoToLogin}
        onGoToContact={onGoToContact}
        onOpenBooking={onOpenBooking}
        onOpenDonate={onOpenDonate}
      />

      {/* Main Dashboard Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '110px 1.5rem 60px 1.5rem', position: 'relative', zIndex: 2 }}>
        
        {/* 1. User Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
            borderRadius: '24px',
            border: '1.5px solid #D8C3A5',
            padding: '2rem 2.2rem',
            marginBottom: '2rem',
            boxShadow: '0 16px 45px rgba(138, 98, 48, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(200, 169, 106, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* User Avatar Circle */}
              <div style={{
                width: '82px',
                height: '82px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C8A96A 0%, #967432 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                fontWeight: '800',
                border: '3px solid #FFFFFF',
                boxShadow: '0 8px 25px rgba(150, 116, 50, 0.3)',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {user?.avatar && user.avatar.length > 2 ? (
                  <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.avatar || (user?.name ? user.name.charAt(0).toUpperCase() : 'D')
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.85rem', fontWeight: 700, color: '#5C3D1E', margin: 0 }}>
                    {user?.name || user?.fullName || 'Devotee'}
                  </h1>
                  <span style={{
                    background: 'rgba(200, 169, 106, 0.18)',
                    border: '1px solid rgba(200, 169, 106, 0.4)',
                    color: '#8C6036',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <Shield size={12} color="#8C6036" /> {user?.provider === 'google' ? 'Google Verified' : 'Email Verified'}
                  </span>
                </div>

                <div style={{ color: '#5E4939', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={15} color="#8C6036" /> {user?.email || 'devotee@darshanjourney.com'}
                </div>

                <div style={{ marginTop: '0.45rem', color: '#8C6036', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                  <Award size={15} color="#C8A96A" /> Devotee Member
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setIsEditProfileModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF, #FAF4EC)',
                  border: '1.5px solid #C8A96A',
                  color: '#6E4D2C',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '14px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(166, 134, 66, 0.08)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Edit3 size={16} color="#8C6036" /> Edit Profile
              </button>

              <button 
                onClick={handleLogout}
                style={{
                  background: 'rgba(234, 67, 53, 0.08)',
                  border: '1.5px solid rgba(234, 67, 53, 0.25)',
                  color: '#D93025',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '14px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* 2. Statistics Cards (4 Columns) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.2rem',
          marginBottom: '1.8rem'
        }}>
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -4 }}
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
              border: '1.5px solid #E6D4BE',
              borderRadius: '20px',
              padding: '1.35rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              boxShadow: '0 10px 30px rgba(110, 77, 44, 0.06)'
            }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(200, 169, 106, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C6036', flexShrink: 0 }}>
              <Ticket size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#5C3D1E', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
                2
              </div>
              <div style={{ fontSize: '0.88rem', color: '#5C3D1E', fontWeight: 700, marginTop: '0.2rem' }}>
                Upcoming Darshans
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8C6036', fontWeight: 500, marginTop: '0.15rem' }}>
                1 Confirmed • 1 Scheduled
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -4 }}
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
              border: '1.5px solid #E6D4BE',
              borderRadius: '20px',
              padding: '1.35rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              boxShadow: '0 10px 30px rgba(110, 77, 44, 0.06)'
            }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(200, 140, 50, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B87333', flexShrink: 0 }}>
              <Flame size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#5C3D1E', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
                5
              </div>
              <div style={{ fontSize: '0.88rem', color: '#5C3D1E', fontWeight: 700, marginTop: '0.2rem' }}>
                Completed Sevas
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8C6036', fontWeight: 500, marginTop: '0.15rem' }}>
                Pujas & Abhishekams
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -4 }}
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
              border: '1.5px solid #E6D4BE',
              borderRadius: '20px',
              padding: '1.35rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              boxShadow: '0 10px 30px rgba(110, 77, 44, 0.06)'
            }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#967432', flexShrink: 0 }}>
              <Sun size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#5C3D1E', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
                14 Days
              </div>
              <div style={{ fontSize: '0.88rem', color: '#5C3D1E', fontWeight: 700, marginTop: '0.2rem' }}>
                Darshan Streak
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8C6036', fontWeight: 500, marginTop: '0.15rem' }}>
                Active Devotion
              </div>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            whileHover={{ y: -4 }}
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
              border: '1.5px solid #E6D4BE',
              borderRadius: '20px',
              padding: '1.35rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              boxShadow: '0 10px 30px rgba(110, 77, 44, 0.06)'
            }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(217, 48, 37, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C84B31', flexShrink: 0 }}>
              <Heart size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#5C3D1E', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
                3
              </div>
              <div style={{ fontSize: '0.88rem', color: '#5C3D1E', fontWeight: 700, marginTop: '0.2rem' }}>
                Saved Temples
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8C6036', fontWeight: 500, marginTop: '0.15rem' }}>
                In Wishlist
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3. Quick Actions Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8C6036', marginBottom: '0.75rem' }}>
            Quick Actions
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.9rem'
          }}>
            <button
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else showToast('🛕 Booking portal opening...');
              }}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                border: '1.5px solid #D8C3A5',
                borderRadius: '16px',
                padding: '0.95rem 1.2rem',
                color: '#5C3D1E',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 15px rgba(110, 77, 44, 0.05)',
                transition: 'all 0.25s ease'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🛕</span> Book Darshan
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                border: '1.5px solid #D8C3A5',
                borderRadius: '16px',
                padding: '0.95rem 1.2rem',
                color: '#5C3D1E',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 15px rgba(110, 77, 44, 0.05)',
                transition: 'all 0.25s ease'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🙏</span> My Sevas
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                border: '1.5px solid #D8C3A5',
                borderRadius: '16px',
                padding: '0.95rem 1.2rem',
                color: '#5C3D1E',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 15px rgba(110, 77, 44, 0.05)',
                transition: 'all 0.25s ease'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>❤️</span> Saved Temples
            </button>

            <button
              onClick={() => {
                if (onExploreTemples) onExploreTemples();
                else showToast('🧭 Opening Temple Explorer...');
              }}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                border: '1.5px solid #D8C3A5',
                borderRadius: '16px',
                padding: '0.95rem 1.2rem',
                color: '#5C3D1E',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 15px rgba(110, 77, 44, 0.05)',
                transition: 'all 0.25s ease'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🧭</span> Explore Temples
            </button>
          </div>
        </div>

        {/* 9. Cohesive Navigation Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.6rem',
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1.5px solid #D8C3A5',
          borderRadius: '16px',
          padding: '6px',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(110, 77, 44, 0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: Compass },
            { id: 'bookings', label: 'My Bookings & Sevas', icon: Ticket },
            { id: 'wishlist', label: 'Saved Temples', icon: Heart }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #C8A96A 0%, #967432 100%)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: isActive ? '#FFFFFF' : '#6E4D2C',
                  padding: '0.8rem 1rem',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 14px rgba(150, 116, 50, 0.3)' : 'none',
                  transition: 'all 0.25s ease'
                }}
              >
                <Icon size={18} color={isActive ? '#FFFFFF' : '#8C6036'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            
            {/* Top Grid: Main Spotlight + Daily Blessing */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.8rem', marginBottom: '2.5rem' }}>
              
              {/* 4. Upcoming Darshan — Main Focus */}
              <div style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                border: '2px solid #C8A96A',
                borderRadius: '22px',
                padding: '1.8rem',
                boxShadow: '0 12px 35px rgba(138, 98, 48, 0.1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  {/* Card Header & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={22} color="#8C6036" />
                      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#5C3D1E', margin: 0, fontWeight: 700 }}>
                        Next Upcoming Darshan
                      </h3>
                    </div>
                    {/* Confirmed Badge with subtle green treatment */}
                    <span style={{
                      background: 'rgba(46, 125, 50, 0.12)',
                      color: '#2E7D32',
                      border: '1px solid rgba(46, 125, 50, 0.3)',
                      fontSize: '0.78rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '14px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <CheckCircle2 size={13} color="#2E7D32" /> Confirmed
                    </span>
                  </div>

                  {/* Temple Details Box */}
                  <div style={{
                    background: 'rgba(200, 169, 106, 0.08)',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: '1px solid rgba(200, 169, 106, 0.25)',
                    marginBottom: '1.4rem'
                  }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#5C3D1E', fontFamily: 'Playfair Display, serif', marginBottom: '0.5rem' }}>
                      Arulmigu Meenakshi Sundareswarar Temple
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem', color: '#4A332C' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={15} color="#8C6036" />
                        <span><strong>Date & Time:</strong> 18 August 2026 • 10:30 AM – 11:00 AM</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Ticket size={15} color="#8C6036" />
                        <span><strong>Booking ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#8C6036' }}>DJ-28491</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two Action Buttons */}
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      showToast('🎫 E-Ticket DJ-28491 ready for download.');
                      setActiveTab('bookings');
                    }}
                    style={{
                      flex: 1,
                      minWidth: '130px',
                      padding: '0.75rem 1rem',
                      background: 'linear-gradient(135deg, #C8A96A 0%, #967432 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 14px rgba(150, 116, 50, 0.25)'
                    }}
                  >
                    View Booking <ChevronRight size={16} />
                  </button>

                  <button 
                    onClick={() => handleGetDirections('Arulmigu Meenakshi Sundareswarar Temple, Madurai')}
                    style={{
                      flex: 1,
                      minWidth: '130px',
                      padding: '0.75rem 1rem',
                      background: 'rgba(200, 169, 106, 0.12)',
                      color: '#6E4D2C',
                      border: '1.5px solid #C8A96A',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Navigation size={15} color="#8C6036" /> Get Directions
                  </button>
                </div>
              </div>

              {/* 5. Daily Vedic Blessing */}
              <div style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                border: '1.5px solid #E6D4BE',
                borderRadius: '22px',
                padding: '1.8rem',
                boxShadow: '0 10px 30px rgba(110, 77, 44, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
                    <Sparkles size={22} color="#8C6036" />
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#5C3D1E', margin: 0, fontWeight: 700 }}>
                      Daily Vedic Blessing
                    </h3>
                  </div>

                  <blockquote style={{
                    fontStyle: 'italic',
                    color: '#5E4939',
                    borderLeft: '3px solid #C8A96A',
                    paddingLeft: '1.2rem',
                    margin: '0 0 1.5rem 0',
                    lineHeight: 1.65,
                    fontSize: '1.02rem',
                    fontFamily: 'Playfair Display, Georgia, serif'
                  }}>
                    "May divine peace, health, and spiritual abundance light up your home and journey today. Om Namah Shivaya."
                  </blockquote>
                </div>

                <div style={{ background: 'rgba(200, 169, 106, 0.08)', padding: '1rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(200, 169, 106, 0.2)' }}>
                  <div style={{ fontWeight: 700, color: '#5C3D1E', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                    Auspicious Tithi & Time
                  </div>
                  <div style={{ color: '#6E5351', fontSize: '0.82rem' }}>
                    Abhijit Muhurat: 11:48 AM – 12:36 PM • Favorable for Temple Sevas & Prayer
                  </div>
                </div>
              </div>

            </div>

            {/* 6. Recent Activity Section */}
            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
              border: '1.5px solid #E6D4BE',
              borderRadius: '22px',
              padding: '1.8rem',
              marginBottom: '2.5rem',
              boxShadow: '0 10px 30px rgba(110, 77, 44, 0.06)'
            }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: '#5C3D1E', margin: '0 0 1.2rem 0', fontWeight: 700 }}>
                Recent Activity
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {recentActivities.map((act, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid #EFE1D1',
                      borderRadius: '14px'
                    }}
                  >
                    <div style={{
                      minWidth: '55px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#8C6036',
                      background: 'rgba(200, 169, 106, 0.12)',
                      padding: '0.3rem 0.5rem',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      {act.date}
                    </div>

                    <div style={{ fontSize: '1.3rem', flexShrink: 0 }}>
                      {act.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#5C3D1E' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#6E5351' }}>
                        {act.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Explore Temples Section */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#5C3D1E', margin: 0, fontWeight: 700 }}>
                  Explore Temples
                </h3>
                <button 
                  onClick={onExploreTemples}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8C6036',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  View All Temples <ChevronRight size={16} />
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {exploreTemplesList.map(temple => (
                  <div 
                    key={temple.id}
                    style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                      border: '1.5px solid #E6D4BE',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(110, 77, 44, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                        <img 
                          src={temple.image} 
                          alt={temple.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#5C3D1E',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <Star size={13} fill="#C8A96A" color="#C8A96A" /> {temple.rating} ({temple.reviews})
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#5C3D1E', margin: '0 0 0.35rem 0', fontFamily: 'Playfair Display, serif' }}>
                          {temple.name}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: '#6E5351', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} color="#8C6036" /> {temple.location}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem 1.25rem 1.25rem 1.25rem' }}>
                      <button 
                        onClick={onExploreTemples}
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          background: 'linear-gradient(135deg, #C8A96A 0%, #967432 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(150, 116, 50, 0.2)'
                        }}
                      >
                        View Temple
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: MY BOOKINGS & SEVAS */}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.45rem', color: '#5C3D1E', marginBottom: '1.5rem' }}>
              Your Sacred Temple Bookings
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {userBookings.map((b) => (
                <div 
                  key={b.id}
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                    border: '1.5px solid #E6D4BE',
                    borderRadius: '18px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: '0 8px 24px rgba(110, 77, 44, 0.05)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#8C6036', fontWeight: 700, fontFamily: 'monospace' }}>{b.id}</span>
                      <span style={{
                        background: b.status === 'Confirmed' ? 'rgba(46, 125, 50, 0.12)' : b.status === 'Upcoming' ? 'rgba(251, 188, 5, 0.18)' : 'rgba(0, 0, 0, 0.05)',
                        color: b.status === 'Confirmed' ? '#2E7D32' : b.status === 'Upcoming' ? '#B8860B' : '#6E5351',
                        border: '1px solid currentColor',
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '10px',
                        fontWeight: 700
                      }}>
                        {b.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#5C3D1E', margin: '0 0 0.3rem 0', fontFamily: 'Playfair Display, serif' }}>
                      {b.temple}
                    </h4>

                    <div style={{ fontSize: '0.88rem', color: '#6E5351', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#8C6036" /> {b.location}
                    </div>

                    <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#5C3D1E' }}>
                      <span><strong>Pass Type:</strong> {b.type}</span>
                      <span><strong>Date:</strong> {b.date}</span>
                      <span><strong>Devotees:</strong> {b.devotees}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5C3D1E', fontFamily: 'Playfair Display, serif' }}>
                      {b.price}
                    </div>
                    <button 
                      onClick={() => showToast(`🎫 E-Ticket ${b.id} ready for download.`)}
                      style={{
                        background: 'rgba(200, 169, 106, 0.15)',
                        border: '1.5px solid #C8A96A',
                        color: '#6E4D2C',
                        padding: '0.55rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Ticket size={15} color="#8C6036" /> Pass Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: SAVED TEMPLES */}
        {activeTab === 'wishlist' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.45rem', color: '#5C3D1E', marginBottom: '1.5rem' }}>
              Your Saved Sacred Temples
            </h2>

            {savedTemples.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6E5351', background: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E6D4BE' }}>
                No saved temples yet. Explore temples and add them to your sacred wishlist!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {savedTemples.map((temple) => (
                  <div 
                    key={temple.id}
                    style={{
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF4EC 100%)',
                      border: '1.5px solid #E6D4BE',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(110, 77, 44, 0.05)'
                    }}
                  >
                    <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                      <img src={temple.image} alt={temple.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        onClick={() => removeSavedTemple(temple.id)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.85)',
                          border: 'none',
                          color: '#EA4335',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        title="Remove from saved"
                      >
                        <Heart size={16} fill="#EA4335" />
                      </button>
                    </div>

                    <div style={{ padding: '1.2rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#5C3D1E', margin: '0 0 0.3rem 0', fontFamily: 'Playfair Display, serif' }}>
                        {temple.name}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: '#6E5351', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                        <MapPin size={14} color="#8C6036" /> {temple.location}
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                        <button 
                          onClick={onExploreTemples}
                          style={{
                            flex: 1,
                            padding: '0.55rem',
                            background: 'linear-gradient(135deg, #C8A96A 0%, #967432 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(150, 116, 50, 0.2)'
                          }}
                        >
                          Virtual Darshan
                        </button>
                        <button 
                          onClick={() => {
                            if (onOpenBooking) onOpenBooking();
                            else showToast('Book Seva modal active');
                          }}
                          style={{
                            flex: 1,
                            padding: '0.55rem',
                            background: 'rgba(200, 169, 106, 0.15)',
                            color: '#6E4D2C',
                            border: '1.5px solid #C8A96A',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Book Seva
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
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
        }}>
          <Sparkles size={18} color="#D4AF37" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsEditProfileModalOpen(false)} style={{ zIndex: 99999 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', padding: '2rem', borderRadius: '20px', background: '#FFFFFF', border: '1.5px solid #D8C3A5', boxShadow: '0 20px 60px rgba(110, 77, 44, 0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(200, 169, 106, 0.18)',
                  color: '#8C6036',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto',
                  border: '1.5px solid #C8A96A'
                }}
              >
                <User size={26} />
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#5C3D1E', marginBottom: '0.35rem' }}>
                Edit Your Profile
              </h3>
              <p style={{ color: '#6E5351', fontSize: '0.88rem', margin: 0 }}>
                Update your personal information and spiritual preferences.
              </p>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#8C6036', marginBottom: '0.4rem' }}>
                  Full Name
                </label>
                <input 
                  type="text" 
                  required 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #D8C3A5',
                    outline: 'none',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: '0.95rem',
                    background: '#FFFFFF',
                    color: '#341F1D'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#8C6036', marginBottom: '0.4rem' }}>
                  Email Address (Verified)
                </label>
                <input 
                  type="email" 
                  disabled 
                  value={user?.email || 'ashok@darshanjourney.com'}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #E0D0BE',
                    outline: 'none',
                    fontSize: '0.95rem',
                    background: 'rgba(0, 0, 0, 0.04)',
                    color: '#6E5351',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#8C6036', marginBottom: '0.4rem' }}>
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #D8C3A5',
                    outline: 'none',
                    fontSize: '0.95rem',
                    background: '#FFFFFF',
                    color: '#341F1D'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditProfileModalOpen(false)}
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    borderRadius: '30px', 
                    border: '1.5px solid #D8C3A5', 
                    background: '#FFFFFF', 
                    color: '#6E5351', 
                    fontWeight: 600, 
                    fontSize: '0.9rem', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    flex: 1.6, 
                    padding: '0.75rem', 
                    borderRadius: '30px', 
                    border: 'none', 
                    background: 'linear-gradient(135deg, #C8A96A 0%, #967432 100%)', 
                    color: '#FFFFFF', 
                    fontWeight: 700, 
                    fontSize: '0.9rem', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(150, 116, 50, 0.25)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToContact={onGoToContact}
      />
    </div>
  );
}
