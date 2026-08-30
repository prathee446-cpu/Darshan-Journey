import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Simple check for simulated local admin auth state
  const adminToken = localStorage.getItem('darshan_admin_token') || sessionStorage.getItem('darshan_admin_token');
  
  if (!adminToken) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
