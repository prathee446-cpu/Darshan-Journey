import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ExploreTemplesPage from './components/ExploreTemplesPage';
import ServicesPage from './components/ServicesPage';
import BlogDetailsPage from './components/BlogDetailsPage';
import LoginPage from './components/LoginPage';
import AboutPage from './components/AboutPage';
import QuickBookingPage from './components/QuickBookingPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync route path changes with browser History API (Back & Forward support)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Helper to normalize path (handle trailing slashes and lowercasing)
  const normalizedPath = (currentPath || '/').toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  // Shared navigation callbacks
  const navProps = {
    onGoToHome: () => navigateTo('/home'),
    onGoToLanding: () => navigateTo('/'),
    onExploreTemples: () => navigateTo('/explore'),
    onGoToProducts: () => navigateTo('/services'),
    onGoToServices: () => navigateTo('/services'),
    onGoToLogin: () => navigateTo('/login'),
    onGoToAbout: () => navigateTo('/about'),
    onOpenBooking: () => navigateTo('/quick-booking'),
  };

  // Route: /login
  if (normalizedPath === '/login') {
    return <LoginPage {...navProps} />;
  }

  // Route: /quick-booking OR /booking
  if (normalizedPath === '/quick-booking' || normalizedPath === '/booking') {
    return <QuickBookingPage {...navProps} />;
  }

  // Route: /about
  if (normalizedPath === '/about') {
    return <AboutPage {...navProps} />;
  }

  // Route: /blogs/:slug
  if (normalizedPath.startsWith('/blogs/')) {
    const slug = normalizedPath.replace('/blogs/', '');
    return (
      <BlogDetailsPage
        {...navProps}
        slug={slug}
        onNavigateToBlog={(newSlug) => navigateTo(`/blogs/${newSlug}`)}
      />
    );
  }

  // Route: /services OR /products
  if (normalizedPath === '/services' || normalizedPath === '/products') {
    return <ServicesPage {...navProps} />;
  }

  // Route: /explore
  if (normalizedPath === '/explore') {
    return <ExploreTemplesPage {...navProps} />;
  }

  // Route: /home
  if (normalizedPath === '/home') {
    return (
      <HomePage
        {...navProps}
        onGoToBlog={(slug) => navigateTo(`/blogs/${slug}`)}
      />
    );
  }

  // Default Route: / -> Displays Original Luxury Landing Page
  return <LandingPage onExplore={() => navigateTo('/home')} />;
}

