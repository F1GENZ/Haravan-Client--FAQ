import { Suspense, useEffect, useState } from 'react';
import { Alert, Button, Flex, Layout, Menu, Spin, Tag, Typography } from 'antd';
import {
  AppstoreOutlined,
  BookOutlined,
  CalendarOutlined,
  CloseOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTrialInfo } from '../../common/TrialService';
import { getOrgid, hasCredentials } from '../../lib/session';
import { TRIAL_EXPIRED_MESSAGE } from '../../lib/messages';

const { Sider, Content } = Layout;
const { Text } = Typography;

const SIDER_WIDTH = 260;
const MOBILE_BP = 768;
const MOBILE_BAR_HEIGHT = 48;
const SIDEBAR_BG = '#001529';
const SIDEBAR_BORDER = 'rgba(255, 255, 255, 0.10)';
const CONTENT_MAX_WIDTH = 1560;
const BRAND_GRADIENT = 'linear-gradient(135deg, #1677ff, #0958d9)';

const MENU_ITEMS = [
  { key: '/', icon: <QuestionCircleOutlined />, label: 'Câu hỏi của shop' },
  { key: '/products', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
  { key: '/collections', icon: <AppstoreOutlined />, label: 'Danh mục' },
  { key: '/pages', icon: <FileTextOutlined />, label: 'Trang' },
  { key: '/storefront', icon: <GlobalOutlined />, label: 'Hiển thị trên website' },
  { key: '/guide', icon: <BookOutlined />, label: 'Hướng dẫn' },
  { key: '/introduction', icon: <InfoCircleOutlined />, label: 'Giới thiệu' },
  { key: '/contact', icon: <CustomerServiceOutlined />, label: 'Liên hệ' },
];

const formatBuildTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
  const day = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
  return `${time} ${day} GMT+7`;
};

const BUILD_TIME = formatBuildTime(import.meta.env.VITE_BUILD_TIME);

const planOf = (trial) => {
  if (!trial || trial.status === 'unknown' || trial.status === 'not_found') return null;
  if (trial.is_unlimited || trial.status === 'active') {
    return {
      label: 'Đã kích hoạt',
      status: 'Hoạt động',
      statusColor: '#52c41a',
      tag: { color: '#f6ffed', borderColor: '#b7eb8f', background: 'rgba(82, 196, 26, 0.16)' },
    };
  }
  if (trial.can_write === false) {
    return {
      label: 'Hết hạn dùng thử',
      status: 'Hết hạn dùng thử',
      statusColor: '#ff4d4f',
      tag: { color: '#fff1f0', borderColor: 'rgba(255, 120, 117, 0.62)', background: 'rgba(255, 77, 79, 0.16)' },
    };
  }
  return {
    label: 'Dùng thử',
    status: trial.days_remaining > 0 ? `Còn ${trial.days_remaining} ngày` : 'Dùng thử',
    statusColor: '#faad14',
    tag: { color: '#e6f4ff', borderColor: 'rgba(145, 202, 255, 0.62)', background: 'rgba(22, 119, 255, 0.18)' },
  };
};

const selectedKeyFor = (pathname) =>
  MENU_ITEMS.filter((item) => item.key !== '/').find((item) => pathname.startsWith(item.key))?.key ?? '/';

const InfoRow = ({ icon, label, value, valueColor = '#fff' }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
    <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.68)' }}>
      {icon}
      {label}
    </Text>
    <Text style={{ fontSize: 11, fontWeight: 600, color: valueColor }}>{value}</Text>
  </div>
);

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionReady = hasCredentials();
  const { data: trial } = useTrialInfo();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const onChange = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) setMobileOpen(false);
    };
    setIsMobile(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const plan = sessionReady ? planOf(trial) : null;
  const shopDomain = trial?.shop_domain || null;
  const shopLabel = shopDomain || getOrgid() || 'Haravan shop';
  const installedAt = trial?.installed_at ? new Date(trial.installed_at).toLocaleDateString('vi-VN') : null;

  const goHome = () => navigate('/');

  return (
    <Layout className='f1g-admin-layout' style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      {isMobile && mobileOpen ? (
        <div
          aria-hidden='true'
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0, 0, 0, 0.45)' }}
        />
      ) : null}

      {isMobile ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: MOBILE_BAR_HEIGHT,
            zIndex: 98,
            background: SIDEBAR_BG,
            borderBottom: `1px solid ${SIDEBAR_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 10,
          }}
        >
          <Button
            type='text'
            icon={mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
            style={{ color: '#fff' }}
          />
          <QuestionCircleOutlined style={{ fontSize: 16, color: '#60a5fa' }} />
          <Text strong style={{ fontSize: 14, color: '#fff' }}>
            F1GENZ FAQ
          </Text>
        </div>
      ) : null}

      <Sider
        width={SIDER_WIDTH}
        theme='dark'
        className='f1g-admin-sider'
        style={{
          position: 'fixed',
          left: isMobile ? (mobileOpen ? 0 : -SIDER_WIDTH) : 0,
          top: isMobile ? MOBILE_BAR_HEIGHT : 0,
          bottom: 0,
          zIndex: 100,
          background: SIDEBAR_BG,
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
          transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isMobile && mobileOpen ? '4px 0 16px rgba(0, 0, 0, 0.2)' : 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {!isMobile ? (
            <div
              role='button'
              tabIndex={0}
              aria-label='Trang chủ F1GENZ FAQ'
              onClick={goHome}
              onKeyDown={(event) => event.key === 'Enter' && goHome()}
              style={{
                padding: '16px 14px',
                borderBottom: `1px solid ${SIDEBAR_BORDER}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: BRAND_GRADIENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <QuestionCircleOutlined style={{ fontSize: 16, color: '#fff' }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 15, color: '#fff', display: 'block', lineHeight: 1.2 }}>
                  F1GENZ FAQ
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.65)' }}>Câu hỏi thường gặp</Text>
              </div>
            </div>
          ) : null}

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <Menu
              theme='dark'
              className='f1g-admin-menu'
              mode='inline'
              selectedKeys={[selectedKeyFor(location.pathname)]}
              items={MENU_ITEMS}
              onClick={({ key }) => {
                setMobileOpen(false);
                navigate(key);
              }}
              style={{ borderRight: 0, marginTop: 8, background: SIDEBAR_BG }}
            />
          </div>

          <div style={{ padding: 12, borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: BRAND_GRADIENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShopOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {shopDomain ? (
                  <a
                    href={`https://${shopDomain}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    title={shopDomain}
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {shopDomain}
                  </a>
                ) : (
                  <Text style={{ display: 'block', fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: '#fff' }}>
                    {shopLabel}
                  </Text>
                )}
                {plan ? (
                  <Tag
                    style={{
                      fontSize: 10,
                      lineHeight: '18px',
                      padding: '0 7px',
                      margin: '3px 0 0',
                      borderRadius: 5,
                      fontWeight: 600,
                      ...plan.tag,
                    }}
                  >
                    {plan.label}
                  </Tag>
                ) : null}
              </div>
            </div>

            {plan ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${SIDEBAR_BORDER}`,
                  borderRadius: 8,
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <InfoRow label='Trạng thái' value={plan.status} valueColor={plan.statusColor} />
                {installedAt ? (
                  <InfoRow icon={<CalendarOutlined style={{ marginRight: 4 }} />} label='Cài đặt' value={installedAt} />
                ) : null}
              </div>
            ) : null}

            <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${SIDEBAR_BORDER}` }}>
              <Text style={{ display: 'block', fontSize: 11, lineHeight: 1.5, color: 'rgba(255, 255, 255, 0.55)' }}>
                {BUILD_TIME ? `Build lúc ${BUILD_TIME}` : `©${new Date().getFullYear()} F1GENZ`}
              </Text>
            </div>
          </div>
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: isMobile ? 0 : SIDER_WIDTH,
          paddingTop: isMobile ? MOBILE_BAR_HEIGHT : 0,
          background: '#f5f7fb',
          transition: 'margin-left 0.25s',
        }}
      >
        <Content style={{ padding: isMobile ? 14 : 24, minWidth: 0 }}>
          <div className='f1g-admin-content-shell' style={{ width: '100%', maxWidth: CONTENT_MAX_WIDTH, margin: '0 auto' }}>
            {sessionReady && trial?.can_write === false ? (
              <Alert type='warning' showIcon message={TRIAL_EXPIRED_MESSAGE} style={{ marginBottom: 16 }} />
            ) : null}
            <Suspense
              fallback={
                <Flex justify='center' align='center' style={{ minHeight: 320 }}>
                  <Spin />
                </Flex>
              }
            >
              {children}
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
