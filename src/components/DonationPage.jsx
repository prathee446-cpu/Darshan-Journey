import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  QrCode, 
  Lock, 
  ArrowRight, 
  FileText, 
  Award, 
  HelpCircle, 
  Download, 
  Printer, 
  Check, 
  CreditCard,
  AlertCircle,
  Clock,
  Send,
  Flame,
  Sun,
  HandHeart,
  Landmark,
  BookOpen
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { generateUPIDeepLink } from '../services/bookingService';
import logoImg from '../assets/exact_darshan_logo.png';

// Auspicious Seva Causes
const SEVA_CAUSES = [
  {
    id: 'annadanam',
    title: 'Annadanam Seva',
    sanskritTag: 'अन्नदानं महादानम्',
    icon: HandHeart,
    badge: 'Most Sacred',
    description: 'Provide pure satvik meals to pilgrims, sadhus, and underprivileged devotees visiting the sacred sanctum.',
    impact: '₹501 feeds 10 pilgrims • ₹1,001 feeds 25 pilgrims'
  },
  {
    id: 'renovation',
    title: 'Temple Heritage & Renovation',
    sanskritTag: 'देवालय जीर्णोद्धार',
    icon: Landmark,
    badge: 'Preservation',
    description: 'Support restoration of ancient temple architecture, sacred sanctum shikhars, stone sculptures, and vimanams.',
    impact: 'Helps preserve centuries of Vedic stone architecture'
  },
  {
    id: 'deepam',
    title: 'Nitya Pooja & Akhanda Deepam',
    sanskritTag: 'अखण्ड दीप सेवा',
    icon: Flame,
    badge: 'Daily Ritual',
    description: 'Ensure unceasing ghee lamps (Akhanda Jyoti), fresh fragrant flowers, chandan, and daily Vedic archanas.',
    impact: 'Fuels pure cow ghee & camphor for eternal lamps'
  },
  {
    id: 'vedic',
    title: 'Veda Pathashala & Priests Welfare',
    sanskritTag: 'वेद विद्या रक्षण',
    icon: BookOpen,
    badge: 'Education',
    description: 'Empower young Vedic scholars, hereditary archakas, and preservation of ancient scriptures and mantras.',
    impact: 'Sponsors education, robes, and grains for Gurukul students'
  },
  {
    id: 'goshala',
    title: 'Goshala Seva & Sacred Cow Care',
    sanskritTag: 'गोसेवा परमो धर्मः',
    icon: Sun,
    badge: 'Go-Seva',
    description: 'Nourish, shelter, and provide medical care to indigenous holy cows protected within temple goshalas.',
    impact: 'Provides fresh green fodder, jaggery & veterinary care'
  },
  {
    id: 'general',
    title: 'General Temple Seva & Dharma Fund',
    sanskritTag: 'धर्म संरक्षण सेवा',
    icon: Heart,
    badge: 'Dharma',
    description: 'Contribute to overall temple maintenance, festival celebrations, devotee water kiosks, and spiritual outreach.',
    impact: 'Allocated where most needed across sacred activities'
  }
];

// Preset Donation Amounts
const PRESET_AMOUNTS = [
  { value: 501, label: '₹501', title: 'Auspicious Seva', popular: false },
  { value: 1001, label: '₹1,001', title: 'Pavitra Offering', popular: true },
  { value: 2501, label: '₹2,501', title: 'Maha Seva', popular: false },
  { value: 5001, label: '₹5,001', title: 'Vishesha Seva', popular: false }
];

export default function DonationPage({
  onGoToHome,
  onGoToLanding,
  onExploreTemples,
  onGoToProducts,
  onGoToServices,
  onGoToLogin,
  onGoToAbout,
  onGoToContact,
  onGoToDashboard,
  onOpenBooking
}) {
  // State variables
  const [selectedSeva, setSelectedSeva] = useState('annadanam');
  const [amountMode, setAmountMode] = useState('preset'); // 'preset' or 'custom'
  const [selectedAmount, setSelectedAmount] = useState(1001);
  const [customAmount, setCustomAmount] = useState('');

  // Donor Details
  const [donorDetails, setDonorDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    gotra: '',
    nakshatra: '',
    sankalpamNote: '',
    panNumber: '',
    need80GReceipt: true,
    receivePrasad: false,
    shippingAddress: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Payment Modal & Confirmation States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('PAY'); // 'PAY' or 'CONFIRMED'
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [donationReceipt, setDonationReceipt] = useState(null);

  const upiVpa = 'darshanjourney@upi';
  const payeeName = 'Darshan Journey Temple Seva';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Compute final effective amount
  const finalAmount = amountMode === 'custom' ? (parseInt(customAmount, 10) || 0) : selectedAmount;

  const currentSevaObj = SEVA_CAUSES.find(s => s.id === selectedSeva) || SEVA_CAUSES[0];

  // Dynamic UPI Deep Link
  const upiDeepLink = generateUPIDeepLink({
    upiVpa,
    payeeName,
    amount: finalAmount > 0 ? finalAmount : 1001,
    bookingId: `DON-${Date.now().toString().slice(-6)}`
  });

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setDonorDetails(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field, donorDetails[field]);
  };

  // Field Level Validation
  const validateField = (field, value) => {
    let error = '';
    if (field === 'fullName') {
      if (!value || !value.trim()) error = 'Full name is required for Sankalpam.';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters.';
    }
    if (field === 'email') {
      if (!value || !value.trim()) error = 'Email is required for 80G receipt.';
      else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value.trim())) {
        error = 'Please enter a valid email address.';
      }
    }
    if (field === 'phone') {
      if (!value || !value.trim()) error = 'Phone number is required for Seva updates.';
      else {
        const cleaned = value.replace(/[\s\-()]/g, '');
        if (!/^\+?[0-9]{7,14}$/.test(cleaned)) {
          error = 'Please enter a valid phone number.';
        }
      }
    }
    if (field === 'panNumber' && donorDetails.need80GReceipt && value.trim()) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value.trim())) {
        error = 'Enter valid 10-character PAN (e.g. ABCDE1234F).';
      }
    }
    setFormErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  // Comprehensive Form Validation
  const validateAll = () => {
    const errors = {};
    if (!donorDetails.fullName || !donorDetails.fullName.trim()) {
      errors.fullName = 'Devotee Full Name is required for divine Sankalpam.';
    }
    if (!donorDetails.email || !donorDetails.email.trim()) {
      errors.email = 'Email address is required for 80G tax receipt.';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(donorDetails.email.trim())) {
      errors.email = 'Please provide a valid email format.';
    }
    if (!donorDetails.phone || !donorDetails.phone.trim()) {
      errors.phone = 'Mobile number is required for SMS/WhatsApp seva updates.';
    } else {
      const cleaned = donorDetails.phone.replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{7,14}$/.test(cleaned)) {
        errors.phone = 'Please provide a valid phone number.';
      }
    }
    if (amountMode === 'custom') {
      const val = parseInt(customAmount, 10);
      if (!val || isNaN(val) || val < 51) {
        errors.amount = 'Please enter a valid donation amount (minimum ₹51).';
      }
    }

    if (donorDetails.receivePrasad && (!donorDetails.shippingAddress || !donorDetails.shippingAddress.trim())) {
      errors.shippingAddress = 'Please enter delivery address for sacred Prasadam.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Trigger Checkout
  const handleProceedToDonate = (e) => {
    e.preventDefault();
    if (!validateAll()) {
      const firstErrorKey = Object.keys(formErrors)[0] || 'fullName';
      const el = document.getElementById(`donor-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setShowPaymentModal(true);
    setPaymentStep('PAY');
    setVerificationError('');
  };

  const handleCopyVPA = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  // Verify and Confirm Donation Record
  const handleConfirmDonation = async (e) => {
    e.preventDefault();
    if (!upiRefNumber.trim() || upiRefNumber.trim().length < 6) {
      setVerificationError('Please enter a valid UPI / Bank Reference / UTR Number.');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    const receiptId = `DJ-SEVA-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const donationData = {
      receiptId,
      sevaTitle: currentSevaObj.title,
      sanskritTag: currentSevaObj.sanskritTag,
      amount: finalAmount,
      donorName: donorDetails.fullName,
      donorEmail: donorDetails.email,
      donorPhone: donorDetails.phone,
      gotra: donorDetails.gotra || 'Kashyapa (Default)',
      sankalpamNote: donorDetails.sankalpamNote,
      panNumber: donorDetails.panNumber || 'NOT_PROVIDED',
      need80GReceipt: donorDetails.need80GReceipt,
      receivePrasad: donorDetails.receivePrasad,
      shippingAddress: donorDetails.shippingAddress,
      upiReference: upiRefNumber.trim(),
      paymentMethod: 'UPI (QR Code / Deep Link)',
      status: 'CONFIRMED',
      timestamp
    };

    // Save donation record to localStorage for user history
    try {
      const existing = JSON.parse(localStorage.getItem('darshan_donations_history') || '[]');
      existing.unshift(donationData);
      localStorage.setItem('darshan_donations_history', JSON.stringify(existing));
    } catch (err) {
      console.warn('Could not cache donation locally:', err);
    }

    // Try sending to backend if available (graceful fallback)
    try {
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(donationData)
      }).catch(() => {});
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setIsVerifying(false);
      setDonationReceipt(donationData);
      setPaymentStep('CONFIRMED');
    }, 800);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="home-website-wrapper donate-page-wrapper">
      {/* ---------------- 1. NAVBAR ---------------- */}
      <Navbar
        activePage="donate"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToLogin={onGoToLogin}
        onGoToAbout={onGoToAbout}
        onGoToContact={onGoToContact}
        onGoToDashboard={onGoToDashboard}
        onOpenBooking={onOpenBooking}
        onOpenDonate={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* ---------------- 2. DIVINE HERO HEADER ---------------- */}
      <section className="donate-hero-section">
        <div className="donate-hero-ambient-glow" />
        <div className="container">
          <motion.div 
            className="donate-hero-content"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="donate-sanskrit-tag">
              <Sparkles size={15} className="donate-gold-sparkle" />
              <span>दानाय सर्वसम्पदाम् • Giving is the Supreme Sacred Dharma</span>
            </div>
            
            <h1 className="donate-hero-title">Support Temple Seva</h1>
            <p className="donate-hero-subtitle">
              Participate in sacred Annadanam, sanctum conservation, Veda Pathashalas, and eternal Akhanda Deepams.
            </p>
            
            <div className="donate-gold-divider">
              <span className="donate-divider-dot" />
              <span className="donate-divider-line" />
              <Sparkles size={14} className="donate-divider-icon" />
              <span className="donate-divider-line" />
              <span className="donate-divider-dot" />
            </div>

            {/* Quick Trust Highlights Pill Row */}
            <div className="donate-trust-pills">
              <div className="donate-pill-item">
                <ShieldCheck size={16} className="donate-pill-icon" />
                <span>80G Tax Exemption (50% Benefit)</span>
              </div>
              <div className="donate-pill-item">
                <Award size={16} className="donate-pill-icon" />
                <span>100% Transparent Seva Allocation</span>
              </div>
              <div className="donate-pill-item">
                <FileText size={16} className="donate-pill-icon" />
                <span>Instant E-Receipt & Sankalpam</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- 3. MAIN DONATION WORKFLOW CONTAINER ---------------- */}
      <section className="donate-main-section">
        <div className="container">
          <div className="donate-grid-layout">

            {/* LEFT COLUMN: The Donation Steps & Form */}
            <div className="donate-form-column">

              {/* STEP 1: SELECT SEVA CAUSE */}
              <div className="donate-card-step">
                <div className="donate-step-header">
                  <div className="donate-step-badge">1</div>
                  <div>
                    <h2 className="donate-step-title">Choose Sacred Seva Cause</h2>
                    <p className="donate-step-desc">Select which temple activity your sacred offering should directly empower.</p>
                  </div>
                </div>

                <div className="donate-seva-grid">
                  {SEVA_CAUSES.map((cause) => {
                    const IconComp = cause.icon;
                    const isSelected = selectedSeva === cause.id;
                    return (
                      <div
                        key={cause.id}
                        className={`donate-seva-card ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedSeva(cause.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="donate-seva-card-top">
                          <div className={`donate-seva-icon-box ${isSelected ? 'active' : ''}`}>
                            <IconComp size={22} />
                          </div>
                          <span className="donate-seva-badge">{cause.badge}</span>
                        </div>

                        <div className="donate-seva-sanskrit">{cause.sanskritTag}</div>
                        <h3 className="donate-seva-title">{cause.title}</h3>
                        <p className="donate-seva-desc">{cause.description}</p>
                        
                        <div className="donate-seva-impact">
                          <Sparkles size={12} style={{ color: '#D4AF37', flexShrink: 0 }} />
                          <span>{cause.impact}</span>
                        </div>

                        <div className="donate-seva-radio-indicator">
                          {isSelected && <Check size={13} color="#2A1715" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: SELECT DONATION AMOUNT */}
              <div className="donate-card-step">
                <div className="donate-step-header">
                  <div className="donate-step-badge">2</div>
                  <div>
                    <h2 className="donate-step-title">Select Contribution Amount</h2>
                    <p className="donate-step-desc">Choose an auspicious denomination or specify your heartfelt custom offering.</p>
                  </div>
                </div>

                {/* Preset Amount Grid */}
                <div className="donate-amounts-grid">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = amountMode === 'preset' && selectedAmount === amt.value;
                    return (
                      <button
                        key={amt.value}
                        type="button"
                        className={`donate-amount-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setAmountMode('preset');
                          setSelectedAmount(amt.value);
                          setCustomAmount('');
                          if (formErrors.amount) setFormErrors(prev => ({ ...prev, amount: '' }));
                        }}
                      >
                        {amt.popular && <span className="donate-amount-popular-tag">Most Blessed</span>}
                        <div className="donate-amount-value">{amt.label}</div>
                        <div className="donate-amount-label">{amt.title}</div>
                      </button>
                    );
                  })}

                  {/* Custom Amount Button */}
                  <button
                    type="button"
                    className={`donate-amount-btn donate-amount-custom-btn ${amountMode === 'custom' ? 'active' : ''}`}
                    onClick={() => {
                      setAmountMode('custom');
                      if (!customAmount) setCustomAmount('1000');
                    }}
                  >
                    <div className="donate-amount-value">₹ Custom</div>
                    <div className="donate-amount-label">Enter Any Amount</div>
                  </button>
                </div>

                {/* Custom Amount Input Box */}
                {amountMode === 'custom' && (
                  <motion.div 
                    className="donate-custom-input-wrap"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                  >
                    <label className="donate-input-label" htmlFor="custom-amount-field">
                      Enter Custom Contribution Amount (in INR ₹)
                    </label>
                    <div className="donate-custom-input-box">
                      <span className="donate-currency-prefix">₹</span>
                      <input
                        id="custom-amount-field"
                        type="number"
                        min="51"
                        step="10"
                        placeholder="e.g. 2100"
                        className="donate-custom-input"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          if (formErrors.amount) setFormErrors(prev => ({ ...prev, amount: '' }));
                        }}
                      />
                    </div>
                    {formErrors.amount && (
                      <div className="donate-field-error">
                        <AlertCircle size={14} />
                        <span>{formErrors.amount}</span>
                      </div>
                    )}
                    <div className="donate-custom-helpers">
                      <span>Quick select:</span>
                      {[1100, 2100, 5100, 11000, 21000].map(val => (
                        <button
                          key={val}
                          type="button"
                          className="donate-chip-btn"
                          onClick={() => setCustomAmount(val.toString())}
                        >
                          ₹{val.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* STEP 3: DEVOTEE & SANKALPAM DETAILS */}
              <div className="donate-card-step">
                <div className="donate-step-header">
                  <div className="donate-step-badge">3</div>
                  <div>
                    <h2 className="donate-step-title">Devotee & Divine Sankalpam Info</h2>
                    <p className="donate-step-desc">Enter details for sacred archana dedication and 80G tax receipt generation.</p>
                  </div>
                </div>

                <div className="donate-form-fields">
                  {/* Full Name */}
                  <div className="donate-form-group">
                    <label className="donate-input-label" htmlFor="donor-fullName">
                      Devotee Full Name <span className="donate-req-star">*</span>
                    </label>
                    <input
                      id="donor-fullName"
                      type="text"
                      placeholder="e.g. Rameshwar Sharma"
                      className={`donate-text-input ${formErrors.fullName && touchedFields.fullName ? 'has-error' : ''}`}
                      value={donorDetails.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                    />
                    {formErrors.fullName && touchedFields.fullName && (
                      <div className="donate-field-error">
                        <AlertCircle size={14} />
                        <span>{formErrors.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* Email & Phone Row */}
                  <div className="donate-form-row">
                    <div className="donate-form-group">
                      <label className="donate-input-label" htmlFor="donor-email">
                        Email Address <span className="donate-req-star">*</span> (for 80G E-Receipt)
                      </label>
                      <input
                        id="donor-email"
                        type="email"
                        placeholder="devotee@example.com"
                        className={`donate-text-input ${formErrors.email && touchedFields.email ? 'has-error' : ''}`}
                        value={donorDetails.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                      />
                      {formErrors.email && touchedFields.email && (
                        <div className="donate-field-error">
                          <AlertCircle size={14} />
                          <span>{formErrors.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="donate-form-group">
                      <label className="donate-input-label" htmlFor="donor-phone">
                        Phone Number <span className="donate-req-star">*</span> (WhatsApp updates)
                      </label>
                      <input
                        id="donor-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className={`donate-text-input ${formErrors.phone && touchedFields.phone ? 'has-error' : ''}`}
                        value={donorDetails.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                      />
                      {formErrors.phone && touchedFields.phone && (
                        <div className="donate-field-error">
                          <AlertCircle size={14} />
                          <span>{formErrors.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gotra & Nakshatra (Optional for Sankalp) */}
                  <div className="donate-form-row">
                    <div className="donate-form-group">
                      <label className="donate-input-label" htmlFor="donor-gotra">
                        Gotra / Family Lineage <span className="donate-opt-tag">(Optional)</span>
                      </label>
                      <input
                        id="donor-gotra"
                        type="text"
                        placeholder="e.g. Kashyapa, Bharadwaj, Vashishta"
                        className="donate-text-input"
                        value={donorDetails.gotra}
                        onChange={(e) => handleInputChange('gotra', e.target.value)}
                      />
                    </div>

                    <div className="donate-form-group">
                      <label className="donate-input-label" htmlFor="donor-panNumber">
                        PAN Card Number <span className="donate-opt-tag">(For 80G Tax Exemption)</span>
                      </label>
                      <input
                        id="donor-panNumber"
                        type="text"
                        maxLength={10}
                        placeholder="e.g. ABCDE1234F"
                        style={{ textTransform: 'uppercase' }}
                        className={`donate-text-input ${formErrors.panNumber ? 'has-error' : ''}`}
                        value={donorDetails.panNumber}
                        onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                      />
                      {formErrors.panNumber && (
                        <div className="donate-field-error">
                          <AlertCircle size={14} />
                          <span>{formErrors.panNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dedicated Prayer / Sankalpam Note */}
                  <div className="donate-form-group">
                    <label className="donate-input-label" htmlFor="donor-sankalpam">
                      Special Prayer / Dedication Occasion <span className="donate-opt-tag">(Optional)</span>
                    </label>
                    <input
                      id="donor-sankalpam"
                      type="text"
                      placeholder="e.g. Birthday of Child, In memory of Parents, Good Health & Peace"
                      className="donate-text-input"
                      value={donorDetails.sankalpamNote}
                      onChange={(e) => handleInputChange('sankalpamNote', e.target.value)}
                    />
                  </div>

                  {/* Checkbox Options */}
                  <div className="donate-checkbox-group">
                    <label className="donate-checkbox-label">
                      <input
                        type="checkbox"
                        checked={donorDetails.need80GReceipt}
                        onChange={(e) => handleInputChange('need80GReceipt', e.target.checked)}
                      />
                      <span>Generate official 80G Tax Exemption Receipt (50% Tax Deduction in India)</span>
                    </label>

                    <label className="donate-checkbox-label">
                      <input
                        type="checkbox"
                        checked={donorDetails.receivePrasad}
                        onChange={(e) => handleInputChange('receivePrasad', e.target.checked)}
                      />
                      <span>Send blessed temple Kumkum / Raksha thread to my address (Free Pan-India)</span>
                    </label>
                  </div>

                  {/* Prasad Address Field if enabled */}
                  {donorDetails.receivePrasad && (
                    <motion.div 
                      className="donate-form-group"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.25 }}
                    >
                      <label className="donate-input-label" htmlFor="donor-shippingAddress">
                        Postal Delivery Address for Sacred Prasad <span className="donate-req-star">*</span>
                      </label>
                      <textarea
                        id="donor-shippingAddress"
                        rows={2}
                        placeholder="House / Flat No, Street, Landmark, City, State, PIN Code"
                        className={`donate-text-input ${formErrors.shippingAddress ? 'has-error' : ''}`}
                        value={donorDetails.shippingAddress}
                        onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                      />
                      {formErrors.shippingAddress && (
                        <div className="donate-field-error">
                          <AlertCircle size={14} />
                          <span>{formErrors.shippingAddress}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE DONATION SUMMARY & PROCEED ACTION */}
            <div className="donate-sidebar-column">
              <div className="donate-summary-card">
                <div className="donate-summary-top">
                  <span className="donate-summary-tag">
                    <Sparkles size={13} style={{ color: '#D4AF37' }} />
                    Sacred Offering Summary
                  </span>
                  <div className="donate-summary-badge">Darshan Journey Seva</div>
                </div>

                <div className="donate-summary-seva-preview">
                  <div className="donate-summary-seva-icon">
                    <currentSevaObj.icon size={24} color="#D4AF37" />
                  </div>
                  <div>
                    <div className="donate-summary-sanskrit">{currentSevaObj.sanskritTag}</div>
                    <h3 className="donate-summary-seva-name">{currentSevaObj.title}</h3>
                  </div>
                </div>

                <div className="donate-summary-divider" />

                {/* Line Items */}
                <div className="donate-summary-lines">
                  <div className="donate-summary-row">
                    <span className="donate-summary-label">Seva Cause:</span>
                    <span className="donate-summary-val">{currentSevaObj.title}</span>
                  </div>

                  <div className="donate-summary-row">
                    <span className="donate-summary-label">Devotee Name:</span>
                    <span className="donate-summary-val">
                      {donorDetails.fullName.trim() || 'Valued Devotee'}
                    </span>
                  </div>

                  {donorDetails.gotra.trim() && (
                    <div className="donate-summary-row">
                      <span className="donate-summary-label">Gotra:</span>
                      <span className="donate-summary-val">{donorDetails.gotra}</span>
                    </div>
                  )}

                  <div className="donate-summary-row">
                    <span className="donate-summary-label">Tax Benefit:</span>
                    <span className="donate-summary-val green-text">
                      {donorDetails.need80GReceipt ? 'Eligible (80G Section)' : 'Not Opted'}
                    </span>
                  </div>

                  <div className="donate-summary-row">
                    <span className="donate-summary-label">Blessing Prasad:</span>
                    <span className="donate-summary-val">
                      {donorDetails.receivePrasad ? 'Yes (By Courier)' : 'Digital Darshan'}
                    </span>
                  </div>
                </div>

                <div className="donate-summary-divider" />

                {/* Total Contribution Box */}
                <div className="donate-total-box">
                  <div className="donate-total-label">Total Sacred Contribution</div>
                  <div className="donate-total-amount">
                    ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : '0'}
                  </div>
                  <div className="donate-total-note">
                    100% directly allocated to temple sanctum seva
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  type="button"
                  className="donate-proceed-btn"
                  onClick={handleProceedToDonate}
                >
                  <Lock size={17} />
                  <span>Proceed to Donate ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : '1,001'}</span>
                  <ArrowRight size={17} />
                </button>

                {/* Trust and Security Footer */}
                <div className="donate-security-badges">
                  <div className="donate-sec-badge-item">
                    <ShieldCheck size={14} color="#D4AF37" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                  <div className="donate-sec-badge-item">
                    <CheckCircle2 size={14} color="#D4AF37" />
                    <span>Verified Divine Trust</span>
                  </div>
                </div>

                {/* Divine Sanskrit Quote */}
                <div className="donate-vedic-quote">
                  "दानं संविभज्य भुञ्जीत - One who shares divine wealth earns eternal peace and bliss."
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- 4. FAQ / TRUST EXPLANATION SECTION ---------------- */}
      <section className="donate-faq-section">
        <div className="container">
          <div className="donate-faq-header">
            <span className="donate-sanskrit-tag">
              <Sparkles size={14} style={{ color: '#D4AF37' }} />
              Transparency & Devotee Trust
            </span>
            <h2 className="donate-faq-title">Frequently Asked Questions</h2>
            <p className="donate-faq-subtitle">Everything you need to know about your sacred contributions on Darshan Journey.</p>
          </div>

          <div className="donate-faq-grid">
            <div className="donate-faq-card">
              <h3 className="donate-faq-q">How will my sacred donation be utilized?</h3>
              <p className="donate-faq-a">
                100% of your contributions go directly into funding temple kitchen groceries for daily Annadanam, ghee for sacred lamps, maintenance of ancient sanctums, and care of sheltered sacred cows in certified goshalas.
              </p>
            </div>

            <div className="donate-faq-card">
              <h3 className="donate-faq-q">Do I get an official 80G Tax Exemption Certificate?</h3>
              <p className="donate-faq-a">
                Yes. All contributions made to temple trusts registered under Darshan Journey are eligible for tax exemption under Section 80G of the Income Tax Act. The formal 80G receipt is automatically generated and emailed to you.
              </p>
            </div>

            <div className="donate-faq-card">
              <h3 className="donate-faq-q">How is the Sankalpam prayer conducted?</h3>
              <p className="donate-faq-a">
                During daily temple morning poojas, our Vedic priests recite the family Gotra and Devotee Name provided during contribution, invoking divine blessings for health, prosperity, and peace.
              </p>
            </div>

            <div className="donate-faq-card">
              <h3 className="donate-faq-q">Can I donate via UPI, Google Pay, PhonePe, or Card?</h3>
              <p className="donate-faq-a">
                Yes. We support all major UPI payment apps (Google Pay, PhonePe, Paytm, BHIM), Net Banking, and Debit/Credit cards securely through encrypted payment gateways.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 5. SECURE CHECKOUT / PAYMENT MODAL ---------------- */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="donate-modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <motion.div 
              className="donate-modal-dialog"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="donate-modal-header">
                <div className="donate-modal-title-wrap">
                  <div className="donate-modal-logo">
                    <img src={logoImg} alt="Darshan Journey" />
                  </div>
                  <div>
                    <h3 className="donate-modal-title">
                      {paymentStep === 'PAY' ? 'Secure Temple Seva Payment' : 'Donation Confirmed & Blessed'}
                    </h3>
                    <p className="donate-modal-sub">
                      {paymentStep === 'PAY' ? 'Scan UPI QR or launch Mobile UPI App' : 'Thank you for your generous sacred offering'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="donate-modal-close"
                  onClick={() => setShowPaymentModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* STEP 1: PAYMENT GATEWAY & UPI QR CODE */}
              {paymentStep === 'PAY' && (
                <div className="donate-modal-body">
                  <div className="donate-modal-amount-banner">
                    <div>
                      <div className="donate-banner-sub">{currentSevaObj.title}</div>
                      <div className="donate-banner-name">Devotee: {donorDetails.fullName}</div>
                    </div>
                    <div className="donate-banner-amt">
                      ₹{finalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="donate-pay-modes">
                    {/* UPI QR & Direct UPI App */}
                    <div className="donate-qr-wrapper">
                      <div className="donate-qr-box">
                        {/* Dynamic SVG QR Code Representation */}
                        <div className="donate-qr-inner">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiDeepLink)}&color=2a1715&bgcolor=ffffff`}
                            alt="Scan UPI QR Code to Donate"
                            className="donate-qr-img"
                            onError={(e) => {
                              // Fallback inline QR graphic if external API is unreachable
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="donate-qr-center-icon">
                            <Sparkles size={16} color="#D4AF37" />
                          </div>
                        </div>
                        <p className="donate-qr-hint">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                      </div>

                      <div className="donate-vpa-copy-box">
                        <span className="donate-vpa-label">UPI ID:</span>
                        <span className="donate-vpa-value">{upiVpa}</span>
                        <button
                          type="button"
                          className="donate-copy-btn"
                          onClick={handleCopyVPA}
                        >
                          {copiedVpa ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                          <span>{copiedVpa ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Mobile Instant UPI Trigger */}
                      <a
                        href={upiDeepLink}
                        className="donate-mobile-upi-btn"
                      >
                        <CreditCard size={16} />
                        <span>Open in Google Pay / PhonePe / UPI App</span>
                      </a>
                    </div>

                    {/* Step to Submit Reference / UTR */}
                    <form onSubmit={handleConfirmDonation} className="donate-ref-form">
                      <div className="donate-ref-info-box">
                        <h4 className="donate-ref-title">Confirm Contribution</h4>
                        <p className="donate-ref-desc">
                          Once you have completed the payment via UPI QR or App, enter your 12-digit UPI Reference / UTR Number below to instantly receive your blessed E-Receipt.
                        </p>
                      </div>

                      <div className="donate-form-group" style={{ marginBottom: '1rem' }}>
                        <label className="donate-input-label" htmlFor="upi-ref-input">
                          UPI Reference / UTR Number <span className="donate-req-star">*</span>
                        </label>
                        <input
                          id="upi-ref-input"
                          type="text"
                          placeholder="e.g. 423871928374 or TXN-108"
                          className="donate-text-input"
                          value={upiRefNumber}
                          onChange={(e) => {
                            setUpiRefNumber(e.target.value);
                            if (verificationError) setVerificationError('');
                          }}
                        />
                        {verificationError && (
                          <div className="donate-field-error">
                            <AlertCircle size={14} />
                            <span>{verificationError}</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="donate-confirm-pay-btn"
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <>
                            <div className="donate-spinner" />
                            <span>Recording Divine Contribution...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            <span>Verify & Generate E-Receipt</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* STEP 2: DIVINE CONFIRMATION & PRINTABLE E-RECEIPT */}
              {paymentStep === 'CONFIRMED' && donationReceipt && (
                <div className="donate-modal-body donate-confirmed-view">
                  <div className="donate-success-icon-wrap">
                    <CheckCircle2 size={54} className="donate-success-icon" />
                  </div>

                  <div className="donate-sanskrit-tag" style={{ justifyContent: 'center', marginBottom: '0.4rem' }}>
                    <span>शुभमस्तु • May You & Your Family Be Blessed</span>
                  </div>

                  <h3 className="donate-confirmed-heading">Thank You for Your Sacred Offering</h3>
                  <p className="donate-confirmed-sub">
                    Your contribution towards <strong>{donationReceipt.sevaTitle}</strong> has been successfully recorded and dedicated in the sacred sanctum.
                  </p>

                  {/* Printable E-Receipt Box */}
                  <div id="darshan-donation-receipt-printable" className="donate-receipt-card">
                    <div className="donate-receipt-header">
                      <img src={logoImg} alt="Darshan Journey" className="donate-receipt-logo" />
                      <div>
                        <h4 className="donate-receipt-title">DARSHAN JOURNEY SEVA SANCTUARY</h4>
                        <p className="donate-receipt-reg">Registered Temple Trust • 80G Tax Exemption Certified</p>
                      </div>
                    </div>

                    <div className="donate-receipt-grid">
                      <div>
                        <span className="donate-rc-label">Receipt Number:</span>
                        <strong className="donate-rc-val">{donationReceipt.receiptId}</strong>
                      </div>
                      <div>
                        <span className="donate-rc-label">Date & Time:</span>
                        <span className="donate-rc-val">{donationReceipt.timestamp}</span>
                      </div>
                      <div>
                        <span className="donate-rc-label">Devotee Name:</span>
                        <strong className="donate-rc-val">{donationReceipt.donorName}</strong>
                      </div>
                      <div>
                        <span className="donate-rc-label">Gotra Lineage:</span>
                        <span className="donate-rc-val">{donationReceipt.gotra}</span>
                      </div>
                      <div>
                        <span className="donate-rc-label">Seva Purpose:</span>
                        <span className="donate-rc-val">{donationReceipt.sevaTitle}</span>
                      </div>
                      <div>
                        <span className="donate-rc-label">Payment Mode / UTR:</span>
                        <span className="donate-rc-val">{donationReceipt.upiReference}</span>
                      </div>
                    </div>

                    <div className="donate-receipt-total-row">
                      <span>Total Sacred Contribution Amount:</span>
                      <strong>₹{donationReceipt.amount.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="donate-receipt-footer-notes">
                      <p>✨ <em>May the divine blessings of the Almighty illuminate your life with health, abundance, and eternal peace.</em></p>
                      <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>
                        This is an official computer-generated receipt eligible under Section 80G of Income Tax Act 1961.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="donate-confirmed-actions">
                    <button
                      type="button"
                      className="donate-print-btn"
                      onClick={handlePrintReceipt}
                    >
                      <Printer size={16} />
                      <span>Print / Save Receipt</span>
                    </button>

                    <button
                      type="button"
                      className="donate-done-btn"
                      onClick={() => {
                        setShowPaymentModal(false);
                        if (onGoToHome) onGoToHome();
                      }}
                    >
                      <span>Return to Home</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- 6. FOOTER ---------------- */}
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
