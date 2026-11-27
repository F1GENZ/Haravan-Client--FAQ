import { createRoot } from 'react-dom/client'
import '@ant-design/v5-patch-for-react-19';
import App from './App'
import './App.css';
import './index.css'


import { ConfigProvider } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/QueryClientConfig';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { APP_ANTD_THEME } from './common/antdTheme';
import ErrorBoundary from './components/error-boundary';

const PRELOAD_RELOAD_KEY = 'faq:preload-reload-at';
const PRELOAD_RELOAD_WINDOW_MS = 10 * 1000;

// A new deploy replaces the hashed chunks; a tab still running the old index.html would fail
// to import a missing chunk and blank the admin app. Reload once to pick up the new HTML, and
// skip a second reload inside the window so a broken deploy cannot loop.
window.addEventListener('vite:preloadError', (event) => {
  const lastAttempt = Number(window.sessionStorage.getItem(PRELOAD_RELOAD_KEY) ?? 0);
  if (Date.now() - lastAttempt < PRELOAD_RELOAD_WINDOW_MS) return;
  event.preventDefault();
  window.sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
  window.location.reload();
});

// The Haravan admin iframe opens the app at /install/login?shop=...&orgid=..., and that page
// redirects into the app, dropping the query. The App Bridge SDK needs the shop after landing,
// so the parameters are captured here before any route logic runs — sessionStorage because an
// embedded session is a per-tab context, exactly what the SDK reads back in haravanApp.js.
{
  const params = new URLSearchParams(window.location.search);
  const shop = params.get('shop');
  const orgid = params.get('orgid');
  if (shop) window.sessionStorage.setItem('hrv_shop', shop);
  if (orgid) window.sessionStorage.setItem('hrv_orgid', orgid);
}

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider theme={APP_ANTD_THEME}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ConfigProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
