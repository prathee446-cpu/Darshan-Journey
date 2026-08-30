/**
 * Google Authentication Utility Service for Darshan Journey
 * Provides integration with Google Identity Services (GIS) & OAuth 2.0
 */

// Helper to get configured Google Client ID from environment or localStorage
export function getGoogleClientId() {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem('darshan_google_client_id') ||
    ''
  );
}

// Save custom Client ID to localStorage for local testing
export function setSavedGoogleClientId(clientId) {
  if (clientId) {
    localStorage.setItem('darshan_google_client_id', clientId.trim());
  } else {
    localStorage.removeItem('darshan_google_client_id');
  }
}

// Decode base64 JWT Token payload from Google GIS Credential Response
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse Google JWT token:', err);
    return null;
  }
}

// Check if GIS script is loaded
export function isGoogleGisAvailable() {
  return typeof window !== 'undefined' && Boolean(window.google?.accounts);
}

// Dynamically ensure Google Identity Services script is loaded
export function ensureGoogleGisLoaded(timeoutMs = 3500) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }
    if (window.google?.accounts) {
      return resolve(true);
    }

    let script = document.getElementById('google-gis-client');
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-gis-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkInterval = 100;
    let elapsed = 0;
    const intervalId = setInterval(() => {
      elapsed += checkInterval;
      if (window.google?.accounts) {
        clearInterval(intervalId);
        resolve(true);
      } else if (elapsed >= timeoutMs) {
        clearInterval(intervalId);
        resolve(Boolean(window.google?.accounts));
      }
    }, checkInterval);

    script.addEventListener('load', () => {
      clearInterval(intervalId);
      resolve(Boolean(window.google?.accounts));
    }, { once: true });

    script.addEventListener('error', () => {
      clearInterval(intervalId);
      resolve(false);
    }, { once: true });
  });
}

// Initialize and trigger Google OAuth 2.0 Popup Token Client (Fast, sub-second popup)
export async function triggerGoogleTokenPopup({ onSuccess, onError, onCancel }) {
  const clientId = getGoogleClientId();

  if (!clientId) {
    if (onError) onError('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env.');
    return false;
  }

  const isLoaded = await ensureGoogleGisLoaded(3500);
  if (!isLoaded || !window.google?.accounts?.oauth2) {
    if (onError) onError('Google Identity Services library is initializing. Please try again.');
    return false;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      prompt: '', // No forced consent prompt if already authorized
      callback: (tokenResponse) => {
        if (tokenResponse?.error) {
          console.warn('Google Token Client error:', tokenResponse.error);
          if (tokenResponse.error === 'access_denied' || tokenResponse.error === 'popup_closed_by_user') {
            if (onCancel) onCancel();
          } else {
            if (onError) onError(`Google Sign-In error: ${tokenResponse.error}`);
          }
          return;
        }

        if (tokenResponse?.access_token) {
          if (onSuccess) onSuccess({ accessToken: tokenResponse.access_token });
        } else {
          if (onError) onError('No access token received from Google.');
        }
      },
      error_callback: (nonOAuthErr) => {
        console.warn('Google Token Client non-oauth error:', nonOAuthErr);
        if (onCancel) onCancel();
      }
    });

    tokenClient.requestAccessToken();
    return true;
  } catch (err) {
    console.error('Error invoking Google Token Client:', err);
    if (onError) onError(err.message || 'Failed to open Google Sign-In popup.');
    return false;
  }
}

// Trigger Google OAuth 2.0 Web Auth Endpoint Flow
export function triggerGoogleOAuthRedirect(loginHint = '') {
  const clientId = getGoogleClientId();
  const redirectUri = window.location.origin + window.location.pathname;
  
  if (!clientId) {
    return false;
  }

  let oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token%20id_token&` +
    `scope=${encodeURIComponent('openid email profile')}&` +
    `nonce=${Math.random().toString(36).substring(2)}&` +
    `prompt=select_account`;

  if (loginHint) {
    oauthUrl += `&login_hint=${encodeURIComponent(loginHint)}`;
  }

  window.location.href = oauthUrl;
  return true;
}

// Parse OAuth Callback URL Hash (when returning from Google OAuth redirect)
export function parseOAuthHashResponse() {
  if (typeof window === 'undefined' || !window.location.hash) return null;

  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const idToken = params.get('id_token');
  const accessToken = params.get('access_token');

  if (idToken) {
    const payload = parseJwt(idToken);
    if (payload) {
      // Clear hash from URL cleanly
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return {
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        avatar: payload.picture || '',
        sub: payload.sub,
        provider: 'google',
        loggedInAt: new Date().toISOString()
      };
    }
  }

  return null;
}
