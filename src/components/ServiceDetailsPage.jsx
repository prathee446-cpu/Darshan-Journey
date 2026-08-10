import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Info,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

export default function ServiceDetailsPage({
  onGoToHome,
  onGoToLanding,
  onExploreTemples,
  onGoToServices,
  onGoToAbout,
  onGoToLogin,
  onOpenBooking
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, pendingBookingService, clearPendingService } = useAuth();

  // Selected Service / Item state (passed from ItemDetails or restored from AuthContext)
  const incomingService = location.state?.service || pendingBookingService;
  const initialQuantity = location.state?.itemQuantity || 1;

  const serviceData = incomingService || {
    id: 'pe-1',
    title: "Daily Pooja & Archana Seva",
    tag: "DAILY RITUALS",
    serviceName: "Daily Pooja & Archana",
    description: "Book personalized daily Archana and Abhishekam performed in your name and gotra by revered temple priests in sacred sanctums.",
    price: "₹501",
    numericPrice: 501,
    image: "https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=1000&q=80"
  };

  // Extract numeric unit price
  const unitPrice = serviceData.numericPrice || (serviceData.price ? parseInt(serviceData.price.replace(/[^0-9]/g, ''), 10) : 501) || 501;

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('09:30 AM - Abhishekam & Archana');
  const [devoteesCount, setDevoteesCount] = useState(initialQuantity);
  const [gotraName, setGotraName] = useState('');
  const [addressDetails, setAddressDetails] = useState('');

  // Validation Error State
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Devotee full name is required';
    if (!mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(mobileNumber.trim())) {
      errs.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!bookingDate) errs.bookingDate = 'Please select a valid date';
    if (!timeSlot) errs.timeSlot = 'Please select a time slot';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToSummary = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const totalAmount = unitPrice * devoteesCount;
    const checkoutDetails = {
      service: serviceData,
      customer: {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        gotraName: gotraName.trim(),
        addressDetails: addressDetails.trim()
      },
      bookingDate,
      timeSlot,
      devoteesCount,
      unitPrice,
      handlingFee: 30,
      totalAmount: totalAmount + 30
    };

    clearPendingService();
    navigate('/services/summary', { state: checkoutDetails });
  };

  return (
    <div className="home-website-wrapper" style={{ backgroundColor: '#FDFBF7', minHeight: '100vh' }}>
      <Navbar 
        activePage="services"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToLogin={onGoToLogin}
        onOpenBooking={onOpenBooking}
      />

      <main style={{ padding: '110px 1.5rem 80px 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Back to Services Navigation */}
        <button 
          onClick={() => navigate('/services')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: '#A57C52',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#3B241C'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#A57C52'}
        >
          <ArrowLeft size={18} /> Back to All Services & Sevas
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* LEFT SIDE: Service Info Card & Features */}
          <div>
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid rgba(200, 155, 75, 0.3)',
                boxShadow: '0 15px 40px rgba(59, 36, 28, 0.07)',
                overflow: 'hidden',
                marginBottom: '2rem'
              }}
            >
              {/* Service Hero Image */}
              <div style={{ position: 'relative', height: '280px', width: '100%', overflow: 'hidden' }}>
                <img 
                  src={serviceData.image} 
                  alt={serviceData.title || serviceData.serviceName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(59, 36, 28, 0.7) 100%)' }} />
                
                <span 
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: '#3B241C',
                    color: '#C89B4B',
                    border: '1px solid #C89B4B',
                    padding: '0.4rem 1rem',
                    borderRadius: '99px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase'
                  }}
                >
                  {serviceData.tag || 'SACRED SEVA'}
                </span>
              </div>

              {/* Service Details Body */}
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', fontWeight: 800, color: '#3B241C', margin: 0 }}>
                    {serviceData.title || serviceData.serviceName}
                  </h1>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.5rem', fontWeight: 800, color: '#C89B4B' }}>
                    {serviceData.price || `₹${unitPrice}`}
                  </span>
                </div>

                <p style={{ color: '#5C3A2E', fontSize: '1rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  {serviceData.description}
                </p>

                {/* Important Service Highlights */}
                <div style={{ backgroundColor: '#FDFBF7', borderRadius: '16px', border: '1px dashed rgba(200, 155, 75, 0.4)', padding: '1.2rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.95rem', fontWeight: 800, color: '#3B241C', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} color="#C89B4B" /> Spiritual Significance & Guarantees
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: '#5C3A2E' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="#2E7D32" /> Performed strictly according to authentic Agama Shastra rituals.
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="#2E7D32" /> Devotee name & Gotra recited during Sankalpam.
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} color="#2E7D32" /> Live streaming link / Video updates sent directly to WhatsApp.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Devotee & Booking Details Form */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '2px solid #C89B4B',
              boxShadow: '0 20px 50px rgba(59, 36, 28, 0.1)',
              padding: '2.2rem'
            }}
          >
            <div style={{ marginBottom: '1.8rem', borderBottom: '1px solid rgba(200, 155, 75, 0.3)', paddingBottom: '1rem' }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.5rem', fontWeight: 800, color: '#3B241C', margin: 0 }}>
                Devotee & Booking Details
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#A57C52', marginTop: '0.3rem', margin: 0 }}>
                Provide devotee details for sacred Sankalpam and booking confirmation.
              </p>
            </div>

            <form onSubmit={handleProceedToSummary}>
              
              {/* Full Name */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>
                  Devotee Full Name <span style={{ color: '#C62828' }}>*</span>
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Anantharaman Sharma" 
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: errors.fullName ? '2px solid #C62828' : '1.5px solid #A57C52',
                    backgroundColor: '#FDFBF7',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.fullName && <span style={{ color: '#C62828', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>{errors.fullName}</span>}
              </div>

              {/* Mobile Number & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>
                    Mobile Number <span style={{ color: '#C62828' }}>*</span>
                  </label>
                  <input 
                    type="tel" 
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210" 
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: errors.mobileNumber ? '2px solid #C62828' : '1.5px solid #A57C52',
                      backgroundColor: '#FDFBF7',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.mobileNumber && <span style={{ color: '#C62828', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>{errors.mobileNumber}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>
                    Email Address <span style={{ color: '#C62828' }}>*</span>
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="devotee@gmail.com" 
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: errors.email ? '2px solid #C62828' : '1.5px solid #A57C52',
                      backgroundColor: '#FDFBF7',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.email && <span style={{ color: '#C62828', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>{errors.email}</span>}
                </div>
              </div>

              {/* Booking Date & Time Slot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>
                    Seva Date <span style={{ color: '#C62828' }}>*</span>
                  </label>
                  <input 
                    type="date" 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: errors.bookingDate ? '2px solid #C62828' : '1.5px solid #A57C52',
                      backgroundColor: '#FDFBF7',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>
                    Time Slot <span style={{ color: '#C62828' }}>*</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: errors.timeSlot ? '2px solid #C62828' : '1.5px solid #A57C52',
                      backgroundColor: '#FDFBF7',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="06:00 AM - Morning Suprabhatam & Aarti">06:00 AM - Morning Suprabhatam</option>
                    <option value="09:30 AM - Abhishekam & Archana">09:30 AM - Abhishekam & Archana</option>
                    <option value="06:30 PM - Evening Deeparadhana">06:30 PM - Evening Deeparadhana</option>
                    <option value="08:30 PM - Night Sayana Aarti">08:30 PM - Night Sayana Aarti</option>
                  </select>
                </div>
              </div>

              {/* Devotees Count & Gotra */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>
                    Number of Devotees
                  </label>
                  <select
                    value={devoteesCount}
                    onChange={(e) => setDevoteesCount(parseInt(e.target.value, 10))}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #A57C52',
                      backgroundColor: '#FDFBF7',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>{n} Devotee{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>
                    Gotra & Rashi (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={gotraName}
                    onChange={(e) => setGotraName(e.target.value)}
                    placeholder="e.g. Kashyapa, Mesha Rashi" 
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #A57C52',
                      backgroundColor: '#FDFBF7',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Delivery Address / Special Notes */}
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.4rem' }}>
                  Delivery Address / Special Instructions (Optional)
                </label>
                <textarea 
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="Provide address for Prashad delivery or specific prayer notes..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #A57C52',
                    backgroundColor: '#FDFBF7',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Button: Proceed to Payment Summary */}
              <button 
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#C89B4B',
                  color: '#3B241C',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '1rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 25px rgba(200, 155, 75, 0.35)',
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
                Proceed to Payment Summary <ChevronRight size={20} />
              </button>
            </form>
          </div>

        </div>

      </main>

      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToLogin={onGoToLogin}
        onOpenBooking={onOpenBooking}
      />
    </div>
  );
}
