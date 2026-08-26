import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'darshan_user_profile';
const API_BASE = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext(null);

/**
 * AuthProvider — Manages authentication state with server session validation & HttpOnly cookies.
 *
 * Devotee User Profile shape:
 * {
 *   id: string,
 *   _id: string,
 *   name: string,
 *   fullName: string,
 *   username: string,
 *   email: string,
 *   avatar?: string,
 *   authProvider: 'local' | 'google',
 *   provider: 'local' | 'google',
 *   phone?: string,
 *   mobile?: string,
 *   address?: string,
 *   emergencyContact?: string,
 *   emailVerified?: boolean,
 *   status: string
 * }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    return null;
  });

  // Loading state for initial session validation from server
  const [isLoading, setIsLoading] = useState(true);

  const [pendingBookingService, setPendingBookingService] = useState(() => {
    try {
      const savedPending = localStorage.getItem('darshan_pending_booking');
      return savedPending ? JSON.parse(savedPending) : null;
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
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const serverUser = await response.json();
          const updatedUser = {
            id: serverUser.id || serverUser._id,
            _id: serverUser._id || serverUser.id,
            name: serverUser.fullName || serverUser.name || 'Devotee',
            fullName: serverUser.fullName || serverUser.name || 'Devotee',
            username: serverUser.username || '',
            email: serverUser.email,
            phone: serverUser.phone || serverUser.mobile || '',
            mobile: serverUser.mobile || serverUser.phone || '',
            address: serverUser.address || '',
            emergencyContact: serverUser.emergencyContact || '',
            authProvider: serverUser.authProvider || serverUser.provider || 'local',
            provider: serverUser.authProvider || serverUser.provider || 'local',
            avatar: serverUser.avatar || (serverUser.fullName ? serverUser.fullName.charAt(0).toUpperCase() : 'D'),
            emailVerified: Boolean(serverUser.emailVerified !== false),
            status: serverUser.status || 'active'
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
          setUser(updatedUser);
        } else {
          // No active valid session cookie on server
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      } catch (err) {
        console.warn('Backend session validation notice:', err.message);
        // If network error occurred, keep locally cached profile if exists
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch { setUser(null); }
      } else if (e.key === 'darshan_pending_booking') {
        try {
          setPendingBookingService(e.newValue ? JSON.parse(e.newValue) : null);
        } catch { setPendingBookingService(null); }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Login — saves user profile and completes auth state
  const login = useCallback((userSession) => {
    const formattedUser = {
      id: userSession?.id || userSession?._id || ('user_' + Date.now()),
      _id: userSession?._id || userSession?.id || ('user_' + Date.now()),
      name: userSession?.fullName || userSession?.name || 'Devotee',
      fullName: userSession?.fullName || userSession?.name || 'Devotee',
      username: userSession?.username || '',
      email: userSession?.email || '',
      phone: userSession?.phone || userSession?.mobile || '',
      mobile: userSession?.mobile || userSession?.phone || '',
      avatar: userSession?.avatar || (userSession?.fullName ? userSession.fullName.charAt(0).toUpperCase() : 'D'),
      authProvider: userSession?.authProvider || userSession?.provider || 'local',
      provider: userSession?.authProvider || userSession?.provider || 'local',
      emailVerified: true,
      status: 'active',
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedUser));
    setUser(formattedUser);
    setIsLoading(false);
    return pendingBookingService;
  }, [pendingBookingService]);

  // Logout — clears cookie and profile state
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }).catch(err => console.warn('Logout sync notice:', err.message));
  }, []);

  // Update profile fields
  const updateUser = useCallback((fields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Sync with backend
      fetch(`${API_BASE}/api/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ...fields, email: prev.email })
      }).catch(err => console.warn('Background profile sync notice:', err.message));

      return updated;
    });
  }, []);

  const setPendingService = useCallback((serviceData) => {
    setPendingBookingService(serviceData);
    if (serviceData) {
      localStorage.setItem('darshan_pending_booking', JSON.stringify(serviceData));
    } else {
      localStorage.removeItem('darshan_pending_booking');
    }
  }, []);

  const clearPendingService = useCallback(() => {
    setPendingBookingService(null);
    localStorage.removeItem('darshan_pending_booking');
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoggedIn: Boolean(user),
    isLoading,
    pendingBookingService,
    login,
    logout,
    updateUser,
    setPendingService,
    clearPendingService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
