import { Alert, Card, Divider, Flex, Tag, Typography } from 'antd';
import {
  ClockCircleOutlined,
  CustomerServiceOutlined,
  GlobalOutlined,
  MailOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import PageHeader from '../../components/page-header';

const { Paragraph, Text } = Typography;

const CONTACTS = [
  {
    icon: <MailOutlined style={{ color: '#1677ff', fontSize: 18 }} />,
    label: 'Email hỗ trợ',
    value: 'support@f1genz.com',
    href: 'mailto:support@f1genz.com',
    tag: { color: 'blue', text: 'Ưu tiên' },
  },
  {
    icon: <MessageOutlined style={{ color: '#722ed1', fontSize: 18 }} />,
    label: 'Zalo OA',
    value: 'F1GENZ Support',
    href: 'https://zalo.me/f1genz',
  },
  {
    icon: <GlobalOutlined style={{ color: '#13c2c2', fontSize: 18 }} />,
    label: 'Website',
    value: 'f1genz.com',
    href: 'https://f1genz.com',
  },
];

const HOURS = [
  { day: 'T2 - T6', color: 'green', time: '9:00 - 18:00 GMT+7' },
  { day: 'T7', color: 'orange', time: '9:00 - 12:00 GMT+7' },
  { day: 'CN', color: 'default', time: 'Nghỉ' },
];

const ContactItem = ({ icon, label, value, href, tag }) => (
  <Flex align='center' gap={14} style={{ padding: '12px 0' }}>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: '#f6f8fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <Text type='secondary' style={{ display: 'block', fontSize: 12, lineHeight: 1.2 }}>
        {label}
      </Text>
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        style={{ display: 'block', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}
      >
        {value}
      </a>
    </div>
    {tag ? (
      <Tag color={tag.color} style={{ fontSize: 11, margin: 0 }}>
        {tag.text}
      </Tag>
    ) : null}
  </Flex>
);

const Contact = () => (
  <>
    <PageHeader
      title='Liên hệ hỗ trợ'
      subtitle='Kênh hỗ trợ cho chủ shop khi cần trợ giúp về câu hỏi, snippet hoặc theme.'
      crumbs={['Liên hệ']}
    />

    <Alert
      type='success'
      showIcon
      style={{ marginBottom: 16 }}
      message='Gửi kèm ngữ cảnh để được xử lý nhanh'
      description='Khi báo lỗi, gửi thêm domain cửa hàng, đường dẫn trang đang lỗi, ảnh màn hình và các bước tái hiện.'
    />

    <div style={{ display: 'grid', gap: 16, alignItems: 'start', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      <Card size='small' style={{ borderRadius: 12 }} styles={{ body: { padding: '8px 20px' } }}>
        <Flex align='center' gap={8} style={{ paddingTop: 8, marginBottom: 2 }}>
          <CustomerServiceOutlined style={{ color: '#1677ff', fontSize: 16 }} />
          <Text strong>Thông tin liên hệ</Text>
        </Flex>
        {CONTACTS.map((contact, index) => (
          <div key={contact.label}>
            <ContactItem {...contact} />
            {index < CONTACTS.length - 1 ? <Divider style={{ margin: 0 }} /> : null}
          </div>
        ))}
      </Card>

      <Card size='small' style={{ borderRadius: 12 }} styles={{ body: { padding: '16px 20px' } }}>
        <Flex align='center' gap={8} style={{ marginBottom: 12 }}>
          <ClockCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />
          <Text strong>Giờ hỗ trợ</Text>
        </Flex>
        <Flex vertical gap={10}>
          {HOURS.map((row) => (
            <Flex key={row.day} align='center' gap={8}>
              <Tag color={row.color} style={{ margin: 0, padding: '2px 10px' }}>
                {row.day}
              </Tag>
              <Text>{row.time}</Text>
            </Flex>
          ))}
        </Flex>
        <Paragraph type='secondary' style={{ fontSize: 12, lineHeight: 1.7, margin: '14px 0 0' }}>
          Ngoài giờ làm việc, vui lòng gửi email. Lỗi ảnh hưởng website đang bán hàng được ưu tiên xử lý trước.
        </Paragraph>
      </Card>
    </div>
  </>
);

export default Contact;
