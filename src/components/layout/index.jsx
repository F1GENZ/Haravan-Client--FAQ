import { useState, useMemo, useEffect, useRef } from 'react';
import { Layout, Flex, Menu, AutoComplete, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { trialService } from '../../common/TrialService';
import { productService } from '../../common/ProductService';

const { Header, Footer, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const orgid = sessionStorage.getItem("orgid");
  const hasOrgid = orgid && orgid !== 'null' && orgid !== 'undefined' && orgid.trim() !== '';
  const { data: trialInfo, isLoading: trialLoading } = trialService.useGetTrialInfo(orgid);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimerRef = useRef(null);

  // Debounce search query to reduce API calls (respect Haravan rate limit)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms debounce delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const { data: searchResults, isLoading: searchLoading } = productService.useSearchProducts(debouncedQuery, 10);

  // Format search options for AutoComplete
  const searchOptions = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];
    
    return searchResults.map((product) => ({
      value: product.title,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {product.image && (
            <img 
              src={product.image} 
              alt={product.title}
              style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
          <div style={{ fontWeight: 500 }}>{product.title}</div>
        </div>
      ),
      product: product,
    }));
  }, [searchResults]);

  const handleSearchSelect = (value, option) => {
    if (option?.product) {
      const orgid = sessionStorage.getItem("orgid");
      const locale = new URLSearchParams(window.location.search).get("locale") || "vi";
      const productId = option.product.id;
      navigate(`/products?id=${productId}${orgid ? `&orgid=${orgid}` : ''}&locale=${locale}`);
      setSearchQuery('');
    }
  };

  const handleSearch = (value) => {
    if (value && value.trim()) {
      const orgid = sessionStorage.getItem("orgid");
      const locale = new URLSearchParams(window.location.search).get("locale") || "vi";
      navigate(`/products?search=${encodeURIComponent(value.trim())}${orgid ? `&orgid=${orgid}` : ''}&locale=${locale}`);
      setSearchQuery('');
    }
  };

  const renderTrialInfo = () => {
    // Don't show trial info if no orgid
    if (!hasOrgid) {
      return null;
    }

    if (trialLoading) {
      return <p>Đang tải...</p>;
    }

    if (!trialInfo) {
      return null;
    }

    const { days_remaining, is_unlimited, status } = trialInfo;

    // Don't show if not authenticated or error
    if (status === 'not_authenticated' || status === 'error' || status === 'not_found') {
      return null;
    }

    if (is_unlimited || status === 'active') {
      return <p><strong className='text-green-500 text-!'>✓ Đã kích hoạt vĩnh viễn</strong></p>;
    }

    if (days_remaining <= 0) {
      return <p><strong className='text-red-500 text-!'>⚠️ Đã hết hạn dùng thử</strong></p>;
    }

    return <p>Bạn còn <strong className='text-red-500 text-!'>{days_remaining} ngày</strong> dùng thử</p>;
  };

  return (
    <Layout className='h-screen w-screen'>
      <Sider width="210">
        <Flex className='flex-col h-full bg-[#001529] space-y-2'>
          <Header className='bg-blue-300! h-fit! p-2!'>
            <Flex justify='between' align='center' gap={16}>
              <img src='/logo.png' alt='Logo' className='h-auto max-w-6' />
              <h1 className='text-xl font-bold'>F1GENZ FAQ</h1>
            </Flex>
          </Header>
          <div className='flex-1'>
            <ul className='*:py-3! *:px-1!'>
              <li><Link className='text-white! block text-base!' to="/">🏠 Trang tổng</Link></li>
              <li><Link className='text-white! block text-base!' to="/introduction">⭐ Giới thiệu</Link></li>
              <li><Link className='text-white! block text-base!' to="/guide">📑 Hướng dẫn sử dụng</Link></li>
            </ul>
          </div>
          <Footer className='bg-transparent! h-fit! p-2! *:text-white text-xs! space-y-1'>
            {renderTrialInfo()}
            <p>©{new Date().getFullYear()} F1GENZ. All rights reserved.</p>
          </Footer>
        </Flex>
      </Sider>
      <Content className='flex-1 px-4! my-2!'>
        <div className='w-full h-full flex flex-col'>
          {hasOrgid && (
            <div className='bg-white shadow-md rounded-t-lg p-4 border-b border-gray-200'>
              <div className='flex justify-center'>
                <AutoComplete
                  style={{ width: '100%', maxWidth: '600px' }}
                  options={searchOptions}
                  onSelect={handleSearchSelect}
                  onSearch={setSearchQuery}
                  value={searchQuery}
                  filterOption={false}
                  notFoundContent={searchLoading ? 'Đang tìm kiếm...' : debouncedQuery ? 'Không tìm thấy sản phẩm' : 'Nhập để tìm kiếm'}
                  allowClear
                  dropdownStyle={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1050
                  }}
                >
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    prefix={<SearchOutlined style={{ color: '#999' }} />}
                    size="large"
                    onPressEnter={(e) => {
                      const value = e.target.value;
                      if (value && value.trim()) {
                        handleSearch(value.trim());
                      }
                    }}
                    style={{ borderRadius: '8px' }}
                  />
                </AutoComplete>
              </div>
            </div>
          )}
          <div className='bg-white shadow-md rounded-lg flex-1 overflow-y-auto' style={{ borderRadius: hasOrgid ? '0 0 8px 8px' : '8px' }}>
            {children}
          </div>
        </div>
      </Content>

    </Layout>
  );
};

export default MainLayout;
