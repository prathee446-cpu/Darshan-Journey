import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Sparkles, 
  Map, 
  Ticket, 
  Languages, 
  Compass, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Heart 
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import TestimonialsSection from './TestimonialsSection';

// Assets
import logoImg from '../assets/darshan-logo.jpeg';
import templeSculpture from '../assets/temple_sculpture_about.jpg';
import pilgrimageImg from '../assets/kedarnath.png';

export default function AboutPage({ 
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToLogin,
  onGoToAbout,
  onOpenBooking
}) {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTempleName, setBookingTempleName] = useState('');

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const leftImageVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 0.82, 
      x: 0,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  const rightContentVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="home-website-wrapper">
      {/* ---------------- NAVBAR ---------------- */}
      <Navbar 
        activePage="about"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToLogin={onGoToLogin}
        onGoToAbout={onGoToAbout}
        onOpenBooking={onOpenBooking || (() => setIsBookingOpen(true))}
        onOpenDonate={() => setIsDonateOpen(true)}
      />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="about-hero">
        <div className="about-hero-left">
          <div className="about-hero-img-container">
            <motion.img 
              src={templeSculpture} 
              alt="Temple Sculpture Carving" 
              className="about-hero-img"
              initial="hidden"
              animate="visible"
              variants={leftImageVariants}
            />
            {/* Soft Edge Blurs & Warm Golden Lighting */}
            <div className="about-hero-blur-overlay" />
          </div>
        </div>

        <div className="container">
          <div className="about-hero-grid">
            <motion.div 
              className="about-hero-right"
              initial="hidden"
              animate="visible"
              variants={rightContentVariants}
            >
              <span className="about-hero-tag">Who We Are</span>
              <h1 className="about-hero-title">About Darshan Journey</h1>
              <h2 className="about-hero-subtitle">Where Technology Meets Spirituality.</h2>
              <div className="temple-accent" style={{ margin: '0.5rem 0 1.5rem 0' }} />
              <p className="about-hero-desc">
                Darshan Journey is an AI-powered spiritual platform dedicated to helping devotees discover, plan, and experience meaningful pilgrimages with confidence. We combine authentic temple knowledge, intelligent planning, and modern technology to make every spiritual journey simple, accessible, and deeply fulfilling.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. OUR STORY */}
      {/* ========================================================================= */}
      <section className="section">
        <div className="container">
          <div className="about-story-grid">
            <motion.div 
              className="about-story-img-box"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <img src={pilgrimageImg} alt="Pilgrimage Experience" className="about-story-img" />
              <div className="about-story-img-overlay" />
            </motion.div>

            <motion.div 
              className="about-story-right"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <span className="section-tag">Our Genesis</span>
              <h2 className="about-story-title">Our Journey Began With a Simple Question</h2>
              <div className="temple-accent" style={{ margin: '0.2rem 0 1.2rem 0' }} />
              
              <p className="about-story-p">
                Millions of devotees travel to temples every year, yet planning a pilgrimage often involves fragmented information, uncertain schedules, and unnecessary stress. Temple timings change, rituals vary, booking systems differ, and trusted guidance isn't always easy to find.
              </p>
              <p className="about-story-p">
                <strong>Darshan Journey</strong> was created to bridge this gap.
              </p>
              <p className="about-story-p">
                Our vision is to build one trusted platform where devotees can explore temples, plan personalized pilgrimages, receive authentic spiritual guidance, book services seamlessly, and stay connected to their faith—all from one place.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MISSION & VISION */}
      {/* ========================================================================= */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Purpose & Future</span>
            <h2 className="section-title">Mission & Vision</h2>
            <p className="section-desc">The guiding principles steering our efforts to digitize Vedic pilgrimage.</p>
          </div>

          <motion.div 
            className="mission-vision-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div className="about-glass-card" variants={itemVariants}>
              <div className="about-card-icon-box">
                <Compass size={28} />
              </div>
              <h3 className="about-card-title">Our Mission</h3>
              <p className="about-card-desc">
                To simplify spiritual journeys by providing reliable temple information, intelligent pilgrimage planning, and personalized devotional experiences through innovative technology while preserving India's rich spiritual and cultural heritage.
              </p>
            </motion.div>

            <motion.div className="about-glass-card" variants={itemVariants}>
              <div className="about-card-icon-box">
                <Sparkles size={28} />
              </div>
              <h3 className="about-card-title">Our Vision</h3>
              <p className="about-card-desc">
                To become the world's most trusted AI-powered spiritual ecosystem, enabling millions of devotees to connect with temples, traditions, and divine experiences through one unified digital platform.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHAT MAKES US DIFFERENT */}
      {/* ========================================================================= */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Key Pillars</span>
            <h2 className="section-title">What Makes Us Different</h2>
            <p className="section-desc">We combine technological innovation with direct spiritual authenticity.</p>
          </div>

          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-card-icon">
                <ShieldCheck size={22} />
              </div>
              <h3 className="feature-card-title">Verified Temple Info</h3>
              <p className="feature-card-desc">
                Accurate, up-to-date timings, pooja rates, dress codes, and historic chronicles verified by authorities.
              </p>
            </motion.div>

            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-card-icon">
                <Sparkles size={22} />
              </div>
              <h3 className="feature-card-title">AI Spiritual Guidance</h3>
              <p className="feature-card-desc">
                Devotional insights and personalized temple recommendations based on your unique spiritual lineage.
              </p>
            </motion.div>

            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-card-icon">
                <Map size={22} />
              </div>
              <h3 className="feature-card-title">Personalized Planning</h3>
              <p className="feature-card-desc">
                AI-driven yatra routes that dynamically optimize timings, transit, stays, and pooja slots.
              </p>
            </motion.div>

            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-card-icon">
                <Ticket size={22} />
              </div>
              <h3 className="feature-card-title">Seamless Bookings</h3>
              <p className="feature-card-desc">
                Instant bookings for special darshan, poojas, prashad, and safe accommodation in a single checkout.
              </p>
            </motion.div>

            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-card-icon">
                <Languages size={22} />
              </div>
              <h3 className="feature-card-title">Multilingual Experience</h3>
              <p className="feature-card-desc">
                Access spiritual texts, temple guidelines, and plan your routes in several native Indian languages.
              </p>
            </motion.div>

            <motion.div className="feature-card" variants={itemVariants}>
              <div className="feature-card-icon">
                <Heart size={22} />
              </div>
              <h3 className="feature-card-title">Trusted Devotional Sevas</h3>
              <p className="feature-card-desc">
                Sponsor sacred ritual offerings and support traditional temple sevayats remotely with transparent tracking.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CORE VALUES */}
      {/* ========================================================================= */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Ethical Foundation</span>
            <h2 className="section-title">Core Values</h2>
            <p className="section-desc">The pillars that define our operations and interactions with devotees and temples.</p>
          </div>

          <motion.div 
            className="values-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div className="value-card" variants={itemVariants}>
              <div className="value-emoji">🙏</div>
              <h3 className="value-card-title">Faith First</h3>
              <p className="value-card-desc">
                Every recommendation respects authentic spiritual traditions and historic temple scriptures.
              </p>
            </motion.div>

            <motion.div className="value-card" variants={itemVariants}>
              <div className="value-emoji">🤝</div>
              <h3 className="value-card-title">Trust & Transparency</h3>
              <p className="value-card-desc">
                Reliable information, verified listings, and fully secure digital payments for peace of mind.
              </p>
            </motion.div>

            <motion.div className="value-card" variants={itemVariants}>
              <div className="value-emoji">🌍</div>
              <h3 className="value-card-title">Accessibility</h3>
              <p className="value-card-desc">
                Making spiritual sites and sacred knowledge accessible to everyone, including senior citizens.
              </p>
            </motion.div>

            <motion.div className="value-card" variants={itemVariants}>
              <div className="value-emoji">💡</div>
              <h3 className="value-card-title">Innovation With Purpose</h3>
              <p className="value-card-desc">
                Utilizing cutting-edge technology to enhance the devotion experience, never to replace it.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. OUR COMMITMENT */}
      {/* ========================================================================= */}
      <section className="section commitment-section">
        <div className="commitment-glow" />
        <div className="container">
          <motion.div 
            className="commitment-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="commitment-icon">☸</div>
            <h2 className="commitment-heading">Our Commitment</h2>
            <p className="commitment-text">
              We are committed to delivering authentic information, seamless pilgrimage planning, personalized guidance, and secure digital experiences that empower devotees to travel with confidence and devotion.
            </p>
            <p className="commitment-text" style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '1.05rem', color: 'rgba(238, 220, 185, 0.9)' }}>
              "Whether you are visiting your first temple or planning a multi-city pilgrimage, Darshan Journey is designed to be your trusted spiritual companion every step of the way."
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FUTURE VISION */}
      {/* ========================================================================= */}
      <section className="section about-future-section">
        <div className="container">
          <motion.div 
            className="about-future-box"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
          >
            <div className="about-future-decor">ॐ</div>
            <div className="about-future-content">
              <span className="section-tag">Path Forward</span>
              <h2 className="about-future-title">Looking Ahead</h2>
              <div className="temple-accent" />
              <p className="about-future-text">
                Our journey has only begun. As Darshan Journey continues to evolve, we envision a future where intelligent technology, verified spiritual knowledge, multilingual accessibility, and personalized experiences come together to create the world's most comprehensive digital platform for spiritual travel and devotional engagement.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- DEVOTEE TESTIMONIALS & TRUST STATS ---------------- */}
      <TestimonialsSection onOpenBooking={onOpenBooking || (() => setIsBookingOpen(true))} />

      {/* ========================================================================= */}
      {/* 8. CALL TO ACTION SECTION */}
      {/* ========================================================================= */}
      <section className="section about-cta-section">
        <div className="container">
          <motion.div 
            className="about-cta-banner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="about-cta-heading">Begin Your Divine Journey Today</h2>
            <p className="about-cta-text">
              Discover sacred temples, explore timeless traditions, and experience spirituality like never before.
            </p>
            <div className="about-cta-buttons">
              <button 
                className="btn-primary" 
                onClick={onExploreTemples}
              >
                Explore Temples <ArrowRight size={18} />
              </button>
              
              <button 
                className="btn-outline"
                onClick={() => {
                  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <Footer 
        onGoToHome={onGoToHome}
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
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#341F1D', marginBottom: '0.4rem' }}>
              Support Our Temple Seva
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your sacred contributions help sustain daily poojas, Anna Daan (free meals), and Goshala maintenance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className="btn-primary" style={{ textAlign: 'center', padding: '0.8rem', justifyContent: 'center' }} onClick={() => { alert('Thank you for donating ₹501 to Anna Daan Seva!'); setIsDonateOpen(false); }}>
              ₹501 • Anna Daan
            </button>
            <button className="btn-primary" style={{ textAlign: 'center', padding: '0.8rem', justifyContent: 'center' }} onClick={() => { alert('Thank you for donating ₹1,008 to Temple Renovation!'); setIsDonateOpen(false); }}>
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
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#341F1D', marginBottom: '0.4rem' }}>
              {bookingTempleName ? `Book Darshan for ${bookingTempleName}` : 'Book Temple Darshan & Pooja'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select your preferred date and time slot for special priority entry and archana.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert(`Booking confirmed for ${bookingTempleName || 'Temple'}! Slot details sent to your phone.`); setIsBookingOpen(false); setBookingTempleName(''); }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#341F1D', marginBottom: '0.4rem' }}>Devotee Name</label>
              <input type="text" required placeholder="Enter full name" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(200, 169, 106, 0.4)', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#341F1D', marginBottom: '0.4rem' }}>Preferred Date</label>
              <input type="date" required style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(200, 169, 106, 0.4)', outline: 'none' }} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Confirm Booking <CheckCircle2 size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
