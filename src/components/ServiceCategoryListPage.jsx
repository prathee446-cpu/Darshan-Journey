import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { getProductsByCategory, getCategoryDomain, fetchCategoryProductsFromAPI } from '../data/servicesProductsData';

export default function ServiceCategoryListPage({
  onGoToHome,
  onGoToLanding,
  onExploreTemples,
  onGoToServices,
  onGoToAbout,
  onGoToLogin,
  onOpenBooking
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();

  // Category Slug resolution from params or state
  const categorySlug = slug || location.state?.categorySlug || 'pooja-essentials';
  const categoryDomain = getCategoryDomain(categorySlug);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetchCategoryProductsFromAPI(categorySlug).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [categorySlug]);

  const handleSelectItem = (product) => {
    navigate(`/services/item/${product.id}`, { state: { product, categorySlug } });
  };

  return (
    <div className="home-website-wrapper" style={{ backgroundColor: '#FDFBF7', minHeight: '100vh' }}>
      <Navbar 
        activePage="services"
        onGoToHome={onGoToHome}
        onGoToLanding={onGoToLanding}
        onExploreTemples={onExploreTemples}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToLogin={onGoToLogin}
        onOpenBooking={onOpenBooking}
      />

      <main style={{ padding: '110px 1.5rem 80px 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        
        {/* Back Navigation to Services Overview */}
        <button 
          onClick={() => navigate('/services')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: '#A57C52',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#3B241C'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#A57C52'}
        >
          <ArrowLeft size={18} /> Back to All Categories
        </button>

        {/* Category Domain Banner */}
        <div 
          style={{
            backgroundColor: '#3B241C',
            color: '#F7EFE6',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            marginBottom: '2.5rem',
            boxShadow: '0 15px 35px rgba(59, 36, 28, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#C89B4B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {categoryDomain.tag}
            </span>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '2.2rem', fontWeight: 800, margin: '0.3rem 0 0.8rem 0', color: '#F7EFE6' }}>
              {categoryDomain.title}
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(247, 239, 230, 0.85)', maxWidth: '750px', margin: 0, lineHeight: 1.6 }}>
              {categoryDomain.description}
            </p>
          </div>
        </div>

        {/* Products Grid for ONLY Selected Category */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#A57C52', fontSize: '1.1rem' }}>
            Loading {categoryDomain.title} items...
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', fontWeight: 800, color: '#3B241C', margin: 0 }}>
                Available Items ({products.length})
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#A57C52', fontWeight: 600 }}>
                Showing items strictly under <strong>{categoryDomain.title}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {products.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid rgba(200, 155, 75, 0.3)',
                    boxShadow: '0 10px 30px rgba(59, 36, 28, 0.06)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Item Image */}
                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {item.badgeText && (
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: '#3B241C',
                          color: '#C89B4B',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.3rem 0.75rem',
                          borderRadius: '99px',
                          border: '1px solid #C89B4B'
                        }}>
                          {item.badgeText}
                        </span>
                      )}
                    </div>

                    {/* Item Body */}
                    <div style={{ padding: '1.4rem' }}>
                      <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.15rem', fontWeight: 800, color: '#3B241C', margin: '0 0 0.5rem 0' }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#5C3A2E', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                        {item.shortDesc}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.3rem', fontWeight: 800, color: '#C89B4B' }}>
                          {item.formattedPrice || `₹${item.price}`}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#2E7D32', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={14} /> {item.stockStatus || 'In Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Select / View Details Button */}
                  <div style={{ padding: '0 1.4rem 1.4rem 1.4rem' }}>
                    <button
                      onClick={() => handleSelectItem(item)}
                      style={{
                        width: '100%',
                        backgroundColor: '#C89B4B',
                        color: '#3B241C',
                        border: 'none',
                        borderRadius: '99px',
                        padding: '0.8rem',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#3B241C';
                        e.currentTarget.style.color = '#C89B4B';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#C89B4B';
                        e.currentTarget.style.color = '#3B241C';
                      }}
                    >
                      Select Item <ChevronRight size={16} />
                    </button>
                  </div>

                </motion.div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer 
        onGoToHome={onGoToHome}
        onExploreTemples={onExploreTemples}
        onGoToServices={onGoToServices}
        onGoToAbout={onGoToAbout}
        onGoToLogin={onGoToLogin}
        onOpenBooking={onOpenBooking}
      />
    </div>
  );
}
