import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Phone, Mail, ShieldAlert, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaintenanceGuard({ children }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const isMaintenance = data.maintenanceMode === true || data.websiteStatus === 'maintenance';
        setMaintenanceMode(isMaintenance);
        if (data.maintenanceMessage) {
          setMaintenanceMessage(data.maintenanceMessage);
        }
      }
    } catch (e) {
      // If error, do not block site
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Periodically re-check status every 15 seconds so site restores automatically when turned off
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return children;
  }

  if (maintenanceMode) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          backgroundColor: '#120907',
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(200, 155, 75, 0.15) 0%, rgba(18, 9, 7, 0.98) 70%)',
          color: '#FFFDF9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: "'Outfit', sans-serif",
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background glow effects */}
        <div 
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(214, 181, 109, 0.12) 0%, transparent 70%)',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: '680px',
            width: '100%',
            backgroundColor: 'rgba(30, 16, 12, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(214, 181, 109, 0.3)',
            borderRadius: '24px',
            padding: '3.5rem 2.5rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(200, 155, 75, 0.1)',
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* Sacred Temple Badge */}
          <div 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(200, 155, 75, 0.15)',
              border: '2px solid var(--admin-gold, #D4AF37)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.8rem',
              boxShadow: '0 0 25px rgba(214, 181, 109, 0.3)'
            }}
          >
            <Sparkles size={38} style={{ color: '#D4AF37' }} />
          </div>

          <span 
            style={{
              display: 'inline-block',
              padding: '0.35rem 1rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(214, 181, 109, 0.15)',
              border: '1px solid rgba(214, 181, 109, 0.4)',
              color: '#E5C158',
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.2rem'
            }}
          >
            DARSHAN JOURNEY SANCTUM
          </span>

          <h1 
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontSize: 'clamp(2rem, 5vw, 2.8rem)',
              color: '#FFFDF9',
              margin: '0 0 1rem 0',
              fontWeight: 700,
              lineHeight: 1.2
            }}
          >
            We'll Be Back Soon
          </h1>

          <p 
            style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 253, 249, 0.85)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '520px',
              margin: '0 auto 2.2rem'
            }}
          >
            {maintenanceMessage || 'Our website is currently undergoing maintenance. Please check back shortly.'}
          </p>

          {/* Sacred Divider */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              opacity: 0.6
            }}
          >
            <div style={{ height: '1px', width: '60px', backgroundColor: '#D4AF37' }} />
            <span style={{ color: '#D4AF37', fontSize: '1rem' }}>✦ ॐ ✦</span>
            <div style={{ height: '1px', width: '60px', backgroundColor: '#D4AF37' }} />
          </div>

          {/* Devotee Support Helpdesk */}
          <div 
            style={{
              backgroundColor: 'rgba(18, 9, 7, 0.6)',
              border: '1px solid rgba(214, 181, 109, 0.2)',
              borderRadius: '12px',
              padding: '1.2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.5rem',
              fontSize: '0.85rem',
              color: 'rgba(255, 253, 249, 0.75)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} style={{ color: '#D4AF37' }} />
              <span>contact@darshanjourney.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={15} style={{ color: '#D4AF37' }} />
              <span>+91 98765 43210</span>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={checkStatus}
              style={{
                background: 'none',
                border: '1px solid rgba(214, 181, 109, 0.35)',
                color: '#D4AF37',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw size={14} />
              Check Status Again
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p style={{ marginTop: '2.5rem', color: 'rgba(255, 253, 249, 0.4)', fontSize: '0.78rem', zIndex: 2 }}>
          © {new Date().getFullYear()} Darshan Journey. Vedic Pilgrimage & Virtual Darshan Portal.
        </p>
      </div>
    );
  }

  return children;
}
