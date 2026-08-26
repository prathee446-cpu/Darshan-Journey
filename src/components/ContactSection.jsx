import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  PhoneCall, 
  MessageCircle, 
  Mail, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function ContactSection({ onGoToHome }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    type: '',
    services: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName && formData.mobileNumber && formData.email && formData.message) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      type: '',
      services: '',
      message: ''
    });
    setIsSubmitted(false);
  };

  return (
    <section id="contact" className="sample-contact-section">
      {/* ---------------- 1. TOP HEADER BANNER ---------------- */}
      <div className="contact-banner-header">
        <div className="contact-container banner-inner">
          <div className="banner-text-content">
            <h1 className="banner-main-title">Contact Us</h1>
            <p className="banner-mantra-tagline">Dharmo Rakshathi Rakshithah</p>
          </div>
          
          <div className="banner-graphic-card">
            <div className="om-symbol-ring">🕉</div>
            <div className="banner-card-text">
              <span className="banner-card-title">Darshan Journey & Endowments Portal</span>
              <span className="banner-card-sub">Preserving Ancient Vedic Heritage</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 2. BREADCRUMB NAV ---------------- */}
      <div className="contact-breadcrumb-bar">
        <div className="contact-container">
          <span 
            className="breadcrumb-link" 
            onClick={onGoToHome}
            style={{ cursor: onGoToHome ? 'pointer' : 'default' }}
          >
            Home
          </span>
          <span className="breadcrumb-sep">&gt;</span>
          <span className="breadcrumb-link">Support</span>
          <span className="breadcrumb-sep">&gt;</span>
          <span className="breadcrumb-active">Contact Us</span>
        </div>
      </div>

      {/* ---------------- 3. MAIN CONTENT GRID ---------------- */}
      <div className="contact-container main-content-wrapper">
        <div className="contact-sample-grid">
          
          {/* LEFT COLUMN: GET IN TOUCH */}
          <div className="sample-left-column">
            <h2 className="get-in-touch-title">Get in touch</h2>
            <div className="title-gold-underline" />

            <div className="info-blocks-stack">
              {/* Block 1: Address */}
              <div className="info-block-item">
                <div className="info-icon-box">
                  <MapPin size={24} className="info-icon" />
                </div>
                <div className="info-block-content">
                  <h3 className="info-block-heading">The Executive officer,</h3>
                  <p className="info-block-address">
                    Gollapudi, Vijayawada<br />
                    Andhra Pradesh - 521 225, India.
                  </p>
                  <a 
                    href="https://maps.google.com/?q=Gollapudi+Vijayawada+Andhra+Pradesh" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-get-directions"
                  >
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Block 2: Phone Hotline */}
              <div className="info-block-item">
                <div className="info-icon-box">
                  <PhoneCall size={24} className="info-icon" />
                </div>
                <div className="info-block-content">
                  <p className="info-block-text">
                    For any booking related queries, please contact Endowments Information Center on
                  </p>
                  <strong className="info-phone-number">+91 - 098490 05495 / +91 (044) 2836 7890</strong>
                  <span className="info-hours">(Mon-Sat, 9:00AM - 7:00PM)</span>
                </div>
              </div>

              {/* Block 3: Friendly Team Note */}
              <div className="info-block-item">
                <div className="info-icon-box">
                  <MessageCircle size={24} className="info-icon" />
                </div>
                <div className="info-block-content">
                  <p className="info-block-text highlight">
                    Our friendly team is always up to answer your queries.
                  </p>
                </div>
              </div>

              {/* Block 4: Email */}
              <div className="info-block-item">
                <div className="info-icon-box">
                  <Mail size={24} className="info-icon" />
                </div>
                <div className="info-block-content">
                  <p className="info-block-text">
                    Care to drop by? You may reach us at
                  </p>
                  <a href="mailto:contact@darshanjourney.org" className="info-email-link">
                    contact@darshanjourney.org
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* VERTICAL DIVIDER */}
          <div className="grid-vertical-divider" />

          {/* RIGHT COLUMN: WE ARE HAPPY TO SERVE YOU FORM (WITH SMOOTH ANIMATED TRANSITION) */}
          <div className="sample-right-column" style={{ position: 'relative', minHeight: '400px' }}>
            <AnimatePresence mode="wait">
              {!showForm ? (
                <motion.div 
                  key="action-card"
                  className="sample-action-card" 
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ 
                    background: 'rgba(30, 18, 15, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(200, 163, 95, 0.3)',
                    borderRadius: '20px',
                    padding: '3.5rem 2rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '380px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)'
                  }}
                >
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(200, 163, 95, 0.15)',
                      border: '1px solid rgba(200, 163, 95, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.5rem',
                      color: '#C8A35F',
                      boxShadow: '0 0 20px rgba(200, 163, 95, 0.25)'
                    }}
                  >
                    <MessageCircle size={32} />
                  </motion.div>

                  <h2 className="form-main-heading" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                    We Are Happy To Serve You
                  </h2>
                  <p className="form-sub-heading" style={{ maxWidth: '420px', margin: '0 auto 2.2rem auto', fontSize: '0.95rem' }}>
                    Have a question or booking request? Click the button below to submit your enquiry to our temple sanctuary team.
                  </p>

                  <motion.button 
                    type="button" 
                    className="btn-sample-submit"
                    onClick={() => setShowForm(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ 
                      fontSize: '1.1rem', 
                      padding: '0.95rem 2.6rem',
                      borderRadius: '8px'
                    }}
                  >
                    Enquiries <ChevronRight size={20} />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  key="form-card"
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'relative' }}
                >
                  <motion.button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    title="Close Enquiries Form"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(200, 163, 95, 0.3)' }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      position: 'absolute',
                      top: '-0.5rem',
                      right: '0',
                      background: 'rgba(200, 163, 95, 0.15)',
                      border: '1px solid rgba(200, 163, 95, 0.35)',
                      color: '#C8A35F',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      zIndex: 10
                    }}
                  >
                    ✕
                  </motion.button>

                <div className="form-header-area">
                  <h2 className="form-main-heading">We Are Happy To Serve You</h2>
                  <p className="form-sub-heading">Please Use The Form Below For Enquiries</p>
                </div>

                {isSubmitted ? (
                  <div className="sample-success-card">
                    <CheckCircle2 size={52} className="success-check-icon" />
                    <h3 className="success-title">Message Submitted Successfully</h3>
                    <p className="success-desc">
                      Thank you for reaching out to us. Our temple sanctuary team will process your enquiry and respond shortly.
                    </p>
                    <button type="button" className="btn-send-another" onClick={handleReset}>
                      Submit Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form className="sample-contact-form" onSubmit={handleSubmit}>
                    <div className="form-fields-grid">
                      
                      {/* First Name */}
                      <div className="sample-field-box">
                        <label className="sample-field-label">
                          First Name <span className="req-star">*</span>
                        </label>
                        <input 
                          type="text" 
                          name="firstName" 
                          className="sample-form-input" 
                          placeholder="Please enter your first name" 
                          value={formData.firstName}
                          onChange={handleChange}
                          required 
                        />
                      </div>

                      {/* Last Name */}
                      <div className="sample-field-box">
                        <label className="sample-field-label">Last Name</label>
                        <input 
                          type="text" 
                          name="lastName" 
                          className="sample-form-input" 
                          placeholder="Please enter your last name" 
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Mobile Number */}
                      <div className="sample-field-box">
                        <label className="sample-field-label">
                          Mobile Number <span className="req-star">*</span>
                        </label>
                        <div className="phone-prefix-wrapper">
                          <div className="flag-prefix-badge">
                            <span className="flag-emoji">🇮🇳</span>
                            <span className="country-code">+91</span>
                          </div>
                          <input 
                            type="tel" 
                            name="mobileNumber" 
                            className="sample-form-input phone-input" 
                            placeholder="Enter mobile number" 
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            required 
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="sample-field-box">
                        <label className="sample-field-label">
                          Email Address <span className="req-star">*</span>
                        </label>
                        <input 
                          type="email" 
                          name="email" 
                          className="sample-form-input" 
                          placeholder="Please enter a valid email id" 
                          value={formData.email}
                          onChange={handleChange}
                          required 
                        />
                      </div>

                      {/* Type Dropdown */}
                      <div className="sample-field-box">
                        <label className="sample-field-label">
                          Type <span className="req-star">*</span>
                        </label>
                        <select 
                          name="type" 
                          className="sample-form-select" 
                          value={formData.type}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select the reason for contact</option>
                          <option value="Pooja Booking Inquiry">Pooja Booking Inquiry</option>
                          <option value="Special Darshan Pass">Special Darshan Pass</option>
                          <option value="Prashad Delivery Request">Prashad Delivery Request</option>
                          <option value="Sanctuary Guidance">Sanctuary Guidance</option>
                          <option value="General Feedback">General Feedback</option>
                        </select>
                      </div>

                      {/* Services Dropdown */}
                      <div className="sample-field-box">
                        <label className="sample-field-label">
                          Services <span className="req-star">*</span>
                        </label>
                        <select 
                          name="services" 
                          className="sample-form-select" 
                          value={formData.services}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a service</option>
                          <option value="Daily Archana Seva">Daily Archana Seva</option>
                          <option value="Special Abhishekam">Special Abhishekam</option>
                          <option value="Virtual Live Darshan">Virtual Live Darshan</option>
                          <option value="Temple Accommodation">Temple Accommodation</option>
                          <option value="Devotional Donation">Devotional Donation</option>
                        </select>
                      </div>

                      {/* Message (Full Width) */}
                      <div className="sample-field-box full-width">
                        <label className="sample-field-label">
                          Message <span className="req-star">*</span>
                        </label>
                        <textarea 
                          name="message" 
                          rows="4" 
                          className="sample-form-textarea" 
                          placeholder="Kindly explain your concerns" 
                          value={formData.message}
                          onChange={handleChange}
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-submit-row">
                      <button type="submit" className="btn-sample-submit">
                        Submit <ChevronRight size={18} />
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </section>
  );
}



