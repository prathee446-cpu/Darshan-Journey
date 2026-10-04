import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resolveImageUrl } from '../utils/imageUrl';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [pagesContent, setPagesContent] = useState({});
  const [articles, setArticles] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(Date.now());

  const fetchAllPublishedContent = useCallback(async () => {
    try {
      // 1. Fetch all CMS Pages Content
      const contentPromise = fetch('/api/content/all')
        .then(res => res.ok ? res.json() : null)
        .then(json => {
          if (json && json.data) {
            const publishedMap = {};
            Object.keys(json.data).forEach(pk => {
              publishedMap[pk] = json.data[pk]?.published || json.data[pk] || {};
            });
            setPagesContent(publishedMap);
          }
        })
        .catch(err => console.warn('ContentContext fetch all error:', err.message));

      // 2. Fetch Articles
      const articlesPromise = fetch('/api/articles')
        .then(res => res.ok ? res.json() : null)
        .then(json => {
          if (json && Array.isArray(json.data)) {
            setArticles(json.data);
          }
        })
        .catch(err => console.warn('ContentContext fetch articles error:', err.message));

      // 3. Fetch Media Assets
      const mediaPromise = fetch('/api/media')
        .then(res => res.ok ? res.json() : null)
        .then(json => {
          if (Array.isArray(json)) {
            setMediaList(json);
          }
        })
        .catch(err => console.warn('ContentContext fetch media error:', err.message));

      await Promise.allSettled([contentPromise, articlesPromise, mediaPromise]);
      setLastFetched(Date.now());
    } catch (err) {
      console.warn('ContentContext sync notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPublishedContent();

    // Listen to custom refresh events across tabs or local storage broadcast
    const handleCustomUpdate = () => {
      fetchAllPublishedContent();
    };

    window.addEventListener('darshan_content_updated', handleCustomUpdate);
    window.addEventListener('focus', handleCustomUpdate);

    return () => {
      window.removeEventListener('darshan_content_updated', handleCustomUpdate);
      window.removeEventListener('focus', handleCustomUpdate);
    };
  }, [fetchAllPublishedContent]);

  // Helper to get published page content
  const getContent = useCallback((pageKey, fallback = {}) => {
    const pk = String(pageKey || 'home').toLowerCase();
    const data = pagesContent[pk];
    if (!data) return fallback;
    return { ...fallback, ...data };
  }, [pagesContent]);

  // Helper to find a media item by ID or role
  const getMediaItem = useCallback((mediaId) => {
    return mediaList.find(m => m.id === mediaId || m._id === mediaId || String(m.id).toLowerCase() === String(mediaId).toLowerCase());
  }, [mediaList]);

  // Helper to resolve a media URL with cache busting
  const getMediaUrl = useCallback((mediaId, fallbackUrl = '') => {
    const item = getMediaItem(mediaId);
    if (item && item.url) {
      return resolveImageUrl(item.url, item.uploadedAt || lastFetched, fallbackUrl);
    }
    return resolveImageUrl(fallbackUrl, lastFetched, fallbackUrl);
  }, [getMediaItem, lastFetched]);

  const value = {
    pagesContent,
    home: pagesContent.home || {},
    about: pagesContent.about || {},
    brand: pagesContent.brand || {},
    articles,
    mediaList,
    loading,
    lastFetched,
    getContent,
    getMediaItem,
    getMediaUrl,
    resolveImageUrl: (url, updatedAt) => resolveImageUrl(url, updatedAt || lastFetched),
    refreshContent: fetchAllPublishedContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

export function useWebsiteContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    // Fallback safe object if used outside Provider
    return {
      getContent: (key, fb) => fb || {},
      home: {},
      about: {},
      brand: {},
      articles: [],
      mediaList: [],
      loading: false,
      getMediaUrl: (_id, fb) => fb || '',
      resolveImageUrl: (url) => url || '',
      refreshContent: () => {}
    };
  }
  return ctx;
}

export default ContentContext;
