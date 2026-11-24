import { Alert, Button, Card, Descriptions, Flex, Space, Spin, Tag, Typography, message } from 'antd';
import { CloudUploadOutlined, CopyOutlined } from '@ant-design/icons';
import { useInstallSnippet, useSnippetStatus } from '../../common/ThemeService';
import { toResultError } from '../../common/apiResult';
import { useCanWrite } from '../../common/TrialService';
import { hasSession } from '../../lib/session';

const { Title, Paragraph, Text } = Typography;

const INCLUDE_LINES = [
  {
    label: 'Tự động theo template (khuyên dùng)',
    code: "{% include 'f1genz-faq' %}",
  },
  {
    label: 'Luôn hiển thị FAQ của shop',
    code: "{% assign faq_source = 'shop' %}{% include 'f1genz-faq' %}",
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

  if (!hasSession()) {
    return (
      <div className='p-6 text-center'>
        <Title level={3} className='text-gray-500'>
          Vui lòng đăng nhập để sử dụng tính năng này
        </Title>
        <Paragraph>
          Bạn cần mở ứng dụng từ Haravan để có phiên làm việc hợp lệ.
        </Paragraph>
        <Button type='primary' href='/install/login'>
          Đăng nhập
        </Button>
      </div>
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
    <div className='p-6'>
      <Space direction='vertical' size='large' className='w-full'>
        <div className='text-center'>
          <Title level={2} className='text-blue-600! mb-2!'>
            🌐 Hiển thị FAQ trên website
          </Title>
          <Paragraph className='text-gray-600'>
            Cài snippet F1GENZ FAQ vào theme đang xuất bản rồi chèn một dòng include
            vào template bạn muốn hiển thị.
          </Paragraph>
        </div>

        <Card className='shadow-md' title='Trạng thái snippet'>
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

        <Card className='shadow-md' title='Chèn vào template'>
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
          <Alert
            className='mt-4'
            type='info'
            showIcon
            message='Snippet hiển thị dạng <details> không cần JavaScript và tự sinh JSON-LD FAQPage cho các câu hỏi có bật Schema Markup.'
          />
        </Card>
      </Space>
    </div>
  );
};

export default Storefront;
