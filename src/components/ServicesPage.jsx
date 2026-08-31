import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle2,
  ArrowRight
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
import { useAuth } from '../context/AuthContext';

// MongoDB Backend Fetch Helper for Product Categories
export const fetchProductCategories = async () => {
  try {
    const res = await fetch('/api/products/categories');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend categories fetch warning (using defaults):', err);
  }
  return [];
};

// 8 Sacred Product & Service Slides Data (Preserving latest 8-category system from ac8cfd6)
const SERVICE_SLIDES = [
  {
    id: 1,
    number: "01",
    tag: "SACRED ESSENTIALS",
    title: "Pooja Essentials",
    description: "Everything you need for your daily pooja including lamps, camphor, incense sticks, cotton wicks, pooja plates, bells, and sacred accessories.",
    cta: "Shop Now",
    serviceName: "Pooja Essentials",
    categorySlug: "pooja-essentials",
    image: product1Img
  },
  {
    id: 2,
    number: "02",
    tag: "DIVINE BLESSINGS",
    title: "Temple Prasadam",
    description: "Order authentic temple prasadam such as Laddu, Panchamirtham, Puliyodarai, Chakkarai Pongal, Holy Vibhuti, and Kumkum.",
    cta: "Order Now",
    serviceName: "Temple Prasadam",
    categorySlug: "temple-prasadam",
    image: product2Img
  },
  {
    id: 3,
    number: "03",
    tag: "HOLY ADORNMENTS",
    title: "Spiritual Accessories",
    description: "Premium Rudraksha malas, Tulsi malas, crystal malas, divine pendants, bracelets, and sacred accessories.",
    cta: "Explore Collection",
    serviceName: "Spiritual Accessories",
    categorySlug: "spiritual-accessories",
    image: product3Img
  },
  {
    id: 4,
    number: "04",
    tag: "SANCTUM ART",
    title: "Divine Idols & Frames",
    description: "Beautiful handcrafted idols and devotional photo frames for your home temple.",
    cta: "View Collection",
    serviceName: "Divine Idols & Frames",
    categorySlug: "idols-and-frames",
    image: product4Img
  },
  {
    id: 5,
    number: "05",
    tag: "BRASSWARE & LIGHT",
    title: "Brass Lamps & Pooja Items",
    description: "Traditional brass lamps, aarthi plates, kalasam, bells, deepams, and pooja utensils.",
    cta: "Shop Now",
    serviceName: "Brass Lamps & Pooja Items",
    categorySlug: "lamps-and-pooja-items",
    image: product5Img
  },
  {
    id: 6,
    number: "06",
    tag: "DIVINE WISDOM",
    title: "Sacred Books",
    description: "Bhagavad Gita, Ramayanam, Vishnu Sahasranamam, Lalitha Sahasranamam, Hanuman Chalisa, and devotional books.",
    cta: "Browse Books",
    serviceName: "Sacred Books",
    categorySlug: "spiritual-books",
    image: product6Img
  },
  {
    id: 7,
    number: "07",
    tag: "RITUAL OFFERINGS",
    title: "Temple Offerings",
    description: "Coconut, flower garlands, fruits, silk vastram, honey, milk, ghee, and offerings for temple rituals.",
    cta: "Order Offerings",
    serviceName: "Temple Offerings",
    categorySlug: "temple-offerings",
    image: product1Img
  },
  {
    id: 8,
    number: "08",
    tag: "TEMPLE ATTIRE",
    title: "Traditional Devotional Wear",
    description: "Silk sarees, veshti, angavastram, pooja shawls, and traditional temple clothing.",
    cta: "Shop Now",
    serviceName: "Traditional Devotional Wear",
    categorySlug: "devotional-wear",
    image: product2Img
  }
];

export default function ServicesPage({ 
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts,
  onGoToServices,
  onGoToAbout, 
  onGoToContact,
  onGoToDashboard,
  onGoToLogin, 
  onOpenBooking,
  onOpenDonate,
  onSelectCategory
}) {
  const navigate = useNavigate();
  const { isAuthenticated, setPendingService } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceName, setBookingServiceName] = useState('');
  const [mongoCategories, setMongoCategories] = useState([]);

  const currentSlide = SERVICE_SLIDES[currentIndex];

  const SLIDE_CATEGORY_MAP = {
    1: 'pooja-essentials',
    2: 'temple-prasadam',
    3: 'spiritual-accessories',
    4: 'idols-and-frames',
    5: 'lamps-and-pooja-items',
    6: 'spiritual-books',
    7: 'temple-offerings',
    8: 'devotional-wear'
  };

  // Service Selection & Category Routing Handler
  const handleSelectServiceForBooking = (selectedService) => {
    const targetService = selectedService || currentSlide;
    const categorySlug = targetService.categorySlug || SLIDE_CATEGORY_MAP[targetService.id] || 'pooja-essentials';

    if (isAuthenticated) {
      navigate(`/services/category/${categorySlug}`, { state: { categorySlug, service: targetService } });
    } else {
      setPendingService({ ...targetService, categorySlug, redirectUrl: `/services/category/${categorySlug}` });
      if (onGoToLogin) onGoToLogin();
      else navigate('/login');
    }
  };

  // Fetch product categories from MongoDB backend & set 6-second autoplay interval
  useEffect(() => {
    fetchProductCategories().then(cats => {
      if (cats && cats.length > 0) {
        setMongoCategories(cats);
      }
    });

    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // 6-Second Autoplay Slider Interval
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % SERVICE_SLIDES.length);
    }, 6000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
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
    const categorySlug = currentSlide.categorySlug || SLIDE_CATEGORY_MAP[currentSlide.id] || 'pooja-essentials';
    if (onSelectCategory) {
      onSelectCategory(categorySlug);
      return;
    }
    handleNext();
  };

  const openBookingForCurrent = (serviceName) => {
    handleSelectServiceForBooking(currentSlide);
  };

  // Animation variants for smooth text transitions
  const textVariants = {
    initial: (dir) => ({
      opacity: 0,
      y: dir > 0 ? 30 : -30,
    }),
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (dir) => ({
      opacity: 0,
      y: dir > 0 ? -30 : 30,
      transition: {
        duration: 0.4,
        ease: [0.7, 0, 0.84, 0]
      }
    })
  };

  // Animation variants for the circular 3D statue container
  const circleVariants = {
    initial: (dir) => ({
      rotateY: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.85
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (dir) => ({
      rotateY: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.85,
      transition: {
        duration: 0.5,
        ease: [0.7, 0, 0.84, 0]
      }
    })
  };

  return (
    <div className="home-website-wrapper" style={{ backgroundColor: '#FDFBF7', color: '#3B241C', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ---------------- NAVBAR ---------------- */}
      <Navbar 
        activePage="services"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToContact={onGoToContact}
        onGoToDashboard={onGoToDashboard}
        onGoToLogin={onGoToLogin}
        onOpenBooking={() => {
          if (onOpenBooking) onOpenBooking();
          else openBookingForCurrent();
        }}
        onOpenDonate={onOpenDonate || (() => alert('Thank you for supporting Temple Seva!'))}
      />

      {/* ---------------- HERO / SLIDER SECTION ---------------- */}
      <main style={{ padding: '120px 2rem 60px 2rem', position: 'relative', overflow: 'hidden', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
        
        {/* Subtle Background Radial Glow */}
        <div 
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70vw',
            height: '70vh',
            background: 'radial-gradient(circle, rgba(200, 155, 75, 0.08) 0%, rgba(253, 251, 247, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          
          {/* Main 2-Column Split Grid */}
          <div className="services-split-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
            
            {/* LEFT COLUMN: Text Content & Actions */}
            <div className="services-left-content" style={{ position: 'relative', zIndex: 2 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide.id}
                  custom={direction}
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {/* Numbering + Tag */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#C89B4B' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.18em', color: '#A57C52', textTransform: 'uppercase' }}>
                      {currentSlide.tag} • {currentSlide.number} / 08
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 
                    style={{ 
                      fontFamily: "'Cinzel', serif", 
                      fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', 
                      fontWeight: 800, 
                      color: '#3B241C', 
                      lineHeight: 1.15,
                      marginBottom: '1.5rem',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {currentSlide.title}
                  </h1>

                  {/* Description */}
                  <p 
                    style={{ 
                      fontSize: 'clamp(1rem, 1.2vw, 1.15rem)', 
                      color: '#5C3A2E', 
                      lineHeight: 1.7, 
                      marginBottom: '2.5rem',
                      maxWidth: '560px',
                      fontWeight: 400
                    }}
                  >
                    {currentSlide.description}
                  </p>

                  {/* Primary CTA Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3.5rem' }}>
                    <button
                      onClick={() => openBookingForCurrent(currentSlide.serviceName)}
                      style={{
                        backgroundColor: '#C89B4B',
                        color: '#3B241C',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '1rem',
                        fontWeight: 800,
                        padding: '1rem 2.5rem',
                        borderRadius: '99px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 25px rgba(200, 155, 75, 0.35)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem'
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
                      {currentSlide.cta} <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Bottom Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(200, 155, 75, 0.25)' }}>
                {/* Arrow Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <button 
                    onClick={handlePrev} 
                    aria-label="Previous Slide"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '1.5px solid #C89B4B',
                      backgroundColor: 'transparent',
                      color: '#3B241C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#C89B4B';
                      e.currentTarget.style.color = '#FFFDF9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#3B241C';
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button 
                    onClick={handleNext} 
                    aria-label="Next Slide"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '1.5px solid #C89B4B',
                      backgroundColor: 'transparent',
                      color: '#3B241C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#C89B4B';
                      e.currentTarget.style.color = '#FFFDF9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#3B241C';
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Dots Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {SERVICE_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                      style={{
                        width: idx === currentIndex ? '28px' : '8px',
                        height: '8px',
                        borderRadius: '99px',
                        backgroundColor: idx === currentIndex ? '#C89B4B' : 'rgba(200, 155, 75, 0.3)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 3D Rotating Circular Sculpture Container */}
            <div className="services-right-sculpture" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', perspective: '1000px' }}>
              
              {/* Outer Decorative Rotating Sun Mandala Ring */}
              <div 
                style={{
                  position: 'absolute',
                  width: '480px',
                  height: '480px',
                  borderRadius: '50%',
                  border: '1px dashed rgba(200, 155, 75, 0.4)',
                  pointerEvents: 'none',
                  animation: 'spinMandala 40s linear infinite'
                }}
              />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide.id}
                  custom={direction}
                  variants={circleVariants}
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
        onGoToAbout={onGoToAbout}
        onGoToLogin={onGoToLogin}
        onOpenBooking={() => {
          if (onOpenBooking) onOpenBooking();
          else openBookingForCurrent('Temple Pooja & Darshan');
        }}
      />

      {/* Global CSS Keyframes for Mandala Rotation & Responsive Split Grid */}
      <style>{`
        @keyframes spinMandala {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 992px) {
          .services-split-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
}
