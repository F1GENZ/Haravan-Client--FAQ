import { Breadcrumb, Flex, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const PageHeader = ({ title, subtitle, crumbs = [], extra }) => (
  <div style={{ marginBottom: 18 }}>
    <Breadcrumb
      style={{ marginBottom: 12 }}
      items={[
        { title: <Link to='/' aria-label='Câu hỏi của shop'><HomeOutlined /></Link> },
        ...crumbs.map((crumb) => ({ title: crumb })),
      ]}
    />
    <Flex align='flex-start' justify='space-between' gap={16} wrap='wrap'>
      <div style={{ minWidth: 0, flex: '1 1 320px' }}>
        <Title level={4} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle ? (
          <Text type='secondary' style={{ fontSize: 13 }}>
            {subtitle}
          </Text>
        ) : null}
      </div>
      {extra ? <div style={{ flex: '0 1 auto', maxWidth: '100%' }}>{extra}</div> : null}
    </Flex>
  </div>
);

export default PageHeader;
