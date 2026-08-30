import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, LogOut, Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/exact_darshan_logo.png';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  activePage = 'home',
  onGoToHome,
  onGoToLanding,
  onExploreTemples,
  onGoToServices,
  onGoToProducts,
  onGoToLogin,
  onGoToAbout,
  onGoToContact,
  onGoToDashboard,
  onOpenBooking,
  onOpenDonate
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authContext = useAuth();
  const user = authContext?.user;
  const logout = authContext?.logout;
  const navTo = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = (e, page, sectionId, action) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);

    if (action) {
      action();
      return;
    }

    if (page === 'home') {
      if (onGoToHome) onGoToHome();
      else navTo('/home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (sectionId) {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
      return;
    }

    if (page === 'services' || page === 'products') {
      if (onGoToServices) onGoToServices();
      else if (onGoToProducts) onGoToProducts();
      else navTo('/services');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'explore') {
      if (onExploreTemples) onExploreTemples();
      else navTo('/explore');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'login') {
      if (onGoToLogin) onGoToLogin();
      else navTo('/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'about') {
      if (onGoToAbout) onGoToAbout();
      else navTo('/about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'contact') {
      if (onGoToContact) onGoToContact();
      else navTo('/contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'dashboard') {
      if (onGoToDashboard) onGoToDashboard();
      else navTo('/dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'booking' || page === 'quick-booking') {
      if (onOpenBooking) onOpenBooking();
      else navTo('/quick-booking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        if (onGoToHome) onGoToHome();
        else navTo('/home');
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  };

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsMobileMenuOpen(false);
    if (logout) {
      logout();
    }
    navTo('/login');
  };

  // Helper for rendering devotee avatar initial or image
  const renderAvatarContent = (size = 28) => {
    if (user?.avatar && user.avatar.length > 2 && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))) {
      return (
        <img
          src={user.avatar}
          alt={user.name || 'Devotee'}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      );
    }
    const initial = (user?.name || user?.fullName || (user?.email ? user.email.charAt(0) : 'D')).toUpperCase().charAt(0);
    return initial;
  };

  const displayName = user?.name || user?.fullName || (user?.email ? user.email.split('@')[0] : 'Devotee');

  return (
    <>
      <header className={`navbar darshan-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner darshan-nav-container">
          {/* 1. LEFT: Temple Logo & Brand */}
          <a
            href="/"
            className="nav-logo darshan-nav-logo"
            onClick={(e) => handleLinkClick(e, 'home', null, onGoToHome)}
            title="Darshan Journey - Sacred Temple Pilgrimage"
          >
            <img src={logoImg} alt="Darshan Journey" className="nav-logo-img darshan-nav-logo-img" />
            <span className="nav-logo-text darshan-nav-logo-text">DARSHAN JOURNEY</span>
          </a>

          {/* 2. CENTER: Main Navigation Links (Desktop) */}
          <nav className="darshan-nav-center" aria-label="Main Navigation">
            <ul className="nav-menu darshan-nav-links">
              <li>
                <a
                  href="/"
                  className={`nav-link darshan-nav-item ${activePage === 'home' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'home', 'hero', onGoToHome)}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className={`nav-link darshan-nav-item ${activePage === 'about' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'about', null, onGoToAbout)}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className={`nav-link darshan-nav-item ${activePage === 'services' || activePage === 'products' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'services', null, onGoToServices || onGoToProducts)}
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="/quick-booking"
                  className={`nav-link darshan-nav-item ${activePage === 'booking' || activePage === 'quick-booking' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'booking', null, onOpenBooking)}
                >
                  Quick Booking
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className={`nav-link darshan-nav-item ${activePage === 'contact' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'contact', null, onGoToContact)}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          {/* 3. RIGHT: Actions (Donate + Auth / User Profile + Mobile Toggle) */}
          <div className="darshan-nav-actions">
            {/* Donate Button */}
            <button
              type="button"
              className="btn-donate darshan-btn-donate"
              onClick={() => onOpenDonate && onOpenDonate()}
              title="Support Sacred Temple Sevas"
            >
              <Heart size={15} className="darshan-donate-heart" fill="#C8A96A" />
              <span>Donate</span>
            </button>

            {/* Authenticated Devotee Profile Pill / Login Link */}
            {user ? (
              <div className="darshan-user-auth-group">
                <a
                  href="/dashboard"
                  className={`darshan-user-profile-pill ${activePage === 'dashboard' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'dashboard', null, onGoToDashboard)}
                  title={`Devotee Dashboard — ${displayName}`}
                >
                  <span className="darshan-user-avatar-badge">
                    {renderAvatarContent(26)}
                  </span>
                  <span className="darshan-user-name-text">
                    {displayName}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out of Darshan Journey"
                  className="darshan-nav-logout-btn"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className={`darshan-nav-login-btn ${activePage === 'login' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'login', null, onGoToLogin)}
              >
                <User size={15} />
                <span>Login</span>
              </a>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <button
              type="button"
              className="darshan-nav-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* 4. MOBILE & TABLET SLIDING DRAWER MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="darshan-mobile-menu-portal">
            {/* Backdrop */}
            <motion.div
              className="darshan-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sliding Drawer */}
            <motion.div
              className="darshan-mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              {/* Drawer Top Header */}
              <div className="darshan-mobile-drawer-header">
                <div className="darshan-mobile-brand">
                  <img src={logoImg} alt="Darshan Journey" className="darshan-mobile-logo-img" />
                  <span className="darshan-mobile-logo-text">DARSHAN JOURNEY</span>
                </div>
                <button
                  type="button"
                  className="darshan-mobile-close-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Devotee Profile Card inside Drawer (if logged in) */}
              {user ? (
                <div
                  className="darshan-mobile-user-card"
                  onClick={(e) => handleLinkClick(e, 'dashboard', null, onGoToDashboard)}
                >
                  <div className="darshan-mobile-user-avatar">
                    {renderAvatarContent(44)}
                  </div>
                  <div className="darshan-mobile-user-meta">
                    <div className="darshan-mobile-user-name">
                      {user.name || user.fullName || 'Devotee'}
                    </div>
                    <div className="darshan-mobile-user-email">
                      {user.email || 'Sacred Devotee Account'}
                    </div>
                    <div className="darshan-mobile-user-badge">
                      <Sparkles size={11} color="#D4AF37" />
                      <span>Open My Dashboard</span>
                      <ChevronRight size={12} color="#D4AF37" />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Navigation Links List */}
              <ul className="darshan-mobile-links-list">
                <li>
                  <a
                    href="/"
                    className={`darshan-mobile-nav-link ${activePage === 'home' ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, 'home', null, onGoToHome)}
                  >
                    <span>Home</span>
                    <ChevronRight size={16} className="darshan-mobile-arrow" />
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className={`darshan-mobile-nav-link ${activePage === 'about' ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, 'about', null, onGoToAbout)}
                  >
                    <span>About Us</span>
                    <ChevronRight size={16} className="darshan-mobile-arrow" />
                  </a>
                </li>
                <li>
                  <a
                    href="/services"
                    className={`darshan-mobile-nav-link ${activePage === 'services' || activePage === 'products' ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, 'services', null, onGoToServices || onGoToProducts)}
                  >
                    <span>Services</span>
                    <ChevronRight size={16} className="darshan-mobile-arrow" />
                  </a>
                </li>
                <li>
                  <a
                    href="/quick-booking"
                    className={`darshan-mobile-nav-link ${activePage === 'booking' || activePage === 'quick-booking' ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, 'booking', null, onOpenBooking)}
                  >
                    <span>Quick Booking</span>
                    <ChevronRight size={16} className="darshan-mobile-arrow" />
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className={`darshan-mobile-nav-link ${activePage === 'contact' ? 'active' : ''}`}
                    onClick={(e) => handleLinkClick(e, 'contact', null, onGoToContact)}
                  >
                    <span>Contact Us</span>
                    <ChevronRight size={16} className="darshan-mobile-arrow" />
                  </a>
                </li>
                {user && (
                  <li>
                    <a
                      href="/dashboard"
                      className={`darshan-mobile-nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
                      onClick={(e) => handleLinkClick(e, 'dashboard', null, onGoToDashboard)}
                    >
                      <span>My Dashboard & Bookings</span>
                      <ChevronRight size={16} className="darshan-mobile-arrow" />
                    </a>
                  </li>
                )}
              </ul>

              {/* Drawer Bottom Actions */}
              <div className="darshan-mobile-drawer-footer">
                <button
                  type="button"
                  className="btn-donate darshan-btn-donate darshan-mobile-full-donate"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDonate && onOpenDonate();
                  }}
                >
                  <Heart size={16} fill="#C8A96A" />
                  <span>Donate for Temple Sevas</span>
                </button>

                {user ? (
                  <button
                    type="button"
                    className="darshan-mobile-signout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <a
                    href="/login"
                    className="darshan-mobile-login-action-btn"
                    onClick={(e) => handleLinkClick(e, 'login', null, onGoToLogin)}
                  >
                    <User size={16} />
                    <span>Devotee Sign In / Register</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
