import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Gift, 
  Sparkles, 
  Sun, 
  Compass, 
  Flower2, 
  X, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Video,
  Clock
} from 'lucide-react';
import logoImg from '../assets/exact_darshan_logo.png';
import heroBg from '../assets/temple_hero_bg.png';
import product1Img from '../assets/product_1_pooja.jpg';
import product2Img from '../assets/product_2_prashad.jpg';
import product3Img from '../assets/product_3_aarti.jpg';
import product4Img from '../assets/product_4_rudrabhishekam.jpg';
import product5Img from '../assets/product_5_astrology.jpg';
import product6Img from '../assets/product_6_flower.jpg';
import Navbar from './Navbar';
import Footer from './Footer';

// 6 Sacred Service Slides Data
const SERVICE_SLIDES = [
  {
    id: 1,
    number: "01",
    tag: "DAILY RITUALS",
    title: "Daily Pooja & Archana Seva",
    description: "Book personalized daily Archana and Abhishekam performed in your name and gotra by revered temple priests in sacred sanctums across Tamil Nadu.",
    cta: "Book Pooja Now",
    serviceName: "Daily Pooja & Archana",
    image: product1Img
  },
  {
    id: 2,
    number: "02",
    tag: "HOLY BLESSINGS",
    title: "Sacred Prashad Delivery",
    description: "Receive blessed Mahaprashad, holy kumkum, vibhuti, dry fruits, and sacred flowers delivered fresh and untouched to your doorstep anywhere in India.",
    cta: "Order Prashad",
    serviceName: "Sacred Prashad Delivery",
    image: product2Img
  },
  {
    id: 3,
    number: "03",
    tag: "DIGITAL DEVOTION",
    title: "Virtual Live Aarti & Darshan",
    description: "Participate in real-time 4K morning and evening Aarti streams directly from sanctum sanctorum of ancient shrines with live Vedic chanting.",
    cta: "Join Live Stream",
    serviceName: "Virtual Live Darshan",
    image: product3Img
  },
  {
    id: 4,
    number: "04",
    tag: "VEDIC SANCTIFICATION",
    title: "Special Rudrabhishekam Seva",
    description: "Elaborate liquid offerings of holy Ganga water, unpasteurized cow milk, pure ghee, honey, and Bilva leaves for health, peace, & prosperity.",
    cta: "Reserve Ritual",
    serviceName: "Special Rudrabhishekam",
    image: product4Img
  },
  {
    id: 5,
    number: "05",
    tag: "COSMIC WISDOM",
    title: "Vedic Astrology Guidance",
    description: "Consult certified hereditary temple astrologers for Janam Kundali analysis, Nakshatra remedies, and calculation of auspicious Muhurats.",
    cta: "Consult Astrologer",
    serviceName: "Vedic Astrology Guidance",
    image: product5Img
  },
  {
    id: 6,
    number: "06",
    tag: "SACRED OFFERINGS",
    title: "Fresh Flower & Diya Stalls",
    description: "Pre-order fresh fragrant marigold garlands, lotus flower baskets, and pure cow ghee brass diyas for your physical visit.",
    cta: "Pre-Order Offerings",
    serviceName: "Flower & Diya Stalls",
    image: product6Img
  }
];

// 6 Available Sevas Today Data for Live Status Section
const AVAILABLE_SEVAS_TODAY = [
  {
    id: 1,
    title: "Daily Pooja & Archana Seva",
    status: "Available Today",
    badgeText: "Available",
    badgeType: "green",
    icon: Flame,
    description: "Personalized Archana & Abhishekam performed in your name and gotra by temple priests.",
    serviceName: "Daily Pooja & Archana",
    price: "₹501"
  },
  {
    id: 2,
    title: "Special Rudrabhishekam Seva",
    status: "Limited Slots",
    badgeText: "Limited",
    badgeType: "amber",
    icon: Sparkles,
    description: "Sacred liquid offerings of holy Ganga water, unpasteurized cow milk, pure ghee, & Bilva leaves.",
    serviceName: "Special Rudrabhishekam",
    price: "₹1,008"
  },
  {
    id: 3,
    title: "Virtual Live Aarthi & Darshan",
    status: "Available Today",
    badgeText: "Live",
    badgeType: "green",
    icon: Video,
    description: "Real-time 4K morning and evening Aarti streams directly from sanctum sanctorum with live Vedic chanting.",
    serviceName: "Virtual Live Darshan",
    price: "₹251"
  },
  {
    id: 4,
    title: "Fresh Flower & Diya Stalls",
    status: "Available",
    badgeText: "Open",
    badgeType: "green",
    icon: Flower2,
    description: "Pre-order fresh fragrant marigold garlands, lotus flower baskets, and pure cow ghee diyas.",
    serviceName: "Flower & Diya Stalls",
    price: "₹151"
  },
  {
    id: 5,
    title: "Vedic Astrology Guidance",
    status: "Next Consultation Available",
    badgeText: "Available",
    badgeType: "green",
    icon: Compass,
    description: "Consult certified hereditary temple astrologers for Janam Kundali analysis & Nakshatra remedies.",
    serviceName: "Vedic Astrology Guidance",
    price: "₹751"
  },
  {
    id: 6,
    title: "Sacred Prashad Delivery",
    status: "Orders Open",
    badgeText: "Open",
    badgeType: "green",
    icon: Gift,
    description: "Blessed Mahaprashad, holy kumkum, vibhuti, and dry fruits delivered fresh to your home.",
    serviceName: "Sacred Prashad Delivery",
    price: "₹351"
  }
];

// Helper to determine status badge colors & pulse dot styling
const getBadgeStyles = (badgeType) => {
  switch (badgeType) {
    case 'green':
    case 'available':
    case 'open':
    case 'live':
      return {
        bg: 'rgba(46, 125, 50, 0.1)',
        color: '#2E7D32',
        border: '1px solid rgba(46, 125, 50, 0.3)',
        dotColor: '#2E7D32'
      };
    case 'amber':
    case 'limited':
      return {
        bg: 'rgba(230, 81, 0, 0.1)',
        color: '#E65100',
        border: '1px solid rgba(230, 81, 0, 0.3)',
        dotColor: '#E65100'
      };
    case 'red':
    case 'booked':
    case 'fully_booked':
      return {
        bg: 'rgba(198, 40, 40, 0.1)',
        color: '#C62828',
        border: '1px solid rgba(198, 40, 40, 0.3)',
        dotColor: '#C62828'
      };
    default:
      return {
        bg: 'rgba(46, 125, 50, 0.1)',
        color: '#2E7D32',
        border: '1px solid rgba(46, 125, 50, 0.3)',
        dotColor: '#2E7D32'
      };
  }
};

export default function ServicesPage({ onGoToHome, onGoToLanding, onExploreTemples, onGoToLogin }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceName, setBookingServiceName] = useState('');

  const currentSlide = SERVICE_SLIDES[currentIndex];

  // Handle scroll effect for navbar
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

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SERVICE_SLIDES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + SERVICE_SLIDES.length) % SERVICE_SLIDES.length);
  };

  const handleCircleClick = () => {
    handleNext();
  };

  const openBookingForCurrent = (serviceName) => {
    setBookingServiceName(serviceName || currentSlide.serviceName);
    setIsBookingOpen(true);
  };

  // Variants for left content sliding out to left (-60px) / sliding in from right (+60px)
  const leftContentVariants = {
    initial: (dir) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: [0.7, 0, 0.84, 0]
      }
    })
  };

  // Variants for 3D Circle Y-axis rotation
  const circle3DVariants = {
    initial: {
      rotateY: 90,
      scale: 0.88,
      opacity: 0.4
    },
    animate: {
      rotateY: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: {
      rotateY: -90,
      scale: 0.88,
      opacity: 0.4,
      transition: {
        duration: 0.5,
        ease: [0.7, 0, 0.84, 0]
      }
    }
  };

  return (
    <div 
      className="home-website-wrapper services-page-container" 
      style={{
        backgroundColor: '#F7F1E8',
        color: '#3B241C',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      {/* ---------------- NAVBAR HEADER ---------------- */}
      <Navbar 
        activePage="services"
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToServices={() => {}}
        onGoToLogin={onGoToLogin}
        onOpenBooking={() => openBookingForCurrent()}
        onOpenDonate={() => alert('Thank you for supporting Temple Seva!')}
      />

      {/* ---------------- HERO SECTION ---------------- */}
      <section id="services-hero" className="hero-section services-hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-subtitle-tag">SERVICE OFFERINGS</span>
          <h1 className="hero-heading" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '1rem' }}>
            Temple Services & Sacred Offerings
          </h1>
          <p className="hero-desc" style={{ maxWidth: '750px', margin: '0 auto' }}>
            "Discover divine sevas, sacred rituals, prashad, virtual darshan, and spiritual offerings designed to enrich your devotional journey."
          </p>
        </div>
      </section>

      {/* ---------------- MAIN SPLIT SCREEN HERO SLIDER ---------------- */}
      <main 
        style={{
          paddingTop: '60px',
          paddingBottom: '80px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Mandala Decorative Elements */}
        <div 
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '1px dashed rgba(200, 155, 75, 0.15)',
            pointerEvents: 'none',
            animation: 'spinMandala 60s linear infinite'
          }}
        />

        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem', width: '100%', position: 'relative', zIndex: 10 }}>
          <div 
            className="services-split-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              alignItems: 'center'
            }}
          >
            
            {/* ---------------- LEFT SIDE: CONTENT & CTA ---------------- */}
            <div style={{ position: 'relative', minHeight: '440px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide.id}
                  custom={direction}
                  variants={leftContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ position: 'relative', zIndex: 2 }}
                >
                  {/* Huge Faded Background Slide Number */}
                  <span 
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: '11rem',
                      fontWeight: 900,
                      color: 'rgba(200, 155, 75, 0.12)',
                      position: 'absolute',
                      top: '-70px',
                      left: '-20px',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      lineHeight: 1,
                      zIndex: -1
                    }}
                  >
                    {currentSlide.number}
                  </span>

                  {/* Category Pill Tag */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#C89B4B' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.18em', color: '#A57C52', textTransform: 'uppercase' }}>
                      {currentSlide.tag} • {currentSlide.number} / 06
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: '3.2rem',
                      fontWeight: 800,
                      color: '#3B241C',
                      lineHeight: 1.15,
                      marginBottom: '1.2rem'
                    }}
                  >
                    {currentSlide.title}
                  </h1>

                  {/* Main Description */}
                  <p 
                    style={{
                      fontSize: '1.1rem',
                      color: '#5C3A2E',
                      lineHeight: 1.65,
                      marginBottom: '2.2rem',
                      maxWidth: '540px'
                    }}
                  >
                    {currentSlide.description}
                  </p>

                  {/* CTA Button & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openBookingForCurrent(currentSlide.serviceName)}
                      style={{
                        backgroundColor: '#C89B4B',
                        color: '#3B241C',
                        border: 'none',
                        borderRadius: '99px',
                        padding: '1rem 2.2rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        boxShadow: '0 8px 25px rgba(200, 155, 75, 0.35)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#3B241C';
                        e.currentTarget.style.color = '#C89B4B';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#C89B4B';
                        e.currentTarget.style.color = '#3B241C';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {currentSlide.cta} <ArrowRight size={20} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#A57C52', fontSize: '0.88rem', fontWeight: 600 }}>
                      <ShieldCheck size={18} style={{ color: '#C89B4B' }} />
                      <span>Verified Vedic Priests</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Navigation Controls (Dots + Arrows) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '3.5rem', zIndex: 10 }}>
                {/* 6 Step Indicators */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {SERVICE_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      style={{
                        width: idx === currentIndex ? '32px' : '10px',
                        height: '10px',
                        borderRadius: '99px',
                        backgroundColor: idx === currentIndex ? '#C89B4B' : 'rgba(165, 124, 82, 0.3)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow Controls */}
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    onClick={handlePrev}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      border: '1.5px solid rgba(200, 155, 75, 0.4)',
                      backgroundColor: '#FFFDF9',
                      color: '#3B241C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(59, 36, 28, 0.08)',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3B241C';
                      e.currentTarget.style.color = '#C89B4B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFDF9';
                      e.currentTarget.style.color = '#3B241C';
                    }}
                    title="Previous Slide"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    onClick={handleNext}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      border: '1.5px solid rgba(200, 155, 75, 0.4)',
                      backgroundColor: '#FFFDF9',
                      color: '#3B241C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(59, 36, 28, 0.08)',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3B241C';
                      e.currentTarget.style.color = '#C89B4B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFDF9';
                      e.currentTarget.style.color = '#3B241C';
                    }}
                    title="Next Slide"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              </div>

            </div>

            {/* ---------------- RIGHT SIDE: 3D ROTATING CIRCULAR MANDALA IMAGE CONTAINER ---------------- */}
            <div 
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                perspective: '1000px'
              }}
            >
              {/* Outer Continuously Rotating Decorative Ring */}
              <div 
                style={{
                  position: 'absolute',
                  width: '480px',
                  height: '480px',
                  borderRadius: '50%',
                  border: '2px dashed #C89B4B',
                  opacity: 0.35,
                  animation: 'spinMandala 40s linear infinite',
                  pointerEvents: 'none'
                }}
              />

              {/* Outer Secondary Glowing Ring */}
              <div 
                style={{
                  position: 'absolute',
                  width: '440px',
                  height: '440px',
                  borderRadius: '50%',
                  border: '1px solid rgba(200, 155, 75, 0.4)',
                  pointerEvents: 'none'
                }}
              />

              {/* 3D Rotating Circular Image Container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  variants={circle3DVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onClick={handleCircleClick}
                  style={{
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    border: '5px solid #C89B4B',
                    boxShadow: '0 0 50px rgba(200, 155, 75, 0.4), 0 25px 60px rgba(59, 36, 28, 0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transformStyle: 'preserve-3d',
                    backgroundColor: '#FFFDF9'
                  }}
                  title="Click to view next service"
                >
                  {/* Temple Image */}
                  <img 
                    src={currentSlide.image} 
                    alt={currentSlide.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'contrast(1.05) brightness(0.95)'
                    }}
                  />

                  {/* Inner Gradient Vignette Overlay */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at center, transparent 40%, rgba(59, 36, 28, 0.6) 100%)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Floating Circular Badge / Next Indicator */}
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '24px',
                      right: '24px',
                      backgroundColor: '#3B241C',
                      color: '#C89B4B',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      border: '2px solid #C89B4B'
                    }}
                  >
                    <ChevronRight size={26} />
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>

          </div>
        </div>
      </main>

      {/* ---------------- AVAILABLE SEVAS TODAY SECTION ---------------- */}
      <section 
        id="available-sevas-today" 
        style={{
          paddingTop: '80px',
          paddingBottom: '100px',
          position: 'relative',
          backgroundColor: '#F7F1E8',
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(200, 155, 75, 0.14) 0%, rgba(247, 241, 232, 0) 70%)',
          overflow: 'hidden'
        }}
      >
        {/* Sacred Pattern / Lotus Watermark in Background */}
        <div 
          style={{
            position: 'absolute',
            right: '-80px',
            bottom: '-80px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            border: '1px dashed rgba(200, 155, 75, 0.18)',
            pointerEvents: 'none',
            animation: 'spinMandala 90s linear infinite'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            left: '-100px',
            top: '10%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            border: '1px dashed rgba(200, 155, 75, 0.12)',
            pointerEvents: 'none',
            animation: 'spinMandala 120s linear infinite reverse'
          }}
        />

        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 5 }}>
          
          {/* Section Header with Entrance Animation */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#C89B4B' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.18em', color: '#A57C52', textTransform: 'uppercase' }}>
                LIVE AVAILABILITY
              </span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#C89B4B' }} />
            </div>

            <h2 
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                fontWeight: 800,
                color: '#3B241C',
                marginBottom: '1rem',
                lineHeight: 1.2
              }}
            >
              Available Sevas Today
            </h2>

            <p 
              style={{
                fontSize: '1.08rem',
                color: '#5C3A2E',
                maxWidth: '680px',
                margin: '0 auto',
                lineHeight: 1.65
              }}
            >
              Explore the sevas currently available for booking and their live availability status.
            </p>
          </motion.div>

          {/* Staggered Grid of Seva Cards */}
          <motion.div 
            className="sevas-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.1
                }
              }
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '2rem'
            }}
          >
            {AVAILABLE_SEVAS_TODAY.map((seva) => {
              const IconComponent = seva.icon;
              const badgeStyle = getBadgeStyles(seva.badgeType);

              return (
                <motion.div
                  key={seva.id}
                  variants={{
                    hidden: { opacity: 0, y: 35 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  whileHover={{ 
                    y: -8, 
                    boxShadow: '0 20px 45px rgba(200, 155, 75, 0.25)',
                    borderColor: 'rgba(200, 155, 75, 0.8)'
                  }}
                  style={{
                    backgroundColor: '#FFFDF9',
                    borderRadius: '24px',
                    border: '1.5px solid rgba(200, 155, 75, 0.35)',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 30px rgba(59, 36, 28, 0.07)',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="seva-card-item"
                >
                  <div>
                    {/* Card Header: Icon Container + Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.4rem' }}>
                      <div 
                        className="seva-icon-wrapper"
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          backgroundColor: 'rgba(200, 155, 75, 0.12)',
                          color: '#C89B4B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(200, 155, 75, 0.3)',
                          transition: 'transform 0.3s ease, backgroundColor 0.3s ease'
                        }}
                      >
                        <IconComponent size={26} />
                      </div>

                      {/* Status Badge with Pulsing Dot */}
                      <div 
                        style={{
                          backgroundColor: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: badgeStyle.border,
                          borderRadius: '99px',
                          padding: '0.4rem 0.9rem',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        <span 
                          className="badge-pulse-dot"
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: badgeStyle.dotColor,
                            display: 'inline-block'
                          }}
                        />
                        {seva.badgeText}
                      </div>
                    </div>

                    {/* Title & Status */}
                    <h3 
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: '#3B241C',
                        marginBottom: '0.5rem',
                        lineHeight: 1.3
                      }}
                    >
                      {seva.title}
                    </h3>

                    {/* Status Subtitle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', color: '#A57C52', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Clock size={15} style={{ color: '#C89B4B' }} />
                      <span>Status: <strong style={{ color: '#3B241C' }}>{seva.status}</strong></span>
                    </div>

                    {/* Description */}
                    <p 
                      style={{
                        fontSize: '0.96rem',
                        color: '#5C3A2E',
                        lineHeight: 1.6,
                        marginBottom: '1.8rem'
                      }}
                    >
                      {seva.description}
                    </p>
                  </div>

                  {/* Card Footer: Price & Booking Action Button */}
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1.2rem',
                      borderTop: '1px dashed rgba(200, 155, 75, 0.3)',
                      marginTop: 'auto'
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#A57C52', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dakshina</span>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.3rem', fontWeight: 800, color: '#3B241C' }}>{seva.price}</span>
                    </div>

                    <button
                      onClick={() => openBookingForCurrent(seva.serviceName)}
                      style={{
                        backgroundColor: '#C89B4B',
                        color: '#3B241C',
                        border: 'none',
                        borderRadius: '99px',
                        padding: '0.7rem 1.4rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 15px rgba(200, 155, 75, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#3B241C';
                        e.currentTarget.style.color = '#C89B4B';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#C89B4B';
                        e.currentTarget.style.color = '#3B241C';
                      }}
                    >
                      Book Seva <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* ---------------- BOOKING MODAL ---------------- */}
      {isBookingOpen && (
        <div 
          className="modal-overlay active" 
          onClick={() => setIsBookingOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(59, 36, 28, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFDF9',
              borderRadius: '24px',
              border: '2px solid #C89B4B',
              padding: '2.2rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(59, 36, 28, 0.3)'
            }}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(200, 155, 75, 0.3)', paddingBottom: '1rem' }}>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.35rem', fontWeight: 800, color: '#3B241C', margin: 0 }}>
                {bookingServiceName ? `Book ${bookingServiceName}` : 'Book Special Pooja & Seva'}
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setIsBookingOpen(false)}
                style={{ background: '#F7F1E8', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B241C' }}
              >
                <X size={20} />
              </button>
            </div>

            <form className="booking-form" onSubmit={(e) => {
              e.preventDefault();
              alert(`Booking Confirmed for ${bookingServiceName || 'Pooja Seva'}! Confirmation details sent via SMS & WhatsApp.`);
              setIsBookingOpen(false);
            }}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>Devotee Full Name</label>
                <input type="text" placeholder="Enter devotee name" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #A57C52', backgroundColor: '#F7F1E8', fontSize: '0.95rem', outline: 'none' }} />
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>Gotra & Rashi (Optional)</label>
                <input type="text" placeholder="e.g. Kashyapa, Mesha Rashi" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #A57C52', backgroundColor: '#F7F1E8', fontSize: '0.95rem', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>Mobile Number</label>
                  <input type="tel" placeholder="+91 98765 43210" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #A57C52', backgroundColor: '#F7F1E8', fontSize: '0.95rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>Preferred Date</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #A57C52', backgroundColor: '#F7F1E8', fontSize: '0.95rem', outline: 'none' }} />
                </div>
              </div>

              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  backgroundColor: '#C89B4B', 
                  color: '#3B241C', 
                  border: 'none', 
                  borderRadius: '99px', 
                  padding: '0.9rem', 
                  fontFamily: "'Plus Jakarta Sans', sans-serif", 
                  fontWeight: 800, 
                  fontSize: '1rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(200, 155, 75, 0.35)' 
                }}
              >
                Confirm Booking <CheckCircle2 size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- FOOTER ---------------- */}
      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToServices={() => {}}
        onOpenBooking={() => openBookingForCurrent('Temple Pooja & Darshan')}
      />

      {/* Global CSS Keyframes for Mandala Rotation */}
      <style>{`
        @keyframes spinMandala {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulseDot {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }

        .badge-pulse-dot {
          animation: pulseDot 2s infinite ease-in-out;
        }

        .seva-card-item:hover .seva-icon-wrapper {
          transform: scale(1.1);
          background-color: rgba(200, 155, 75, 0.2) !important;
        }

        @media (min-width: 768px) {
          .sevas-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 992px) {
          .services-split-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .badge-pulse-dot,
          .seva-card-item,
          .seva-icon-wrapper {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
