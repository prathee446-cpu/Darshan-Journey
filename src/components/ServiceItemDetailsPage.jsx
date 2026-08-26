import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  Plus, 
  Minus,
  Truck,
  HeartHandshake
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { getProductById } from '../data/servicesProductsData';

export default function ServiceItemDetailsPage({
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
  const { id } = useParams();

  // Selected Product Item state
  const productItem = location.state?.product || getProductById(id) || {
    id: 'pe-1',
    name: 'Pure Cow Ghee Diya Pack (100 Pcs)',
    categorySlug: 'pooja-essentials',
    categoryTitle: 'Pooja Essentials',
    price: 299,
    formattedPrice: '₹299',
    shortDesc: 'Ready-to-use pure cow ghee wicks for daily evening deeparadhana.',
    fullDesc: 'Handmade pure cow ghee wicks infused with natural camphor scent. Burns smoothly for 25-30 minutes, creating a divine sattvic atmosphere in your home temple.',
    badgeText: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?auto=format&fit=crop&w=800&q=80',
    stockStatus: 'In Stock'
  };

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('Standard Pack');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleIncrement = () => setQuantity((prev) => Math.min(prev + 1, 20));
  const handleDecrement = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const unitPrice = productItem.price || 299;
  const totalPrice = unitPrice * quantity;

  const handleProceedToCustomerDetails = () => {
    const bookingPayload = {
      service: {
        id: productItem.id,
        title: productItem.name,
        serviceName: productItem.name,
        categorySlug: productItem.categorySlug,
        categoryTitle: productItem.categoryTitle,
        price: productItem.formattedPrice || `₹${unitPrice}`,
        numericPrice: unitPrice,
        image: productItem.image,
        description: productItem.fullDesc || productItem.shortDesc,
        variant: selectedVariant
      },
      itemQuantity: quantity,
      totalItemPrice: totalPrice
    };

    navigate('/services/details', { state: bookingPayload });
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

      <main style={{ padding: '110px 1.5rem 80px 1.5rem', maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
        
        {/* Back Navigation to Category List */}
        <button 
          onClick={() => navigate(`/services/category/${productItem.categorySlug || 'pooja-essentials'}`)}
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
        >
          <ArrowLeft size={18} /> Back to {productItem.categoryTitle || 'Category Items'}
        </button>

        {/* Item Details Main 2-Column Card */}
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '2px solid #C89B4B',
            boxShadow: '0 20px 50px rgba(59, 36, 28, 0.08)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0'
          }}
        >
          {/* LEFT: Product Image */}
          <div style={{ position: 'relative', minHeight: '420px', backgroundColor: '#FAF6F0' }}>
            <img 
              src={productItem.image} 
              alt={productItem.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {productItem.badgeText && (
              <span 
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  backgroundColor: '#3B241C',
                  color: '#C89B4B',
                  border: '1px solid #C89B4B',
                  padding: '0.4rem 1rem',
                  borderRadius: '99px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase'
                }}
              >
                {productItem.badgeText}
              </span>
            )}
          </div>

          {/* RIGHT: Product Information & Customization */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#A57C52', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {productItem.categoryTitle || 'SANCTUM ITEM'}
              </span>

              <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.85rem', fontWeight: 800, color: '#3B241C', margin: '0.3rem 0 0.8rem 0' }}>
                {productItem.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.4rem' }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', fontWeight: 800, color: '#C89B4B' }}>
                  ₹{unitPrice}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#2E7D32', fontWeight: 700, backgroundColor: 'rgba(46, 125, 50, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '99px', border: '1px solid rgba(46, 125, 50, 0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={14} /> {productItem.stockStatus || 'In Stock'}
                </span>
              </div>

              <p style={{ color: '#5C3A2E', fontSize: '0.98rem', lineHeight: 1.65, marginBottom: '1.8rem' }}>
                {productItem.fullDesc || productItem.shortDesc}
              </p>

              {/* Variant Selector */}
              <div style={{ marginBottom: '1.8rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.6rem' }}>
                  Select Package / Variant
                </label>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  {['Standard Pack', 'Deluxe Temple Pack'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '12px',
                        border: selectedVariant === v ? '2px solid #C89B4B' : '1.5px solid rgba(165, 124, 82, 0.4)',
                        backgroundColor: selectedVariant === v ? '#3B241C' : '#FDFBF7',
                        color: selectedVariant === v ? '#C89B4B' : '#3B241C',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#3B241C', marginBottom: '0.6rem' }}>
                  Select Quantity
                </label>
                <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#FDFBF7', border: '1.5px solid #A57C52', borderRadius: '12px', padding: '0.3rem 0.6rem' }}>
                  <button 
                    onClick={handleDecrement}
                    style={{ background: 'transparent', border: 'none', padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#3B241C' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', fontWeight: 800, padding: '0 1rem', color: '#3B241C' }}>
                    {quantity}
                  </span>
                  <button 
                    onClick={handleIncrement}
                    style={{ background: 'transparent', border: 'none', padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#3B241C' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Highlights */}
              <div style={{ backgroundColor: '#FDFBF7', borderRadius: '14px', border: '1px dashed rgba(200, 155, 75, 0.4)', padding: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#5C3A2E' }}>
                  <Truck size={18} color="#C89B4B" /> 
                  <span>Fast Temple Express Delivery & Sacred Sankalpam Included</span>
                </div>
              </div>
            </div>

            {/* Action Button: Book Now */}
            <button
              onClick={handleProceedToCustomerDetails}
              style={{
                width: '100%',
                backgroundColor: '#C89B4B',
                color: '#3B241C',
                border: 'none',
                borderRadius: '99px',
                padding: '1.05rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 25px rgba(200, 155, 75, 0.35)',
                transition: 'all 0.3s ease'
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
              Book Now • Total ₹{totalPrice} <ChevronRight size={20} />
            </button>

          </div>

        </div>

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
