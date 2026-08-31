import React, { useState } from 'react';
import { X, Play, Compass, BookOpen, Volume2 } from 'lucide-react';
import logoImg from '../assets/darshan-logo.png';

const TEMPLES = [
  {
    id: 1,
    name: 'Kedarnath Temple',
    location: 'Garhwal Himalayas, Uttarakhand',
    description: 'Ancient stone shrine dedicated to Lord Shiva situated among majestic snowcapped Himalayan peaks at 3,583m altitude.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    tags: ['Jyotirlinga', 'Live Darshan', 'Aarti Audio'],
  },
  {
    id: 2,
    name: 'Kashi Vishwanath',
    location: 'Varanasi, Uttar Pradesh',
    description: 'The golden temple of Shiva on the sacred banks of the River Ganga, radiating eternal spiritual enlightenment.',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    tags: ['Sacred Ganga', '360° View', 'Ganga Aarti'],
  },
  {
    id: 3,
    name: 'Mahakaleshwar Temple',
    location: 'Ujjain, Madhya Pradesh',
    description: 'Home to the swayambhu (self-manifested) Lingam and the world-renowned Bhasma Aarti at sunrise.',
    image: 'https://images.unsplash.com/photo-1609946782701-790100780287?auto=format&fit=crop&w=800&q=80',
    tags: ['Bhasma Aarti', 'Jyotirlinga', 'Live Feed'],
  },
  {
    id: 4,
    name: 'Meenakshi Sundareswarar',
    location: 'Madurai, Tamil Nadu',
    description: 'Architectural masterpiece featuring towering sculpted gopurams and the divine union of Shiva and Parvati.',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    tags: ['Dravidian Marvel', 'Virtual Tour', 'Chants'],
  },
];

export default function VirtualDarshanModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('temples');
  const [selectedTemple, setSelectedTemple] = useState(null);

  if (!isOpen) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <img 
              src={logoImg} 
              alt="Darshan Journey Logo" 
              style={{ 
                height: '52px', 
                width: 'auto', 
                filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))',
                objectFit: 'contain'
              }} 
            />
            <div>
              <h2 className="drawer-title">Explore Divine Temples</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                Immerse in virtual darshan, sacred chants, and ancient temple heritage
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={26} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.8rem' }}>
          <button
            onClick={() => setActiveTab('temples')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'temples' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'temples' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              paddingBottom: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Compass size={18} /> Sacred Shrines
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'stories' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'stories' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              paddingBottom: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <BookOpen size={18} /> Spiritual Stories
          </button>
        </div>

        {/* Content View */}
        {activeTab === 'temples' && (
          <div className="temple-grid">
            {TEMPLES.map((t) => (
              <div key={t.id} className="temple-card" onClick={() => setSelectedTemple(t)}>
                <div style={{ position: 'relative' }}>
                  <img src={t.image} alt={t.name} className="temple-img" />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(18, 12, 7, 0.9) 0%, transparent 60%)'
                  }} />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(25, 16, 10, 0.75)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: 'var(--gold-light)',
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: '99px',
                    backdropFilter: 'blur(6px)'
                  }}>
                    {t.tags[0]}
                  </span>
                </div>
                <div className="temple-info">
                  <h3 className="temple-name">{t.name}</h3>
                  <div className="temple-loc">{t.location}</div>
                  <p className="temple-desc">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stories' && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem 0' }}>
            <Volume2 size={48} style={{ color: 'var(--gold-mid)', marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              The Legend of Mount Kailash & Shiva's Cosmic Tandava
            </h3>
            <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
              Experience narrated audio stories exploring Lord Shiva's divine manifestations, the emergence of the 12 Jyotirlingas, and timeless Vedic philosophy.
            </p>
            <button className="btn-explore" onClick={() => alert('Playing Audio Story: The Legend of Kailash')}>
              <Play size={18} /> Listen to Audio Story
            </button>
          </div>
        )}

        {/* Selected Temple Modal Sub-Overlay */}
        {selectedTemple && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }} onClick={() => setSelectedTemple(null)}>
            <div style={{
              background: '#19100a',
              border: '1px solid var(--gold-primary)',
              borderRadius: '24px',
              maxWidth: '650px',
              width: '100%',
              padding: '2rem',
              position: 'relative'
            }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedTemple(null)}>
                <X size={24} />
              </button>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                {selectedTemple.name}
              </h2>
              <p style={{ color: 'var(--gold-mid)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                {selectedTemple.location}
              </p>
              <img src={selectedTemple.image} alt={selectedTemple.name} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '16px', marginBottom: '1.2rem' }} />
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {selectedTemple.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-login" style={{ flex: 1 }} onClick={() => alert(`Starting Live Virtual Darshan for ${selectedTemple.name}`)}>
                  Begin Live Darshan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
