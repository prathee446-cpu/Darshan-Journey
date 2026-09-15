import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, ChevronDown, ChevronUp, SlidersHorizontal, Lock } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'darshan_cookie_consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [preferenceCookies, setPreferenceCookies] = useState(false);

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!storedConsent) {
        // Slight delay for smooth entrance animation after page load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Unable to access localStorage for cookie consent', e);
    }
  }, []);

  const saveConsent = (consentData) => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consentData));
    } catch (e) {
      console.warn('Unable to save cookie consent to localStorage', e);
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      preferences: true,
      status: 'accepted_all',
      timestamp: new Date().toISOString()
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      preferences: false,
      status: 'rejected_non_essential',
      timestamp: new Date().toISOString()
    });
  };

  const handleSavePreferences = () => {
    saveConsent({
      necessary: true,
      analytics: analyticsCookies,
      preferences: preferenceCookies,
      status: 'customized',
      timestamp: new Date().toISOString()
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className="darshan-cookie-banner-wrapper"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie Consent Banner"
    >
      <div className="darshan-cookie-banner-card">
        {/* Top Header & Main Message */}
        <div className="darshan-cookie-main-content">
          <div className="darshan-cookie-icon-wrapper">
            <Cookie className="darshan-cookie-icon" size={26} />
          </div>

          <div className="darshan-cookie-text-block">
            <div className="darshan-cookie-title-row">
              <h3 className="darshan-cookie-title">Devotee Privacy & Cookie Preferences</h3>
              <span className="darshan-cookie-badge">
                <ShieldCheck size={14} /> Sacred Trust
              </span>
            </div>
            <p className="darshan-cookie-description">
              Darshan Journey uses essential cookies to ensure secure devotee authentication, preserve your spiritual pilgrimage preferences, and guarantee seamless darshan booking experiences. We honor your choices and privacy at every step.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="darshan-cookie-actions">
            <button
              type="button"
              className="darshan-cookie-btn darshan-cookie-btn-reject"
              onClick={handleRejectNonEssential}
            >
              Reject Non-Essential
            </button>
            <button
              type="button"
              className="darshan-cookie-btn darshan-cookie-btn-accept"
              onClick={handleAcceptAll}
            >
              <Check size={16} /> Accept All Cookies
            </button>
            <button
              type="button"
              className="darshan-cookie-btn-customize"
              onClick={() => setShowCustomize((prev) => !prev)}
              aria-expanded={showCustomize}
            >
              <SlidersHorizontal size={14} />
              <span>{showCustomize ? 'Hide Details' : 'Preferences'}</span>
              {showCustomize ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Expandable Preferences Drawer */}
        {showCustomize && (
          <div className="darshan-cookie-custom-drawer">
            <div className="darshan-cookie-categories-grid">
              {/* Essential */}
              <div className="darshan-cookie-category-item active">
                <div className="darshan-cookie-cat-header">
                  <div className="darshan-cookie-cat-title-group">
                    <Lock size={15} className="cat-icon" />
                    <span className="cat-name">Strictly Essential Cookies</span>
                  </div>
                  <span className="cat-status-tag always-active">Always Active</span>
                </div>
                <p className="cat-desc">
                  Required for core platform functionality, security verification, session management, and processing seva bookings.
                </p>
              </div>

              {/* Preferences */}
              <div className="darshan-cookie-category-item">
                <div className="darshan-cookie-cat-header">
                  <div className="darshan-cookie-cat-title-group">
                    <SlidersHorizontal size={15} className="cat-icon" />
                    <span className="cat-name">Functional & Preferences</span>
                  </div>
                  <label className="darshan-cookie-toggle">
                    <input
                      type="checkbox"
                      checked={preferenceCookies}
                      onChange={(e) => setPreferenceCookies(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p className="cat-desc">
                  Remember your preferred deity categories, temple filters, and localized spiritual dates for a personalized pilgrimage journey.
                </p>
              </div>

              {/* Analytics */}
              <div className="darshan-cookie-category-item">
                <div className="darshan-cookie-cat-header">
                  <div className="darshan-cookie-cat-title-group">
                    <ShieldCheck size={15} className="cat-icon" />
                    <span className="cat-name">Performance & Analytics</span>
                  </div>
                  <label className="darshan-cookie-toggle">
                    <input
                      type="checkbox"
                      checked={analyticsCookies}
                      onChange={(e) => setAnalyticsCookies(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p className="cat-desc">
                  Helps us anonymously understand devotee traffic patterns and optimize temple media load times across regions.
                </p>
              </div>
            </div>

            <div className="darshan-cookie-drawer-actions">
              <button
                type="button"
                className="darshan-cookie-btn darshan-cookie-btn-save"
                onClick={handleSavePreferences}
              >
                Save Selected Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
