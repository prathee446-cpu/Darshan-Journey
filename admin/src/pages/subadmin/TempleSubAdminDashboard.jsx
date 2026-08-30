import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Library, BookOpen, IndianRupee, Clock, CheckCircle2, 
  RefreshCw, ArrowRight, Sparkles, MapPin 
} from 'lucide-react';
import { getAuthHeaders, getCurrentUser } from '../../utils/auth';

export default function TempleSubAdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchTempleDashboard = async () => {
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
    fetchTempleDashboard();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTempleDashboard();
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage('✨ Temple data synchronized with backend!');
      setTimeout(() => setToastMessage(''), 4000);
    }, 600);
  };

  if (loading && !data) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw size={36} className="spin-slow" style={{ color: '#8EAE68' }} />
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.95rem' }}>Loading your Temple Sanctum...</p>
      </div>
    );
  }

  const user = data?.user || {};
  const temple = data?.temple || {};
  const services = data?.services || [];
  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#1E2C1E', border: '1px solid #8EAE68', color: '#D4E7C5', padding: '0.85rem 1.25rem', borderRadius: '8px', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      {/* 1. Welcome Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(30, 44, 30, 0.9) 0%, rgba(18, 9, 7, 0.95) 100%)',
          border: '1px solid rgba(142, 174, 104, 0.35)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #8EAE68 0%, #D6B56D 50%, #8EAE68 100%)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(142, 174, 104, 0.15)', border: '1px solid rgba(142, 174, 104, 0.3)', borderRadius: '20px', padding: '0.3rem 0.85rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} style={{ color: '#8EAE68' }} />
              <span style={{ fontSize: '0.75rem', color: '#D4E7C5', fontWeight: '600', textTransform: 'uppercase' }}>
                TEMPLE IN-CHARGE GOVERNANCE
              </span>
            </div>

            <h1 className="serif-title" style={{ fontSize: '2rem', fontWeight: '700', color: '#FFFDF9', margin: '0 0 0.4rem' }}>
              Welcome, {user.name || 'Arun Kumar'}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--admin-gold)', margin: 0, fontWeight: '500' }}>
              🛕 {temple.name || 'Kapaleeshwarar Temple'} &nbsp;·&nbsp; <span style={{ color: '#D4E7C5' }}>City: {temple.city || 'Chennai'}</span> &nbsp;·&nbsp; <span style={{ color: '#8EAE68' }}>🟢 Active</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(214, 181, 109, 0.1)',
                border: '1px solid rgba(214, 181, 109, 0.25)',
                borderRadius: '8px',
                color: 'var(--admin-gold)',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-slow' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-gold)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Temple Services</span>
            <Library size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#FFFDF9' }}>{stats.totalServices || services.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#8EAE68', marginTop: '0.2rem' }}>Pooja, Prasadam & Darshan</div>
        </div>

        <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-gold)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Temple Bookings</span>
            <BookOpen size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#FFFDF9' }}>{stats.totalBookings || 6}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Devotee reservations</div>
        </div>

        <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8EAE68', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Confirmed</span>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#FFFDF9' }}>{stats.confirmedBookings || 4}</div>
          <div style={{ fontSize: '0.72rem', color: '#8EAE68', marginTop: '0.2rem' }}>Ready for darshan</div>
        </div>

        <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-gold)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Temple Revenue</span>
            <IndianRupee size={18} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--admin-gold)' }}>{stats.totalRevenue || '₹22,750'}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>Gross temple proceeds</div>
        </div>
      </div>

      {/* 3. Temple Overview Card */}
      <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="serif-title" style={{ fontSize: '1.3rem', color: '#FFFDF9', margin: 0 }}>
            {temple.name || 'Kapaleeshwarar Temple'} — Governance
          </h3>
          <button
            onClick={() => navigate('/sub-admin/temple/overview')}
            style={{ background: 'none', border: 'none', color: '#8EAE68', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Manage Temple Details <ArrowRight size={13} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', lineHeight: '1.6', margin: '0 0 1rem' }}>
          {temple.description || 'Ancient Dravidian masterpiece dedicated to Lord Shiva and Goddess Karpagambal in the heart of Mylapore, Chennai.'}
        </p>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          <div><span style={{ color: 'var(--admin-gold)', fontWeight: '600' }}>City / District:</span> <span style={{ color: '#FFFDF9' }}>{temple.city || 'Chennai'}</span></div>
          <div><span style={{ color: 'var(--admin-gold)', fontWeight: '600' }}>State:</span> <span style={{ color: '#FFFDF9' }}>{temple.state || 'Tamil Nadu'}</span></div>
          <div><span style={{ color: 'var(--admin-gold)', fontWeight: '600' }}>Status:</span> <span style={{ color: '#8EAE68', fontWeight: '600' }}>🟢 Active</span></div>
        </div>
      </div>

      {/* 4. Temple Services Grid */}
      <div style={{ backgroundColor: 'var(--admin-bg-sidebar)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '12px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 className="serif-title" style={{ fontSize: '1.2rem', color: '#FFFDF9', margin: '0 0 0.2rem' }}>
              Services for {temple.name || 'Kapaleeshwarar Temple'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', margin: 0 }}>
              Pooja, Prasadam and Darshan offerings exclusively under this temple
            </p>
          </div>
          <button
            onClick={() => navigate('/sub-admin/temple/services')}
            style={{ backgroundColor: 'rgba(200, 155, 75, 0.12)', border: '1px solid rgba(214, 181, 109, 0.3)', borderRadius: '6px', color: 'var(--admin-gold)', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
          >
            View All Services →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {services.map((s, idx) => (
            <div
              key={s.id || idx}
              style={{
                backgroundColor: 'rgba(18, 9, 7, 0.4)',
                border: '1px solid rgba(214, 181, 109, 0.12)',
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: '700' }}>
                  {s.category || 'Pooja Service'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#8EAE68', fontWeight: '700' }}>
                  🟢 {s.status || 'Active'}
                </span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFDF9', marginBottom: '0.4rem' }}>
                {s.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--admin-gold)', fontWeight: '600' }}>
                {s.price || '₹501'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
