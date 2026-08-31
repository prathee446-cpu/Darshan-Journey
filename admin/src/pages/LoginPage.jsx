import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, Eye, EyeOff, ShieldAlert, Sparkles, 
  ShieldCheck, ArrowLeft, RefreshCw, KeyRound, CheckCircle2 
} from 'lucide-react';
import darshanLogo from '../../../src/assets/darshan-logo.png';
import darshanLogoJpeg from '../../../src/assets/darshan-logo.jpeg';
import { saveUserSession, getUserDashboardRoute, isAuthenticatedAdmin } from '../utils/auth';

const FLOW = {
  LOGIN: 'LOGIN',
  OTP: 'OTP',
  SPLASH: 'SPLASH'
};

// Google Client ID fallback from standard environment
const GOOGLE_CLIENT_ID = 
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 
  '78691079276-d4kt99gk2blffdvvamb219trnbmrt26h.apps.googleusercontent.com';

function ensureGoogleGisLoaded(timeout = 4000) {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve(true);
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [flow, setFlow] = useState(FLOW.LOGIN);
  const [authMode, setAuthMode] = useState('google'); // 'google' or 'password'
  
  // Credentials Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Google OTP State
  const [adminEmail, setAdminEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState(null);

  const otpInputRefs = useRef([]);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (isAuthenticatedAdmin()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const prefillEmail = searchParams.get('email');
    if (prefillEmail) {
      setEmail(prefillEmail);
      setAdminEmail(prefillEmail);
    }
  }, [searchParams]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // ─── 1. Google OAuth Flow Initiation ───
  const handleGoogleAdminLogin = async () => {
    setError('');
    setSuccessMsg('');
    setIsGoogleLoading(true);

    const isLoaded = await ensureGoogleGisLoaded(4000);

    if (isLoaded && window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setIsGoogleLoading(false);
              if (tokenResponse.error === 'popup_closed_by_user') {
                return;
              }
              setError(`Google Sign-In error: ${tokenResponse.error}`);
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await fetch('/api/auth/admin/google-send-otp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ accessToken: tokenResponse.access_token })
                });

                const data = await res.json();
                setIsGoogleLoading(false);

                if (res.ok && data.success) {
                  setAdminEmail(data.email);
                  setFlow(FLOW.OTP);
                  setOtpDigits(['', '', '', '', '', '']);
                  setCooldownSeconds(data.cooldownSeconds || 30);
                  setSuccessMsg(data.message || `Verification code sent to ${data.email}`);
                  setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
                } else {
                  setError(data.message || data.detail || 'Google account not authorized for admin access.');
                }
              } catch (err) {
                console.error('Admin Google auth network error:', err);
                setIsGoogleLoading(false);
                setError('Unable to connect to authentication server. Please check backend connectivity.');
              }
            } else {
              setIsGoogleLoading(false);
            }
          },
          error_callback: (err) => {
            console.warn('Google Token Client error:', err);
            setIsGoogleLoading(false);
            setError('Google sign-in popup failed or was blocked. Please allow popups and try again.');
          }
        });

        tokenClient.requestAccessToken();
        return;
      } catch (err) {
        console.warn('Error invoking GIS token client:', err);
        setIsGoogleLoading(false);
        setError('Google sign-in service unavailable. Please try again.');
      }
    } else {
      setIsGoogleLoading(false);
      setError('Google Identity Services failed to load. Please check your internet connection.');
    }
  };

  // ─── 2. OTP Input Handlers ───
  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = sanitized;
    setOtpDigits(newDigits);
    setError('');

    if (sanitized && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (sanitized && index === 5 && newDigits.every((d) => d !== '')) {
      const fullOtp = newDigits.join('');
      executeOtpVerification(fullOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        executeOtpVerification(pasted);
      } else {
        const nextFocus = Math.min(pasted.length, 5);
        otpInputRefs.current[nextFocus]?.focus();
      }
    }
  };

  // ─── 3. OTP Verification Execution ───
  const executeOtpVerification = async (otpToVerify) => {
    const fullOtp = otpToVerify || otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin/google-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, otp: fullOtp })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        const token = data.token;
        const adminUser = data.user;

        // Save authenticated admin session
        saveUserSession(token, adminUser, rememberMe);
        setAuthenticatedAdmin(adminUser);

        // Step into 2-second splash screen transition
        setFlow(FLOW.SPLASH);
        setTimeout(() => {
          const targetRoute = data.redirectUrl || getUserDashboardRoute(adminUser);
          navigate(targetRoute, { replace: true });
        }, 2000);
      } else {
        setError(data.message || data.detail || 'Invalid verification code. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      console.error('OTP Verification error:', err);
      setIsLoading(false);
      setError('Unable to verify OTP. Please check backend connectivity.');
    }
  };

  // ─── 4. Resend OTP Handler ───
  const handleResendOtp = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    setError('');
    setSuccessMsg('');
    setIsResending(true);

    try {
      const res = await fetch('/api/auth/admin/google-resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      });

      const data = await res.json();
      setIsResending(false);

      if (res.ok && data.success) {
        setCooldownSeconds(data.cooldownSeconds || 30);
        setSuccessMsg(data.message || `New code sent to ${adminEmail}`);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || data.detail || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      setIsResending(false);
      setError('Failed to resend code due to a network error.');
    }
  };

  // ─── 5. Secret Password Login ───
  const handlePasswordLogin = async (e) => {
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
      setAuthenticatedAdmin(adminUser);

      // Splash transition
      setFlow(FLOW.SPLASH);
      setTimeout(() => {
        const targetRoute = data.redirectUrl || getUserDashboardRoute(adminUser);
        navigate(targetRoute, { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Password login network error:', err);
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

      {/* ─── 2-SECOND AUTHENTICATING SPLASH OVERLAY ─── */}
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
            maxWidth: '480px',
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

          {/* Success Banner */}
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                color: '#4ADE80', 
                background: 'rgba(74, 222, 128, 0.1)', 
                border: '1px solid rgba(74, 222, 128, 0.25)', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                marginBottom: '1.25rem',
                fontSize: '0.84rem',
                textAlign: 'center'
              }}
            >
              ✉️ {successMsg}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* FLOW: LOGIN OPTIONS                             */}
          {/* ═══════════════════════════════════════════════ */}
          {flow === FLOW.LOGIN && (
            <div>
              {/* Primary Google Admin Authentication Button */}
              <div style={{ marginBottom: '1.5rem' }}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGoogleAdminLogin}
                  disabled={isGoogleLoading}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1.2rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F1EB 100%)',
                    border: '1px solid rgba(214, 181, 109, 0.5)',
                    color: '#1A0E0B',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {isGoogleLoading ? (
                    <span className="flex-center" style={{ gap: '0.5rem' }}>
                      <span 
                        style={{
                          width: '18px',
                          height: '18px',
                          border: '2px solid rgba(26, 14, 11, 0.25)',
                          borderTop: '2px solid #1A0E0B',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }}
                      />
                      Verifying Admin Google Account...
                    </span>
                  ) : (
                    <>
                      {/* Google G Logo SVG */}
                      <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </motion.button>
              </div>

              {/* Security Badge */}
              <div 
                style={{ 
                  background: 'rgba(200, 155, 75, 0.06)', 
                  border: '1px solid rgba(200, 155, 75, 0.18)', 
                  padding: '0.75rem 0.9rem', 
                  borderRadius: '8px', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}
              >
                <ShieldCheck size={18} style={{ color: 'var(--admin-gold)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', lineHeight: '1.4' }}>
                  Admin access is restricted to verified administrator Google accounts. An authorization code (OTP) will be dispatched to your registered Google email.
                </div>
              </div>

              {/* Divider for Alternative Password Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(200, 155, 75, 0.15)' }} />
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'password' ? 'google' : 'password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--admin-gold)',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textDecoration: 'underline'
                  }}
                >
                  {authMode === 'password' ? 'Hide Password Form' : 'Or Sign in with Secret Password'}
                </button>
                <div style={{ flex: 1, height: '1px', background: 'rgba(200, 155, 75, 0.15)' }} />
              </div>

              {/* Password Form (Toggleable) */}
              {authMode === 'password' && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handlePasswordLogin}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginBottom: '0.35rem' }}>
                      Admin Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.5)' }}>
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
                          padding: '0.7rem 0.75rem 0.7rem 2.4rem',
                          borderRadius: '8px',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginBottom: '0.35rem' }}>
                      Secret Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.5)' }}>
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
                          padding: '0.7rem 2.4rem 0.7rem 2.4rem',
                          borderRadius: '8px',
                          fontSize: '0.88rem'
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
                          color: 'rgba(214, 181, 109, 0.5)',
                          cursor: 'pointer'
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
                      padding: '0.8rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--admin-gold-light) 0%, var(--admin-gold) 100%)',
                      border: 'none',
                      color: 'var(--admin-bg-dark)',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      letterSpacing: '0.08em',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {isLoading ? 'Verifying...' : 'Sign In with Password'}
                  </motion.button>
                </motion.form>
              )}

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
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* FLOW: 6-DIGIT OTP VERIFICATION                  */}
          {/* ═══════════════════════════════════════════════ */}
          {flow === FLOW.OTP && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(214, 181, 109, 0.12)',
                    border: '1px solid rgba(214, 181, 109, 0.3)',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    color: 'var(--admin-gold)',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    marginBottom: '0.8rem'
                  }}
                >
                  <KeyRound size={14} />
                  ADMIN OTP VERIFICATION
                </div>
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Enter the 6-digit administrative verification code sent to:
                </p>
                <p style={{ color: '#FFFDF9', fontWeight: '600', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                  {adminEmail}
                </p>
              </div>

              {/* 6 Digit Input Boxes */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  marginBottom: '1.5rem' 
                }}
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '48px',
                      height: '54px',
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#FFFDF9',
                      background: 'rgba(20, 10, 8, 0.75)',
                      border: digit ? '2px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.3)',
                      borderRadius: '8px',
                      boxShadow: digit ? '0 0 10px rgba(214, 181, 109, 0.3)' : 'none',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>

              {/* Verify Action Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => executeOtpVerification()}
                disabled={isLoading || otpDigits.some((d) => !d)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  background: otpDigits.every((d) => d)
                    ? 'linear-gradient(135deg, var(--admin-gold-light) 0%, var(--admin-gold) 100%)'
                    : 'rgba(214, 181, 109, 0.3)',
                  border: 'none',
                  color: otpDigits.every((d) => d) ? 'var(--admin-bg-dark)' : 'rgba(255, 255, 255, 0.4)',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  letterSpacing: '0.08em',
                  cursor: isLoading || otpDigits.some((d) => !d) ? 'not-allowed' : 'pointer',
                  boxShadow: otpDigits.every((d) => d) ? '0 4px 15px rgba(200, 155, 75, 0.3)' : 'none',
                  marginBottom: '1.25rem'
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
                    Verifying OTP...
                  </span>
                ) : (
                  'VERIFY & ENTER SANCTUM'
                )}
              </motion.button>

              {/* Resend Code Section */}
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {cooldownSeconds > 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    Resend verification code in <strong style={{ color: 'var(--admin-gold)' }}>{cooldownSeconds}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--admin-gold)',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: isResending ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <RefreshCw size={13} className={isResending ? 'spin-icon' : ''} />
                    {isResending ? 'Resending Code...' : 'Resend Verification Code'}
                  </button>
                )}
              </div>

              {/* Back to Login */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFlow(FLOW.LOGIN);
                    setError('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--admin-text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>
            </motion.div>
          )}

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
            .spin-icon {
              animation: spin 1s linear infinite;
            }
          `}</style>
        </motion.div>
      )}
    </div>
  );
}
