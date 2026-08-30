import React, { useState, useEffect } from 'react';
import { Library, Plus, Search, Filter, CheckCircle2, ShieldCheck, Tag, RefreshCw } from 'lucide-react';
import { getAuthHeaders, getCurrentUser } from '../../utils/auth';

export default function TempleServicesView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sub-admin/temple-dashboard', { headers: getAuthHeaders() });
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

  const services = data?.services || [];
  const temple = data?.temple || {};

  const filtered = services.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', margin: '0 0 0.25rem' }}>
            Temple Services Catalog — {temple.name || 'Kapaleeshwarar Temple'}
          </h2>
          <p style={{ color: 'var(--admin-gold)', fontSize: '0.85rem', margin: 0 }}>
            Offerings and rituals configured for {temple.city || 'Chennai'} Sanctum ({services.length} Total Services)
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder="Search temple services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '350px', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((s, idx) => (
          <div
            key={s.id || idx}
            style={{
              backgroundColor: 'var(--admin-bg-sidebar)',
              border: '1px solid rgba(214, 181, 109, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>
                {s.category || 'Ritual Service'}
              </span>
              <span style={{ backgroundColor: 'rgba(142, 174, 104, 0.15)', color: '#8EAE68', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>
                🟢 {s.status || 'Active'}
              </span>
            </div>

            <h3 className="serif-title" style={{ fontSize: '1.2rem', color: '#FFFDF9', margin: '0 0 0.5rem' }}>
              {s.name}
            </h3>

            <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', lineHeight: '1.5', margin: '0 0 1rem' }}>
              {s.description || 'Sacred offerings and rituals conducted at scheduled timings.'}
            </p>

            <div style={{ borderTop: '1px solid rgba(214, 181, 109, 0.1)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--admin-gold)' }}>
                {s.price || '₹501'}
              </span>
              {s.assignedInCharge && (
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  In-Charge: <strong style={{ color: '#FFFDF9' }}>{s.assignedInCharge.name}</strong>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
