import React from 'react';
import logoImg from '../assets/darshan-logo.jpeg';


export default function Footer({ onGoToHome, onExploreTemples, onGoToProducts, onOpenBooking }) {
  const handleLinkClick = (e, action, sectionId) => {
    e.preventDefault();
    if (action) {
      action();
      return;
    }
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand with Logo above DARSHAN JOURNEY title */}
          <div className="footer-brand-box">
            <img src={logoImg} alt="Darshan Journey Temple Logo" className="footer-logo-img" />
            <h3 className="footer-brand-title">DARSHAN JOURNEY</h3>
            <p className="footer-tagline">Spiritual Temple Experience</p>
            <p className="footer-desc">
              Dedicated to preserving ancient Vedic heritage, spreading spiritual wisdom, and providing a peaceful sanctuary for all devotees across Tamil Nadu.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a 
                  href="/home" 
                  className="footer-link" 
                  onClick={(e) => handleLinkClick(e, onGoToHome, 'hero')}
                >
                  Home Page
                </a>
              </li>
              <li>
                <a 
                  href="/explore" 
                  className="footer-link" 
                  onClick={(e) => handleLinkClick(e, onExploreTemples, null)}
                >
                  Explore Temples
                </a>
              </li>
              <li>
                <a 
                  href="/products" 
                  className="footer-link" 
                  onClick={(e) => handleLinkClick(e, onGoToProducts, null)}
                >
                  Vendor Products
                </a>
              </li>
              <li>
                <a 
                  href="#booking" 
                  className="footer-link" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenBooking) onOpenBooking();
                  }}
                >
                  Quick Booking
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="footer-link"
                  onClick={(e) => handleLinkClick(e, onGoToHome, 'contact')}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Daily Darshan Timings */}
          <div>
            <h4 className="footer-heading">Daily Darshan Timings</h4>
            <div className="timing-list">
              <div className="timing-item">
                <span className="timing-label">Mangala Aarti</span>
                <span className="timing-val">5:30 AM</span>
              </div>
              <div className="timing-item">
                <span className="timing-label">Madhyanha Pooja</span>
                <span className="timing-val">12:00 PM</span>
              </div>
              <div className="timing-item">
                <span className="timing-label">Sandhya Aarti</span>
                <span className="timing-val">7:00 PM</span>
              </div>
              <div className="timing-item">
                <span className="timing-label">Shayan Aarti</span>
                <span className="timing-val">9:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Darshan Journey Temple. All Rights Reserved. Designed with Spiritual Elegance.</p>
        </div>
      </div>
    </footer>
  );
}
