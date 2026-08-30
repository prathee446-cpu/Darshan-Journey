import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, LogOut } from 'lucide-react';
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
  const authContext = useAuth();
  const user = authContext?.user;
  const logout = authContext?.logout;
  const navTo = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, page, sectionId, action) => {
    if (action) {
      e.preventDefault();
      action();
      return;
    }

    if (page === 'home') {
      if (onGoToHome) {
        e.preventDefault();
        onGoToHome();
        if (sectionId) {
          setTimeout(() => {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
      return;
    }

    if (page === 'services' || page === 'products') {
      if (onGoToServices) {
        e.preventDefault();
        onGoToServices();
      } else if (onGoToProducts) {
        e.preventDefault();
        onGoToProducts();
      }
      return;
    }

    if (page === 'explore' && onExploreTemples) {
      e.preventDefault();
      onExploreTemples();
      return;
    }

    if (page === 'login' && onGoToLogin) {
      e.preventDefault();
      onGoToLogin();
      return;
    }

    if (page === 'about' && onGoToAbout) {
      e.preventDefault();
      onGoToAbout();
      return;
    }

    if (page === 'contact' && onGoToContact) {
      e.preventDefault();
      onGoToContact();
      return;
    }

    if (page === 'dashboard' && onGoToDashboard) {
      e.preventDefault();
      onGoToDashboard();
      return;
    }

    if (page === 'booking') {
      if (onOpenBooking) {
        e.preventDefault();
        onOpenBooking();
      }
      return;
    }

    if (sectionId) {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (onGoToHome) {
        onGoToHome();
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (logout) {
      logout();
    } else {
      localStorage.removeItem('darshan_user');
    }
    navTo('/login');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-inner">
          {/* Left: Temple Logo */}
          <a
            href="/"
            className="nav-logo"
            onClick={(e) => handleLinkClick(e, 'home', null, onGoToHome)}
          >
            <img src={logoImg} alt="Darshan Journey Temple" className="nav-logo-img" />
            <span className="nav-logo-text">DARSHAN JOURNEY</span>
          </a>

          {/* Center: Navigation Links */}
          <ul className="nav-menu">
            <li>
              <a
                href="/"
                className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'home', 'hero', onGoToHome)}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'about', null, onGoToAbout)}
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/services"
                className={`nav-link ${activePage === 'products' || activePage === 'services' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'services', null, onGoToServices || onGoToProducts)}
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="/quick-booking"
                className={`nav-link ${activePage === 'booking' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'booking', null, onOpenBooking)}
              >
                Quick Booking
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className={`nav-link ${activePage === 'contact' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'contact', null, onGoToContact)}
              >
                Contact Us
              </a>
            </li>
            {user ? (
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <a
                  href="/dashboard"
                  className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'dashboard', null, onGoToDashboard)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #C8A96A, #A37F3D)',
                      color: '#2A1715',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'D')}
                  </span>
                  <span>{user.name || 'Profile'}</span>
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(247, 239, 230, 0.7)',
                    cursor: 'pointer',
                    padding: '0.2rem 0.4rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e06c75'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(247, 239, 230, 0.7)'}
                >
                  <LogOut size={15} />
                </button>
              </li>
            ) : (
              <li>
                <a
                  href="/login"
                  className={`nav-link ${activePage === 'login' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'login', null, onGoToLogin)}
                >
                  Login
                </a>
              </li>
            )}
          </ul>

          {/* Right: Donate Button */}
          <button className="btn-donate" onClick={() => onOpenDonate && onOpenDonate()}>
            <Heart size={16} fill="#C8A96A" /> Donate
          </button>
        </div>
      </div>
    </nav>
  );
}

