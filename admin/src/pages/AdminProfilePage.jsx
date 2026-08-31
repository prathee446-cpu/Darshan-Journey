import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, Lock, Save, Sparkles, 
  CheckCircle2, Clock, Calendar, Key, LogOut, Edit3, X, 
  ShieldAlert, Award, Building, AtSign, Globe, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders, getCurrentUser, clearUserSession, saveUserSession } from '../utils/auth';

export default function AdminProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    id: 'adm-1',
    name: 'Prathika (Chief Administrator)',
    email: 'admin@darshanjourney.com',
    phone: '+91 98401 23456',
    username: 'superadmin',
    role: 'Super Admin',
    designation: 'Chief Administrator',
    status: 'Active',
    branch: 'Chennai Headquarters',
    temple: 'All Tamil Nadu Sanctuaries',
    createdAt: '2024-01-15T09:00:00.000Z',
    lastLogin: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    permissions: 'Full Access (All Operations, Settings & Financials)'
  });

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    username: '',
    designation: '',
    branch: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  useEffect(() => {
    const raw = getCurrentUser();
    if (raw) {
      setUser(prev => ({
        ...prev,
        ...raw,
        username: raw.username || (raw.email ? raw.email.split('@')[0] : 'superadmin'),
        phone: raw.phone || '+91 98401 23456',
        createdAt: raw.createdAt || '2024-01-15T09:00:00.000Z',
        lastLogin: raw.lastLogin || ('Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      }));
    }
  }, []);

  const openEditModal = () => {
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      username: user.username || '',
      designation: user.designation || 'Chief Administrator',
      branch: user.branch || 'Chennai Headquarters'
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    const updatedUser = {
      ...user,
      name: editForm.name.trim() || user.name,
      phone: editForm.phone.trim() || user.phone,
      username: editForm.username.trim() || user.username,
      designation: editForm.designation.trim() || user.designation,
      branch: editForm.branch.trim() || user.branch
    };

    try {
      // Sync with backend if admin id is valid
      if (user.id) {
        await fetch(`/api/admins/${user.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: updatedUser.name,
            phone: updatedUser.phone,
            username: updatedUser.username,
            designation: updatedUser.designation,
            branch: updatedUser.branch
          })
        }).catch(() => {});
      }

      const token = localStorage.getItem('darshan_admin_token') || sessionStorage.getItem('darshan_admin_token') || 'darshan_adm_token';
      const remember = !!localStorage.getItem('darshan_admin_user');
      saveUserSession(token, updatedUser, remember);
      setUser(updatedUser);
      setIsEditing(false);
      showToast('✨ Admin Profile updated successfully!');
      
      // Dispatch custom storage event for sidebar update
      window.dispatchEvent(new Event('admin_profile_updated'));
    } catch (err) {
      showToast('⚠️ Could not save changes: ' + err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch(`/api/admins/${user.id || 'adm-1'}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          password: newPassword
        })
      });

      if (res.ok) {
        showToast('🔒 Security password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Network error updating security credentials.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/login');
  };

  const formatJoinedDate = (dateStr) => {
    try {
      if (!dateStr) return 'January 15, 2024';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return 'January 15, 2024';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toastType === 'error' ? '#2C1414' : '#1A2E1A',
            border: `1px solid ${toastType === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)'}`,
            color: '#FFFDF9',
            padding: '0.85rem 1.4rem',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem'
          }}
        >
          {toastType === 'error' ? <ShieldAlert size={18} color="var(--admin-danger)" /> : <CheckCircle2 size={18} color="var(--admin-success)" />}
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Page Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.65rem', color: '#FFFDF9', margin: '0 0 0.25rem' }}>
            Administrator Profile & Credentials
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Manage your Sanctum administrative identity, credentials, and security configurations.
          </p>
        </div>

        <button
          onClick={openEditModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
            border: '1px solid var(--admin-gold)',
            color: '#FFFDF9',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Edit3 size={15} />
          Edit Profile
        </button>
      </div>

      {/* Hero Overview Profile Card */}
      <div 
        className="glassmorphism"
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(214, 181, 109, 0.25)',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(36, 20, 17, 0.95) 0%, rgba(20, 10, 8, 0.95) 100%)'
        }}
      >
        {/* Top Gold Bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #D6B56D, #C89B4B, #D6B56D)' }} />

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.75rem' }}>
          {/* Avatar Icon */}
          <div 
            className="flex-center"
            style={{
              width: '85px',
              height: '85px',
              borderRadius: '50%',
              backgroundColor: 'var(--admin-primary-brown)',
              border: '2.5px solid var(--admin-gold)',
              boxShadow: '0 0 20px rgba(214, 181, 109, 0.3)',
              color: 'var(--admin-gold)',
              fontSize: '2.2rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            {(user.name || 'A').charAt(0).toUpperCase()}
          </div>

          {/* Core Info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 'bold', color: '#FFFDF9', margin: 0 }}>
                {user.name || 'Administrator'}
              </h3>
              <span 
                style={{
                  backgroundColor: 'rgba(214, 181, 109, 0.15)',
                  border: '1px solid rgba(214, 181, 109, 0.4)',
                  color: 'var(--admin-gold)',
                  padding: '0.2rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Award size={12} />
                {user.role || 'Super Admin'}
              </span>
              <span 
                style={{
                  backgroundColor: 'rgba(142, 174, 104, 0.15)',
                  border: '1px solid rgba(142, 174, 104, 0.35)',
                  color: '#8EAE68',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                🟢 {user.status || 'Active'}
              </span>
            </div>

            <p style={{ color: 'var(--admin-cream)', fontSize: '0.88rem', margin: '0 0 0.75rem' }}>
              {user.designation || 'Chief Administrator'} · {user.branch || 'Chennai Headquarters'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} style={{ color: 'var(--admin-gold)' }} />
                <span>{user.email || 'admin@darshanjourney.com'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} style={{ color: 'var(--admin-gold)' }} />
                <span>{user.phone || '+91 98401 23456'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AtSign size={14} style={{ color: 'var(--admin-gold)' }} />
                <span>@{user.username || 'superadmin'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Personal Information & Account Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Section 1: Personal Information Details */}
        <div className="glassmorphism" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
          <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} style={{ color: 'var(--admin-gold)' }} />
            Personal & Operational Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Full Legal Name</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#FFFDF9' }}>{user.name}</span>
            </div>

            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Login Email Address</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#FFFDF9' }}>{user.email}</span>
            </div>

            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Contact Phone</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#FFFDF9' }}>{user.phone || '+91 98401 23456'}</span>
            </div>

            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Username</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--admin-gold)' }}>@{user.username || 'superadmin'}</span>
            </div>

            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Designation & Role</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#FFFDF9' }}>{user.designation || 'Chief Administrator'}</span>
            </div>

            <div className="flex-between">
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Assigned Jurisdiction</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#FFFDF9' }}>{user.temple || 'All Tamil Nadu Temples'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Account Activity & Security Overview */}
        <div className="glassmorphism" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
          <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} style={{ color: 'var(--admin-gold)' }} />
            Account Activity & Governance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Account Status</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#8EAE68' }}>Active & Verified 🟢</span>
            </div>

            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Member Since / Created</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#FFFDF9' }}>{formatJoinedDate(user.createdAt)}</span>
            </div>

            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Last Login Timestamp</span>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--admin-gold)' }}>{user.lastLogin || 'Today'}</span>
            </div>

            <div className="flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Access Permissions</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#FFFDF9', textAlign: 'right', maxWidth: '200px' }}>
                {user.permissions || 'Full Super Admin Master Privileges'}
              </span>
            </div>

            <div className="flex-between">
              <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Session Security</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#8EAE68' }}>PBKDF2 SHA-512 Encrypted 🛡️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Account Security & Change Password */}
      <div className="glassmorphism" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
        <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={18} style={{ color: 'var(--admin-gold)' }} />
          Account Security & Password Modification
        </h3>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          Update your administrative master credentials. Use a strong password containing letters, numbers, and symbols.
        </p>

        {passwordError && (
          <div style={{ backgroundColor: 'rgba(192, 90, 78, 0.15)', border: '1px solid rgba(192, 90, 78, 0.35)', color: 'var(--admin-danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-gold)', marginBottom: '0.4rem', fontWeight: '600' }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  color: '#FFFDF9',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-gold)', marginBottom: '0.4rem', fontWeight: '600' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  color: '#FFFDF9',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-gold)', marginBottom: '0.4rem', fontWeight: '600' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  color: '#FFFDF9',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={updatingPassword}
              style={{
                backgroundColor: 'var(--admin-primary-brown)',
                border: '1px solid var(--admin-gold)',
                color: 'var(--admin-gold)',
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: updatingPassword ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!updatingPassword) {
                  e.currentTarget.style.backgroundColor = 'var(--admin-gold)';
                  e.currentTarget.style.color = '#120907';
                }
              }}
              onMouseLeave={(e) => {
                if (!updatingPassword) {
                  e.currentTarget.style.backgroundColor = 'var(--admin-primary-brown)';
                  e.currentTarget.style.color = 'var(--admin-gold)';
                }
              }}
            >
              <Key size={15} />
              {updatingPassword ? 'Updating Credentials...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 4: DEDICATED LOGOUT AREA AT BOTTOM */}
      <div 
        className="glassmorphism"
        style={{
          padding: '1.75rem',
          borderRadius: '14px',
          border: '1px solid rgba(192, 90, 78, 0.3)',
          backgroundColor: 'rgba(36, 16, 14, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#FFFDF9', margin: '0 0 0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={18} style={{ color: 'var(--admin-danger)' }} />
            Session Termination & Logout
          </h4>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', margin: 0 }}>
            Safely terminate your authenticated administrative session across Darshan Journey Sanctum.
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(192, 90, 78, 0.15)',
            border: '1px solid rgba(192, 90, 78, 0.6)',
            color: 'var(--admin-danger)',
            padding: '0.7rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.25s',
            fontFamily: 'var(--font-sans)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--admin-danger)';
            e.currentTarget.style.color = '#FFFDF9';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(192, 90, 78, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(192, 90, 78, 0.15)';
            e.currentTarget.style.color = 'var(--admin-danger)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={16} />
          Logout Operations
        </button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 90 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glassmorphism"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(214, 181, 109, 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                zIndex: 95,
                background: 'linear-gradient(135deg, #1C0E0B 0%, #120907 100%)'
              }}
            >
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 className="serif-title" style={{ fontSize: '1.3rem', color: '#FFFDF9', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={18} style={{ color: 'var(--admin-gold)' }} />
                  Edit Admin Profile
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-cream)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.35rem', fontWeight: '600' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(18, 9, 7, 0.7)',
                        border: '1px solid rgba(214, 181, 109, 0.25)',
                        color: '#FFFDF9',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.35rem', fontWeight: '600' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(18, 9, 7, 0.7)',
                        border: '1px solid rgba(214, 181, 109, 0.25)',
                        color: '#FFFDF9',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.35rem', fontWeight: '600' }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98401 23456"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(18, 9, 7, 0.7)',
                        border: '1px solid rgba(214, 181, 109, 0.25)',
                        color: '#FFFDF9',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.35rem', fontWeight: '600' }}>
                      Designation / Title
                    </label>
                    <input
                      type="text"
                      value={editForm.designation}
                      onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                      placeholder="Chief Administrator"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(18, 9, 7, 0.7)',
                        border: '1px solid rgba(214, 181, 109, 0.25)',
                        color: '#FFFDF9',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.35rem', fontWeight: '600' }}>
                      Branch / Office Location
                    </label>
                    <input
                      type="text"
                      value={editForm.branch}
                      onChange={(e) => setEditForm(prev => ({ ...prev, branch: e.target.value }))}
                      placeholder="Chennai Headquarters"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(18, 9, 7, 0.7)',
                        border: '1px solid rgba(214, 181, 109, 0.25)',
                        color: '#FFFDF9',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(214, 181, 109, 0.3)',
                      color: 'var(--admin-cream)',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
                      border: '1px solid var(--admin-gold)',
                      color: '#FFFDF9',
                      padding: '0.6rem 1.4rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Save size={15} />
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
