import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Plus, Trash2, Eye, Copy, 
  Sparkles, Check, X, Filter, Upload, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';

export default function MediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [previewImage, setPreviewImage] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'Temples',
    size: '1.2 MB'
  });

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMediaList(data);
        } else {
          setError('Invalid media records format.');
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch media.`);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('Unable to load media assets. Please check the backend server / MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    showToast('Asset URL copied to clipboard!');
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast('Image registered to Media Vault!');
        await fetchMedia();
        setIsAddModalOpen(false);
        setFormData({ title: '', url: '', category: 'Temples', size: '1.2 MB' });
      }
    } catch (err) {
      alert('Error adding media: ' + err.message);
    }
  };

  const handleDeleteMedia = async (id) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Asset removed from vault.');
        setMediaList(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      alert('Error removing asset: ' + err.message);
    }
  };

  const filteredMedia = mediaList.filter(m => {
    if (selectedCategory === 'ALL') return true;
    return (m.category || '').toUpperCase() === selectedCategory.toUpperCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              backgroundColor: 'var(--admin-bg-sidebar)',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.85rem 1.4rem',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.9rem'
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--admin-gold)' }} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', marginBottom: '0.2rem' }}>
            Media Gallery & Asset Vault
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            Central repository of sacred temple photos, deity imagery, rituals, and banner assets.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
            border: '1px solid var(--admin-gold)',
            color: '#FFFDF9',
            padding: '0.6rem 1.4rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(200, 155, 75, 0.3)'
          }}
        >
          <Plus size={16} />
          Add Media Asset
        </button>
      </div>

      {/* Category Tabs */}
      <div className="glassmorphism" style={{ padding: '0.8rem 1.25rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'TEMPLES', 'RITUALS', 'PRASADAM', 'POOJA ITEMS'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              border: selectedCategory === cat ? '1px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.15)',
              backgroundColor: selectedCategory === cat ? 'rgba(200, 155, 75, 0.18)' : 'transparent',
              color: selectedCategory === cat ? '#FFFDF9' : 'var(--admin-text-muted)',
              fontSize: '0.78rem',
              fontWeight: selectedCategory === cat ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(192, 90, 78, 0.15)',
            border: '1px solid rgba(192, 90, 78, 0.4)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: '#FFFDF9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={24} style={{ color: 'var(--admin-danger)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Database Connection Alert</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={fetchMedia}
            style={{
              backgroundColor: 'rgba(192, 90, 78, 0.3)',
              border: '1px solid rgba(192, 90, 78, 0.6)',
              color: '#FFFDF9',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap'
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && !error && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-gold)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>Loading media vault from MongoDB...</p>
        </div>
      )}

      {/* Media Grid Cards */}
      {!loading && !error && filteredMedia.length === 0 ? (
        <div className="glassmorphism" style={{ padding: '3rem', textAlign: 'center', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.15)' }}>
          <ImageIcon size={36} style={{ color: 'var(--admin-gold)', opacity: 0.5, margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#FFFDF9', marginBottom: '0.5rem' }}>No Media Assets Found</h3>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {selectedCategory !== 'ALL'
              ? 'No media assets found under this category filter.'
              : 'No media items have been registered yet.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              backgroundColor: 'var(--admin-primary-brown)',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.5rem 1.2rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Add Media Asset
          </button>
        </div>
      ) : !loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.4rem' }}>
          {filteredMedia.map(m => (
            <motion.div
              key={m.id}
              className="glassmorphism"
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(214, 181, 109, 0.18)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              whileHover={{ y: -3, borderColor: 'rgba(200, 155, 75, 0.45)' }}
            >
              <div>
                <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={m.url}
                    alt={m.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <span style={{ backgroundColor: 'rgba(36, 20, 17, 0.85)', color: 'var(--admin-gold)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {m.category}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '0.9rem 1rem' }}>
                  <h4 style={{ color: '#FFFDF9', fontSize: '0.9rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.title}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-muted)', fontSize: '0.72rem' }}>
                    <span>{m.size || '1.2 MB'}</span>
                    <span>{m.uploadedAt || '2026-08-16'}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.7rem 1rem', borderTop: '1px solid rgba(214, 181, 109, 0.1)', backgroundColor: 'rgba(18, 9, 7, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => handleCopyLink(m.url)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--admin-gold)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={13} />
                  Copy URL
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => setPreviewImage(m)}
                    style={{ background: 'none', border: '1px solid rgba(214, 181, 109, 0.2)', color: 'var(--admin-cream)', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}
                    title="Preview"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteMedia(m.id)}
                    style={{ background: 'none', border: '1px solid rgba(192, 90, 78, 0.3)', color: 'var(--admin-danger)', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}
                    title="Delete image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FULLSCREEN IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {previewImage && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: '800px', width: '100%', position: 'relative', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewImage(null)}
                style={{ position: 'absolute', top: '-2.5rem', right: 0, background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              <img
                src={previewImage.url}
                alt={previewImage.title}
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px', border: '1.5px solid var(--admin-gold)' }}
              />
              <div style={{ marginTop: '1rem', color: '#FFFDF9' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{previewImage.title}</h4>
                <p style={{ color: 'var(--admin-gold)', fontSize: '0.85rem' }}>{previewImage.url}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD MEDIA MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(5px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '520px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h3 className="serif-title" style={{ fontSize: '1.3rem', color: '#FFFDF9', marginBottom: '1.5rem', borderBottom: '1px solid rgba(214, 181, 109, 0.2)', paddingBottom: '0.8rem' }}>
                Add Media to Asset Vault
              </h3>

              <form onSubmit={handleAddMedia} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Asset Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Kedarnath Shiva Temple Gopuram"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Category Domain *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.8)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  >
                    <option value="Temples">Temples & Shrines</option>
                    <option value="Rituals">Rituals & Aartis</option>
                    <option value="Prasadam">Prasadam & Offerings</option>
                    <option value="Pooja Items">Pooja Items & Idols</option>
                    <option value="Banners">Banners & Backgrounds</option>
                  </select>
                </div>

                <ImageUploader
                  label="Media Asset Image File or URL *"
                  value={formData.url}
                  onChange={(newUrl) => setFormData(prev => ({ ...prev, url: newUrl }))}
                  helperText="Upload image directly or paste image web link."
                />

                <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: '1px solid var(--admin-gold)', background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))', color: '#FFFDF9', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Upload Asset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
