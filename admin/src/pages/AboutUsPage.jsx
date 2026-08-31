import React, { useState, useEffect } from 'react';
import { 
  Info, Save, Eye, Sparkles, Image as ImageIcon, 
  Compass, Heart, Check, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';

export default function AboutUsPage() {
  const [formData, setFormData] = useState({
    heroTitle: "About Darshan Journey",
    heroSubtitle: "Where Technology Meets Spirituality.",
    heroTag: "Who We Are",
    heroDescription: "Darshan Journey is an AI-powered spiritual platform dedicated to helping devotees discover, plan, and experience meaningful pilgrimages with confidence. We combine authentic temple knowledge, intelligent planning, and modern technology to make every spiritual journey simple, accessible, and deeply fulfilling.",
    heroImage: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80",
    storyTitle: "Our Journey Began With a Simple Question",
    storyTag: "Our Genesis",
    storyParagraph1: "Millions of devotees travel to temples every year, yet planning a pilgrimage often involves fragmented information, uncertain schedules, and unnecessary stress. Temple timings change, rituals vary, booking systems differ, and trusted guidance isn't always easy to find.",
    storyParagraph2: "Darshan Journey was created to bridge this gap between timeless Vedic traditions and modern digital convenience.",
    storyParagraph3: "Our vision is to build one trusted platform where devotees can explore temples, plan personalized pilgrimages, receive authentic spiritual guidance, book services seamlessly, and stay connected to their faith—all from one place.",
    storyImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    missionTitle: "Our Mission",
    missionDescription: "To simplify spiritual journeys by providing reliable temple information, intelligent pilgrimage planning, and personalized devotional experiences through innovative technology while preserving India's rich spiritual and cultural heritage.",
    visionTitle: "Our Vision",
    visionDescription: "To become the world's most trusted AI-powered spiritual ecosystem, enabling millions of devotees to connect with temples, traditions, and divine experiences through one unified digital platform."
  });

  const [initialData, setInitialData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchAboutContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/about');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setFormData(json.data);
          setInitialData(json.data);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch About Us content.`);
      }
    } catch (err) {
      console.error('Failed to load About content from API:', err);
      setError('Unable to load About Us content. Please check the backend server / MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setInitialData(formData);
        showToast('✨ About Us page content updated & published live!');
      } else {
        alert('Failed to save changes. Please check server connection.');
      }
    } catch (err) {
      alert('Error updating About content: ' + err.message);
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

      {/* Header Controls */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', marginBottom: '0.2rem' }}>
            About Us Editorial Sanctuary
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            Edit the brand story, mission, vision, leadership narrative, and imagery of the public About page.
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
              gap: '0.5rem'
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
            {isSaving ? 'Saving...' : 'Save & Publish'}
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
            onClick={fetchAboutContent}
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
          <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>Loading About Us narrative from MongoDB...</p>
        </div>
      )}

      {/* Main Content Edit Panels */}
      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
        
        {/* Panel 1: About Hero & Narrative */}
        <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
          <h3 className="serif-title" style={{ fontSize: '1.1rem', color: 'var(--admin-gold)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={17} />
            About Page Hero & Overview
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Section Tag / Badge
              </label>
              <input
                type="text"
                value={formData.heroTag}
                onChange={(e) => handleChange('heroTag', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Hero Title
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.95rem', fontWeight: '600' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Hero Subtitle (Punchline)
              </label>
              <input
                type="text"
                value={formData.heroSubtitle}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Main Narrative Description
              </label>
              <textarea
                rows={4}
                value={formData.heroDescription}
                onChange={(e) => handleChange('heroDescription', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem', lineHeight: '1.5' }}
              />
            </div>

            <ImageUploader
              label="About Us Hero Banner Image"
              value={formData.heroImage}
              onChange={(newUrl) => handleChange('heroImage', newUrl)}
              defaultImage="https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80"
              helperText="Upload or paste image URL for the top About header carving visual."
            />
          </div>
        </div>

        {/* Panel 2: Our Story / Genesis Narrative */}
        <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
          <h3 className="serif-title" style={{ fontSize: '1.1rem', color: 'var(--admin-gold)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={17} />
            Our Story & Genesis
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Story Section Title
              </label>
              <input
                type="text"
                value={formData.storyTitle}
                onChange={(e) => handleChange('storyTitle', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Story Paragraph 1 (Problem / Context)
              </label>
              <textarea
                rows={3}
                value={formData.storyParagraph1}
                onChange={(e) => handleChange('storyParagraph1', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem', lineHeight: '1.4' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Story Paragraph 2 (Solution / Genesis)
              </label>
              <textarea
                rows={2}
                value={formData.storyParagraph2}
                onChange={(e) => handleChange('storyParagraph2', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem', lineHeight: '1.4' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Story Paragraph 3 (Visionary Commitment)
              </label>
              <textarea
                rows={3}
                value={formData.storyParagraph3}
                onChange={(e) => handleChange('storyParagraph3', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem', lineHeight: '1.4' }}
              />
            </div>

            <ImageUploader
              label="Our Story Feature Image"
              value={formData.storyImage}
              onChange={(newUrl) => handleChange('storyImage', newUrl)}
              defaultImage="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80"
              helperText="Upload or paste image URL for the Our Story section visual."
            />
          </div>
        </div>

        {/* Panel 3: Mission & Vision */}
        <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)', gridColumn: '1 / -1' }}>
          <h3 className="serif-title" style={{ fontSize: '1.1rem', color: 'var(--admin-gold)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={17} />
            Mission & Vision Statements
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Our Mission
              </label>
              <textarea
                rows={4}
                value={formData.missionDescription}
                onChange={(e) => handleChange('missionDescription', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem', lineHeight: '1.5' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                Our Vision
              </label>
              <textarea
                rows={4}
                value={formData.visionDescription}
                onChange={(e) => handleChange('visionDescription', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem', lineHeight: '1.5' }}
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
                padding: '2rem',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setIsPreviewOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}>
                <X size={22} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(214, 181, 109, 0.2)', paddingBottom: '1.5rem' }}>
                <span style={{ color: 'var(--admin-gold)', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {formData.heroTag}
                </span>
                <h1 className="serif-title" style={{ fontSize: '2rem', color: '#FFFDF9', marginTop: '0.4rem' }}>
                  {formData.heroTitle}
                </h1>
                <h3 style={{ color: '#C89B4B', fontSize: '1.1rem', marginTop: '0.2rem' }}>
                  {formData.heroSubtitle}
                </h3>
                <p style={{ color: '#EEDCB9', maxWidth: '650px', margin: '1rem auto 0', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  {formData.heroDescription}
                </p>
              </div>

              {/* Mission & Vision Preview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.25)', borderRadius: '12px' }}>
                  <h4 className="serif-title" style={{ color: 'var(--admin-gold)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    🕉️ {formData.missionTitle}
                  </h4>
                  <p style={{ color: '#EEDCB9', fontSize: '0.86rem', lineHeight: '1.5' }}>
                    {formData.missionDescription}
                  </p>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.25)', borderRadius: '12px' }}>
                  <h4 className="serif-title" style={{ color: 'var(--admin-gold)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    ✨ {formData.visionTitle}
                  </h4>
                  <p style={{ color: '#EEDCB9', fontSize: '0.86rem', lineHeight: '1.5' }}>
                    {formData.visionDescription}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
