const DEFAULT_SUPER_ADMIN_FALLBACK = {
  id: 'adm-1',
  name: 'Prathika (Chief Administrator)',
  email: 'admin@darshanjourney.com',
  role: 'SUPER_ADMIN',
  designation: 'Super Admin',
  status: 'Active',
  permissions: 'Full Access (All Operations, Settings & Financials)'
};

export function getAuthHeaders() {
  const token = localStorage.getItem('darshan_admin_token') || sessionStorage.getItem('darshan_admin_token') || 'darshan_adm_1_bypass';
  const userJson = localStorage.getItem('darshan_admin_user') || sessionStorage.getItem('darshan_admin_user');
  let email = 'admin@darshanjourney.com';
  if (userJson) {
    try {
      const u = JSON.parse(userJson);
      if (u.email) email = u.email;
    } catch (e) {}
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-admin-token': token,
    'x-admin-email': email
  };
}

export function getLoggedInAdmin() {
  const userJson = localStorage.getItem('darshan_admin_user') || sessionStorage.getItem('darshan_admin_user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {}
  }
  // Default to Super Admin for direct access bypass
  return DEFAULT_SUPER_ADMIN_FALLBACK;
}

export const getCurrentUser = getLoggedInAdmin;

export function isSuperAdminUser(user) {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  if (email === 'admin@darshanjourney.com') return true;
  const role = (user.role || '').toUpperCase().trim();
  if (
    role === 'SUPER_ADMIN' || 
    role === 'SUPER ADMIN' || 
    role === 'ADMIN' || 
    role === 'CHIEF_ADMINISTRATOR' ||
    role === 'SUPERADMIN' ||
    role === 'SUPER_ADMINISTRATOR' ||
    role === 'SUPER'
  ) {
    return true;
  }
  // Sub-admin roles are never super admin
  if (
    role === 'SERVICE_SUB_ADMIN' || 
    role === 'SERVICE_IN_CHARGE' || 
    role === 'TEMPLE_SUB_ADMIN' || 
    role === 'TEMPLE_IN_CHARGE' || 
    role === 'SUB_ADMIN' || 
    role === 'SUB-ADMIN' ||
    role === 'SUB ADMIN'
  ) {
    return false;
  }
  return role.includes('ADMIN') && !role.includes('SUB');
}

export function isServiceSubAdminUser(user) {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  if (email === 'admin@darshanjourney.com') return false; // Super admin always has priority
  const role = (user.role || '').toUpperCase().trim();
  return role === 'SERVICE_SUB_ADMIN' || role === 'SERVICE_IN_CHARGE';
}

export function isTempleSubAdminUser(user) {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  if (email === 'admin@darshanjourney.com') return false; // Super admin always has priority
  const role = (user.role || '').toUpperCase().trim();
  return role === 'TEMPLE_SUB_ADMIN' || role === 'TEMPLE_IN_CHARGE';
}

export function isSubAdminUser(user) {
  if (!user) return false;
  if (isSuperAdminUser(user)) return false;
  return isServiceSubAdminUser(user) || isTempleSubAdminUser(user) || (user.role || '').toUpperCase().includes('SUB');
}

export const ALL_ADMIN_MODULES = [
  'services',
  'temples',
  'bookings',
  'users',
  'payments',
  'reports',
  'media',
  'website-content',
  'about',
  'admin-management',
  'settings'
];

export function getUserAssignedModules(user) {
  if (!user) return [];
  if (isSuperAdminUser(user)) {
    return ALL_ADMIN_MODULES;
  }

  // Check explicit assignedModules array
  if (Array.isArray(user.assignedModules) && user.assignedModules.length > 0) {
    return user.assignedModules.map(m => m.toLowerCase().trim());
  }

  // Check explicit assignedPages array
  if (Array.isArray(user.assignedPages) && user.assignedPages.length > 0) {
    return user.assignedPages.map(m => m.toLowerCase().trim());
  }

  // Infer from Sub-Admin Role / Assignments
  const modules = new Set();
  
  if (isServiceSubAdminUser(user)) {
    modules.add('services');
    modules.add('bookings');
  } else if (isTempleSubAdminUser(user)) {
    modules.add('services');
    modules.add('temples');
    modules.add('bookings');
  } else if (Array.isArray(user.serviceAssignments) && user.serviceAssignments.length > 0) {
    modules.add('services');
    modules.add('bookings');
  } else {
    // Default sub-admin fallback if no explicit array: Services and Bookings
    modules.add('services');
    modules.add('bookings');
  }

  return Array.from(modules);
}

export function hasModulePermission(user, moduleKey) {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;

  const normalized = (moduleKey || '').toLowerCase().trim();
  // Dashboard, Sub Admin root/profile, and Admin Profile are accessible to all authenticated admins
  if (normalized === 'dashboard' || normalized === 'sub-admin' || normalized === 'profile' || normalized === '' || normalized === 'admin') {
    return true;
  }

  const assigned = getUserAssignedModules(user);
  return assigned.includes(normalized);
}

export function isRouteAllowedForUser(user, pathname) {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;

  const path = (pathname || '').toLowerCase();
  
  if (path === '/admin' || path === '/admin/' || path.startsWith('/admin/dashboard')) {
    return true;
  }

  if (path.startsWith('/admin/profile') || path.startsWith('/profile')) {
    return true;
  }

  if (path.startsWith('/admin/sub-admin') || path.startsWith('/sub-admin')) {
    return true;
  }

  // Map route path prefix to module key
  if (path.startsWith('/admin/services')) return hasModulePermission(user, 'services');
  if (path.startsWith('/admin/temples')) return hasModulePermission(user, 'temples');
  if (path.startsWith('/admin/bookings')) return hasModulePermission(user, 'bookings');
  if (path.startsWith('/admin/users')) return hasModulePermission(user, 'users');
  if (path.startsWith('/admin/payments')) return hasModulePermission(user, 'payments');
  if (path.startsWith('/admin/reports')) return hasModulePermission(user, 'reports');
  if (path.startsWith('/admin/media')) return hasModulePermission(user, 'media');
  if (path.startsWith('/admin/website-content')) return hasModulePermission(user, 'website-content');
  if (path.startsWith('/admin/about')) return hasModulePermission(user, 'about');
  if (path.startsWith('/admin/admin-management')) return isSuperAdminUser(user);
  if (path.startsWith('/admin/settings')) return hasModulePermission(user, 'settings') || isSuperAdminUser(user);

  return false;
}

export function getUserDashboardRoute(user) {
  if (!user) return '/admin/login';
  if (isServiceSubAdminUser(user)) return '/sub-admin/service/dashboard';
  if (isTempleSubAdminUser(user)) return '/sub-admin/temple/dashboard';
  if (isSuperAdminUser(user)) return '/admin';
  return '/admin';
}

export function saveUserSession(token, user, rememberMe = true) {
  const storage = rememberMe ? localStorage : sessionStorage;
  // Clean other storage to avoid conflict
  localStorage.removeItem('darshan_admin_token');
  localStorage.removeItem('darshan_admin_user');
  sessionStorage.removeItem('darshan_admin_token');
  sessionStorage.removeItem('darshan_admin_user');

  storage.setItem('darshan_admin_token', token);
  storage.setItem('darshan_admin_user', JSON.stringify(user));
}

export function clearUserSession() {
  localStorage.removeItem('darshan_admin_token');
  localStorage.removeItem('darshan_admin_user');
  sessionStorage.removeItem('darshan_admin_token');
  sessionStorage.removeItem('darshan_admin_user');
}

