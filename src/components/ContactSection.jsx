import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitted(false);
  };

  return (
    <section id="contact" className="contact-us-section">
      {/* Ambient Radial Glow & Texture */}
      <div className="contact-bg-glow" />
      <div className="contact-bg-pattern" />

      <div className="contact-container">
        {/* Main 2-Column Grid */}
        <div className="contact-grid">
          {/* LEFT SIDE: Heading, Subtitle & Contact Details */}
          <div className="contact-left-panel">
            <div className="contact-header-box">
              <span className="contact-tag">
                <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
                REACH OUT TO US
              </span>
              <h2 className="contact-heading">Get in Touch</h2>
              <p className="contact-subtitle">
                We're here to help you on your spiritual journey.
              </p>
            </div>

            <div className="contact-cards-list">
              {/* Email Card */}
              <div className="contact-detail-card">
                <div className="contact-icon-wrapper">
                  <Mail size={22} className="contact-icon" />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">Email</span>
                  <a href="mailto:contact@darshanjourney.org" className="contact-card-value">
                    contact@darshanjourney.org
                  </a>
                  <p className="contact-card-subtext">Dedicated responses for all spiritual & darshan inquiries</p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="contact-detail-card">
                <div className="contact-icon-wrapper">
                  <Phone size={22} className="contact-icon" />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">Phone</span>
                  <a href="tel:+914522344360" className="contact-card-value">
                    +91 (044) 2836 7890 / +91 98765 43210
                  </a>
                  <p className="contact-card-subtext">Sanctuary desk available daily for live guidance</p>
                </div>
              </div>

              {/* Temple Address Card */}
              <div className="contact-detail-card">
                <div className="contact-icon-wrapper">
                  <MapPin size={22} className="contact-icon" />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">Temple Address</span>
                  <span className="contact-card-value">
                    108 Sacred Temple Way, Spiritual Corridor, Madurai, Tamil Nadu 625001
                  </span>
                  <p className="contact-card-subtext">Nestled amidst quiet holy surroundings</p>
                </div>
              </div>

              {/* Opening Hours Card */}
              <div className="contact-detail-card">
                <div className="contact-icon-wrapper">
                  <Clock size={22} className="contact-icon" />
                </div>
                <div className="contact-card-content">
                  <span className="contact-card-label">Opening Hours</span>
                  <span className="contact-card-value">
                    Daily: 5:00 AM – 9:00 PM
                  </span>
                  <p className="contact-card-subtext">Mangala Aarti: 5:30 AM | Sandhya Aarti: 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Minimal Glassmorphism Contact Form */}
          <div className="contact-right-panel">
            <div className="contact-form-glass-card">
              <h3 className="contact-form-title">Send a Devotional Message</h3>
              <p className="contact-form-desc">
                Fill in your details below and our temple sanctuary team will connect with you.
              </p>

              {isSubmitted ? (
                <div className="contact-success-box">
                  <CheckCircle2 size={48} className="contact-success-icon" />
                  <h4 className="contact-success-title">Message Received with Gratitude</h4>
                  <p className="contact-success-text">
                    May divine peace accompany your path. We have received your query and will respond shortly.
                  </p>
                  <button className="contact-reset-btn" onClick={handleReset}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-field-group">
                    <label className="contact-label" htmlFor="contact-name">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      className="contact-input"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field-group">
                    <label className="contact-label" htmlFor="contact-email">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      className="contact-input"
                      placeholder="devotee@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field-group">
                    <label className="contact-label" htmlFor="contact-subject">Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      className="contact-input"
                      placeholder="Pooja Booking / Sacred Inquiry"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field-group">
                    <label className="contact-label" htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="4"
                      className="contact-textarea"
                      placeholder="Write your message or request..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button type="submit" className="contact-submit-btn">
                    Send Message <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* BELOW SECTION: Embedded Google Map with rounded corners */}
        <div className="contact-map-wrapper">
          <div className="contact-map-card">
            <iframe
              title="Temple Sanctuary Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.1584852936746!2d78.11723527588047!3d9.919506674457788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc6055a40a32e7c!2sArulmigu%20Meenakshi%20Sundaraswarar%20Temple!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="contact-map-iframe"
            />
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="contact-footer-note">
          <div className="contact-note-divider" />
          <p className="contact-note-text">
            "May your path be filled with peace, devotion, and divine blessings."
          </p>
          <div className="contact-note-divider" />
        </div>
      </div>
    </section>
  );
}
