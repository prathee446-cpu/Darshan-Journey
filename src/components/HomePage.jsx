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
import logoImg from '../assets/exact_darshan_logo.png';
import heroBg from '../assets/temple_hero_bg.png';
import TempleCalendar from './TempleCalendar';
import TestimonialsSection from './TestimonialsSection';
import Navbar from './Navbar';
import Footer from './Footer';
import { useWebsiteContent } from '../context/ContentContext';
import { resolveImageUrl } from '../utils/imageUrl';

export default function HomePage({ 
  onGoToHome,
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToServices,
  onGoToBlog,
  onGoToAbout,
  onGoToContact,
  onGoToDashboard,
  onGoToLogin,
  onOpenBooking,
  onOpenDonate 
}) {
  const { home, brand, articles, lastFetched } = useWebsiteContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  const heroImageSrc = home?.heroImage ? resolveImageUrl(home.heroImage, home?.updatedAt || lastFetched, heroBg) : heroBg;
  const logoSrc = brand?.logoMain ? resolveImageUrl(brand.logoMain, brand?.updatedAt || lastFetched, logoImg) : logoImg;

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

  return (
    <div className="home-website-wrapper">
      {/* ---------------- NAVBAR ---------------- */}
      <Navbar 
        activePage="home"
        onGoToHome={() => handleNavClick('home', 'hero')}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToContact={onGoToContact}
        onGoToDashboard={onGoToDashboard}
        onGoToLogin={onGoToLogin}
        onOpenBooking={onOpenBooking || (() => { window.location.href = '/quick-booking'; })}
        onOpenDonate={onOpenDonate || onGoToContact || (() => { window.location.href = '/contact'; })}
      />

      {/* ---------------- HERO SECTION ---------------- */}
      <section
        id="hero"
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8, 7, 5, 0.6) 0%, rgba(10, 8, 5, 0.85) 100%), url("${heroImageSrc}")`
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img 
              src={logoSrc} 
              alt="Darshan Journey Logo" 
              style={{ 
                height: '85px', 
                width: 'auto', 
                filter: 'drop-shadow(0 0 14px rgba(200, 169, 106, 0.5)) drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
                objectFit: 'contain'
              }} 
            />
          </div>
          <span className="hero-subtitle-tag">{home?.heroSubtitle || "WELCOME TO OUR SACRED SANCTUARY"}</span>
          <h1 className="hero-heading">{home?.heroTitle || "Experience Divine Peace & Spiritual Heritage"}</h1>
          <p className="hero-desc">
            {home?.heroDescription || "Immerse yourself in sacred traditions, daily Vedic rituals, virtual darshan, and timeless temple heritage. Step into an oasis of peace and devotion."}
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={onExploreTemples}>
              {home?.ctaPrimaryText || "Explore Temple"} <ArrowRight size={18} />
            </button>
            <button className="btn-outline" onClick={onOpenBooking || (() => { window.location.href = '/quick-booking'; })}>
              {home?.ctaSecondaryText || "Book Darshan"}
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
            {(articles && articles.length > 0 ? articles.slice(0, 3) : [
              {
                slug: 'gopuram-geometry-vastu',
                title: 'The Sacred Geometry & Vastu of Indian Gopuram Towers',
                categoryBadge: 'HERITAGE & VASTU',
                author: 'Acharya Sundaram',
                date: 'AUG 12, 2026',
                readTime: '5 MIN READ',
                image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
                snippet: 'Discover how ancient Dravidian and Nagara temple architecture channels cosmic energy through geometric alignment and stone acoustics.'
              },
              {
                slug: 'om-namah-shivaya-benefits',
                title: 'Spiritual Benefits of Chanting Om Namah Shivaya at Dawn',
                categoryBadge: 'VEDIC PRACTICE',
                author: 'Pandit Ramanathan',
                date: 'JUL 28, 2026',
                readTime: '4 MIN READ',
                image: 'https://images.unsplash.com/photo-1609946782701-790100780287?auto=format&fit=crop&w=800&q=80',
                snippet: 'Uncover the sound vibration frequency of the Panchakshari Mantra and its therapeutic effect on stress, focus, and inner peace.'
              },
              {
                slug: 'panchamrit-divine-nectars',
                title: 'Understanding Panchamrit: The 5 Divine Nectars of Abhishekam',
                categoryBadge: 'RITUAL EXPLANATIONS',
                author: 'Dr. Ananya Sharma',
                date: 'JUL 15, 2026',
                readTime: '6 MIN READ',
                image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
                snippet: 'Why milk, curd, honey, ghee, and jaggery are offered to the Lingam and how each nectar symbolizes purity and health.'
              }
            ]).map((art, idx) => (
              <div key={art.id || art.slug || idx} className="blog-card" style={{ cursor: 'pointer' }} onClick={() => handleBlogClick(art.slug)}>
                <div className="blog-img-box">
                  <img 
                    src={resolveImageUrl(art.image, art.updatedAt || lastFetched, 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80')} 
                    alt={art.title} 
                    className="blog-img" 
                  />
                  <span className="blog-tag">{art.categoryBadge || art.category || 'SPIRITUAL WISDOM'}</span>
                </div>
                <div className="blog-body">
                  <div className="blog-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>{art.date || 'AUG 2026'} • {art.readTime || '5 MIN READ'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>By {art.author || 'Vedic Scholar'}</span>
                  </div>
                  <h3 className="blog-title">{art.title}</h3>
                  <p className="blog-snippet">{art.snippet}</p>
                  <button className="service-btn" onClick={(e) => { e.stopPropagation(); handleBlogClick(art.slug); }}>
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
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
              if (onOpenBooking) onOpenBooking();
              else window.location.href = '/quick-booking';
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

      {/* ---------------- 5. DEVOTEE TESTIMONIALS & TRUST STATS ---------------- */}
      <TestimonialsSection onOpenBooking={onOpenBooking || (() => { if (onOpenBooking) onOpenBooking(); else window.location.href = '/quick-booking'; })} />

      {/* ---------------- 6. FOOTER ---------------- */}
      <Footer 
        onGoToHome={() => handleNavClick('home', 'hero')}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToContact={onGoToContact}
        onOpenBooking={onOpenBooking || (() => { if (onOpenBooking) onOpenBooking(); else window.location.href = '/quick-booking'; })}
      />
    </div>
  );
}
