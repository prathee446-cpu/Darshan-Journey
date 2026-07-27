import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Clock, 
  User, 
  Calendar, 
  ArrowRight, 
  Heart, 
  Share2, 
  Bookmark,
  CheckCircle2,
  X,
  FileQuestion
} from 'lucide-react';
import logoImg from '../assets/exact_darshan_logo.png';
import { getBlogBySlug, getRelatedBlogs } from '../data/blogsData';
import Navbar from './Navbar';
import Footer from './Footer';

export default function BlogDetailsPage({ slug, onGoToHome, onExploreTemples, onGoToProducts, onNavigateToBlog }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const blog = getBlogBySlug(slug);
  const relatedBlogs = blog ? getRelatedBlogs(blog.slug, 3) : [];

  // Handle navbar sticky background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="home-website-wrapper">
      {/* ---------------- NAVBAR ---------------- */}
      <Navbar 
        activePage="blogs"
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenDonate={() => setIsDonateOpen(true)}
      />

      {/* ---------------- MAIN CONTENT ---------------- */}
      {blog ? (
        <article className="blog-details-view section">
          <div className="container">
            {/* Top Navigation Back Bar */}
            <div className="blog-details-back-bar">
              <button 
                className="btn-back-link"
                onClick={() => {
                  if (onGoToHome) {
                    onGoToHome();
                    setTimeout(() => {
                      document.getElementById('blogs')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
              >
                <ChevronLeft size={20} /> Back to Articles & Blogs
              </button>
              <div className="blog-breadcrumb-text">
                Home / Blogs / {blog.category}
              </div>
            </div>

            {/* ARTICLE HEADER CONTAINER */}
            <header className="blog-details-header">
              <span className="blog-detail-category-tag">
                {blog.categoryBadge || blog.category}
              </span>

              <h1 className="blog-detail-main-title">{blog.title}</h1>

              <div className="blog-detail-meta-bar">
                <div className="blog-author-info">
                  <img src={blog.authorAvatar} alt={blog.author} className="blog-author-avatar" />
                  <div>
                    <span className="blog-author-name">{blog.author}</span>
                    <span className="blog-author-role">{blog.authorRole}</span>
                  </div>
                </div>

                <div className="blog-meta-right">
                  <span><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> {blog.date}</span>
                  <span><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> {blog.readTime}</span>
                  <button className="btn-share-icon" onClick={handleShare} title="Share Article">
                    <Share2 size={16} /> {copiedLink ? 'Link Copied!' : 'Share'}
                  </button>
                </div>
              </div>
            </header>

            {/* FEATURED IMAGE */}
            <div className="blog-featured-image-box">
              <img src={blog.image} alt={blog.title} className="blog-featured-image" />
            </div>

            {/* COMPLETE ARTICLE CONTENT */}
            <div className="blog-article-body-wrapper">
              <div 
                className="blog-article-content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* ARTICLE TAGS */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="blog-tags-container">
                  <span className="blog-tags-label">Related Topics:</span>
                  <div className="blog-tags-list">
                    {blog.tags.map((t, idx) => (
                      <span key={idx} className="blog-tag-pill">#{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* AUTHOR BIO CARD */}
              <div className="blog-author-bio-card">
                <img src={blog.authorAvatar} alt={blog.author} className="bio-card-avatar" />
                <div>
                  <h4 className="bio-card-name">{blog.author}</h4>
                  <p className="bio-card-role">{blog.authorRole}</p>
                  <p className="bio-card-desc">
                    Dedicated to sharing authentic Vedic philosophy, ancient temple heritage, and practical spiritual practices for modern living.
                  </p>
                </div>
              </div>
            </div>

            {/* RELATED ARTICLES SECTION */}
            {relatedBlogs.length > 0 && (
              <section className="related-blogs-section">
                <div className="section-header" style={{ marginBottom: '2.5rem' }}>
                  <span className="section-tag">CONTINUE READING</span>
                  <h2 className="section-title">Related Articles & Spiritual Guides</h2>
                </div>

                <div className="blogs-grid">
                  {relatedBlogs.map((rel) => (
                    <div key={rel.id} className="blog-card" onClick={() => onNavigateToBlog && onNavigateToBlog(rel.slug)}>
                      <div className="blog-img-box">
                        <img src={rel.image} alt={rel.title} className="blog-img" />
                        <span className="blog-tag">{rel.category}</span>
                      </div>
                      <div className="blog-body">
                        <div className="blog-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span>{rel.date} • {rel.readTime}</span>
                          <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>By {rel.author}</span>
                        </div>
                        <h3 className="blog-title">{rel.title}</h3>
                        <p className="blog-snippet">{rel.snippet}</p>
                        <button 
                          className="service-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateToBlog) onNavigateToBlog(rel.slug);
                          }}
                        >
                          Read Article <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      ) : (
        /* ---------------- 404 INVALID BLOG SLUG PAGE ---------------- */
        <section className="blog-details-view section">
          <div className="container">
            <div className="empty-state-card" style={{ maxWidth: '650px', margin: '4rem auto' }}>
              <div className="empty-state-icon">
                <FileQuestion size={56} style={{ color: '#C8A96A' }} />
              </div>
              <h3 className="empty-state-title">Blog Article Not Found</h3>
              <p className="empty-state-desc">
                The article you are looking for might have been moved or does not exist. Explore our latest spiritual articles from the Home Page.
              </p>
              <button 
                className="btn-primary" 
                onClick={() => onGoToHome && onGoToHome()} 
                style={{ marginTop: '1.2rem' }}
              >
                <ChevronLeft size={18} /> Return to Home Page
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- FOOTER ---------------- */}
      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToProducts={onGoToProducts}
        onOpenBooking={() => setIsBookingOpen(true)}
      />

      {/* DONATE MODAL */}
      <div className={`modal-overlay ${isDonateOpen ? 'active' : ''}`} onClick={() => setIsDonateOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setIsDonateOpen(false)}>
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>
              Support Our Temple Seva
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your sacred contributions help sustain daily poojas, Anna Daan (free meals), and Goshala maintenance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className="btn-primary" style={{ textAlign: 'center', padding: '0.8rem' }} onClick={() => { alert('Thank you for donating ₹501 to Anna Daan Seva!'); setIsDonateOpen(false); }}>
              ₹501 • Anna Daan
            </button>
            <button className="btn-primary" style={{ textAlign: 'center', padding: '0.8rem' }} onClick={() => { alert('Thank you for donating ₹1,008 to Temple Renovation!'); setIsDonateOpen(false); }}>
              ₹1,008 • Renovation
            </button>
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      <div className={`modal-overlay ${isBookingOpen ? 'active' : ''}`} onClick={() => setIsBookingOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setIsBookingOpen(false)}>
            <X size={22} />
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>
              Book Temple Darshan & Pooja
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select your preferred date and time slot for special priority entry and archana.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Booking confirmed! Slot details sent to your registered phone.'); setIsBookingOpen(false); }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>Devotee Name</label>
              <input type="text" required placeholder="Enter full name" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(200, 169, 106, 0.4)', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-brown-dark)', marginBottom: '0.4rem' }}>Preferred Date</label>
              <input type="date" required style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(200, 169, 106, 0.4)', outline: 'none' }} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Confirm Booking <CheckCircle2 size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
