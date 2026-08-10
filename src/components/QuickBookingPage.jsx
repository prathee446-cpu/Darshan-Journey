import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { REAL_TAMIL_NADU_TEMPLES } from '../services/templeDataService';
import {
  CalendarDays, MapPin, Users, Clock, Sparkles,
  ChevronRight, Plus, Minus, Shield, Heart, Phone, Mail,
  Lock, Headphones, X, Search,
  QrCode, Timer, Download, Star, Home, Eye,
  Check, AlertCircle, Copy,
  Printer, ChevronDown, Wifi, Image as ImageIcon,
  ChevronLeft, Globe, Ticket, Info, ChevronUp,
  Accessibility, Car, Building, Compass,
} from 'lucide-react';

/* ─────────── CONSTANTS ─────────── */

/**
 * DEVOTEE_CATEGORIES — configurable from backend/admin.
 * Update ageRange here to reflect policy changes without touching JSX.
 */
const DEVOTEE_CATEGORIES = [
  { field: 'adults',   label: 'Adults',          ageRange: '13+ years',  icon: '👤', min: 1 },
  { field: 'children', label: 'Children',         ageRange: '5–12 years', icon: '👶', min: 0 },
  { field: 'seniors',  label: 'Senior Citizens',  ageRange: '60+ years',  icon: '🧓', min: 0 },
];

const DEFAULT_DARSHAN_TYPES = [
  { id: 'general',  name: 'General Darshan',  desc: 'Standard entry to the sanctum',            price: 0,    duration: '2–3 Hours',  icon: '🙏' },
  { id: 'vip',      name: 'VIP Darshan',       desc: 'Priority entry with reduced waiting time', price: 1200, duration: '1–2 Hours',  icon: '⭐' },
  { id: 'special',  name: 'Special Darshan',   desc: 'Close-up darshan with personal blessings', price: 800,  duration: '45–60 Min', icon: '✨' },
  { id: 'free',     name: 'Free Entry',         desc: 'Open public darshan during temple hours',  price: 0,    duration: 'Open',       icon: '🕉️' },
];

const DEFAULT_POOJA_SERVICES = [
  { id: 'archana',    name: 'Archana',       desc: 'Chanting of names and offering flowers',      price: 501,  duration: '20 min',  icon: '📿' },
  { id: 'abhishekam', name: 'Abhishekam',    desc: 'Traditional ritual bath offering to deity',   price: 2200, duration: '45 min',  icon: '🪔' },
  { id: 'aarti',      name: 'Aarti',         desc: 'Lamp offering ceremony with devotional songs', price: 350,  duration: '15 min',  icon: '🪔' },
  { id: 'homam',      name: 'Homam',         desc: 'Sacred fire ritual with mantras',              price: 4500, duration: '90 min',  icon: '🔥' },
  { id: 'special',    name: 'Special Pooja', desc: 'Comprehensive pooja package with prasad',      price: 1500, duration: '30 min',  icon: '🌺' },
];

const DEFAULT_TIME_SLOTS = [
  { id: 't1', label: '05:00 AM – 07:00 AM', sublabel: 'Pratah Darshan',    availability: 'available' },
  { id: 't2', label: '08:00 AM – 10:00 AM', sublabel: 'Madhyan Darshan',   availability: 'available' },
  { id: 't3', label: '11:00 AM – 01:00 PM', sublabel: 'Tritiya Prahara',   availability: 'limited'   },
  { id: 't4', label: '02:00 PM – 04:00 PM', sublabel: 'Chakarana Darshan', availability: 'available' },
  { id: 't5', label: '05:00 PM – 07:00 PM', sublabel: 'Sandhya Darshan',   availability: 'booked'    },
  { id: 't6', label: '08:00 PM – 09:00 PM', sublabel: 'Sayam Darshan',     availability: 'available' },
];

const ADDITIONAL_REQ = [
  { id: 'wheelchair', label: 'Wheelchair Assistance', icon: <Accessibility size={16} /> },
  { id: 'transport',  label: 'Transport Required',    icon: <Car size={16} />           },
  { id: 'accomm',    label: 'Accommodation',          icon: <Building size={16} />      },
  { id: 'guide',     label: 'Guide Required',         icon: <Compass size={16} />       },
];

const PAYMENT_METHODS = [
  { id: 'upi',        label: 'UPI',        icon: '📲', color: '#7C3AED' },
  { id: 'gpay',       label: 'Google Pay', icon: '🟢', color: '#34A853' },
  { id: 'phonepe',    label: 'PhonePe',    icon: '🟣', color: '#5F259F' },
  { id: 'paytm',      label: 'Paytm',      icon: '🔵', color: '#00BAF2' },
  { id: 'bhim',       label: 'BHIM',       icon: '🇮🇳', color: '#FF6600' },
  { id: 'card',       label: 'Card',       icon: '💳', color: '#1A1A2E' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', color: '#0F4C75' },
];

const STEP_LABELS = ['Location & Temple', 'Booking Details', 'Payment'];

const ACCORDION_ORDER = ['darshan', 'pooja', 'datetime', 'devotees', 'customer', 'requirements'];

/* ─────────── HELPERS ─────────── */
function generateBookingId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DJ-${ts}-${rand}`;
}
function generateTransactionId() {
  return 'TXN' + Math.random().toString(36).substring(2, 12).toUpperCase();
}

/* ─────────── MINI QR CODE ─────────── */
function QRCode({ value, size = 160 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const ctx    = canvas.getContext('2d');
    const cs     = Math.floor(size / 25);
    const actual = cs * 25;
    canvas.width  = actual;
    canvas.height = actual;

    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, actual, actual);

    const drawFinder = (x, y) => {
      ctx.fillStyle = '#341F1D';
      ctx.fillRect(x * cs, y * cs, 7 * cs, 7 * cs);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((x + 1) * cs, (y + 1) * cs, 5 * cs, 5 * cs);
      ctx.fillStyle = '#341F1D';
      ctx.fillRect((x + 2) * cs, (y + 2) * cs, 3 * cs, 3 * cs);
    };
    drawFinder(1, 1); drawFinder(17, 1); drawFinder(1, 17);

    ctx.fillStyle = '#C8A96A';
    ctx.fillRect(11 * cs, 11 * cs, 3 * cs, 3 * cs);

    const seed = Math.abs(hash);
    const lcg  = s => (1664525 * s + 1013904223) & 0xFFFFFFFF;
    let rng = seed;

    ctx.fillStyle = '#341F1D';
    for (let row = 1; row < 24; row++) {
      for (let col = 1; col < 24; col++) {
        if ((row < 8 && col < 8) || (row < 8 && col > 16) || (row > 16 && col < 8)) continue;
        if (row >= 11 && row <= 13 && col >= 11 && col <= 13) continue;
        rng = lcg(rng);
        const cc = value.charCodeAt((row * 25 + col) % value.length) || 0;
        if (((rng ^ cc) & 0xFF) > 100) {
          ctx.fillRect(col * cs, row * cs, cs, cs);
        }
      }
    }

    ctx.fillStyle = '#341F1D';
    ctx.fillRect(18 * cs, 18 * cs, 5 * cs, 5 * cs);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(19 * cs, 19 * cs, 3 * cs, 3 * cs);
    ctx.fillStyle = '#C8A96A';
    ctx.fillRect(20 * cs, 20 * cs, cs, cs);
  }, [value, size]);

  return <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '8px', imageRendering: 'pixelated' }} />;
}

/* ─────────── COUNTDOWN TIMER ─────────── */
function CountdownTimer({ onExpire }) {
  const [seconds, setSeconds] = useState(600);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (seconds <= 0) { setExpired(true); onExpire?.(); return; }
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds, onExpire]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div className={`qb-countdown ${seconds < 60 ? 'urgent' : ''} ${expired ? 'expired' : ''}`}>
      <Timer size={16} />
      {expired
        ? <span>Payment window expired</span>
        : <span>Time remaining: <strong>{mins}:{secs}</strong></span>}
    </div>
  );
}

/* ─────────── SUCCESS CHECKMARK ─────────── */
function SuccessCheckmark() {
  return (
    <div className="qb-success-check-wrapper">
      <svg className="qb-success-check-svg" viewBox="0 0 130 130" fill="none">
        <circle className="qb-check-circle" cx="65" cy="65" r="60" stroke="#22C55E" strokeWidth="5" fill="none" />
        <polyline className="qb-check-mark" points="35,65 55,85 95,45" stroke="#22C55E" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ─────────── TEMPLE IMAGE WITH FALLBACK ─────────── */
function TempleImg({ src, alt, className, style, height = '180px' }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [src]);

  if (!src || err) {
    return (
      <div className={`qb-temple-img-fallback ${className || ''}`} style={{ ...style, minHeight: height }}>
        <ImageIcon size={32} style={{ color: '#C8A96A', opacity: 0.6 }} />
        <span>Temple image unavailable</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setErr(true)} />;
}

/* ─────────── SEARCHABLE SELECT ─────────── */
function SearchableSelect({ value, onChange, options, placeholder, disabled = false, icon }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef   = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => searchRef.current?.focus(), 80); }
    else       { setSearch(''); }
  }, [open]);

  const filtered = useMemo(() =>
    options.filter(o => o.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  return (
    <div className={`qb-ss-wrap ${disabled ? 'qb-ss-disabled' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className={`qb-ss-trigger ${open ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon && <span className="qb-ss-icon">{icon}</span>}
        <span className="qb-ss-value">{value || placeholder}</span>
        <ChevronDown size={15} className={`qb-ss-chevron ${open ? 'rotated' : ''}`} />
      </button>

      {open && (
        <div className="qb-ss-panel">
          <div className="qb-ss-search-row">
            <Search size={13} className="qb-ss-search-icon" />
            <input
              ref={searchRef}
              className="qb-ss-search-inp"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>
          <div className="qb-ss-list" role="listbox">
            {filtered.length === 0 ? (
              <div className="qb-ss-empty">No results found</div>
            ) : (
              filtered.map(opt => (
                <button
                  type="button"
                  key={opt}
                  role="option"
                  aria-selected={value === opt}
                  className={`qb-ss-opt ${value === opt ? 'selected' : ''}`}
                  onClick={() => { onChange(opt); setOpen(false); }}
                >
                  {value === opt && <Check size={12} className="qb-ss-opt-check" />}
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── TEMPLE SEARCH MODAL ─────────── */
function TempleSearchModal({ onClose, onSelect, preFilterDistrict = null }) {
  const [query, setQuery] = useState('');
  const [page,  setPage]  = useState(1);
  const PAGE_SIZE = 12;
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REAL_TAMIL_NADU_TEMPLES.filter(t => {
      const matchDist  = !preFilterDistrict || t.district === preFilterDistrict;
      const matchQuery = !q ||
        (t.name     || '').toLowerCase().includes(q) ||
        (t.district || '').toLowerCase().includes(q) ||
        (t.address  || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q);
      return matchDist && matchQuery;
    });
  }, [query, preFilterDistrict]);

  const displayed = filtered.slice(0, page * PAGE_SIZE);
  const hasMore   = displayed.length < filtered.length;

  return (
    <div className="qb-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        className="qb-temple-modal"
        initial={{ opacity: 0, scale: 0.93, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 30 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="qb-modal-header">
          <div className="qb-modal-title-row">
            <div className="qb-section-icon"><Search size={18} /></div>
            <div>
              <h3 className="qb-modal-title">
                {preFilterDistrict ? `Temples in ${preFilterDistrict}` : 'Search Sacred Temples'}
              </h3>
              <p className="qb-modal-sub">
                {filtered.length} temple{filtered.length !== 1 ? 's' : ''} available
                {preFilterDistrict ? ` in ${preFilterDistrict} district` : ' · Search by name, type, or area'}
              </p>
            </div>
          </div>
          <button className="qb-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Search Bar */}
        <div className="qb-modal-search-bar">
          <Search size={16} className="qb-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="qb-modal-search-input"
            placeholder="Search temple name, deity type, area..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
          />
          {query && (
            <button className="qb-modal-clear" onClick={() => setQuery('')}><X size={14} /></button>
          )}
        </div>

        {/* Temple Cards */}
        <div className="qb-modal-list">
          {displayed.length === 0 ? (
            <div className="qb-modal-empty">
              <Search size={32} style={{ color: '#C8A96A', opacity: 0.5 }} />
              <p>No temples found{preFilterDistrict ? ` in ${preFilterDistrict}` : ''}. Try a different search.</p>
            </div>
          ) : (
            displayed.map(temple => (
              <button
                key={temple.id}
                className="qb-modal-temple-card"
                onClick={() => { onSelect(temple); onClose(); }}
              >
                <div className="qb-modal-temple-img-wrap">
                  <TempleImg
                    src={temple.coverImage}
                    alt={temple.name}
                    className="qb-modal-temple-img"
                    height="70px"
                  />
                  {temple.rating >= 4.8 && (
                    <span className="qb-mtc-popular">⭐ Popular</span>
                  )}
                </div>
                <div className="qb-modal-temple-info">
                  <div className="qb-modal-temple-name">{temple.name}</div>
                  <div className="qb-modal-temple-meta">
                    <MapPin size={11} />
                    {temple.district}
                    {temple.deityLabel && <span className="qb-modal-deity">{temple.deityLabel}</span>}
                  </div>
                  <div className="qb-modal-temple-timing">
                    <Clock size={11} /> {temple.openingTime} – {temple.closingTime}
                    {temple.entryFee && (
                      <span className="qb-modal-fee"> · {temple.entryFee.split('•')[0].trim()}</span>
                    )}
                  </div>
                </div>
                <div className="qb-modal-temple-rating">
                  <Star size={12} fill="#C8A96A" color="#C8A96A" />
                  <span>{temple.rating}</span>
                </div>
              </button>
            ))
          )}

          {hasMore && (
            <button className="qb-modal-load-more" onClick={() => setPage(p => p + 1)}>
              Load more temples ({filtered.length - displayed.length} remaining)
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────── COMPACT TEMPLE CARD ─────────── */
function CompactTempleCard({ temple, onChange }) {
  const [expanded, setExpanded] = useState(false);

  if (!temple) return null;

  const isOpen = (() => {
    try {
      const now  = new Date();
      const [h, m] = temple.openingTime.replace(/[APM\s]/gi, '').split(':').map(Number);
      const [h2,m2] = temple.closingTime.replace(/[APM\s]/gi, '').split(':').map(Number);
      const nowMin  = now.getHours() * 60 + now.getMinutes();
      const openMin = (temple.openingTime.includes('PM') && h !== 12 ? h + 12 : h) * 60 + (m || 0);
      const closeMin= (temple.closingTime.includes('PM') && h2 !== 12 ? h2 + 12 : h2) * 60 + (m2 || 0);
      return nowMin >= openMin && nowMin <= closeMin;
    } catch { return true; }
  })();

  return (
    <div className="qb-compact-temple-card">
      <div className="qb-ctc-main">
        <div className="qb-ctc-img-wrap">
          <TempleImg src={temple.coverImage} alt={temple.name} className="qb-ctc-img" height="64px" />
        </div>
        <div className="qb-ctc-info">
          <div className="qb-ctc-name-row">
            <span className="qb-ctc-name">{temple.name}</span>
            {temple.rating && (
              <span className="qb-ctc-rating">
                <Star size={11} fill="#C8A96A" color="#C8A96A" />
                {temple.rating}
              </span>
            )}
          </div>
          <div className="qb-ctc-loc">
            <MapPin size={11} /> {temple.district}, {temple.state}
          </div>
          <div className="qb-ctc-meta-row">
            <span className={`qb-ctc-status ${isOpen ? 'open' : 'closed'}`}>
              {isOpen ? '● Open' : '● Closed'}
            </span>
            <span className="qb-ctc-hours"><Clock size={11} /> {temple.openingTime} – {temple.closingTime}</span>
            {temple.entryFee && (
              <span className="qb-ctc-fee"><Ticket size={11} /> {temple.entryFee.split('•')[0].trim()}</span>
            )}
          </div>
        </div>
        <div className="qb-ctc-actions">
          <button className="qb-ctc-change-btn" onClick={onChange}>
            <ChevronLeft size={13} /> Change
          </button>
          <button
            className={`qb-ctc-expand-btn ${expanded ? 'active' : ''}`}
            onClick={() => setExpanded(e => !e)}
          >
            <Info size={13} />
            {expanded ? 'Hide' : 'Details'}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="qb-ctc-expand-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="qb-ctc-panel-inner">
              <div className="qb-ctc-panel-grid">
                {temple.address && (
                  <div className="qb-ctc-panel-item">
                    <div className="qb-ctc-panel-label"><MapPin size={11} /> Address</div>
                    <div className="qb-ctc-panel-val">{temple.address}</div>
                  </div>
                )}
                <div className="qb-ctc-panel-item">
                  <div className="qb-ctc-panel-label"><Clock size={11} /> Temple Hours</div>
                  <div className="qb-ctc-panel-val">
                    {temple.openingTime} – {temple.closingTime}
                    {temple.afternoonBreak && <span className="qb-ctc-break"> · Break: {temple.afternoonBreak}</span>}
                  </div>
                </div>
                {temple.dressCode && (
                  <div className="qb-ctc-panel-item">
                    <div className="qb-ctc-panel-label"><Shield size={11} /> Dress Code</div>
                    <div className="qb-ctc-panel-val">{temple.dressCode}</div>
                  </div>
                )}
                {temple.specialDarshan && (
                  <div className="qb-ctc-panel-item">
                    <div className="qb-ctc-panel-label"><Star size={11} /> Special Darshan</div>
                    <div className="qb-ctc-panel-val">{temple.specialDarshan}</div>
                  </div>
                )}
              </div>

              {temple.poojaSchedule?.length > 0 && (
                <div className="qb-ctc-panel-section">
                  <div className="qb-ctc-panel-label"><CalendarDays size={11} /> Darshan & Pooja Timings</div>
                  <div className="qb-ctc-pooja-chips">
                    {temple.poojaSchedule.map((p, i) => (
                      <span key={i} className="qb-ctc-pooja-chip">
                        <strong>{p.name}</strong> · {p.time}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(temple.contactNumber || temple.website) && (
                <div className="qb-ctc-panel-contacts">
                  {temple.contactNumber && (
                    <a href={`tel:${temple.contactNumber}`} className="qb-ctc-contact-link">
                      <Phone size={12} /> {temple.contactNumber}
                    </a>
                  )}
                  {temple.website && (
                    <a href={temple.website} target="_blank" rel="noopener noreferrer" className="qb-ctc-contact-link">
                      <Globe size={12} /> Official Website ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── ACCORDION SECTION ─────────── */
function AccordionSection({ id, title, icon, isOpen, onToggle, summary, isCompleted, children }) {
  return (
    <div className={`qb-accordion-section ${isOpen ? 'open' : ''} ${isCompleted ? 'completed' : ''}`}>
      <button className="qb-accordion-header" onClick={() => onToggle(id)}>
        <div className="qb-acc-header-left">
          <div className={`qb-acc-status-dot ${isCompleted ? 'done' : isOpen ? 'active' : ''}`}>
            {isCompleted ? <Check size={12} /> : icon}
          </div>
          <div className="qb-acc-title-block">
            <span className="qb-acc-title">{title}</span>
            {!isOpen && summary && (
              <span className="qb-acc-summary">{summary}</span>
            )}
          </div>
        </div>
        <div className="qb-acc-chevron">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="qb-accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="qb-accordion-body-inner">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── DARSHAN OPTION CARD ─────────── */
function DarshanOptionCard({ option, selected, onSelect }) {
  return (
    <label className={`qb-darshan-option ${selected ? 'selected' : ''}`}>
      <input type="radio" name="darshan" value={option.id} checked={selected} onChange={() => onSelect(option)} className="qb-darshan-radio" />
      <div className="qb-darshan-radio-dot">{selected && <div className="qb-darshan-radio-inner" />}</div>
      <div className="qb-darshan-option-content">
        <div className="qb-darshan-option-header">
          <span className="qb-darshan-option-icon">{option.icon}</span>
          <span className="qb-darshan-option-name">{option.name}</span>
          <span className="qb-darshan-option-price">
            {option.price === 0 ? <span className="qb-free-badge">Free</span> : `₹${option.price.toLocaleString()}`}
          </span>
        </div>
        <div className="qb-darshan-option-desc">{option.desc}</div>
        <div className="qb-darshan-option-meta">
          <Clock size={11} /> {option.duration}
        </div>
      </div>
      {selected && <div className="qb-darshan-option-check"><Check size={13} /></div>}
    </label>
  );
}

/* ─────────── POOJA SERVICE CARD ─────────── */
function PoojaServiceCard({ service, selected, onSelect }) {
  return (
    <label className={`qb-pooja-option ${selected ? 'selected' : ''}`}>
      <input type="radio" name="pooja" value={service.id} checked={selected} onChange={() => onSelect(service)} className="qb-darshan-radio" />
      <div className="qb-darshan-radio-dot">{selected && <div className="qb-darshan-radio-inner" />}</div>
      <div className="qb-darshan-option-content">
        <div className="qb-darshan-option-header">
          <span className="qb-darshan-option-icon">{service.icon}</span>
          <span className="qb-darshan-option-name">{service.name}</span>
          <span className="qb-darshan-option-price">₹{service.price?.toLocaleString() || '0'}</span>
        </div>
        <div className="qb-darshan-option-desc">{service.desc}</div>
        <div className="qb-darshan-option-meta">
          <Timer size={11} /> {service.duration}
        </div>
      </div>
      {selected && <div className="qb-darshan-option-check"><Check size={13} /></div>}
    </label>
  );
}

/* ─────────── STICKY SUMMARY SIDEBAR ─────────── */
function StickySummary({
  selectedTemple, darshanType, poojaService, form,
  selectedTimeSlot, subtotal, addons, gst, grandTotal,
  onContinue, errors,
}) {
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="qb-sticky-summary">
      <div className="qb-ss-card">
        <div className="qb-ss-card-header">
          <Sparkles size={15} className="qb-ss-card-header-icon" />
          <span>Booking Summary</span>
        </div>

        {selectedTemple && (
          <div className="qb-ss-temple-strip">
            <TempleImg src={selectedTemple.coverImage} alt={selectedTemple.name} className="qb-ss-temple-img" height="36px" />
            <div className="qb-ss-temple-name">{selectedTemple.name}</div>
          </div>
        )}

        <div className="qb-ss-rows">
          {[
            { label: 'Darshan',   val: darshanType?.name || '—' },
            { label: 'Service',   val: poojaService?.name || 'None' },
            { label: 'Date',      val: formatDate(form.date) },
            { label: 'Time',      val: selectedTimeSlot?.label || '—' },
            { label: 'Adults',    val: form.adults },
            { label: 'Children',  val: form.children },
            { label: 'Seniors',   val: form.seniors },
          ].map(({ label, val }) => (
            <div className="qb-ss-row" key={label}>
              <span className="qb-ss-row-label">{label}</span>
              <span className="qb-ss-row-val">{val}</span>
            </div>
          ))}
        </div>

        <div className="qb-ss-divider" />

        <div className="qb-ss-price-rows">
          <div className="qb-ss-price-row">
            <span>Base Price</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          {addons > 0 && (
            <div className="qb-ss-price-row">
              <span>Add-ons</span>
              <span>₹{addons.toLocaleString()}</span>
            </div>
          )}
          <div className="qb-ss-price-row">
            <span>GST (5%)</span>
            <span>₹{gst.toLocaleString()}</span>
          </div>
        </div>

        <div className="qb-ss-total">
          <span>Total</span>
          <span className="qb-ss-total-val">₹{grandTotal.toLocaleString()}</span>
        </div>

        <button className="qb-ss-cta" onClick={onContinue}>
          Continue to Payment <ChevronRight size={16} />
        </button>

        <div className="qb-ss-secure">
          <Shield size={12} /> 100% Secure · Instant Confirmation
        </div>
      </div>

      {/* Help */}
      <div className="qb-help-card">
        <div className="qb-help-icon"><Headphones size={18} /></div>
        <p className="qb-help-title">Need Assistance?</p>
        <a href="tel:+918800123456" className="qb-help-link"><Phone size={13} /> +91 88001 23456</a>
        <a href="mailto:darshan@journey.in" className="qb-help-link"><Mail size={13} /> darshan@journey.in</a>
      </div>
    </div>
  );
}

/* ─────────── MOBILE BOTTOM SUMMARY BAR ─────────── */
function MobileBottomBar({ grandTotal, onContinue }) {
  return (
    <div className="qb-mobile-bottom-bar">
      <div className="qb-mbb-price">
        <span className="qb-mbb-label">Total</span>
        <span className="qb-mbb-total">₹{grandTotal.toLocaleString()}</span>
      </div>
      <button className="qb-mbb-cta" onClick={onContinue}>
        Continue to Payment <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ─────────── MAIN COMPONENT ─────────── */
export default function QuickBookingPage({
  onGoToHome,
  onGoToLanding,
  onExploreTemples,
  onGoToProducts,
  onGoToLogin,
  onGoToAbout,
  onOpenBooking,
}) {
  /* ── Step state ── */
  const [step,           setStep]           = useState(0);
  const [errors,         setErrors]         = useState({});
  const [bookingId,      setBookingId]      = useState('');
  const [transactionId,  setTransactionId]  = useState('');
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [paymentExpired, setPaymentExpired] = useState(false);
  const [copied,         setCopied]         = useState(false);
  const formTopRef = useRef(null);
  const receiptRef = useRef(null);

  /* ── Accordion state ── */
  const [activeAccordion, setActiveAccordion] = useState('darshan');
  const [completedAccordions, setCompletedAccordions] = useState(new Set());

  /* ── Temple modal ── */
  const [showTempleModal, setShowTempleModal] = useState(false);
  const [selectedTemple,  setSelectedTemple]  = useState(null);

  /* ── Selected booking options ── */
  const [darshanType,  setDarshanType]  = useState(null);
  const [poojaService, setPoojaService] = useState(null);

  /* ── Derive States & Districts from data ── */
  const allStates = useMemo(() =>
    [...new Set(REAL_TAMIL_NADU_TEMPLES.map(t => t.state).filter(Boolean))].sort(),
    []
  );

  /* ── Form state ── */
  const [form, setForm] = useState({
    state:            '',
    district:         '',
    place:            '',
    templeId:         '',
    templeName:       '',
    templeLocation:   '',
    date:             '',
    timeSlot:         '',
    adults:           1,
    children:         0,
    seniors:          0,
    requirements:     [],
    specialRequests:  '',
    customerName:     '',
    mobile:           '',
    email:            '',
    address:          '',
    emergencyContact: '',
    paymentMethod:    'upi',
  });

  const today = new Date().toISOString().split('T')[0];

  /* ── Districts cascade from selected state ── */
  const allDistricts = useMemo(() => {
    if (!form.state) return [];
    return [...new Set(
      REAL_TAMIL_NADU_TEMPLES
        .filter(t => t.state === form.state)
        .map(t => t.district)
        .filter(Boolean)
    )].sort();
  }, [form.state]);

  /* ── Time slots: use temple schedule if available ── */
  const timeSlots = useMemo(() => {
    if (selectedTemple?.poojaSchedule?.length) {
      return selectedTemple.poojaSchedule.map((p, i) => ({
        id: `p${i}`,
        label: p.time,
        sublabel: p.name,
        availability: 'available',
      }));
    }
    return DEFAULT_TIME_SLOTS;
  }, [selectedTemple]);

  /* ── Pooja services: load from temple data if available ── */
  const poojaServices = useMemo(() => {
    if (selectedTemple?.poojaSchedule?.length) {
      return selectedTemple.poojaSchedule.map((p, i) => ({
        id: `ps${i}`,
        name: p.name,
        desc: `Traditional ${p.name.toLowerCase()} ritual`,
        price: [501, 1100, 2200, 350, 4500][i % 5],
        duration: p.time,
        icon: ['📿', '🪔', '🔥', '🌺', '⭐'][i % 5],
      }));
    }
    return DEFAULT_POOJA_SERVICES;
  }, [selectedTemple]);

  /* ── Price calculation ── */
  const darshanPrice = darshanType ? darshanType.price : 0;
  const poojaPrice   = poojaService ? (poojaService.price || 0) : 0;
  const totalDevotees = form.adults + form.children + form.seniors;
  const basePrice     = darshanPrice * Math.max(1, totalDevotees);
  const addons        = form.requirements.length * 200 + poojaPrice;
  const gst           = Math.round((basePrice + addons) * 0.05);
  const grandTotal    = basePrice + addons + gst;
  const subtotal      = basePrice;

  /* ── Scroll to top on step change ── */
  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  /* ── Reset accordion when entering step 1 ── */
  useEffect(() => {
    if (step === 1) {
      setActiveAccordion('darshan');
      setCompletedAccordions(new Set());
    }
  }, [step]);

  /* ── Field handler ── */
  const handleField = useCallback(e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(er => ({ ...er, [name]: '' }));
  }, []);

  /* ── Counter handler ── */
  const handleCount = useCallback((field, delta) => {
    const cat = DEVOTEE_CATEGORIES.find(c => c.field === field);
    const minVal = cat ? cat.min : 0;
    setForm(f => ({
      ...f,
      [field]: Math.max(minVal, f[field] + delta),
    }));
  }, []);

  /* ── Requirements checkbox ── */
  const handleReq = useCallback(id => {
    setForm(f => ({
      ...f,
      requirements: f.requirements.includes(id)
        ? f.requirements.filter(r => r !== id)
        : [...f.requirements, id],
    }));
  }, []);

  /* ── State change: cascade reset ── */
  const handleStateChange = useCallback(val => {
    setForm(f => ({ ...f, state: val, district: '', place: '', templeId: '', templeName: '', templeLocation: '', timeSlot: '' }));
    setSelectedTemple(null);
    setErrors(er => ({ ...er, state: '', district: '', templeName: '' }));
  }, []);

  /* ── District change: cascade reset ── */
  const handleDistrictChange = useCallback(val => {
    setForm(f => ({ ...f, district: val, place: '', templeId: '', templeName: '', templeLocation: '', timeSlot: '' }));
    setSelectedTemple(null);
    setErrors(er => ({ ...er, district: '', templeName: '' }));
  }, []);

  /* ── Temple selection ── */
  const handleTempleSelect = useCallback(temple => {
    setSelectedTemple(temple);
    setForm(f => ({
      ...f,
      templeId:       String(temple.id),
      templeName:     temple.name,
      templeLocation: temple.address || `${temple.district}, ${temple.state}`,
      state:          f.state    || temple.state    || '',
      district:       f.district || temple.district || '',
      timeSlot:       '',
    }));
    setErrors(er => ({ ...er, templeName: '' }));
  }, []);

  /* ── Accordion toggle ── */
  const handleAccordionToggle = useCallback(id => {
    setActiveAccordion(prev => prev === id ? null : id);
  }, []);

  /* ── Auto-advance accordion ── */
  const advanceAccordion = useCallback(currentId => {
    setCompletedAccordions(prev => new Set([...prev, currentId]));
    const idx = ACCORDION_ORDER.indexOf(currentId);
    if (idx < ACCORDION_ORDER.length - 1) {
      setActiveAccordion(ACCORDION_ORDER[idx + 1]);
    } else {
      setActiveAccordion(null);
    }
  }, []);

  /* ── Darshan select ── */
  const handleDarshanSelect = useCallback(option => {
    setDarshanType(option);
    setErrors(er => ({ ...er, darshan: '' }));
    setTimeout(() => advanceAccordion('darshan'), 400);
  }, [advanceAccordion]);

  /* ── Pooja select ── */
  const handlePoojaSelect = useCallback(service => {
    setPoojaService(service);
    setTimeout(() => advanceAccordion('pooja'), 400);
  }, [advanceAccordion]);

  /* ── Skip pooja ── */
  const handleSkipPooja = useCallback(() => {
    setPoojaService(null);
    advanceAccordion('pooja');
  }, [advanceAccordion]);

  /* ── Validation ── */
  const validate = step => {
    const errs = {};
    if (step === 0) {
      if (!form.state.trim())    errs.state    = 'Please select a state.';
      if (!form.district.trim()) errs.district = 'Please select a district.';
      if (!form.templeName)      errs.templeName = 'Please select a temple.';
    }
    if (step === 1) {
      if (!darshanType)         errs.darshan   = 'Please select a darshan type.';
      if (!form.date)           errs.date      = 'Please select a visit date.';
      if (!form.timeSlot)       errs.timeSlot  = 'Please select a time slot.';
      if (!form.customerName.trim()) errs.customerName = 'Customer name is required.';
      if (!form.mobile.trim() || form.mobile.replace(/\D/g, '').length < 10)
        errs.mobile = 'Valid 10-digit mobile number required.';
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
        errs.email = 'Valid email address required.';
    }
    return errs;
  };

  /* ── Navigation ── */
  const nextStep = () => {
    const errs = validate(step);
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Open the first accordion with an error
      if (errs.darshan) setActiveAccordion('darshan');
      else if (errs.date || errs.timeSlot) setActiveAccordion('datetime');
      else if (errs.customerName || errs.mobile || errs.email) setActiveAccordion('customer');
      return;
    }
    setErrors({});
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => Math.max(0, s - 1));

  /* ── Payment confirm ── */
  const confirmPayment = () => {
    if (paymentExpired) return;
    setBookingId(generateBookingId());
    setTransactionId(generateTransactionId());
    setShowSuccess(true);
  };

  /* ── Reset ── */
  const resetBooking = () => {
    setShowSuccess(false);
    setStep(0);
    setPaymentExpired(false);
    setSelectedTemple(null);
    setDarshanType(null);
    setPoojaService(null);
    setErrors({});
    setCompletedAccordions(new Set());
    setForm({
      state: '', district: '', place: '',
      templeId: '', templeName: '', templeLocation: '',
      date: '', timeSlot: '',
      adults: 1, children: 0, seniors: 0,
      requirements: [], specialRequests: '',
      customerName: '', mobile: '', email: '', address: '', emergencyContact: '',
      paymentMethod: 'upi',
    });
  };

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const selectedTimeSlot = timeSlots.find(t => t.id === form.timeSlot);
  const qrValue          = `upi://pay?pa=darshan@journey&pn=DarshanJourney&am=${grandTotal}&cu=INR&tn=${bookingId}`;
  const receiptDate      = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  /* ── Block body scroll when modal open ── */
  useEffect(() => {
    document.body.style.overflow = showTempleModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showTempleModal]);

  /* ── Accordion summaries ── */
  const summaries = {
    darshan:      darshanType ? `${darshanType.name} · ${darshanType.price === 0 ? 'Free' : `₹${darshanType.price.toLocaleString()}`}` : '',
    pooja:        poojaService ? `${poojaService.name} · ₹${poojaService.price?.toLocaleString()}` : 'No service selected',
    datetime:     form.date && form.timeSlot ? `${new Date(form.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · ${selectedTimeSlot?.label || ''}` : '',
    devotees:     `${form.adults} Adult${form.adults !== 1 ? 's' : ''} · ${form.children} Child${form.children !== 1 ? 'ren' : ''} · ${form.seniors} Senior${form.seniors !== 1 ? 's' : ''}`,
    customer:     form.customerName ? `${form.customerName} · ${form.mobile}` : '',
    requirements: form.requirements.length > 0 ? `${form.requirements.length} service${form.requirements.length !== 1 ? 's' : ''} selected` : 'None',
  };

  /* ────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────── */
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

      {/* ── TEMPLE SEARCH MODAL ── */}
      <AnimatePresence>
        {showTempleModal && (
          <TempleSearchModal
            onClose={() => setShowTempleModal(false)}
            onSelect={handleTempleSelect}
            preFilterDistrict={form.district || null}
          />
        )}
      </AnimatePresence>

      {/* ── COMPACT HERO ── */}
      <section className="qb-hero">
        <div className="qb-hero-overlay" />
        <div className="qb-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="qb-hero-tag"><CalendarDays size={13} /> Premium Booking Experience</div>
            <h1 className="qb-hero-title">Quick Temple Booking</h1>
            <p className="qb-hero-subtitle">Book your darshan in just a few simple steps.</p>
          </motion.div>
        </div>
      </section>

      {/* ── STEP INDICATOR ── */}
      <div className="qb-steps-bar" ref={formTopRef}>
        <div className="container">
          <div className="qb-steps-track">
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={label}>
                <div className={`qb-step-item ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                  <div className="qb-step-circle">
                    {i < step ? <Check size={15} /> : i + 1}
                  </div>
                  <span className="qb-step-label">{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`qb-step-connector ${i < step ? 'done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN SECTION ── */}
      <section className="qb-main-section">
        <div className="container">
          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════
                STEP 0 — LOCATION & TEMPLE
            ══════════════════════════════════════ */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="qb-step0-layout">
                  <div className="qb-glass-card qb-step0-card">

                    {/* ─ Location Selection ─ */}
                    <div className="qb-card-section">
                      <div className="qb-section-header">
                        <div className="qb-section-icon"><MapPin size={18} /></div>
                        <div>
                          <h2 className="qb-section-title">Location Selection</h2>
                          <p className="qb-section-sub">Select your state and district to find nearby temples</p>
                        </div>
                      </div>

                      <div className="qb-location-cascade">
                        {/* Step 1: State */}
                        <div className="qb-location-step">
                          <div className="qb-location-step-num">1</div>
                          <div className="qb-location-step-body">
                            <label className="qb-field-label">
                              State <span className="qb-required">*</span>
                            </label>
                            <SearchableSelect
                              value={form.state}
                              onChange={handleStateChange}
                              options={allStates}
                              placeholder="Select State"
                              icon={<Globe size={14} />}
                            />
                            {errors.state && <span className="qb-error"><AlertCircle size={12} /> {errors.state}</span>}
                          </div>
                        </div>

                        {/* Step 2: District */}
                        <div className={`qb-location-step ${!form.state ? 'qb-loc-step-disabled' : ''}`}>
                          <div className="qb-location-step-num">2</div>
                          <div className="qb-location-step-body">
                            <label className="qb-field-label">
                              District <span className="qb-required">*</span>
                            </label>
                            <SearchableSelect
                              value={form.district}
                              onChange={handleDistrictChange}
                              options={allDistricts}
                              placeholder={form.state ? 'Select District' : 'Select state first'}
                              disabled={!form.state}
                              icon={<MapPin size={14} />}
                            />
                            {errors.district && <span className="qb-error"><AlertCircle size={12} /> {errors.district}</span>}
                          </div>
                        </div>

                        {/* Step 3: City / Place */}
                        <div className={`qb-location-step ${!form.district ? 'qb-loc-step-disabled' : ''}`}>
                          <div className="qb-location-step-num">3</div>
                          <div className="qb-location-step-body">
                            <label className="qb-field-label">
                              City / Place <span className="qb-optional">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              name="place"
                              className="qb-input"
                              placeholder={form.district ? `e.g. ${form.district}` : 'Select district first'}
                              value={form.place}
                              onChange={handleField}
                              disabled={!form.district}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="qb-divider" />

                    {/* ─ Temple Selection ─ */}
                    <div className="qb-card-section">
                      <div className="qb-section-header">
                        <div className="qb-section-icon"><Star size={18} /></div>
                        <div>
                          <h2 className="qb-section-title">Temple Selection</h2>
                          <p className="qb-section-sub">
                            {form.district
                              ? `Showing temples in ${form.district} district`
                              : `Browse from ${REAL_TAMIL_NADU_TEMPLES.length} sacred temples`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`qb-temple-search-trigger ${errors.templeName ? 'error' : ''} ${selectedTemple ? 'selected' : ''}`}
                        onClick={() => setShowTempleModal(true)}
                      >
                        <Search size={16} className="qb-tst-icon" />
                        <span className="qb-tst-text">
                          {form.templeName
                            || (form.district
                              ? `Browse temples in ${form.district}...`
                              : 'Search or browse all temples...')}
                        </span>
                        {form.templeName && <span className="qb-tst-change">Change</span>}
                        {!form.templeName && <ChevronRight size={16} className="qb-tst-arrow" />}
                      </button>
                      {errors.templeName && <span className="qb-error"><AlertCircle size={12} /> {errors.templeName}</span>}

                      {/* Compact Temple Card replaces the old chip + big sidebar */}
                      {selectedTemple && (
                        <div style={{ marginTop: '1rem' }}>
                          <CompactTempleCard
                            temple={selectedTemple}
                            onChange={() => setShowTempleModal(true)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Privacy Note */}
                    <div className="qb-card-section" style={{ paddingTop: 0 }}>
                      <div className="qb-privacy-note">
                        <Lock size={15} />
                        <p>Your details are encrypted and protected under India's DPDP Act 2023.</p>
                      </div>

                      {/* Continue */}
                      <div className="qb-form-actions qb-form-actions-end" style={{ marginTop: '1rem' }}>
                        <button type="button" className="qb-btn-primary qb-btn-continue" onClick={nextStep}>
                          Continue to Booking Details
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════
                STEP 1 — BOOKING DETAILS (ACCORDION)
            ══════════════════════════════════════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="qb-step1-two-col">

                  {/* ── LEFT: ACCORDION BOOKING FORM ── */}
                  <div className="qb-booking-col">

                    {/* Temple Summary Strip (compact card) */}
                    {selectedTemple && (
                      <div className="qb-glass-card" style={{ marginBottom: '1rem', overflow: 'visible' }}>
                        <div style={{ padding: '1rem 1.25rem' }}>
                          <CompactTempleCard
                            temple={selectedTemple}
                            onChange={() => setStep(0)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Accordion Container */}
                    <div className="qb-glass-card qb-accordion-container">

                      {/* ─── DARSHAN TYPE ─── */}
                      <AccordionSection
                        id="darshan"
                        title="Darshan Type"
                        icon={<Star size={13} />}
                        isOpen={activeAccordion === 'darshan'}
                        onToggle={handleAccordionToggle}
                        summary={summaries.darshan}
                        isCompleted={completedAccordions.has('darshan') && !!darshanType}
                      >
                        <div className="qb-darshan-options-list">
                          {DEFAULT_DARSHAN_TYPES.map(option => (
                            <DarshanOptionCard
                              key={option.id}
                              option={option}
                              selected={darshanType?.id === option.id}
                              onSelect={handleDarshanSelect}
                            />
                          ))}
                        </div>
                        {errors.darshan && (
                          <span className="qb-error" style={{ marginTop: '0.5rem', display: 'flex' }}>
                            <AlertCircle size={12} /> {errors.darshan}
                          </span>
                        )}
                      </AccordionSection>

                      <div className="qb-accordion-divider" />

                      {/* ─── POOJA & SERVICES ─── */}
                      <AccordionSection
                        id="pooja"
                        title="Pooja & Services"
                        icon={<Sparkles size={13} />}
                        isOpen={activeAccordion === 'pooja'}
                        onToggle={handleAccordionToggle}
                        summary={summaries.pooja}
                        isCompleted={completedAccordions.has('pooja')}
                      >
                        <p className="qb-acc-section-hint">
                          Optional — Add a special pooja or ritual service to your darshan.
                        </p>
                        <div className="qb-darshan-options-list">
                          {poojaServices.map(service => (
                            <PoojaServiceCard
                              key={service.id}
                              service={service}
                              selected={poojaService?.id === service.id}
                              onSelect={handlePoojaSelect}
                            />
                          ))}
                        </div>
                        <button className="qb-skip-pooja-btn" onClick={handleSkipPooja}>
                          Skip — No Pooja Required <ChevronRight size={14} />
                        </button>
                      </AccordionSection>

                      <div className="qb-accordion-divider" />

                      {/* ─── DATE & TIME ─── */}
                      <AccordionSection
                        id="datetime"
                        title="Date & Time"
                        icon={<CalendarDays size={13} />}
                        isOpen={activeAccordion === 'datetime'}
                        onToggle={handleAccordionToggle}
                        summary={summaries.datetime}
                        isCompleted={completedAccordions.has('datetime') && form.date && form.timeSlot}
                      >
                        <div className="qb-datetime-inner">
                          <div className="qb-field-group">
                            <label className="qb-field-label">Visit Date <span className="qb-required">*</span></label>
                            <input
                              type="date" name="date"
                              className={`qb-input ${errors.date ? 'error' : ''}`}
                              value={form.date} min={today}
                              onChange={e => {
                                handleField(e);
                                setForm(f => ({ ...f, timeSlot: '' }));
                              }}
                            />
                            {errors.date && <span className="qb-error"><AlertCircle size={12} /> {errors.date}</span>}
                          </div>

                          {form.date && (
                            <div style={{ marginTop: '1rem' }}>
                              <label className="qb-field-label" style={{ display: 'block', marginBottom: '0.6rem' }}>
                                Available Time Slots <span className="qb-required">*</span>
                              </label>
                              <div className="qb-time-slots-grid-new">
                                {timeSlots.map(ts => (
                                  <button
                                    key={ts.id}
                                    type="button"
                                    disabled={ts.availability === 'booked'}
                                    className={`qb-time-slot-btn ${form.timeSlot === ts.id ? 'selected' : ''} ${ts.availability}`}
                                    onClick={() => {
                                      if (ts.availability !== 'booked') {
                                        setForm(f => ({ ...f, timeSlot: ts.id }));
                                        setErrors(er => ({ ...er, timeSlot: '' }));
                                      }
                                    }}
                                  >
                                    <div className="qb-tsb-time">
                                      <Clock size={12} /> {ts.label}
                                    </div>
                                    <div className="qb-tsb-name">{ts.sublabel}</div>
                                    <div className={`qb-tsb-avail ${ts.availability}`}>
                                      {ts.availability === 'available' ? '● Available' :
                                       ts.availability === 'limited'   ? '◐ Limited'  :
                                       '✕ Fully Booked'}
                                    </div>
                                  </button>
                                ))}
                              </div>
                              {errors.timeSlot && <span className="qb-error" style={{ marginTop: '0.5rem', display: 'flex' }}><AlertCircle size={12} /> {errors.timeSlot}</span>}
                            </div>
                          )}

                          {form.date && form.timeSlot && (
                            <button
                              className="qb-acc-confirm-btn"
                              onClick={() => advanceAccordion('datetime')}
                            >
                              Confirm Date & Time <Check size={14} />
                            </button>
                          )}
                        </div>
                      </AccordionSection>

                      <div className="qb-accordion-divider" />

                      {/* ─── DEVOTEE DETAILS ─── */}
                      <AccordionSection
                        id="devotees"
                        title="Devotee Details"
                        icon={<Users size={13} />}
                        isOpen={activeAccordion === 'devotees'}
                        onToggle={handleAccordionToggle}
                        summary={summaries.devotees}
                        isCompleted={completedAccordions.has('devotees')}
                      >
                        <div className="qb-traveller-list">
                          {DEVOTEE_CATEGORIES.map(cat => (
                            <div key={cat.field} className="qb-traveller-row">
                              <div className="qb-traveller-info">
                                <div className="qb-traveller-label">
                                  <span className="qb-traveller-icon">{cat.icon}</span>
                                  {cat.label}
                                </div>
                                <div className="qb-traveller-age">Age: {cat.ageRange}</div>
                              </div>
                              <div className="qb-counter">
                                <button
                                  type="button"
                                  className="qb-counter-btn"
                                  onClick={() => handleCount(cat.field, -1)}
                                  disabled={form[cat.field] <= cat.min}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="qb-counter-val">{form[cat.field]}</span>
                                <button
                                  type="button"
                                  className="qb-counter-btn"
                                  onClick={() => handleCount(cat.field, 1)}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="qb-traveller-total">
                          <span>Total Devotees</span>
                          <span className="qb-traveller-total-val">{totalDevotees}</span>
                        </div>
                        <button
                          className="qb-acc-confirm-btn"
                          onClick={() => advanceAccordion('devotees')}
                        >
                          Confirm Devotees <Check size={14} />
                        </button>
                      </AccordionSection>

                      <div className="qb-accordion-divider" />

                      {/* ─── CUSTOMER DETAILS ─── */}
                      <AccordionSection
                        id="customer"
                        title="Customer Details"
                        icon={<Users size={13} />}
                        isOpen={activeAccordion === 'customer'}
                        onToggle={handleAccordionToggle}
                        summary={summaries.customer}
                        isCompleted={completedAccordions.has('customer') && form.customerName && form.mobile && form.email}
                      >
                        <div className="qb-form-grid">
                          <div className="qb-field-group qb-field-full">
                            <label className="qb-field-label">Full Name <span className="qb-required">*</span></label>
                            <input
                              type="text" name="customerName"
                              className={`qb-input ${errors.customerName ? 'error' : ''}`}
                              placeholder="e.g. Arjun Sharma"
                              value={form.customerName} onChange={handleField}
                            />
                            {errors.customerName && <span className="qb-error"><AlertCircle size={12} /> {errors.customerName}</span>}
                          </div>
                          <div className="qb-field-group">
                            <label className="qb-field-label">Mobile <span className="qb-required">*</span></label>
                            <input
                              type="tel" name="mobile"
                              className={`qb-input ${errors.mobile ? 'error' : ''}`}
                              placeholder="+91 98765 43210"
                              value={form.mobile} onChange={handleField}
                            />
                            {errors.mobile && <span className="qb-error"><AlertCircle size={12} /> {errors.mobile}</span>}
                          </div>
                          <div className="qb-field-group">
                            <label className="qb-field-label">Email <span className="qb-required">*</span></label>
                            <input
                              type="email" name="email"
                              className={`qb-input ${errors.email ? 'error' : ''}`}
                              placeholder="you@email.com"
                              value={form.email} onChange={handleField}
                            />
                            {errors.email && <span className="qb-error"><AlertCircle size={12} /> {errors.email}</span>}
                          </div>
                          <div className="qb-field-group">
                            <label className="qb-field-label">Emergency Contact <span className="qb-optional">(Optional)</span></label>
                            <input
                              type="tel" name="emergencyContact"
                              className="qb-input"
                              placeholder="Emergency contact number"
                              value={form.emergencyContact} onChange={handleField}
                            />
                          </div>
                          <div className="qb-field-group qb-field-full">
                            <label className="qb-field-label">Address <span className="qb-optional">(Optional)</span></label>
                            <input
                              type="text" name="address"
                              className="qb-input"
                              placeholder="Street, City, Pincode"
                              value={form.address} onChange={handleField}
                            />
                          </div>
                        </div>
                        <button
                          className="qb-acc-confirm-btn"
                          onClick={() => advanceAccordion('customer')}
                          style={{ marginTop: '1rem' }}
                        >
                          Confirm Details <Check size={14} />
                        </button>
                      </AccordionSection>

                      <div className="qb-accordion-divider" />

                      {/* ─── ADDITIONAL REQUIREMENTS ─── */}
                      <AccordionSection
                        id="requirements"
                        title="Additional Requirements"
                        icon={<Heart size={13} />}
                        isOpen={activeAccordion === 'requirements'}
                        onToggle={handleAccordionToggle}
                        summary={summaries.requirements}
                        isCompleted={completedAccordions.has('requirements')}
                      >
                        <p className="qb-acc-section-hint">Optional assistance services (₹200 each)</p>
                        <div className="qb-req-grid-new">
                          {ADDITIONAL_REQ.map(req => (
                            <label
                              key={req.id}
                              className={`qb-req-card ${form.requirements.includes(req.id) ? 'checked' : ''}`}
                            >
                              <input
                                type="checkbox"
                                className="qb-req-checkbox"
                                checked={form.requirements.includes(req.id)}
                                onChange={() => handleReq(req.id)}
                              />
                              <span className="qb-req-card-icon">{req.icon}</span>
                              <span className="qb-req-card-label">{req.label}</span>
                              {form.requirements.includes(req.id) && (
                                <span className="qb-req-card-check"><Check size={11} /></span>
                              )}
                            </label>
                          ))}
                        </div>
                        <textarea
                          name="specialRequests"
                          className="qb-textarea"
                          placeholder="Any specific requirements, dietary preferences, or special needs..."
                          value={form.specialRequests}
                          onChange={handleField}
                          rows={2}
                          style={{ marginTop: '0.75rem' }}
                        />
                      </AccordionSection>

                    </div>

                    {/* Navigation Row */}
                    <div className="qb-step1-nav">
                      <button type="button" className="qb-btn-secondary" onClick={prevStep}>
                        <ChevronLeft size={16} /> Back
                      </button>
                      <button type="button" className="qb-btn-primary" onClick={nextStep}>
                        Continue to Payment <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  {/* ── RIGHT: STICKY SUMMARY SIDEBAR ── */}
                  <div className="qb-right-col">
                    <StickySummary
                      selectedTemple={selectedTemple}
                      darshanType={darshanType}
                      poojaService={poojaService}
                      form={form}
                      selectedTimeSlot={selectedTimeSlot}
                      subtotal={subtotal}
                      addons={addons}
                      gst={gst}
                      grandTotal={grandTotal}
                      onContinue={nextStep}
                      errors={errors}
                    />
                  </div>
                </div>

                {/* Mobile Bottom Bar */}
                <MobileBottomBar grandTotal={grandTotal} onContinue={nextStep} />
              </motion.div>
            )}

            {/* ══════════════════════════════════════
                STEP 2 — PAYMENT
            ══════════════════════════════════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="qb-payment-layout">
                  {/* Payment Card */}
                  <div className="qb-glass-card qb-payment-card">
                    <div className="qb-payment-header">
                      <div className="qb-section-icon"><QrCode size={18} /></div>
                      <div>
                        <h2 className="qb-section-title">Complete Payment</h2>
                        <p className="qb-section-sub">Scan QR or use any supported payment method</p>
                      </div>
                    </div>

                    {/* Booking Summary Banner */}
                    <div className="qb-booking-id-banner">
                      <div className="qb-bid-left">
                        <span className="qb-bid-label">Booking Summary</span>
                        <span className="qb-bid-value">{form.templeName || 'Temple Darshan'}</span>
                      </div>
                      <div className="qb-bid-meta">
                        <span className="qb-bid-temple">{form.customerName}</span>
                        <span className="qb-bid-amount">₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="qb-payment-body">
                      {/* QR Section */}
                      <div className="qb-qr-section">
                        <div className="qb-qr-frame">
                          <div className="qb-qr-inner">
                            <QRCode value={qrValue} size={180} />
                          </div>
                          <div className="qb-qr-label">
                            <Wifi size={12} /> Scan to pay via any UPI app
                          </div>
                        </div>
                        <div className="qb-qr-amount-badge">
                          <span className="qb-qa-label">Amount Payable</span>
                          <span className="qb-qa-val">₹{grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="qb-qr-upi-id">
                          <span>UPI ID: darshan@journey</span>
                          <button className="qb-copy-btn" onClick={() => navigator.clipboard.writeText('darshan@journey')}>
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>

                      {/* OR Divider */}
                      <div className="qb-or-divider">
                        <div className="qb-or-line" />
                        <span>OR PAY WITH</span>
                        <div className="qb-or-line" />
                      </div>

                      {/* Payment Methods */}
                      <div className="qb-payment-methods">
                        {PAYMENT_METHODS.map(pm => (
                          <button
                            key={pm.id}
                            type="button"
                            className={`qb-pm-btn ${form.paymentMethod === pm.id ? 'selected' : ''}`}
                            onClick={() => setForm(f => ({ ...f, paymentMethod: pm.id }))}
                          >
                            <span>{pm.icon}</span>
                            <span>{pm.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    <CountdownTimer onExpire={() => setPaymentExpired(true)} />

                    {/* Actions */}
                    <div className="qb-form-actions">
                      <button type="button" className="qb-btn-secondary" onClick={prevStep}>
                        <ChevronLeft size={16} /> Back
                      </button>
                      <button
                        type="button"
                        className="qb-btn-success"
                        onClick={confirmPayment}
                        disabled={paymentExpired}
                      >
                        <Check size={18} /> I've Completed Payment
                      </button>
                    </div>

                    {/* Security Footer */}
                    <div className="qb-payment-secure-row">
                      <Shield size={14} />
                      <span>256-bit SSL Encrypted · RBI Compliant · Your data is safe</span>
                    </div>
                  </div>

                  {/* Summary Sidebar */}
                  <div className="qb-summary-sidebar">
                    <div className="qb-summary-card">
                      <h3 className="qb-summary-title"><Sparkles size={16} /> Order Summary</h3>
                      <div className="qb-summary-rows">
                        {[
                          { label: 'Customer',  val: form.customerName || '—' },
                          { label: 'Temple',    val: form.templeName   || '—' },
                          { label: 'Service',   val: darshanType?.name || '—' },
                          { label: 'Date',      val: form.date ? new Date(form.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                          { label: 'Time',      val: selectedTimeSlot ? selectedTimeSlot.label : '—' },
                          { label: 'Devotees',  val: `${totalDevotees} person${totalDevotees !== 1 ? 's' : ''}` },
                        ].map(({ label, val }) => (
                          <div className="qb-summary-row" key={label}>
                            <span className="qb-summary-label">{label}</span>
                            <span className="qb-summary-val">{val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="qb-summary-divider" />
                      <div className="qb-sum-row"><span>Service</span><span>₹{subtotal.toLocaleString()}</span></div>
                      {addons > 0 && <div className="qb-sum-row"><span>Add-ons</span><span>₹{addons.toLocaleString()}</span></div>}
                      <div className="qb-sum-row"><span>GST (5%)</span><span>₹{gst.toLocaleString()}</span></div>
                      <div className="qb-summary-total">
                        <span>Total</span>
                        <span>₹{grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {/* ══════ PAYMENT SUCCESS OVERLAY ══════ */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="qb-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="qb-success-modal"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <SuccessCheckmark />
              <h2 className="qb-success-title">Booking Confirmed Successfully!</h2>
              <p className="qb-success-sub">
                Jai Sri Ram! Your divine journey to <strong>{form.templeName || 'the temple'}</strong> has been booked.
              </p>

              <div className="qb-success-details">
                <div className="qb-sd-row">
                  <span className="qb-sd-label">Booking ID</span>
                  <div className="qb-sd-id-row">
                    <span className="qb-sd-value qb-bid-highlight">{bookingId}</span>
                    <button className="qb-copy-btn" onClick={handleCopyBookingId} title="Copy">
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                {[
                  { label: 'Transaction ID',  val: transactionId },
                  { label: 'Temple',          val: form.templeName },
                  { label: 'Service',         val: darshanType?.name },
                  { label: 'Date',            val: form.date ? new Date(form.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Time Slot',       val: selectedTimeSlot?.label },
                  { label: 'Customer Name',   val: form.customerName },
                  { label: 'Mobile',          val: form.mobile },
                  { label: 'Amount Paid',     val: `₹${grandTotal.toLocaleString()}` },
                ].map(({ label, val }) => (
                  <div className="qb-sd-row" key={label}>
                    <span className="qb-sd-label">{label}</span>
                    <span className="qb-sd-value">{val || '—'}</span>
                  </div>
                ))}
                <div className="qb-sd-row">
                  <span className="qb-sd-label">Payment Status</span>
                  <span className="qb-status-badge">✓ SUCCESS</span>
                </div>
              </div>

              {/* QR Pass */}
              <div className="qb-success-qr">
                <QRCode value={bookingId} size={120} />
                <p className="qb-success-qr-label">Your Digital Pass · Scan at temple entry</p>
              </div>

              <div className="qb-success-actions">
                <button className="qb-success-btn qb-sbtn-primary" onClick={() => window.print()}>
                  <Printer size={16} /> Download Receipt
                </button>
                <button className="qb-success-btn qb-sbtn-outline" onClick={() => window.print()}>
                  <Download size={16} /> Download QR Pass
                </button>
                <button className="qb-success-btn qb-sbtn-outline" onClick={resetBooking}>
                  <Eye size={16} /> New Booking
                </button>
                <button className="qb-success-btn qb-sbtn-ghost" onClick={onGoToHome}>
                  <Home size={16} /> Go to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════ PRINTABLE RECEIPT ══════ */}
      <div className="qb-receipt" ref={receiptRef}>
        <div className="qb-receipt-inner">
          <div className="qb-receipt-header">
            <div className="qb-receipt-logo">
              <div className="qb-receipt-logo-icon">🕉️</div>
              <div>
                <div className="qb-receipt-brand">DARSHAN JOURNEY</div>
                <div className="qb-receipt-tagline">Sacred Pilgrimage Services</div>
              </div>
            </div>
            <div className="qb-receipt-title-block">
              <h1 className="qb-receipt-title">BOOKING RECEIPT</h1>
              <div className="qb-receipt-status-badge">✓ CONFIRMED</div>
            </div>
          </div>

          <div className="qb-receipt-divider" />

          <div className="qb-receipt-ids">
            <div className="qb-rid"><span className="qb-rid-label">Booking ID</span><span className="qb-rid-val">{bookingId || 'N/A'}</span></div>
            <div className="qb-rid"><span className="qb-rid-label">Transaction ID</span><span className="qb-rid-val">{transactionId || 'N/A'}</span></div>
            <div className="qb-rid"><span className="qb-rid-label">Receipt Date</span><span className="qb-rid-val">{receiptDate}</span></div>
          </div>

          <div className="qb-receipt-divider" />

          <div className="qb-receipt-cols">
            <div className="qb-receipt-col">
              <h3 className="qb-receipt-col-title">Temple Details</h3>
              <div className="qb-receipt-row"><span>Temple Name</span><span>{form.templeName || '—'}</span></div>
              <div className="qb-receipt-row"><span>Location</span><span>{form.templeLocation || '—'}</span></div>
              <div className="qb-receipt-row"><span>Service Type</span><span>{darshanType?.name || '—'}</span></div>
              <div className="qb-receipt-row"><span>Visit Date</span><span>{form.date ? new Date(form.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</span></div>
              <div className="qb-receipt-row"><span>Time Slot</span><span>{selectedTimeSlot?.label || '—'}</span></div>
            </div>
            <div className="qb-receipt-col">
              <h3 className="qb-receipt-col-title">Customer Details</h3>
              <div className="qb-receipt-row"><span>Full Name</span><span>{form.customerName || '—'}</span></div>
              <div className="qb-receipt-row"><span>Mobile</span><span>{form.mobile || '—'}</span></div>
              <div className="qb-receipt-row"><span>Email</span><span>{form.email || '—'}</span></div>
              <div className="qb-receipt-row"><span>District</span><span>{form.district || '—'}</span></div>
              <div className="qb-receipt-row"><span>Devotees</span><span>{form.adults}A + {form.children}C + {form.seniors}S</span></div>
            </div>
          </div>

          <div className="qb-receipt-divider" />

          <div className="qb-receipt-payment">
            <h3 className="qb-receipt-col-title">Payment Breakdown</h3>
            <div className="qb-receipt-row"><span>Service Fee</span><span>₹{subtotal.toLocaleString()}</span></div>
            {addons > 0 && <div className="qb-receipt-row"><span>Additional Services</span><span>₹{addons.toLocaleString()}</span></div>}
            <div className="qb-receipt-row"><span>GST @ 5%</span><span>₹{gst.toLocaleString()}</span></div>
            <div className="qb-receipt-row qb-receipt-total"><span>Total Amount Paid</span><span>₹{grandTotal.toLocaleString()}</span></div>
            <div className="qb-receipt-row"><span>Payment Method</span><span>{PAYMENT_METHODS.find(p => p.id === form.paymentMethod)?.label || 'UPI'}</span></div>
            <div className="qb-receipt-row"><span>Payment Status</span><span style={{ color: '#16A34A', fontWeight: 700 }}>SUCCESS</span></div>
          </div>

          <div className="qb-receipt-divider" />

          <div className="qb-receipt-bottom">
            <div className="qb-receipt-qr-block">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QRCode value={bookingId || 'DJ-RECEIPT'} size={100} />
              </div>
              <p className="qb-receipt-qr-label">Scan to verify booking</p>
            </div>
            <div className="qb-receipt-support">
              <h4>Customer Support</h4>
              <p>📞 +91 88001 23456</p>
              <p>✉️ darshan@journey.in</p>
              <p>🌐 www.darshanjourney.in</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6E5351' }}>
                Cancellation: Free up to 48 hrs before visit.<br />
                After 48 hrs: 20% cancellation fee applies.
              </p>
            </div>
          </div>

          <div className="qb-receipt-footer">
            <div className="qb-receipt-om">🕉️</div>
            <p>Thank you for choosing Darshan Journey.</p>
            <p>Have a peaceful and blessed pilgrimage.</p>
          </div>
        </div>
      </div>

      <Footer
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToLogin={onGoToLogin}
        onGoToAbout={onGoToAbout}
      />
    </div>
  );
}
