import { Spin } from 'antd';
import { useEffect } from 'react';
import { authService } from '../../../common/AuthService';
const Login = () => {
  let orgid = sessionStorage.getItem("orgid") || 0;
  useEffect(() => {
    // Haravan opens the app here with ?code= (the redirect URI registered in Partners): let the API exchange it.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      window.location.replace(`${import.meta.env.VITE_APP_API_URL}api/oauth/install/grandservice?code=${encodeURIComponent(code)}`);
      return;
    }
    authService.login(orgid).then((response) => {
      if (response.status === 200 && response.data) window.location.href = response.data;
    })
  }, []);
  return <Spin size='large' fullscreen />;
};

export default Login;
