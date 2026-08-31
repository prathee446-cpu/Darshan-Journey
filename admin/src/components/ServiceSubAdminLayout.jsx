import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Library, Tag, BookOpen, User, 
  LogOut, Menu, X, Bell, Globe, Calendar, ShieldCheck, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import darshanLogo from '../../../src/assets/darshan-logo.png';
import darshanLogoJpeg from '../../../src/assets/darshan-logo.jpeg';
import { getCurrentUser, clearUserSession } from '../utils/auth';

export default function ServiceSubAdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Priya Sundaram',
    email: 'priya@darshanjourney.com',
    role: 'SERVICE_SUB_ADMIN',
    serviceName: 'Pooja Service',
    temple: 'Kapaleeshwarar Temple — Chennai'
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      };
      setCurrentTime(new Date().toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearUserSession();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/sub-admin/service/dashboard', icon: LayoutDashboard },
    { name: 'My Service', path: '/sub-admin/service/details', icon: Library },
    { name: 'Subcategories', path: '/sub-admin/service/subcategories', icon: Tag },
    { name: 'Bookings', path: '/sub-admin/service/bookings', icon: BookOpen },
    { name: 'Profile', path: '/sub-admin/service/profile', icon: User },
  ];

  const isSelected = (path) => {
    if (path === '/sub-admin/service/dashboard') {
      return location.pathname === '/sub-admin/service/dashboard' || location.pathname === '/sub-admin/service';
    }
    return location.pathname.startsWith(path);
  };

  const getPageTitle = () => {
    const active = navItems.find(item => isSelected(item.path));
    return active ? active.name : 'Service Sanctum Operations';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--admin-bg-dark)' }}>
      {/* DESKTOP RESTRICTED SIDEBAR (260px) */}
      <aside 
        style={{
          width: '260px',
          backgroundColor: 'var(--admin-bg-sidebar)',
          borderRight: '1px solid rgba(214, 181, 109, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0
        }}
        className="desktop-sidebar"
      >
        {/* Brand Header */}
        <div 
          style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid rgba(214, 181, 109, 0.12)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8rem' 
          }}
        >
          <img 
            src={darshanLogo} 
            alt="Logo" 
            style={{ 
              height: '40px', 
              width: '40px', 
              borderRadius: '50%', 
              border: '1.5px solid var(--admin-gold)' 
            }}
            onError={(e) => { e.target.src = darshanLogoJpeg; }}
          />
          <div>
            <span className="serif-title" style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#FFFDF9', display: 'block', letterSpacing: '0.05em' }}>
              Darshan Journey
            </span>
            <span className="serif-title" style={{ fontSize: '0.65rem', color: '#8EAE68', letterSpacing: '0.12em', display: 'block', fontWeight: '600' }}>
              SERVICE SUB-ADMIN
            </span>
          </div>
        </div>

        {/* Assigned Service Scope Pill */}
        <div style={{ padding: '0.85rem 1rem 0.2rem' }}>
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(142, 174, 104, 0.15) 0%, rgba(200, 155, 75, 0.1) 100%)',
              border: '1px solid rgba(142, 174, 104, 0.3)',
              borderRadius: '8px',
              padding: '0.65rem 0.75rem',
            }}
          >
            <div style={{ fontSize: '0.65rem', color: 'rgba(214, 181, 109, 0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
              Assigned Sanctum
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#FFFDF9', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {currentUser.serviceName || 'Pooja Service'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              🛕 {currentUser.temple || 'Kapaleeshwarar Temple — Chennai'}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav 
          style={{ 
            flex: 1, 
            padding: '1rem 0.75rem', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.65rem', fontWeight: '700', color: 'rgba(214, 181, 109, 0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Service Management
          </div>

          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const selected = isSelected(item.path);
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  backgroundColor: selected ? 'rgba(142, 174, 104, 0.18)' : 'transparent',
                  color: selected ? '#FFFDF9' : 'var(--admin-text-muted)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  fontWeight: selected ? '600' : '400',
                  transition: 'all 0.25s ease',
                  borderLeft: selected ? '3px solid #8EAE68' : '3px solid transparent',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.color = '#FFFDF9';
                    e.currentTarget.style.backgroundColor = 'rgba(214, 181, 109, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.color = 'var(--admin-text-muted)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <ActiveIcon 
                  size={18} 
                  style={{ 
                    color: selected ? '#8EAE68' : 'rgba(214, 181, 109, 0.45)',
                    transition: 'color 0.25s' 
                  }} 
                />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Sub-Admin Info */}
        <div 
          style={{ 
            padding: '1.25rem', 
            borderTop: '1px solid rgba(214, 181, 109, 0.12)',
            backgroundColor: 'rgba(18, 9, 7, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div 
              className="flex-center"
              style={{ 
                height: '38px', 
                width: '38px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(142, 174, 104, 0.2)',
                border: '1px solid #8EAE68',
                color: '#8EAE68',
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}
            >
              {(currentUser.name || 'P').charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#FFFDF9', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {currentUser.name || 'Service In-Charge'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#8EAE68', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: '500' }}>
                🟢 Service In-Charge
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {currentUser.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid rgba(192, 90, 78, 0.3)',
              backgroundColor: 'rgba(192, 90, 78, 0.05)',
              color: 'var(--admin-danger)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(192, 90, 78, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(192, 90, 78, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(192, 90, 78, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(192, 90, 78, 0.3)';
            }}
          >
            <LogOut size={14} />
            Logout Operations
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 40 }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                width: '270px',
                backgroundColor: 'var(--admin-bg-sidebar)',
                borderRight: '1px solid rgba(214, 181, 109, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50
              }}
            >
              <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(214, 181, 109, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img src={darshanLogo} alt="Logo" style={{ height: '36px', width: '36px', borderRadius: '50%' }} onError={(e) => { e.target.src = darshanLogoJpeg; }} />
                  <div>
                    <span className="serif-title" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFFDF9' }}>Darshan Journey</span>
                    <span style={{ fontSize: '0.62rem', color: '#8EAE68', display: 'block' }}>Service Sub-Admin</span>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--admin-cream)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <nav style={{ flex: 1, padding: '1rem 0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {navItems.map((item) => {
                  const ActiveIcon = item.icon;
                  const selected = isSelected(item.path);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        backgroundColor: selected ? 'rgba(142, 174, 104, 0.18)' : 'transparent',
                        color: selected ? '#FFFDF9' : 'var(--admin-text-muted)',
                        fontSize: '0.88rem',
                        borderLeft: selected ? '3px solid #8EAE68' : '3px solid transparent',
                      }}
                    >
                      <ActiveIcon size={16} style={{ color: selected ? '#8EAE68' : 'rgba(214, 181, 109, 0.45)' }} />
                      {item.name}
                    </button>
                  );
                })}
              </nav>

              <div style={{ padding: '1rem', borderTop: '1px solid rgba(214, 181, 109, 0.12)' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(192, 90, 78, 0.3)',
                    backgroundColor: 'rgba(192, 90, 78, 0.05)',
                    color: 'var(--admin-danger)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: '600'
                  }}
                >
                  <LogOut size={12} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER CONTENT VIEWPORT */}
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          marginLeft: '260px',
          minWidth: 0 
        }}
        className="main-layout-wrapper"
      >
        {/* HEADER */}
        <header 
          style={{
            height: '70px',
            borderBottom: '1px solid rgba(214, 181, 109, 0.15)',
            backgroundColor: 'var(--admin-bg-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
          className="admin-header"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--admin-cream)', cursor: 'pointer', display: 'none' }}
              className="mobile-sidebar-toggle"
            >
              <Menu size={22} />
            </button>
            
            <h1 className="serif-title" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFFDF9', letterSpacing: '0.04em' }}>
              {getPageTitle()}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            {/* Scoped Service Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(142, 174, 104, 0.12)',
                border: '1px solid rgba(142, 174, 104, 0.4)',
                borderRadius: '20px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#8EAE68',
                whiteSpace: 'nowrap'
              }}
            >
              <ShieldCheck size={13} />
              <span>
                {currentUser.serviceName || 'Pooja Service'} · {currentUser.temple || 'Kapaleeshwarar Temple'}
              </span>
            </div>

            {/* Public Website Button */}
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(200, 155, 75, 0.12)',
                border: '1px solid rgba(214, 181, 109, 0.3)',
                borderRadius: '6px',
                color: 'var(--admin-gold)',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(200, 155, 75, 0.25)';
                e.currentTarget.style.color = '#FFFDF9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(200, 155, 75, 0.12)';
                e.currentTarget.style.color = 'var(--admin-gold)';
              }}
            >
              <Globe size={14} />
              <span>Public Site</span>
            </button>

            {/* Clock Widget */}
            <div 
              className="header-clock"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: 'var(--admin-text-muted)', 
                fontSize: '0.82rem',
                borderRight: '1px solid rgba(214, 181, 109, 0.15)',
                paddingRight: '1.2rem'
              }}
            >
              <Calendar size={14} style={{ color: 'var(--admin-gold)' }} />
              <span>{currentTime}</span>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main style={{ flex: 1, backgroundColor: 'var(--admin-bg-dark)', padding: '1.5rem' }}>
          {children || <Outlet />}
        </main>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .desktop-sidebar {
            display: none !important;
          }
          .main-layout-wrapper {
            margin-left: 0 !important;
          }
          .mobile-sidebar-toggle {
            display: block !important;
          }
          .header-clock {
            display: none !important;
          }
          .admin-header {
            padding: 0 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
