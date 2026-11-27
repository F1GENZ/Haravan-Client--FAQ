import { Spin } from 'antd';
import { useEffect } from 'react';
import { requestLoginUrl } from '../../../common/AuthService';
import { getOrgid, hasSession } from '../../../lib/session';
import { isEmbedded } from '../../../lib/haravanApp';

const Login = () => {
  useEffect(() => {
    // Haravan opens the app here with ?code= (a registered redirect URI): the API exchanges it with the
    // same redirect URI because the app is served from more than one host.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      const apiBase = (import.meta.env.VITE_APP_API_URL || "").replace(/\/?$/, "/");
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      window.location.replace(`${apiBase}api/oauth/install/grandservice?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`);
      return;
    }

    // Inside the admin iframe the bridge session token is the credential: the merchant's admin
    // session mints it on demand, so this page's only job is to enter the app. Sending the
    // browser to the Haravan authorize page would re-show the consent screen on every open,
    // which is exactly the loop this avoids. The force=oauth escape exists because a shop that
    // has never installed the app cannot mint a resolvable bridge token: the 401 handler sends
    // it here once, and the OAuth install flow is the only correct continuation.
    const forceOauth = new URLSearchParams(window.location.search).get('force') === 'oauth';
    if (isEmbedded() && !forceOauth) {
      window.location.replace('/');
      return;
    }

    // The app session lives 12h server-side and now outlives the tab. Authorize only when
    // there is no credential at all; the consent screen otherwise greets a merchant who
    // already logged in this morning.
    if (hasSession() && !forceOauth) {
      window.location.replace('/');
      return;
    }

    requestLoginUrl(getOrgid())
      .then((response) => {
        if (response.status === 200 && typeof response.data === 'string' && response.data.trim()) {
          window.location.replace(response.data.trim());
        }
      })
      .catch((error) => {
        console.error('Error requesting the Haravan login URL:', error);
      });
  }, []);

  return <Spin size='large' fullscreen />;
};

export default Login;
