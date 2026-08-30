import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, RefreshCw, X, ArrowRight, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';
import { fetchProductsByServiceAndLocation, LOCATION_OFFERINGS } from '../data/servicesProductsData';

export const SUPPORTED_LOCATIONS = [
  { name: 'Madurai', temple: 'Meenakshi Sundareswarar & Thiruparankundram', icon: '🌺', badge: 'Madurai Special' },
  { name: 'Chennai', temple: 'Kapaleeshwarar Mylapore & Parthasarathy', icon: '🛕', badge: 'Mylapore & Triplicane' },
  { name: 'Tirupati', temple: 'Sri Venkateswara Swamy Temple (Tirumala)', icon: '🪷', badge: 'Srivari Blessings' },
  { name: 'Thanjavur', temple: 'Brihadeeswarar UNESCO Big Temple & Chola Art', icon: '🕉', badge: 'Heritage Shrine' },
  { name: 'Srirangam', temple: 'Sri Ranganathaswamy 1st Divya Desam', icon: '🌊', badge: 'Kaveri Shrine' },
  { name: 'Palani', temple: 'Arulmigu Dhandayuthapani Swamy Temple', icon: '⚔️', badge: 'GI Panchamirtham' },
  { name: 'Kanchipuram', temple: 'Ekambareswarar & Kamakshi Amman Shrines', icon: '🧵', badge: 'Temple City' },
  { name: 'Rameswaram', temple: 'Ramanathaswamy Jyotirlinga & Agni Theertham', icon: '🐚', badge: 'Jyotirlinga Shrine' },
  { name: 'Tiruchendur', temple: 'Subramaniya Swamy Seashore Temple', icon: '🌅', badge: 'Seashore Shrine' }
];

export default function LocationServiceModal({ isOpen, activeService, onClose, onBookOffering }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedLocation(null);
      setOfferings([]);
    }
  }, [isOpen]);

  const handleSelectLocation = async (locName) => {
    setSelectedLocation(locName);
    setIsLoading(true);
    try {
      const categorySlug = activeService?.categorySlug || activeService?.id || 'pooja-essentials';
      const items = await fetchProductsByServiceAndLocation(categorySlug, locName);
      setOfferings(items || []);
    } catch (err) {
      console.warn('Error fetching service location offerings:', err);
      setOfferings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeLocation = () => {
    setSelectedLocation(null);
    setOfferings([]);
  };

  if (!isOpen || !activeService) return null;

  const serviceTitle = activeService.title || activeService.serviceName || activeService.name || 'Service Offering';
  const categorySlug = activeService.categorySlug || activeService.id || 'pooja-essentials';

  return (
    <div
      className="modal-overlay active"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(45, 26, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        overflowY: 'auto'
      }}
    >
      <div
        className="location-service-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFDF9',
          borderRadius: '28px',
          border: '2px solid #C89B4B',
          padding: '2.5rem 2rem',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(45, 26, 18, 0.4)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F7F1E8',
            border: '1px solid rgba(200, 155, 75, 0.3)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3B241C',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        {/* STEP 1: LOCATION SELECTION (When no location is selected yet) */}
        {!selectedLocation ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(200, 155, 75, 0.15)', color: '#C89B4B', padding: '0.4rem 1.1rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>
                <Sparkles size={15} /> Selected Service: {serviceTitle}
              </div>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: '#3B241C', marginBottom: '0.8rem' }}>
                Select Your Location
              </h2>
              <p style={{ color: '#5C3A2E', fontSize: '1.02rem', lineHeight: 1.6, margin: 0 }}>
                Select a temple city to view exclusive location offerings available specifically for <strong>{serviceTitle}</strong>.
              </p>
            </div>

            {/* Grid of Supported Location Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.2rem',
                marginBottom: '1rem'
              }}
            >
              {SUPPORTED_LOCATIONS.map((loc) => (
                <motion.div
                  key={loc.name}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectLocation(loc.name)}
                  style={{
                    backgroundColor: '#FDFBF7',
                    border: '1.5px solid rgba(200, 155, 75, 0.35)',
                    borderRadius: '20px',
                    padding: '1.4rem 1.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 6px 18px rgba(59, 36, 28, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C89B4B';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(200, 155, 75, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(200, 155, 75, 0.35)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(59, 36, 28, 0.04)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '2rem' }}>{loc.icon}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#A57C52', backgroundColor: 'rgba(200, 155, 75, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {loc.badge}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.3rem', fontWeight: 800, color: '#3B241C', marginBottom: '0.3rem' }}>
                      {loc.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#5C3A2E', lineHeight: 1.4, margin: 0 }}>
                      {loc.temple}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#C89B4B', fontWeight: 800, fontSize: '0.88rem', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px dashed rgba(200, 155, 75, 0.25)' }}>
                    View Offerings <ArrowRight size={16} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* STEP 2: SERVICE + LOCATION SPECIFIC OFFERINGS */
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header Bar with Service & Location Info */}
            <div style={{ borderBottom: '1.5px solid rgba(200, 155, 75, 0.25)', paddingBottom: '1.2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'rgba(200, 155, 75, 0.15)', color: '#C89B4B', padding: '0.4rem 0.9rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 800 }}>
                    Selected Service: <strong>{serviceTitle}</strong>
                  </div>
                  <div style={{ backgroundColor: '#3B241C', color: '#C89B4B', padding: '0.4rem 0.9rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> Selected Location: <strong>{selectedLocation}</strong>
                  </div>
                </div>

                {/* Change Location Button */}
                <button
                  onClick={handleChangeLocation}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#F7F1E8',
                    color: '#3B241C',
                    border: '1.5px solid #C89B4B',
                    borderRadius: '99px',
                    padding: '0.55rem 1.2rem',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#C89B4B';
                    e.currentTarget.style.color = '#3B241C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F7F1E8';
                    e.currentTarget.style.color = '#3B241C';
                  }}
                >
                  <RefreshCw size={15} /> Change Location
                </button>
              </div>

              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.5rem', fontWeight: 800, color: '#3B241C', marginTop: '0.8rem', marginBottom: 0 }}>
                Special Offerings for {serviceTitle} in {selectedLocation}
              </h2>
            </div>

            {/* Offerings Grid for ONLY Selected Service + Location */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#A57C52', fontSize: '1.1rem' }}>
                Loading offerings for {serviceTitle} in {selectedLocation}...
              </div>
            ) : offerings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#5C3A2E' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>No offerings available for {serviceTitle} in {selectedLocation} right now.</p>
                <button onClick={handleChangeLocation} style={{ backgroundColor: '#C89B4B', color: '#3B241C', border: 'none', borderRadius: '99px', padding: '0.6rem 1.4rem', fontWeight: 800, cursor: 'pointer', marginTop: '1rem' }}>
                  Select Another Location
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.8rem' }}>
                {offerings.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      border: '1.5px solid rgba(200, 155, 75, 0.3)',
                      boxShadow: '0 8px 20px rgba(59, 36, 28, 0.06)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >

                    <div>
                      {/* Image */}
                      <div style={{ height: '170px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={item.image}
                          alt={item.name || item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {item.badgeText && (
                          <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#3B241C', color: '#C89B4B', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                            {item.badgeText}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ padding: '1.2rem 1.2rem 0.5rem 1.2rem' }}>
                        {item.temple && (
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A57C52', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                            {item.temple}
                          </div>
                        )}
                        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.15rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                          {item.name || item.title}
                        </h3>
                        <p style={{ fontSize: '0.88rem', color: '#5C3A2E', lineHeight: 1.5, marginBottom: '1rem' }}>
                          {item.shortDesc || item.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div style={{ padding: '1rem 1.2rem 1.2rem 1.2rem', borderTop: '1px dashed rgba(200, 155, 75, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#A57C52', textTransform: 'uppercase' }}>Dakshina</span>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem', fontWeight: 800, color: '#3B241C' }}>
                          {item.formattedPrice || item.price}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (onBookOffering) onBookOffering(item);
                        }}
                        style={{
                          backgroundColor: '#C89B4B',
                          color: '#3B241C',
                          border: 'none',
                          borderRadius: '99px',
                          padding: '0.6rem 1.2rem',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 12px rgba(200, 155, 75, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#3B241C';
                          e.currentTarget.style.color = '#C89B4B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#C89B4B';
                          e.currentTarget.style.color = '#3B241C';
                        }}
                      >
                        Book Offering <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
