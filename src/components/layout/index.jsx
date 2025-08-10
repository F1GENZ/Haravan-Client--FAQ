import { Layout, Flex, Menu } from 'antd';
const { Header, Footer, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
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
              <li><a className='text-white! block text-base!' href="#">⭐ Giới thiệu</a></li>
              <li><a className='text-white! block text-base!' href="#">📑 Hướng dẫn sử dụng</a></li>
              <li><a className='text-white! block text-base!' href="#">❓ Hướng dẫn cấu hình</a></li>
              <li><a className='text-white! block text-base!' href="#">🛠️ Cài đặt</a></li>
              <li><a className='text-white! block text-base!' href="#">📩 Liên hệ hỗ trợ</a></li>
            </ul>
          </div>
          <Footer className='bg-transparent! h-fit! p-2! *:text-white text-xs! space-y-1'>
            <p>Bạn còn <strong className='text-red-500 text-!'>15 ngày</strong> dùng thử</p>
            <p>©{new Date().getFullYear()} F1GENZ. All rights reserved.</p>
          </Footer>
        </Flex>
      </Sider>
      <Content className='flex-1 px-4! my-2!'>
        <div className='container h-full'>
          <div className='bg-white shadow-md rounded-lg h-full overflow-y-auto'>
            {children}
          </div>
        </div>
      </Content>

    </Layout>
  );
};

export default MainLayout;
