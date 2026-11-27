import axios from "axios";
import { clearSessionToken, getSessionToken } from "../lib/session";
import { fetchHaravanSessionToken, isEmbedded, resetSessionTokenCache } from "../lib/haravanApp";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Pages that must stay reachable without a session; a 401 there must not bounce us in a loop.
const PUBLIC_ROUTES = ["/install/login", "/install/grandservice"];

// Inside the Haravan admin iframe the App SDK session token is the credential: it is minted
// straight from the merchant's admin session, so the app opens without any OAuth round trip.
// Outside the iframe the OAuth faq_session token stays the only credential.
httpClient.interceptors.request.use(
  async (config) => {
    if (isEmbedded()) {
      try {
        const bridgeToken = await fetchHaravanSessionToken();
        if (bridgeToken) {
          config.headers.Authorization = `Bearer ${bridgeToken}`;
          return config;
        }
      } catch {
        // Token acquisition failed; fall through to whatever credential is stored.
      }
    }
    const token = getSessionToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      const config = error.config;
      // In embedded mode a 401 can come from a stale bridge token: fetch a fresh one and retry
      // once before treating the session as dead. That keeps the app open even through clock
      // skew or a token invalidated mid-request.
      if (isEmbedded() && config && !config._bridgeRetryDone) {
        config._bridgeRetryDone = true;
        resetSessionTokenCache();
        try {
          const freshToken = await fetchHaravanSessionToken();
          if (freshToken) {
            config.headers.Authorization = `Bearer ${freshToken}`;
            return httpClient.request(config);
          }
        } catch {
          // No fresh token either; the install is genuinely missing or revoked.
        }
      }
      // The token is the credential; the org id stays so the login redirect can target the same shop.
      clearSessionToken();
      const path = window.location.pathname;
      if (!PUBLIC_ROUTES.some((route) => path.startsWith(route))) {
        window.location.replace("/install/login");
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
