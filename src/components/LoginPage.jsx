import React, { useState } from 'react';
import { Heart, CheckCircle2, X } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LoginPage({ 
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToLogin 
}) {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="home-website-wrapper">
      {/* ---------------- NAVBAR ---------------- */}
      <Navbar 
        activePage="login"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToLogin={onGoToLogin}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenDonate={() => setIsDonateOpen(true)}
      />

      {/* ---------------- MAIN PLACEHOLDER CONTENT ---------------- */}
      <main 
        style={{ 
          minHeight: '65vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          paddingTop: '160px',
          paddingBottom: '100px',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem'
        }}
      >
        <div 
          style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            border: '1.5px solid rgba(200, 169, 106, 0.35)',
            padding: '3.5rem 2.5rem',
            boxShadow: '0 15px 45px rgba(52, 31, 29, 0.08)'
          }}
        >
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(200, 169, 106, 0.15)',
              color: '#C8A96A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              fontSize: '1.8rem',
              border: '1px solid rgba(200, 169, 106, 0.4)'
            }}
          >
            🔑
          </div>

          <h1 
            style={{ 
              fontFamily: "'Cinzel', serif", 
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', 
              fontWeight: 800, 
              color: '#341F1D', 
              marginBottom: '0.8rem',
              lineHeight: 1.25
            }}
          >
            Welcome to Login
          </h1>

          <p 
            style={{ 
              fontSize: '1.05rem', 
              color: '#6E5351', 
              lineHeight: 1.6 
            }}
          >
            This is a placeholder login page.
          </p>
        </div>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onOpenBooking={() => setIsBookingOpen(true)}
      />

      {/* DONATE MODAL */}
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

      {/* BOOKING MODAL */}
      <div className={`modal-overlay ${isBookingOpen ? 'active' : ''}`} onClick={() => setIsBookingOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setIsBookingOpen(false)}>
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>
              Book Temple Darshan & Pooja
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select your preferred date and time slot for special priority entry and archana.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Booking confirmed! Slot details sent to your registered phone.'); setIsBookingOpen(false); }}>
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
