import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, User, LogOut } from 'lucide-react';
import logoImg from '../assets/darshan-logo.jpeg';

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
  onOpenBooking, 
  onOpenDonate 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const checkUser = () => {
      const savedUser = localStorage.getItem('darshan_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('darshan_user');
    setUser(null);
  };

  const handleLinkClick = (e, targetNav, sectionId, customAction) => {
    if (customAction) {
      e.preventDefault();
      customAction();
      return;
    }

    if (activePage === 'home' && sectionId) {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (activePage !== 'home') {
      if (onGoToHome) {
        e.preventDefault();
        onGoToHome();
        setTimeout(() => {
          if (sectionId) {
            const element = document.getElementById(sectionId);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        {/* Left: Uploaded Darshan Journey Golden Logo */}
        <a 
          href="/home" 
          className="nav-logo" 
          onClick={(e) => handleLinkClick(e, 'home', 'hero', onGoToHome)}
        >
          <img src={logoImg} alt="Darshan Journey Logo" className="nav-logo-img" />
          <div className="nav-logo-text">
            <span className="logo-title">DARSHAN JOURNEY</span>
            <span className="logo-sub">SPIRITUAL TEMPLE EXPERIENCE</span>
          </div>
        </a>

        {/* Center: Navigation Links */}
        <ul className="nav-links">
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
            <Link 
              to="/about" 
              className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(e, 'about', null, onGoToAbout)}
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/explore" 
              className={`nav-link ${activePage === 'explore' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(e, 'explore', null, onExploreTemples)}
            >
              Explore Temples
            </Link>
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
                  {user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                </div>
                <span className="nav-user-name">{user.name || user.fullName || 'Devotee'}</span>
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
    </nav>
  );
}
