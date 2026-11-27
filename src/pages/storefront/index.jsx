import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Descriptions,
  Empty,
  Flex,
  Grid,
  Input,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CloudUploadOutlined,
  CodeOutlined,
  CopyOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  useInsertTemplates,
  useInstallSnippet,
  useRemoveTemplates,
  useRestoreTemplate,
  useSnippetStatus,
  useThemeTemplates,
} from '../../common/ThemeService';
import { toResultError } from '../../common/apiResult';
import { useCanWrite } from '../../common/TrialService';
import {
  MAX_TEMPLATE_KEYS,
  MAX_TEMPLATE_TITLE_LENGTH,
  defaultSelectedKeys,
  describeInsertResults,
  describeRemoveResults,
  groupTemplates,
  isSelectableTemplate,
  resourceLabel,
  templateStatusMeta,
  validateTemplateTitle,
} from '../../lib/templateInsert';
import { hasCredentials } from '../../lib/session';
import { snippetStatusView, themeDisplayName } from '../../lib/storefrontStatus';
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

const TEMPLATE_ROW_STYLE = {
  background: '#fafafa',
  border: '1px solid #f0f0f0',
  borderRadius: 8,
  padding: '10px 12px',
};

const Storefront = () => {
  const { data, isLoading, isError, error } = useSnippetStatus();
  const installSnippet = useInstallSnippet();
  const templatesQuery = useThemeTemplates();
  const insertTemplates = useInsertTemplates();
  const removeTemplates = useRemoveTemplates();
  const restoreTemplate = useRestoreTemplate();
  const canWrite = useCanWrite();
  const screens = Grid.useBreakpoint();

  // null means untouched, so the base templates stay selected until the merchant chooses.
  const [selectedRowKeys, setSelectedRowKeys] = useState(null);
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      message.success('Đã sao chép.');
    } catch {
      message.warning('Không thể sao chép tự động, vui lòng chọn và sao chép thủ công.');
    }
  };

  const templates = Array.isArray(templatesQuery.data?.templates)
    ? templatesQuery.data.templates
    : [];
  const groups = groupTemplates(templates);
  const selectedKeys = selectedRowKeys ?? defaultSelectedKeys(templates);
  const selectedSet = new Set(selectedKeys);
  const titleCheck = validateTemplateTitle(title);
  const insertDisabled =
    !canWrite ||
    !titleCheck.ok ||
    selectedKeys.length === 0 ||
    insertTemplates.isPending;

  const applySelection = (nextKeys) => {
    if (nextKeys.length > MAX_TEMPLATE_KEYS) {
      message.warning(`Chỉ chèn được tối đa ${MAX_TEMPLATE_KEYS} template mỗi lần.`);
      return;
    }
    setSelectedRowKeys(nextKeys);
  };

  const handleInsert = () => {
    if (selectedKeys.length > MAX_TEMPLATE_KEYS) {
      message.warning(`Chỉ chèn được tối đa ${MAX_TEMPLATE_KEYS} template mỗi lần.`);
      return;
    }
    insertTemplates.mutate(
      { keys: selectedKeys, title: titleCheck.value || undefined },
      {
        onSuccess: (result) => {
          const described = describeInsertResults(result?.results);
          setSelectedRowKeys([]);
          setFeedback(described);
          message[described.type](described.summary);
        },
      }
    );
  };

  const handleRemove = (key) => {
    removeTemplates.mutate(
      { keys: [key] },
      {
        onSuccess: (result) => {
          const described = describeRemoveResults(result?.results);
          setSelectedRowKeys([]);
          setFeedback(described);
          message[described.type](described.summary);
        },
      }
    );
  };

  const handleRestore = (key) => {
    restoreTemplate.mutate(
      { key },
      {
        onSuccess: () => {
          message.success('Đã khôi phục bản gốc của template.');
        },
      }
    );
  };

  const toggleKey = (key, checked) => {
    const next = new Set(selectedKeys);
    if (checked) next.add(key);
    else next.delete(key);
    applySelection([...next]);
  };

  const renderStatus = (record) => {
    const meta = templateStatusMeta(record.status);
    const tag = <Tag color={meta.color || undefined}>{meta.label}</Tag>;
    if (record.status === 'unsupported') {
      return (
        <Tooltip title='Template không dùng layout, thường là AJAX/JSON'>
          {tag}
        </Tooltip>
      );
    }
    return tag;
  };

  const renderActions = (record) => {
    if (record.status !== 'inserted') return null;
    return (
      <Flex align='center' gap={4} wrap='wrap'>
        <Popconfirm
          title='Gỡ FAQ khỏi template'
          description='Chỉ xoá phần do ứng dụng chèn, các nội dung khác giữ nguyên.'
          okText='Gỡ'
          cancelText='Không'
          disabled={!canWrite}
          onConfirm={() => handleRemove(record.key)}
        >
          <Button size='small' type='text' danger disabled={!canWrite}>
            Gỡ
          </Button>
        </Popconfirm>
        {record.backup_at != null ? (
          <Popconfirm
            title='Khôi phục bản gốc'
            description='Chỉ khôi phục được khi template chưa bị sửa sau khi chèn.'
            okText='Khôi phục'
            cancelText='Không'
            disabled={!canWrite}
            onConfirm={() => handleRestore(record.key)}
          >
            <Button size='small' type='text' disabled={!canWrite}>
              Khôi phục bản gốc
            </Button>
          </Popconfirm>
        ) : null}
      </Flex>
    );
  };

  const columns = [
    {
      title: 'Template',
      dataIndex: 'name',
      render: (name) => (
        <Text code style={{ wordBreak: 'break-all' }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'resource',
      width: 110,
      render: (resource) => <Text type='secondary'>{resourceLabel(resource)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 160,
      render: (_, record) => renderStatus(record),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 220,
      render: (_, record) => renderActions(record),
    },
  ];

  const templateList = templatesQuery.isLoading ? (
    <Spin />
  ) : templatesQuery.isError ? (
    <Alert
      type='error'
      showIcon
      message='Không tải được danh sách template'
      description={toResultError(templatesQuery.error).errorMessage}
    />
  ) : templates.length === 0 ? (
    <Empty description='Chưa có template nào được hỗ trợ.' />
  ) : !screens.md ? (
    <Flex vertical gap={14}>
      {groups.map((group) => (
        <div key={group.resource}>
          <Text strong>{group.label}</Text>
          <Flex vertical gap={8} style={{ marginTop: 8 }}>
            {group.templates.map((record) => (
              <Flex
                key={record.key}
                align='flex-start'
                justify='space-between'
                gap={8}
                wrap='wrap'
                style={TEMPLATE_ROW_STYLE}
              >
                <Flex align='flex-start' gap={8} style={{ minWidth: 0, flex: '1 1 180px' }}>
                  {isSelectableTemplate(record) ? (
                    <Checkbox
                      checked={selectedSet.has(record.key)}
                      disabled={!canWrite}
                      onChange={(event) => toggleKey(record.key, event.target.checked)}
                    />
                  ) : null}
                  <div style={{ minWidth: 0 }}>
                    <Text code style={{ wordBreak: 'break-all' }}>
                      {record.name}
                    </Text>
                    <div style={{ marginTop: 4 }}>{renderStatus(record)}</div>
                  </div>
                </Flex>
                {renderActions(record)}
              </Flex>
            ))}
          </Flex>
        </div>
      ))}
    </Flex>
  ) : (
    <Table
      size='small'
      rowKey='key'
      dataSource={templates}
      columns={columns}
      pagination={false}
      rowSelection={{
        selectedRowKeys: selectedKeys,
        onChange: (keys) => applySelection(keys),
        getCheckboxProps: (record) => ({
          disabled: !canWrite || !isSelectableTemplate(record),
        }),
      }}
    />
  );

  const header = (
    <PageHeader
      title='Hiển thị trên website'
      subtitle='Cài snippet F1GENZ FAQ vào theme đang xuất bản, sau đó chèn tự động vào template hoặc dán thủ công dòng include.'
      crumbs={['Hiển thị trên website']}
    />
  );

  if (!hasCredentials()) {
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
  const snippetView = snippetStatusView({
    installed,
    version,
    latestVersion,
    themeName: data?.theme_name,
  });
  const autoInsertTheme = themeDisplayName(
    templatesQuery.data?.theme_name,
    data?.theme_name
  );

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
              <Flex align='center' gap={8} wrap='wrap'>
                {installed ? (
                  <Tag color='green'>Đã cài</Tag>
                ) : (
                  <Tag color='red'>Chưa cài</Tag>
                )}
                {snippetView.needsUpdate && (
                  <Tag color='orange'>Có bản cập nhật mới</Tag>
                )}
                <Text>{snippetView.sentence}</Text>
              </Flex>

              <Descriptions column={1} size='small'>
                <Descriptions.Item label='Theme đang xuất bản'>
                  {themeDisplayName(data?.theme_name) || 'Chưa xác định'}
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
                  type={snippetView.actionType}
                  icon={<CloudUploadOutlined />}
                  loading={installSnippet.isPending}
                  disabled={!canWrite}
                  onClick={() => installSnippet.mutate()}
                >
                  {snippetView.actionLabel}
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

        <Card
          title={cardTitle(
            <ThunderboltOutlined style={{ color: '#13c2c2' }} />,
            'Chèn tự động vào template'
          )}
        >
          <Flex vertical gap={16}>
            <Paragraph style={{ margin: 0 }}>
              Ứng dụng ghi khối FAQ vào cuối template bạn chọn trong theme đang xuất
              bản. Snippet cũng được cài hoặc cập nhật trước khi chèn nếu còn thiếu.
            </Paragraph>

            <Flex align='center' gap={8} wrap='wrap'>
              <Text strong>
                {autoInsertTheme || (templatesQuery.isLoading ? 'Đang tải tên theme…' : 'Chưa xác định tên theme')}
              </Text>
              {templatesQuery.data?.theme_id ? (
                <Text type='secondary'>ID {templatesQuery.data.theme_id}</Text>
              ) : null}
              {templatesQuery.data?.snippet ? (
                templatesQuery.data.snippet.installed ? (
                  <Tag color='green'>Snippet đã cài</Tag>
                ) : (
                  <Tag color='orange'>Snippet chưa cài, sẽ cài khi chèn</Tag>
                )
              ) : null}
            </Flex>

            <Flex vertical gap={4}>
              <Text strong>Tiêu đề hiển thị (tùy chọn)</Text>
              <Input
                value={title}
                maxLength={MAX_TEMPLATE_TITLE_LENGTH}
                placeholder='Ví dụ: Câu hỏi thường gặp'
                disabled={!canWrite}
                status={titleCheck.ok ? undefined : 'error'}
                allowClear
                onChange={(event) => setTitle(event.target.value)}
              />
              <Text
                type={titleCheck.ok ? 'secondary' : 'danger'}
                style={{ fontSize: 12 }}
              >
                {titleCheck.ok
                  ? 'Để trống nếu không muốn hiện tiêu đề phía trên danh sách FAQ.'
                  : titleCheck.error}
              </Text>
            </Flex>

            {templatesQuery.data?.incomplete ? (
              <Alert
                type='warning'
                showIcon
                message='Một số template chưa đọc được từ Haravan. Tải lại trang sau ít phút để xem đủ danh sách.'
              />
            ) : null}

            {templateList}

            {feedback ? (
              <Alert
                type={feedback.type}
                showIcon
                closable
                message={feedback.summary}
                onClose={() => setFeedback(null)}
                description={
                  feedback.details.length ? (
                    <ul style={{ margin: 0, paddingLeft: 18, listStyle: 'disc' }}>
                      {feedback.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  ) : null
                }
              />
            ) : null}

            <Flex align='center' gap={12} wrap='wrap'>
              <Popconfirm
                title='Chèn FAQ vào template đã chọn'
                description='Ứng dụng lưu bản sao lưu từng template trước khi ghi, bạn có thể Gỡ hoặc Khôi phục bất kỳ lúc nào. Storefront có thể mất khoảng 1 phút để cập nhật.'
                okText='Chèn'
                cancelText='Không'
                disabled={insertDisabled}
                onConfirm={handleInsert}
              >
                <Button
                  type='primary'
                  icon={<ThunderboltOutlined />}
                  loading={insertTemplates.isPending}
                  disabled={insertDisabled}
                >
                  Chèn vào template đã chọn
                </Button>
              </Popconfirm>
              <Text type='secondary'>Đã chọn {selectedKeys.length} template.</Text>
            </Flex>

            {!canWrite && (
              <Alert
                type='warning'
                showIcon
                message='Bạn cần kích hoạt ứng dụng để chèn, gỡ hoặc khôi phục template.'
              />
            )}
          </Flex>
        </Card>

        <Card
          title={cardTitle(
            <CodeOutlined style={{ color: '#722ed1' }} />,
            'Dán thủ công vào template'
          )}
        >
          <Paragraph>
            Cách dự phòng khi bạn không dùng chèn tự động: dán dòng phù hợp vào
            template muốn hiển thị FAQ (thường là{' '}
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
            message='Snippet hiển thị dạng <details> không cần JavaScript và tự sinh JSON-LD FAQPage cho mọi câu hỏi đang hiển thị.'
          />
        </Card>
      </Space>
    </>
  );
};

export default Storefront;
