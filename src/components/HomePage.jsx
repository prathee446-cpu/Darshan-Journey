import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Sparkles, 
  Heart, 
  Clock, 
  MapPin, 
  ArrowRight, 
  X, 
  ChevronRight, 
  Flame, 
  Gift, 
  Sun, 
  Flower2, 
  CheckCircle2 
} from 'lucide-react';
import logoImg from '../assets/darshan-logo.jpeg';

import heroBg from '../assets/temple_hero_bg.png';
import TempleCalendar from './TempleCalendar';
import Navbar from './Navbar';
import ContactSection from './ContactSection';
import Footer from './Footer';

export default function HomePage({ onGoToLanding, onExploreTemples, onGoToProducts, onGoToLogin, onGoToBlog }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [readBlog, setReadBlog] = useState(null);

  const handleBlogClick = (slug) => {
    if (onGoToBlog) {
      onGoToBlog(slug);
    } else {
      window.location.href = `/blogs/${slug}`;
    }
  };

  // Handle transparent to dark brown navbar transformation on scroll
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

  const handleNavClick = (navName, sectionId) => {
    setActiveNav(navName);
    if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePlaceholderNav = (menuName) => {
    alert(`Navigating to ${menuName} (Placeholder for Demo). You are currently exploring the active Home Page.`);
  };

  return (
    <div className="home-website-wrapper">
      {/* ---------------- NAVBAR ---------------- */}
      <Navbar 
        activePage="home"
        onGoToHome={() => handleNavClick('home', 'hero')}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToLogin={onGoToLogin}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenDonate={() => setIsDonateOpen(true)}
      />


      {/* ---------------- HERO SECTION ---------------- */}
      <section id="hero" className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img 
              src={logoImg} 
              alt="Darshan Journey Logo" 
              style={{ 
                height: '85px', 
                width: 'auto', 
                filter: 'drop-shadow(0 0 14px rgba(200, 169, 106, 0.5)) drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
                objectFit: 'contain'
              }} 
            />
          </div>
          <span className="hero-subtitle-tag">WELCOME TO OUR TEMPLE</span>
          <h1 className="hero-heading">Experience Divine Peace & Spiritual Heritage</h1>
          <p className="hero-desc">
            Immerse yourself in sacred traditions, daily Vedic rituals, virtual darshan, and timeless temple heritage. Step into an oasis of peace and devotion.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={onExploreTemples}>
              Explore Temple <ArrowRight size={18} />
            </button>
            <button className="btn-outline" onClick={() => setIsBookingOpen(true)}>
              Book Darshan
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- 2. ARTICLES & BLOGS ---------------- */}
      <section id="blogs" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">SPIRITUAL WISDOM & GUIDES</span>
            <h2 className="section-title">Articles & Blogs</h2>
            <p className="section-desc">
              Discover the latest temple news, spiritual insights, travel guides, and devotional articles.
            </p>
          </div>

          <div className="blogs-grid">
            {/* Article Card 1 */}
            <div className="blog-card" style={{ cursor: 'pointer' }} onClick={() => handleBlogClick('gopuram-geometry-vastu')}>
              <div className="blog-img-box">
                <img src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80" alt="Temple Architecture" className="blog-img" />
                <span className="blog-tag">HERITAGE & VASTU</span>
              </div>
              <div className="blog-body">
                <div className="blog-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>AUG 12, 2026 • 5 MIN READ</span>
                  <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>By Acharya Sundaram</span>
                </div>
                <h3 className="blog-title">The Sacred Geometry & Vastu of Indian Gopuram Towers</h3>
                <p className="blog-snippet">
                  Discover how ancient Dravidian and Nagara temple architecture channels cosmic energy through geometric alignment and stone acoustics.
                </p>
                <button className="service-btn" onClick={(e) => { e.stopPropagation(); handleBlogClick('gopuram-geometry-vastu'); }}>
                  Read More <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Article Card 2 */}
            <div className="blog-card" style={{ cursor: 'pointer' }} onClick={() => handleBlogClick('om-namah-shivaya-benefits')}>
              <div className="blog-img-box">
                <img src="https://images.unsplash.com/photo-1609946782701-790100780287?auto=format&fit=crop&w=800&q=80" alt="Om Chanting" className="blog-img" />
                <span className="blog-tag">VEDIC PRACTICE</span>
              </div>
              <div className="blog-body">
                <div className="blog-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>JUL 28, 2026 • 4 MIN READ</span>
                  <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>By Pandit Ramanathan</span>
                </div>
                <h3 className="blog-title">Spiritual Benefits of Chanting Om Namah Shivaya at Dawn</h3>
                <p className="blog-snippet">
                  Uncover the sound vibration frequency of the Panchakshari Mantra and its therapeutic effect on stress, focus, and inner peace.
                </p>
                <button className="service-btn" onClick={(e) => { e.stopPropagation(); handleBlogClick('om-namah-shivaya-benefits'); }}>
                  Read More <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Article Card 3 */}
            <div className="blog-card" style={{ cursor: 'pointer' }} onClick={() => handleBlogClick('panchamrit-divine-nectars')}>
              <div className="blog-img-box">
                <img src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" alt="Panchamrit Ritual" className="blog-img" />
                <span className="blog-tag">RITUAL EXPLANATIONS</span>
              </div>
              <div className="blog-body">
                <div className="blog-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>JUL 15, 2026 • 6 MIN READ</span>
                  <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>By Dr. Ananya Sharma</span>
                </div>
                <h3 className="blog-title">Understanding Panchamrit: The 5 Divine Nectars of Abhishekam</h3>
                <p className="blog-snippet">
                  Why milk, curd, honey, ghee, and jaggery are offered to the Lingam and how each nectar symbolizes purity and health.
                </p>
                <button className="service-btn" onClick={(e) => { e.stopPropagation(); handleBlogClick('panchamrit-divine-nectars'); }}>
                  Read More <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. TEMPLE CALENDAR ---------------- */}
      <section id="calendar" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">AUSPICIOUS DAYS & PANCHANG</span>
            <h2 className="section-title">Temple Calendar & Real-time Panchang</h2>
            <p className="section-desc">
              Explore authentic Tithi, Nakshatra, lunar phases, and verified temple festivals from official temple sources.
            </p>
          </div>

          <TempleCalendar 
            onBookPooja={(templeName) => {
              setSelectedService({
                title: templeName ? `Special Pooja at ${templeName}` : "Temple Pooja & Darshan Pass",
                price: "₹501"
              });
              setIsBookingOpen(true);
            }} 
          />
        </div>
      </section>

      {/* ---------------- 4. UPCOMING EVENTS ---------------- */}
      <section id="events" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">COMMUNITY & FESTIVALS</span>
            <h2 className="section-title">Upcoming Temple Events</h2>
            <p className="section-desc">
              Join our grand festival celebrations, musical bhajan evenings, and cultural programs.
            </p>
          </div>

          <div className="events-grid">
            {/* Event Card 1 */}
            <div className="event-card">
              <div className="event-date-card">
                <span className="event-date-day">26</span>
                <span className="event-date-mon">FEB</span>
              </div>
              <div className="event-details">
                <h3 className="event-title">Maha Shivratri Night Sangeet & Jagran</h3>
                <div className="event-time-loc">
                  <span><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> 6:00 PM - 6:00 AM</span>
                  <span><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Main Temple Courtyard</span>
                </div>
                <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }} onClick={() => alert('RSVP Registered for Maha Shivratri Jagran!')}>
                  Register RSVP
                </button>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="event-card">
              <div className="event-date-card">
                <span className="event-date-day">15</span>
                <span className="event-date-mon">OCT</span>
              </div>
              <div className="event-details">
                <h3 className="event-title">Navratri Alankar & Classical Dance Fest</h3>
                <div className="event-time-loc">
                  <span><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> 5:30 PM - 9:30 PM</span>
                  <span><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Temple Auditorium</span>
                </div>
                <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }} onClick={() => alert('RSVP Registered for Navratri Fest!')}>
                  Register RSVP
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. CONTACT US SECTION ---------------- */}
      <ContactSection />

      {/* ---------------- 6. FOOTER ---------------- */}
      <Footer 
        onGoToHome={() => handleNavClick('home', 'hero')}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onOpenBooking={() => setIsBookingOpen(true)}
      />

      {/* ---------------- DONATE MODAL ---------------- */}
      <div className={`modal-overlay ${isDonateOpen ? 'active' : ''}`} onClick={() => setIsDonateOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setIsDonateOpen(false)}>
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>
              Support Our Temple Seva
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your sacred contributions help sustain daily poojas, Anna Daan (free meals), and Goshala maintenance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className="btn-primary" style={{ textAlign: 'center', padding: '0.8rem' }} onClick={() => { alert('Thank you for donating ₹501 to Anna Daan Seva!'); setIsDonateOpen(false); }}>
              ₹501 • Anna Daan
            </button>
            <button className="btn-primary" style={{ textAlign: 'center', padding: '0.8rem' }} onClick={() => { alert('Thank you for donating ₹1,008 to Temple Renovation!'); setIsDonateOpen(false); }}>
              ₹1,008 • Renovation
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- BOOKING MODAL ---------------- */}
      <div className={`modal-overlay ${isBookingOpen ? 'active' : ''}`} onClick={() => setIsBookingOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setIsBookingOpen(false)}>
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>
              {selectedService ? `Book ${selectedService}` : 'Book Darshan & Pooja'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select your preferred date and time slot for special priority entry and archana.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Booking confirmed! Slot details sent to your registered phone.'); setIsBookingOpen(false); }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>Devotee Name</label>
              <input type="text" required placeholder="Enter full name" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(200, 169, 106, 0.4)', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>Preferred Date</label>
              <input type="date" required style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(200, 169, 106, 0.4)', outline: 'none' }} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Confirm Booking <CheckCircle2 size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* ---------------- READ BLOG MODAL ---------------- */}
      <div className={`modal-overlay ${readBlog ? 'active' : ''}`} onClick={() => setReadBlog(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setReadBlog(null)}>
            <X size={22} />
          </button>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--primary-brown-dark)', marginBottom: '1rem' }}>
            {readBlog}
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Ancient Vedic texts emphasize that temple structures function as physical representations of the human subtle body. From the garbhagriha (sanctum) to the gopuram, every stone is carved to resonate with specific acoustic frequencies during morning and evening Aartis.
          </p>
          <button className="btn-primary" onClick={() => setReadBlog(null)}>
            Close Article
          </button>
        </div>
      </div>
    </div>
  );
}
