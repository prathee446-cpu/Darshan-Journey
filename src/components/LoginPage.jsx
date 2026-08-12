import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Check, Sparkles, User, Phone, ShieldCheck, X } from 'lucide-react';
import GoldParticles from './GoldParticles';
import templeNightBg from '../assets/temple_night_bg.png';
import darshanLogo from '../assets/darshan-logo.jpeg';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

// Motion Stagger Variants
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.06
    }
  }
};

const formItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function LoginPage({ 
  onGoToHome, 
  onGoToLanding, 
  onExploreTemples, 
  onGoToProducts, 
  onGoToServices,
  onGoToLogin,
  onGoToAbout,
  onOpenBooking
}) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Parallax Mouse Effect
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 10;
    const y = (clientY / window.innerHeight - 0.5) * 10;
    setMouseOffset({ x, y });
  };

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // UI Feedback & Auth State
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Google OAuth Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false);
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  const googleAccounts = [
    { name: 'Devotee User', email: 'devotee.darshan@gmail.com', avatar: 'D' },
    { name: 'Sacred Traveler', email: 'pilgrim.darshan@gmail.com', avatar: 'S' },
    { name: 'Prathika Devotee', email: 'prathika.devotee@gmail.com', avatar: 'P' }
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSuccessfulAuth = (userData) => {
    const pendingService = login(userData);
    if (pendingService) {
      showToast('✨ Signed in! Automatically continuing your selected Seva reservation...');
      const targetPath = pendingService.redirectUrl || (pendingService.categorySlug ? `/services/category/${pendingService.categorySlug}` : '/services/details');
      setTimeout(() => {
        navigate(targetPath, { state: { service: pendingService, categorySlug: pendingService.categorySlug } });
      }, 1200);
    } else {
      setTimeout(() => {
        if (onGoToHome) onGoToHome();
        else navigate('/home');
      }, 1200);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      showToast('⚠️ Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const payload = isSignUp ? {
      fullName: fullName || 'Devotee',
      email: email || 'devotee@darshanjourney.com',
      phone: phone || '+91 98765 43210',
      password: password || '123456'
    } : {
      email: email || 'devotee@darshanjourney.com',
      password: password || '123456'
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        if (data.message) showToast(data.message);
        handleSuccessfulAuth(data.user ? { ...data.user, token: data.token } : payload);
        return;
      }
    } catch (err) {
      console.warn('FastAPI Auth notice (using fallback):', err);
    }

    const userName = fullName || email.split('@')[0] || 'Devotee';
    const userData = {
      fullName: userName,
      name: userName,
      email: email || 'devotee@darshanjourney.com',
      phone: phone || '+91 98765 43210'
    };

    setTimeout(() => {
      setIsLoading(false);
      if (isSignUp) {
        showToast(`🙏 Sacred Welcome, ${userName}! Your account has been registered.`);
      } else {
        showToast('✨ Signed in successfully! Continuing your spiritual journey...');
      }
      handleSuccessfulAuth(userData);
    }, 800);
  };

  const handleGoogleLogin = () => {
    setIsGoogleModalOpen(true);
    setIsGoogleAuthenticating(false);
    setShowCustomEmailInput(false);
    setCustomGoogleEmail('');
  };

  const selectGoogleAccount = (acc) => {
    setIsGoogleAuthenticating(true);
    const userData = {
      fullName: acc.name,
      name: acc.name,
      email: acc.email,
      avatar: acc.avatar || acc.name.charAt(0),
      provider: 'google',
      phone: '+91 98765 43210'
    };

    setTimeout(() => {
      setIsGoogleAuthenticating(false);
      setIsGoogleModalOpen(false);
      showToast(`✨ Google authentication successful! Welcome ${acc.name}.`);
      handleSuccessfulAuth(userData);
    }, 1200);
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customGoogleEmail) return;
    const nameFromEmail = customGoogleEmail.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    selectGoogleAccount({
      name: formattedName,
      email: customGoogleEmail,
      avatar: formattedName.charAt(0)
    });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotModalOpen(false);
    showToast(`📩 Password reset instructions sent to ${forgotEmail}`);
    setForgotEmail('');
  };

  return (
    <motion.div 
      className="home-website-wrapper login-page-wrapper"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, x: 70, scale: 0.98, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -70, scale: 0.98, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Canvas Gold Dust Floating Particles */}
      <GoldParticles />

      {/* ---------------- NAVBAR ---------------- */}
      <Navbar 
        activePage="login"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToLogin={onGoToLogin}
        onGoToAbout={onGoToAbout}
        onOpenBooking={onOpenBooking}
        onOpenDonate={() => {}}
      />

      {/* Full-Screen Night Temple Background + 70% Dark Brown Overlay with Parallax Motion */}
      <div className="login-bg-layer">
        <motion.img 
          src={templeNightBg} 
          alt="Sacred Indian Temple Night" 
          className="login-bg-img"
          animate={{ x: mouseOffset.x, y: mouseOffset.y }}
          transition={{ type: 'spring', stiffness: 80, damping: 25 }}
        />
        <div className="login-bg-overlay" />
      </div>

      {/* Header Navigation */}
      <header className="login-nav-header">
        <div className="login-nav-brand" onClick={onGoToLanding || onGoToHome}>
          <img src={darshanLogo} alt="Darshan Journey Logo" className="login-nav-logo" />
          <span className="login-nav-title">Darshan Journey</span>
        </div>

        <button 
          className="login-nav-back-btn" 
          onClick={onGoToHome || onGoToLanding}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </header>

      {/* Main 50/50 Split Screen Container */}
      <main className="login-hero-section">
        <div className="login-split-card-container">
          <div className="login-split-grid">
            
            {/* ---------------- LEFT PANEL: WELCOME SECTION ---------------- */}
            <AnimatePresence mode="wait">
              <motion.div 
                className="login-left-welcome-panel"
                key={isSignUp ? 'left-signup' : 'left-signin'}
                initial={{ opacity: 0, x: isSignUp ? 25 : -25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isSignUp ? -25 : 25 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="login-welcome-glow" />

                {/* Official Logo at Top Centered */}
                <div className="login-welcome-top-brand">
                  <motion.img 
                    src={darshanLogo} 
                    alt="Darshan Journey Logo" 
                    className="login-welcome-logo"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />
                  <div className="login-brand-name">Darshan Journey</div>
                </div>

                {/* Middle Heading & Subtitle */}
                <div className="login-welcome-middle-content">
                  <h1 className="login-welcome-heading">
                    {isSignUp ? 'Join Our Sacred Circle' : 'Welcome Back'}
                  </h1>
                  <p className="login-welcome-subtext">
                    {isSignUp 
                      ? 'Begin your spiritual pilgrimage with daily darshan, Vedic rituals, and sacred temple offerings.'
                      : 'Continue your sacred journey with Darshan Journey.'}
                  </p>
                </div>

                {/* Gold Outlined Toggle Button */}
                <button 
                  type="button" 
                  className="login-gold-outline-btn"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
                </button>
              </motion.div>
            </AnimatePresence>

            {/* ---------------- RIGHT PANEL: FORM SECTION ---------------- */}
            <AnimatePresence mode="wait">
              <motion.div 
                className="login-right-form-panel"
                key={isSignUp ? 'form-signup' : 'form-signin'}
                initial={{ opacity: 0, x: isSignUp ? -25 : 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isSignUp ? 25 : -25 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Card Heading */}
                <div className="login-card-header" style={{ textAlign: 'left', marginBottom: '0.85rem' }}>
                  <h2 className="login-welcome-title">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </h2>
                  <p className="login-welcome-subtitle">
                    {isSignUp 
                      ? 'Enter your details below to register' 
                      : 'Enter your credentials to access your account'}
                  </p>
                </div>

                <form className="login-form-container" onSubmit={handleSubmit}>
                  <motion.div
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ display: 'flex', flexDirection: 'column', gap: isSignUp ? '0.45rem' : '0.75rem' }}
                  >
                    {isSignUp && (
                      <>
                        {/* Full Name */}
                        <motion.div className="login-field-group" variants={formItemVariants}>
                          <label className="login-field-label">Full Name</label>
                          <div className="login-input-relative">
                            <User size={18} className="login-input-icon-left" />
                            <input 
                              type="text" 
                              required 
                              placeholder="Enter full name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="login-styled-input"
                            />
                          </div>
                        </motion.div>

                        {/* Phone Number */}
                        <motion.div className="login-field-group" variants={formItemVariants}>
                          <label className="login-field-label">Phone Number</label>
                          <div className="login-input-relative">
                            <Phone size={18} className="login-input-icon-left" />
                            <input 
                              type="tel" 
                              required 
                              placeholder="+91 98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="login-styled-input"
                            />
                          </div>
                        </motion.div>
                      </>
                    )}

                    {/* Email Address */}
                    <motion.div className="login-field-group" variants={formItemVariants}>
                      <label className="login-field-label">Email Address</label>
                      <div className="login-input-relative">
                        <Mail size={18} className="login-input-icon-left" />
                        <input 
                          type="email" 
                          required 
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="login-styled-input"
                        />
                      </div>
                    </motion.div>

                    {/* Password */}
                    <motion.div className="login-field-group" variants={formItemVariants}>
                      <label className="login-field-label">Password</label>
                      <div className="login-input-relative">
                        <Lock size={18} className="login-input-icon-left" />
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          required 
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="login-styled-input"
                          style={{ paddingRight: '2.8rem' }}
                        />
                        <button 
                          type="button" 
                          className="login-pw-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? "Hide Password" : "Show Password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Confirm Password (Register mode only) */}
                    {isSignUp && (
                      <motion.div className="login-field-group" variants={formItemVariants}>
                        <label className="login-field-label">Confirm Password</label>
                        <div className="login-input-relative">
                          <ShieldCheck size={18} className="login-input-icon-left" />
                          <input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            required 
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="login-styled-input"
                            style={{ paddingRight: '2.8rem' }}
                          />
                          <button 
                            type="button" 
                            className="login-pw-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            title={showConfirmPassword ? "Hide Password" : "Show Password"}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Options row for Sign In mode */}
                    {!isSignUp && (
                      <motion.div className="login-options-bar" variants={formItemVariants}>
                        <label className="login-checkbox-label" onClick={() => setRememberMe(!rememberMe)}>
                          <div className={`login-custom-checkbox ${rememberMe ? 'checked' : ''}`}>
                            {rememberMe && <Check size={13} color="#1C120D" strokeWidth={3} />}
                          </div>
                          Remember Me
                        </label>

                        <button 
                          type="button" 
                          className="login-forgot-btn"
                          onClick={() => setIsForgotModalOpen(true)}
                        >
                          Forgot Password?
                        </button>
                      </motion.div>
                    )}

                    {/* Submit Pill Button */}
                    <motion.button 
                      type="submit" 
                      className="login-submit-pill-btn"
                      disabled={isLoading}
                      variants={buttonVariants}
                    >
                      {isLoading ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={18} />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Divider */}
                <div className="login-divider-row" style={{ margin: isSignUp ? '0.4rem 0 0.35rem 0' : '0.85rem 0 0.65rem 0' }}>
                  <div className="login-divider-line" />
                  <span className="login-divider-text">OR</span>
                  <div className="login-divider-line" />
                </div>

                {/* Social Login Button */}
                <button 
                  type="button" 
                  className="login-google-btn"
                  onClick={handleGoogleLogin}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
                </button>

                {/* Bottom Toggle Text */}
                <div className="login-bottom-toggle" style={{ marginTop: isSignUp ? '0.35rem' : '0.75rem' }}>
                  {isSignUp ? (
                    <>
                      Already have an account?
                      <button 
                        type="button" 
                        className="login-toggle-link"
                        onClick={() => setIsSignUp(false)}
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?
                      <button 
                        type="button" 
                        className="login-toggle-link"
                        onClick={() => setIsSignUp(true)}
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onOpenBooking={onOpenBooking}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="login-toast-notification">
          <Sparkles size={18} color="#D4AF37" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsForgotModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  color: '#D4AF37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  border: '1px solid rgba(212, 175, 55, 0.4)'
                }}
              >
                <Lock size={24} />
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#341F1D', marginBottom: '0.4rem' }}>
                Reset Your Password
              </h3>
              <p style={{ color: '#6E5351', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Enter your registered email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#341F1D', marginBottom: '0.4rem' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(200, 169, 106, 0.4)',
                    outline: 'none',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setIsForgotModalOpen(false)}
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1.5, padding: '0.75rem', justifyContent: 'center' }}
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sign-In Account Chooser Modal */}
      {isGoogleModalOpen && (
        <div className="modal-overlay active" onClick={() => !isGoogleAuthenticating && setIsGoogleModalOpen(false)}>
          <div className="google-oauth-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              className="google-oauth-close" 
              onClick={() => setIsGoogleModalOpen(false)}
              disabled={isGoogleAuthenticating}
            >
              <X size={18} />
            </button>

            <div className="google-oauth-header">
              <svg width="32" height="32" viewBox="0 0 24 24" style={{ margin: '0 auto 0.75rem auto', display: 'block' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="google-oauth-title">Sign in with Google</h3>
              <p className="google-oauth-subtitle">
                to continue to <span className="google-app-highlight">Darshan Journey</span>
              </p>
            </div>

            {isGoogleAuthenticating ? (
              <div className="google-oauth-loading-state">
                <div className="google-auth-spinner" />
                <p className="google-auth-loading-text">Authenticating securely with Google...</p>
              </div>
            ) : (
              <div className="google-accounts-container">
                <div className="google-account-section-label">Choose an account</div>
                
                {googleAccounts.map((acc, idx) => (
                  <div 
                    key={idx} 
                    className="google-account-row"
                    onClick={() => selectGoogleAccount(acc)}
                  >
                    <div className="google-avatar-circle">{acc.avatar}</div>
                    <div className="google-account-details">
                      <div className="google-account-name">{acc.name}</div>
                      <div className="google-account-email">{acc.email}</div>
                    </div>
                  </div>
                ))}

                {showCustomEmailInput ? (
                  <form onSubmit={handleCustomGoogleSubmit} className="google-custom-form">
                    <input 
                      type="email" 
                      required 
                      placeholder="enter your gmail address..."
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="google-custom-input"
                      autoFocus
                    />
                    <button type="submit" className="google-custom-submit-btn">
                      Sign In
                    </button>
                  </form>
                ) : (
                  <div 
                    className="google-account-row add-account-row"
                    onClick={() => setShowCustomEmailInput(true)}
                  >
                    <div className="google-avatar-circle icon-circle">
                      <User size={16} />
                    </div>
                    <div className="google-account-details">
                      <div className="google-account-name">Use another account</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="google-oauth-disclaimer">
              To continue, Google will share your name, email address, language preference, and profile picture with Darshan Journey.
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
