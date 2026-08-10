import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ExploreTemplesPage from './components/ExploreTemplesPage';
import ServicesPage from './components/ServicesPage';
import BlogDetailsPage from './components/BlogDetailsPage';
import LoginPage from './components/LoginPage';
import AboutPage from './components/AboutPage';
import QuickBookingPage from './components/QuickBookingPage';

function BlogDetailsWrapper(props) {
  const navigate = useNavigate();
  const { slug } = useParams();
  return (
    <BlogDetailsPage 
      {...props}
      slug={slug}
      onNavigateToBlog={(newSlug) => navigate(`/blogs/${newSlug}`)}
    />
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  const navProps = {
    onGoToHome: () => { navigate('/home'); window.scrollTo(0, 0); },
    onGoToLanding: () => { navigate('/'); window.scrollTo(0, 0); },
    onExploreTemples: () => { navigate('/explore'); window.scrollTo(0, 0); },
    onGoToProducts: () => { navigate('/services'); window.scrollTo(0, 0); },
    onGoToServices: () => { navigate('/services'); window.scrollTo(0, 0); },
    onGoToLogin: () => { navigate('/login'); window.scrollTo(0, 0); },
    onGoToAbout: () => { navigate('/about'); window.scrollTo(0, 0); },
    onOpenBooking: () => { navigate('/quick-booking'); window.scrollTo(0, 0); },
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={<LandingPage onExplore={() => navigate('/home')} />} 
      />
      <Route 
        path="/home" 
        element={
          <HomePage 
            {...navProps}
            onGoToBlog={(slug) => navigate(`/blogs/${slug}`)}
          />
        } 
      />
      <Route 
        path="/explore" 
        element={<ExploreTemplesPage {...navProps} />} 
      />
      <Route 
        path="/services" 
        element={<ServicesPage {...navProps} />} 
      />
      <Route 
        path="/products" 
        element={<ServicesPage {...navProps} />} 
      />
      <Route 
        path="/about" 
        element={<AboutPage {...navProps} />} 
      />
      <Route 
        path="/quick-booking" 
        element={<QuickBookingPage {...navProps} />} 
      />
      <Route 
        path="/booking" 
        element={<QuickBookingPage {...navProps} />} 
      />
      <Route 
        path="/login" 
        element={<LoginPage {...navProps} />} 
      />
      <Route 
        path="/blogs/:slug" 
        element={<BlogDetailsWrapper {...navProps} />} 
      />
      <Route 
        path="*" 
        element={<LandingPage onExplore={() => navigate('/home')} />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

