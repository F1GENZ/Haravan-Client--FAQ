import { useEffect, useMemo, useState } from 'react';
import { Alert, AutoComplete, Flex, Input, Layout, Menu } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResourceSearch } from '../../common/ResourceService';
import { useTrialInfo } from '../../common/TrialService';
import { hasSession } from '../../lib/session';
import { RESOURCE_TYPES, resourceTypeFromPath } from '../../lib/resources';
import { TRIAL_EXPIRED_MESSAGE } from '../../lib/messages';

const { Header, Footer, Content, Sider } = Layout;

const NAV_ITEMS = [
  { key: '/', label: '🏠 Shop' },
  { key: '/products', label: '🛍️ Sản phẩm' },
  { key: '/collections', label: '📁 Danh mục' },
  { key: '/pages', label: '📄 Trang' },
  { key: '/storefront', label: '🌐 Hiển thị trên website' },
  { type: 'divider' },
  { key: '/introduction', label: '⭐ Giới thiệu' },
  { key: '/guide', label: '📑 Hướng dẫn sử dụng' },
];

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionReady = hasSession();
  const { data: trialInfo, isLoading: trialLoading } = useTrialInfo();

  const resourceType = resourceTypeFromPath(location.pathname);
  const resourceConfig = resourceType ? RESOURCE_TYPES[resourceType] : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, [location.pathname]);

  const { data: searchResults = [], isFetching: searchLoading } = useResourceSearch(
    resourceType ?? undefined,
    debouncedQuery,
    10
  );

  const searchOptions = useMemo(() => {
    return (searchResults ?? []).map((item) => ({
      value: String(item.id),
      item,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
          <div style={{ fontWeight: 500 }}>{item.title}</div>
        </div>
      ),
    }));
  }, [searchResults]);

  const handleSearchSelect = (_value, option) => {
    const item = option?.item;
    if (!item || !resourceConfig) return;

    const params = new URLSearchParams({
      id: String(item.id),
      title: item.title ?? '',
    });
    navigate(`${resourceConfig.path}?${params.toString()}`);
    setSearchQuery('');
  };

  const navKey = NAV_ITEMS.some((item) => item.key === location.pathname)
    ? location.pathname
    : '/';

  const renderTrialInfo = () => {
    if (!sessionReady) return null;
    if (trialLoading) return <p>Đang tải...</p>;
    if (!trialInfo) return null;

    if (trialInfo.can_write === false) {
      return <p><strong className='text-red-500'>⚠️ Đã hết hạn dùng thử</strong></p>;
    }
    if (trialInfo.is_unlimited || trialInfo.status === 'active') {
      return <p><strong className='text-green-500'>✓ Đã kích hoạt</strong></p>;
    }
    if (trialInfo.days_remaining > 0) {
      return (
        <p>
          Bạn còn <strong className='text-red-500'>{trialInfo.days_remaining} ngày</strong> dùng thử
        </p>
      );
    }
    return null;
  };

  return (
    <Layout className='h-screen w-screen'>
      <Sider width="230">
        <Flex className='flex-col h-full bg-[#001529]'>
          <Header className='bg-blue-300! h-fit! p-2!'>
            <Flex justify='between' align='center' gap={16}>
              <img src='/logo.png' alt='Logo' className='h-auto max-w-6' />
              <h1 className='text-xl font-bold'>F1GENZ FAQ</h1>
            </Flex>
          </Header>
          <div className='flex-1 overflow-y-auto'>
            <Menu
              theme='dark'
              mode='inline'
              selectedKeys={[navKey]}
              items={NAV_ITEMS}
              onClick={({ key }) => navigate(key)}
              style={{ background: 'transparent', borderInlineEnd: 'none' }}
            />
          </div>
          <Footer className='bg-transparent! h-fit! p-2! *:text-white text-xs! space-y-1'>
            {renderTrialInfo()}
            <p>©{new Date().getFullYear()} F1GENZ. All rights reserved.</p>
          </Footer>
        </Flex>
      </Sider>
      <Content className='flex-1 px-4! my-2!'>
        <div className='w-full h-full flex flex-col space-y-2'>
          {sessionReady && trialInfo?.can_write === false && (
            <Alert
              type='warning'
              showIcon
              message={TRIAL_EXPIRED_MESSAGE}
            />
          )}
          {sessionReady && resourceConfig && (
            <div className='bg-white shadow-md rounded-lg p-4 border-b border-gray-200'>
              <div className='flex justify-center'>
                <AutoComplete
                  style={{ width: '100%', maxWidth: '600px' }}
                  options={searchOptions}
                  onSelect={handleSearchSelect}
                  onSearch={setSearchQuery}
                  value={searchQuery}
                  filterOption={false}
                  notFoundContent={
                    searchLoading
                      ? 'Đang tìm kiếm...'
                      : debouncedQuery.trim().length >= 2
                        ? `Không tìm thấy ${resourceConfig.label}`
                        : 'Nhập ít nhất 2 ký tự'
                  }
                  allowClear
                  dropdownStyle={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1050
                  }}
                >
                  <Input
                    placeholder={resourceConfig.searchPlaceholder}
                    prefix={<SearchOutlined style={{ color: '#999' }} />}
                    size="large"
                    style={{ borderRadius: '8px' }}
                  />
                </AutoComplete>
              </div>
            </div>
          )}
          <div
            className='bg-white shadow-md rounded-lg flex-1 overflow-y-auto'
            style={{ borderRadius: '8px' }}
          >
            {children}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;
