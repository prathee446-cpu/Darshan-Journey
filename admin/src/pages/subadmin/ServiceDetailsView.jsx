import React, { useState, useEffect } from 'react';
import { Library, Edit3, CheckCircle2, ShieldCheck, Tag, Sparkles, RefreshCw, Save, Image as ImageIcon } from 'lucide-react';
import { getAuthHeaders, getCurrentUser } from '../../utils/auth';

export default function ServiceDetailsView() {
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ description: '', price: '', availability: '', status: 'Active' });
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sub-admin/service-dashboard', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setServiceData(data);
        const s = data.service || {};
        setEditForm({
          description: s.description || 'Daily and special ritual poojas performed with sacred Vedic chants.',
          price: s.price || '₹501',
          availability: s.availability || 'Daily Morning & Evening',
          status: s.status || 'Active'
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
      const sId = serviceData?.service?.id || 'srv-1';
      const res = await fetch(`/api/services/${sId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setToastMessage('✨ Service details successfully updated!');
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

  if (loading && !serviceData) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <RefreshCw size={28} className="spin-slow" style={{ color: '#8EAE68' }} />
      </div>
    );
  }

  const s = serviceData?.service || {};
  const t = serviceData?.temple || {};
  const subcategories = serviceData?.subcategories || [];

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
            {s.name || 'Pooja Service'}
          </h2>
          <p style={{ color: 'var(--admin-gold)', fontSize: '0.85rem', margin: 0 }}>
            🛕 Assigned Temple: {t.name || 'Kapaleeshwarar Temple — Chennai'} ({t.city || 'Chennai'})
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
            <Edit3 size={15} /> Edit Service Details
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
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Service Category</span>
              <div style={{ fontSize: '1.05rem', color: '#FFFDF9', fontWeight: '600', marginTop: '0.25rem' }}>{s.category || 'Pooja Services'}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Description & Sanctum Details</span>
              <div style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)', marginTop: '0.35rem', lineHeight: '1.6' }}>
                {s.description || 'Daily and special ritual poojas performed with sacred Vedic chants.'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(214, 181, 109, 0.1)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Standard Base Price</span>
                <div style={{ fontSize: '1.1rem', color: '#FFFDF9', fontWeight: '700', marginTop: '0.2rem' }}>{s.price || '₹501'}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Status</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    🟢 {s.status || 'Active'}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>Assigned Subcategories</span>
                <div style={{ fontSize: '0.9rem', color: '#FFFDF9', fontWeight: '600', marginTop: '0.2rem' }}>
                  {subcategories.length} Offerings
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-gold)', marginBottom: '0.4rem', fontWeight: '600' }}>
                Service Description
              </label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-gold)', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Base Price (e.g. ₹501)
                </label>
                <input
                  type="text"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--admin-gold)', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: 'rgba(18, 9, 7, 0.6)' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
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
