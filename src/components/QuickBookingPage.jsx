import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import {
  CalendarDays, MapPin, Users, Clock, Star, CheckCircle2, Sparkles,
  ChevronRight, Plus, Minus, RotateCcw, Bot, Shield, Zap, Heart,
  Phone, Mail, ArrowRight, Info, Lock, Award, Headphones, Gift, X
} from 'lucide-react';

/* ───────── DATA ───────── */
const TEMPLES = [
  { id: 't1', name: 'Kashi Vishwanath Temple', location: 'Varanasi, UP', duration: '3–4 hrs', price: 1800, badge: 'Trending' },
  { id: 't2', name: 'Tirupati Balaji Temple', location: 'Tirupati, AP', duration: '4–6 hrs', price: 2500, badge: 'Most Visited' },
  { id: 't3', name: 'Meenakshi Amman Temple', location: 'Madurai, TN', duration: '2–3 hrs', price: 1400, badge: 'Premium' },
  { id: 't4', name: 'Somnath Temple', location: 'Gir Somnath, GJ', duration: '2–4 hrs', price: 1600, badge: 'Heritage' },
];

const SERVICES = [
  { id: 's1', name: 'General Darshan', desc: 'Standard temple entry & darshan', price: 0 },
  { id: 's2', name: 'VIP / Special Darshan', desc: 'Priority queue with dedicated priest', price: 1200 },
  { id: 's3', name: 'Abhishekam', desc: 'Holy water ceremony with rituals', price: 2200 },
  { id: 's4', name: 'Archana & Prasad', desc: 'Personalised puja with prasadam', price: 800 },
  { id: 's5', name: 'Sudarshana Homam', desc: 'Sacred fire ritual for prosperity', price: 4500 },
  { id: 's6', name: 'Full-Day Pilgrimage Package', desc: 'Temple tour + accommodation + meals', price: 6500 },
];

const EXTRA_REQUIREMENTS = [
  'Wheelchair accessibility required',
  'Vegetarian / Jain meal preference',
  'Senior citizen assistance (65+)',
  'Child-friendly facilities needed',
  'Photography assistance',
  'Language interpreter (Tamil / Telugu / Hindi)',
];

const WHY_CARDS = [
  { icon: Zap,        title: 'Instant Confirmation',  desc: 'Receive your booking confirmation within 60 seconds via SMS & email.' },
  { icon: Shield,     title: 'Secure & Trusted',      desc: '256-bit SSL encryption. Your personal data is fully protected.' },
  { icon: Headphones, title: '24/7 Devotee Support',  desc: 'Our spiritual concierge team is available around the clock.' },
  { icon: Award,      title: 'Authentic Rituals',     desc: 'All pujas conducted by certified priests following Vedic traditions.' },
];

const HOW_STEPS = [
  { icon: MapPin,       label: 'Choose Your Temple' },
  { icon: CalendarDays, label: 'Pick Date & Time' },
  { icon: Users,        label: 'Add Devotees' },
  { icon: Gift,         label: 'Select Services' },
  { icon: Lock,         label: 'Secure Payment' },
  { icon: CheckCircle2, label: 'Receive Confirmation' },
];

const FAQS = [
  { q: 'How early should I book?', a: 'We recommend booking at least 3–5 days in advance for popular temples like Tirupati or Kashi. Last-minute bookings may have limited slots.' },
  { q: 'Can I cancel or reschedule my booking?', a: 'Yes. Free cancellation or rescheduling is available up to 48 hours before your visit. Cancellations within 48 hours attract a 20% fee.' },
  { q: 'What documents do I need to carry?', a: 'Carry a valid government-issued photo ID (Aadhaar / Passport / Voter ID) and your digital booking confirmation.' },
  { q: 'Are foreigners allowed to visit all temples?', a: 'Some temples like Puri Jagannath restrict non-Hindus. We mark these clearly on each temple page. Please check before booking.' },
  { q: 'Is the payment gateway safe?', a: 'All transactions are processed through RazorPay / Stripe with 256-bit SSL encryption. We never store card details.' },
];

const STEP_LABELS = ['Temple & Service', 'Devotees & Date', 'Contact Details', 'Review & Pay'];

function generateRef() {
  return 'DJ' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ───────── MAIN COMPONENT ───────── */
export default function QuickBookingPage({
  onGoToHome,
  onGoToLanding,
  onExploreTemples,
  onGoToProducts,
  onGoToLogin,
  onGoToAbout,
  onOpenBooking,
}) {
  const [step, setStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [errors, setErrors] = useState({});
  const formTopRef = useRef(null);

  const [form, setForm] = useState({
    temple: '', service: '', adults: 1, children: 0, seniors: 0,
    date: '', time: '', firstName: '', lastName: '',
    email: '', phone: '', city: '', requirements: [], notes: '',
  });

  const selectedTemple  = TEMPLES.find(t => t.id === form.temple);
  const selectedService = SERVICES.find(s => s.id === form.service);
  const totalDevotees   = form.adults + form.children + form.seniors;
  const serviceTotal    = selectedService?.price || 0;
  const templeTotal     = (selectedTemple?.price || 0) * totalDevotees;
  const taxAmount       = Math.round((serviceTotal + templeTotal) * 0.05);
  const grandTotal      = serviceTotal + templeTotal + taxAmount;

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  function handleField(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: '' }));
  }

  function handleCount(field, delta) {
    setForm(f => ({ ...f, [field]: Math.max(0, f[field] + delta) }));
  }

  function handleRequirement(req) {
    setForm(f => ({
      ...f,
      requirements: f.requirements.includes(req)
        ? f.requirements.filter(r => r !== req)
        : [...f.requirements, req],
    }));
  }

  function validate(s) {
    const errs = {};
    if (s === 0) {
      if (!form.temple)  errs.temple  = 'Please select a temple.';
      if (!form.service) errs.service = 'Please select a service.';
    }
    if (s === 1) {
      if (!form.date) errs.date = 'Please choose a visit date.';
      if (!form.time) errs.time = 'Please select a time slot.';
      if (totalDevotees < 1) errs.adults = 'At least 1 devotee required.';
    }
    if (s === 2) {
      if (!form.firstName.trim()) errs.firstName = 'First name is required.';
      if (!form.lastName.trim())  errs.lastName  = 'Last name is required.';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required.';
      if (!form.phone.trim() || form.phone.length < 10) errs.phone = 'Valid phone number required.';
    }
    return errs;
  }

  function nextStep() {
    const errs = validate(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(s => Math.min(3, s + 1));
  }

  function prevStep() { setStep(s => Math.max(0, s - 1)); }

  function handleSubmit() {
    const ref = generateRef();
    setBookingRef(ref);
    setShowSuccess(true);
  }

  function closeSuccess() {
    setShowSuccess(false);
    setStep(0);
    setForm({
      temple: '', service: '', adults: 1, children: 0, seniors: 0,
      date: '', time: '', firstName: '', lastName: '',
      email: '', phone: '', city: '', requirements: [], notes: '',
    });
  }

  function quickSelectTemple(id) {
    setForm(f => ({ ...f, temple: id }));
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="home-website-wrapper">
      <Navbar
        activePage="booking"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToLogin={onGoToLogin}
        onGoToAbout={onGoToAbout}
        onOpenBooking={onOpenBooking}
      />

      {/* Hero */}
      <section className="booking-hero">
        <div className="booking-hero-overlay" />
        <div className="booking-hero-silhouette" />
        <div className="booking-hero-content">
          <div className="booking-hero-tag">
            <CalendarDays size={14} />
            Quick Booking
          </div>
          <h1 className="booking-hero-title">Book Your Divine Journey<br />in Minutes</h1>
          <p className="booking-hero-subtitle">
            Choose your temple, select your preferred service, pick a date, and
            complete your booking effortlessly. Your darshan awaits.
          </p>
          <div className="booking-trust-badges">
            {['10,000+ Bookings', 'Instant Confirmation', '100% Secure', '24/7 Support'].map(b => (
              <div className="trust-badge" key={b}>
                <div className="trust-badge-dot">✓</div>
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step Progress */}
      <div className="booking-steps-wrapper" ref={formTopRef}>
        <div className="container">
          <div className="booking-steps-track">
            {STEP_LABELS.map((label, i) => (
              <div className="booking-step" key={label}>
                <div className={`booking-step-item ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                  <div className="booking-step-circle">
                    {i < step ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span className="booking-step-label">{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`booking-step-line ${i < step ? 'done' : ''}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Booking Section */}
      <section className="section" style={{ background: '#F7EFE6' }}>
        <div className="container">
          <div className="booking-layout">

            {/* FORM CARD */}
            <div className="booking-form-card">

              {/* STEP 0 — Temple & Service */}
              {step === 0 && (
                <>
                  <h2 className="booking-form-section-title">
                    <MapPin size={20} style={{ color: '#C8A96A' }} />
                    Select Temple &amp; Service
                  </h2>
                  <p className="booking-form-section-desc">Choose your sacred destination and the type of ceremony.</p>

                  <div className="booking-fields-grid">
                    <div className="booking-field-group booking-field-full">
                      <label className="booking-field-label">
                        Sacred Temple <span className="booking-field-required">*</span>
                      </label>
                      <div className="booking-select-wrapper">
                        <select
                          name="temple"
                          className={`booking-select ${errors.temple ? 'error' : ''}`}
                          value={form.temple}
                          onChange={handleField}
                        >
                          <option value="">— Choose a temple —</option>
                          {TEMPLES.map(t => (
                            <option key={t.id} value={t.id}>{t.name} · {t.location}</option>
                          ))}
                        </select>
                      </div>
                      {errors.temple && <span className="booking-field-error"><Info size={12} /> {errors.temple}</span>}
                    </div>

                    <div className="booking-field-group booking-field-full">
                      <label className="booking-field-label">
                        Puja / Service Type <span className="booking-field-required">*</span>
                      </label>
                      <div className="booking-select-wrapper">
                        <select
                          name="service"
                          className={`booking-select ${errors.service ? 'error' : ''}`}
                          value={form.service}
                          onChange={handleField}
                        >
                          <option value="">— Select a service —</option>
                          {SERVICES.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name}{s.price > 0 ? ` — ₹${s.price.toLocaleString()}` : ' — Free'}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.service && <span className="booking-field-error"><Info size={12} /> {errors.service}</span>}
                      {selectedService && (
                        <p style={{ fontSize: '0.83rem', color: '#9E7D3F', marginTop: '0.4rem' }}>
                          ℹ️ {selectedService.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="booking-form-divider" />
                  <h3 className="booking-form-section-title" style={{ fontSize: '1.1rem' }}>
                    <Star size={16} style={{ color: '#C8A96A' }} />
                    Special Requirements
                  </h3>
                  <div className="booking-checkboxes">
                    {EXTRA_REQUIREMENTS.map(req => (
                      <label className="booking-checkbox-label" key={req}>
                        <input
                          type="checkbox"
                          checked={form.requirements.includes(req)}
                          onChange={() => handleRequirement(req)}
                        />
                        {req}
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 1 — Devotees & Date */}
              {step === 1 && (
                <>
                  <h2 className="booking-form-section-title">
                    <Users size={20} style={{ color: '#C8A96A' }} />
                    Devotees &amp; Visit Schedule
                  </h2>
                  <p className="booking-form-section-desc">Tell us how many devotees are joining and when you plan to visit.</p>

                  <p className="booking-field-label" style={{ marginBottom: '0.8rem' }}>
                    Number of Devotees <span className="booking-field-required">*</span>
                  </p>
                  <div className="devotee-count-grid" style={{ marginBottom: '1.8rem' }}>
                    {[
                      { field: 'adults',   label: 'Adults (18+)',    min: 1 },
                      { field: 'children', label: 'Children (5–17)', min: 0 },
                      { field: 'seniors',  label: 'Seniors (65+)',   min: 0 },
                    ].map(({ field, label, min }) => (
                      <div className="devotee-count-item" key={field}>
                        <span className="devotee-count-label">{label}</span>
                        <div className="devotee-count-controls">
                          <button
                            className="devotee-count-btn"
                            type="button"
                            onClick={() => handleCount(field, -1)}
                            disabled={form[field] <= min}
                          ><Minus size={13} /></button>
                          <span className="devotee-count-val">{form[field]}</span>
                          <button
                            className="devotee-count-btn"
                            type="button"
                            onClick={() => handleCount(field, 1)}
                          ><Plus size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.adults && <p className="booking-field-error" style={{ marginBottom: '1rem' }}><Info size={12} /> {errors.adults}</p>}

                  <div className="booking-fields-grid">
                    <div className="booking-field-group">
                      <label className="booking-field-label">
                        Visit Date <span className="booking-field-required">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        className={`booking-input ${errors.date ? 'error' : ''}`}
                        value={form.date}
                        min={today}
                        onChange={handleField}
                      />
                      {errors.date && <span className="booking-field-error"><Info size={12} /> {errors.date}</span>}
                    </div>

                    <div className="booking-field-group">
                      <label className="booking-field-label">
                        Preferred Time Slot <span className="booking-field-required">*</span>
                      </label>
                      <div className="booking-select-wrapper">
                        <select
                          name="time"
                          className={`booking-select ${errors.time ? 'error' : ''}`}
                          value={form.time}
                          onChange={handleField}
                        >
                          <option value="">— Select time —</option>
                          {[
                            '05:00 AM – 07:00 AM (Pratah)',
                            '08:00 AM – 10:00 AM (Madhyan)',
                            '11:00 AM – 01:00 PM (Tritiya)',
                            '02:00 PM – 04:00 PM (Chakarana)',
                            '05:00 PM – 07:00 PM (Sandhya)',
                            '08:00 PM – 09:00 PM (Sayam)',
                          ].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      {errors.time && <span className="booking-field-error"><Info size={12} /> {errors.time}</span>}
                    </div>
                  </div>

                  <div className="booking-form-divider" />
                  <div className="booking-field-group">
                    <label className="booking-field-label">Additional Notes (optional)</label>
                    <textarea
                      name="notes"
                      className="booking-textarea"
                      placeholder="Any specific requests, allergies, or details about your pilgrimage..."
                      value={form.notes}
                      onChange={handleField}
                    />
                  </div>
                </>
              )}

              {/* STEP 2 — Contact Details */}
              {step === 2 && (
                <>
                  <h2 className="booking-form-section-title">
                    <Phone size={20} style={{ color: '#C8A96A' }} />
                    Contact Details
                  </h2>
                  <p className="booking-form-section-desc">Your booking confirmation and updates will be sent to these contact details.</p>

                  <div className="booking-fields-grid">
                    <div className="booking-field-group">
                      <label className="booking-field-label">
                        First Name <span className="booking-field-required">*</span>
                      </label>
                      <input
                        type="text" name="firstName"
                        className={`booking-input ${errors.firstName ? 'error' : ''}`}
                        placeholder="Arjun" value={form.firstName} onChange={handleField}
                      />
                      {errors.firstName && <span className="booking-field-error"><Info size={12} /> {errors.firstName}</span>}
                    </div>

                    <div className="booking-field-group">
                      <label className="booking-field-label">
                        Last Name <span className="booking-field-required">*</span>
                      </label>
                      <input
                        type="text" name="lastName"
                        className={`booking-input ${errors.lastName ? 'error' : ''}`}
                        placeholder="Sharma" value={form.lastName} onChange={handleField}
                      />
                      {errors.lastName && <span className="booking-field-error"><Info size={12} /> {errors.lastName}</span>}
                    </div>

                    <div className="booking-field-group">
                      <label className="booking-field-label">
                        Email Address <span className="booking-field-required">*</span>
                      </label>
                      <input
                        type="email" name="email"
                        className={`booking-input ${errors.email ? 'error' : ''}`}
                        placeholder="arjun@email.com" value={form.email} onChange={handleField}
                      />
                      {errors.email && <span className="booking-field-error"><Info size={12} /> {errors.email}</span>}
                    </div>

                    <div className="booking-field-group">
                      <label className="booking-field-label">
                        Phone Number <span className="booking-field-required">*</span>
                      </label>
                      <input
                        type="tel" name="phone"
                        className={`booking-input ${errors.phone ? 'error' : ''}`}
                        placeholder="+91 98765 43210" value={form.phone} onChange={handleField}
                      />
                      {errors.phone && <span className="booking-field-error"><Info size={12} /> {errors.phone}</span>}
                    </div>

                    <div className="booking-field-group booking-field-full">
                      <label className="booking-field-label">City / State (optional)</label>
                      <input
                        type="text" name="city"
                        className="booking-input"
                        placeholder="Mumbai, Maharashtra" value={form.city} onChange={handleField}
                      />
                    </div>
                  </div>

                  <div style={{
                    marginTop: '1.5rem', background: 'rgba(200,169,106,0.07)',
                    border: '1px solid rgba(200,169,106,0.25)', borderRadius: '12px',
                    padding: '1rem 1.2rem', display: 'flex', gap: '0.7rem', alignItems: 'flex-start',
                  }}>
                    <Lock size={16} style={{ color: '#9E7D3F', marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', color: '#6E5351', lineHeight: 1.5, margin: 0 }}>
                      Your personal details are encrypted and never shared. We comply with India's DPDP Act 2023.
                    </p>
                  </div>
                </>
              )}

              {/* STEP 3 — Review & Pay */}
              {step === 3 && (
                <>
                  <h2 className="booking-form-section-title">
                    <CheckCircle2 size={20} style={{ color: '#C8A96A' }} />
                    Review &amp; Confirm
                  </h2>
                  <p className="booking-form-section-desc">Please review all details before completing your booking.</p>

                  {[
                    { label: 'Temple',       val: selectedTemple?.name || '—' },
                    { label: 'Location',     val: selectedTemple?.location || '—' },
                    { label: 'Service',      val: selectedService?.name || '—' },
                    { label: 'Devotees',     val: `${form.adults} Adult${form.adults !== 1 ? 's' : ''}${form.children ? `, ${form.children} Child` : ''}${form.seniors ? `, ${form.seniors} Senior` : ''}` },
                    { label: 'Date',         val: form.date || '—' },
                    { label: 'Time Slot',    val: form.time || '—' },
                    { label: 'Lead Devotee', val: `${form.firstName} ${form.lastName}`.trim() || '—' },
                    { label: 'Email',        val: form.email || '—' },
                    { label: 'Phone',        val: form.phone || '—' },
                  ].map(({ label, val }) => (
                    <div className="summary-row" key={label}>
                      <span className="summary-label">{label}</span>
                      <span className="summary-val" style={{ maxWidth: '55%', wordBreak: 'break-word', textAlign: 'right' }}>{val}</span>
                    </div>
                  ))}

                  {form.requirements.length > 0 && (
                    <div className="summary-row">
                      <span className="summary-label">Special Needs</span>
                      <span className="summary-val" style={{ maxWidth: '55%', wordBreak: 'break-word', textAlign: 'right' }}>
                        {form.requirements.join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="booking-form-divider" />

                  {[
                    { label: 'Temple Entry Fee', val: `₹${templeTotal.toLocaleString()}` },
                    { label: 'Service / Puja',   val: serviceTotal > 0 ? `₹${serviceTotal.toLocaleString()}` : 'Complimentary' },
                    { label: 'GST (5%)',          val: `₹${taxAmount.toLocaleString()}` },
                  ].map(({ label, val }) => (
                    <div className="summary-row" key={label}>
                      <span className="summary-label">{label}</span>
                      <span className="summary-val">{val}</span>
                    </div>
                  ))}

                  <div className="summary-total-row">
                    <span className="summary-total-label">Total Payable</span>
                    <span className="summary-total-val">₹{grandTotal.toLocaleString()}</span>
                  </div>

                  <div style={{
                    marginTop: '2rem', background: 'rgba(200,169,106,0.07)',
                    border: '1px dashed rgba(200,169,106,0.4)', borderRadius: '14px',
                    padding: '1.1rem 1.4rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start',
                  }}>
                    <Shield size={18} style={{ color: '#9E7D3F', marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', color: '#6E5351', lineHeight: 1.55, margin: 0 }}>
                      By proceeding you agree to our <strong style={{ color: '#341F1D' }}>Terms & Conditions</strong> and <strong style={{ color: '#341F1D' }}>Cancellation Policy</strong>. Free cancellation up to 48 hrs before visit.
                    </p>
                  </div>
                </>
              )}

              {/* Form Nav Buttons */}
              <div className="booking-form-actions">
                {step > 0 && (
                  <button type="button" className="btn-booking-secondary" onClick={prevStep}>
                    ← Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" className="btn-booking-primary" onClick={nextStep}>
                    Continue <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button" className="btn-booking-primary" onClick={handleSubmit}
                    style={{ background: 'linear-gradient(135deg, #4A2C2A, #341F1D)', color: '#C8A96A', border: '1.5px solid rgba(200,169,106,0.4)' }}
                  >
                    <Lock size={16} />
                    Confirm &amp; Pay ₹{grandTotal.toLocaleString()}
                  </button>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="booking-sidebar">
              {/* Booking Summary */}
              <div className="booking-summary-card">
                <h3 className="booking-summary-title">Booking Summary</h3>
                {[
                  { label: 'Temple',   val: selectedTemple?.name || '—' },
                  { label: 'Service',  val: selectedService?.name || '—' },
                  { label: 'Devotees', val: `${totalDevotees} person${totalDevotees !== 1 ? 's' : ''}` },
                  { label: 'Date',     val: form.date || '—' },
                  { label: 'Time',     val: form.time ? form.time.split('(')[0].trim() : '—' },
                  { label: 'Entry Fee',val: `₹${templeTotal.toLocaleString()}` },
                  { label: 'Service',  val: serviceTotal > 0 ? `₹${serviceTotal.toLocaleString()}` : 'Free' },
                  { label: 'GST (5%)',  val: `₹${taxAmount.toLocaleString()}` },
                ].map(({ label, val }, i) => (
                  <div className="summary-row" key={`${label}-${i}`}>
                    <span className="summary-label">{label}</span>
                    <span className="summary-val" style={{ fontSize: '0.82rem' }}>{val}</span>
                  </div>
                ))}
                <div className="summary-total-row">
                  <span className="summary-total-label">Total</span>
                  <span className="summary-total-val">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* AI Guide Card */}
              <div className="ai-assistant-card">
                <div className="ai-assistant-icon"><Bot size={20} /></div>
                <h4 className="ai-assistant-title">AI Darshan Guide</h4>
                <p className="ai-assistant-desc">
                  Not sure which temple or puja to choose? Our spiritual AI suggests the ideal pilgrimage based on your deity, date, and budget.
                </p>
                <button className="btn-ai-guide">
                  <Sparkles size={14} /> Ask AI Guide
                </button>
              </div>

              {/* Help */}
              <div style={{
                background: '#FFFFFF', border: '1px solid rgba(200,169,106,0.2)',
                borderRadius: '16px', padding: '1.4rem',
                display: 'flex', flexDirection: 'column', gap: '0.9rem',
              }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '0.95rem', color: '#341F1D', margin: 0 }}>
                  Need Assistance?
                </p>
                <a href="tel:+918800123456" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9E7D3F', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                  <Phone size={14} /> +91 88001 23456
                </a>
                <a href="mailto:darshan@journey.in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9E7D3F', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                  <Mail size={14} /> darshan@journey.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Temples */}
      <section className="section" style={{ background: '#FFFDF9' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag"><Star size={14} />Popular Temples</div>
            <h2 className="section-title">Devotees' Top Choices</h2>
            <p className="section-subtitle">
              Explore the most-visited sacred destinations. Click any card to pre-fill your booking.
            </p>
          </div>
          <div className="popular-temples-grid">
            {[
              { id: 't1', name: 'Kashi Vishwanath', location: 'Varanasi, UP', price: 1800, duration: '3–4 hrs', badge: 'Trending',     gradient: 'linear-gradient(135deg, #2a1810, #4A2C2A)' },
              { id: 't2', name: 'Tirupati Balaji',  location: 'Tirupati, AP', price: 2500, duration: '4–6 hrs', badge: 'Most Visited', gradient: 'linear-gradient(135deg, #19100A, #341F1D)' },
              { id: 't3', name: 'Meenakshi Amman',  location: 'Madurai, TN',  price: 1400, duration: '2–3 hrs', badge: 'Premium',      gradient: 'linear-gradient(135deg, #1A1200, #3a2800)' },
              { id: 't4', name: 'Somnath Temple',   location: 'Gujarat',      price: 1600, duration: '2–4 hrs', badge: 'Heritage',     gradient: 'linear-gradient(135deg, #0a1a10, #1a3a20)' },
            ].map(t => (
              <div className="popular-temple-card" key={t.id} onClick={() => quickSelectTemple(t.id)}>
                <div className="popular-temple-img-box" style={{ background: t.gradient }}>
                  <div className="popular-temple-img-overlay" />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35 }}>
                    <svg width="70" height="70" viewBox="0 0 100 100" fill="rgba(200,169,106,0.6)">
                      <rect x="40" y="10" width="20" height="10" rx="2" />
                      <rect x="35" y="20" width="30" height="8" rx="2" />
                      <rect x="30" y="28" width="40" height="8" rx="2" />
                      <rect x="25" y="36" width="50" height="8" rx="2" />
                      <rect x="20" y="44" width="60" height="46" rx="3" />
                      <rect x="42" y="60" width="16" height="30" rx="2" />
                      <rect x="28" y="62" width="14" height="20" rx="2" />
                      <rect x="58" y="62" width="14" height="20" rx="2" />
                    </svg>
                  </div>
                  <span className="popular-temple-badge">{t.badge}</span>
                </div>
                <div className="popular-temple-body">
                  <h3 className="popular-temple-name">{t.name}</h3>
                  <p className="popular-temple-location"><MapPin size={11} />{t.location}</p>
                  <div className="popular-temple-meta">
                    <div className="popular-temple-price">
                      ₹{t.price.toLocaleString()} <span>/person</span>
                    </div>
                    <span className="popular-temple-duration">
                      <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t.duration}
                    </span>
                  </div>
                  <button className="btn-quick-book" type="button">
                    <CalendarDays size={13} /> Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-tag"><Zap size={14} />Simple Process</div>
            <h2 className="section-title">Book in 6 Easy Steps</h2>
            <p className="section-subtitle">From selection to confirmation — complete your spiritual booking in under 5 minutes.</p>
          </div>
          <div className="booking-process-track">
            {HOW_STEPS.map(({ icon: Icon, label }, i) => (
              <div className="process-step" key={label}>
                <div className="process-step-icon">
                  <Icon size={22} />
                  <span className="process-step-num">{i + 1}</span>
                </div>
                <span className="process-step-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book With Us */}
      <section className="section" style={{ background: '#FFFDF9' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag"><Award size={14} />Why Choose Us</div>
            <h2 className="section-title">Book With Complete Confidence</h2>
            <p className="section-subtitle">Thousands of devotees trust Darshan Journey for a seamless and sacred pilgrimage experience.</p>
          </div>
          <div className="why-book-grid">
            {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
              <div className="why-book-card" key={title}>
                <div className="why-book-icon"><Icon size={22} /></div>
                <h3 className="why-book-title">{title}</h3>
                <p className="why-book-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-tag"><Info size={14} />FAQ</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Everything you need to know before booking your divine journey.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
                <button className="faq-question" type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="faq-question-text">{faq.q}</span>
                  <Plus size={18} className="faq-icon" />
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section booking-cta-section" style={{ background: '#F7EFE6' }}>
        <div className="container">
          <div className="booking-cta-banner">
            <div className="section-tag" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Heart size={14} fill="#C8A96A" /> Begin Your Sacred Journey
            </div>
            <h2 className="booking-cta-heading">
              Your Next Darshan Is<br />One Click Away
            </h2>
            <p className="booking-cta-text">
              Join over 10,000 devotees who have simplified their pilgrimage through Darshan Journey. Let technology carry your steps closer to the divine.
            </p>
            <div className="booking-cta-buttons">
              <button
                className="btn-booking-primary"
                style={{ flex: 'none', minWidth: '220px' }}
                onClick={() => { setStep(0); formTopRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <CalendarDays size={16} /> Book Your Darshan
              </button>
              {onExploreTemples && (
                <button
                  className="btn-booking-secondary"
                  style={{ flex: 'none', color: 'rgba(238,220,185,0.85)', borderColor: 'rgba(200,169,106,0.4)' }}
                  onClick={onExploreTemples}
                >
                  Explore Temples <ArrowRight size={15} style={{ display: 'inline' }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToLogin={onGoToLogin}
        onGoToAbout={onGoToAbout}
      />

      {/* Success Modal */}
      {showSuccess && (
        <div className="booking-success-overlay">
          <div className="booking-success-modal">
            <div className="booking-success-icon">🕉️</div>
            <h3 className="booking-success-title">Booking Confirmed!</h3>
            <p className="booking-success-subtitle">
              Jai Sri {selectedTemple?.name?.split(' ')[0] || 'Hari'}! Your darshan has been booked successfully.
              A confirmation has been sent to <strong>{form.email}</strong>.
            </p>
            <div className="booking-ref">
              <div className="booking-ref-label">Booking Reference</div>
              <div className="booking-ref-num">{bookingRef}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-booking-primary" onClick={closeSuccess} style={{ flex: 'none' }}>
                <RotateCcw size={16} /> Book Another Darshan
              </button>
              {onGoToHome && (
                <button className="btn-booking-secondary" onClick={onGoToHome} style={{ flex: 'none' }}>
                  Go to Home
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
