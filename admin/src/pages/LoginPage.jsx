import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Eye, EyeOff, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import darshanLogo from '../../../src/assets/darshan-logo.png';
import darshanLogoJpeg from '../../../src/assets/darshan-logo.jpeg';
import { saveUserSession, isAuthenticatedAdmin } from '../utils/auth';

const FLOW = {
  LOGIN: 'LOGIN',
  SPLASH: 'SPLASH'
};

export default function LoginPage() {
  const navigate = useNavigate();

  // State
  const [flow, setFlow] = useState(FLOW.LOGIN);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState(null);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (isAuthenticatedAdmin()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // ─── Admin Credentials Login Handler ───
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');

    const inputUsername = username.trim();
    const inputPassword = password;

    // Strict credential check: superadmin / 1234*&#
    if (inputUsername === 'superadmin' && inputPassword === '1234*&#') {
      setIsLoading(true);
      const adminUser = {
        id: 'adm_super_01',
        name: 'Super Admin',
        username: 'superadmin',
        email: 'admin@darshanjourney.com',
        role: 'SUPER_ADMIN',
        rawRole: 'SUPER_ADMIN',
        designation: 'Chief Administrator',
        branch: 'All Branches',
        temple: 'All Temples',
        status: 'Active',
        assignedModules: [
          'services',
          'temples',
          'bookings',
          'users',
          'payments',
          'reports',
          'media',
          'website-content',
          'about',
          'admin-management',
          'settings'
        ],
        permissions: 'Full Access'
      };

      const token = `darshan_adm_super_${Date.now()}`;
      saveUserSession(token, adminUser, true);
      setAuthenticatedAdmin(adminUser);

      // Authenticating splash transition
      setFlow(FLOW.SPLASH);
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 1500);
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex-center" 
      style={{ 
        minHeight: '100vh', 
        width: '100vw',
        background: 'radial-gradient(circle at center, #2e1a14 0%, #1c0e0b 50%, #0d0605 100%)',
        position: 'relative',
        padding: '1.5rem',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Traditional Temple Borders */}
      <div 
        style={{
          position: 'absolute',
          inset: '20px',
          border: '1px dashed rgba(200, 155, 75, 0.15)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div 
        style={{
          position: 'absolute',
          inset: '30px',
          border: '1px solid rgba(200, 155, 75, 0.08)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Ambient background glows */}
      <div 
        style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(200, 155, 75, 0.07) 0%, transparent 70%)',
          top: '-15%',
          left: '-10%',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(200, 155, 75, 0.07) 0%, transparent 70%)',
          bottom: '-15%',
          right: '-10%',
          pointerEvents: 'none'
        }}
      />

      {/* ─── AUTHENTICATING SPLASH OVERLAY ─── */}
      <AnimatePresence>
        {flow === FLOW.SPLASH && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: 'radial-gradient(circle at center, #241410 0%, #140a08 60%, #080302 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              textAlign: 'center'
            }}
          >
            {/* Glowing Sacred Emblem */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div 
                style={{
                  position: 'absolute',
                  inset: '-20px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(214, 181, 109, 0.4) 0%, transparent 70%)',
                  animation: 'pulseGlow 2s ease-in-out infinite'
                }}
              />
              <img 
                src={darshanLogo} 
                alt="Darshan Journey"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '3px solid #D6B56D',
                  boxShadow: '0 0 35px rgba(214, 181, 109, 0.6)',
                  objectFit: 'cover',
                  position: 'relative',
                  zIndex: 2
                }}
                onError={(e) => { e.target.src = darshanLogoJpeg; }}
              />
            </div>

            <h2 
              className="serif-title"
              style={{
                fontSize: '1.8rem',
                color: '#FFFDF9',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem'
              }}
            >
              Authenticating Admin Session
            </h2>

            <p style={{ color: '#D6B56D', fontSize: '0.95rem', letterSpacing: '0.12em', marginBottom: '1.5rem', fontWeight: '500' }}>
              ENTERING OPERATIONS SANCTUM...
            </p>

            {authenticatedAdmin && (
              <div 
                style={{
                  background: 'rgba(214, 181, 109, 0.1)',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#FFF',
                  fontSize: '0.88rem'
                }}
              >
                <CheckCircle2 size={16} color="#4ADE80" />
                <span>Welcome, <strong>{authenticatedAdmin.name}</strong> ({authenticatedAdmin.role || 'Admin'})</span>
              </div>
            )}

            {/* Spinner line */}
            <div style={{ width: '200px', height: '3px', background: 'rgba(214, 181, 109, 0.2)', borderRadius: '2px', marginTop: '2rem', overflow: 'hidden' }}>
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, #D6B56D, transparent)',
                  animation: 'shimmer 1.5s infinite linear'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN LOGIN CONTAINER ─── */}
      {flow !== FLOW.SPLASH && (
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glassmorphism"
          style={{
            width: '100%',
            maxWidth: '440px',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            zIndex: 2,
            position: 'relative',
            border: '1px solid rgba(214, 181, 109, 0.25)',
            overflow: 'hidden'
          }}
        >
          {/* Top Gold Arch Accent */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #D6B56D 0%, #C89B4B 50%, #D6B56D 100%)'
            }}
          />

          {/* Logo and Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <img 
              src={darshanLogo} 
              alt="Darshan Journey Logo" 
              style={{
                height: '76px',
                width: '76px',
                borderRadius: '50%',
                border: '2px solid var(--admin-gold)',
                boxShadow: '0 0 20px var(--admin-gold-glow)',
                marginBottom: '0.8rem',
                objectFit: 'cover'
              }}
              onError={(e) => { e.target.src = darshanLogoJpeg; }}
            />
            <h1 className="serif-title" style={{ fontSize: '1.45rem', fontWeight: '700', color: '#FFFDF9', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
              Darshan Journey
            </h1>
            <p className="serif-title" style={{ fontSize: '0.78rem', color: 'var(--admin-gold)', letterSpacing: '0.18em', fontWeight: '600' }}>
              ADMINISTRATIVE SANCTUM
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                color: '#F87171', 
                background: 'rgba(239, 68, 68, 0.12)', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                marginBottom: '1.25rem',
                fontSize: '0.84rem',
                lineHeight: '1.4',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* ADMIN CREDENTIALS LOGIN FORM                   */}
          {/* ═══════════════════════════════════════════════ */}
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginBottom: '0.4rem', fontWeight: '500' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.6)', display: 'flex', alignItems: 'center' }}>
                  <User size={16} />
                </span>
                <input 
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    background: 'rgba(20, 10, 8, 0.75)',
                    border: '1px solid rgba(214, 181, 109, 0.3)',
                    color: '#FFFDF9',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--admin-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(214, 181, 109, 0.3)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginBottom: '0.4rem', fontWeight: '500' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.6)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    background: 'rgba(20, 10, 8, 0.75)',
                    border: '1px solid rgba(214, 181, 109, 0.3)',
                    color: '#FFFDF9',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--admin-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(214, 181, 109, 0.3)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(214, 181, 109, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--admin-gold-light) 0%, var(--admin-gold) 100%)',
                border: 'none',
                color: 'var(--admin-bg-dark)',
                fontFamily: 'var(--font-serif)',
                fontWeight: '700',
                fontSize: '0.92rem',
                letterSpacing: '0.08em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(200, 155, 75, 0.3)',
                marginBottom: '0.5rem',
                transition: 'opacity 0.2s'
              }}
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Back to website link */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--admin-text-muted)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'color 0.2s',
                textDecoration: 'underline'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--admin-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--admin-text-muted)'}
            >
              ← Return to Public Website
            </button>
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulseGlow {
              0%, 100% { transform: scale(1); opacity: 0.4; }
              50% { transform: scale(1.15); opacity: 0.8; }
            }
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </motion.div>
      )}
    </div>
  );
}
