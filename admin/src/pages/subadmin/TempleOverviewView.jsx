import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Edit3, Save, RefreshCw, Sparkles } from 'lucide-react';
import { getAuthHeaders, getCurrentUser } from '../../utils/auth';

export default function TempleOverviewView() {
  const [templeData, setTempleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ description: '', location: '', timings: '' });
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sub-admin/temple-dashboard', { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        setTempleData(json);
        const t = json.temple || {};
        setEditForm({
          description: t.description || 'Ancient Dravidian masterpiece dedicated to Lord Shiva and Goddess Karpagambal in Mylapore, Chennai.',
          location: t.location || 'Mylapore, Chennai, Tamil Nadu - 600004',
          timings: 'Morning: 6:00 AM - 12:30 PM | Evening: 4:00 PM - 9:00 PM'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tId = templeData?.temple?.id || 't-3';
      const res = await fetch(`/api/temples/${tId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setToastMessage('✨ Temple details updated successfully!');
        setTimeout(() => setToastMessage(''), 4000);
        setIsEditing(false);
        await loadData();
      }
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !templeData) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <RefreshCw size={28} className="spin-slow" style={{ color: '#8EAE68' }} />
      </div>
    );
  }

  const t = templeData?.temple || {};

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#1E2C1E', border: '1px solid #8EAE68', color: '#D4E7C5', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', margin: '0 0 0.25rem' }}>
            {t.name || 'Kapaleeshwarar Temple'} — Sanctum Overview
          </h2>
          <p style={{ color: 'var(--admin-gold)', fontSize: '0.85rem', margin: 0 }}>
            🛕 Dedicated Governance for {t.city || 'Chennai'} Sanctum
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(142, 174, 104, 0.15)',
              border: '1px solid rgba(142, 174, 104, 0.4)',
              color: '#8EAE68',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={15} /> Edit Sanctum Details
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--admin-text-muted)',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '12px', padding: '2rem' }}>
        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Sacred History & Description</span>
              <div style={{ fontSize: '0.92rem', color: 'var(--admin-text-muted)', marginTop: '0.35rem', lineHeight: '1.6' }}>
                {t.description || 'Ancient Dravidian masterpiece dedicated to Lord Shiva and Goddess Karpagambal in Mylapore, Chennai.'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>City / Location</span>
                <div style={{ fontSize: '1rem', color: '#FFFDF9', fontWeight: '600', marginTop: '0.2rem' }}>{t.location || 'Mylapore, Chennai'}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>State</span>
                <div style={{ fontSize: '1rem', color: '#FFFDF9', fontWeight: '600', marginTop: '0.2rem' }}>{t.state || 'Tamil Nadu'}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Status</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    🟢 {t.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-gold)', marginBottom: '0.4rem', fontWeight: '600' }}>
                Sacred History & Description
              </label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-gold)', marginBottom: '0.4rem', fontWeight: '600' }}>
                Sanctum Address / Location
              </label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#8EAE68',
                border: 'none',
                color: '#120907',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
