import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, User, Phone, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, 
  Sparkles, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, 
  Clock, Loader2, UserPlus, LogIn, AtSign 
} from 'lucide-react';
import GoldParticles from './GoldParticles';
import templeNightBg from '../assets/temple_night_bg.png';
import darshanLogo from '../assets/darshan-logo.jpeg';
import Navbar from './Navbar';

import { useAuth } from '../context/AuthContext';
import { getGoogleClientId, ensureGoogleGisLoaded, triggerGoogleOAuthRedirect, checkOriginMatches, AUTHORIZED_ORIGIN } from '../utils/googleAuth';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─── Motion Animation Variants ───
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 }
  }
};

const formItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  }
};

// ─── Email Masking Helper (e.g. devotee2026@gmail.com -> d*******6@gmail.com) ───
function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  const first = user[0];
  const last = user[user.length - 1];
  const asterisks = '*'.repeat(Math.max(user.length - 2, 4));
  return `${first}${asterisks}${last}@${domain}`;
}

// ─── Auth Flow States ───
const FLOW = {
  SIGNIN: 'signin',              // Screen 1: Sign In (Default initial screen)
  REGISTER: 'register',          // Screen 2: Create Account Form
  REGISTER_OTP: 'register_otp',  // Screen 3: Register OTP Verification
  GOOGLE_OTP: 'google_otp',      // Screen 4: Google Sign-In OTP Verification (Mandatory for every Google login)
  SPLASH: 'splash',              // Screen 5: Post-login full-screen Splash screen
};

export default function LoginPage({ 
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToServices, 
  onGoToLogin, 
  onGoToAbout, 
  onGoToContact,
  onGoToDashboard,
  onOpenBooking,
  onOpenDonate
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, isAuthenticated } = useAuth();

  // ─── Default flow is Screen 1: SIGNIN ───
  const [flow, setFlow] = useState(FLOW.SIGNIN);

  // Redirect if already authenticated and NOT actively viewing the post-login Splash screen
  useEffect(() => {
    if (isAuthenticated && flow !== FLOW.SPLASH) {
      const from = location.state?.from;
      const target = (from && from !== '/login') ? from : '/home';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, flow, navigate, location.state]);

  // ─── Sign In State ───
  const [signinIdentifier, setSigninIdentifier] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // ─── Create Account State ───
  const [regForm, setRegForm] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  const [regErrors, setRegErrors] = useState({});
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // ─── Google OAuth State ───
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleTempToken, setGoogleTempToken] = useState('');

  // ─── OTP State ───
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // ─── General Error / Toast ───
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // ─── Refs ───
  const otpInputRefs = useRef([]);
  const cooldownIntervalRef = useRef(null);
  const isVerifyingRef = useRef(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const clearAllErrors = () => {
    setFormError('');
    setOtpError('');
    setGoogleError('');
    setRegErrors({});
  };

  // ─── Cooldown Timer ───
  useEffect(() => {
    if (cooldownSeconds > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(cooldownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cooldownIntervalRef.current);
  }, [cooldownSeconds]);

  // ─── State for pending booking service redirection after splash screen ───
  const [pendingRedirectService, setPendingRedirectService] = useState(null);
  const [authenticatedDevotee, setAuthenticatedDevotee] = useState(null);

  // ─── Handle Successful Authentication ───
  const handleSuccessfulAuth = useCallback((userData, token = null) => {
    const pendingService = login(userData, token);
    setPendingRedirectService(pendingService);
    setAuthenticatedDevotee(userData);
    setFlow(FLOW.SPLASH);
  }, [login]);

  // ─── Handle Explore Click from Splash Screen ───
  const handleExploreClick = useCallback(() => {
    if (pendingRedirectService) {
      const targetPath = pendingRedirectService.redirectUrl || 
        (pendingRedirectService.categorySlug ? `/services/category/${pendingRedirectService.categorySlug}` : '/services/details');
      navigate(targetPath, { state: { service: pendingRedirectService, categorySlug: pendingRedirectService.categorySlug } });
    } else {
      const from = location.state?.from;
      const target = (from && from !== '/login') ? from : '/home';
      navigate(target, { replace: true });
    }
  }, [pendingRedirectService, navigate, location.state]);

  // ─── Auto-navigate to /home after ONLY 2 seconds on Splash Screen ───
  useEffect(() => {
    if (flow === FLOW.SPLASH) {
      const splashTimer = setTimeout(() => {
        handleExploreClick();
      }, 2000);
      return () => clearTimeout(splashTimer);
    }
  }, [flow, handleExploreClick]);

  // ─── Pre-load Google Identity Services script on mount ───
  useEffect(() => {
    ensureGoogleGisLoaded().catch(() => {});
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //  1. NORMAL ACCOUNT SIGN IN (Username/Email + Password)
  // ═══════════════════════════════════════════════════════════════

  const handleNormalSignin = async (e) => {
    if (e) e.preventDefault();
    clearAllErrors();

    if (!signinIdentifier.trim()) {
      setFormError('Please enter your username or email address.');
      return;
    }
    if (!signinPassword) {
      setFormError('Please enter your password.');
      return;
    }

    setIsSigningIn(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier: signinIdentifier.trim(),
          password: signinPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || '✨ Signed in successfully!');
        handleSuccessfulAuth(data.user, data.token);
      } else {
        setFormError(data.message || data.detail || 'Invalid username/email or password.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setFormError('Unable to reach server. Please check your connection.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  2. GOOGLE OAUTH AUTHENTICATION (Mandatory OTP Verification for every Google Login)
  // ═══════════════════════════════════════════════════════════════

  const handleGoogleLogin = useCallback(async () => {
    clearAllErrors();

    // Check Authorized JavaScript Origin (http://localhost:3000)
    if (!checkOriginMatches()) {
      setGoogleError(
        `Google Sign-In requires origin ${AUTHORIZED_ORIGIN}. You are currently browsing on ${typeof window !== 'undefined' ? window.location.origin : 'unknown'}. Please access the application at ${AUTHORIZED_ORIGIN} to sign in with Google.`
      );
      return;
    }

    const clientId = getGoogleClientId();
    if (!clientId) {
      setGoogleError('Google Client ID not configured. Please verify VITE_GOOGLE_CLIENT_ID in .env.');
      return;
    }

    setIsGoogleLoading(true);

    // Ensure Google Identity Services script is ready
    const isLoaded = await ensureGoogleGisLoaded(3500);

    // Preferred Fast GIS OAuth 2.0 Popup Token Client (Forces Account Picker & Mandatory OTP)
    if (isLoaded && window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setIsGoogleLoading(false);
              if (tokenResponse.error === 'popup_closed_by_user') {
                return;
              }
              if (tokenResponse.error === 'origin_mismatch') {
                setGoogleError('Google Login Origin Mismatch: Please ensure you are accessing http://localhost:3000 (Authorized JavaScript Origin).');
                return;
              }
              if (tokenResponse.error === 'access_denied') {
                setGoogleError('Google sign-in permission was denied. Please try again.');
                return;
              }
              setGoogleError(`Google sign-in error: ${tokenResponse.error}`);
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await fetch(`${API_BASE}/api/auth/google`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ accessToken: tokenResponse.access_token })
                });

                if (res.status === 502 || res.status === 503 || res.status === 504) {
                  setIsGoogleLoading(false);
                  setGoogleError('Authentication server is unavailable. Please try again.');
                  return;
                }

                const data = await res.json();
                setIsGoogleLoading(false);

                if (res.ok && data.success && data.email) {
                  // Mandatory Google login OTP verification step
                  setGoogleEmail(data.email);
                  setGoogleTempToken(data.tempAuthToken || '');
                  setFlow(FLOW.GOOGLE_OTP);
                  setOtpDigits(['', '', '', '', '', '']);
                  setCooldownSeconds(data.cooldownSeconds || 30);
                  showToast(data.message || `📩 Verification code sent to ${data.email}`);
                  setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
                } else {
                  if (res.status === 401) {
                    setGoogleError('Invalid Google credential. Please try again.');
                  } else {
                    setGoogleError(data.detail || data.message || 'Google authentication failed. Please try again.');
                  }
                }
              } catch (err) {
                console.error('Google auth server verification error:', err);
                setIsGoogleLoading(false);
                setGoogleError('Authentication server is unavailable. Please try again.');
              }
            } else {
              setIsGoogleLoading(false);
            }
          },
          error_callback: (err) => {
            console.warn('Google Token Client error:', err);
            setIsGoogleLoading(false);
            if (err?.type === 'origin_mismatch' || String(err).includes('origin_mismatch')) {
              setGoogleError('Google Login Origin Mismatch: Please ensure you are opening http://localhost:3000.');
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Failed to invoke Token Client, trying redirect fallback:', err);
      }
    }

    // Fallback: Direct Google OAuth Web Redirect Flow
    console.log('Initiating direct Google OAuth redirect fallback...');
    const redirected = triggerGoogleOAuthRedirect();
    if (!redirected) {
      setIsGoogleLoading(false);
      setGoogleError('Unable to initiate Google Sign-In. You can sign in using Username/Email & Password.');
    }
  }, [handleSuccessfulAuth]);

  // Handle Google OAuth URL hash redirect fallback
  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');
      if (idToken || accessToken) {
        window.history.replaceState(null, '', window.location.pathname);
        setIsGoogleLoading(true);

        (async () => {
          try {
            const res = await fetch(`${API_BASE}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(idToken ? { credential: idToken } : { accessToken })
            });

            const data = await res.json();
            setIsGoogleLoading(false);

            if (res.ok && data.success && data.email) {
              // Mandatory Google login OTP verification step
              setGoogleEmail(data.email);
              setGoogleTempToken(data.tempAuthToken || '');
              setFlow(FLOW.GOOGLE_OTP);
              setOtpDigits(['', '', '', '', '', '']);
              setCooldownSeconds(data.cooldownSeconds || 30);
              showToast(data.message || `📩 Verification code sent to ${data.email}`);
              setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
            } else {
              setGoogleError(data.detail || data.message || 'Google authentication failed. Please try again.');
            }
          } catch (err) {
            setIsGoogleLoading(false);
            setGoogleError('Failed to process Google redirect.');
          }
        })();
      }
    }
  }, [handleSuccessfulAuth]);

  // ═══════════════════════════════════════════════════════════════
  //  3. CREATE ACCOUNT (REGISTRATION) FLOW
  // ═══════════════════════════════════════════════════════════════

  const validateRegistration = () => {
    const errors = {};
    if (!regForm.fullName.trim() || regForm.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required (min 2 characters)';
    }
    if (!regForm.email.trim() || !/\S+@\S+\.\S+/.test(regForm.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!regForm.username.trim() || regForm.username.trim().length < 3) {
      errors.username = 'Username is required (min 3 letters/numbers)';
    }
    const cleanPhone = regForm.mobile.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!regForm.password || regForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (regForm.password !== regForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!regForm.termsAccepted) {
      errors.terms = 'Please accept the Terms & Conditions to proceed';
    }
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    clearAllErrors();

    if (!validateRegistration()) return;
    if (cooldownSeconds > 0) return;

    setIsSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register-send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: regForm.fullName.trim(),
          username: regForm.username.trim().toLowerCase(),
          email: regForm.email.trim().toLowerCase(),
          mobile: regForm.mobile.trim(),
          password: regForm.password
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFlow(FLOW.REGISTER_OTP);
        setOtpDigits(['', '', '', '', '', '']);
        setCooldownSeconds(data.cooldownSeconds || 30);
        showToast(`📩 ${data.message}`);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
      } else {
        setFormError(data.message || data.detail || 'Registration failed. Please check your details.');
        if (data.cooldownSeconds) setCooldownSeconds(data.cooldownSeconds);
      }
    } catch (err) {
      console.error('Register submit error:', err);
      setFormError('Unable to reach server. Please check your connection and try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegisterVerifyOtp = async (codeOverride) => {
    if (isVerifyingRef.current) return;
    const raw = codeOverride !== undefined ? codeOverride : otpDigits.join('');
    const code = String(raw).replace(/\D/g, '').trim();
    if (code.length !== 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setOtpError('');
    isVerifyingRef.current = true;
    setIsVerifyingOtp(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: regForm.email.trim().toLowerCase(),
          otp: code
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || '✨ Account created & activated!');
        handleSuccessfulAuth(data.user, data.token);
      } else {
        setOtpError(data.detail || data.message || 'Invalid verification code. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      console.error('Register verify OTP error:', err);
      setOtpError('Unable to reach server. Please try again.');
    } finally {
      isVerifyingRef.current = false;
      setIsVerifyingOtp(false);
    }
  };

  const handleRegisterResendOtp = async () => {
    if (!regForm.email || cooldownSeconds > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setOtpError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register-resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: regForm.email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCooldownSeconds(data.cooldownSeconds || 30);
        showToast(`📩 ${data.message || 'New verification code sent.'}`);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setOtpError(data.message || data.detail || 'Failed to resend verification code.');
        if (data.cooldownSeconds) setCooldownSeconds(data.cooldownSeconds);
      }
    } catch (err) {
      console.error('Register resend OTP error:', err);
      setOtpError('Unable to reach server. Please check your connection.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  4. GOOGLE OTP VERIFY & RESEND
  // ═══════════════════════════════════════════════════════════════

  const handleGoogleVerifyOtp = async (codeOverride) => {
    if (isVerifyingRef.current) return;
    const raw = codeOverride !== undefined ? codeOverride : otpDigits.join('');
    const code = String(raw).replace(/\D/g, '').trim();
    if (code.length !== 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setOtpError('');
    isVerifyingRef.current = true;
    setIsVerifyingOtp(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/google-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: googleEmail.trim().toLowerCase(),
          otp: code,
          tempAuthToken: googleTempToken
        })
      });

      if (res.status === 502 || res.status === 503 || res.status === 504) {
        setOtpError('Authentication server is unavailable. Please try again.');
        return;
      }

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || '✨ Google account verified successfully!');
        handleSuccessfulAuth(data.user, data.token);
      } else {
        setOtpError(data.detail || data.message || 'Invalid verification code. Please try again.');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      console.error('Google verify OTP error:', err);
      setOtpError('Authentication server is unavailable. Please try again.');
    } finally {
      isVerifyingRef.current = false;
      setIsVerifyingOtp(false);
    }
  };

  const handleGoogleResendOtp = async () => {
    if (!googleEmail || cooldownSeconds > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setOtpError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/google-resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: googleEmail.trim().toLowerCase() })
      });

      if (res.status === 502 || res.status === 503 || res.status === 504) {
        setOtpError('Authentication server is unavailable. Please try again.');
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setCooldownSeconds(data.cooldownSeconds || 30);
        showToast(`📩 ${data.message || 'New verification code sent.'}`);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setOtpError(data.message || data.detail || 'Failed to resend verification code.');
        if (data.cooldownSeconds) setCooldownSeconds(data.cooldownSeconds);
      }
    } catch (err) {
      console.error('Google resend OTP error:', err);
      setOtpError('Authentication server is unavailable. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  5. OTP INPUT HELPERS
  // ═══════════════════════════════════════════════════════════════

  const handleOtpDigitChange = (index, value, otpType) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError('');

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5 && newDigits.every(d => d !== '')) {
      const completeCode = newDigits.join('');
      if (!isVerifyingRef.current) {
        if (otpType === 'register') {
          handleRegisterVerifyOtp(completeCode);
        } else if (otpType === 'google') {
          handleGoogleVerifyOtp(completeCode);
        }
      }
    }
  };

  const handleOtpKeyDown = (index, e, otpType) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const code = otpDigits.join('');
      if (code.length === 6 && !isVerifyingRef.current) {
        if (otpType === 'register') handleRegisterVerifyOtp(code);
        else if (otpType === 'google') handleGoogleVerifyOtp(code);
      }
    }
  };

  const handleOtpPaste = (e, otpType) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      setOtpError('');
      
      const focusIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[focusIdx]?.focus();

      if (pasted.length === 6) {
        if (otpType === 'register') handleRegisterVerifyOtp(pasted);
        else if (otpType === 'google') handleGoogleVerifyOtp(pasted);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  6. SCREEN RENDERERS
  // ═══════════════════════════════════════════════════════════════

  // ─── SCREEN 1: SIGN IN (Default First Screen) ───
  const renderSigninScreen = () => (
    <motion.div
      key="signin"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="login-card-header" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
        <h2 className="login-welcome-title">Welcome to Darshan Journey</h2>
        <p className="login-welcome-subtitle">Sign in with your username or email</p>
      </div>

      <form onSubmit={handleNormalSignin}>
        <motion.div
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
        >
          {/* Username / Email Field */}
          <motion.div className="login-field-group" variants={formItemVariants}>
            <label className="login-field-label">Username or Email</label>
            <div className="login-input-relative">
              <User size={18} className="login-input-icon-left" />
              <input
                type="text"
                required
                placeholder="Enter username or email address"
                value={signinIdentifier}
                onChange={(e) => { setSigninIdentifier(e.target.value); setFormError(''); }}
                className="login-styled-input"
                autoFocus
                autoComplete="username"
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div className="login-field-group" variants={formItemVariants}>
            <label className="login-field-label">Password</label>
            <div className="login-input-relative">
              <Lock size={18} className="login-input-icon-left" />
              <input
                type={showSigninPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={signinPassword}
                onChange={(e) => { setSigninPassword(e.target.value); setFormError(''); }}
                className="login-styled-input"
                style={{ padding: '0.72rem 2.5rem 0.72rem 2.6rem' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowSigninPassword(!showSigninPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#A38C82'
                }}
              >
                {showSigninPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </motion.div>

          {formError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 0.85rem', borderRadius: '10px',
              background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)',
              color: '#DC2626', fontSize: '0.82rem', lineHeight: 1.4
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          {/* Sign In Button */}
          <motion.button
            type="submit"
            className="login-submit-pill-btn"
            disabled={isSigningIn}
            variants={buttonVariants}
            style={{ opacity: isSigningIn ? 0.6 : 1, marginTop: '0.25rem' }}
          >
            {isSigningIn ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Signing In...
              </span>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </motion.button>

          {/* New to Darshan Journey? Create Account Option */}
          <div style={{ textAlign: 'center', marginTop: '0.35rem', fontSize: '0.85rem', color: '#6E5351' }}>
            New to Darshan Journey?{' '}
            <button
              type="button"
              onClick={() => { setFlow(FLOW.REGISTER); clearAllErrors(); }}
              style={{
                background: 'none', border: 'none', color: '#8C6036',
                fontWeight: 700, cursor: 'pointer', padding: 0,
                textDecoration: 'underline', textUnderlineOffset: '2px'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Divider */}
          <div className="login-divider-row" style={{ margin: '0.4rem 0' }}>
            <div className="login-divider-line" />
            <span className="login-divider-text">OR</span>
            <div className="login-divider-line" />
          </div>

          {/* Continue with Google Button */}
          <motion.button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            variants={buttonVariants}
            style={{ width: '100%', opacity: isGoogleLoading ? 0.7 : 1 }}
          >
            {isGoogleLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Connecting with Google...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {googleError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 0.85rem', borderRadius: '10px',
              background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)',
              color: '#DC2626', fontSize: '0.82rem', lineHeight: 1.4
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{googleError}</span>
            </div>
          )}
        </motion.div>
      </form>
    </motion.div>
  );

  // ─── SCREEN 2: CREATE ACCOUNT (REGISTRATION FORM) ───
  const renderRegisterScreen = () => (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="login-toggle-link"
        onClick={() => { setFlow(FLOW.SIGNIN); clearAllErrors(); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#8C6036', fontWeight: 600 }}
      >
        <ArrowLeft size={14} /> Back to Sign In
      </button>

      <div className="login-card-header" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
        <h2 className="login-welcome-title">Create Devotee Account</h2>
        <p className="login-welcome-subtitle">
          Register with your details to access sacred temple pilgrimage services
        </p>
      </div>

      <form onSubmit={handleRegisterSubmit}>
        <motion.div
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
        >
          {/* Full Name */}
          <motion.div className="login-field-group" variants={formItemVariants}>
            <label className="login-field-label">Full Name</label>
            <div className="login-input-relative">
              <User size={17} className="login-input-icon-left" />
              <input
                type="text"
                required
                placeholder="Devotee Full Name"
                value={regForm.fullName}
                onChange={(e) => {
                  setRegForm({ ...regForm, fullName: e.target.value });
                  if (regErrors.fullName) setRegErrors({ ...regErrors, fullName: null });
                }}
                className="login-styled-input"
                style={{ padding: '0.65rem 0.85rem 0.65rem 2.4rem' }}
              />
            </div>
            {regErrors.fullName && (
              <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600 }}>{regErrors.fullName}</span>
            )}
          </motion.div>

          {/* Username */}
          <motion.div className="login-field-group" variants={formItemVariants}>
            <label className="login-field-label">Username</label>
            <div className="login-input-relative">
              <AtSign size={17} className="login-input-icon-left" />
              <input
                type="text"
                required
                placeholder="Choose username (e.g. rajie_28)"
                value={regForm.username}
                onChange={(e) => {
                  setRegForm({ ...regForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') });
                  if (regErrors.username) setRegErrors({ ...regErrors, username: null });
                }}
                className="login-styled-input"
                style={{ padding: '0.65rem 0.85rem 0.65rem 2.4rem' }}
              />
            </div>
            {regErrors.username && (
              <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600 }}>{regErrors.username}</span>
            )}
          </motion.div>

          {/* Email Address */}
          <motion.div className="login-field-group" variants={formItemVariants}>
            <label className="login-field-label">Email Address</label>
            <div className="login-input-relative">
              <Mail size={17} className="login-input-icon-left" />
              <input
                type="email"
                required
                placeholder="devotee@example.com"
                value={regForm.email}
                onChange={(e) => {
                  setRegForm({ ...regForm, email: e.target.value });
                  if (regErrors.email) setRegErrors({ ...regErrors, email: null });
                }}
                className="login-styled-input"
                style={{ padding: '0.65rem 0.85rem 0.65rem 2.4rem' }}
              />
            </div>
            {regErrors.email && (
              <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600 }}>{regErrors.email}</span>
            )}
          </motion.div>

          {/* Mobile Number */}
          <motion.div className="login-field-group" variants={formItemVariants}>
            <label className="login-field-label">Mobile Number</label>
            <div className="login-input-relative">
              <Phone size={17} className="login-input-icon-left" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={regForm.mobile}
                onChange={(e) => {
                  setRegForm({ ...regForm, mobile: e.target.value });
                  if (regErrors.mobile) setRegErrors({ ...regErrors, mobile: null });
                }}
                className="login-styled-input"
                style={{ padding: '0.65rem 0.85rem 0.65rem 2.4rem' }}
              />
            </div>
            {regErrors.mobile && (
              <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600 }}>{regErrors.mobile}</span>
            )}
          </motion.div>

          {/* Password */}
          <motion.div className="login-field-group" variants={formItemVariants}>
            <label className="login-field-label">Password</label>
            <div className="login-input-relative">
              <Lock size={17} className="login-input-icon-left" />
              <input
                type={showRegPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters"
                value={regForm.password}
                onChange={(e) => {
                  setRegForm({ ...regForm, password: e.target.value });
                  if (regErrors.password) setRegErrors({ ...regErrors, password: null });
                }}
                className="login-styled-input"
                style={{ padding: '0.65rem 2.4rem 0.65rem 2.4rem' }}
              />
              <button
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#A38C82'
                }}
              >
                {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {regErrors.password && (
              <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600 }}>{regErrors.password}</span>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div className="login-field-group" variants={formItemVariants}>
            <label className="login-field-label">Confirm Password</label>
            <div className="login-input-relative">
              <Lock size={17} className="login-input-icon-left" />
              <input
                type={showRegConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={regForm.confirmPassword}
                onChange={(e) => {
                  setRegForm({ ...regForm, confirmPassword: e.target.value });
                  if (regErrors.confirmPassword) setRegErrors({ ...regErrors, confirmPassword: null });
                }}
                className="login-styled-input"
                style={{ padding: '0.65rem 2.4rem 0.65rem 2.4rem' }}
              />
              <button
                type="button"
                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#A38C82'
                }}
              >
                {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {regErrors.confirmPassword && (
              <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600 }}>{regErrors.confirmPassword}</span>
            )}
          </motion.div>

          {/* Terms Checkbox */}
          <motion.div variants={formItemVariants} style={{ marginTop: '0.1rem' }}>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              fontSize: '0.8rem', color: '#6E5351', cursor: 'pointer', lineHeight: 1.4
            }}>
              <input
                type="checkbox"
                checked={regForm.termsAccepted || false}
                onChange={(e) => {
                  setRegForm({ ...regForm, termsAccepted: e.target.checked });
                  if (regErrors.terms) setRegErrors({ ...regErrors, terms: null });
                }}
                style={{
                  marginTop: '0.15rem', accentColor: '#C8A96A', width: '15px', height: '15px', cursor: 'pointer'
                }}
              />
              <span>
                I agree to the <span style={{ color: '#8C6036', fontWeight: 600 }}>Terms & Conditions</span> and <span style={{ color: '#8C6036', fontWeight: 600 }}>Privacy Policy</span>
              </span>
            </label>
            {regErrors.terms && (
              <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>{regErrors.terms}</span>
            )}
          </motion.div>

          {formError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.65rem 0.85rem', borderRadius: '10px',
              background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)',
              color: '#DC2626', fontSize: '0.82rem', lineHeight: 1.4
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          <motion.button
            type="submit"
            className="login-submit-pill-btn"
            disabled={isSendingOtp}
            variants={buttonVariants}
            style={{ marginTop: '0.35rem', opacity: isSendingOtp ? 0.6 : 1 }}
          >
            {isSendingOtp ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Sending Verification Code...
              </span>
            ) : (
              <>Create Account & Send Code <ArrowRight size={18} /></>
            )}
          </motion.button>

          <div style={{ textAlign: 'center', marginTop: '0.35rem', fontSize: '0.82rem', color: '#6E5351' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { setFlow(FLOW.SIGNIN); clearAllErrors(); }}
              style={{
                background: 'none', border: 'none', color: '#8C6036',
                fontWeight: 700, cursor: 'pointer', padding: 0,
                textDecoration: 'underline', textUnderlineOffset: '2px'
              }}
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );

  // ─── SCREEN 3: CREATE ACCOUNT OTP VERIFICATION ───
  const renderRegisterOtpScreen = () => (
    <motion.div
      key="register-otp"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="login-toggle-link"
        onClick={() => { setFlow(FLOW.REGISTER); setOtpError(''); setOtpDigits(['','','','','','']); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#8C6036', fontWeight: 600 }}
      >
        <ArrowLeft size={14} /> Change Details
      </button>

      <div className="login-card-header" style={{ textAlign: 'left', marginBottom: '0.75rem' }}>
        <h2 className="login-welcome-title">Verify Your Email</h2>
        <p className="login-welcome-subtitle">
          Enter the 6-digit code sent to activate your account:
        </p>
        <p style={{
          color: '#8C6036', fontWeight: 700, fontSize: '0.96rem',
          marginTop: '0.25rem', wordBreak: 'break-all', letterSpacing: '0.5px'
        }}>
          {maskEmail(regForm.email)}
        </p>
      </div>

      <motion.div
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        {/* 6-Digit OTP Keypad */}
        <motion.div variants={formItemVariants}>
          <div style={{
            display: 'flex', gap: '0.5rem', justifyContent: 'center',
            margin: '0.5rem 0 0.25rem'
          }}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => otpInputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpDigitChange(idx, e.target.value, 'register')}
                onKeyDown={(e) => handleOtpKeyDown(idx, e, 'register')}
                onPaste={idx === 0 ? (e) => handleOtpPaste(e, 'register') : undefined}
                disabled={isVerifyingOtp}
                className="login-otp-digit-box"
              />
            ))}
          </div>
        </motion.div>

        {(otpError || formError) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 0.85rem', borderRadius: '10px',
            background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)',
            color: '#DC2626', fontSize: '0.82rem', lineHeight: 1.4
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{otpError || formError}</span>
          </div>
        )}

        <motion.button
          type="button"
          className="login-submit-pill-btn"
          onClick={() => handleRegisterVerifyOtp()}
          disabled={isVerifyingOtp || otpDigits.some(d => !d)}
          variants={buttonVariants}
          style={{ opacity: isVerifyingOtp || otpDigits.some(d => !d) ? 0.6 : 1 }}
        >
          {isVerifyingOtp ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Activating Account...
            </span>
          ) : (
            <><ShieldCheck size={18} /> Verify & Activate Account</>
          )}
        </motion.button>

        {/* Resend Cooldown */}
        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6E5351' }}>
          {cooldownSeconds > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              Resend code in <strong style={{ color: '#8C6036' }}>{cooldownSeconds}s</strong>
            </span>
          ) : (
            <span>
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleRegisterResendOtp}
                disabled={isSendingOtp}
                style={{
                  background: 'none', border: 'none', color: '#8C6036',
                  fontWeight: 700, cursor: 'pointer', padding: 0,
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.82rem', textDecoration: 'underline',
                  textUnderlineOffset: '2px'
                }}
              >
                <RefreshCw size={12} /> Resend Code
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  // ─── SCREEN 4: GOOGLE ACCOUNT OTP VERIFICATION ───
  const renderGoogleOtpScreen = () => (
    <motion.div
      key="google-otp"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="login-toggle-link"
        onClick={() => { setFlow(FLOW.SIGNIN); setOtpError(''); setOtpDigits(['','','','','','']); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#8C6036', fontWeight: 600 }}
      >
        <ArrowLeft size={14} /> Back to Sign In
      </button>

      <div className="login-card-header" style={{ textAlign: 'left', marginBottom: '0.75rem' }}>
        <h2 className="login-welcome-title">Enter Verification Code</h2>
        <p className="login-welcome-subtitle">
          A 6-digit verification code has been dispatched to your Google email:
        </p>
        <p style={{
          color: '#8C6036', fontWeight: 700, fontSize: '0.96rem',
          marginTop: '0.25rem', wordBreak: 'break-all', letterSpacing: '0.5px',
          display: 'flex', alignItems: 'center', gap: '0.45rem'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {maskEmail(googleEmail)}
        </p>
      </div>

      <motion.div
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
      >
        {/* 6-Digit OTP Keypad */}
        <motion.div variants={formItemVariants}>
          <div style={{
            display: 'flex', gap: '0.5rem', justifyContent: 'center',
            margin: '0.5rem 0 0.25rem'
          }}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => otpInputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpDigitChange(idx, e.target.value, 'google')}
                onKeyDown={(e) => handleOtpKeyDown(idx, e, 'google')}
                onPaste={idx === 0 ? (e) => handleOtpPaste(e, 'google') : undefined}
                disabled={isVerifyingOtp}
                className="login-otp-digit-box"
              />
            ))}
          </div>
        </motion.div>

        {(otpError || formError || googleError) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 0.85rem', borderRadius: '10px',
            background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.25)',
            color: '#DC2626', fontSize: '0.82rem', lineHeight: 1.4
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{otpError || formError || googleError}</span>
          </div>
        )}

        <motion.button
          type="button"
          className="login-submit-pill-btn"
          onClick={() => handleGoogleVerifyOtp()}
          disabled={isVerifyingOtp || otpDigits.some(d => !d)}
          variants={buttonVariants}
          style={{ opacity: isVerifyingOtp || otpDigits.some(d => !d) ? 0.6 : 1 }}
        >
          {isVerifyingOtp ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Verifying Code...
            </span>
          ) : (
            <><ShieldCheck size={18} /> Verify</>
          )}
        </motion.button>

        {/* Resend Cooldown */}
        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6E5351' }}>
          {cooldownSeconds > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              Resend code in <strong style={{ color: '#8C6036' }}>{cooldownSeconds}s</strong>
            </span>
          ) : (
            <span>
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleGoogleResendOtp}
                disabled={isSendingOtp}
                style={{
                  background: 'none', border: 'none', color: '#8C6036',
                  fontWeight: 700, cursor: 'pointer', padding: 0,
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.82rem', textDecoration: 'underline',
                  textUnderlineOffset: '2px'
                }}
              >
                <RefreshCw size={12} /> Resend Code
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  // ─── SCREEN 5: POST-LOGIN SPLASH SCREEN (2-Second Sacred Loading) ───
  const renderSplashScreen = () => {
    const devoteeName = authenticatedDevotee?.name || authenticatedDevotee?.fullName || user?.name || user?.fullName || 'Devotee';
    const devoteeAvatar = authenticatedDevotee?.avatar || user?.avatar || devoteeName.charAt(0).toUpperCase();

    return (
      <div className="splash-screen-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #140C08 0%, #22120E 50%, #180D0A 100%)',
        overflow: 'hidden',
        color: '#F7EFE6'
      }}>
        {/* Background Temple Ambience Layer */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${templeNightBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.38,
          zIndex: 1,
          filter: 'brightness(0.7) saturate(1.2)'
        }} />

        {/* Ambient Golden Radial Glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, rgba(200, 169, 106, 0.08) 40%, rgba(0,0,0,0) 70%)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />

        <GoldParticles />

        <motion.div 
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '560px',
            width: '90%',
            padding: '3rem 2.5rem',
            borderRadius: '28px',
            background: 'linear-gradient(180deg, rgba(34, 20, 16, 0.94) 0%, rgba(22, 13, 10, 0.97) 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 35px rgba(212, 175, 55, 0.22)',
            backdropFilter: 'blur(12px)',
            margin: '0 1rem'
          }}
        >
          {/* Glowing Divine Logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6, type: 'spring' }}
            style={{
              position: 'relative',
              width: '104px',
              height: '104px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2.5px solid #D4AF37',
              boxShadow: '0 0 25px rgba(212, 175, 55, 0.5), inset 0 0 15px rgba(212, 175, 55, 0.3)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1A0E0A'
            }}
          >
            {devoteeAvatar && devoteeAvatar.length > 2 && (devoteeAvatar.startsWith('http') || devoteeAvatar.startsWith('data:')) ? (
              <img src={devoteeAvatar} alt={devoteeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={darshanLogo} alt="Darshan Journey Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </motion.div>

          <h2 style={{
            fontFamily: 'Cinzel, Georgia, serif',
            fontSize: '2.2rem',
            color: '#D4AF37',
            marginBottom: '0.35rem',
            fontWeight: 700,
            letterSpacing: '1.5px',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)'
          }}>
            Darshan Journey
          </h2>

          <p style={{
            color: '#C8A96A',
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            marginBottom: '1.25rem',
            fontWeight: 600
          }}>
            Sacred Pilgrimage Verified
          </p>

          <div style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            marginBottom: '1.25rem'
          }} />

          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.05rem',
            lineHeight: '1.7',
            color: '#F7EFE6',
            marginBottom: '1.5rem',
            fontWeight: 400
          }}>
            🙏 <strong style={{ color: '#E8D2A0' }}>Sacred Welcome, {devoteeName}!</strong><br />
            Your divine connection to India's holiest temples is authenticated. Entering sacred home...
          </p>

          {/* 2-Second Golden Loading Bar */}
          <div style={{
            width: '100%',
            maxWidth: '280px',
            height: '4px',
            background: 'rgba(212, 175, 55, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
            margin: '0.5rem auto 1.75rem'
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'linear' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #D4AF37, #FDF8F0, #D4AF37)',
                borderRadius: '4px'
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(212, 175, 55, 0.65)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExploreClick}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #C8A96A 50%, #B38E42 100%)',
              color: '#1A0E0A',
              border: 'none',
              borderRadius: '50px',
              padding: '0.85rem 3rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              letterSpacing: '0.6px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.4), 0 0 15px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.25s ease'
            }}
          >
            Explore Now <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    );
  };

  // If viewing Splash screen, render full screen splash
  if (flow === FLOW.SPLASH) {
    return renderSplashScreen();
  }

  // ═══════════════════════════════════════════════════════════════
  //  7. MAIN AUTH PAGE LAYOUT
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="home-website-wrapper login-page-root">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999999,
              background: 'linear-gradient(135deg, #2E1C17, #4A2C28)',
              color: '#F7EFE6',
              padding: '0.85rem 1.65rem',
              borderRadius: '50px',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(212, 175, 55, 0.3)',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <Sparkles size={16} color="#D4AF37" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar 
        activePage="login"
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

      {/* Main Authentication Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '7rem 1.25rem 4rem',
        position: 'relative',
        zIndex: 2,
        pointerEvents: 'auto'
      }}>
        {/* Background Ambience */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${templeNightBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
          zIndex: 0,
          filter: 'brightness(0.6)',
          pointerEvents: 'none'
        }} />

        <GoldParticles />

        {/* Auth Card */}
        <div className="login-glass-card" style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
          {/* Top Temple Logo & Emblem */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '1rem',
            position: 'relative',
            zIndex: 11
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #C8A96A',
              boxShadow: '0 4px 15px rgba(52, 31, 29, 0.15)',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1C120D'
            }}>
              <img src={darshanLogo} alt="Darshan Journey" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1 style={{
              fontFamily: 'Cinzel, Georgia, serif',
              fontSize: '1.45rem',
              color: '#341F1D',
              margin: 0,
              fontWeight: 700,
              letterSpacing: '0.8px'
            }}>
              Darshan Journey
            </h1>
            <p style={{
              color: '#8C6036',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '1.8px',
              margin: '0.15rem 0 0',
              fontWeight: 600
            }}>
              Sacred Pilgrimage & Puja
            </p>
          </div>

          <div style={{
            width: '60px',
            height: '1.5px',
            background: 'linear-gradient(90deg, transparent, #C8A96A, transparent)',
            margin: '0.5rem auto 1.25rem'
          }} />

          {/* Active Flow Screen */}
          <AnimatePresence mode="wait">
            {flow === FLOW.SIGNIN && renderSigninScreen()}
            {flow === FLOW.REGISTER && renderRegisterScreen()}
            {flow === FLOW.REGISTER_OTP && renderRegisterOtpScreen()}
            {flow === FLOW.GOOGLE_OTP && renderGoogleOtpScreen()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
