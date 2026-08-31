import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Info, Library, ShieldCheck, 
  BookOpen, Users, CreditCard, BarChart3, Image, 
  Settings, LogOut, Menu, X, Bell, Search, Calendar, User, GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import darshanLogo from '../../../src/assets/darshan-logo.png';
import darshanLogoJpeg from '../../../src/assets/darshan-logo.jpeg';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({ name: 'Devotee Admin', email: 'admin@darshanjourney.com', role: 'Super Admin' });

  // Load Admin User metadata
  useEffect(() => {
    const saved = localStorage.getItem('darshan_admin_user') || sessionStorage.getItem('darshan_admin_user');
    if (saved) {
      try {
        setAdminUser(JSON.parse(saved));
      } catch (e) {
        // use default
      }
    }
  }, []);

  // Update real-time clock in header
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
    localStorage.removeItem('darshan_admin_token');
    localStorage.removeItem('darshan_admin_user');
    sessionStorage.removeItem('darshan_admin_token');
    sessionStorage.removeItem('darshan_admin_user');
    navigate('/login');
  };

  // Check if current logged-in user is Super Admin
  const isSuper = (adminUser.role || '').toUpperCase().includes('SUPER');

  // Sidebar Menu Items definition grouped by sections (Sub Admin placed directly above Dashboard)
  const navSections = [
    {
      items: [
        { name: 'Sub Admin', path: '/admin/admin-management', icon: ShieldCheck },
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Services', path: '/admin/services', icon: Library },
        { name: 'Temples', path: '/admin/temples', icon: ShieldCheck },
        { name: 'Bookings', path: '/admin/bookings', icon: BookOpen },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Payments', path: '/admin/payments', icon: CreditCard },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { name: 'Media', path: '/admin/media', icon: Image },
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { name: 'Website Content', path: '/admin/website-content', icon: FileText },
        { name: 'About Us', path: '/admin/about', icon: Info },
      ]
    },
    {
      title: 'MANAGEMENT & GOVERNANCE',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const menuItems = navSections.flatMap(section => section.items);

  // Helper to check if a menu path is currently selected
  const isSelected = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/' || location.pathname === '/admin/dashboard';
    }
    if (path === '/admin/about') {
      return location.pathname === '/admin/about' || location.pathname.startsWith('/admin/about-us');
    }
    if (path === '/admin/admin-management') {
      return location.pathname.startsWith('/admin/admin-management') || location.pathname.startsWith('/admin/sub-admin');
    }
    return location.pathname.startsWith(path);
  };

  // Active page title calculation
  const getPageTitle = () => {
    const activeItem = menuItems.find(item => isSelected(item.path));
    return activeItem ? activeItem.name : 'Operations Board';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--admin-bg-dark)' }}>
      {/* SIDEBAR FOR DESKTOP (Width: 260px) */}
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
        {/* Sidebar Header Brand Logo */}
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
            onError={(e) => {
              e.target.src = darshanLogoJpeg;
            }}
          />
          <div>
            <span className="serif-title" style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#FFFDF9', display: 'block', letterSpacing: '0.05em' }}>
              Darshan Journey
            </span>
            <span className="serif-title" style={{ fontSize: '0.65rem', color: 'var(--admin-gold)', letterSpacing: '0.12em', display: 'block' }}>
              Admin Operations
            </span>
          </div>
        </div>

        {/* Sidebar Menu List */}
        <nav 
          style={{ 
            flex: 1, 
            padding: '1.25rem 0.75rem', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}
        >
          {navSections.map((section, sIdx) => (
            <React.Fragment key={section.title || `section-${sIdx}`}>
              {section.title && (
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '0.85rem 0.75rem 0.35rem', 
                    marginTop: '0.25rem' 
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: '700', 
                      letterSpacing: '0.12em', 
                      color: 'rgba(214, 181, 109, 0.55)', 
                      textTransform: 'uppercase', 
                      fontFamily: 'var(--font-sans)',
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {section.title}
                  </span>
                  <div 
                    style={{ 
                      flex: 1, 
                      height: '1px', 
                      backgroundColor: 'rgba(214, 181, 109, 0.15)' 
                    }} 
                  />
                </div>
              )}
              {section.items.map((item) => {
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
                      backgroundColor: selected ? 'rgba(200, 155, 75, 0.15)' : 'transparent',
                      color: selected ? '#FFFDF9' : 'var(--admin-text-muted)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      fontWeight: selected ? '600' : '400',
                      transition: 'all 0.25s ease',
                      borderLeft: selected ? '3px solid var(--admin-gold)' : '3px solid transparent',
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
                        color: selected ? 'var(--admin-gold)' : 'rgba(214, 181, 109, 0.45)',
                        transition: 'color 0.25s' 
                      }} 
                    />
                    {item.name}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Sidebar Footer Admin Profile & Logout */}
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
                backgroundColor: 'var(--admin-primary-brown)',
                border: '1px solid var(--admin-gold)',
                color: 'var(--admin-gold)',
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}
            >
              {adminUser.name.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#FFFDF9', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {adminUser.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {adminUser.role}
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

      {/* MOBILE SIDEBAR DRAWERS */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#000',
                zIndex: 40
              }}
            />
            {/* Drawer */}
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
              <div 
                style={{ 
                  padding: '1.25rem', 
                  borderBottom: '1px solid rgba(214, 181, 109, 0.12)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'between',
                  gap: '0.5rem' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 }}>
                  <img 
                    src={darshanLogo} 
                    alt="Logo" 
                    style={{ height: '36px', width: '36px', borderRadius: '50%' }}
                    onError={(e) => {
                      e.target.src = darshanLogoJpeg;
                    }}
                  />
                  <div>
                    <span className="serif-title" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFFDF9', display: 'block' }}>
                      Darshan Journey
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-cream)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer navigation */}
              <nav style={{ flex: 1, padding: '1rem 0.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {navSections.map((section, sIdx) => (
                  <React.Fragment key={section.title || `mob-section-${sIdx}`}>
                    {section.title && (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem', 
                          padding: '0.75rem 0.5rem 0.25rem', 
                          marginTop: '0.2rem' 
                        }}
                      >
                        <span 
                          style={{ 
                            fontSize: '0.62rem', 
                            fontWeight: '700', 
                            letterSpacing: '0.12em', 
                            color: 'rgba(214, 181, 109, 0.55)', 
                            textTransform: 'uppercase', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {section.title}
                        </span>
                        <div 
                          style={{ 
                            flex: 1, 
                            height: '1px', 
                            backgroundColor: 'rgba(214, 181, 109, 0.15)' 
                          }} 
                        />
                      </div>
                    )}
                    {section.items.map((item) => {
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
                            backgroundColor: selected ? 'rgba(200, 155, 75, 0.15)' : 'transparent',
                            color: selected ? '#FFFDF9' : 'var(--admin-text-muted)',
                            fontSize: '0.88rem',
                            borderLeft: selected ? '3px solid var(--admin-gold)' : '3px solid transparent',
                          }}
                        >
                          <ActiveIcon size={16} style={{ color: selected ? 'var(--admin-gold)' : 'rgba(214, 181, 109, 0.45)' }} />
                          {item.name}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </nav>

              {/* Drawer admin metadata */}
              <div style={{ padding: '1rem', borderTop: '1px solid rgba(214, 181, 109, 0.12)', backgroundColor: 'rgba(18, 9, 7, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div className="flex-center" style={{ height: '34px', width: '34px', borderRadius: '50%', backgroundColor: 'var(--admin-primary-brown)', color: 'var(--admin-gold)', fontWeight: 'bold' }}>
                    {adminUser.name.charAt(0)}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#FFFDF9', display: 'block' }}>{adminUser.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', display: 'block' }}>{adminUser.role}</span>
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

      {/* MAIN CONTAINER CONTENT SECTION */}
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          marginLeft: '260px',
          minWidth: 0 // Prevents layout blowouts inside flex containers
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
          {/* Left panel title & toggle */}
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

          {/* Right panel widgets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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

            {/* Simulated Search bar */}
            <div className="header-search" style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.4)' }} />
              <input 
                type="text"
                placeholder="Search resources..."
                style={{
                  width: '100%',
                  padding: '0.45rem 0.5rem 0.45rem 2rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  border: '1px solid rgba(214, 181, 109, 0.15)',
                  backgroundColor: 'rgba(18, 9, 7, 0.4)'
                }}
              />
            </div>

            {/* Notification bell and simulated dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--admin-text-muted)', 
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFDF9'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--admin-text-muted)'}
              >
                <Bell size={18} />
                <span 
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    height: '7px',
                    width: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--admin-gold)'
                  }}
                />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div 
                      onClick={() => setNotificationsOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 11 }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="glassmorphism"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '32px',
                        width: '280px',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        zIndex: 12,
                        padding: '0.8rem 0',
                        border: '1px solid rgba(214, 181, 109, 0.25)'
                      }}
                    >
                      <div style={{ padding: '0 1rem 0.5rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--admin-gold)' }}>
                        Sacred Notifications (2)
                      </div>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                          <span style={{ display: 'block', fontWeight: '600', color: '#FFFDF9' }}>New Abhishek Puja Booking</span>
                          <span style={{ color: 'var(--admin-text-muted)' }}>Devotee Prathika reserved slot for Kedarnath shrine.</span>
                        </div>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                          <span style={{ display: 'block', fontWeight: '600', color: '#FFFDF9' }}>System Backup Completed</span>
                          <span style={{ color: 'var(--admin-text-muted)' }}>Weekly operations archive generated successfully.</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* WORKSPACE PAGES CONTENT VIEWPORT */}
        <main style={{ flex: 1, backgroundColor: 'var(--admin-bg-dark)', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>

      {/* Embedded CSS rules specifically to override layout for small screens responsive design */}
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
          .header-search {
            width: 140px !important;
          }
          .admin-header {
            padding: 0 1rem !important;
          }
        }
        @media (max-width: 480px) {
          .header-search {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
