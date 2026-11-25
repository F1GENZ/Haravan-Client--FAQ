import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button, Card, Collapse, Empty, Flex, Popconfirm, Space, Spin, Tag, Typography } from 'antd';
import {
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  OrderedListOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  useCreateFaq,
  useDeleteFaq,
  useFaqs,
  useReorderFaqs,
} from '../../common/MetafieldsServices';
import { useCanWrite } from '../../common/TrialService';
import { downloadTextFile } from '../../common/download';
import { hasSession } from '../../lib/session';
import { RESOURCE_TYPES, resourceTypeFromPath } from '../../lib/resources';
import {
  buildDuplicatePayload,
  DEFAULT_CATEGORY,
  groupFaqs,
  nextFaqPosition,
} from '../../lib/faq';
import { faqEntryToCsvRow, serializeCsv } from '../../lib/csv';
import PageHeader from '../../components/page-header';
import LoginRequired from '../../components/login-required';
import ResourceSearch from '../../components/resource-search';
import ModalMetafields from './modal';
import SortableFaqList from './sortable-list';
import CsvImportModal from './csv-import';

const { Text } = Typography;

const SCOPE_TITLES = {
  shop: 'Câu hỏi của shop',
  products: 'Câu hỏi theo sản phẩm',
  collections: 'Câu hỏi theo danh mục',
  pages: 'Câu hỏi theo trang',
};

const SCOPE_SUBTITLES = {
  shop: 'Bộ câu hỏi chung của cửa hàng. Snippet hiển thị bộ này ở template không thuộc sản phẩm, danh mục hay trang, hoặc khi chọn nguồn shop.',
  products: 'Tìm một sản phẩm để quản lý bộ câu hỏi riêng của sản phẩm đó.',
  collections: 'Tìm một danh mục để quản lý bộ câu hỏi riêng của danh mục đó.',
  pages: 'Tìm một trang nội dung để quản lý bộ câu hỏi riêng của trang đó.',
};

const ITEM_STYLE = {
  background: '#fafbfc',
  border: '1px solid #f0f0f0',
  borderRadius: 10,
  padding: '10px 16px',
};

const Metafields = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const resourceType = resourceTypeFromPath(location.pathname) ?? 'shop';
  const resourceConfig = RESOURCE_TYPES[resourceType] ?? null;
  const resourceTitle = searchParams.get('title') ?? '';
  const rawObjectid = searchParams.get('id') ?? '';
  const objectid = resourceType === 'shop' ? '0' : rawObjectid;
  const hasTarget =
    resourceType === 'shop' || (objectid !== '' && objectid !== '0');

  const { data: entries = [], isLoading } = useFaqs({
    type: resourceType,
    objectid,
  });
  const createFaqMutation = useCreateFaq();
  const deleteFaqMutation = useDeleteFaq();
  const reorderFaqMutation = useReorderFaqs();
  const canWrite = useCanWrite();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [orderEntries, setOrderEntries] = useState(null);
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  const targetKey = `${resourceType}:${objectid}`;

  useEffect(() => {
    setOrderEntries(null);
    setEditing(null);
    setIsModalOpen(false);
    setIsCsvOpen(false);
  }, [targetKey]);

  const groups = useMemo(() => groupFaqs(entries), [entries]);
  const nextPosition = useMemo(() => nextFaqPosition(entries), [entries]);
  const targetName = resourceType === 'shop' ? '' : resourceTitle || `#${objectid}`;

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setIsModalOpen(true);
  };

  const handleDuplicate = (entry) => {
    const payload = buildDuplicatePayload(
      { ...entry, type: resourceType, objectid },
      nextPosition
    );
    createFaqMutation.mutate(payload);
  };

  const handleExport = () => {
    if (entries.length === 0) return;
    const csv = serializeCsv(entries.map(faqEntryToCsvRow));
    downloadTextFile(
      `faq-${resourceType}-${objectid || '0'}.csv`,
      csv
    );
  };

  const handleSaveOrder = () => {
    if (!orderEntries) return;
    reorderFaqMutation.mutate(
      {
        type: resourceType,
        objectid: objectid || '0',
        order: orderEntries.map((entry) => entry.id),
      },
      { onSuccess: () => setOrderEntries(null) }
    );
  };

  const sessionReady = hasSession();
  const header = (
    <PageHeader
      title={SCOPE_TITLES[resourceType]}
      subtitle={SCOPE_SUBTITLES[resourceType]}
      crumbs={resourceType === 'shop' ? [] : [resourceConfig.title, ...(hasTarget ? [targetName] : [])]}
      extra={resourceType !== 'shop' && sessionReady ? <ResourceSearch type={resourceType} /> : null}
    />
  );

  if (!sessionReady) {
    return (
      <>
        {header}
        <LoginRequired />
      </>
    );
  }

  if (!hasTarget) {
    return (
      <>
        {header}
        <Card style={{ borderRadius: 12 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Flex vertical gap={4}>
                <Text strong>Chưa chọn {resourceConfig?.label}</Text>
                <Text type='secondary'>
                  Gõ ít nhất 2 ký tự vào ô tìm kiếm phía trên rồi chọn {resourceConfig?.label} cần quản lý câu hỏi.
                </Text>
              </Flex>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}
      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
        <Flex justify='space-between' align='center' gap={12} wrap='wrap' style={{ marginBottom: 16 }}>
          <Flex align='center' gap={8} wrap='wrap' style={{ minWidth: 0 }}>
            <Text strong style={{ fontSize: 15 }}>
              {resourceType === 'shop' ? 'Danh sách câu hỏi' : targetName}
            </Text>
            <Tag color={entries.length > 0 ? 'blue' : 'default'} style={{ margin: 0 }}>
              {entries.length} câu hỏi
            </Tag>
          </Flex>
          <Space wrap>
            {orderEntries ? (
              <>
                <Button onClick={() => setOrderEntries(null)}>Hủy</Button>
                <Button
                  type='primary'
                  loading={reorderFaqMutation.isPending}
                  onClick={handleSaveOrder}
                  disabled={!canWrite}
                >
                  Lưu thứ tự
                </Button>
              </>
            ) : (
              <>
                <Button
                  icon={<OrderedListOutlined />}
                  onClick={() => setOrderEntries(entries)}
                  disabled={!canWrite || entries.length < 2}
                >
                  Sắp xếp
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={entries.length === 0}>
                  Xuất CSV
                </Button>
                <Button icon={<UploadOutlined />} onClick={() => setIsCsvOpen(true)} disabled={!canWrite}>
                  Nhập CSV
                </Button>
                <Button type='primary' icon={<PlusOutlined />} onClick={openCreate} disabled={!canWrite}>
                  Thêm câu hỏi mới
                </Button>
              </>
            )}
          </Space>
        </Flex>

        {isLoading ? (
          <Flex justify='center' style={{ padding: '32px 0' }}>
            <Spin />
          </Flex>
        ) : null}

        {!isLoading && entries.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='Chưa có câu hỏi nào. Bấm "Thêm câu hỏi mới" hoặc "Nhập CSV" để bắt đầu.'
          />
        ) : null}

        {!isLoading && orderEntries ? (
          <Flex vertical gap={12}>
            <Text type='secondary'>
              Kéo biểu tượng ở đầu mỗi dòng để đổi thứ tự hiển thị trên website, sau đó bấm "Lưu thứ tự".
            </Text>
            <SortableFaqList entries={orderEntries} onChange={setOrderEntries} />
          </Flex>
        ) : null}

        {!isLoading && !orderEntries && groups.length > 0 ? (
          <Collapse
            key={groups.map((group) => group.category).join('|')}
            defaultActiveKey={groups.map((group) => group.category)}
            ghost
            items={groups.map((group) => ({
              key: group.category,
              label: (
                <Flex justify='space-between' align='center' gap={8}>
                  <Flex align='center' gap={8}>
                    <FolderOutlined style={{ color: '#1677ff' }} />
                    <Text strong>{group.category}</Text>
                  </Flex>
                  <Tag color='blue' style={{ margin: 0 }}>
                    {group.items.length} câu hỏi
                  </Tag>
                </Flex>
              ),
              children: (
                <Flex vertical gap={10}>
                  {group.items.map((item) => {
                    const value = item.parsedValue ?? {};
                    const category = value.categories || DEFAULT_CATEGORY;
                    return (
                      <Flex key={item.id} align='center' justify='space-between' gap={8} wrap='wrap' style={ITEM_STYLE}>
                        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                          <Text strong style={{ display: 'block' }}>
                            {value.question}
                          </Text>
                          <Text type='secondary' style={{ fontSize: 12 }}>
                            {category}
                            {item.position ? ` · Vị trí ${item.position}` : ''}
                          </Text>
                        </div>
                        <Flex align='center' gap={4} wrap='wrap'>
                          {value.schema ? (
                            <Tag color='green' style={{ marginInlineEnd: 4 }}>
                              Schema Markup
                            </Tag>
                          ) : null}
                          <Button
                            type='text'
                            icon={<CopyOutlined />}
                            onClick={() => handleDuplicate(item)}
                            disabled={!canWrite}
                          >
                            Nhân bản
                          </Button>
                          <Button
                            type='text'
                            icon={<EditOutlined />}
                            onClick={() => openEdit(item)}
                            disabled={!canWrite}
                          >
                            Chỉnh sửa
                          </Button>
                          <Popconfirm
                            title='Xóa câu hỏi'
                            description='Bạn có chắc muốn xóa câu hỏi này không?'
                            onConfirm={() =>
                              deleteFaqMutation.mutate({ type: resourceType, objectid, metafieldid: item.id })
                            }
                            okText='Có'
                            cancelText='Không'
                            disabled={!canWrite}
                          >
                            <Button danger type='text' icon={<DeleteOutlined />} disabled={!canWrite}>
                              Xóa
                            </Button>
                          </Popconfirm>
                        </Flex>
                      </Flex>
                    );
                  })}
                </Flex>
              ),
            }))}
          />
        ) : null}
      </Card>

      <ModalMetafields
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editing={editing}
        type={resourceType}
        objectid={objectid || '0'}
        nextPosition={nextPosition}
        entries={entries}
        canWrite={canWrite}
      />

      <CsvImportModal
        open={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        type={resourceType}
        objectid={objectid || '0'}
        entries={entries}
        canWrite={canWrite}
      />
    </>
  );
};

export default Metafields;
