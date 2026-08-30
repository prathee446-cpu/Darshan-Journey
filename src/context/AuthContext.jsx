import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'darshan_user_profile';
const LEGACY_STORAGE_KEY = 'darshan_user';
const API_BASE = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext(null);

/**
 * AuthProvider — Manages devotee user authentication state, session validation,
 * token persistence, and pending booking/service intents.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      /* ignore */
    }
    return null;
  });

  // Loading state for initial session validation from server
  const [isLoading, setIsLoading] = useState(true);

  // Pending booking service state
  const [pendingBookingService, setPendingBookingService] = useState(() => {
    try {
      const savedPending = localStorage.getItem('darshan_pending_booking');
      return savedPending ? JSON.parse(savedPending) : null;
    } catch {
      return null;
    }
  });

  // Pending navigation/booking intent
  const [pendingIntent, setPendingIntentState] = useState(() => {
    try {
      const savedIntent = sessionStorage.getItem('darshan_pending_intent') || localStorage.getItem('darshan_pending_intent');
      return savedIntent ? JSON.parse(savedIntent) : null;
    } catch {
      return null;
    }
  });

  const validationAttempted = useRef(false);

  // Validate session on app launch by calling /api/auth/me with credentials: 'include'
  useEffect(() => {
    if (validationAttempted.current) return;
    validationAttempted.current = true;

    const validateSession = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('darshan_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/api/auth/me`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const serverUser = await response.json();
          const normalized = {
            id: serverUser.id || serverUser._id,
            _id: serverUser.id || serverUser._id,
            name: serverUser.name || serverUser.fullName || 'Devotee',
            fullName: serverUser.fullName || serverUser.name || 'Devotee',
            email: serverUser.email || '',
            avatar: serverUser.avatar || (serverUser.fullName ? serverUser.fullName.charAt(0).toUpperCase() : 'D'),
            provider: serverUser.provider || 'email',
            authProvider: serverUser.provider || 'email',
            phone: serverUser.phone || serverUser.mobile || '',
            mobile: serverUser.mobile || serverUser.phone || '',
            address: serverUser.address || '',
            emergencyContact: serverUser.emergencyContact || '',
            status: serverUser.status || 'active',
            createdAt: serverUser.createdAt || new Date().toISOString(),
            lastLogin: serverUser.lastLogin || new Date().toISOString()
          };
          setUser(normalized);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(normalized));
        } else if (response.status === 401) {
          // Token expired or invalid session
          if (!localStorage.getItem(STORAGE_KEY) && !localStorage.getItem(LEGACY_STORAGE_KEY)) {
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session validation skipped (offline/standalone mode):', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  // Save pending booking service
  const setPendingService = useCallback((service) => {
    setPendingBookingService(service);
    if (service) {
      localStorage.setItem('darshan_pending_booking', JSON.stringify(service));
    } else {
      localStorage.removeItem('darshan_pending_booking');
    }
  }, []);

  const clearPendingService = useCallback(() => {
    setPendingBookingService(null);
    localStorage.removeItem('darshan_pending_booking');
  }, []);

  // Set pending intent
  const setPendingIntent = useCallback((intent) => {
    setPendingIntentState(intent);
    if (intent) {
      const serialized = JSON.stringify(intent);
      try {
        sessionStorage.setItem('darshan_pending_intent', serialized);
        localStorage.setItem('darshan_pending_intent', serialized);
      } catch (e) {
        console.warn('Could not serialize pending intent', e);
      }
      if (intent.payload?.service) {
        setPendingService(intent.payload.service);
      }
    } else {
      try {
        sessionStorage.removeItem('darshan_pending_intent');
        localStorage.removeItem('darshan_pending_intent');
      } catch (e) {
        // ignore
      }
    }
  }, [setPendingService]);

  const clearPendingIntent = useCallback(() => {
    setPendingIntentState(null);
    try {
      sessionStorage.removeItem('darshan_pending_intent');
      localStorage.removeItem('darshan_pending_intent');
    } catch (e) {
      // ignore
    }
  }, []);

  // Login handler
  const login = useCallback((userData, token = null) => {
    const normalizedUser = {
      id: userData.id || userData._id || 'user_' + Date.now(),
      _id: userData._id || userData.id || 'user_' + Date.now(),
      name: userData.name || userData.fullName || 'Devotee',
      fullName: userData.fullName || userData.name || 'Devotee',
      email: userData.email || '',
      avatar: userData.avatar || (userData.name || userData.fullName || 'D').charAt(0).toUpperCase(),
      authProvider: userData.provider || userData.authProvider || 'email',
      provider: userData.provider || userData.authProvider || 'email',
      phone: userData.phone || userData.mobile || '',
      mobile: userData.mobile || userData.phone || '',
      address: userData.address || '',
      emergencyContact: userData.emergencyContact || '',
      status: userData.status || 'active',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    setUser(normalizedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(normalizedUser));

    if (token) {
      localStorage.setItem('darshan_token', token);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem('darshan_token');
    localStorage.removeItem('darshan_pending_booking');
    sessionStorage.removeItem('darshan_pending_intent');
    localStorage.removeItem('darshan_pending_intent');

    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (err) {
      console.warn('[AuthContext] Backend logout notification error:', err.message);
    }
  }, []);

  // Update user profile
  const updateUser = useCallback(async (updatedFields) => {
    if (!user) return;

    const newUserData = { ...user, ...updatedFields };
    setUser(newUserData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUserData));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(newUserData));

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      const token = localStorage.getItem('darshan_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE}/api/auth/update-profile`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id || user._id,
          ...updatedFields
        })
      });
    } catch (err) {
      console.warn('[AuthContext] Could not sync profile update with server:', err.message);
    }
  }, [user]);

  // requireAuth helper
  const requireAuth = useCallback((actionCallback) => {
    if (user) {
      if (actionCallback) actionCallback();
      return true;
    }
    return false;
  }, [user]);

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    pendingBookingService,
    setPendingService,
    clearPendingService,
    pendingIntent,
    setPendingIntent,
    clearPendingIntent,
    login,
    logout,
    updateUser,
    requireAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
