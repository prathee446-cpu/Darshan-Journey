import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import logoImg from '../assets/darshan-logo.jpeg';

export default function Navbar({ 
  activePage = 'home',
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToServices, 
  onGoToLogin,
  onGoToAbout,
  onGoToContact,
  onOpenBooking, 
  onOpenDonate 
}) {
  const [isScrolled, setIsScrolled] = useState(false);

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

    if (page === 'services' && onGoToServices) {
      onGoToServices();
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

    if (page === 'contact') {
      if (onGoToContact) {
        onGoToContact();
      } else {
        window.history.pushState({}, '', '/contact');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
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
      <div className="navbar-inner">
        {/* Left: Uploaded Darshan Journey Golden Logo */}
        <a 
          href="/home" 
          className="nav-logo" 
          onClick={(e) => handleLinkClick(e, 'home', null, onGoToHome)}
        >
          <img src={logoImg} alt="Darshan Journey Logo" className="nav-logo-img" />
        </a>

        {/* Center: Navigation Items */}
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
              href="/services" 
              className={`nav-link ${activePage === 'services' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(e, 'services', null, onGoToServices)}
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
        </ul>

        {/* Right: Donate Button */}
        <button className="btn-donate" onClick={() => onOpenDonate && onOpenDonate()}>
          <Heart size={16} fill="#C8A96A" /> Donate
        </button>
      </div>
    </nav>
  );
}
