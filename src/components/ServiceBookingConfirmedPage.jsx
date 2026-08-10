import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Download, 
  Printer, 
  Home, 
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ServiceBookingConfirmedPage({
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

  // Retrieve confirmation details from state
  const confirmed = location.state || {
    bookingId: 'DJ-SEVA-2026-9841',
    transactionId: 'TXN-98410294812',
    service: {
      title: 'Daily Pooja & Archana Seva',
      serviceName: 'Daily Pooja & Archana',
      price: '₹501'
    },
    customer: {
      fullName: 'Devotee',
      mobileNumber: '+91 98765 43210',
      email: 'devotee@darshanjourney.com',
      gotraName: 'Kashyapa'
    },
    bookingDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:30 AM - Abhishekam & Archana',
    devoteesCount: 1,
    totalAmount: 531,
    paidAt: new Date().toISOString()
  };

  const { bookingId, transactionId, service, customer, bookingDate, timeSlot, devoteesCount, totalAmount, paidAt } = confirmed;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePrintOrDownloadReceipt = () => {
    window.print();
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

      <main style={{ padding: '110px 1.5rem 80px 1.5rem', maxWidth: '760px', margin: '0 auto', width: '100%' }}>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            border: '2px solid #C89B4B',
            boxShadow: '0 25px 60px rgba(59, 36, 28, 0.12)',
            overflow: 'hidden',
            textAlign: 'center'
          }}
        >
          {/* Top Green Banner */}
          <div style={{ backgroundColor: '#2E7D32', color: '#FFFFFF', padding: '2.5rem 2rem 2rem 2rem' }}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem auto',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              <CheckCircle2 size={44} />
            </motion.div>

            <span style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.9, display: 'block', marginBottom: '0.3rem' }}>
              RESERVATION CONFIRMED
            </span>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem', fontWeight: 800, margin: 0 }}>
              Booking Confirmed!
            </h1>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, marginTop: '0.5rem', margin: 0 }}>
              May divine blessings bring peace, health, and prosperity to your family.
            </p>
          </div>

          <div style={{ padding: '2.2rem' }}>
            
            {/* Booking Reference Box */}
            <div style={{ backgroundColor: '#FDFBF7', borderRadius: '16px', border: '1.5px dashed rgba(200, 155, 75, 0.4)', padding: '1.2rem', marginBottom: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A57C52', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                  Booking Reference ID
                </span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', fontWeight: 800, color: '#3B241C' }}>
                  {bookingId}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A57C52', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                  Transaction ID
                </span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.92rem', fontWeight: 700, color: '#2E7D32' }}>
                  {transactionId}
                </span>
              </div>
            </div>

            {/* Service & Devotee Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
              
              {/* Service Info */}
              <div style={{ backgroundColor: '#FAF6F0', borderRadius: '16px', padding: '1.2rem', border: '1px solid rgba(200, 155, 75, 0.25)' }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.92rem', fontWeight: 800, color: '#3B241C', marginTop: 0, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  Seva Details
                </h4>
                <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#3B241C', margin: '0 0 0.4rem 0' }}>
                  {service.title || service.serviceName}
                </p>
                <p style={{ fontSize: '0.88rem', color: '#5C3A2E', margin: '0 0 0.3rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color="#C89B4B" /> Date: <strong>{bookingDate}</strong>
                </p>
                <p style={{ fontSize: '0.88rem', color: '#5C3A2E', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={15} color="#C89B4B" /> Time: <strong>{timeSlot}</strong>
                </p>
              </div>

              {/* Devotee Info */}
              <div style={{ backgroundColor: '#FAF6F0', borderRadius: '16px', padding: '1.2rem', border: '1px solid rgba(200, 155, 75, 0.25)' }}>
                <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.92rem', fontWeight: 800, color: '#3B241C', marginTop: 0, marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                  Devotee Info
                </h4>
                <p style={{ fontSize: '0.98rem', fontWeight: 700, color: '#3B241C', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={15} color="#C89B4B" /> {customer.fullName} ({devoteesCount} Devotee{devoteesCount > 1 ? 's' : ''})
                </p>
                <p style={{ fontSize: '0.85rem', color: '#5C3A2E', margin: '0 0 0.3rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} color="#C89B4B" /> {customer.mobileNumber}
                </p>
                {customer.gotraName && (
                  <p style={{ fontSize: '0.85rem', color: '#5C3A2E', margin: 0 }}>
                    Gotra: <strong>{customer.gotraName}</strong>
                  </p>
                )}
              </div>

            </div>

            {/* Payment Confirmation Banner */}
            <div style={{ backgroundColor: 'rgba(46, 125, 50, 0.08)', borderRadius: '14px', border: '1px solid rgba(46, 125, 50, 0.3)', padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textAlign: 'left' }}>
                <ShieldCheck size={22} color="#2E7D32" />
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2E7D32', display: 'block' }}>
                    Payment Status: PAID via GPay / UPI
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#5C3A2E' }}>
                    Confirmation receipt & live stream details sent via SMS & WhatsApp.
                  </span>
                </div>
              </div>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.25rem', fontWeight: 800, color: '#2E7D32' }}>
                ₹{totalAmount}
              </span>
            </div>

            {/* Actions: Download Receipt & Back to Home */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handlePrintOrDownloadReceipt}
                style={{
                  backgroundColor: '#3B241C',
                  color: '#C89B4B',
                  border: '1.5px solid #C89B4B',
                  borderRadius: '99px',
                  padding: '0.85rem 1.8rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.25s ease'
                }}
              >
                <Printer size={18} /> Print / Save Receipt
              </button>

              <button
                onClick={() => navigate('/services')}
                style={{
                  backgroundColor: '#C89B4B',
                  color: '#3B241C',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '0.85rem 2rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 20px rgba(200, 155, 75, 0.35)',
                  transition: 'all 0.25s ease'
                }}
              >
                Book Another Seva <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </motion.div>
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
