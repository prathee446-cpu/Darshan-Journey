import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { REAL_TAMIL_NADU_TEMPLES } from '../services/templeDataService';
import {
  CalendarDays, MapPin, Users, Clock, Star, CheckCircle2, Sparkles,
  Plus, Minus, Shield, Phone, Mail, Headphones, X, Search,
  Printer, ChevronLeft, ChevronRight, ChevronDown, Info, Edit3, ArrowLeft,
  Check, Globe, Copy, User, Settings, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createBookingRecord } from '../services/bookingService';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════════════════════════ */

const DARSHAN_TYPES = [
  { id: 'general', name: 'General Darshan', desc: 'Standard entry to sanctum', price: 0, duration: '2–3 Hours', icon: '🙏' },
  { id: 'vip', name: 'VIP Darshan', desc: 'Priority entry with reduced wait', price: 1200, duration: '1–2 Hours', icon: '⭐' },
  { id: 'special', name: 'Special Darshan', desc: 'Close-up darshan & blessings', price: 800, duration: '45–60 Min', icon: '✨' },
  { id: 'free', name: 'Other / Free Entry', desc: 'Open public temple darshan', price: 0, duration: 'Open', icon: '🕉️' },
];

const POOJA_SERVICES = [
  { id: 'archana', name: 'Archana', desc: 'Name chanting & flower offering', price: 501, duration: '20 min', icon: '📿' },
  { id: 'abhishekam', name: 'Abhishekam', desc: 'Ritual holy bath for deity', price: 2200, duration: '45 min', icon: '🪔' },
  { id: 'aarti', name: 'Aarti', desc: 'Lamp offering & mantras', price: 350, duration: '15 min', icon: '🪔' },
  { id: 'homam', name: 'Homam', desc: 'Sacred fire ritual', price: 4500, duration: '90 min', icon: '🔥' },
  { id: 'none', name: 'No Service', desc: 'Proceed with darshan only', price: 0, duration: '—', icon: '🚫' },
];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📲' },
  { id: 'gpay', label: 'Google Pay', icon: '💳' },
  { id: 'phonepe', label: 'PhonePe', icon: '💜' },
  { id: 'paytm', label: 'Paytm', icon: '🔵' },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 360;
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return 360;
  let [, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function minutesToTimeStr(mins) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${String(m).padStart(2, '0')} ${period}`;
}

function generateTempleTimeSlots(temple, dateStr) {
  if (!temple) return [];
  const openMin = parseTimeToMinutes(temple.openingTime || '6:00 AM');
  const closeMin = parseTimeToMinutes(temple.closingTime || '8:30 PM');
  let breakStart = -1, breakEnd = -1;
  if (temple.afternoonBreak) {
    const parts = temple.afternoonBreak.split('–').map(s => s.trim());
    if (parts.length === 2) {
      breakStart = parseTimeToMinutes(parts[0]);
      breakEnd = parseTimeToMinutes(parts[1]);
    }
  }
  const slots = [];
  for (let start = openMin; start + 60 <= closeMin; start += 60) {
    const end = start + 60;
    if (breakStart >= 0 && breakEnd >= 0 && start < breakEnd && end > breakStart) continue;
    const label = `${minutesToTimeStr(start)} – ${minutesToTimeStr(end)}`;
    let status = 'available';
    if (dateStr) {
      const dateObj = new Date(dateStr);
      const hash = (dateObj.getDate() * 17 + start * 3 + (temple.id || 1) * 7) % 100;
      if (hash < 10) status = 'booked';
      else if (hash < 30) status = 'limited';
    }
    slots.push({ id: `slot-${start}`, label, status });
  }
  return slots;
}

function generateDateOptions(count = 7) {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    dates.push({ iso, display: `${dayNum} ${monthName}`, sub: dayName });
  }
  return dates;
}

function generateRef() {
  return 'DJ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ═══════════════════════════════════════════════════════════════
   QR CODE COMPONENT — Real Scannable QR via API
   ═══════════════════════════════════════════════════════════════ */

function ScanQRCode({ value, size = 180, darkColor = '341F1D' }) {
  if (!value) return null;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=${darkColor}&bgcolor=FFFFFF&margin=6&format=png`;
  return (
    <img
      src={qrUrl}
      alt="QR Code"
      width={size}
      height={size}
      style={{
        borderRadius: '12px',
        border: '1.5px solid rgba(200,169,106,0.25)',
        background: '#FFFFFF',
        display: 'block',
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════ */

const S = {
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1.5px solid rgba(200,169,106,0.2)',
    padding: '1.5rem',
    boxShadow: '0 4px 18px rgba(52,31,29,0.04)',
  },
  sectionIcon: (color = '#C8A96A') => ({
    width: '34px', height: '34px', borderRadius: '10px',
    background: `rgba(200,169,106,0.12)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, color,
  }),
  sectionTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#341F1D',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    margin: 0,
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #C8A96A 0%, #D4AF37 100%)',
    color: '#341F1D',
    border: 'none',
    borderRadius: '10px',
    padding: '0.8rem 1.6rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(200,169,106,0.3)',
    transition: 'all 0.25s ease',
  },
  btnOutline: {
    background: '#FFFFFF',
    color: '#341F1D',
    border: '1.5px solid rgba(200,169,106,0.4)',
    borderRadius: '10px',
    padding: '0.7rem 1.3rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    transition: 'all 0.25s ease',
  },
  input: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    borderRadius: '10px',
    border: '1.5px solid rgba(200,169,106,0.3)',
    background: '#FFFDF9',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.88rem',
    color: '#341F1D',
    outline: 'none',
    boxSizing: 'border-box',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.35rem 0',
    fontSize: '0.85rem',
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function QuickBookingPage({
  onGoToHome, onGoToLanding, onExploreTemples, onGoToProducts, onGoToServices,
  onGoToLogin, onGoToAbout, onGoToContact, onGoToDashboard, onOpenBooking, onOpenDonate
}) {
  const temples = REAL_TAMIL_NADU_TEMPLES;

  /* ─── Route Sync ─── */
  const [currentPageView, setCurrentPageView] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    return (path.includes('/booking') && !path.endsWith('/quick-booking')) ? 'booking' : 'location';
  });

  const [activeStepNum, setActiveStepNum] = useState(() => {
    return currentPageView === 'booking' ? 2 : 1;
  });

  /* ─── Location State ─── */
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [selectedCityDistrict, setSelectedCityDistrict] = useState('');
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  /* ─── Temple State ─── */
  const [templeSearchQuery, setTempleSearchQuery] = useState('');
  const [selectedTempleId, setSelectedTempleId] = useState(null);
  const [isTempleDetailsOpen, setIsTempleDetailsOpen] = useState(false);

  /* ─── Booking Details State ─── */
  const [darshanType, setDarshanType] = useState(null);
  const [poojaService, setPoojaService] = useState(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDateIso, setSelectedDateIso] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const [devotees, setDevotees] = useState({ adults: 1, children: 0, seniors: 0 });

  const { user: authUser, updateUser } = useAuth();
  const [customer, setCustomer] = useState(() => {
    if (authUser) {
      return {
        fullName: authUser.fullName || authUser.name || '',
        mobile: authUser.phone || authUser.mobile || '',
        email: authUser.email || '',
        address: authUser.address || '',
        emergencyContact: authUser.emergencyContact || ''
      };
    }
    try {
      const saved = localStorage.getItem('darshan_user') || localStorage.getItem('currentUser');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName || parsed.name || '',
          mobile: parsed.phone || parsed.mobile || '',
          email: parsed.email || '',
          address: parsed.address || '',
          emergencyContact: parsed.emergencyContact || ''
        };
      }
    } catch (e) { /* ignore */ }
    return { fullName: '', mobile: '', email: '', address: '', emergencyContact: '' };
  });
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(customer);
  const [customerErrors, setCustomerErrors] = useState({});

  // Synchronize customer details whenever authUser updates or loads
  useEffect(() => {
    if (authUser) {
      const updated = {
        fullName: customer.fullName || authUser.fullName || authUser.name || '',
        mobile: customer.mobile || authUser.phone || authUser.mobile || '',
        email: customer.email || authUser.email || '',
        address: customer.address || authUser.address || '',
        emergencyContact: customer.emergencyContact || authUser.emergencyContact || ''
      };
      setCustomer(updated);
      setCustomerForm(updated);
    }
  }, [authUser]);

  /* ─── Sequential Section Accordions ─── */
  const [visibleSections, setVisibleSections] = useState({
    darshan: true, pooja: false, date: false, time: false, devotees: false, customer: false, summary: false,
  });

  /* ─── Payment State ─── */
  const [paymentStep, setPaymentStep] = useState(1); // 1: pay, 2: processing, 3: success
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [bookingRef, setBookingRef] = useState('');

  /* ─── Derived Lists & Selections ─── */
  const uniqueLocations = useMemo(() => {
    const list = Array.from(new Set(temples.map(t => t.district))).sort();
    return list;
  }, [temples]);

  const filteredLocationsForPopup = useMemo(() => {
    if (!locationSearchQuery.trim()) return uniqueLocations;
    const q = locationSearchQuery.toLowerCase();
    return uniqueLocations.filter(loc => loc.toLowerCase().includes(q));
  }, [uniqueLocations, locationSearchQuery]);

  const filteredTemples = useMemo(() => {
    return temples.filter(t => {
      if (selectedCityDistrict && t.district.toLowerCase() !== selectedCityDistrict.toLowerCase()) {
        return false;
      }
      if (templeSearchQuery.trim()) {
        const q = templeSearchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchDist = t.district.toLowerCase().includes(q);
        const matchAddr = t.address.toLowerCase().includes(q);
        if (!matchName && !matchDist && !matchAddr) return false;
      }
      return true;
    });
  }, [temples, selectedCityDistrict, templeSearchQuery]);

  const selectedTemple = useMemo(() => {
    return temples.find(t => t.id === selectedTempleId) || null;
  }, [temples, selectedTempleId]);

  const availableTimeSlots = useMemo(() => {
    return generateTempleTimeSlots(selectedTemple, selectedDateIso);
  }, [selectedTemple, selectedDateIso]);

  const selectedDarshanObj = DARSHAN_TYPES.find(d => d.id === darshanType);
  const selectedPoojaObj = POOJA_SERVICES.find(p => p.id === poojaService);
  const totalDevotees = devotees.adults + devotees.children + devotees.seniors;
  const baseDarshanTotal = (selectedDarshanObj?.price || 0) * totalDevotees;
  const serviceTotal = selectedPoojaObj?.price || 0;
  const subtotal = baseDarshanTotal + serviceTotal;
  const gstAmount = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gstAmount;

  const isCustomerValid = Boolean(
    customer.fullName.trim() && customer.mobile.trim() &&
    customer.email.trim() && customer.emergencyContact.trim()
  );

  const canContinueToPayment = Boolean(
    selectedTemple && darshanType && poojaService && selectedDateIso && selectedTimeSlot &&
    totalDevotees >= 1 && isCustomerValid
  );

  /* ─── Auto-Open Next Section Handler ─── */
  useEffect(() => {
    if (darshanType) {
      setVisibleSections(prev => ({ ...prev, pooja: true }));
    }
  }, [darshanType]);

  useEffect(() => {
    if (poojaService) {
      setVisibleSections(prev => ({ ...prev, date: true }));
    }
  }, [poojaService]);

  useEffect(() => {
    if (selectedDateIso) {
      setVisibleSections(prev => ({ ...prev, time: true }));
    }
  }, [selectedDateIso]);

  useEffect(() => {
    if (selectedTimeSlot) {
      setVisibleSections(prev => ({ ...prev, devotees: true, customer: true, summary: true }));
    }
  }, [selectedTimeSlot]);

  /* ─── Navigation & Step Transitions ─── */
  const navigateToBookingPage = () => {
    if (!selectedTemple) return;
    window.history.pushState({}, '', '/quick-booking/booking');
    setCurrentPageView('booking');
    setActiveStepNum(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLocationPage = () => {
    window.history.pushState({}, '', '/quick-booking');
    setCurrentPageView('location');
    setActiveStepNum(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToReviewPayment = () => {
    if (!canContinueToPayment) return;
    setBookingRef(generateRef());
    setPaymentStep(1);
    setActiveStepNum(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompletePayment = async () => {
    setPaymentStep(2);
    try {
      const savedBooking = await createBookingRecord({
        bookingType: 'DARSHAN',
        templeId: selectedTemple?.id,
        templeName: selectedTemple?.name || 'Sacred Temple',
        location: selectedTemple?.district || 'Tamil Nadu',
        darshanType: selectedDarshanObj?.name || 'General Darshan',
        serviceName: selectedPoojaObj?.name || '',
        bookingDate: selectedDateIso,
        bookingTime: selectedTimeSlot || '10:00 AM – 11:00 AM',
        numberOfPeople: totalDevotees,
        devoteesBreakdown: devotees,
        devoteeName: customer.fullName || authUser?.fullName || authUser?.name || 'Devotee',
        mobile: customer.mobile || authUser?.phone || authUser?.mobile || '',
        email: customer.email || authUser?.email || '',
        address: customer.address || authUser?.address || '',
        emergencyContact: customer.emergencyContact || authUser?.emergencyContact || '',
        amount: grandTotal,
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
        bookingReference: bookingRef || generateRef(),
        instructions: 'Please arrive 15 minutes prior. Carry a valid government photo ID.'
      });

      if (savedBooking && (savedBooking.bookingReference || savedBooking.bookingId)) {
        setBookingRef(savedBooking.bookingReference || savedBooking.bookingId);
      }
    } catch (err) {
      console.warn('Booking record save error:', err);
    } finally {
      setTimeout(() => setPaymentStep(3), 1200);
    }
  };

  const handleBookAnother = () => {
    setSelectedTempleId(null);
    setDarshanType(null);
    setPoojaService(null);
    setSelectedDateIso('');
    setSelectedTimeSlot(null);
    setVisibleSections({ darshan: true, pooja: false, date: false, time: false, devotees: false, customer: false, summary: false });
    navigateToLocationPage();
  };

  /* ─── Devotee Counters ─── */
  const handleDevoteeChange = (field, delta) => {
    setDevotees(prev => {
      const minVal = field === 'adults' ? 1 : 0;
      return { ...prev, [field]: Math.max(minVal, prev[field] + delta) };
    });
  };

  /* ─── Customer Form Save ─── */
  const handleSaveCustomer = (e) => {
    e.preventDefault();
    const errs = {};
    if (!customerForm.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!customerForm.mobile.trim() || customerForm.mobile.length < 10) errs.mobile = 'Valid 10-digit phone is required';
    if (!customerForm.email.trim() || !/\S+@\S+\.\S+/.test(customerForm.email)) errs.email = 'Valid email is required';
    if (!customerForm.emergencyContact.trim() || customerForm.emergencyContact.length < 10) errs.emergencyContact = 'Emergency contact is required';
    if (Object.keys(errs).length) { setCustomerErrors(errs); return; }
    setCustomer(customerForm);
    if (updateUser) {
      updateUser({
        fullName: customerForm.fullName,
        phone: customerForm.mobile,
        mobile: customerForm.mobile,
        email: customerForm.email,
        address: customerForm.address,
        emergencyContact: customerForm.emergencyContact
      });
    }
    setCustomerErrors({});
    setIsEditingCustomer(false);
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER: COMPACT 3-STEP INDICATOR
     ═══════════════════════════════════════════════════════════════ */

  const renderStepIndicator = () => {
    const steps = [
      { num: '01', label: 'Location & Temple', done: activeStepNum > 1, active: activeStepNum === 1 },
      { num: '02', label: 'Booking Details', done: activeStepNum > 2, active: activeStepNum === 2 },
      { num: '03', label: 'Review & Payment', done: activeStepNum > 3, active: activeStepNum === 3 },
    ];
    return (
      <div style={{
        background: '#FFFDF9',
        borderBottom: '1px solid rgba(200,169,106,0.2)',
        padding: '0.8rem 1rem',
      }}>
        <div style={{
          maxWidth: '720px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
        }}>
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div
                onClick={() => {
                  if (step.done) {
                    if (step.num === '01') navigateToLocationPage();
                    else if (step.num === '02') { setActiveStepNum(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  cursor: step.done ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                  background: step.done ? '#16a34a' : step.active ? 'linear-gradient(135deg, #C8A96A, #D4AF37)' : '#E5E5E5',
                  color: step.done || step.active ? '#FFF' : '#888',
                }}>
                  {step.done ? <Check size={13} strokeWidth={3} /> : step.num}
                </div>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: step.active ? 700 : 500,
                  color: step.done ? '#16a34a' : step.active ? '#C8A96A' : '#888',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  whiteSpace: 'nowrap',
                }}>
                  {step.label} {step.done && '✓'}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{
                  width: '40px', height: '2px', flexShrink: 0,
                  background: step.done ? '#16a34a' : 'rgba(200,169,106,0.25)',
                  borderRadius: '1px',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     POPUP: SMALL CENTERED LOCATION POPUP MODAL
     ═══════════════════════════════════════════════════════════════ */

  const renderLocationPopupModal = () => {
    if (!isLocationPopupOpen) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }} onClick={() => setIsLocationPopupOpen(false)}>
        <div style={{
          background: '#FFFFFF', borderRadius: '16px', maxWidth: '440px', width: '100%',
          maxHeight: '520px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1.5px solid rgba(200,169,106,0.3)', boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        }} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.2rem', background: '#341F1D', color: '#F7EFE6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.98rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
              Select Your Location
            </h3>
            <button onClick={() => setIsLocationPopupOpen(false)} style={{
              background: 'none', border: 'none', color: '#C8A96A', cursor: 'pointer', padding: '0.2rem',
            }}>
              <X size={18} />
            </button>
          </div>

          {/* Search Box */}
          <div style={{ padding: '0.8rem 1.2rem', background: '#FFFDF9', borderBottom: '1px solid rgba(200,169,106,0.15)', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#9E7D3F' }} />
              <input
                type="text"
                placeholder="🔍 Search location..."
                value={locationSearchQuery}
                onChange={e => setLocationSearchQuery(e.target.value)}
                style={{ ...S.input, paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable Results Body */}
          <div style={{ padding: '0.8rem 1.2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* All Locations Option */}
            <div
              onClick={() => { setSelectedCityDistrict(''); setIsLocationPopupOpen(false); }}
              style={{
                padding: '0.65rem 0.8rem', borderRadius: '10px', cursor: 'pointer',
                background: selectedCityDistrict === '' ? 'rgba(200,169,106,0.12)' : '#FFFDF9',
                border: selectedCityDistrict === '' ? '1.5px solid #C8A96A' : '1px solid rgba(200,169,106,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: '0.85rem', fontWeight: selectedCityDistrict === '' ? 700 : 500, color: '#341F1D',
              }}
            >
              <span>All Locations (Tamil Nadu)</span>
              {selectedCityDistrict === '' && <Check size={14} style={{ color: '#C8A96A' }} />}
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9E7D3F', textTransform: 'uppercase', marginTop: '0.4rem', marginBottom: '0.1rem' }}>
              Districts / Cities
            </div>

            {filteredLocationsForPopup.length === 0 ? (
              <p style={{ color: '#888', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>
                No matching locations found.
              </p>
            ) : (
              filteredLocationsForPopup.map(loc => {
                const isSel = selectedCityDistrict.toLowerCase() === loc.toLowerCase();
                return (
                  <div
                    key={loc}
                    onClick={() => { setSelectedCityDistrict(loc); setIsLocationPopupOpen(false); }}
                    style={{
                      padding: '0.6rem 0.8rem', borderRadius: '8px', cursor: 'pointer',
                      background: isSel ? 'rgba(200,169,106,0.12)' : '#FFFDF9',
                      border: isSel ? '1.5px solid #C8A96A' : '1px solid rgba(200,169,106,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '0.85rem', fontWeight: isSel ? 700 : 500, color: '#341F1D',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={13} style={{ color: '#C8A96A' }} /> {loc}
                    </span>
                    {isSel && <Check size={14} style={{ color: '#C8A96A' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     POPUP: TEMPLE DETAILS MODAL
     ═══════════════════════════════════════════════════════════════ */

  const renderTempleDetailsModal = () => {
    if (!isTempleDetailsOpen || !selectedTemple) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }} onClick={() => setIsTempleDetailsOpen(false)}>
        <div style={{
          background: '#FFFFFF', borderRadius: '20px', maxWidth: '540px', width: '100%',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1.5px solid rgba(200,169,106,0.3)', boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        }} onClick={e => e.stopPropagation()}>
          <div style={{ position: 'relative', height: '160px', flexShrink: 0 }}>
            <img src={selectedTemple.coverImage} alt={selectedTemple.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
            <button onClick={() => setIsTempleDetailsOpen(false)} style={{
              position: 'absolute', top: '0.8rem', right: '0.8rem', background: 'rgba(0,0,0,0.5)',
              border: 'none', color: '#FFF', width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <X size={16} />
            </button>
            <div style={{ position: 'absolute', bottom: '0.8rem', left: '1.2rem', right: '1.2rem', color: '#FFF' }}>
              <span style={{ fontSize: '0.7rem', background: '#C8A96A', color: '#341F1D', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                {selectedTemple.category || 'Sacred Temple'}
              </span>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem', fontWeight: 700, margin: '0.2rem 0 0 0' }}>
                {selectedTemple.name}
              </h3>
            </div>
          </div>
          <div style={{ padding: '1.2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem', color: '#341F1D' }}>
            <div>
              <strong style={{ color: '#9E7D3F', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Address</strong>
              <span>{selectedTemple.address}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', background: '#FFFDF9', padding: '0.7rem', borderRadius: '10px', border: '1px solid rgba(200,169,106,0.2)' }}>
              <div>
                <strong style={{ color: '#9E7D3F', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Opening Hours</strong>
                <span>{selectedTemple.openingTime} – {selectedTemple.closingTime}</span>
              </div>
              <div>
                <strong style={{ color: '#9E7D3F', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Afternoon Break</strong>
                <span>{selectedTemple.afternoonBreak || 'None'}</span>
              </div>
            </div>
            <div>
              <strong style={{ color: '#9E7D3F', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Entry & Priority Queue</strong>
              <span>{selectedTemple.entryFee} • {selectedTemple.specialDarshan}</span>
            </div>
            <div>
              <strong style={{ color: '#9E7D3F', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Dress Code</strong>
              <span style={{ fontSize: '0.8rem', color: '#6E5351' }}>{selectedTemple.dressCode}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', paddingTop: '0.4rem', borderTop: '1px dashed rgba(200,169,106,0.3)' }}>
              <div>
                <strong style={{ color: '#9E7D3F', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Contact</strong>
                <span>{selectedTemple.contactNumber}</span>
              </div>
              <div>
                <strong style={{ color: '#9E7D3F', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Official Website</strong>
                {selectedTemple.website ? <a href={selectedTemple.website} target="_blank" rel="noreferrer" style={{ color: '#9E7D3F', fontWeight: 700, textDecoration: 'none' }}>Visit Portal ↗</a> : 'N/A'}
              </div>
            </div>
          </div>
          <div style={{ padding: '0.8rem 1.2rem', background: '#FFFDF9', borderTop: '1px solid rgba(200,169,106,0.2)', textAlign: 'right' }}>
            <button onClick={() => setIsTempleDetailsOpen(false)} style={{ ...S.btnPrimary, padding: '0.5rem 1.2rem', fontSize: '0.82rem', background: '#341F1D', color: '#C8A96A', boxShadow: 'none' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── State & District Popover Modals ─── */
  const [isStatePopoverOpen, setIsStatePopoverOpen] = useState(false);
  const [isDistrictPopoverOpen, setIsDistrictPopoverOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');

  const statesList = ['Tamil Nadu'];
  const filteredStates = statesList.filter(s => s.toLowerCase().includes(stateSearchQuery.toLowerCase()));
  const filteredDistricts = uniqueLocations.filter(d => d.toLowerCase().includes(districtSearchQuery.toLowerCase()));

  const isStep1Valid = Boolean(selectedState && selectedCityDistrict && selectedTempleId);

  const renderStatePopoverModal = () => {
    if (!isStatePopoverOpen) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1250,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }} onClick={() => setIsStatePopoverOpen(false)}>
        <div style={{
          background: '#FFFFFF', borderRadius: '16px', maxWidth: '400px', width: '100%',
          maxHeight: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1.5px solid rgba(200,169,106,0.3)', boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            padding: '0.9rem 1.2rem', background: '#341F1D', color: '#F7EFE6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Select State
            </h3>
            <button onClick={() => setIsStatePopoverOpen(false)} style={{ background: 'none', border: 'none', color: '#C8A96A', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: '0.8rem 1rem', background: '#FFFDF9', borderBottom: '1px solid rgba(200,169,106,0.15)', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#9E7D3F' }} />
              <input
                type="text"
                placeholder="Search state..."
                value={stateSearchQuery}
                onChange={e => setStateSearchQuery(e.target.value)}
                style={{ ...S.input, paddingLeft: '2.2rem', fontSize: '0.82rem' }}
                autoFocus
              />
            </div>
          </div>
          <div style={{ padding: '0.6rem 1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {filteredStates.map(st => (
              <div
                key={st}
                onClick={() => { setSelectedState(st); setIsStatePopoverOpen(false); }}
                style={{
                  padding: '0.6rem 0.8rem', borderRadius: '8px', cursor: 'pointer',
                  background: selectedState === st ? 'rgba(200,169,106,0.12)' : '#FFFDF9',
                  border: selectedState === st ? '1.5px solid #C8A96A' : '1px solid rgba(200,169,106,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: '0.85rem', fontWeight: selectedState === st ? 700 : 500, color: '#341F1D',
                }}
              >
                <span>{st}</span>
                {selectedState === st && <Check size={14} style={{ color: '#C8A96A' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDistrictPopoverModal = () => {
    if (!isDistrictPopoverOpen) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1250,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }} onClick={() => setIsDistrictPopoverOpen(false)}>
        <div style={{
          background: '#FFFFFF', borderRadius: '16px', maxWidth: '420px', width: '100%',
          maxHeight: '440px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1.5px solid rgba(200,169,106,0.3)', boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            padding: '0.9rem 1.2rem', background: '#341F1D', color: '#F7EFE6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Select District / City ({selectedState})
            </h3>
            <button onClick={() => setIsDistrictPopoverOpen(false)} style={{ background: 'none', border: 'none', color: '#C8A96A', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: '0.8rem 1rem', background: '#FFFDF9', borderBottom: '1px solid rgba(200,169,106,0.15)', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#9E7D3F' }} />
              <input
                type="text"
                placeholder="Search district or city..."
                value={districtSearchQuery}
                onChange={e => setDistrictSearchQuery(e.target.value)}
                style={{ ...S.input, paddingLeft: '2.2rem', fontSize: '0.82rem' }}
                autoFocus
              />
            </div>
          </div>
          <div style={{ padding: '0.6rem 1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {filteredDistricts.map(dst => (
              <div
                key={dst}
                onClick={() => { setSelectedCityDistrict(dst); setSelectedTempleId(null); setIsDistrictPopoverOpen(false); }}
                style={{
                  padding: '0.6rem 0.8rem', borderRadius: '8px', cursor: 'pointer',
                  background: selectedCityDistrict.toLowerCase() === dst.toLowerCase() ? 'rgba(200,169,106,0.12)' : '#FFFDF9',
                  border: selectedCityDistrict.toLowerCase() === dst.toLowerCase() ? '1.5px solid #C8A96A' : '1px solid rgba(200,169,106,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: '0.85rem', fontWeight: selectedCityDistrict.toLowerCase() === dst.toLowerCase() ? 700 : 500, color: '#341F1D',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} style={{ color: '#C8A96A' }} /> {dst}
                </span>
                {selectedCityDistrict.toLowerCase() === dst.toLowerCase() && <Check size={14} style={{ color: '#C8A96A' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     VIEW 1: PAGE 1 — LOCATION & TEMPLE SELECTION (/quick-booking)
     ═══════════════════════════════════════════════════════════════ */

  const renderPage1LocationTemple = () => (
    <section style={{ padding: '2rem 1rem 4rem 1rem', background: '#F7EFE6', minHeight: '65vh' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── Location Selection Card ── */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.2rem' }}>
            <div style={S.sectionIcon()}>
              <MapPin size={18} />
            </div>
            <div>
              <h3 style={S.sectionTitle}>LOCATION SELECTION</h3>
              <p style={{ fontSize: '0.8rem', color: '#9E7D3F', margin: 0 }}>Select state and district to filter nearby temples</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* State Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#341F1D', marginBottom: '0.3rem' }}>
                State <span style={{ color: '#C8A96A' }}>*</span>
              </label>
              <div
                onClick={() => setIsStatePopoverOpen(true)}
                style={{ ...S.input, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Globe size={14} style={{ color: '#9E7D3F' }} /> {selectedState || 'Select State'}
                </span>
                <ChevronDown size={15} style={{ color: '#9E7D3F' }} />
              </div>
            </div>

            {/* District Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#341F1D', marginBottom: '0.3rem' }}>
                District / City <span style={{ color: '#C8A96A' }}>*</span>
              </label>
              <div
                onClick={() => setIsDistrictPopoverOpen(true)}
                style={{ ...S.input, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} style={{ color: '#9E7D3F' }} /> {selectedCityDistrict || 'Select District / City'}
                </span>
                <ChevronDown size={15} style={{ color: '#9E7D3F' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Temple Selection Card ── */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={S.sectionIcon()}>
                <Star size={18} />
              </div>
              <div>
                <h3 style={S.sectionTitle}>Select Temple</h3>
                <p style={{ fontSize: '0.8rem', color: '#9E7D3F', margin: 0 }}>
                  {selectedCityDistrict
                    ? `Showing temples in ${selectedCityDistrict}`
                    : 'Choose a temple based on your selected location'}
                </p>
              </div>
            </div>

            {/* Temple Search Input */}
            {selectedCityDistrict && (
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#9E7D3F' }} />
                <input
                  type="text"
                  placeholder="Search temple..."
                  value={templeSearchQuery}
                  onChange={e => setTempleSearchQuery(e.target.value)}
                  style={{ ...S.input, paddingLeft: '2.2rem', fontSize: '0.82rem' }}
                />
              </div>
            )}
          </div>

          {!selectedCityDistrict ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#888', fontSize: '0.88rem', background: '#FFFDF9', borderRadius: '12px', border: '1px dashed rgba(200,169,106,0.3)' }}>
              📍 Please select a District / City above to view available temples.
            </div>
          ) : filteredTemples.length === 0 ? (
            <p style={{ color: '#888', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
              No temples found for <strong>{selectedCityDistrict}</strong>. Try selecting a different location.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredTemples.map(t => {
                const isSel = selectedTempleId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTempleId(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.8rem',
                      padding: '0.85rem 1rem', borderRadius: '12px', cursor: 'pointer',
                      border: isSel ? '2px solid #C8A96A' : '1.5px solid rgba(200,169,106,0.15)',
                      background: isSel ? 'rgba(200,169,106,0.08)' : '#FFFDF9',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      border: isSel ? '5px solid #C8A96A' : '2px solid #ccc',
                      background: '#fff',
                    }} />
                    <img src={t.coverImage} alt={t.name} onError={e => e.target.style.display = 'none'}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(200,169,106,0.2)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.88rem', fontWeight: 700, color: '#341F1D' }}>{t.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6E5351', marginTop: '0.1rem' }}>{t.district}, {t.state}</div>
                    </div>
                    {isSel && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={() => setSelectedTempleId(null)} style={{ ...S.btnOutline, padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}>
                          Change
                        </button>
                        <button type="button" onClick={() => setIsTempleDetailsOpen(true)} style={{ ...S.btnOutline, padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}>
                          <Info size={12} /> Details
                        </button>
                      </div>
                    )}
                    {!isSel && (
                      <div style={{ fontSize: '0.78rem', color: '#9E7D3F', fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Star size={12} fill="#D4AF37" style={{ color: '#D4AF37' }} /> {t.rating}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Single Continue Button (Disabled until State + District + Temple selected) */}
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button
              type="button"
              disabled={!isStep1Valid}
              onClick={navigateToBookingPage}
              style={{
                ...S.btnPrimary,
                opacity: isStep1Valid ? 1 : 0.45,
                cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                boxShadow: isStep1Valid ? '0 4px 15px rgba(200,169,106,0.3)' : 'none',
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  /* ═══════════════════════════════════════════════════════════════
     VIEW 2: PAGE 2 — BOOKING DETAILS (/quick-booking/booking)
     ═══════════════════════════════════════════════════════════════ */

  const renderPage2BookingDetails = () => {
    if (!selectedTemple) return null;

    return (
      <section style={{ padding: '1.5rem 1rem 4rem 1rem', background: '#F7EFE6', minHeight: '65vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* Compact Selected Temple Summary Banner */}
          <div style={{ ...S.card, padding: '1rem 1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <img src={selectedTemple.coverImage} alt={selectedTemple.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 700, textTransform: 'uppercase' }}>Selected Temple</div>
                  <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.95rem', fontWeight: 700, color: '#341F1D', margin: 0 }}>
                    {selectedTemple.name} ({selectedTemple.district})
                  </h4>
                </div>
              </div>
              <button type="button" onClick={navigateToLocationPage} style={{ ...S.btnOutline, padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                Change Temple
              </button>
            </div>
          </div>

          {/* ════ SEQUENTIAL ONE-BY-ONE SECTIONS ════ */}

          {/* 1. DARSHAN TYPE */}
          {visibleSections.darshan && (
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={S.sectionIcon()}><Settings size={16} /></div>
                <h3 style={S.sectionTitle}>Darshan Type</h3>
              </div>

              {/* GRID CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {DARSHAN_TYPES.map(d => {
                  const isSel = darshanType === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setDarshanType(prev => prev === d.id ? null : d.id)}
                      style={{
                        padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                        border: isSel ? '2.5px solid #C8A96A' : '1.5px solid rgba(200,169,106,0.2)',
                        background: isSel ? 'rgba(200,169,106,0.08)' : '#FFFDF9',
                        position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        minHeight: '110px', transition: 'all 0.2s ease',
                      }}
                    >
                      {isSel && (
                        <div style={{
                          position: 'absolute', top: '0.6rem', right: '0.6rem',
                          width: '18px', height: '18px', borderRadius: '50%', background: '#C8A96A',
                          color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '1.2rem' }}>{d.icon}</span>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#341F1D', marginTop: '0.3rem' }}>
                          {d.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6E5351', marginTop: '0.1rem' }}>{d.desc}</div>
                      </div>
                      <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#9E7D3F', fontWeight: 600 }}>⏱ {d.duration}</span>
                        <strong style={{ fontFamily: "'Cinzel', serif", fontSize: '0.9rem', color: '#341F1D' }}>
                          {d.price > 0 ? `₹${d.price}` : 'Free'}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. POOJA / SERVICES */}
          {visibleSections.pooja && (
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={S.sectionIcon()}><Sparkles size={16} /></div>
                <h3 style={S.sectionTitle}>Pooja / Services</h3>
              </div>

              {/* GRID CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem' }}>
                {POOJA_SERVICES.map(p => {
                  const isSel = poojaService === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPoojaService(prev => prev === p.id ? null : p.id)}
                      style={{
                        padding: '0.9rem', borderRadius: '12px', cursor: 'pointer',
                        border: isSel ? '2.5px solid #C8A96A' : '1.5px solid rgba(200,169,106,0.2)',
                        background: isSel ? 'rgba(200,169,106,0.08)' : '#FFFDF9',
                        position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        minHeight: '100px', transition: 'all 0.2s ease',
                      }}
                    >
                      {isSel && (
                        <div style={{
                          position: 'absolute', top: '0.5rem', right: '0.5rem',
                          width: '16px', height: '16px', borderRadius: '50%', background: '#C8A96A',
                          color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.88rem', fontWeight: 700, color: '#341F1D', marginTop: '0.2rem' }}>
                          {p.name}
                        </div>
                      </div>
                      <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                        <strong style={{ fontFamily: "'Cinzel', serif", fontSize: '0.88rem', color: '#341F1D' }}>
                          {p.price > 0 ? `₹${p.price}` : 'Free'}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. DATE */}
          {visibleSections.date && (
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={S.sectionIcon()}><CalendarDays size={16} /></div>
                <h3 style={S.sectionTitle}>Select Date</h3>
              </div>

              {/* Compact Date Picker Field + Calendar Popup */}
              <div style={{ position: 'relative', maxWidth: '300px' }}>
                {/* Trigger Field */}
                <div
                  onClick={() => {
                    if (!isDatePickerOpen) {
                      const viewDate = selectedDateIso
                        ? new Date(selectedDateIso + 'T00:00:00')
                        : new Date();
                      setCalendarViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
                    }
                    setIsDatePickerOpen(prev => !prev);
                  }}
                  style={{
                    ...S.input,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: selectedDateIso ? '#341F1D' : '#999',
                    fontWeight: selectedDateIso ? 600 : 400,
                  }}>
                    <CalendarDays size={15} style={{ color: '#9E7D3F' }} />
                    {selectedDateIso
                      ? new Date(selectedDateIso + 'T00:00:00').toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : 'Select Date'}
                  </span>
                  <ChevronDown size={15} style={{
                    color: '#9E7D3F',
                    transform: isDatePickerOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }} />
                </div>

                {/* Calendar Popup */}
                {isDatePickerOpen && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 1100 }}
                      onClick={() => setIsDatePickerOpen(false)}
                    />
                    <div
                      style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 1101,
                        background: '#FFFFFF', borderRadius: '14px',
                        border: '1.5px solid rgba(200,169,106,0.3)',
                        boxShadow: '0 12px 36px rgba(52,31,29,0.15)',
                        padding: '1rem', width: '300px',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Month Navigation */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '0.7rem',
                      }}>
                        <button
                          type="button"
                          disabled={calendarViewDate.getFullYear() === new Date().getFullYear() && calendarViewDate.getMonth() <= new Date().getMonth()}
                          onClick={() => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                          style={{
                            background: 'none', border: '1px solid rgba(200,169,106,0.3)',
                            borderRadius: '6px', width: '28px', height: '28px',
                            cursor: (calendarViewDate.getFullYear() === new Date().getFullYear() && calendarViewDate.getMonth() <= new Date().getMonth()) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#9E7D3F',
                            opacity: (calendarViewDate.getFullYear() === new Date().getFullYear() && calendarViewDate.getMonth() <= new Date().getMonth()) ? 0.3 : 1,
                          }}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span style={{
                          fontFamily: "'Cinzel', serif",
                          fontWeight: 700, color: '#341F1D', fontSize: '0.88rem',
                        }}>
                          {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                          style={{
                            background: 'none', border: '1px solid rgba(200,169,106,0.3)',
                            borderRadius: '6px', width: '28px', height: '28px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#9E7D3F',
                          }}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {/* Day-of-week Headers */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                        textAlign: 'center', marginBottom: '0.3rem',
                      }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} style={{
                            fontSize: '0.7rem', fontWeight: 700, color: '#9E7D3F',
                            padding: '0.25rem 0',
                          }}>
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Day Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {(() => {
                          const year = calendarViewDate.getFullYear();
                          const month = calendarViewDate.getMonth();
                          const firstDayOfWeek = new Date(year, month, 1).getDay();
                          const daysInMonth = new Date(year, month + 1, 0).getDate();
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const cells = [];

                          for (let i = 0; i < firstDayOfWeek; i++) {
                            cells.push(<div key={`e-${i}`} />);
                          }

                          for (let day = 1; day <= daysInMonth; day++) {
                            const cellDate = new Date(year, month, day);
                            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isPast = cellDate <= today;
                            const isSelected = selectedDateIso === iso;

                            cells.push(
                              <button
                                key={iso}
                                type="button"
                                disabled={isPast}
                                onClick={() => {
                                  setSelectedDateIso(iso);
                                  setSelectedTimeSlot(null);
                                  setIsDatePickerOpen(false);
                                }}
                                style={{
                                  width: '100%', aspectRatio: '1',
                                  border: isSelected ? '2px solid #C8A96A' : '1px solid transparent',
                                  borderRadius: '8px',
                                  background: isSelected
                                    ? 'linear-gradient(135deg, rgba(200,169,106,0.2), rgba(212,175,55,0.15))'
                                    : 'transparent',
                                  color: isPast ? '#ccc' : '#341F1D',
                                  fontWeight: isSelected ? 800 : 500,
                                  fontSize: '0.82rem',
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  cursor: isPast ? 'not-allowed' : 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                  opacity: isPast ? 0.35 : 1,
                                }}
                              >
                                {day}
                              </button>
                            );
                          }
                          return cells;
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 4. TIME */}
          {visibleSections.time && (
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={S.sectionIcon()}><Clock size={16} /></div>
                <h3 style={S.sectionTitle}>Select Time Slot</h3>
              </div>

              {/* GRID CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.6rem' }}>
                {availableTimeSlots.map(slot => {
                  const isSel = selectedTimeSlot === slot.label;
                  const isBooked = slot.status === 'booked';
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedTimeSlot(prev => prev === slot.label ? null : slot.label)}
                      style={{
                        padding: '0.65rem 0.5rem', borderRadius: '10px', cursor: isBooked ? 'not-allowed' : 'pointer',
                        border: isBooked ? '1px dashed #ccc' : isSel ? '2.5px solid #C8A96A' : '1.5px solid rgba(200,169,106,0.2)',
                        background: isBooked ? 'rgba(0,0,0,0.03)' : isSel ? 'rgba(200,169,106,0.12)' : '#FFFDF9',
                        textAlign: 'center', opacity: isBooked ? 0.4 : 1, transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isBooked ? '#888' : '#341F1D' }}>{slot.label}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: isBooked ? '#e05252' : slot.status === 'limited' ? '#d97706' : '#16a34a' }}>
                        {isBooked ? 'Full' : slot.status === 'limited' ? 'Few Slots' : 'Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. DEVOTEE DETAILS */}
          {visibleSections.devotees && (
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={S.sectionIcon()}><Users size={16} /></div>
                <h3 style={S.sectionTitle}>Devotee Details</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem' }}>
                {[
                  { field: 'adults', label: 'Adults', sub: '13–59 yrs', min: 1 },
                  { field: 'children', label: 'Children', sub: '5–12 yrs', min: 0 },
                  { field: 'seniors', label: 'Senior Citizens', sub: '60+ yrs', min: 0 },
                ].map(({ field, label, sub, min }) => (
                  <div key={field} style={{
                    background: '#FFFDF9', border: '1.5px solid rgba(200,169,106,0.2)',
                    borderRadius: '10px', padding: '0.8rem', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#341F1D' }}>{label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#9E7D3F', marginBottom: '0.5rem' }}>{sub}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid rgba(200,169,106,0.3)', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}>
                      <button type="button" onClick={() => handleDevoteeChange(field, -1)} disabled={devotees[field] <= min}
                        style={{ background: 'none', border: 'none', padding: '0.3rem 0.5rem', color: '#9E7D3F', cursor: devotees[field] <= min ? 'not-allowed' : 'pointer' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, padding: '0 0.4rem', color: '#341F1D', minWidth: '20px' }}>{devotees[field]}</span>
                      <button type="button" onClick={() => handleDevoteeChange(field, 1)}
                        style={{ background: 'none', border: 'none', padding: '0.3rem 0.5rem', color: '#9E7D3F', cursor: 'pointer' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. CUSTOMER DETAILS */}
          {visibleSections.customer && (
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={S.sectionIcon()}><User size={16} /></div>
                  <h3 style={S.sectionTitle}>Customer Details</h3>
                </div>
                {customer.fullName && !isEditingCustomer && (
                  <button type="button" onClick={() => { setCustomerForm(customer); setIsEditingCustomer(true); }} style={{ ...S.btnOutline, padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
                    <Edit3 size={12} /> Edit
                  </button>
                )}
              </div>

              {!isEditingCustomer && customer.fullName ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', fontSize: '0.82rem' }}>
                  <div><span style={{ color: '#9E7D3F', display: 'block', fontSize: '0.7rem' }}>Name</span><strong>{customer.fullName}</strong></div>
                  <div><span style={{ color: '#9E7D3F', display: 'block', fontSize: '0.7rem' }}>Mobile</span><strong>{customer.mobile}</strong></div>
                  <div><span style={{ color: '#9E7D3F', display: 'block', fontSize: '0.7rem' }}>Email</span><strong>{customer.email}</strong></div>
                  <div><span style={{ color: '#e05252', display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>Emergency Contact *</span><strong style={{ color: '#341F1D' }}>{customer.emergencyContact || 'Required'}</strong></div>
                </div>
              ) : (
                <form onSubmit={handleSaveCustomer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#341F1D' }}>Full Name *</label>
                    <input type="text" value={customerForm.fullName} onChange={e => setCustomerForm(f => ({ ...f, fullName: e.target.value }))} style={S.input} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#341F1D' }}>Mobile *</label>
                    <input type="tel" value={customerForm.mobile} onChange={e => setCustomerForm(f => ({ ...f, mobile: e.target.value }))} style={S.input} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#341F1D' }}>Email *</label>
                    <input type="email" value={customerForm.email} onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))} style={S.input} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#e05252' }}>Emergency Contact * (Required)</label>
                    <input type="tel" value={customerForm.emergencyContact} onChange={e => setCustomerForm(f => ({ ...f, emergencyContact: e.target.value }))} style={{ ...S.input, border: '1.5px solid #e05252' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '0.4rem' }}>
                    <button type="submit" style={{ ...S.btnPrimary, padding: '0.5rem 1.2rem', fontSize: '0.82rem' }}>Save Details</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 7. BOOKING SUMMARY & SINGLE CONTINUE BUTTON */}
          {visibleSections.summary && (
            <div style={{ ...S.card, border: '2px solid rgba(200,169,106,0.3)', background: '#FFFDF9' }}>
              <h3 style={{ ...S.sectionTitle, fontSize: '0.95rem', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(200,169,106,0.2)' }}>
                Booking Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', fontSize: '0.82rem' }}>
                <div><span style={{ color: '#6E5351' }}>Temple:</span> <strong>{selectedTemple.name}</strong></div>
                <div><span style={{ color: '#6E5351' }}>Darshan:</span> <strong>{selectedDarshanObj?.name || '—'}</strong></div>
                <div><span style={{ color: '#6E5351' }}>Service:</span> <strong>{selectedPoojaObj?.name || 'None'}</strong></div>
                <div><span style={{ color: '#6E5351' }}>Date:</span> <strong>{selectedDateIso}</strong></div>
                <div><span style={{ color: '#6E5351' }}>Time:</span> <strong>{selectedTimeSlot || '—'}</strong></div>
                <div><span style={{ color: '#6E5351' }}>Devotees:</span> <strong>{totalDevotees} ({devotees.adults}A, {devotees.children}C, {devotees.seniors}S)</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.8rem', borderTop: '2px solid rgba(200,169,106,0.2)' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#9E7D3F', textTransform: 'uppercase', fontWeight: 700 }}>Total Amount</span>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', fontWeight: 800, color: '#9E7D3F' }}>₹{grandTotal.toLocaleString()}</div>
                </div>

                {/* ONLY ONE CONTINUE BUTTON ON BOOKING DETAILS PAGE */}
                <button
                  type="button"
                  disabled={!canContinueToPayment}
                  onClick={handleContinueToReviewPayment}
                  style={{
                    ...S.btnPrimary,
                    opacity: canContinueToPayment ? 1 : 0.5,
                    cursor: canContinueToPayment ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </section>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     VIEW 3: STEP 3 — REVIEW & PAYMENT
     ═══════════════════════════════════════════════════════════════ */

  const renderStep3ReviewPayment = () => {
    if (!selectedTemple) return null;

    const upiId = 'darshanjourney@ybl';
    const upiPaymentString = `upi://pay?pa=${upiId}&pn=Darshan%20Journey&am=${grandTotal}&cu=INR&tn=Booking-${bookingRef}`;
    const bookingQRData = `DARSHAN-JOURNEY|REF:${bookingRef}|TEMPLE:${selectedTemple.name}|DATE:${selectedDateIso}|TIME:${selectedTimeSlot}|DEVOTEES:${totalDevotees}|AMT:${grandTotal}|NAME:${customer.fullName}`;

    const selectedPM = PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod);

    /* ──── STEP 3: BOOKING CONFIRMED ──── */
    if (paymentStep === 3) {
      const formattedDate = selectedDateIso
        ? new Date(selectedDateIso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : selectedDateIso;

      return (
        <section style={{ padding: '2rem 1rem 4rem 1rem', background: '#F7EFE6', minHeight: '60vh' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ ...S.card, padding: '2rem 1.5rem' }}>

              {/* Success Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 0.8rem',
                  background: 'linear-gradient(135deg, rgba(22,163,74,0.12), rgba(22,163,74,0.06))',
                  border: '2.5px solid #16a34a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={32} style={{ color: '#16a34a' }} />
                </div>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.35rem', fontWeight: 700, color: '#341F1D', margin: '0 0 0.3rem 0', letterSpacing: '0.04em' }}>
                  Booking Confirmed!
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#6E5351', margin: 0 }}>
                  Confirmation sent to <strong style={{ color: '#341F1D' }}>{customer.email}</strong>
                </p>
              </div>

              {/* Booking Reference */}
              <div style={{
                background: 'linear-gradient(135deg, #341F1D, #2A1810)',
                borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#C8A96A', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Booking Reference</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.5rem', fontWeight: 800, color: '#F7EFE6', margin: '0.15rem 0 0 0', letterSpacing: '0.1em' }}>{bookingRef}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(bookingRef); }}
                  style={{ background: 'rgba(200,169,106,0.15)', border: '1px solid rgba(200,169,106,0.3)', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#C8A96A', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600 }}
                >
                  <Copy size={12} /> Copy
                </button>
              </div>

              {/* Booking Details Grid */}
              <div style={{
                background: '#FFFDF9', border: '1.5px solid rgba(200,169,106,0.2)',
                borderRadius: '12px', padding: '1rem 1.2rem', marginBottom: '1.2rem',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9E7D3F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.7rem', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(200,169,106,0.15)' }}>
                  Booking Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem 1.5rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>Temple</span>
                    <strong style={{ color: '#341F1D' }}>{selectedTemple.name}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>Location</span>
                    <strong style={{ color: '#341F1D' }}>{selectedTemple.district}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>Darshan Type</span>
                    <strong style={{ color: '#341F1D' }}>{selectedDarshanObj?.icon} {selectedDarshanObj?.name}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>Service</span>
                    <strong style={{ color: '#341F1D' }}>{selectedPoojaObj?.icon} {selectedPoojaObj?.name}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>Date</span>
                    <strong style={{ color: '#341F1D' }}>{formattedDate}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>Time Slot</span>
                    <strong style={{ color: '#341F1D' }}>{selectedTimeSlot}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>Customer</span>
                    <strong style={{ color: '#341F1D' }}>{customer.fullName}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>Devotees</span>
                    <strong style={{ color: '#341F1D' }}>{totalDevotees} Person(s) ({devotees.adults}A, {devotees.children}C, {devotees.seniors}S)</strong>
                  </div>
                </div>

                {/* Total Paid */}
                <div style={{
                  marginTop: '0.8rem', paddingTop: '0.7rem',
                  borderTop: '1.5px dashed rgba(200,169,106,0.25)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9E7D3F', textTransform: 'uppercase' }}>Total Paid</span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Scannable Booking QR Code */}
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <p style={{ fontSize: '0.72rem', color: '#9E7D3F', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.05em' }}>Scan at Temple Entrance</p>
                <ScanQRCode value={bookingQRData} size={160} />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => window.print()} style={{ ...S.btnOutline, padding: '0.6rem 1.2rem' }}>
                  <Printer size={14} /> Print Ticket
                </button>
                <button type="button" onClick={handleBookAnother} style={{ ...S.btnPrimary, padding: '0.6rem 1.4rem' }}>
                  Book Another Darshan
                </button>
              </div>

            </div>
          </div>
        </section>
      );
    }

    /* ──── STEP 2: PROCESSING PAYMENT ──── */
    if (paymentStep === 2) {
      return (
        <section style={{ padding: '2rem 1rem 4rem 1rem', background: '#F7EFE6', minHeight: '60vh' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ ...S.card, textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto',
                  border: '3px solid rgba(200,169,106,0.3)', borderTopColor: '#C8A96A',
                  animation: 'spin 1s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', fontWeight: 700, color: '#341F1D', margin: '0 0 0.4rem 0' }}>
                Processing Payment
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6E5351', margin: 0 }}>
                Verifying your payment of <strong>₹{grandTotal.toLocaleString()}</strong> via {selectedPM?.label || 'UPI'}...
              </p>
              <div style={{ marginTop: '1.2rem', padding: '0.6rem 1rem', background: '#FFFDF9', borderRadius: '8px', border: '1px solid rgba(200,169,106,0.15)', fontSize: '0.78rem', color: '#9E7D3F' }}>
                <Shield size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                Secured by 256-bit SSL encryption
              </div>
            </div>
          </div>
        </section>
      );
    }

    /* ──── STEP 1: COMPLETE PAYMENT ──── */
    return (
      <section style={{ padding: '2rem 1rem 4rem 1rem', background: '#F7EFE6', minHeight: '60vh' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── LEFT: Payment Panel ── */}
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <div style={S.sectionIcon()}><CreditCard size={16} /></div>
              <h3 style={S.sectionTitle}>Complete Payment</h3>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9E7D3F', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>Payment Method</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {PAYMENT_METHODS.map(pm => {
                  const isSel = selectedPaymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(pm.id)}
                      style={{
                        padding: '0.6rem 0.4rem', borderRadius: '10px', cursor: 'pointer',
                        border: isSel ? '2px solid #C8A96A' : '1.5px solid rgba(200,169,106,0.2)',
                        background: isSel ? 'rgba(200,169,106,0.1)' : '#FFFDF9',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                        transition: 'all 0.2s ease', position: 'relative',
                      }}
                    >
                      {isSel && (
                        <div style={{
                          position: 'absolute', top: '-5px', right: '-5px',
                          width: '16px', height: '16px', borderRadius: '50%', background: '#C8A96A',
                          color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                      <span style={{ fontSize: '1.1rem' }}>{pm.icon}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: isSel ? 700 : 500, color: '#341F1D' }}>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* UPI QR Code */}
            <div style={{
              textAlign: 'center', padding: '1.2rem', marginBottom: '1rem',
              background: '#FFFDF9', borderRadius: '14px',
              border: '1.5px solid rgba(200,169,106,0.2)',
            }}>
              <p style={{ fontSize: '0.72rem', color: '#9E7D3F', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 0.7rem 0', letterSpacing: '0.04em' }}>
                Scan & Pay via {selectedPM?.label || 'UPI'}
              </p>
              <div style={{ display: 'inline-block', padding: '0.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(200,169,106,0.15)' }}>
                <ScanQRCode value={upiPaymentString} size={180} />
              </div>
              <div style={{ marginTop: '0.7rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#9E7D3F', fontWeight: 600 }}>UPI ID</span>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  marginLeft: '0.5rem', padding: '0.3rem 0.7rem',
                  background: 'rgba(200,169,106,0.08)', borderRadius: '6px',
                  border: '1px solid rgba(200,169,106,0.2)',
                }}>
                  <code style={{ fontSize: '0.82rem', fontWeight: 700, color: '#341F1D', letterSpacing: '0.02em' }}>{upiId}</code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(upiId)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem', color: '#9E7D3F' }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <div style={{
              textAlign: 'center', marginBottom: '1rem',
              padding: '0.8rem', background: 'linear-gradient(135deg, rgba(200,169,106,0.08), rgba(212,175,55,0.05))',
              borderRadius: '10px', border: '1px solid rgba(200,169,106,0.15)',
            }}>
              <div style={{ fontSize: '0.72rem', color: '#9E7D3F', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Total Payable</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem', fontWeight: 800, color: '#341F1D', margin: '0.1rem 0' }}>₹{grandTotal.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: '#6E5351' }}>(Incl. 5% GST: ₹{gstAmount.toLocaleString()})</div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleCompletePayment}
              style={{
                ...S.btnPrimary, width: '100%', padding: '0.95rem',
                fontSize: '0.95rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #C8A96A 0%, #D4AF37 50%, #C8A96A 100%)',
                boxShadow: '0 6px 20px rgba(200,169,106,0.35)',
              }}
            >
              <Shield size={16} /> Pay ₹{grandTotal.toLocaleString()} via {selectedPM?.label || 'UPI'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#9E7D3F' }}>
              <Shield size={12} /> 100% Secure Payment · SSL Encrypted
            </div>
          </div>

          {/* ── RIGHT: Review Summary ── */}
          <div style={S.card}>
            <h3 style={{ ...S.sectionTitle, fontSize: '0.95rem', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1.5px solid rgba(200,169,106,0.2)' }}>
              Review Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem' }}>
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={13} /> Customer</span>
                <strong>{customer.fullName}</strong>
              </div>
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> Temple</span>
                <strong>{selectedTemple.name}</strong>
              </div>
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351' }}>Darshan</span>
                <strong>{selectedDarshanObj?.icon} {selectedDarshanObj?.name}</strong>
              </div>
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351' }}>Service</span>
                <strong>{selectedPoojaObj?.icon} {selectedPoojaObj?.name}</strong>
              </div>
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CalendarDays size={13} /> Date</span>
                <strong>{selectedDateIso ? new Date(selectedDateIso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</strong>
              </div>
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} /> Time</span>
                <strong>{selectedTimeSlot || '—'}</strong>
              </div>
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={13} /> Devotees</span>
                <strong>{totalDevotees} ({devotees.adults}A, {devotees.children}C, {devotees.seniors}S)</strong>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{
              marginTop: '0.8rem', paddingTop: '0.7rem',
              borderTop: '1.5px dashed rgba(200,169,106,0.2)',
              display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem',
            }}>
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351' }}>Darshan ({selectedDarshanObj?.name} × {totalDevotees})</span>
                <span>₹{baseDarshanTotal.toLocaleString()}</span>
              </div>
              {serviceTotal > 0 && (
                <div style={S.summaryRow}>
                  <span style={{ color: '#6E5351' }}>Service ({selectedPoojaObj?.name})</span>
                  <span>₹{serviceTotal.toLocaleString()}</span>
                </div>
              )}
              <div style={S.summaryRow}>
                <span style={{ color: '#6E5351' }}>GST (5%)</span>
                <span>₹{gstAmount.toLocaleString()}</span>
              </div>
              <div style={{ ...S.summaryRow, paddingTop: '0.5rem', borderTop: '1.5px solid rgba(200,169,106,0.2)', marginTop: '0.2rem' }}>
                <strong style={{ color: '#341F1D', fontSize: '0.95rem' }}>Grand Total</strong>
                <strong style={{ fontFamily: "'Cinzel', serif", fontSize: '1.15rem', color: '#9E7D3F' }}>₹{grandTotal.toLocaleString()}</strong>
              </div>
            </div>

            {/* Back button */}
            <button
              type="button"
              onClick={() => { setActiveStepNum(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ ...S.btnOutline, marginTop: '1rem', width: '100%', justifyContent: 'center' }}
            >
              <ArrowLeft size={14} /> Back to Booking Details
            </button>
          </div>
        </div>
      </section>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="home-website-wrapper" style={{ background: '#FFFDF9', minHeight: '100vh' }}>
      <Navbar
        activePage="booking"
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

      {/* ── Compact Top Header ── */}
      <div style={{
        background: 'linear-gradient(160deg, #19100A 0%, #2A1810 50%, #100A06 100%)',
        paddingTop: '105px', paddingBottom: '1.5rem', textAlign: 'center', color: '#F7EFE6',
        borderBottom: '1px solid rgba(200,169,106,0.3)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
            fontWeight: 700, color: '#FFFFFF', margin: 0,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Quick Booking
          </h1>
        </div>
      </div>

      {/* ── 3-Step Indicator ── */}
      {renderStepIndicator()}

      {/* ── Main View Content ── */}
      {activeStepNum === 3
        ? renderStep3ReviewPayment()
        : currentPageView === 'booking'
          ? renderPage2BookingDetails()
          : renderPage1LocationTemple()
      }

      {/* ── Footer ── */}
      <Footer
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToContact={onGoToContact}
        onOpenBooking={onOpenBooking}
      />

      {/* ── Modals ── */}
      {renderStatePopoverModal()}
      {renderDistrictPopoverModal()}
      {renderLocationPopupModal()}
      {renderTempleDetailsModal()}
    </div>
  );
}
