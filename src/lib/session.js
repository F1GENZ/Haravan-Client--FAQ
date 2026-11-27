export const SESSION_KEY = "faq_session";
export const ORGID_KEY = "orgid";

function isStoredValue(value) {
  return (
    typeof value === "string" &&
    value !== "null" &&
    value !== "undefined" &&
    value.trim() !== ""
  );
}

/**
 * localStorage first: the Haravan authorize page shows the consent screen on every visit even
 * after install, so a session that dies with the tab means a consent click for every open.
 * Keeping the credential across tabs (its 12h server-side expiry still applies) is what lets
 * a merchant reopen the app without a new OAuth round trip. sessionStorage is the fallback
 * for environments where localStorage is unavailable.
 */
function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage || window.sessionStorage || null;
}

export function parseSessionFragment(hash) {
  if (typeof hash !== "string") return null;
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const session = params.get("session");
  if (!isStoredValue(session)) return null;

  const orgid = params.get("orgid");
  return {
    session: session.trim(),
    orgid: isStoredValue(orgid) ? orgid.trim() : null,
  };
}

export function getSessionToken() {
  const storage = getStorage();
  const token = storage ? storage.getItem(SESSION_KEY) : null;
  return isStoredValue(token) ? token : null;
}

export function getOrgid() {
  const storage = getStorage();
  const orgid = storage ? storage.getItem(ORGID_KEY) : null;
  return isStoredValue(orgid) ? orgid : null;
}

export function hasSession() {
  return Boolean(getSessionToken());
}

export function storeSession({ session, orgid }) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(SESSION_KEY, session);
  if (isStoredValue(orgid)) {
    storage.setItem(ORGID_KEY, orgid);
  } else {
    storage.removeItem(ORGID_KEY);
  }
}

export function clearSessionToken() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(SESSION_KEY);
}
