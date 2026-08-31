import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Info, MapPin, Sparkles, Tag, Lock, Phone,
  Layers, Image as ImageIcon, Save, Send, RotateCcw,
  Eye, Check, X, Search, Plus, Trash2, Edit3,
  ExternalLink, Upload, AlertCircle, RefreshCw, Copy,
  Monitor, Smartphone, Tablet, ChevronDown, ChevronRight,
  BookOpen, Heart, Shield, Award, Calendar, CheckCircle2,
  Sliders, ArrowRight, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Page Category Navigation Definition
const PAGE_CATEGORIES = [
  { key: 'home', label: 'Home Page', icon: Globe, badge: 'Main Landing' },
  { key: 'about', label: 'About Us', icon: Info, badge: 'Genesis & Mission' },
  { key: 'temples', label: 'Explore Temples', icon: MapPin, badge: 'Shrines Directory' },
  { key: 'services', label: 'Services & Offerings', icon: Sparkles, badge: 'Pooja & Prasadam' },
  { key: 'booking', label: 'Booking Pages', icon: Tag, badge: 'Reservation Flow' },
  { key: 'articles', label: 'Articles & Blogs', icon: BookOpen, badge: 'Vedic Knowledge' },
  { key: 'login', label: 'Login & Auth', icon: Lock, badge: 'Devotee Portal' },
  { key: 'contact', label: 'Contact Page', icon: Phone, badge: 'Support & Help' },
  { key: 'brand', label: 'Brand & Global Assets', icon: Award, badge: 'Logos & Footer' },
  { key: 'vault', label: 'Media Vault', icon: Layers, badge: 'Asset Gallery' }
];

export default function MediaPage() {
  // Navigation & Page State
  const [activeCategory, setActiveCategory] = useState('home');
  const [pagesContent, setPagesContent] = useState({});
  const [currentEditData, setCurrentEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status & Actions
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Viewport & Preview Settings
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [viewLayout, setViewLayout] = useState('split'); // 'split' | 'editor' | 'preview'
  const [expandedSections, setExpandedSections] = useState({
    hero: true,
    darshanCards: true,
    story: true,
    mission: true,
    pillars: true,
    reviews: true,
    banner: true,
    details: true
  });

  // Articles & Vault Management State
  const [articlesList, setArticlesList] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('ALL');

  const [mediaVaultList, setMediaVaultList] = useState([]);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Image Replacement Modal State
  const [imageModalConfig, setImageModalConfig] = useState(null);
  // { isOpen: boolean, fieldPath: string, currentUrl: string, title: string, onSelect: (url) => void }
  const [imageModalTab, setImageModalTab] = useState('upload'); // 'upload' | 'url' | 'library'
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState('');
  const [uploadFileError, setUploadFileError] = useState('');

  // 1. Fetch CMS Content from Server
  const fetchAllContent = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Page-wise Content
      const contentRes = await fetch('/api/content/all');
      if (contentRes.ok) {
        const json = await contentRes.json();
        if (json.data) {
          setPagesContent(json.data);
          const initialPageData = json.data[activeCategory]?.draft || json.data[activeCategory]?.published || {};
          setCurrentEditData(JSON.parse(JSON.stringify(initialPageData)));
        }
      }

      // Fetch Articles
      const articlesRes = await fetch('/api/articles');
      if (articlesRes.ok) {
        const artJson = await articlesRes.json();
        if (artJson.data) setArticlesList(artJson.data);
      }

      // Fetch Media Assets
      const mediaRes = await fetch('/api/media');
      if (mediaRes.ok) {
        const mediaJson = await mediaRes.json();
        if (Array.isArray(mediaJson)) setMediaVaultList(mediaJson);
      }
    } catch (err) {
      console.error('Failed to fetch CMS content:', err);
      setError('Unable to load website content from server. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  // When active category switches, update local editor data
  useEffect(() => {
    if (pagesContent[activeCategory]) {
      const pageInfo = pagesContent[activeCategory];
      const pageData = pageInfo.draft || pageInfo.published || {};
      setCurrentEditData(JSON.parse(JSON.stringify(pageData)));
      setIsDirty(false);
    }
  }, [activeCategory, pagesContent]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Field change handler
  const handleFieldChange = (path, value) => {
    setIsDirty(true);
    setCurrentEditData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  // 2. SAVE DRAFT
  const handleSaveDraft = async () => {
    if (activeCategory === 'vault') return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/content/draft/${activeCategory}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEditData)
      });
      const json = await res.json();
      if (res.ok) {
        setIsDirty(false);
        setPagesContent(prev => ({
          ...prev,
          [activeCategory]: json.data
        }));
        showToast(`💾 Draft saved safely for ${PAGE_CATEGORIES.find(c => c.key === activeCategory)?.label}! (Live website untouched)`);
      } else {
        alert(json.message || 'Failed to save draft.');
      }
    } catch (err) {
      alert('Error saving draft: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. PUBLISH TO LIVE WEBSITE
  const handlePublish = async () => {
    if (activeCategory === 'vault') return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/content/publish/${activeCategory}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEditData)
      });
      const json = await res.json();
      if (res.ok) {
        setIsDirty(false);
        setPagesContent(prev => ({
          ...prev,
          [activeCategory]: json.data
        }));
        showToast(`✨ ${PAGE_CATEGORIES.find(c => c.key === activeCategory)?.label} is now published LIVE on Darshan Journey!`);
      } else {
        alert(json.message || 'Failed to publish content.');
      }
    } catch (err) {
      alert('Error publishing content: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // 4. DISCARD DRAFT
  const handleDiscardDraft = async () => {
    if (!window.confirm(`Discard unsaved and draft changes for ${PAGE_CATEGORIES.find(c => c.key === activeCategory)?.label}? This will revert to the live published version.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/content/discard/${activeCategory}`, { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setPagesContent(prev => ({
          ...prev,
          [activeCategory]: json.data
        }));
        setCurrentEditData(JSON.parse(JSON.stringify(json.data.published || {})));
        setIsDirty(false);
        showToast('Reverted modifications to live published version.');
      }
    } catch (err) {
      alert('Error discarding draft: ' + err.message);
    }
  };

  // 5. Open Image Picker / Uploader
  const openImagePicker = (fieldPath, currentUrl, title) => {
    setImageModalConfig({
      isOpen: true,
      fieldPath,
      currentUrl: currentUrl || '',
      title: title || 'Change Photo'
    });
    setCustomImageUrl(currentUrl || '');
    setUploadPreviewUrl('');
    setUploadFileError('');
    setImageModalTab('upload');
  };

  const handleApplyImage = (newUrl) => {
    if (!newUrl) return;
    if (imageModalConfig?.fieldPath) {
      handleFieldChange(imageModalConfig.fieldPath, newUrl);
    }
    setImageModalConfig(null);
    showToast('Photo selected! Instant preview updated in right panel.');
  };

  const handleFileUploadChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadFileError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadFileError('Image size exceeds 8MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64 = evt.target?.result;
      setUploadPreviewUrl(base64);

      // Upload to server
      try {
        const uploadRes = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            name: file.name
          })
        });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.url) {
          setUploadPreviewUrl(uploadJson.url);
        }
      } catch (uploadErr) {
        console.warn('Server upload notice, using local base64 preview:', uploadErr);
      }
    };
    reader.readAsDataURL(file);
  };

  // Active page status metadata
  const currentPageInfo = pagesContent[activeCategory] || {};
  const hasDraft = isDirty || currentPageInfo.hasDraft;

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articlesList.filter(art => {
      const matchSearch = (art.title || '').toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
                          (art.category || '').toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
                          (art.snippet || '').toLowerCase().includes(articleSearchQuery.toLowerCase());
      const matchCategory = articleCategoryFilter === 'ALL' || art.category === articleCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [articlesList, articleSearchQuery, articleCategoryFilter]);

  // Filtered Vault
  const filteredVault = useMemo(() => {
    return mediaVaultList.filter(item => {
      return (item.title || '').toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
             (item.category || '').toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
             (item.page || '').toLowerCase().includes(vaultSearchQuery.toLowerCase());
    });
  }, [mediaVaultList, vaultSearchQuery]);

  return (
    <div className="cms-management-root" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', minHeight: 'calc(100vh - 120px)' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 9999,
              background: 'linear-gradient(135deg, #181510 0%, #2a2012 100%)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(234, 179, 8, 0.2)',
              borderRadius: '12px',
              padding: '1rem 1.4rem',
              color: '#fef08a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              fontSize: '0.95rem',
              fontWeight: 500
            }}
          >
            <Sparkles size={20} className="text-yellow-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP PAGE-WISE CATEGORY BAR ── */}
      <div style={{
        background: 'rgba(24, 21, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(234, 179, 8, 0.15)',
        padding: '0.8rem 1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🕉️</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fef08a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Website Content & Media Studio
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
            Select a page category below to edit live photos, headings, text, and cards with real-time preview.
          </span>
        </div>

        {/* Categories Tab Scroll */}
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.4rem',
          scrollbarWidth: 'thin'
        }}>
          {PAGE_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            const pageState = pagesContent[cat.key];
            const isPageDraft = pageState?.hasDraft;

            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: '12px',
                  border: isActive 
                    ? '1px solid #eab308' 
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(202, 138, 4, 0.1) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#fef08a' : '#d4d4d8',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <Icon size={16} style={{ color: isActive ? '#eab308' : '#a1a1aa' }} />
                <span>{cat.label}</span>
                {isPageDraft && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                    boxShadow: '0 0 6px #f59e0b'
                  }} title="Draft modifications pending" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ACTION HEADER (PER PAGE) ── */}
      {activeCategory !== 'vault' && activeCategory !== 'articles' && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          background: 'rgba(20, 18, 14, 0.75)',
          borderRadius: '14px',
          border: '1px solid rgba(234, 179, 8, 0.12)',
          padding: '0.9rem 1.4rem'
        }}>
          {/* Left info & status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fef08a', margin: 0 }}>
                {PAGE_CATEGORIES.find(c => c.key === activeCategory)?.label} Management
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: '0.2rem 0 0 0' }}>
                Edit content on left panel. Real-time preview renders on right panel.
              </p>
            </div>

            {/* Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: hasDraft ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
              background: hasDraft ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
              color: hasDraft ? '#fbbf24' : '#4ade80'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: hasDraft ? '#fbbf24' : '#4ade80',
                boxShadow: hasDraft ? '0 0 8px #fbbf24' : '0 0 8px #4ade80'
              }} />
              <span>{hasDraft ? (isDirty ? '● Unsaved Edits' : '● Draft Saved (Unpublished)') : '● Live Published'}</span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Viewport switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '0.2rem',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <button
                onClick={() => setPreviewDevice('desktop')}
                title="Desktop View (100%)"
                style={{
                  padding: '0.35rem 0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: previewDevice === 'desktop' ? 'rgba(234, 179, 8, 0.25)' : 'transparent',
                  color: previewDevice === 'desktop' ? '#fef08a' : '#71717a',
                  cursor: 'pointer'
                }}
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                title="Tablet View (768px)"
                style={{
                  padding: '0.35rem 0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: previewDevice === 'tablet' ? 'rgba(234, 179, 8, 0.25)' : 'transparent',
                  color: previewDevice === 'tablet' ? '#fef08a' : '#71717a',
                  cursor: 'pointer'
                }}
              >
                <Tablet size={15} />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                title="Mobile View (375px)"
                style={{
                  padding: '0.35rem 0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  background: previewDevice === 'mobile' ? 'rgba(234, 179, 8, 0.25)' : 'transparent',
                  color: previewDevice === 'mobile' ? '#fef08a' : '#71717a',
                  cursor: 'pointer'
                }}
              >
                <Smartphone size={15} />
              </button>
            </div>

            {/* Discard Draft Button */}
            {hasDraft && (
              <button
                onClick={handleDiscardDraft}
                title="Discard draft changes and revert to live published version"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 0.9rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} />
                <span>Discard</span>
              </button>
            )}

            {/* Save Draft Button */}
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isPublishing}
              title="Save changes as draft without affecting live website"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '10px',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.05) 100%)',
                color: '#fef08a',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Draft</span>
            </button>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={isPublishing || isSaving}
              title="Publish saved draft changes to live main website"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.3rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                color: '#1a1306',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: isPublishing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(234, 179, 8, 0.35)',
                opacity: isPublishing ? 0.7 : 1
              }}
            >
              {isPublishing ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              <span>Publish to Live Site</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 6. MAIN STUDIO WORKSPACE (SPLIT VIEW) ── */}
      {activeCategory === 'articles' ? (
        /* ARTICLES MANAGEMENT VIEW */
        <ArticlesManagementView
          articlesList={filteredArticles}
          searchQuery={articleSearchQuery}
          setSearchQuery={setArticleSearchQuery}
          categoryFilter={articleCategoryFilter}
          setCategoryFilter={setArticleCategoryFilter}
          onOpenArticle={(art) => { setSelectedArticle(art); setIsArticleModalOpen(true); }}
          onNewArticle={() => {
            setSelectedArticle({
              title: '',
              slug: '',
              category: 'HERITAGE & VASTU',
              categoryBadge: '🏛️ HERITAGE & VASTU',
              author: 'Acharya Sundaram',
              authorRole: 'Vedic Architecture & Vastu Scholar',
              authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
              image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
              readTime: '5 MIN READ',
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
              snippet: '',
              content: '<p class="article-lead">Article content goes here...</p>',
              tags: ['Temple', 'Heritage', 'Vedic']
            });
            setIsArticleModalOpen(true);
          }}
          onDeleteArticle={async (id) => {
            if (!window.confirm('Are you sure you want to delete this article?')) return;
            try {
              const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
              if (res.ok) {
                setArticlesList(prev => prev.filter(a => a.id !== id && a.slug !== id));
                showToast('Article deleted successfully.');
              }
            } catch (e) { alert('Failed to delete: ' + e.message); }
          }}
        />
      ) : activeCategory === 'vault' ? (
        /* MEDIA VAULT ASSETS VIEW */
        <MediaVaultView
          mediaList={filteredVault}
          searchQuery={vaultSearchQuery}
          setSearchQuery={setVaultSearchQuery}
          onCopyLink={(url) => {
            navigator.clipboard.writeText(url);
            showToast('Asset URL copied to clipboard!');
          }}
          onOpenUpload={() => setIsUploadModalOpen(true)}
        />
      ) : (
        /* STANDARD PAGE SPLIT STUDIO (CONTROLS ON LEFT, LIVE PREVIEW ON RIGHT) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1fr) minmax(480px, 1.15fr)',
          gap: '1.4rem',
          alignItems: 'start'
        }}>
          
          {/* ── LEFT PANE: EDITABLE SECTION CONTROLS ── */}
          <div style={{
            background: 'rgba(20, 18, 14, 0.75)',
            borderRadius: '16px',
            border: '1px solid rgba(234, 179, 8, 0.15)',
            padding: '1.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            maxHeight: 'calc(100vh - 220px)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} className="text-yellow-400" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fef08a', margin: 0 }}>
                  Page Sections & Content Controls
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                Organized in page order
              </span>
            </div>

            {/* Render controls dynamically per active page */}
            {activeCategory === 'home' && (
              <HomePageControls
                data={currentEditData}
                onChange={handleFieldChange}
                onOpenImagePicker={openImagePicker}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            )}

            {activeCategory === 'about' && (
              <AboutPageControls
                data={currentEditData}
                onChange={handleFieldChange}
                onOpenImagePicker={openImagePicker}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            )}

            {activeCategory === 'temples' && (
              <TemplesPageControls
                data={currentEditData}
                onChange={handleFieldChange}
                onOpenImagePicker={openImagePicker}
              />
            )}

            {activeCategory === 'services' && (
              <ServicesPageControls
                data={currentEditData}
                onChange={handleFieldChange}
                onOpenImagePicker={openImagePicker}
              />
            )}

            {activeCategory === 'booking' && (
              <BookingPageControls
                data={currentEditData}
                onChange={handleFieldChange}
                onOpenImagePicker={openImagePicker}
              />
            )}

            {activeCategory === 'login' && (
              <LoginPageControls
                data={currentEditData}
                onChange={handleFieldChange}
                onOpenImagePicker={openImagePicker}
              />
            )}

            {activeCategory === 'contact' && (
              <ContactPageControls
                data={currentEditData}
                onChange={handleFieldChange}
                onOpenImagePicker={openImagePicker}
              />
            )}

            {activeCategory === 'brand' && (
              <BrandPageControls
                data={currentEditData}
                onChange={handleFieldChange}
                onOpenImagePicker={openImagePicker}
              />
            )}
          </div>

          {/* ── RIGHT PANE: LIVE INTERACTIVE PREVIEW ── */}
          <div style={{
            position: 'sticky',
            top: '16px',
            background: '#0c0a08',
            borderRadius: '16px',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 220px)'
          }}>
            {/* Live Preview Header Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 1rem',
              background: 'rgba(24, 21, 16, 0.95)',
              borderBottom: '1px solid rgba(234, 179, 8, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ display: 'flex', gap: '5px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fef08a' }}>
                  Live Preview — {PAGE_CATEGORIES.find(c => c.key === activeCategory)?.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  color: '#4ade80',
                  background: 'rgba(34, 197, 94, 0.12)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  fontWeight: 600
                }}>
                  ● Real-time sync
                </span>
              </div>
            </div>

            {/* Preview Frame Container */}
            <div style={{
              overflowY: 'auto',
              flex: 1,
              padding: previewDevice === 'desktop' ? '0' : '1.2rem',
              background: '#090806',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                width: previewDevice === 'desktop' ? '100%' : (previewDevice === 'tablet' ? '768px' : '375px'),
                transition: 'width 0.3s ease',
                background: '#0d0c0a',
                border: previewDevice !== 'desktop' ? '2px solid rgba(234, 179, 8, 0.3)' : 'none',
                borderRadius: previewDevice !== 'desktop' ? '16px' : '0',
                overflow: 'hidden',
                boxShadow: previewDevice !== 'desktop' ? '0 10px 30px rgba(0,0,0,0.8)' : 'none'
              }}>
                {/* Dynamic Page Live Renderer */}
                {activeCategory === 'home' && <HomeLivePreview data={currentEditData} />}
                {activeCategory === 'about' && <AboutLivePreview data={currentEditData} />}
                {activeCategory === 'temples' && <TemplesLivePreview data={currentEditData} />}
                {activeCategory === 'services' && <ServicesLivePreview data={currentEditData} />}
                {activeCategory === 'booking' && <BookingLivePreview data={currentEditData} />}
                {activeCategory === 'login' && <LoginLivePreview data={currentEditData} />}
                {activeCategory === 'contact' && <ContactLivePreview data={currentEditData} />}
                {activeCategory === 'brand' && <BrandLivePreview data={currentEditData} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE REPLACEMENT MODAL ── */}
      <AnimatePresence>
        {imageModalConfig?.isOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%',
                maxWidth: '560px',
                background: '#181510',
                borderRadius: '16px',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1rem 1.4rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ImageIcon size={18} className="text-yellow-400" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fef08a', margin: 0 }}>
                    {imageModalConfig.title}
                  </h3>
                </div>
                <button
                  onClick={() => setImageModalConfig(null)}
                  style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Tab Bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                <button
                  onClick={() => setImageModalTab('upload')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    borderBottom: imageModalTab === 'upload' ? '2px solid #eab308' : 'none',
                    background: 'transparent',
                    color: imageModalTab === 'upload' ? '#fef08a' : '#a1a1aa',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setImageModalTab('url')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    borderBottom: imageModalTab === 'url' ? '2px solid #eab308' : 'none',
                    background: 'transparent',
                    color: imageModalTab === 'url' ? '#fef08a' : '#a1a1aa',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Paste Image URL
                </button>
                <button
                  onClick={() => setImageModalTab('library')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: 'none',
                    borderBottom: imageModalTab === 'library' ? '2px solid #eab308' : 'none',
                    background: 'transparent',
                    color: imageModalTab === 'library' ? '#fef08a' : '#a1a1aa',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Vault Library
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {imageModalTab === 'upload' && (
                  <div>
                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.8rem',
                      padding: '2rem 1.5rem',
                      borderRadius: '12px',
                      border: '2px dashed rgba(234, 179, 8, 0.3)',
                      background: 'rgba(234, 179, 8, 0.03)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}>
                      <Upload size={32} className="text-yellow-400" />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#fef08a', fontSize: '0.92rem' }}>
                          Click to select a photo from your computer
                        </p>
                        <p style={{ margin: '0.3rem 0 0 0', color: '#71717a', fontSize: '0.78rem' }}>
                          Supports PNG, JPG, WEBP (Max 8MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUploadChange}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {uploadFileError && (
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.6rem 0 0 0' }}>
                        {uploadFileError}
                      </p>
                    )}

                    {uploadPreviewUrl && (
                      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Selected Preview:</p>
                        <img
                          src={uploadPreviewUrl}
                          alt="Preview"
                          style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.3)', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {imageModalTab === 'url' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#d4d4d8', marginBottom: '0.4rem' }}>
                      Image Direct Link / Path:
                    </label>
                    <input
                      type="text"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or /assets/photo.jpg"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(234, 179, 8, 0.2)',
                        background: '#090806',
                        color: '#fef08a',
                        fontSize: '0.85rem'
                      }}
                    />
                    {customImageUrl && (
                      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>URL Preview:</p>
                        <img
                          src={customImageUrl}
                          alt="URL Preview"
                          onError={(e) => { e.target.style.display = 'none'; }}
                          style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.3)', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {imageModalTab === 'library' && (
                  <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                    {mediaVaultList.slice(0, 15).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleApplyImage(item.url)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          overflow: 'hidden',
                          background: '#000',
                          position: 'relative'
                        }}
                      >
                        <img src={item.url} alt={item.title} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                        <div style={{ padding: '0.3rem', fontSize: '0.68rem', color: '#d4d4d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '0.9rem 1.4rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.6rem'
              }}>
                <button
                  onClick={() => setImageModalConfig(null)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: '#d4d4d8',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const finalUrl = imageModalTab === 'upload' ? uploadPreviewUrl : customImageUrl;
                    handleApplyImage(finalUrl);
                  }}
                  disabled={!(imageModalTab === 'upload' ? uploadPreviewUrl : customImageUrl)}
                  style={{
                    padding: '0.55rem 1.2rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                    color: '#1a1306',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Apply Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ARTICLE MODAL ── */}
      <ArticleEditModal
        isOpen={isArticleModalOpen}
        article={selectedArticle}
        onClose={() => setIsArticleModalOpen(false)}
        onSave={async (savedData) => {
          try {
            const res = await fetch('/api/articles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(savedData)
            });
            const json = await res.json();
            if (res.ok) {
              setArticlesList(prev => {
                const idx = prev.findIndex(a => a.slug === json.data.slug || a.id === json.data.id);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = json.data;
                  return copy;
                }
                return [json.data, ...prev];
              });
              setIsArticleModalOpen(false);
              showToast('✨ Article successfully saved & synchronized!');
            }
          } catch (e) { alert('Error saving article: ' + e.message); }
        }}
        openImagePicker={openImagePicker}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. HOME PAGE CONTROLS COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
function HomePageControls({ data = {}, onChange, onOpenImagePicker, expandedSections, toggleSection }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* 1. Hero Section */}
      <SectionCard
        title="1. Hero Banner Section"
        isOpen={expandedSections.hero}
        onToggle={() => toggleSection('hero')}
      >
        <ImageField
          label="Hero Background Photo"
          value={data.heroImage || '/temple_hero_bg.png'}
          onChange={(val) => onChange('heroImage', val)}
          onOpenPicker={() => onOpenImagePicker('heroImage', data.heroImage, 'Home Hero Background Photo')}
        />
        <TextInput
          label="Top Subtitle / Tagline"
          value={data.heroSubtitle || ''}
          onChange={(val) => onChange('heroSubtitle', val)}
          placeholder="WELCOME TO OUR SACRED SANCTUARY"
        />
        <TextInput
          label="Main Heading (H1)"
          value={data.heroTitle || ''}
          onChange={(val) => onChange('heroTitle', val)}
          placeholder="Experience Divine Peace & Spiritual Heritage"
        />
        <TextAreaInput
          label="Hero Description"
          value={data.heroDescription || ''}
          onChange={(val) => onChange('heroDescription', val)}
          rows={3}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <TextInput
            label="Primary CTA Text"
            value={data.ctaPrimaryText || ''}
            onChange={(val) => onChange('ctaPrimaryText', val)}
            placeholder="Explore Temples"
          />
          <TextInput
            label="Primary CTA Link"
            value={data.ctaPrimaryLink || ''}
            onChange={(val) => onChange('ctaPrimaryLink', val)}
            placeholder="/temples"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <TextInput
            label="Secondary CTA Text"
            value={data.ctaSecondaryText || ''}
            onChange={(val) => onChange('ctaSecondaryText', val)}
            placeholder="Book Darshan"
          />
          <TextInput
            label="Secondary CTA Link"
            value={data.ctaSecondaryLink || ''}
            onChange={(val) => onChange('ctaSecondaryLink', val)}
            placeholder="/services"
          />
        </div>
        <TextInput
          label="Promotional Alert Banner Text"
          value={data.promotionalBannerText || ''}
          onChange={(val) => onChange('promotionalBannerText', val)}
        />
      </SectionCard>

      {/* 2. Darshan Highlights Cards */}
      <SectionCard
        title="2. Darshan Cards & Offerings"
        isOpen={expandedSections.darshanCards}
        onToggle={() => toggleSection('darshanCards')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(data.darshanCards || []).map((card, idx) => (
            <div key={card.id || idx} style={{ background: '#090806', borderRadius: '10px', padding: '0.8rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fef08a' }}>Card {idx + 1}: {card.title}</span>
              </div>
              <ImageField
                label="Card Image"
                value={card.image}
                onChange={(val) => {
                  const cards = [...(data.darshanCards || [])];
                  cards[idx].image = val;
                  onChange('darshanCards', cards);
                }}
                onOpenPicker={() => onOpenImagePicker(`darshanCards.${idx}.image`, card.image, `Card ${idx + 1} Image`)}
              />
              <TextInput
                label="Card Title"
                value={card.title || ''}
                onChange={(val) => {
                  const cards = [...(data.darshanCards || [])];
                  cards[idx].title = val;
                  onChange('darshanCards', cards);
                }}
              />
              <TextAreaInput
                label="Description"
                value={card.description || ''}
                onChange={(val) => {
                  const cards = [...(data.darshanCards || [])];
                  cards[idx].description = val;
                  onChange('darshanCards', cards);
                }}
                rows={2}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <TextInput
                  label="Button Label"
                  value={card.buttonText || ''}
                  onChange={(val) => {
                    const cards = [...(data.darshanCards || [])];
                    cards[idx].buttonText = val;
                    onChange('darshanCards', cards);
                  }}
                />
                <TextInput
                  label="Button Target Link"
                  value={card.buttonLink || ''}
                  onChange={(val) => {
                    const cards = [...(data.darshanCards || [])];
                    cards[idx].buttonLink = val;
                    onChange('darshanCards', cards);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. ABOUT US CONTROLS COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
function AboutPageControls({ data = {}, onChange, onOpenImagePicker, expandedSections, toggleSection }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* 1. Who We Are — Hero */}
      <SectionCard
        title="1. Who We Are — Hero Section"
        isOpen={expandedSections.hero}
        onToggle={() => toggleSection('hero')}
      >
        <ImageField
          label="Hero Temple Sculpture Photo"
          value={data.heroImage || '/assets/temple_sculpture_about.jpg'}
          onChange={(val) => onChange('heroImage', val)}
          onOpenPicker={() => onOpenImagePicker('heroImage', data.heroImage, 'About Us Hero Sculpture Photo')}
        />
        <TextInput
          label="Top Badge / Tag"
          value={data.heroTag || ''}
          onChange={(val) => onChange('heroTag', val)}
          placeholder="Who We Are"
        />
        <TextInput
          label="Main Heading (H1)"
          value={data.heroTitle || ''}
          onChange={(val) => onChange('heroTitle', val)}
          placeholder="About Darshan Journey"
        />
        <TextInput
          label="Subtitle Tagline"
          value={data.heroSubtitle || ''}
          onChange={(val) => onChange('heroSubtitle', val)}
          placeholder="Where Technology Meets Spirituality."
        />
        <TextAreaInput
          label="Hero Story Overview"
          value={data.heroDescription || ''}
          onChange={(val) => onChange('heroDescription', val)}
          rows={3}
        />
      </SectionCard>

      {/* 2. Our Story & Genesis */}
      <SectionCard
        title="2. Our Genesis & Journey"
        isOpen={expandedSections.story}
        onToggle={() => toggleSection('story')}
      >
        <ImageField
          label="Story Feature Photo (Kedarnath Pilgrimage)"
          value={data.storyImage || '/assets/kedarnath.png'}
          onChange={(val) => onChange('storyImage', val)}
          onOpenPicker={() => onOpenImagePicker('storyImage', data.storyImage, 'Our Genesis Story Photo')}
        />
        <TextInput
          label="Story Section Heading"
          value={data.storyTitle || ''}
          onChange={(val) => onChange('storyTitle', val)}
          placeholder="Our Journey Began With a Simple Question"
        />
        <TextAreaInput
          label="Paragraph 1 (The Challenge)"
          value={data.storyParagraph1 || ''}
          onChange={(val) => onChange('storyParagraph1', val)}
          rows={3}
        />
        <TextAreaInput
          label="Paragraph 2 (The Purpose)"
          value={data.storyParagraph2 || ''}
          onChange={(val) => onChange('storyParagraph2', val)}
          rows={2}
        />
        <TextAreaInput
          label="Paragraph 3 (The Vision)"
          value={data.storyParagraph3 || ''}
          onChange={(val) => onChange('storyParagraph3', val)}
          rows={3}
        />
      </SectionCard>

      {/* 3. Mission & Vision */}
      <SectionCard
        title="3. Mission & Vision Statements"
        isOpen={expandedSections.mission}
        onToggle={() => toggleSection('mission')}
      >
        <TextInput
          label="Mission Title"
          value={data.missionTitle || 'Our Mission'}
          onChange={(val) => onChange('missionTitle', val)}
        />
        <TextAreaInput
          label="Mission Statement"
          value={data.missionDescription || ''}
          onChange={(val) => onChange('missionDescription', val)}
          rows={3}
        />
        <TextInput
          label="Vision Title"
          value={data.visionTitle || 'Our Vision'}
          onChange={(val) => onChange('visionTitle', val)}
        />
        <TextAreaInput
          label="Vision Statement"
          value={data.visionDescription || ''}
          onChange={(val) => onChange('visionDescription', val)}
          rows={3}
        />
      </SectionCard>

      {/* 4. Core Pillars */}
      <SectionCard
        title="4. What Makes Us Different (4 Pillars)"
        isOpen={expandedSections.pillars}
        onToggle={() => toggleSection('pillars')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {(data.pillars || []).map((pillar, idx) => (
            <div key={pillar.id || idx} style={{ background: '#090806', borderRadius: '8px', padding: '0.8rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <TextInput
                label={`Pillar ${idx + 1} Title`}
                value={pillar.title || ''}
                onChange={(val) => {
                  const pillars = [...(data.pillars || [])];
                  pillars[idx].title = val;
                  onChange('pillars', pillars);
                }}
              />
              <TextAreaInput
                label="Description"
                value={pillar.description || ''}
                onChange={(val) => {
                  const pillars = [...(data.pillars || [])];
                  pillars[idx].description = val;
                  onChange('pillars', pillars);
                }}
                rows={2}
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. OTHER PAGE CONTROLS (Temples, Services, Booking, Login, Contact, Brand)
// ═════════════════════════════════════════════════════════════════════════════
function TemplesPageControls({ data = {}, onChange, onOpenImagePicker }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ImageField
        label="Explore Temples Top Hero Banner"
        value={data.heroImage}
        onChange={(val) => onChange('heroImage', val)}
        onOpenPicker={() => onOpenImagePicker('heroImage', data.heroImage, 'Explore Temples Hero Banner')}
      />
      <TextInput label="Top Tag" value={data.heroTag || ''} onChange={(val) => onChange('heroTag', val)} />
      <TextInput label="Main Title" value={data.heroTitle || ''} onChange={(val) => onChange('heroTitle', val)} />
      <TextInput label="Subtitle" value={data.heroSubtitle || ''} onChange={(val) => onChange('heroSubtitle', val)} />
      <TextAreaInput label="Description" value={data.heroDescription || ''} onChange={(val) => onChange('heroDescription', val)} rows={3} />
      <TextInput label="Search Input Placeholder" value={data.searchPlaceholder || ''} onChange={(val) => onChange('searchPlaceholder', val)} />
    </div>
  );
}

function ServicesPageControls({ data = {}, onChange, onOpenImagePicker }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ImageField
        label="Services Catalog Top Hero Banner"
        value={data.heroImage}
        onChange={(val) => onChange('heroImage', val)}
        onOpenPicker={() => onOpenImagePicker('heroImage', data.heroImage, 'Services Top Hero Banner')}
      />
      <TextInput label="Header Title" value={data.heroTitle || ''} onChange={(val) => onChange('heroTitle', val)} />
      <TextInput label="Header Subtitle" value={data.heroSubtitle || ''} onChange={(val) => onChange('heroSubtitle', val)} />
      <TextAreaInput label="Description" value={data.heroDescription || ''} onChange={(val) => onChange('heroDescription', val)} rows={3} />
      <TextInput label="Promotional Alert Banner Text" value={data.promotionalBannerText || ''} onChange={(val) => onChange('promotionalBannerText', val)} />
    </div>
  );
}

function BookingPageControls({ data = {}, onChange, onOpenImagePicker }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ImageField
        label="Quick Booking Top Ambient Header"
        value={data.heroImage || '/assets/temple_hero_bg.png'}
        onChange={(val) => onChange('heroImage', val)}
        onOpenPicker={() => onOpenImagePicker('heroImage', data.heroImage, 'Quick Booking Header Image')}
      />
      <TextInput label="Booking Portal Title" value={data.heroTitle || ''} onChange={(val) => onChange('heroTitle', val)} />
      <TextInput label="Subtitle" value={data.heroSubtitle || ''} onChange={(val) => onChange('heroSubtitle', val)} />
      <TextInput label="Step 1 Title" value={data.step1Title || ''} onChange={(val) => onChange('step1Title', val)} />
      <TextInput label="Step 2 Title" value={data.step2Title || ''} onChange={(val) => onChange('step2Title', val)} />
      <TextInput label="Step 3 Title" value={data.step3Title || ''} onChange={(val) => onChange('step3Title', val)} />
      <TextInput label="Guarantee Badge" value={data.guaranteeBadge || ''} onChange={(val) => onChange('guaranteeBadge', val)} />
    </div>
  );
}

function LoginPageControls({ data = {}, onChange, onOpenImagePicker }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ImageField
        label="Authentication Portal Atmosphere Wallpaper"
        value={data.backgroundImage || '/assets/temple_night_bg.png'}
        onChange={(val) => onChange('backgroundImage', val)}
        onOpenPicker={() => onOpenImagePicker('backgroundImage', data.backgroundImage, 'Login Portal Background Wallpaper')}
      />
      <TextInput label="Devotee Portal Title" value={data.portalTitle || ''} onChange={(val) => onChange('portalTitle', val)} />
      <TextAreaInput label="Portal Subtitle" value={data.portalSubtitle || ''} onChange={(val) => onChange('portalSubtitle', val)} rows={2} />
      <TextInput label="Google Button Label" value={data.googleButtonText || ''} onChange={(val) => onChange('googleButtonText', val)} />
      <TextInput label="Help & Support Notice" value={data.supportNotice || ''} onChange={(val) => onChange('supportNotice', val)} />
    </div>
  );
}

function ContactPageControls({ data = {}, onChange, onOpenImagePicker }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ImageField
        label="Contact Page Top Hero Photo"
        value={data.heroImage}
        onChange={(val) => onChange('heroImage', val)}
        onOpenPicker={() => onOpenImagePicker('heroImage', data.heroImage, 'Contact Page Hero Photo')}
      />
      <TextInput label="Page Title" value={data.heroTitle || ''} onChange={(val) => onChange('heroTitle', val)} />
      <TextInput label="Subtitle" value={data.heroSubtitle || ''} onChange={(val) => onChange('heroSubtitle', val)} />
      <TextInput label="Support Email Address" value={data.email || ''} onChange={(val) => onChange('email', val)} />
      <TextInput label="Toll-Free Helpline" value={data.phone || ''} onChange={(val) => onChange('phone', val)} />
      <TextInput label="WhatsApp Pilgrimage Desk" value={data.whatsapp || ''} onChange={(val) => onChange('whatsapp', val)} />
      <TextInput label="Temple Corridor Address" value={data.address || ''} onChange={(val) => onChange('address', val)} />
      <TextInput label="Operating Hours" value={data.hours || ''} onChange={(val) => onChange('hours', val)} />
    </div>
  );
}

function BrandPageControls({ data = {}, onChange, onOpenImagePicker }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ImageField
        label="Primary Circular Gold Emblem Logo"
        value={data.logoMain || '/assets/darshan-logo.jpeg'}
        onChange={(val) => onChange('logoMain', val)}
        onOpenPicker={() => onOpenImagePicker('logoMain', data.logoMain, 'Main Brand Emblem Logo')}
      />
      <ImageField
        label="Transparent Navbar & Favicon Logo"
        value={data.logoTransparent || '/darshan-logo.png'}
        onChange={(val) => onChange('logoTransparent', val)}
        onOpenPicker={() => onOpenImagePicker('logoTransparent', data.logoTransparent, 'Transparent Favicon / Logo')}
      />
      <TextInput label="Official Platform Brand Name" value={data.brandName || ''} onChange={(val) => onChange('brandName', val)} />
      <TextInput label="Global Website Tagline" value={data.tagline || ''} onChange={(val) => onChange('tagline', val)} />
      <TextAreaInput label="Footer Copyright & Heritage Disclaimer" value={data.copyrightText || ''} onChange={(val) => onChange('copyrightText', val)} rows={3} />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. LIVE PREVIEW RENDERERS (MATCHING EXACT FRONTEND DESIGN)
// ═════════════════════════════════════════════════════════════════════════════
function HomeLivePreview({ data = {} }) {
  return (
    <div style={{ color: '#fff', fontFamily: 'inherit', minHeight: '600px' }}>
      {/* Promo Banner */}
      {data.promotionalBannerText && (
        <div style={{
          background: 'linear-gradient(90deg, #9a3412 0%, #b45309 50%, #9a3412 100%)',
          padding: '0.45rem 1rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          textAlign: 'center',
          color: '#fef08a'
        }}>
          {data.promotionalBannerText}
        </div>
      )}

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundImage: `linear-gradient(rgba(10, 8, 5, 0.75), rgba(10, 8, 5, 0.88)), url(${data.heroImage || '/temple_hero_bg.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid rgba(234, 179, 8, 0.2)'
      }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: '#eab308',
          textTransform: 'uppercase',
          marginBottom: '0.6rem',
          padding: '0.2rem 0.6rem',
          background: 'rgba(234,179,8,0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(234,179,8,0.25)'
        }}>
          {data.heroSubtitle || 'WELCOME TO OUR SACRED SANCTUARY'}
        </span>

        <h1 style={{
          fontSize: '1.7rem',
          fontWeight: 800,
          maxWidth: '560px',
          color: '#fef08a',
          margin: '0 0 0.8rem 0',
          lineHeight: 1.25,
          textShadow: '0 2px 10px rgba(0,0,0,0.8)'
        }}>
          {data.heroTitle || 'Experience Divine Peace & Spiritual Heritage'}
        </h1>

        <p style={{
          fontSize: '0.85rem',
          color: '#d4d4d8',
          maxWidth: '480px',
          margin: '0 0 1.4rem 0',
          lineHeight: 1.5
        }}>
          {data.heroDescription || 'Immerse yourself in sacred traditions, daily Vedic rituals, and timeless temple heritage.'}
        </p>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button style={{
            padding: '0.55rem 1.2rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
            color: '#1a1306',
            fontWeight: 700,
            fontSize: '0.82rem',
            border: 'none',
            boxShadow: '0 4px 12px rgba(234,179,8,0.3)'
          }}>
            {data.ctaPrimaryText || 'Explore Temples'}
          </button>
          <button style={{
            padding: '0.55rem 1.2rem',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            color: '#fef08a',
            fontWeight: 600,
            fontSize: '0.82rem',
            border: '1px solid rgba(234,179,8,0.3)'
          }}>
            {data.ctaSecondaryText || 'Book Darshan'}
          </button>
        </div>
      </div>

      {/* Darshan Highlights Grid */}
      <div style={{ padding: '2rem 1.2rem', background: '#0a0805' }}>
        <h3 style={{ textAlign: 'center', fontSize: '1.05rem', color: '#fef08a', marginBottom: '1.2rem', fontWeight: 700 }}>
          Sacred Temple Darshan & Offerings
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {(data.darshanCards || []).map((c, i) => (
            <div key={i} style={{
              background: '#14110b',
              borderRadius: '10px',
              border: '1px solid rgba(234, 179, 8, 0.15)',
              overflow: 'hidden'
            }}>
              <img src={c.image} alt={c.title} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
              <div style={{ padding: '0.7rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fef08a', margin: '0 0 0.3rem 0' }}>{c.title}</h4>
                <p style={{ fontSize: '0.72rem', color: '#a1a1aa', margin: '0 0 0.6rem 0', lineHeight: 1.35 }}>{c.description}</p>
                <span style={{ fontSize: '0.72rem', color: '#eab308', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  {c.buttonText || 'Learn More'} →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutLivePreview({ data = {} }) {
  return (
    <div style={{ color: '#fff', background: '#0a0805', padding: '1.5rem 1.2rem', minHeight: '600px' }}>
      {/* Hero Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {data.heroTag || 'Who We Are'}
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fef08a', margin: '0.3rem 0 0.5rem 0' }}>
            {data.heroTitle || 'About Darshan Journey'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#ca8a04', fontWeight: 600, margin: '0 0 0.6rem 0' }}>
            {data.heroSubtitle || 'Where Technology Meets Spirituality.'}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#d4d4d8', lineHeight: 1.45 }}>
            {data.heroDescription || ''}
          </p>
        </div>
        <img
          src={data.heroImage || '/assets/temple_sculpture_about.jpg'}
          alt="Sculpture"
          style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.25)', maxHeight: '180px', objectFit: 'cover' }}
        />
      </div>

      {/* Genesis Story */}
      <div style={{
        background: '#14110b',
        borderRadius: '12px',
        padding: '1.2rem',
        border: '1px solid rgba(234,179,8,0.15)',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fef08a', margin: '0 0 0.6rem 0' }}>
          {data.storyTitle || 'Our Genesis'}
        </h3>
        <p style={{ fontSize: '0.76rem', color: '#a1a1aa', lineHeight: 1.4, margin: '0 0 0.5rem 0' }}>{data.storyParagraph1}</p>
        <p style={{ fontSize: '0.76rem', color: '#a1a1aa', lineHeight: 1.4, margin: '0 0 0.5rem 0' }}>{data.storyParagraph2}</p>
        <p style={{ fontSize: '0.76rem', color: '#d4d4d8', lineHeight: 1.4, margin: 0 }}>{data.storyParagraph3}</p>
      </div>

      {/* Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        {(data.pillars || []).map((p, i) => (
          <div key={i} style={{ background: '#0e0c08', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fef08a', margin: '0 0 0.2rem 0' }}>{p.title}</h5>
            <p style={{ fontSize: '0.7rem', color: '#a1a1aa', margin: 0, lineHeight: 1.3 }}>{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplesLivePreview({ data = {} }) {
  return (
    <div style={{ color: '#fff', background: '#0a0805', padding: '1.5rem 1.2rem', minHeight: '400px' }}>
      <div style={{
        backgroundImage: `linear-gradient(rgba(10, 8, 5, 0.8), rgba(10, 8, 5, 0.9)), url(${data.heroImage})`,
        backgroundSize: 'cover',
        padding: '2.5rem 1.2rem',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid rgba(234,179,8,0.2)'
      }}>
        <span style={{ fontSize: '0.7rem', color: '#eab308', fontWeight: 700 }}>{data.heroTag || 'Sanctified Shrines'}</span>
        <h2 style={{ fontSize: '1.3rem', color: '#fef08a', margin: '0.4rem 0' }}>{data.heroTitle}</h2>
        <p style={{ fontSize: '0.78rem', color: '#d4d4d8', maxWidth: '420px', margin: '0 auto 1rem auto' }}>{data.heroDescription}</p>
        <div style={{ maxWidth: '320px', margin: '0 auto', background: '#181510', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.2)', fontSize: '0.75rem', color: '#71717a', textAlign: 'left' }}>
          🔍 {data.searchPlaceholder || 'Search temples...'}
        </div>
      </div>
    </div>
  );
}

function ServicesLivePreview({ data = {} }) {
  return (
    <div style={{ color: '#fff', background: '#0a0805', padding: '1.5rem 1.2rem' }}>
      <div style={{
        backgroundImage: `linear-gradient(rgba(10, 8, 5, 0.8), rgba(10, 8, 5, 0.9)), url(${data.heroImage})`,
        backgroundSize: 'cover',
        padding: '2rem 1.2rem',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid rgba(234,179,8,0.2)'
      }}>
        <h2 style={{ fontSize: '1.3rem', color: '#fef08a', margin: 0 }}>{data.heroTitle}</h2>
        <p style={{ fontSize: '0.78rem', color: '#d4d4d8', marginTop: '0.4rem' }}>{data.heroDescription}</p>
      </div>
    </div>
  );
}

function BookingLivePreview({ data = {} }) {
  return (
    <div style={{ color: '#fff', background: '#0a0805', padding: '1.5rem 1.2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#fef08a', margin: 0 }}>{data.heroTitle}</h3>
        <p style={{ fontSize: '0.78rem', color: '#a1a1aa', margin: '0.3rem 0 0 0' }}>{data.heroSubtitle}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
        <div style={{ background: '#14110b', padding: '0.7rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(234,179,8,0.2)' }}>
          <span style={{ fontSize: '0.7rem', color: '#eab308', fontWeight: 700 }}>Step 1</span>
          <p style={{ fontSize: '0.72rem', color: '#fef08a', margin: '0.2rem 0 0 0' }}>{data.step1Title}</p>
        </div>
        <div style={{ background: '#14110b', padding: '0.7rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 700 }}>Step 2</span>
          <p style={{ fontSize: '0.72rem', color: '#d4d4d8', margin: '0.2rem 0 0 0' }}>{data.step2Title}</p>
        </div>
        <div style={{ background: '#14110b', padding: '0.7rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 700 }}>Step 3</span>
          <p style={{ fontSize: '0.72rem', color: '#d4d4d8', margin: '0.2rem 0 0 0' }}>{data.step3Title}</p>
        </div>
      </div>
    </div>
  );
}

function LoginLivePreview({ data = {} }) {
  return (
    <div style={{
      color: '#fff',
      minHeight: '340px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.2rem',
      backgroundImage: `linear-gradient(rgba(10, 8, 5, 0.85), rgba(10, 8, 5, 0.95)), url(${data.backgroundImage || '/assets/temple_night_bg.png'})`,
      backgroundSize: 'cover'
    }}>
      <div style={{
        background: '#14110b',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(234,179,8,0.25)',
        width: '100%',
        maxWidth: '300px',
        textAlign: 'center'
      }}>
        <h4 style={{ fontSize: '1rem', color: '#fef08a', margin: '0 0 0.3rem 0' }}>{data.portalTitle}</h4>
        <p style={{ fontSize: '0.72rem', color: '#a1a1aa', margin: '0 0 1rem 0' }}>{data.portalSubtitle}</p>
        <button style={{
          width: '100%',
          padding: '0.55rem',
          borderRadius: '8px',
          background: '#fff',
          color: '#1a1306',
          fontWeight: 700,
          fontSize: '0.8rem',
          border: 'none'
        }}>
          🔵 {data.googleButtonText || 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}

function ContactLivePreview({ data = {} }) {
  return (
    <div style={{ color: '#fff', background: '#0a0805', padding: '1.5rem 1.2rem' }}>
      <h3 style={{ fontSize: '1.1rem', color: '#fef08a', margin: '0 0 0.4rem 0' }}>{data.heroTitle}</h3>
      <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: '0 0 1rem 0' }}>{data.heroDescription}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.75rem' }}>
        <div style={{ background: '#14110b', padding: '0.6rem', borderRadius: '6px' }}>
          <span style={{ color: '#eab308' }}>Email:</span> {data.email}
        </div>
        <div style={{ background: '#14110b', padding: '0.6rem', borderRadius: '6px' }}>
          <span style={{ color: '#eab308' }}>Phone:</span> {data.phone}
        </div>
      </div>
    </div>
  );
}

function BrandLivePreview({ data = {} }) {
  return (
    <div style={{ color: '#fff', background: '#0a0805', padding: '1.5rem 1.2rem', textAlign: 'center' }}>
      <img src={data.logoMain || '/assets/darshan-logo.jpeg'} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #eab308', margin: '0 auto 0.8rem auto' }} />
      <h4 style={{ fontSize: '1.1rem', color: '#fef08a', margin: '0 0 0.2rem 0' }}>{data.brandName}</h4>
      <p style={{ fontSize: '0.75rem', color: '#ca8a04', margin: '0 0 1rem 0' }}>{data.tagline}</p>
      <p style={{ fontSize: '0.68rem', color: '#71717a', maxWidth: '380px', margin: '0 auto' }}>{data.copyrightText}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. ARTICLES & MEDIA VAULT VIEWS
// ═════════════════════════════════════════════════════════════════════════════
function ArticlesManagementView({ articlesList, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, onOpenArticle, onNewArticle, onDeleteArticle }) {
  return (
    <div style={{ background: 'rgba(20, 18, 14, 0.75)', borderRadius: '16px', border: '1px solid rgba(234,179,8,0.15)', padding: '1.4rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fef08a', margin: 0 }}>Articles & Spiritual Wisdom Blogs</h2>
          <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: '0.2rem 0 0 0' }}>Manage spiritual blog articles, covers, tags, authors, and full rich content.</p>
        </div>
        <button
          onClick={onNewArticle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
            color: '#1a1306',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#71717a' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, author, category, or snippet..."
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem 0.6rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid rgba(234,179,8,0.2)',
              background: '#090806',
              color: '#fef08a',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {articlesList.map((art) => (
          <div
            key={art.id || art.slug}
            style={{
              background: '#0d0c0a',
              borderRadius: '12px',
              border: '1px solid rgba(234,179,8,0.15)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <img src={art.image} alt={art.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#eab308' }}>{art.categoryBadge || art.category}</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fef08a', margin: '0.3rem 0 0.4rem 0', lineHeight: 1.3 }}>{art.title}</h4>
                <p style={{ fontSize: '0.76rem', color: '#a1a1aa', lineHeight: 1.4, margin: '0 0 0.8rem 0' }}>{art.snippet}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#71717a' }}>By {art.author}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => onOpenArticle(art)}
                    style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.1)', color: '#fef08a', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteArticle(art.id || art.slug)}
                    style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaVaultView({ mediaList, searchQuery, setSearchQuery, onCopyLink, onOpenUpload }) {
  return (
    <div style={{ background: 'rgba(20, 18, 14, 0.75)', borderRadius: '16px', border: '1px solid rgba(234,179,8,0.15)', padding: '1.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fef08a', margin: 0 }}>Website Media Vault</h2>
          <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: '0.2rem 0 0 0' }}>Gallery of all live photos, banners, and uploaded assets across Darshan Journey.</p>
        </div>
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#71717a' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media assets..."
            style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.2)', background: '#090806', color: '#fef08a', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {mediaList.map((item, idx) => (
          <div key={idx} style={{ background: '#0d0c0a', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <img src={item.url} alt={item.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
            <div style={{ padding: '0.8rem' }}>
              <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fef08a', margin: '0 0 0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </h5>
              <p style={{ fontSize: '0.72rem', color: '#71717a', margin: '0 0 0.5rem 0' }}>{item.category || 'Asset'} • {item.page || 'Website'}</p>
              <button
                onClick={() => onCopyLink(item.url)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(234,179,8,0.08)', color: '#fef08a', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
              >
                <Copy size={12} />
                <span>Copy Asset URL</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. REUSABLE UI WIDGETS
// ═════════════════════════════════════════════════════════════════════════════
function SectionCard({ title, isOpen, onToggle, children }) {
  return (
    <div style={{
      background: '#0e0c08',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.1rem',
          background: isOpen ? 'rgba(234, 179, 8, 0.08)' : 'transparent',
          border: 'none',
          color: '#fef08a',
          fontSize: '0.92rem',
          fontWeight: 700,
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid rgba(255,255,255,0.06)' : 'none'
        }}
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isOpen && (
        <div style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function ImageField({ label, value, onChange, onOpenPicker }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d4d4d8' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#080705', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <img
          src={value}
          alt={label}
          onError={(e) => { e.target.src = '/temple_hero_bg.png'; }}
          style={{ width: '56px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(234,179,8,0.3)' }}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#fef08a',
              fontSize: '0.78rem',
              outline: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          />
        </div>
        <button
          type="button"
          onClick={onOpenPicker}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid rgba(234,179,8,0.4)',
            background: 'linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(202,138,4,0.1) 100%)',
            color: '#fef08a',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Edit3 size={12} />
          <span>Change Photo</span>
        </button>
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d4d4d8' }}>{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          borderRadius: '7px',
          border: '1px solid rgba(234,179,8,0.18)',
          background: '#090806',
          color: '#fef08a',
          fontSize: '0.82rem'
        }}
      />
    </div>
  );
}

function TextAreaInput({ label, value, onChange, rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d4d4d8' }}>{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          borderRadius: '7px',
          border: '1px solid rgba(234,179,8,0.18)',
          background: '#090806',
          color: '#fef08a',
          fontSize: '0.82rem',
          lineHeight: 1.4
        }}
      />
    </div>
  );
}

function ArticleEditModal({ isOpen, article, onClose, onSave, openImagePicker }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (article) setFormData(JSON.parse(JSON.stringify(article)));
  }, [article]);

  if (!isOpen || !article) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#181510',
        borderRadius: '16px',
        border: '1px solid rgba(234,179,8,0.3)',
        padding: '1.4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fef08a', margin: 0 }}>
            {formData.id ? 'Edit Spiritual Article' : 'New Article'}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextInput
            label="Article Title"
            value={formData.title || ''}
            onChange={(val) => setFormData(p => ({ ...p, title: val }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <TextInput
              label="URL Slug"
              value={formData.slug || ''}
              onChange={(val) => setFormData(p => ({ ...p, slug: val }))}
            />
            <TextInput
              label="Category"
              value={formData.category || ''}
              onChange={(val) => setFormData(p => ({ ...p, category: val, categoryBadge: `🕉️ ${val}` }))}
            />
          </div>
          <ImageField
            label="Cover Hero Photo"
            value={formData.image || ''}
            onChange={(val) => setFormData(p => ({ ...p, image: val }))}
            onOpenPicker={() => openImagePicker('articleImage', formData.image, 'Article Cover Photo')}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <TextInput
              label="Author Name"
              value={formData.author || ''}
              onChange={(val) => setFormData(p => ({ ...p, author: val }))}
            />
            <TextInput
              label="Read Time"
              value={formData.readTime || '5 MIN READ'}
              onChange={(val) => setFormData(p => ({ ...p, readTime: val }))}
            />
          </div>
          <TextAreaInput
            label="Short Snippet / Excerpt"
            value={formData.snippet || ''}
            onChange={(val) => setFormData(p => ({ ...p, snippet: val }))}
            rows={2}
          />
          <TextAreaInput
            label="Full Article Content (HTML / Text)"
            value={formData.content || ''}
            onChange={(val) => setFormData(p => ({ ...p, content: val }))}
            rows={8}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.4rem' }}>
          <button
            onClick={onClose}
            style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#d4d4d8', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: '#1a1306', fontWeight: 700, cursor: 'pointer' }}
          >
            Save & Synchronize Article
          </button>
        </div>
      </div>
    </div>
  );
}
