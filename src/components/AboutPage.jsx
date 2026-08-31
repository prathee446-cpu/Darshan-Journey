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
  Heart,
  Star
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Refactored Devotee (Customer) and Temple reviews dataset
const DEVOTEE_REVIEWS = [
  {
    id: 1,
    stars: 5,
    review: "Everything was simple and well organized. I could find the temple details and plan my visit without any confusion.",
    name: "Kaviya R",
    location: "Chennai, Tamil Nadu"
  },
  {
    id: 2,
    stars: 5,
    review: "Planning our family yatra was seamless. All temple timings, pooja rates and transit recommendations were highly accurate.",
    name: "Arjun K",
    location: "Coimbatore, Tamil Nadu"
  },
  {
    id: 3,
    stars: 5,
    review: "The AI guide was a blessing. It answered our ritual queries instantly and made our pilgrimage completely stress-free.",
    name: "Sneha R",
    location: "Bengaluru, Karnataka"
  }
];

const TEMPLE_REVIEWS = [
  {
    id: 1,
    stars: 5,
    review: "Beautiful temple with a peaceful atmosphere. The darshan experience was truly memorable.",
    templeName: "Tirupati Balaji Temple",
    location: "Tirupati, Andhra Pradesh",
    reviewerName: "Rahul K",
    visitDate: "July 2026",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    stars: 5,
    review: "The temple was beautifully maintained and the spiritual atmosphere was wonderful.",
    templeName: "Ramanathaswamy Temple",
    location: "Rameswaram, Tamil Nadu",
    reviewerName: "Ananya S",
    visitDate: "June 2026",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    stars: 5,
    review: "Very peaceful experience. The temple architecture and surroundings were amazing.",
    templeName: "Meenakshi Amman Temple",
    location: "Madurai, Tamil Nadu",
    reviewerName: "Sharaa R",
    visitDate: "May 2026",
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=400&q=80"
  }
];

// Assets
import logoImg from '../assets/darshan-logo.jpeg';
import templeSculpture from '../assets/temple_sculpture_about.jpg';
import pilgrimageImg from '../assets/kedarnath.png';

export default function AboutPage({
  onGoToHome,
  onGoToLanding,
  onExploreTemples,
  onGoToProducts,
  onGoToServices,
  onGoToLogin,
  onGoToAbout,
  onGoToContact,
  onGoToDashboard,
  onOpenBooking,
  onOpenDonate
}) {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTempleName, setBookingTempleName] = useState('');
  const [aboutData, setAboutData] = useState(null);

  // Fetch live about content & scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/about')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setAboutData(data.data || data);
      })
      .catch(() => {});
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
        onGoToServices={onGoToServices}
        onGoToLogin={onGoToLogin}
        onGoToAbout={onGoToAbout}
        onGoToContact={onGoToContact}
        onOpenBooking={onOpenBooking}
        onOpenDonate={onOpenDonate}
      />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="about-hero">
        <div className="about-hero-left">
          <div className="about-hero-img-container">
            <motion.img
              src={aboutData?.heroImage || templeSculpture}
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
              <span className="about-hero-tag">{aboutData?.heroTag || "Who We Are"}</span>
              <h1 className="about-hero-title">{aboutData?.heroTitle || "About Darshan Journey"}</h1>
              <h2 className="about-hero-subtitle">{aboutData?.heroSubtitle || "Where Technology Meets Spirituality."}</h2>
              <div className="temple-accent" style={{ margin: '0.5rem 0 1.5rem 0' }} />
              <p className="about-hero-desc">
                {aboutData?.heroDescription || "Darshan Journey is an AI-powered spiritual platform dedicated to helping devotees discover, plan, and experience meaningful pilgrimages with confidence. We combine authentic temple knowledge, intelligent planning, and modern technology to make every spiritual journey simple, accessible, and deeply fulfilling."}
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
              <img src={aboutData?.storyImage || pilgrimageImg} alt="Pilgrimage Experience" className="about-story-img" />
              <div className="about-story-img-overlay" />
            </motion.div>

            <motion.div
              className="about-story-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
            >
              <span className="section-tag">{aboutData?.storyTag || "Our Genesis"}</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                {aboutData?.storyTitle || "Our Journey Began With a Simple Question"}
              </h2>
              <p className="about-story-text">
                {aboutData?.storyParagraph1 || "Millions of devotees travel to temples every year, yet planning a pilgrimage often involves fragmented information, uncertain schedules, and unnecessary stress. Temple timings change, rituals vary, booking systems differ, and trusted guidance isn't always easy to find."}
              </p>
              <p className="about-story-text">
                {aboutData?.storyParagraph2 || "Darshan Journey was created to bridge this gap between timeless Vedic traditions and modern digital convenience."}
              </p>
              <p className="about-story-text">
                {aboutData?.storyParagraph3 || "Our vision is to build one trusted platform where devotees can explore temples, plan personalized pilgrimages, receive authentic spiritual guidance, book services seamlessly, and stay connected to their faith—all from one place."}
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

      {/* ========================================================================= */}
      {/* 8. VOICES OF OUR DEVOTEES (CUSTOMER REVIEWS) */}
      {/* ========================================================================= */}
      <section className="section about-devotees-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">VOICES OF OUR DEVOTEES</span>
            <h2 className="section-title" style={{ color: '#FFFFFF' }}>Voices of Our Devotees</h2>
            <p className="section-desc" style={{ color: '#BC9F7A' }}>
              Real experiences from devotees who travelled with Darshan Journey.
            </p>
          </div>

          <motion.div
            className="about-devotees-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {DEVOTEE_REVIEWS.map((review) => (
              <motion.div
                key={review.id}
                className="compact-review-card"
                variants={itemVariants}
              >
                <div>
                  <div className="compact-review-stars">
                    {Array.from({ length: review.stars }).map((_, i) => (
                      <Star key={i} size={16} fill="#D4AF37" color="#D4AF37" style={{ display: 'inline-block', marginRight: '2px' }} />
                    ))}
                  </div>
                  <p className="compact-review-text">
                    "{review.review}"
                  </p>
                </div>
                <div className="compact-review-author">
                  <h4 className="compact-review-name">— {review.name}</h4>
                  <span className="compact-review-location">{review.location}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. TEMPLE REVIEWS */}
      {/* ========================================================================= */}
      <section className="section about-temple-reviews-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">TEMPLE REVIEWS</span>
            <h2 className="section-title" style={{ color: '#341F1D' }}>Temple Reviews</h2>
            <p className="section-desc" style={{ color: '#6E5351' }}>
              Discover what devotees experienced at sacred destinations.
            </p>
          </div>

          <motion.div
            className="about-temple-reviews-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {TEMPLE_REVIEWS.map((review) => (
              <motion.div
                key={review.id}
                className="compact-temple-card"
                variants={itemVariants}
              >
                <div className="temple-review-thumbnail-wrap">
                  <img
                    src={review.image}
                    alt={review.templeName}
                    className="temple-review-thumbnail"
                  />
                </div>
                <div className="temple-review-content">
                  <div>
                    <div className="temple-review-stars">
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Star key={i} size={14} fill="#D4AF37" color="#D4AF37" style={{ display: 'inline-block', marginRight: '2px' }} />
                      ))}
                    </div>
                    <p className="temple-review-text">
                      "{review.review}"
                    </p>
                  </div>
                  <div className="temple-review-details">
                    <h4 className="temple-review-name">{review.templeName}</h4>
                    <div className="temple-review-location">{review.location}</div>
                    <div className="temple-review-meta">
                      <span>— {review.reviewerName}</span>
                      <span>Visited: {review.visitDate}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <Footer
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToContact={onGoToContact}
        onOpenBooking={onOpenBooking}
      />
    </div>
  );
}