import React from 'react';
import logoImg from '../assets/darshan-logo.jpeg';


export default function Footer({ 
  onGoToHome, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToServices, 
  onGoToAbout, 
  onGoToContact,
  onOpenBooking 
}) {
  const handleLinkClick = (e, action, fallbackUrl) => {
    e.preventDefault();
    if (action) {
      action();
      return;
    }
    if (fallbackUrl) {
      window.history.pushState({}, '', fallbackUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer id="footer" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Brand with Logo */}
          <div className="footer-brand-box">
            <img src={logoImg} alt="Darshan Journey Temple Logo" className="footer-logo-img" />
            <h3 className="footer-brand-title">DARSHAN JOURNEY</h3>
            <p className="footer-tagline">Spiritual Temple Experience</p>
            <p className="footer-desc">
              Dedicated to preserving ancient Vedic heritage, spreading spiritual wisdom, and providing a peaceful sanctuary for all devotees.
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
                  onClick={(e) => handleLinkClick(e, onGoToHome, '/home')}
                >
                  Home Page
                </a>
              </li>
              <li>
                <a 
                  href="/about" 
                  className="footer-link" 
                  onClick={(e) => handleLinkClick(e, onGoToAbout, '/about')}
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/explore" 
                  className="footer-link" 
                  onClick={(e) => handleLinkClick(e, onExploreTemples, '/explore')}
                >
                  Explore Temples
                </a>
              </li>
              <li>
                <a 
                  href="/services" 
                  className="footer-link" 
                  onClick={(e) => handleLinkClick(e, onGoToServices || onGoToProducts, '/services')}
                >
                  Vendor Services
                </a>
              </li>
              <li>
                <a 
                  href="/quick-booking" 
                  className="footer-link" 
                  onClick={(e) => handleLinkClick(e, onOpenBooking, '/quick-booking')}
                >
                  Quick Booking
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="footer-link"
                  onClick={(e) => handleLinkClick(e, onGoToContact, null)}
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
