import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ExploreTemplesPage from './components/ExploreTemplesPage';
import ProductsPage from './components/ProductsPage';
import BlogDetailsPage from './components/BlogDetailsPage';
import LoginPage from './components/LoginPage';

function BlogDetailsWrapper() {
  const navigate = useNavigate();
  const { slug } = useParams();
  return (
    <BlogDetailsPage 
      slug={slug}
      onGoToHome={() => navigate('/home')}
      onGoToLanding={() => navigate('/')}
      onExploreTemples={() => navigate('/explore')}
      onGoToProducts={() => navigate('/products')}
      onGoToLogin={() => navigate('/login')}
      onNavigateToBlog={(newSlug) => navigate(`/blogs/${newSlug}`)}
    />
  );
}

function AppRoutes() {
  const navigate = useNavigate();

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
            onGoToLanding={() => navigate('/')}
            onExploreTemples={() => navigate('/explore')}
            onGoToProducts={() => navigate('/products')}
            onGoToLogin={() => navigate('/login')}
            onGoToBlog={(slug) => navigate(`/blogs/${slug}`)}
          />
        } 
      />
      <Route 
        path="/explore" 
        element={
          <ExploreTemplesPage 
            onGoToHome={() => navigate('/home')}
            onGoToLanding={() => navigate('/')}
            onGoToProducts={() => navigate('/products')}
            onGoToLogin={() => navigate('/login')}
          />
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProductsPage 
            onGoToHome={() => navigate('/home')}
            onGoToLanding={() => navigate('/')}
            onExploreTemples={() => navigate('/explore')}
            onGoToLogin={() => navigate('/login')}
          />
        } 
      />
      <Route 
        path="/blogs/:slug" 
        element={<BlogDetailsWrapper />} 
      />
      <Route 
        path="/login" 
        element={
          <LoginPage 
            onGoToHome={() => navigate('/home')}
            onGoToLanding={() => navigate('/')}
            onExploreTemples={() => navigate('/explore')}
            onGoToProducts={() => navigate('/products')}
            onGoToLogin={() => navigate('/login')}
          />
        } 
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
