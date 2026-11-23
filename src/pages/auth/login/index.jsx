import { Spin } from 'antd';
import { useEffect } from 'react';
import { authService } from '../../../common/AuthService';
const Login = () => {
  let orgid = sessionStorage.getItem("orgid") || 0;
  useEffect(() => {
    // Haravan opens the app here with ?code= (a redirect URI registered in Partners): let the API exchange it
    // with the same redirect URI, since the app is served from more than one host.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      window.location.replace(`${import.meta.env.VITE_APP_API_URL}api/oauth/install/grandservice?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`);
      return;
    }
    authService.login(orgid).then((response) => {
      if (response.status === 200 && response.data) window.location.href = response.data;
    })
  }, []);
  return <Spin size='large' fullscreen />;
};

export default Login;
