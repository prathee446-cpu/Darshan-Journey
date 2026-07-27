import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={22} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.8rem', 
            color: 'var(--text-primary)',
            marginBottom: '0.4rem'
          }}>
            Welcome to Darshan Journey
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to access virtual darshans & personalized spiritual journeys
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert('Signed in successfully!'); onClose(); }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold-mid)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.8rem',
                  background: 'rgba(15, 10, 6, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gold-mid)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.8rem',
                  background: 'rgba(15, 10, 6, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-login"
            style={{
              width: '100%',
              padding: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
            }}
          >
            Continue Journey <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
