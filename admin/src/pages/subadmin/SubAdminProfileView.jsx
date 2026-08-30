import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, Lock, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import { getAuthHeaders, getCurrentUser } from '../../utils/auth';

export default function SubAdminProfileView() {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser(u);
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admins/reset-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminId: user?.id, newPassword })
      });
      if (res.ok) {
        setToastMessage('✨ Password updated successfully!');
        setTimeout(() => setToastMessage(''), 4000);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.message || 'Failed to update password.');
      }
    } catch (err) {
      setError('Network error updating credentials.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#1E2C1E', border: '1px solid #8EAE68', color: '#D4E7C5', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', margin: '0 0 0.25rem' }}>
          Sub-Admin Profile & Credentials
        </h2>
        <p style={{ color: 'var(--admin-gold)', fontSize: '0.85rem', margin: 0 }}>
          Manage your Sanctum operational account
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
          <div style={{ height: '60px', width: '60px', borderRadius: '50%', backgroundColor: 'rgba(142, 174, 104, 0.2)', border: '2px solid #8EAE68', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8EAE68', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {(user.name || 'P').charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#FFFDF9', margin: '0 0 0.25rem' }}>{user.name || 'Sub-Admin'}</h3>
            <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
              🟢 {user.role === 'SERVICE_SUB_ADMIN' ? 'Service In-Charge' : 'Temple In-Charge'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Login Email</span>
            <div style={{ color: '#FFFDF9', marginTop: '0.25rem', fontSize: '0.9rem' }}>{user.email}</div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Assigned Temple</span>
            <div style={{ color: '#FFFDF9', marginTop: '0.25rem', fontSize: '0.9rem' }}>{user.temple || 'Kapaleeshwarar Temple — Chennai'}</div>
          </div>
          {user.serviceName && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Assigned Service</span>
              <div style={{ color: '#FFFDF9', marginTop: '0.25rem', fontSize: '0.9rem' }}>{user.serviceName}</div>
            </div>
          )}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Account Status</span>
            <div style={{ color: '#8EAE68', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: '600' }}>Active 🟢</div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '12px', padding: '2rem' }}>
        <h3 className="serif-title" style={{ fontSize: '1.2rem', color: '#FFFDF9', margin: '0 0 1rem' }}>
          Update Security Password
        </h3>

        {error && (
          <div style={{ backgroundColor: 'rgba(192, 90, 78, 0.15)', border: '1px solid rgba(192, 90, 78, 0.3)', color: 'var(--admin-danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.35rem', fontWeight: '600' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-gold)', marginBottom: '0.35rem', fontWeight: '600' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: '#8EAE68',
              border: 'none',
              color: '#120907',
              padding: '0.65rem 1.25rem',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
