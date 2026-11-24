import { Spin } from 'antd';
import { useEffect } from 'react';
import { requestLoginUrl } from '../../../common/AuthService';

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

    requestLoginUrl()
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
