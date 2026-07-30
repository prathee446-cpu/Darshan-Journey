import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import logoImg from '../assets/exact_darshan_logo.png';

export default function Navbar({ 
  activePage = 'home',
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToLogin,
  onGoToAbout,
  onOpenBooking, 
  onOpenDonate 
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    if (page === 'login' && onGoToLogin) {
      onGoToLogin();
      return;
    }

    if (page === 'about') {
      if (onGoToAbout) {
        onGoToAbout();
      } else {
        window.history.pushState({}, '', '/about');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      return;
    }

    if (page === 'booking') {
      if (onOpenBooking) {
        onOpenBooking();
      } else {
        window.history.pushState({}, '', '/quick-booking');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
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
                href="/about" 
                className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'about', null, onGoToAbout)}
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
                href="/quick-booking"
                className={`nav-link ${activePage === 'booking' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'booking', null, onOpenBooking)}
              >
                Quick Booking
              </a>
            </li>
            <li>
              <a 
                href="#footer" 
                className={`nav-link ${activePage === 'contact' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact Us
              </a>
            </li>
            <li>
              <a 
                href="/login" 
                className={`nav-link ${activePage === 'login' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'login', null, onGoToLogin)}
              >
                Login
              </a>
            </li>
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
