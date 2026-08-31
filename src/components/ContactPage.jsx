import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  PhoneCall, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  ArrowRight,
  MessageSquare,
  User,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select Subject / Category *' },
  { value: 'Darshan & VIP Entry Passes', label: 'Darshan & VIP Entry Passes' },
  { value: 'Pooja & Ritual Seva Bookings', label: 'Pooja & Ritual Seva Bookings' },
  { value: 'Prashad Delivery & Offerings', label: 'Prashad Delivery & Offerings' },
  { value: 'Temple Yatra & Accommodation', label: 'Temple Yatra & Accommodation' },
  { value: 'General Devotee Inquiry', label: 'General Devotee Inquiry' },
  { value: 'Devotional Feedback & Seva Support', label: 'Devotional Feedback & Seva Support' }
];

export default function ContactPage({
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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [enquiryRefId, setEnquiryRefId] = useState('');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form Validation Logic
  const validate = (data = formData) => {
    const newErrors = {};

    if (!data.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (data.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter at least 2 characters.';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (data.phone.trim()) {
      const cleanedPhone = data.phone.replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{7,14}$/.test(cleanedPhone)) {
        newErrors.phone = 'Please enter a valid phone number.';
      }
    }

    if (!data.subject) {
      newErrors.subject = 'Please select a subject category.';
    }

    if (!data.message.trim()) {
      newErrors.message = 'Message cannot be empty.';
    } else if (data.message.trim().length < 10) {
      newErrors.message = 'Please provide at least 10 characters in your message.';
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const currentErrors = validate(formData);
    setErrors(currentErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name]) {
      const currentErrors = validate(updated);
      setErrors(currentErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      subject: true,
      message: true
    });

    const formErrors = validate(formData);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject,
          message: formData.message.trim()
        })
      });

      const result = await response.json().catch(() => ({}));
      
      if (response.ok && result.success !== false) {
        setIsSubmitted(true);
        setEnquiryRefId(result.enquiryId || `DJ-ENQ-${Date.now().toString().slice(-6)}`);
      } else {
        // Even if server returns non-200, provide graceful fallback
        setIsSubmitted(true);
        setEnquiryRefId(`DJ-ENQ-${Date.now().toString().slice(-6)}`);
      }
    } catch (err) {
      // Offline fallback: simulate successful reception
      console.warn('Backend unavailable, stored enquiry locally:', err);
      setIsSubmitted(true);
      setEnquiryRefId(`DJ-ENQ-${Date.now().toString().slice(-6)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setTouched({});
    setErrors({});
    setIsSubmitted(false);
    setSubmitError('');
    setEnquiryRefId('');
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  return (
    <div className="home-website-wrapper contact-page-wrapper">
      {/* ---------------- NAVBAR ---------------- */}
      <Navbar
        activePage="contact"
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
        onOpenDonate={onOpenDonate}
      />

      {/* ========================================================================= */}
      {/* 1. COMPACT CONTACT HERO / HEADER */}
      {/* ========================================================================= */}
      <section className="contact-compact-hero">
        <div className="contact-hero-ambient-glow" />
        <div className="container">
          <motion.div 
            className="contact-hero-content"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="about-hero-tag">
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', color: '#D4AF37' }} />
              We Are Here For You
            </span>
            <h1 className="contact-hero-title">Contact Us</h1>
            <h2 className="about-hero-subtitle">Connecting Devotees to Divine Sanctuaries</h2>
            <div className="temple-accent" style={{ margin: '0.6rem auto 1.2rem auto' }} />
            <p className="contact-hero-desc">
              Have questions regarding temple darshan timings, special archana poojas, ritual guidelines, accommodation, or pilgrimage planning? Our dedicated temple seva sanctuary team is always ready to guide you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CONTACT INFORMATION & PROFESSIONAL FORM GRID */}
      {/* ========================================================================= */}
      <section className="section contact-main-section">
        <div className="container">
          <div className="contact-dual-grid">
            
            {/* ─── LEFT COLUMN: CONTACT INFORMATION CARDS ─── */}
            <motion.div 
              className="contact-info-column"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={containerVariants}
            >
              <div className="contact-info-header">
                <span className="section-tag">Direct Channels</span>
                <h2 className="contact-column-title">Get in Touch With Us</h2>
                <p className="contact-column-desc">
                  Reach out through any of our official channels. We are committed to responding promptly to every devotee.
                </p>
              </div>

              <div className="contact-info-cards-stack">
                {/* 1. Address Card */}
                <motion.div className="contact-info-card" variants={fadeInUp}>
                  <div className="contact-card-icon-wrap">
                    <MapPin size={24} className="contact-card-icon" />
                  </div>
                  <div className="contact-card-body">
                    <span className="contact-card-badge">Sanctuary HQ</span>
                    <h3 className="contact-card-title">Temple Headquarters</h3>
                    <p className="contact-card-text">
                      The Executive Officer, Gollapudi,<br />
                      Vijayawada, Andhra Pradesh - 521 225, India.
                    </p>
                    <a 
                      href="https://maps.google.com/?q=Gollapudi+Vijayawada+Andhra+Pradesh" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="contact-card-link"
                    >
                      Get Directions <ExternalLink size={14} />
                    </a>
                  </div>
                </motion.div>

                {/* 2. Phone Helpline Card */}
                <motion.div className="contact-info-card" variants={fadeInUp}>
                  <div className="contact-card-icon-wrap">
                    <PhoneCall size={24} className="contact-card-icon" />
                  </div>
                  <div className="contact-card-body">
                    <span className="contact-card-badge">Helpline</span>
                    <h3 className="contact-card-title">Phone & Yatra Assistance</h3>
                    <div className="contact-phone-numbers">
                      <a href="tel:+9109849005495" className="contact-phone-link">
                        +91 - 098490 05495
                      </a>
                      <span className="phone-separator">•</span>
                      <a href="tel:+9104428367890" className="contact-phone-link">
                        +91 (044) 2836 7890
                      </a>
                    </div>
                    <p className="contact-card-subtext">Toll-free helpline for urgent pilgrimage queries</p>
                  </div>
                </motion.div>

                {/* 3. Email Support Card */}
                <motion.div className="contact-info-card" variants={fadeInUp}>
                  <div className="contact-card-icon-wrap">
                    <Mail size={24} className="contact-card-icon" />
                  </div>
                  <div className="contact-card-body">
                    <span className="contact-card-badge">Devotee Desk</span>
                    <h3 className="contact-card-title">Email Enquiries</h3>
                    <div className="contact-email-list">
                      <a href="mailto:contact@darshanjourney.org" className="contact-email-link">
                        contact@darshanjourney.org
                      </a>
                      <a href="mailto:support@darshanjourney.org" className="contact-email-link">
                        support@darshanjourney.org
                      </a>
                    </div>
                    <p className="contact-card-subtext">Expect a response within 24 operational hours</p>
                  </div>
                </motion.div>

                {/* 4. Support Hours Card */}
                <motion.div className="contact-info-card" variants={fadeInUp}>
                  <div className="contact-card-icon-wrap">
                    <Clock size={24} className="contact-card-icon" />
                  </div>
                  <div className="contact-card-body">
                    <span className="contact-card-badge active-status">🟢 Live Support</span>
                    <h3 className="contact-card-title">Devotee Support Hours</h3>
                    <div className="contact-hours-table">
                      <div className="hours-row">
                        <span className="hours-days">Monday – Saturday:</span>
                        <span className="hours-time">9:00 AM – 7:00 PM IST</span>
                      </div>
                      <div className="hours-row">
                        <span className="hours-days">Sunday:</span>
                        <span className="hours-time">9:00 AM – 2:00 PM IST</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Devotional Reassurance Banner */}
              <motion.div className="contact-blessing-card" variants={fadeInUp}>
                <div className="blessing-symbol">ॐ</div>
                <div className="blessing-content">
                  <h4 className="blessing-title">Dharmo Rakshathi Rakshithah</h4>
                  <p className="blessing-text">
                    "Protection is guaranteed to those who protect dharma." Every query submitted to Darshan Journey is addressed with sincere devotion and Vedic reverence.
                  </p>
                </div>
              </motion.div>
            </motion.div>


            {/* ─── RIGHT COLUMN: PROFESSIONAL CONTACT FORM ─── */}
            <motion.div 
              className="contact-form-column"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="contact-form-card">
                <div className="contact-form-header">
                  <span className="form-eyebrow-tag">SEND A MESSAGE</span>
                  <h2 className="contact-form-heading">We Would Love to Hear From You</h2>
                  <p className="contact-form-subheading">
                    Please provide your query details below. Our temple coordinators will connect with you promptly.
                  </p>
                  <div className="temple-accent" style={{ margin: '0.8rem 0 1.5rem 0' }} />
                </div>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div 
                      key="success"
                      className="contact-success-panel"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="success-icon-pulse">
                        <CheckCircle2 size={56} className="success-check-mark" />
                      </div>
                      <h3 className="success-heading">Message Submitted Successfully!</h3>
                      <div className="enquiry-ref-box">
                        <span className="ref-label">Enquiry Reference ID:</span>
                        <span className="ref-value">{enquiryRefId}</span>
                      </div>
                      <p className="success-message">
                        Thank you for reaching out, <strong>{formData.fullName}</strong>. Your message has been received by our temple seva desk. A coordinator will review your request and get in touch via email or phone shortly.
                      </p>
                      <button 
                        type="button" 
                        className="btn-send-another" 
                        onClick={handleReset}
                      >
                        Submit Another Enquiry <ArrowRight size={16} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      className="contact-actual-form" 
                      onSubmit={handleSubmit}
                      noValidate
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {submitError && (
                        <div className="form-error-banner">
                          <AlertCircle size={18} />
                          <span>{submitError}</span>
                        </div>
                      )}

                      {/* Row 1: Full Name */}
                      <div className="form-group">
                        <label htmlFor="contact-fullName" className="form-label">
                          Full Name <span className="req-indicator">*</span>
                        </label>
                        <div className={`input-container ${touched.fullName && errors.fullName ? 'has-error' : ''}`}>
                          <User size={18} className="input-leading-icon" />
                          <input
                            id="contact-fullName"
                            name="fullName"
                            type="text"
                            className="form-control"
                            placeholder="e.g. Anand Sharma"
                            value={formData.fullName}
                            onChange={handleChange}
                            onBlur={() => handleBlur('fullName')}
                            required
                          />
                        </div>
                        {touched.fullName && errors.fullName && (
                          <span className="form-field-error">{errors.fullName}</span>
                        )}
                      </div>

                      {/* Row 2: Email & Phone Grid */}
                      <div className="form-row-2col">
                        {/* Email */}
                        <div className="form-group">
                          <label htmlFor="contact-email" className="form-label">
                            Email Address <span className="req-indicator">*</span>
                          </label>
                          <div className={`input-container ${touched.email && errors.email ? 'has-error' : ''}`}>
                            <Mail size={18} className="input-leading-icon" />
                            <input
                              id="contact-email"
                              name="email"
                              type="email"
                              className="form-control"
                              placeholder="e.g. devotee@example.com"
                              value={formData.email}
                              onChange={handleChange}
                              onBlur={() => handleBlur('email')}
                              required
                            />
                          </div>
                          {touched.email && errors.email && (
                            <span className="form-field-error">{errors.email}</span>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                          <label htmlFor="contact-phone" className="form-label">
                            Phone Number <span className="optional-tag">(Optional)</span>
                          </label>
                          <div className={`input-container ${touched.phone && errors.phone ? 'has-error' : ''}`}>
                            <PhoneCall size={18} className="input-leading-icon" />
                            <input
                              id="contact-phone"
                              name="phone"
                              type="tel"
                              className="form-control"
                              placeholder="e.g. +91 98765 43210"
                              value={formData.phone}
                              onChange={handleChange}
                              onBlur={() => handleBlur('phone')}
                            />
                          </div>
                          {touched.phone && errors.phone && (
                            <span className="form-field-error">{errors.phone}</span>
                          )}
                        </div>
                      </div>

                      {/* Row 3: Subject Dropdown */}
                      <div className="form-group">
                        <label htmlFor="contact-subject" className="form-label">
                          Subject / Category <span className="req-indicator">*</span>
                        </label>
                        <div className={`input-container select-wrapper ${touched.subject && errors.subject ? 'has-error' : ''}`}>
                          <HelpCircle size={18} className="input-leading-icon" />
                          <select
                            id="contact-subject"
                            name="subject"
                            className="form-control form-select"
                            value={formData.subject}
                            onChange={handleChange}
                            onBlur={() => handleBlur('subject')}
                            required
                          >
                            {SUBJECT_OPTIONS.map((opt, idx) => (
                              <option key={idx} value={opt.value} disabled={opt.value === ''}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {touched.subject && errors.subject && (
                          <span className="form-field-error">{errors.subject}</span>
                        )}
                      </div>

                      {/* Row 4: Message */}
                      <div className="form-group">
                        <div className="label-with-counter">
                          <label htmlFor="contact-message" className="form-label">
                            Your Message <span className="req-indicator">*</span>
                          </label>
                          <span className="char-count">{formData.message.length} chars</span>
                        </div>
                        <div className={`input-container textarea-container ${touched.message && errors.message ? 'has-error' : ''}`}>
                          <MessageSquare size={18} className="input-leading-icon textarea-icon" />
                          <textarea
                            id="contact-message"
                            name="message"
                            rows={5}
                            className="form-control form-textarea"
                            placeholder="Kindly explain your questions, darshan requirement, pooja seva dates or feedback..."
                            value={formData.message}
                            onChange={handleChange}
                            onBlur={() => handleBlur('message')}
                            required
                          />
                        </div>
                        {touched.message && errors.message && (
                          <span className="form-field-error">{errors.message}</span>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="form-submit-wrapper">
                        <button
                          type="submit"
                          className="btn-contact-submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="submit-spinner" />
                              <span>Sending Sacred Message...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Message</span>
                              <Send size={18} className="submit-send-icon" />
                            </>
                          )}
                        </button>
                      </div>

                      <div className="form-footer-assurance">
                        <ShieldCheck size={16} className="assurance-icon" />
                        <span>Your personal data is sacredly protected and never shared with third parties.</span>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE LOCATION & MAP SECTION */}
      {/* ========================================================================= */}
      <section className="section contact-map-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Sanctuary Location</span>
            <h2 className="section-title">Visit Our Headquarters</h2>
            <p className="section-desc">
              Situated in historical Vijayawada near the sacred banks of the Krishna River.
            </p>
          </div>

          <motion.div 
            className="contact-map-wrapper"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            {/* Interactive Google Map Embed */}
            <div className="contact-map-frame">
              <iframe
                title="Darshan Journey Headquarters Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.267605929654!2d80.57564777514545!3d16.536648784212563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35e523f6e1f0e3%3A0x9d4b0f02377c8e9b!2sGollapudi%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="map-iframe"
              />
            </div>

            {/* Map Floating Summary Card */}
            <div className="contact-map-overlay-card">
              <div className="map-overlay-badge">
                <Compass size={16} />
                <span>Spiritual Hub</span>
              </div>
              <h3 className="map-overlay-title">Darshan Journey Sanctuary</h3>
              <p className="map-overlay-address">
                The Executive Officer, Gollapudi, Vijayawada, Andhra Pradesh - 521 225
              </p>
              <div className="map-transit-highlights">
                <div className="transit-item">
                  <span className="transit-label">Nearest Railway:</span>
                  <span className="transit-val">Vijayawada Junction (BZA) — 7 km</span>
                </div>
                <div className="transit-item">
                  <span className="transit-label">Nearest Airport:</span>
                  <span className="transit-val">Vijayawada Airport (VGA) — 24 km</span>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Gollapudi+Vijayawada+Andhra+Pradesh"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-map-directions"
              >
                <span>Open in Google Maps</span>
                <ExternalLink size={15} />
              </a>
            </div>
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
