import React, { useState, useEffect } from 'react';
import { 
  FileText, Save, RefreshCw, Eye, Sparkles, Check, 
  ArrowRight, Image as ImageIcon, Link as LinkIcon, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';

export default function WebsiteContentPage() {
  const [formData, setFormData] = useState({
    heroTitle: "Experience Divine Peace & Spiritual Heritage",
    heroSubtitle: "WELCOME TO OUR SACRED SANCTUARY",
    heroDescription: "Immerse yourself in sacred traditions, daily Vedic rituals, virtual darshan, and timeless temple heritage. Step into an oasis of peace, devotion, and divine bliss.",
    heroImage: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1600&q=80",
    ctaPrimaryText: "Explore Temples",
    ctaPrimaryLink: "/temples",
    ctaSecondaryText: "Book Darshan",
    ctaSecondaryLink: "/services",
    promotionalBannerText: "✨ Maha Shivratri 2026 Special Live Rudra Abhishekam bookings are now open! Reserve your sacred slot today.",
    promotionalBannerActive: true,
    featuredTagline: "SACRED HERITAGE & MODERN CONVENIENCE"
  });

  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch current live content from Express API
  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setFormData(json.data);
          setInitialData(json.data);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch homepage content.`);
      }
    } catch (err) {
      console.error('Failed to load website content from API:', err);
      setError('Unable to load website content. Please check the backend server / MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setInitialData(formData);
        showToast('✨ Homepage content successfully saved & synchronized across public website!');
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || 'Failed to save changes. Please verify server connection.');
      }
    } catch (err) {
      alert('Error updating content: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    showToast('Reverted modifications to last saved version.');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

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

      {/* Header Banner */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', marginBottom: '0.2rem' }}>
            Website Content Sanctuary
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            Manage the live headlines, banner media, promotional announcements, and CTAs displayed on the public portal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            style={{
              background: 'rgba(214, 181, 109, 0.08)',
              border: '1px solid rgba(214, 181, 109, 0.25)',
              color: 'var(--admin-gold)',
              padding: '0.55rem 1.1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <Eye size={15} />
            Live Preview
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: '1px solid rgba(214, 181, 109, 0.2)',
              color: 'var(--admin-text-muted)',
              padding: '0.55rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.55rem 1.4rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(200, 155, 75, 0.3)'
            }}
          >
            <Save size={15} />
            {isSaving ? 'Synchronizing...' : 'Save & Publish'}
          </button>
        </div>
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
            onClick={fetchContent}
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
          <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>Loading live website content from MongoDB...</p>
        </div>
      )}

      {/* Main Content Form Panels */}
      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
        
        {/* Panel 1: Homepage Hero Section */}
        <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
          <h3 className="serif-title" style={{ fontSize: '1.1rem', color: 'var(--admin-gold)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={17} />
            Homepage Hero Section
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Subtitle / Badge Tag
              </label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  color: '#FFFDF9',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Main Hero Title
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  color: '#FFFDF9',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Hero Description
              </label>
              <textarea
                rows={4}
                value={formData.heroDescription}
                onChange={(e) => handleChange('heroDescription', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  color: '#FFFDF9',
                  fontSize: '0.88rem',
                  lineHeight: '1.5'
                }}
              />
            </div>

            <ImageUploader
              label="Homepage Hero Background Image"
              value={formData.heroImage}
              onChange={(newUrl) => handleChange('heroImage', newUrl)}
              defaultImage="/temple_hero_bg.png"
              helperText="Upload a photo from your computer, paste an image URL, or use the original temple sanctuary visual."
            />
          </div>
        </div>

        {/* Panel 2: CTA Buttons & Promotional Sections */}
        <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
          <h3 className="serif-title" style={{ fontSize: '1.1rem', color: 'var(--admin-gold)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkIcon size={17} />
            Call To Actions & Promotions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  value={formData.ctaPrimaryText}
                  onChange={(e) => handleChange('ctaPrimaryText', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(214, 181, 109, 0.25)',
                    backgroundColor: 'rgba(18, 9, 7, 0.6)',
                    color: '#FFFDF9',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  Primary CTA Target
                </label>
                <input
                  type="text"
                  value={formData.ctaPrimaryLink}
                  onChange={(e) => handleChange('ctaPrimaryLink', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(214, 181, 109, 0.25)',
                    backgroundColor: 'rgba(18, 9, 7, 0.6)',
                    color: '#FFFDF9',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  value={formData.ctaSecondaryText}
                  onChange={(e) => handleChange('ctaSecondaryText', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(214, 181, 109, 0.25)',
                    backgroundColor: 'rgba(18, 9, 7, 0.6)',
                    color: '#FFFDF9',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  Secondary CTA Target
                </label>
                <input
                  type="text"
                  value={formData.ctaSecondaryLink}
                  onChange={(e) => handleChange('ctaSecondaryLink', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(214, 181, 109, 0.25)',
                    backgroundColor: 'rgba(18, 9, 7, 0.6)',
                    color: '#FFFDF9',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Promotional Header Announcement
              </label>
              <textarea
                rows={3}
                value={formData.promotionalBannerText}
                onChange={(e) => handleChange('promotionalBannerText', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  color: '#FFFDF9',
                  fontSize: '0.88rem',
                  lineHeight: '1.4'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="promoActive"
                checked={formData.promotionalBannerActive}
                onChange={(e) => handleChange('promotionalBannerActive', e.target.checked)}
                style={{ height: '18px', width: '18px', accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
              />
              <label htmlFor="promoActive" style={{ color: 'var(--admin-cream)', fontSize: '0.85rem', cursor: 'pointer' }}>
                Display Promotional Top Bar to all visitors
              </label>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Featured Section Tagline
              </label>
              <input
                type="text"
                value={formData.featuredTagline}
                onChange={(e) => handleChange('featuredTagline', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  color: '#FFFDF9',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>
        </div>
      </form>

      {/* LIVE PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: '#241411',
                borderRadius: '16px',
                border: '1.5px solid var(--admin-gold)',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(214, 181, 109, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--admin-gold)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  🕉️ Public Website Hero Live Preview
                </span>
                <button onClick={() => setIsPreviewOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Promotional Bar Preview */}
              {formData.promotionalBannerActive && (
                <div style={{ backgroundColor: 'var(--admin-gold)', color: '#241411', padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.82rem', fontWeight: 'bold' }}>
                  {formData.promotionalBannerText}
                </div>
              )}

              {/* Hero Banner Preview */}
              <div
                style={{
                  position: 'relative',
                  minHeight: '400px',
                  backgroundImage: `linear-gradient(rgba(36, 20, 17, 0.75), rgba(36, 20, 17, 0.85)), url(${formData.heroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: '3.5rem 2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <span style={{ color: 'var(--admin-gold)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.8rem' }}>
                  {formData.heroSubtitle}
                </span>

                <h1 className="serif-title" style={{ fontSize: '2.2rem', color: '#FFFDF9', maxWidth: '700px', lineHeight: '1.3', marginBottom: '1rem' }}>
                  {formData.heroTitle}
                </h1>

                <p style={{ color: '#EEDCB9', maxWidth: '600px', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
                  {formData.heroDescription}
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button style={{ backgroundColor: 'var(--admin-gold)', color: '#241411', padding: '0.65rem 1.4rem', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    {formData.ctaPrimaryText} →
                  </button>
                  <button style={{ backgroundColor: 'transparent', color: '#FFFDF9', border: '1.5px solid var(--admin-gold)', padding: '0.65rem 1.4rem', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {formData.ctaSecondaryText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
