import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Quote, Users, MapPin, Building2, HeartHandshake } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Raman',
    location: 'Chennai, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    temple: 'Tirupati Balaji',
    date: 'August 2026',
    verified: true,
    review: 'Planning our Tirupati pilgrimage was so easy with Darshan Journey. From booking darshan to getting all the temple details, everything was available in one place. It saved us so much time.'
  },
  {
    id: 2,
    name: 'Arjun Kumar',
    location: 'Coimbatore, Tamil Nadu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    temple: 'Ramanathaswamy Temple',
    date: 'July 2026',
    verified: true,
    review: 'I booked a special darshan for my parents in Rameswaram. The entire process was smooth, and the updates were accurate. I highly recommend Darshan Journey.'
  },
  {
    id: 3,
    name: 'Sneha Reddy',
    location: 'Bengaluru, Karnataka',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    temple: 'Meenakshi Amman Temple',
    date: 'July 2026',
    verified: true,
    review: 'We were travelling from Bengaluru to Madurai and didn\'t know the temple timings. Darshan Journey gave us all the information instantly and helped us plan our visit perfectly.'
  },
  {
    id: 4,
    name: 'Vishal Patel',
    location: 'Ahmedabad, Gujarat',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    temple: 'Somnath Temple',
    date: 'June 2026',
    verified: true,
    review: 'The Quick Booking feature made our family pilgrimage completely stress-free. Everything from temple information to booking confirmation was handled seamlessly.'
  },
  {
    id: 5,
    name: 'Kavya Nair',
    location: 'Kochi, Kerala',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    temple: 'Guruvayur Temple',
    date: 'May 2026',
    verified: true,
    review: 'I loved how simple the platform was. The AI guide answered all our questions and helped us choose the right pooja for our visit.'
  }
];

const TRUST_STATS = [
  { id: 'rating', icon: Star, stat: '4.9/5', label: 'Average Rating' },
  { id: 'devotees', icon: Users, stat: '50,000+', label: 'Happy Devotees' },
  { id: 'temples', icon: Building2, stat: '500+', label: 'Verified Temples' },
  { id: 'satisfaction', icon: HeartHandshake, stat: '98%', label: 'Customer Satisfaction' }
];

export default function TestimonialsSection({ onOpenBooking }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

  // Auto slide timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleDotClick = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Touch Swipe Handlers for mobile responsiveness
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Slide variants for framer-motion smooth transitions
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    })
  };

  const activeTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="container">
        
        {/* ── 1. TRUST STATISTICS ── */}
        <div className="trust-stats-grid">
          {TRUST_STATS.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.id} className="trust-stat-card">
                <div className="trust-stat-icon-wrapper">
                  <IconComponent size={22} className="trust-stat-icon" />
                </div>
                <div className="trust-stat-value">{item.stat}</div>
                <div className="trust-stat-label">{item.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── 2. SECTION HEADER ── */}
        <div className="section-header testimonials-header">
          <span className="section-tag">
            <Quote size={14} style={{ display: 'inline', marginRight: '6px' }} />
            VOICES OF OUR DEVOTEES
          </span>
          <h2 className="section-title">Trusted by Devotees Across India</h2>
          <p className="section-desc">
            Every pilgrimage has a story. Here's what our devotees have to say about their experience with Darshan Journey.
          </p>
        </div>

        {/* ── 3. TESTIMONIALS CAROUSEL ── */}
        <div 
          className="testimonials-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Previous Button */}
          <button 
            className="carousel-control-btn prev-btn" 
            onClick={handlePrev}
            aria-label="Previous Testimonial"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Active Testimonial Card */}
          <div className="carousel-card-container">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTestimonial.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="testimonial-glass-card"
              >
                {/* Quote Icon Background */}
                <div className="card-quote-bg">
                  <Quote size={80} />
                </div>

                {/* Rating & Verified Row */}
                <div className="card-top-row">
                  <div className="star-rating-row" title={`${activeTestimonial.rating} out of 5 stars`}>
                    {[...Array(activeTestimonial.rating)].map((_, i) => (
                      <Star key={i} size={18} fill="#D4AF37" color="#D4AF37" className="star-icon" />
                    ))}
                  </div>

                  {activeTestimonial.verified && (
                    <span className="verified-badge">
                      <CheckCircle2 size={13} className="verified-icon" />
                      Verified Devotee
                    </span>
                  )}
                </div>

                {/* Testimonial Quote Text */}
                <p className="testimonial-quote-text">
                  "{activeTestimonial.review}"
                </p>

                {/* Temple Visited Pill */}
                <div className="temple-visited-pill">
                  <MapPin size={13} className="pill-pin-icon" />
                  <span>Visited: <strong>{activeTestimonial.temple}</strong></span>
                  <span className="pill-dot">•</span>
                  <span className="pill-date">{activeTestimonial.date}</span>
                </div>

                {/* Customer Profile Footer */}
                <div className="customer-profile-row">
                  <div className="profile-photo-wrap">
                    <img 
                      src={activeTestimonial.avatar} 
                      alt={activeTestimonial.name} 
                      className="profile-photo"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>
                  <div className="profile-details">
                    <h4 className="customer-name">{activeTestimonial.name}</h4>
                    <span className="customer-location">{activeTestimonial.location}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <button 
            className="carousel-control-btn next-btn" 
            onClick={handleNext}
            aria-label="Next Testimonial"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* ── 4. CAROUSEL DOT INDICATORS ── */}
        <div className="carousel-dots-row">
          {TESTIMONIALS.map((item, idx) => (
            <button
              key={item.id}
              className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>

        {/* ── 5. PRE-CTA BANNER ── */}
        <div className="testimonials-cta-banner">
          <div className="cta-banner-content">
            <h3 className="cta-banner-title">Ready to Begin Your Sacred Pilgrimage?</h3>
            <p className="cta-banner-desc">
              Join thousands of satisfied devotees who experience hassle-free darshan, authentic poojas, and divine peace.
            </p>
          </div>
          <button 
            className="btn-primary cta-banner-btn"
            onClick={onOpenBooking || (() => { window.location.href = '/quick-booking'; })}
          >
            Book Quick Darshan Now <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </section>
  );
}
