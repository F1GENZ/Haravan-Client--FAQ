import { Button, Card, Result } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const LoginRequired = () => (
  <Card style={{ borderRadius: 12 }}>
    <Result
      icon={<LockOutlined style={{ color: '#1677ff' }} />}
      title='Vui lòng đăng nhập để sử dụng tính năng này'
      subTitle='Mở ứng dụng từ trang quản trị Haravan để có phiên làm việc hợp lệ.'
      extra={
        <Button type='primary' href='/install/login'>
          Đăng nhập
        </Button>
      }
    />
  </Card>
);

export default LoginRequired;
