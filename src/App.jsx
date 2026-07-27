import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ExploreTemplesPage from './components/ExploreTemplesPage';
import ProductsPage from './components/ProductsPage';
import BlogDetailsPage from './components/BlogDetailsPage';
import LoginPage from './components/LoginPage';

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

  // Route: /login -> Displays Placeholder Login Page
  if (currentPath === '/login') {
    return (
      <LoginPage 
        onGoToHome={() => navigateTo('/home')}
        onGoToLanding={() => navigateTo('/')}
        onExploreTemples={() => navigateTo('/explore')}
        onGoToProducts={() => navigateTo('/products')}
        onGoToLogin={() => navigateTo('/login')}
      />
    );
  }

  // Route: /blogs/:slug -> Displays Blog Details Page
  if (currentPath.startsWith('/blogs/')) {
    const slug = currentPath.replace('/blogs/', '');
    return (
      <BlogDetailsPage 
        slug={slug}
        onGoToHome={() => navigateTo('/home')}
        onGoToLanding={() => navigateTo('/')}
        onExploreTemples={() => navigateTo('/explore')}
        onGoToProducts={() => navigateTo('/products')}
        onGoToLogin={() => navigateTo('/login')}
        onNavigateToBlog={(newSlug) => navigateTo(`/blogs/${newSlug}`)}
      />
    );
  }

  // Route: /products -> Displays Vendor Services & Offerings Products Page
  if (currentPath === '/products') {
    return (
      <ProductsPage 
        onGoToHome={() => navigateTo('/home')}
        onGoToLanding={() => navigateTo('/')}
        onExploreTemples={() => navigateTo('/explore')}
        onGoToLogin={() => navigateTo('/login')}
      />
    );
  }

  // Route: /explore -> Displays Explore Temples Page
  if (currentPath === '/explore') {
    return (
      <ExploreTemplesPage 
        onGoToHome={() => navigateTo('/home')}
        onGoToLanding={() => navigateTo('/')}
        onGoToProducts={() => navigateTo('/products')}
        onGoToLogin={() => navigateTo('/login')}
      />
    );
  }

  // Route: /home -> Displays Temple Website Home Page
  if (currentPath === '/home') {
    return (
      <HomePage 
        onGoToLanding={() => navigateTo('/')}
        onExploreTemples={() => navigateTo('/explore')}
        onGoToProducts={() => navigateTo('/products')}
        onGoToLogin={() => navigateTo('/login')}
        onGoToBlog={(slug) => navigateTo(`/blogs/${slug}`)}
      />
    );
  }

  // Default Route: / -> Displays Original Luxury Landing Page (Unchanged)
  return <LandingPage onExplore={() => navigateTo('/home')} />;
}
