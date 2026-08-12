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
  return typeof window !== 'undefined' && Boolean(window.google?.accounts?.id);
}

// Initialize Google One-Tap or Google Prompt
export function initGoogleGisPrompt(onSuccessCallback, onErrorCallback, loginHint = '') {
  const clientId = getGoogleClientId();
  
  if (!isGoogleGisAvailable()) {
    console.warn('Google Identity Services script not yet loaded.');
    if (onErrorCallback) onErrorCallback('GIS script loading...');
    return false;
  }

  if (!clientId) {
    if (onErrorCallback) onErrorCallback('No Google Client ID configured.');
    return false;
  }

  try {
    const config = {
      client_id: clientId,
      callback: (response) => {
        if (response?.credential) {
          const payload = parseJwt(response.credential);
          if (payload) {
            const userSession = {
              name: payload.name || payload.email.split('@')[0],
              email: payload.email,
              avatar: payload.picture || '',
              sub: payload.sub,
              provider: 'google',
              loggedInAt: new Date().toISOString()
            };
            onSuccessCallback(userSession);
          } else {
            if (onErrorCallback) onErrorCallback('Failed to parse Google credential payload');
          }
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    };

    if (loginHint) {
      config.login_hint = loginHint;
    }

    window.google.accounts.id.initialize(config);

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.warn('Google prompt not displayed:', notification.getNotDisplayedReason());
      }
    });
    return true;
  } catch (err) {
    console.error('Error initializing Google GIS:', err);
    if (onErrorCallback) onErrorCallback(err.message);
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
