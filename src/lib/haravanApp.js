import createApp, { actions } from '@haravan/app-sdk';

let appInstance = null;
let currentAppShop = null;

export function resetHaravanApp() {
  appInstance = null;
  currentAppShop = null;
}

export function isEmbedded() {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    // A cross-origin parent throws on window.top access; that only happens inside a frame.
    return true;
  }
}

export function getShopFromUrl() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const urlShop = params.get('shop');
  if (urlShop) {
    sessionStorage.setItem('hrv_shop', urlShop);
    return urlShop;
  }
  const storedShop = sessionStorage.getItem('hrv_shop');
  if (storedShop) return storedShop;

  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname;
      if (host.endsWith('.myharavan.com')) return host;
    } catch {
      // referrer is not a URL; fall through to the orgid heuristic.
    }
  }

  return '';
}

export function getOrgidFromUrl() {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  const urlOrgid = params.get('orgid');
  if (urlOrgid) {
    sessionStorage.setItem('hrv_orgid', urlOrgid);
    return urlOrgid;
  }
  return sessionStorage.getItem('hrv_orgid') || '';
}

/**
 * The App SDK bridge exists only inside the Haravan admin iframe. Outside the admin the app keeps
 * its OAuth login; inside, the bridge session token replaces the whole authorize round trip.
 */
export function initHaravanApp() {
  if (!isEmbedded()) return null;
  const apiKey = (
    import.meta.env.VITE_HARAVAN_CLIENT_ID ||
    import.meta.env.VITE_HRV_CLIENT_ID ||
    '7c96bcd0924eaaa6ff4a9e435090fa88'
  ).trim();
  if (!apiKey) return null;

  const rawShop = getShopFromUrl();
  if (!rawShop) return null;
  const cleanShop = rawShop.includes('.') ? rawShop : `${rawShop}.myharavan.com`;

  if (appInstance && currentAppShop === cleanShop) return appInstance;

  try {
    appInstance = createApp({ apiKey, shopOrigin: cleanShop, embedded: true });
    currentAppShop = cleanShop;
    try {
      const frame = actions.Frame.create(appInstance);
      frame.dispatch(actions.Frame.Action.INITIALIZED);
    } catch (frameErr) {
      console.warn('[haravanApp] Frame initialized dispatch failed:', frameErr);
    }
    return appInstance;
  } catch (err) {
    console.warn('[haravanApp] Initialization failed:', err);
    return null;
  }
}

const cachedTokens = new Map();
const inFlightTokens = new Map();

export function resetSessionTokenCache() {
  cachedTokens.clear();
  inFlightTokens.clear();
}

function getBoundedSessionToken(app, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer = null;
    let unsubscribe = null;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (typeof unsubscribe === 'function') {
        unsubscribe();
        unsubscribe = null;
      }
    };

    try {
      unsubscribe = app.subscribe(
        actions.SessionToken.Action.RESPOND,
        (payload) => {
          if (settled) return;
          settled = true;
          cleanup();
          if (payload && payload.sessionToken) {
            resolve(payload.sessionToken);
          } else {
            reject(new Error((payload && payload.errorCode) || 'Failed to retrieve Haravan session token'));
          }
        },
      );
    } catch (subErr) {
      cleanup();
      reject(subErr);
      return;
    }

    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`SessionToken acquisition timed out (${timeoutMs}ms)`));
    }, timeoutMs);

    try {
      app.dispatch(actions.SessionToken.request());
    } catch (dispErr) {
      cleanup();
      reject(dispErr);
    }
  });
}

/**
 * Haravan session tokens live ~60s; the cache keeps one for 45s per shop and parallel requests
 * coalesce on one in-flight acquisition. Returns '' when the app runs outside the admin iframe
 * so standalone OAuth is untouched.
 */
export async function fetchHaravanSessionToken() {
  if (!isEmbedded()) return '';

  const app = initHaravanApp();
  if (!app) throw new Error('Haravan App Bridge is not initialized in embedded mode');

  const rawShop = getShopFromUrl();
  const cleanShop = rawShop.includes('.') ? rawShop : rawShop ? `${rawShop}.myharavan.com` : '';
  const now = Date.now();

  const cached = cleanShop ? cachedTokens.get(cleanShop) : null;
  if (cached && cached.expiresAt > now) return cached.token;

  if (cleanShop && inFlightTokens.has(cleanShop)) return inFlightTokens.get(cleanShop);

  const tokenPromise = getBoundedSessionToken(app, 5000)
    .then((token) => {
      if (token && cleanShop) {
        cachedTokens.set(cleanShop, { shop: cleanShop, token, expiresAt: Date.now() + 45 * 1000 });
      }
      return token;
    })
    .finally(() => {
      if (cleanShop) inFlightTokens.delete(cleanShop);
    });

  if (cleanShop) inFlightTokens.set(cleanShop, tokenPromise);
  return tokenPromise;
}

export { actions };
