import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('darshan_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [pendingBookingService, setPendingBookingService] = useState(() => {
    try {
      const savedPending = localStorage.getItem('darshan_pending_booking');
      return savedPending ? JSON.parse(savedPending) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(user);

  const login = (userData) => {
    const formattedUser = {
      name: userData?.fullName || userData?.name || 'Devotee',
      email: userData?.email || 'devotee@darshanjourney.com',
      phone: userData?.phone || '+91 98765 43210',
      token: 'jwt_token_' + Date.now()
    };
    setUser(formattedUser);
    localStorage.setItem('darshan_user', JSON.stringify(formattedUser));
    return pendingBookingService;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('darshan_user');
  };

  const setPendingService = (serviceData) => {
    setPendingBookingService(serviceData);
    if (serviceData) {
      localStorage.setItem('darshan_pending_booking', JSON.stringify(serviceData));
    } else {
      localStorage.removeItem('darshan_pending_booking');
    }
  };

  const clearPendingService = () => {
    setPendingBookingService(null);
    localStorage.removeItem('darshan_pending_booking');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      pendingBookingService,
      login,
      logout,
      setPendingService,
      clearPendingService
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
