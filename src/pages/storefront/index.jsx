import { Alert, Button, Card, Descriptions, Flex, Space, Spin, Tag, Typography, message } from 'antd';
import { CloudUploadOutlined, CodeOutlined, CopyOutlined, GlobalOutlined } from '@ant-design/icons';
import { useInstallSnippet, useSnippetStatus } from '../../common/ThemeService';
import { toResultError } from '../../common/apiResult';
import { useCanWrite } from '../../common/TrialService';
import { hasSession } from '../../lib/session';
import PageHeader from '../../components/page-header';
import LoginRequired from '../../components/login-required';

const { Paragraph, Text } = Typography;

const cardTitle = (icon, text) => (
  <Flex align='center' gap={8}>
    {icon}
    <span>{text}</span>
  </Flex>
);

const INCLUDE_LINES = [
  {
    label: 'Tự động theo template (khuyên dùng)',
    code: "{% assign faq_title = 'Câu hỏi thường gặp' %}{% include 'f1genz-faq' %}",
  },
  {
    label: 'Luôn hiển thị FAQ của shop',
    code: "{% assign faq_title = 'Câu hỏi thường gặp' %}{% assign faq_source = 'shop' %}{% include 'f1genz-faq' %}",
  },
];

const Storefront = () => {
  const { data, isLoading, isError, error } = useSnippetStatus();
  const installSnippet = useInstallSnippet();
  const canWrite = useCanWrite();

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      message.success('Đã sao chép.');
    } catch {
      message.warning('Không thể sao chép tự động, vui lòng chọn và sao chép thủ công.');
    }
  };

  const header = (
    <PageHeader
      title='Hiển thị trên website'
      subtitle='Cài snippet F1GENZ FAQ vào theme đang xuất bản rồi chèn một dòng include vào template muốn hiển thị.'
      crumbs={['Hiển thị trên website']}
    />
  );

  if (!hasSession()) {
    return (
      <>
        {header}
        <LoginRequired />
      </>
    );
  }

  const installed = data?.installed === true;
  const version = data?.version ?? null;
  const latestVersion = data?.latest_version ?? null;
  const needsUpdate =
    installed &&
    latestVersion !== null &&
    String(version ?? '') !== String(latestVersion);

  return (
    <>
      {header}
      <Space direction='vertical' size={16} className='w-full'>
        <Card title={cardTitle(<GlobalOutlined style={{ color: '#1677ff' }} />, 'Trạng thái snippet')}>
          {isLoading ? (
            <Spin />
          ) : isError ? (
            <Alert
              type='error'
              showIcon
              message='Không tải được trạng thái snippet'
              description={toResultError(error).errorMessage}
            />
          ) : (
            <Flex vertical gap={16}>
              <Descriptions column={1} size='small'>
                <Descriptions.Item label='Trạng thái'>
                  {installed ? (
                    <Tag color='green'>Đã cài</Tag>
                  ) : (
                    <Tag color='red'>Chưa cài</Tag>
                  )}
                  {needsUpdate && (
                    <Tag color='orange' className='ml-2'>
                      Có bản cập nhật mới
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label='Theme đang xuất bản'>
                  {data?.theme_name || 'Chưa xác định'}
                </Descriptions.Item>
                <Descriptions.Item label='Phiên bản snippet'>
                  {installed ? version || 'Chưa xác định' : '—'}
                </Descriptions.Item>
                <Descriptions.Item label='Phiên bản mới nhất'>
                  {latestVersion || 'Chưa xác định'}
                </Descriptions.Item>
              </Descriptions>

              <div>
                <Button
                  type='primary'
                  icon={<CloudUploadOutlined />}
                  loading={installSnippet.isPending}
                  disabled={!canWrite}
                  onClick={() => installSnippet.mutate()}
                >
                  {installed ? 'Cập nhật' : 'Cài vào theme'}
                </Button>
              </div>

              {!canWrite && (
                <Alert
                  type='warning'
                  showIcon
                  message='Bạn cần kích hoạt ứng dụng để cài snippet vào theme.'
                />
              )}
            </Flex>
          )}
        </Card>

        <Card title={cardTitle(<CodeOutlined style={{ color: '#722ed1' }} />, 'Chèn vào template')}>
          <Paragraph>
            Dán dòng phù hợp vào template bạn muốn hiển thị FAQ (thường là{' '}
            <Text code>templates/product.liquid</Text>,{' '}
            <Text code>templates/collection.liquid</Text> hoặc{' '}
            <Text code>templates/page.liquid</Text>). Snippet tự chọn FAQ của sản
            phẩm, danh mục hoặc trang theo template và không hiển thị gì khi chưa
            có câu hỏi.
          </Paragraph>
          <Space direction='vertical' size='middle' className='w-full'>
            {INCLUDE_LINES.map((item) => (
              <div key={item.code}>
                <Text strong>{item.label}</Text>
                <Flex
                  align='center'
                  justify='space-between'
                  gap={12}
                  className='mt-1 bg-gray-50 border border-gray-200 rounded px-3 py-2'
                >
                  <Text code className='break-all'>
                    {item.code}
                  </Text>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(item.code)}
                  >
                    Sao chép
                  </Button>
                </Flex>
              </div>
            ))}
          </Space>
          <Paragraph className='mt-3 mb-0'>
            <Text code>faq_title</Text> là tiêu đề hiển thị phía trên danh sách; bỏ dòng{' '}
            <Text code>assign faq_title</Text> nếu không muốn hiện tiêu đề. Khi bộ câu hỏi có từ 2
            phân loại trở lên, snippet nhóm câu hỏi theo <Text strong>Phân loại</Text>.
          </Paragraph>
          <Alert
            className='mt-4'
            type='info'
            showIcon
            message='Snippet hiển thị dạng <details> không cần JavaScript và tự sinh JSON-LD FAQPage cho các câu hỏi có bật Schema Markup.'
          />
        </Card>
      </Space>
    </>
  );
};

export default Storefront;
