import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ExploreTemplesPage from './components/ExploreTemplesPage';
import ServicesPage from './components/ServicesPage';
import ServiceCategoryListPage from './components/ServiceCategoryListPage';
import ServiceItemDetailsPage from './components/ServiceItemDetailsPage';
import ServiceDetailsPage from './components/ServiceDetailsPage';
import ServicePaymentSummaryPage from './components/ServicePaymentSummaryPage';
import ServiceBookingConfirmedPage from './components/ServiceBookingConfirmedPage';
import BlogDetailsPage from './components/BlogDetailsPage';
import LoginPage from './components/LoginPage';
import AboutPage from './components/AboutPage';
import QuickBookingPage from './components/QuickBookingPage';
import ContactPage from './components/ContactPage';
import UserDashboardPage from './components/UserDashboardPage';
import DateTimeWidget from './components/DateTimeWidget';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

function BlogDetailsWrapper(props) {
  const navigate = useNavigate();
  const { slug } = useParams();
  return (
    <BlogDetailsPage 
      {...props}
      slug={slug}
      onGoToHome={() => { navigate('/home'); window.scrollTo(0, 0); }}
      onGoToLanding={() => { navigate('/'); window.scrollTo(0, 0); }}
      onExploreTemples={() => { navigate('/explore'); window.scrollTo(0, 0); }}
      onGoToProducts={() => { navigate('/services'); window.scrollTo(0, 0); }}
      onGoToServices={() => { navigate('/services'); window.scrollTo(0, 0); }}
      onGoToLogin={() => { navigate('/login'); window.scrollTo(0, 0); }}
      onGoToContact={() => { navigate('/contact'); window.scrollTo(0, 0); }}
      onGoToAbout={() => { navigate('/about'); window.scrollTo(0, 0); }}
      onGoToDashboard={() => { navigate('/dashboard'); window.scrollTo(0, 0); }}
      onOpenBooking={() => { navigate('/quick-booking'); window.scrollTo(0, 0); }}
      onNavigateToBlog={(newSlug) => { navigate(`/blogs/${newSlug}`); window.scrollTo(0, 0); }}
    />
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  const navProps = {
    onGoToHome: () => { navigate('/'); window.scrollTo(0, 0); },
    onGoToLanding: () => { navigate('/'); window.scrollTo(0, 0); },
    onExploreTemples: () => { navigate('/explore'); window.scrollTo(0, 0); },
    onGoToProducts: () => { navigate('/services'); window.scrollTo(0, 0); },
    onGoToServices: () => { navigate('/services'); window.scrollTo(0, 0); },
    onGoToLogin: () => { navigate('/login'); window.scrollTo(0, 0); },
    onGoToAbout: () => { navigate('/about'); window.scrollTo(0, 0); },
    onGoToContact: () => { navigate('/contact'); window.scrollTo(0, 0); },
    onGoToDashboard: () => { navigate('/dashboard'); window.scrollTo(0, 0); },
    onOpenBooking: () => { navigate('/quick-booking'); window.scrollTo(0, 0); },
  };

  return (
    <Routes>
      {/* ─── Entry Route (/) — Protected Home Page (redirects unauthenticated to /login) ─── */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/home" replace />
          </ProtectedRoute>
        } 
      />

      {/* ─── Login Route (/login) — Accessible when unauthenticated ─── */}
      <Route 
        path="/login" 
        element={<LoginPage {...navProps} />} 
      />

      {/* ─── Home Route (/home alias) ─── */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <HomePage 
              {...navProps}
              onGoToBlog={(slug) => { navigate(`/blogs/${slug}`); window.scrollTo(0, 0); }}
            />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/landing" 
        element={<LandingPage onExplore={() => { navigate('/login'); window.scrollTo(0, 0); }} />} 
      />
      <Route 
        path="/explore" 
        element={<ProtectedRoute><ExploreTemplesPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/services" 
        element={<ProtectedRoute><ServicesPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/services/category/:slug" 
        element={<ProtectedRoute><ServiceCategoryListPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/services/item/:id" 
        element={<ProtectedRoute><ServiceItemDetailsPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/services/details" 
        element={<ProtectedRoute><ServiceDetailsPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/services/summary" 
        element={<ProtectedRoute><ServicePaymentSummaryPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/services/confirmed" 
        element={<ProtectedRoute><ServiceBookingConfirmedPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/products" 
        element={<ProtectedRoute><ServicesPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/about" 
        element={<ProtectedRoute><AboutPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/quick-booking" 
        element={<ProtectedRoute><QuickBookingPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/quick-booking/booking" 
        element={<ProtectedRoute><QuickBookingPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/booking" 
        element={<ProtectedRoute><QuickBookingPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><UserDashboardPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/contact" 
        element={<ProtectedRoute><ContactPage {...navProps} /></ProtectedRoute>} 
      />
      <Route 
        path="/blogs/:slug" 
        element={<ProtectedRoute><BlogDetailsWrapper {...navProps} /></ProtectedRoute>} 
      />

      {/* ─── Fallback ─── */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <DateTimeWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}
