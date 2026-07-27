import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowRight, 
  ChevronLeft, 
  SlidersHorizontal,
  X, 
  Heart, 
  Clock, 
  CheckCircle2, 
  Compass, 
  RotateCcw,
  ExternalLink,
  Navigation,
  Shirt,
  History,
  PartyPopper,
  Building2,
  CalendarDays,
  Coffee,
  Globe,
  Phone,
  Ticket,
  Sparkles,
  Layers,
  Flame,
  Info
} from 'lucide-react';
import logoImg from '../assets/exact_darshan_logo.png';
import { REAL_TAMIL_NADU_TEMPLES, fetchLiveTempleFromWeb } from '../services/templeDataService';
import { isFuzzyMatch, getInstantSuggestions } from '../utils/searchUtils';
import Navbar from './Navbar';
import Footer from './Footer';

// Categories list
const CATEGORIES = [
  { id: 'all', label: 'All Temples', icon: '✨' },
  { id: 'Vinayagar', label: 'Vinayagar', icon: '🐘' },
  { id: 'Murugan', label: 'Murugan', icon: '⚔️' },
  { id: 'Shiva', label: 'Shiva', icon: '🕉' },
  { id: 'Perumal', label: 'Perumal', icon: '🪷' },
  { id: 'Amman', label: 'Amman', icon: '🌺' },
  { id: 'Navagraha', label: 'Navagraha', icon: '☀️' },
  { id: 'Anjaneyar', label: 'Anjaneyar', icon: '🐒' },
  { id: 'Others', label: 'Others', icon: '✨' }
];

// TempleImage Component: Renders image with automatic fallback to "Temple image unavailable" if missing or fails to load
function TempleImage({ src, alt, className, style, fallbackHeight }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div 
        className={`temple-img-fallback ${className || ''}`}
        style={{ ...style, minHeight: fallbackHeight || '160px' }}
      >
        <span className="fallback-text">Temple image unavailable</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt || 'Temple image'} 
      className={className}
      style={style}
      onError={() => setHasError(true)} 
    />
  );
}

export default function ExploreTemplesPage({ onGoToHome, onGoToLanding, onGoToProducts }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [mapMode, setMapMode] = useState('m'); // 'm' for normal roadmap, 'k' for satellite
  
  // Instant Search Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Modals state
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTempleName, setBookingTempleName] = useState('');

  // Handle sticky navbar background scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update instant search suggestions on input change (Guaranteed Exception-Proof)
  useEffect(() => {
    const q = searchQuery ? searchQuery.trim() : '';
    if (q.length > 0) {
      try {
        const instantList = getInstantSuggestions(REAL_TAMIL_NADU_TEMPLES, q, 5);
        setSuggestions(instantList || []);
        setShowSuggestions((instantList && instantList.length > 0));
      } catch (err) {
        console.error("Error updating suggestions:", err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Sync category horizontal scroll clicks with filter state
  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      setCategoryFilter('all');
    } else {
      setCategoryFilter(catId);
    }
  };

  const handleCategoryFilterChange = (val) => {
    setCategoryFilter(val);
    setActiveCategory(val);
  };

  // Extract unique districts from real temple dataset
  const districtsList = Array.from(new Set((REAL_TAMIL_NADU_TEMPLES || []).map(t => t.district).filter(Boolean))).sort();

  // Fast Typo-Tolerant Filtering across Tamil Nadu temples (Guaranteed Exception-Proof)
  const filteredTemples = (REAL_TAMIL_NADU_TEMPLES || []).filter((temple) => {
    if (!temple) return false;
    const q = searchQuery ? searchQuery.trim() : '';

    // Category matching
    const catToMatch = categoryFilter !== 'all' ? categoryFilter : activeCategory;
    const matchesCategory = catToMatch === 'all' || 
      (temple.category && temple.category.toLowerCase() === catToMatch.toLowerCase());

    // District matching
    const matchesDistrict = districtFilter === 'all' || 
      (temple.district && temple.district.toLowerCase() === districtFilter.toLowerCase());

    // Search query matching (with typo tolerance & fuzzy matching)
    let matchesSearch = true;
    if (q.length > 0) {
      matchesSearch = 
        isFuzzyMatch(temple.name || '', q) ||
        isFuzzyMatch(temple.address || '', q) ||
        isFuzzyMatch(temple.district || '', q) ||
        isFuzzyMatch(temple.category || '', q) ||
        isFuzzyMatch(temple.shortDesc || '', q);
    }

    return matchesCategory && matchesDistrict && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.rating || 0) - (a.rating || 0);
    } else if (sortBy === 'alphabetical') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setCategoryFilter('all');
    setDistrictFilter('all');
    setSortBy('popular');
    setShowSuggestions(false);
  };

  // Select a temple from suggestion list or card
  const handleSelectTemple = (temple) => {
    setSelectedTemple(temple);
    setShowSuggestions(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live dynamic web search for temples not in dictionary
  const handleLiveWebSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingLive(true);
    const liveResult = await fetchLiveTempleFromWeb(searchQuery);
    setIsSearchingLive(false);
    if (liveResult) {
      handleSelectTemple(liveResult);
    } else {
      setShowSuggestions(false);
    }
  };

  // Utility to check if a text field is available or missing
  const renderFieldValue = (value, fallbackText = "Information currently unavailable.") => {
    if (!value || value.trim().length === 0 || value.toLowerCase().includes("unavailable")) {
      return <span className="detail-field-value unavailable">{fallbackText}</span>;
    }
    return <span className="detail-field-value">{value}</span>;
  };

  // Split dress code into bullet points if available
  const getDressCodeItems = (dressCodeText) => {
    if (!dressCodeText || dressCodeText.toLowerCase().includes('information currently unavailable')) {
      return null;
    }
    return dressCodeText
      .split(/(?:•|\. )/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  return (
    <div className="home-website-wrapper">
      {/* ---------------- NAVBAR ---------------- */}
      <Navbar 
        activePage="explore"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={() => setSelectedTemple(null)}
        onGoToProducts={onGoToProducts}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenDonate={() => setIsDonateOpen(true)}
      />

      {/* ========================================================================= */}
      {/* CASE 1: DEDICATED TEMPLE DETAILS PAGE VIEW */}
      {/* ========================================================================= */}
      {selectedTemple ? (
        <section className="temple-details-view section">
          <div className="container">
            {/* Top Navigation & Back Button */}
            <div className="temple-details-back-bar">
              <button 
                className="btn-back-link"
                onClick={() => {
                  setSelectedTemple(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <ChevronLeft size={20} /> Back to Explore Temples
              </button>
              <div style={{ fontSize: '0.9rem', color: '#9E7D3F', fontWeight: 600 }}>
                Explore / {selectedTemple.district} / {selectedTemple.name}
              </div>
            </div>

            {/* 1. HERO IMAGE BANNER & HEADER */}
            <div className="temple-hero-banner">
              <TempleImage 
                src={selectedTemple.coverImage} 
                alt={selectedTemple.name} 
                className="temple-hero-full-img" 
                fallbackHeight="350px"
              />
              <div className="temple-hero-gradient-overlay">
                <div className="temple-hero-header-content">
                  <div className="temple-meta-badges-row">
                    <span className="temple-badge-deity">
                      {selectedTemple.deityLabel}
                    </span>
                    <span className="temple-badge-district">
                      <MapPin size={14} /> {selectedTemple.district}, {selectedTemple.state}
                    </span>
                    <span className="temple-badge-rating">
                      <Star size={14} fill="#C8A96A" color="#C8A96A" />
                      <strong>{selectedTemple.rating}</strong> ({selectedTemple.reviewsCount} reviews)
                    </span>
                  </div>
                  <h1 className="temple-hero-title">{selectedTemple.name}</h1>
                  <p className="temple-hero-sublocation">
                    <MapPin size={16} style={{ color: '#C8A96A' }} /> {selectedTemple.address}
                  </p>
                </div>
              </div>
            </div>

            {/* 2 & 3. TWO-COLUMN GRID: TIMINGS & DAILY POOJA SCHEDULE */}
            <div className="temple-details-main-grid">
              {/* 2. OFFICIAL TEMPLE TIMINGS CARD */}
              <div className="temple-info-card">
                <div className="temple-card-header">
                  <div className="temple-card-icon-box">
                    <Clock size={24} style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="temple-card-heading">Official Temple Timings</h3>
                </div>

                <div className="timings-list-grid">
                  <div className="timing-slot-item">
                    <div className="timing-slot-left">
                      <Clock size={18} style={{ color: '#C8A96A' }} />
                      <span>Opening Time</span>
                    </div>
                    <div className="timing-slot-time">
                      {renderFieldValue(selectedTemple.openingTime)}
                    </div>
                  </div>

                  <div className="timing-slot-item">
                    <div className="timing-slot-left">
                      <Coffee size={18} style={{ color: '#C8A96A' }} />
                      <span>Afternoon Break</span>
                    </div>
                    <div className="timing-slot-time">
                      {selectedTemple.afternoonBreak ? selectedTemple.afternoonBreak : "No afternoon break."}
                    </div>
                  </div>

                  <div className="timing-slot-item">
                    <div className="timing-slot-left">
                      <Clock size={18} style={{ color: '#C8A96A' }} />
                      <span>Closing Time</span>
                    </div>
                    <div className="timing-slot-time">
                      {renderFieldValue(selectedTemple.closingTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. DAILY POOJA SCHEDULE (Only shown if available) */}
              {selectedTemple.poojaSchedule && selectedTemple.poojaSchedule.length > 0 ? (
                <div className="temple-info-card">
                  <div className="temple-card-header">
                    <div className="temple-card-icon-box">
                      <Flame size={24} style={{ color: '#C8A96A' }} />
                    </div>
                    <h3 className="temple-card-heading">Daily Pooja Schedule</h3>
                  </div>

                  <div className="pooja-schedule-grid">
                    {selectedTemple.poojaSchedule.map((p, idx) => (
                      <div key={idx} className="pooja-item-row">
                        <div className="pooja-item-left">
                          <span style={{ color: '#C8A96A', fontWeight: 800 }}>•</span>
                          <span>{p.name}</span>
                        </div>
                        <div className="pooja-item-time">{p.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* DRESS CODE CARD if pooja schedule is not published */
                <div className="temple-info-card">
                  <div className="temple-card-header">
                    <div className="temple-card-icon-box">
                      <Shirt size={24} style={{ color: '#C8A96A' }} />
                    </div>
                    <h3 className="temple-card-heading">Dress Code</h3>
                  </div>

                  <div className="dress-code-content-box">
                    {getDressCodeItems(selectedTemple.dressCode) ? (
                      <ul className="dress-code-ul">
                        {getDressCodeItems(selectedTemple.dressCode).map((item, idx) => (
                          <li key={idx} className="dress-code-li">
                            <span className="dress-code-bullet">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#9E7D3F', fontSize: '0.95rem', fontStyle: 'italic' }}>
                        Information currently unavailable.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DRESS CODE CARD (rendered if pooja schedule was present above) */}
            {selectedTemple.poojaSchedule && selectedTemple.poojaSchedule.length > 0 && (
              <div className="temple-info-card" style={{ marginBottom: '2.5rem' }}>
                <div className="temple-card-header">
                  <div className="temple-card-icon-box">
                    <Shirt size={24} style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="temple-card-heading">Dress Code</h3>
                </div>

                <div className="dress-code-content-box">
                  {getDressCodeItems(selectedTemple.dressCode) ? (
                    <ul className="dress-code-ul">
                      {getDressCodeItems(selectedTemple.dressCode).map((item, idx) => (
                        <li key={idx} className="dress-code-li">
                          <span className="dress-code-bullet">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#9E7D3F', fontSize: '0.95rem', fontStyle: 'italic' }}>
                      Information currently unavailable.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 4. ACCURATE GOOGLE MAP WITH EXACT GPS MARKER & MAP MODES */}
            <div className="google-map-section-card">
              <div className="temple-card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div className="temple-card-icon-box">
                    <MapPin size={24} style={{ color: '#C8A96A' }} />
                  </div>
                  <div>
                    <h3 className="temple-card-heading">Exact GPS Google Map Location</h3>
                    <p style={{ fontSize: '0.88rem', color: '#6E5351', marginTop: '2px' }}>
                      {selectedTemple.address} (GPS: {selectedTemple.lat}, {selectedTemple.lng})
                    </p>
                  </div>
                </div>

                {/* Satellite vs Normal Map Mode Toggles */}
                <div className="map-mode-toggle-group">
                  <button 
                    className={`map-mode-btn ${mapMode === 'm' ? 'active' : ''}`}
                    onClick={() => setMapMode('m')}
                  >
                    <Layers size={14} style={{ display: 'inline', marginRight: '4px' }} /> Normal Map
                  </button>
                  <button 
                    className={`map-mode-btn ${mapMode === 'k' ? 'active' : ''}`}
                    onClick={() => setMapMode('k')}
                  >
                    <Globe size={14} style={{ display: 'inline', marginRight: '4px' }} /> Satellite View
                  </button>
                </div>
              </div>

              {/* Embedded Google Map with Exact Pin Coordinates */}
              <div className="map-iframe-container">
                <iframe 
                  title={`Google Map - ${selectedTemple.name}`}
                  src={`https://maps.google.com/maps?q=${selectedTemple.lat},${selectedTemple.lng}&t=${mapMode}&z=16&ie=UTF8&iwloc=&output=embed`}
                  className="map-iframe-element"
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Map Action Buttons */}
              <div className="map-actions-group">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedTemple.lat},${selectedTemple.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-map-action"
                  style={{ color: '#341F1D', borderColor: 'rgba(200, 169, 106, 0.6)' }}
                >
                  <ExternalLink size={16} style={{ color: '#C8A96A' }} /> Open in Google Maps
                </a>

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTemple.lat},${selectedTemple.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary btn-map-action"
                >
                  <Navigation size={16} /> Get Directions
                </a>
              </div>
            </div>

            {/* 5. ADDITIONAL REAL TEMPLE DETAILS CARDS */}
            <div className="additional-info-grid-section">
              {/* Entry Fee & Special Darshan */}
              <div className="temple-info-card">
                <div className="temple-card-header">
                  <div className="temple-card-icon-box">
                    <Ticket size={22} style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="temple-card-heading">Entry Fee & Special Darshan</h3>
                </div>
                <div style={{ marginBottom: '0.8rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#9E7D3F', display: 'block', textTransform: 'uppercase' }}>Entry Fee:</strong>
                  {renderFieldValue(selectedTemple.entryFee)}
                </div>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#9E7D3F', display: 'block', textTransform: 'uppercase' }}>Special Darshan / Queue:</strong>
                  {renderFieldValue(selectedTemple.specialDarshan)}
                </div>
              </div>

              {/* Contact Number & Official Website */}
              <div className="temple-info-card">
                <div className="temple-card-header">
                  <div className="temple-card-icon-box">
                    <Globe size={22} style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="temple-card-heading">Contact & Official Info</h3>
                </div>
                <div style={{ marginBottom: '0.8rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#9E7D3F', display: 'block', textTransform: 'uppercase' }}>Phone Contact:</strong>
                  <span style={{ fontSize: '0.95rem', color: '#341F1D', fontWeight: 600 }}>
                    {selectedTemple.contactNumber ? (
                      <a href={`tel:${selectedTemple.contactNumber}`} style={{ color: '#341F1D', textDecoration: 'none' }}>
                        <Phone size={14} style={{ color: '#C8A96A', display: 'inline', marginRight: '6px' }} />
                        {selectedTemple.contactNumber}
                      </a>
                    ) : (
                      renderFieldValue(null)
                    )}
                  </span>
                </div>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#9E7D3F', display: 'block', textTransform: 'uppercase' }}>Official Website:</strong>
                  {selectedTemple.website && !selectedTemple.website.includes("unavailable") ? (
                    <a href={selectedTemple.website} target="_blank" rel="noopener noreferrer" className="detail-link-btn">
                      <Globe size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {selectedTemple.website}
                    </a>
                  ) : (
                    renderFieldValue(null)
                  )}
                </div>
              </div>

              {/* Temple History */}
              <div className="temple-info-card">
                <div className="temple-card-header">
                  <div className="temple-card-icon-box">
                    <History size={22} style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="temple-card-heading">Temple History</h3>
                </div>
                <p className="info-card-text">{renderFieldValue(selectedTemple.history)}</p>
              </div>

              {/* Special Festivals */}
              <div className="temple-info-card">
                <div className="temple-card-header">
                  <div className="temple-card-icon-box">
                    <PartyPopper size={22} style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="temple-card-heading">Special Festivals</h3>
                </div>
                <p className="info-card-text">{renderFieldValue(selectedTemple.festivals)}</p>
              </div>

              {/* Temple Architecture */}
              <div className="temple-info-card">
                <div className="temple-card-header">
                  <div className="temple-card-icon-box">
                    <Building2 size={22} style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="temple-card-heading">Temple Architecture</h3>
                </div>
                <p className="info-card-text">{renderFieldValue(selectedTemple.architecture)}</p>
              </div>

              {/* Best Time to Visit */}
              <div className="temple-info-card">
                <div className="temple-card-header">
                  <div className="temple-card-icon-box">
                    <CalendarDays size={22} style={{ color: '#C8A96A' }} />
                  </div>
                  <h3 className="temple-card-heading">Best Time to Visit</h3>
                </div>
                <p className="info-card-text">{renderFieldValue(selectedTemple.bestTimeToVisit)}</p>
              </div>
            </div>

            {/* ACTION BANNER */}
            <div className="detail-booking-banner">
              <h2 className="detail-booking-title">Plan Your Sacred Visit to {selectedTemple.name}</h2>
              <p className="detail-booking-desc">
                Book priority entry pass, archana tickets, and ritual guidance for a hassle-free spiritual experience.
              </p>
              <button 
                className="btn-primary"
                onClick={() => {
                  setBookingTempleName(selectedTemple.name);
                  setIsBookingOpen(true);
                }}
              >
                Book Priority Darshan & Archana <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ========================================================================= */
        /* CASE 2: MAIN EXPLORE TEMPLES LIST VIEW */
        /* ========================================================================= */
        <>
          {/* ---------------- 1. HERO SECTION ---------------- */}
          <section className="explore-hero-section">
            <div className="hero-overlay" />
            <div className="hero-content">
              <span className="hero-subtitle-tag">DIVINE PILGRIMAGE JOURNEY</span>
              <h1 className="hero-heading">Explore Sacred Temples</h1>
              <p className="hero-desc">
                Discover divine temples across Tamil Nadu. Uncover ancient Dravidian architecture, holy sanctums, and timeless Vedic rituals.
              </p>

              {/* Full-width Search Bar with Instant Typo-Tolerant Suggestions */}
              <div className="hero-search-wrapper" ref={searchContainerRef}>
                <Search className="hero-search-icon" size={22} />
                <div className="search-input-container">
                  <input 
                    type="text"
                    className="hero-search-input"
                    placeholder="Search any temple in Tamil Nadu (e.g. Madurai Meenakshi, Palani, Srirangam)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  />
                  
                  {/* Instant Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="search-suggestions-dropdown">
                      {suggestions.map((item) => (
                        <div 
                          key={item.id} 
                          className="suggestion-item"
                          onClick={() => handleSelectTemple(item)}
                        >
                          <TempleImage src={item.coverImage} alt={item.name} className="suggestion-thumb" fallbackHeight="42px" />
                          <div className="suggestion-info">
                            <div className="suggestion-title">{item.name}</div>
                            <div className="suggestion-sub">{item.district}, {item.state} • {item.deityLabel}</div>
                          </div>
                          <ArrowRight size={16} style={{ color: '#C8A96A' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {searchQuery && (
                  <button className="hero-search-clear" onClick={() => setSearchQuery('')}>
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ---------------- 2. TEMPLE CATEGORIES HORIZONTAL SCROLL ---------------- */}
          <section className="categories-section">
            <div className="container">
              <div className="categories-scroll-container">
                {CATEGORIES.map((cat) => {
                  const isActive = (activeCategory === cat.id) || (categoryFilter === cat.id);
                  return (
                    <button
                      key={cat.id}
                      className={`category-chip ${isActive ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <span className="category-chip-icon">{cat.icon}</span>
                      <span className="category-chip-label">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ---------------- 3. FILTERS BAR & GRID CONTENT ---------------- */}
          <section className="explore-content-section section">
            <div className="container">
              {/* Filters Bar Above Grid */}
              <div className="filters-bar-card">
                <div className="filters-bar-left">
                  {/* Secondary inline search */}
                  <div className="inline-search-box">
                    <Search size={16} className="inline-search-icon" />
                    <input 
                      type="text" 
                      className="inline-search-input"
                      placeholder="Filter name, district, or deity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* District Filter Dropdown */}
                  <div className="filter-select-group">
                    <label className="filter-label">District:</label>
                    <select 
                      className="filter-select"
                      value={districtFilter}
                      onChange={(e) => setDistrictFilter(e.target.value)}
                    >
                      <option value="all">All Districts ({districtsList.length})</option>
                      {districtsList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter Dropdown */}
                  <div className="filter-select-group">
                    <label className="filter-label">Deity Category:</label>
                    <select 
                      className="filter-select"
                      value={categoryFilter}
                      onChange={(e) => handleCategoryFilterChange(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filters-bar-right">
                  {/* Sort By Dropdown */}
                  <div className="filter-select-group">
                    <SlidersHorizontal size={16} style={{ color: '#C8A96A' }} />
                    <label className="filter-label">Sort By:</label>
                    <select 
                      className="filter-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popular">Popularity & Rating</option>
                      <option value="alphabetical">Name (A - Z)</option>
                    </select>
                  </div>

                  {(searchQuery || activeCategory !== 'all' || categoryFilter !== 'all' || districtFilter !== 'all' || sortBy !== 'popular') && (
                    <button className="reset-filter-btn" onClick={resetFilters} title="Reset Filters">
                      <RotateCcw size={14} /> Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Results Summary Bar */}
              <div className="results-summary-bar">
                <span className="results-count-text">
                  Showing <strong>{filteredTemples.length}</strong> {filteredTemples.length === 1 ? 'sacred temple' : 'sacred temples across Tamil Nadu'}
                </span>
              </div>

              {/* ---------------- 4. TEMPLE GRID ---------------- */}
              {filteredTemples.length > 0 ? (
                <div className="temple-grid">
                  {filteredTemples.map((temple) => (
                    <div key={temple.id} className="temple-card">
                      {/* Temple Cover Image Box */}
                      <div className="temple-img-wrapper">
                        <TempleImage 
                          src={temple.coverImage} 
                          alt={temple.name} 
                          className="temple-img" 
                          fallbackHeight="220px"
                        />
                        <span className="temple-deity-tag">
                          {temple.deityLabel}
                        </span>
                        <div className="temple-rating-badge">
                          <Star size={13} fill="#C8A96A" color="#C8A96A" />
                          <span>{temple.rating}</span>
                        </div>
                      </div>

                      {/* Temple Card Body */}
                      <div className="temple-card-body">
                        <div className="temple-location">
                          <MapPin size={15} className="location-icon" />
                          <span>{temple.district}, {temple.state}</span>
                        </div>

                        <h3 className="temple-name">{temple.name}</h3>

                        <p className="temple-desc">{temple.address}</p>

                        <div className="temple-card-footer">
                          <button 
                            className="btn-view-temple"
                            onClick={() => handleSelectTemple(temple)}
                          >
                            View Temple <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ---------------- 5. EMPTY STATE WITH DYNAMIC WEB SEARCH FALLBACK ---------------- */
                <div className="empty-state-card">
                  <div className="empty-state-icon">🙏</div>
                  <h3 className="empty-state-title">🙏 No matching temple found.</h3>
                  <p className="empty-state-desc">
                    We couldn't find an exact pre-indexed match for "{searchQuery}". You can search live across all Tamil Nadu temples.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.2rem' }}>
                    <button className="btn-outline" onClick={resetFilters}>
                      <RotateCcw size={16} /> Reset Filters
                    </button>
                    
                    <button className="btn-primary" onClick={handleLiveWebSearch} disabled={isSearchingLive}>
                      <Search size={16} /> {isSearchingLive ? 'Searching Web...' : `Search Live Web for "${searchQuery}"`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ---------------- FOOTER ---------------- */}
      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={() => setSelectedTemple(null)}
        onGoToProducts={onGoToProducts}
        onOpenBooking={() => setIsBookingOpen(true)}
      />

      {/* ---------------- DONATE MODAL ---------------- */}
      <div className={`modal-overlay ${isDonateOpen ? 'active' : ''}`} onClick={() => setIsDonateOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setIsDonateOpen(false)}>
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>
              Support Our Temple Seva
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your sacred contributions help sustain daily poojas, Anna Daan (free meals), and Goshala maintenance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className="btn-primary" style={{ textAlign: 'center', padding: '0.8rem' }} onClick={() => { alert('Thank you for donating ₹501 to Anna Daan Seva!'); setIsDonateOpen(false); }}>
              ₹501 • Anna Daan
            </button>
            <button className="btn-primary" style={{ textAlign: 'center', padding: '0.8rem' }} onClick={() => { alert('Thank you for donating ₹1,008 to Temple Renovation!'); setIsDonateOpen(false); }}>
              ₹1,008 • Renovation
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- BOOKING MODAL ---------------- */}
      <div className={`modal-overlay ${isBookingOpen ? 'active' : ''}`} onClick={() => setIsBookingOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setIsBookingOpen(false)}>
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>
              {bookingTempleName ? `Book Darshan for ${bookingTempleName}` : 'Book Temple Darshan & Pooja'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select your preferred date and time slot for special priority entry and archana.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert(`Booking confirmed for ${bookingTempleName || 'Temple'}! Slot details sent to your phone.`); setIsBookingOpen(false); setBookingTempleName(''); }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>Devotee Name</label>
              <input type="text" required placeholder="Enter full name" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(200, 169, 106, 0.4)', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>Preferred Date</label>
              <input type="date" required style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(200, 169, 106, 0.4)', outline: 'none' }} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Confirm Booking <CheckCircle2 size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
