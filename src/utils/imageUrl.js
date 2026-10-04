/**
 * Centralized Image URL Resolver & Cache-Buster for Darshan Journey
 * 
 * Ensures images resolve smoothly between Vite (port 3000), Express (port 5000),
 * and static/uploaded assets, preventing stale browser caching and broken localhost URLs.
 */

export function resolveImageUrl(rawUrl, updatedAt = null, fallback = '') {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return fallback || '';
  }

  let cleanUrl = rawUrl.trim();

  // Strip hardcoded localhost ports if any, converting to relative paths for Vite proxy compatibility
  if (cleanUrl.startsWith('http://localhost:5000/') || cleanUrl.startsWith('http://127.0.0.1:5000/')) {
    cleanUrl = cleanUrl.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, '');
  } else if (cleanUrl.startsWith('http://localhost:3000/') || cleanUrl.startsWith('http://127.0.0.1:3000/')) {
    cleanUrl = cleanUrl.replace(/^http:\/\/(localhost|127\.0\.0\.1):3000/, '');
  }

  // Base64 data URLs & blobs do not require cache busting
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // Cache busting query token
  let token = null;
  if (updatedAt) {
    if (typeof updatedAt === 'string' || typeof updatedAt === 'number') {
      const timeVal = new Date(updatedAt).getTime();
      token = isNaN(timeVal) ? String(updatedAt) : String(timeVal);
    } else if (updatedAt === true) {
      token = String(Date.now());
    }
  }

  if (token) {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    // Remove existing v= param if present
    const withoutOldV = cleanUrl.replace(/([?&])v=[^&]*(&|$)/, '$1').replace(/[?&]$/, '');
    const cleanSep = withoutOldV.includes('?') ? '&' : '?';
    return `${withoutOldV}${cleanSep}v=${token}`;
  }

  return cleanUrl;
}

export default resolveImageUrl;
