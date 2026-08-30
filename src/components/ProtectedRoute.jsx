import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Wraps routes that require authentication.
 * If the user is not authenticated, redirects to /login with the
 * intended destination stored in location state (for redirect after login).
 * Shows nothing during initial session validation to prevent flash.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While checking session validity, show nothing (prevents login page flash)
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1C120D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(212, 175, 55, 0.2)',
            borderTopColor: '#D4AF37',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{
            color: 'rgba(247, 239, 230, 0.6)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.85rem'
          }}>
            Loading...
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
