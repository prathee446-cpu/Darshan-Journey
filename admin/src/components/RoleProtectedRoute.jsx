import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, isSuperAdminUser, isServiceSubAdminUser, isTempleSubAdminUser, isSubAdminUser } from '../utils/auth';

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('darshan_admin_token') || sessionStorage.getItem('darshan_admin_token');
  const user = getCurrentUser();

  // If unauthenticated, always redirect to Admin Login
  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Normalize allowed roles to uppercase
  const normalizedAllowed = (allowedRoles || []).map(r => r.toUpperCase());

  const isSuper = isSuperAdminUser(user);
  const isService = isServiceSubAdminUser(user);
  const isTemple = isTempleSubAdminUser(user);
  const isSub = isSubAdminUser(user);

  let hasAccess = false;

  // 1. Super Admin access
  if (isSuper) {
    // Super admin has access to SUPER_ADMIN / ADMIN routes as well as SUB_ADMIN routes
    hasAccess = true;
  } else if (isService) {
    // Service Sub-Admin has access to SERVICE_SUB_ADMIN, SUB_ADMIN, SUB-ADMIN routes
    if (
      normalizedAllowed.includes('SERVICE_SUB_ADMIN') ||
      normalizedAllowed.includes('SUB_ADMIN') ||
      normalizedAllowed.includes('SUB-ADMIN')
    ) {
      hasAccess = true;
    }
  } else if (isTemple) {
    // Temple Sub-Admin has access to TEMPLE_SUB_ADMIN, SUB_ADMIN, SUB-ADMIN routes
    if (
      normalizedAllowed.includes('TEMPLE_SUB_ADMIN') ||
      normalizedAllowed.includes('SUB_ADMIN') ||
      normalizedAllowed.includes('SUB-ADMIN')
    ) {
      hasAccess = true;
    }
  } else if (isSub) {
    // Generic Sub-Admin
    if (
      normalizedAllowed.includes('SUB_ADMIN') ||
      normalizedAllowed.includes('SUB-ADMIN')
    ) {
      hasAccess = true;
    }
  }

  // If unauthorized for this specific role route, redirect to login (NEVER cross-redirect to other dashboards)
  if (!hasAccess) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

