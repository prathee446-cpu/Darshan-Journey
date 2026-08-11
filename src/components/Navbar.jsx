import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, User, LogOut } from 'lucide-react';
import logoImg from '../assets/darshan-logo.jpeg';

export default function Navbar({ 
  activePage = 'home',
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToLogin,
  onGoToContact,
  onOpenBooking, 
  onOpenDonate 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Load initial user session
    const storedUser = localStorage.getItem('darshan_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        setUser(null);
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('darshan_user');
    setUser(null);
  };

  const handleLinkClick = (e, page, sectionId, action) => {
    e.preventDefault();
    if (action) {
      action();
      return;
    }

    if (page === 'home' && onGoToHome) {
      onGoToHome();
      if (sectionId) {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }

    if (page === 'products' && onGoToProducts) {
      onGoToProducts();
      return;
    }

    if (page === 'explore' && onExploreTemples) {
      onExploreTemples();
      return;
    }

    if (page === 'contact' && onGoToContact) {
      onGoToContact();
      return;
    }

    if (page === 'login' && onGoToLogin) {
      onGoToLogin();
      return;
    }

    if (sectionId) {
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

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-inner">
          {/* Left: Temple Logo */}
          <a 
            href="/home" 
            className="nav-logo" 
            onClick={(e) => handleLinkClick(e, 'home', null, onGoToHome)}
          >
            <img src={logoImg} alt="Darshan Journey Temple" className="nav-logo-img" />
            <span className="nav-logo-text">DARSHAN JOURNEY</span>
          </a>

          {/* Center: Perfectly Centered Navigation Links with Equal Spacing */}
          <ul className="nav-menu">
            <li>
              <a 
                href="/home" 
                className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'home', 'hero', onGoToHome)}
              >
                Home
              </a>
            </li>
            <li>
              <a 
                href="#calendar" 
                className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'home', 'calendar', null)}
              >
                About Us
              </a>
            </li>
            <li>
              <a 
                href="/products" 
                className={`nav-link ${activePage === 'products' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'products', null, onGoToProducts)}
              >
                Products
              </a>
            </li>
            <li>
              <a 
                href="#booking" 
                className={`nav-link ${activePage === 'booking' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenBooking) onOpenBooking();
                }}
              >
                Quick Booking
              </a>
            </li>
            <li>
              <Link 
                to="/contact" 
                className={`nav-link ${activePage === 'contact' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'contact', null, onGoToContact)}
              >
                Contact Us
              </Link>
            </li>
            {user ? (
              <li className="nav-user-item">
                <div className="nav-user-badge">
                  <div className="nav-user-avatar">
                    {user.avatar || user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="nav-user-name">{user.name}</span>
                  <button 
                    type="button" 
                    className="nav-logout-btn" 
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </li>
            ) : (
              <li>
                <Link 
                  to="/login" 
                  className={`nav-link ${activePage === 'login' ? 'active' : ''}`}
                  onClick={(e) => {
                    if (onGoToLogin) {
                      e.preventDefault();
                      onGoToLogin();
                    }
                  }}
                >
                  Login
                </Link>
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
