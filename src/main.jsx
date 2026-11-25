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

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider theme={APP_ANTD_THEME}>
      <App />
    </ConfigProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
