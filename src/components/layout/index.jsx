import { Layout, Flex, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { trialService } from '../../common/TrialService';

const { Header, Footer, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
  const orgid = sessionStorage.getItem("orgid");
  const hasOrgid = orgid && orgid !== 'null' && orgid !== 'undefined' && orgid.trim() !== '';
  const { data: trialInfo, isLoading: trialLoading } = trialService.useGetTrialInfo(orgid);

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
        <div className='w-full h-full'>
          <div className='bg-white shadow-md rounded-lg h-full overflow-y-auto'>
            {children}
          </div>
        </div>
      </Content>

    </Layout>
  );
};

export default MainLayout;
