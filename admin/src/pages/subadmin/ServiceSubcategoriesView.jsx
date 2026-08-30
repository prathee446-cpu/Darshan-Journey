import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2, ShieldCheck, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { getAuthHeaders, getCurrentUser } from '../../utils/auth';

export default function ServiceSubcategoriesView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sub-admin/service-dashboard', { headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        setData(json);
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

  if (loading && !data) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <RefreshCw size={28} className="spin-slow" style={{ color: '#8EAE68' }} />
      </div>
    );
  }

  const subcategories = data?.subcategories || [];
  const s = data?.service || {};
  const t = data?.temple || {};

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', margin: '0 0 0.25rem' }}>
          Assigned Subcategories — {s.name || 'Pooja Service'}
        </h2>
        <p style={{ color: 'var(--admin-gold)', fontSize: '0.85rem', margin: 0 }}>
          🛕 {t.name || 'Kapaleeshwarar Temple — Chennai'} &nbsp;|&nbsp; {subcategories.length} Active Offerings Under Your Sanctum
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {subcategories.map((sub, idx) => (
          <div
            key={sub.slug || sub.subcategoryId || idx}
            style={{
              backgroundColor: 'var(--admin-bg-sidebar)',
              border: '1px solid rgba(214, 181, 109, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ height: '32px', width: '32px', borderRadius: '50%', backgroundColor: 'rgba(200, 155, 75, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-gold)' }}>
                  <Tag size={16} />
                </span>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFDF9', margin: 0 }}>
                    {sub.name || sub.subcategoryId}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(214, 181, 109, 0.6)', fontFamily: 'monospace' }}>
                    /{sub.slug || 'offering'}
                  </span>
                </div>
              </div>

              <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>
                Active
              </span>
            </div>

            <div style={{ borderTop: '1px solid rgba(214, 181, 109, 0.1)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Granted Permissions:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                {sub.canView !== false && <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem' }}>View ✓</span>}
                {sub.canCreate && <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem' }}>Create ✓</span>}
                {sub.canEdit && <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem' }}>Edit ✓</span>}
                {sub.canPublish && <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem' }}>Publish ✓</span>}
                {sub.canManageBookings && <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.68rem' }}>Bookings ✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
