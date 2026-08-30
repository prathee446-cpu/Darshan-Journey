import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import darshanLogo from '../../../src/assets/darshan-logo.png';
import darshanLogoJpeg from '../../../src/assets/darshan-logo.jpeg';
import { saveUserSession, getUserDashboardRoute } from '../utils/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const prefillEmail = searchParams.get('email');
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (email.trim() === '' || password.trim() === '') {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Please check your administrative credentials.');
        setIsLoading(false);
        return;
      }

      const token = data.token;
      const adminUser = data.user;

      saveUserSession(token, adminUser, rememberMe);

      const targetRoute = data.redirectUrl || getUserDashboardRoute(adminUser);
      setIsLoading(false);
      navigate(targetRoute);
    } catch (err) {
      console.error('Login network error:', err);
      setError('Unable to connect to authentication service. Please verify backend connectivity.');
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
      {/* Decorative Traditional Border Frames */}
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
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(200, 155, 75, 0.05) 0%, transparent 70%)',
          top: '-10%',
          left: '-10%',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(200, 155, 75, 0.05) 0%, transparent 70%)',
          bottom: '-10%',
          right: '-10%',
          pointerEvents: 'none'
        }}
      />

      {/* Main Login Box */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glassmorphism"
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
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

        {/* Logo and Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src={darshanLogo} 
            alt="Darshan Journey Logo" 
            style={{
              height: '80px',
              width: '80px',
              borderRadius: '50%',
              border: '2px solid var(--admin-gold)',
              boxShadow: '0 0 15px var(--admin-gold-glow)',
              marginBottom: '1rem',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // fallback if png is missing
              e.target.src = darshanLogoJpeg;
            }}
          />
          <h1 className="serif-title" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FFFDF9', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
            Darshan Journey
          </h1>
          <p className="serif-title" style={{ fontSize: '0.8rem', color: 'var(--admin-gold)', letterSpacing: '0.15em' }}>
            ADMIN & SUB-ADMIN LOGIN PORTAL
          </p>
        </div>

        {/* Credentials Notice Box */}
        <div 
          style={{ 
            background: 'rgba(200, 155, 75, 0.06)', 
            border: '1px solid rgba(200, 155, 75, 0.15)', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem'
          }}
        >
          <ShieldAlert size={18} style={{ color: 'var(--admin-gold)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', lineHeight: '1.4' }}>
            Enter your administrative credentials. Sub-Admins log in with their assigned email (e.g. <strong style={{ color: '#FFFDF9' }}>priya@darshanjourney.com</strong>) to access only their assigned temple or service.
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              color: 'var(--admin-danger)', 
              background: 'rgba(192, 90, 78, 0.1)', 
              border: '1px solid rgba(192, 90, 78, 0.25)', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              marginBottom: '1.2rem',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginBottom: '0.4rem', fontWeight: '500' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.4)', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} />
              </span>
              <input 
                type="email"
                required
                placeholder="admin@darshanjourney.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-text-muted)', marginBottom: '0.4rem', fontWeight: '500' }}>
              Secret Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.4)', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} />
              </span>
              <input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
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
                  color: 'rgba(214, 181, 109, 0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex-between" style={{ marginBottom: '1.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--admin-gold)',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  width: '14px',
                  height: '14px'
                }}
              />
              Remember me
            </label>
            
            <a 
              href="#forgot-pass"
              onClick={(e) => {
                e.preventDefault();
                setError("Please contact technical developers to reset operational credentials.");
              }}
              style={{
                fontSize: '0.82rem',
                color: 'var(--admin-gold)',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
            >
              Forgot Secret?
            </a>
          </div>

          {/* Login Button */}
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
              fontSize: '1rem',
              letterSpacing: '0.08em',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(200, 155, 75, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isLoading ? (
              <span className="flex-center" style={{ gap: '0.5rem' }}>
                <span 
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(18, 9, 7, 0.3)',
                    borderTop: '2px solid var(--admin-bg-dark)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}
                />
                Verifying Credentials...
              </span>
            ) : (
              "ENTER OPERATIVE SANCTUM"
            )}
          </motion.button>
          
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
        </form>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
