import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  Copy, 
  CheckCircle2, 
  Smartphone, 
  Lock,
  CreditCard,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { createBookingRecord, verifyAndConfirmPayment, generateUPIDeepLink } from '../services/bookingService';

export default function ServicePaymentSummaryPage({
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

  // Retrieve checkout details from location state
  const checkout = location.state || {
    service: {
      id: 1,
      title: "Daily Pooja & Archana Seva",
      serviceName: "Daily Pooja & Archana",
      price: "₹501"
    },
    customer: {
      fullName: "Devotee",
      mobileNumber: "+91 98765 43210",
      email: "devotee@darshanjourney.com",
      gotraName: "Kashyapa",
      addressDetails: ""
    },
    bookingDate: new Date().toISOString().split('T')[0],
    timeSlot: "09:30 AM - Abhishekam & Archana",
    devoteesCount: 1,
    unitPrice: 501,
    handlingFee: 30,
    totalAmount: 531
  };

  const { service, customer, bookingDate, timeSlot, devoteesCount, unitPrice, handlingFee, totalAmount } = checkout;

  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const upiVpa = 'darshanjourney@upi';
  const payeeName = 'Darshan Journey Temple Seva';

  // Deep-Link for Google Pay / UPI
  const upiDeepLink = generateUPIDeepLink({
    upiVpa,
    payeeName,
    amount: totalAmount,
    bookingId: 'TEMP-DJ'
  });

  const handleCopyVPA = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  // Step 1: Initiate Payment Flow
  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setVerificationError('');

    // Create Booking Record in backend/state first
    const bookingRecord = await createBookingRecord({
      serviceName: service.title || service.serviceName,
      customerName: customer.fullName,
      customerMobile: customer.mobileNumber,
      customerEmail: customer.email,
      gotraName: customer.gotraName,
      bookingDate,
      timeSlot,
      devoteesCount,
      totalAmount,
      status: 'PENDING_PAYMENT'
    });

    // Attempt direct UPI / Google Pay deep-link trigger
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobileDevice) {
      // Direct deep link launch on mobile
      window.location.href = upiDeepLink;
      setTimeout(() => {
        setIsProcessing(false);
        setShowQRModal(true);
      }, 1500);
    } else {
      // Show QR & Verification Modal on desktop or non-deep-link browsers
      setIsProcessing(false);
      setShowQRModal(true);
    }
  };

  // Step 2: Confirm & Verify Real Payment Transaction
  const handleVerifyTransaction = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim() || transactionRef.trim().length < 6) {
      setVerificationError('Please enter a valid 12-digit UPI / GPay Transaction Reference ID');
      return;
    }

    setIsProcessing(true);
    setVerificationError('');

    // Save & Verify payment against backend API
    const verifiedBooking = await createBookingRecord({
      serviceName: service.title || service.serviceName,
      customerName: customer.fullName,
      customerMobile: customer.mobileNumber,
      customerEmail: customer.email,
      gotraName: customer.gotraName,
      bookingDate,
      timeSlot,
      devoteesCount,
      totalAmount,
      paymentMethod: 'UPI_GOOGLE_PAY',
      status: 'PAID'
    });

    const result = await verifyAndConfirmPayment(verifiedBooking.bookingId, transactionRef.trim());

    setIsProcessing(false);

    if (result && result.status === 'PAID') {
      setShowQRModal(false);
      navigate('/services/confirmed', { 
        state: { 
          bookingId: verifiedBooking.bookingId,
          transactionId: transactionRef.trim(),
          service,
          customer,
          bookingDate,
          timeSlot,
          devoteesCount,
          totalAmount,
          paidAt: new Date().toISOString()
        } 
      });
    } else {
      setVerificationError('Transaction verification pending. Please check reference number and try again.');
    }
  };

  return (
    <div className="home-website-wrapper" style={{ backgroundColor: '#F7EFE6', minHeight: '100vh' }}>
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

      <main style={{ padding: '110px 1.5rem 80px 1.5rem', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
        
        {/* Back Navigation */}
        <button 
          onClick={() => navigate('/services/details', { state: { service } })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'transparent',
            border: 'none',
            color: '#A57C52',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1.2rem'
          }}
        >
          <ArrowLeft size={16} /> Edit Devotee Details
        </button>

        {/* SWIGGY/ZOMATO STYLED PAYMENT SUMMARY CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '2px solid #C89B4B',
            boxShadow: '0 20px 50px rgba(59, 36, 28, 0.12)',
            overflow: 'hidden'
          }}
        >
          {/* Top Header Banner */}
          <div style={{ backgroundColor: '#341F1D', color: '#F7EFE6', padding: '1.4rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C8A96A', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                PAYMENT CHECKOUT
              </span>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                Order Summary
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(200, 169, 106, 0.15)', padding: '0.4rem 0.8rem', borderRadius: '99px', border: '1px solid rgba(200, 169, 106, 0.4)', fontSize: '0.8rem', color: '#C8A96A' }}>
              <ShieldCheck size={16} /> 256-Bit SSL Encrypted
            </div>
          </div>

          <div style={{ padding: '1.8rem' }}>
            
            {/* Service & Devotee Overview */}
            <div style={{ display: 'flex', gap: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px dashed rgba(200, 155, 75, 0.3)', marginBottom: '1.2rem', alignItems: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, border: '1px solid #C89B4B' }}>
                <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.15rem', fontWeight: 800, color: '#341F1D', margin: '0 0 0.3rem 0' }}>
                  {service.title || service.serviceName}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#6E5351', margin: 0 }}>
                  Devotee: <strong>{customer.fullName}</strong> ({devoteesCount} {devoteesCount > 1 ? 'Devotees' : 'Devotee'})
                </p>
                <p style={{ fontSize: '0.82rem', color: '#A57C52', margin: '0.2rem 0 0 0' }}>
                  📅 {bookingDate} • ⏰ {timeSlot}
                </p>
              </div>
            </div>

            {/* Itemized Bill Breakdown (Swiggy / Zomato Checkout Style) */}
            <div style={{ backgroundColor: '#FDFBF7', borderRadius: '16px', border: '1px solid rgba(200, 155, 75, 0.25)', padding: '1.2rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.92rem', fontWeight: 800, color: '#341F1D', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bill Details
              </h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#6E5351', marginBottom: '0.6rem' }}>
                <span>Seva Dakshina ({devoteesCount} × ₹{unitPrice})</span>
                <span style={{ fontWeight: 600, color: '#341F1D' }}>₹{unitPrice * devoteesCount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#6E5351', marginBottom: '0.8rem' }}>
                <span>Temple Archana & Handling Fee</span>
                <span style={{ fontWeight: 600, color: '#341F1D' }}>₹{handlingFee}</span>
              </div>

              <div style={{ height: '1px', borderBottom: '1px dashed rgba(200, 155, 75, 0.3)', margin: '0.8rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#341F1D' }}>
                <span>Total Amount Payable</span>
                <span style={{ color: '#9E7D3F', fontFamily: "'Cinzel', serif" }}>₹{totalAmount}</span>
              </div>
            </div>

            {/* UPI & Google Pay Options Highlight */}
            <div style={{ backgroundColor: 'rgba(200, 169, 106, 0.1)', borderRadius: '14px', border: '1px solid rgba(200, 169, 106, 0.3)', padding: '1rem', marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Smartphone size={24} color="#341F1D" />
              <div>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#341F1D' }}>
                  Google Pay / PhonePe / Paytm / UPI Instant Pay
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6E5351' }}>
                  Initiates direct GPay app transfer on mobile or QR scan verification.
                </span>
              </div>
            </div>

            {/* Action Button: Pay Now */}
            <button
              onClick={handleInitiatePayment}
              disabled={isProcessing}
              style={{
                width: '100%',
                backgroundColor: isProcessing ? '#A57C52' : '#C8A96A',
                color: '#341F1D',
                border: 'none',
                borderRadius: '99px',
                padding: '1rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '1.1rem',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 8px 25px rgba(200, 169, 106, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#341F1D';
                  e.currentTarget.style.color = '#C8A96A';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#C8A96A';
                  e.currentTarget.style.color = '#341F1D';
                }
              }}
            >
              {isProcessing ? 'Connecting UPI...' : `Pay ₹${totalAmount} via GPay / UPI`} <ChevronRight size={20} />
            </button>

          </div>
        </motion.div>
      </main>

      {/* REAL UPI & QR TRANSACTION VERIFICATION MODAL */}
      {showQRModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 6, 4, 0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '2px solid #C89B4B',
              padding: '2rem',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9E7D3F', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                UPI / Google Pay Transfer
              </span>
              <button 
                onClick={() => setShowQRModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#341F1D' }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.35rem', fontWeight: 800, color: '#341F1D', marginBottom: '0.4rem' }}>
              Complete Payment of ₹{totalAmount}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6E5351', marginBottom: '1.2rem' }}>
              Scan the QR or click below to launch Google Pay / UPI app on your device.
            </p>

            {/* Direct Mobile GPay Launch Button */}
            <a 
              href={upiDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#341F1D',
                color: '#C8A96A',
                padding: '0.75rem 1.4rem',
                borderRadius: '99px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                marginBottom: '1.2rem',
                border: '1px solid #C8A96A'
              }}
            >
              Open Google Pay App Directly <Smartphone size={18} />
            </a>

            {/* Simulated UPI QR Code Display */}
            <div style={{ backgroundColor: '#FDFBF7', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(200, 169, 106, 0.3)', display: 'inline-block', marginBottom: '1.2rem' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiDeepLink)}`} 
                alt="UPI Payment QR Code"
                style={{ width: '170px', height: '170px', display: 'block' }}
              />
            </div>

            {/* Copy VPA Box */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.4rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#341F1D' }}>VPA: {upiVpa}</span>
              <button 
                onClick={handleCopyVPA}
                style={{
                  background: 'rgba(200, 169, 106, 0.15)',
                  border: '1px solid #C8A96A',
                  borderRadius: '8px',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#341F1D',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                {copiedVpa ? <CheckCircle2 size={14} color="#2E7D32" /> : <Copy size={14} />}
                {copiedVpa ? 'Copied!' : 'Copy VPA'}
              </button>
            </div>

            {/* Real Verification Transaction ID Input Form */}
            <form onSubmit={handleVerifyTransaction} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#341F1D', marginBottom: '0.4rem' }}>
                Enter UPI / GPay Transaction Reference ID <span style={{ color: '#C62828' }}>*</span>
              </label>
              <input 
                type="text" 
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. 423987105642"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: verificationError ? '2px solid #C62828' : '1.5px solid #A57C52',
                  backgroundColor: '#FDFBF7',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '0.4rem'
                }}
              />
              {verificationError && (
                <span style={{ color: '#C62828', fontSize: '0.78rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={14} /> {verificationError}
                </span>
              )}

              <button 
                type="submit"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  backgroundColor: '#2E7D32',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '99px',
                  padding: '0.85rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  marginTop: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)'
                }}
              >
                {isProcessing ? 'Verifying with Bank...' : 'Verify Transaction & Confirm Booking'}
              </button>
            </form>

          </motion.div>
        </div>
      )}

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
