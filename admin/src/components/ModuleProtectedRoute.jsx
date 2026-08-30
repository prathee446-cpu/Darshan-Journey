import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser, isSuperAdminUser, hasModulePermission } from '../utils/auth';

export default function ModuleProtectedRoute({ children, moduleKey }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('darshan_admin_token') || sessionStorage.getItem('darshan_admin_token');
  const user = getCurrentUser();

  if (!token && !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Super Admin has unrestricted access to everything
  if (isSuperAdminUser(user)) {
    return children;
  }

  // Check module permission
  const isAllowed = hasModulePermission(user, moduleKey);

  if (!isAllowed) {
    return (
      <div 
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism"
          style={{
            maxWidth: '540px',
            width: '100%',
            borderRadius: '16px',
            border: '1px solid rgba(192, 90, 78, 0.4)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            backgroundColor: 'rgba(25, 12, 10, 0.85)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}
        >
          <div 
            className="flex-center"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(192, 90, 78, 0.15)',
              border: '2px solid var(--admin-danger)',
              margin: '0 auto 1.5rem',
              color: 'var(--admin-danger)'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 className="serif-title" style={{ fontSize: '1.4rem', color: '#FFFDF9', marginBottom: '0.5rem' }}>
            Access Restricted: Unauthorized Module
          </h2>

          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
            Your Sub-Admin account (<strong style={{ color: '#FFFDF9' }}>{user?.name || user?.email}</strong>) has not been assigned permission to access the <strong style={{ color: 'var(--admin-gold)' }}>{moduleKey?.toUpperCase() || 'requested'}</strong> module.
          </p>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--admin-primary-brown)',
                border: '1px solid var(--admin-gold)',
                color: '#FFFDF9',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutDashboard size={16} />
              Return to Dashboard
            </button>

            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(214, 181, 109, 0.1)',
                border: '1px solid rgba(214, 181, 109, 0.3)',
                color: 'var(--admin-gold)',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return children;
}
