import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Button,
  Collapse,
  Flex,
  List,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  CopyOutlined,
  DownloadOutlined,
  OrderedListOutlined,
  PlusOutlined,
  SettingOutlined,
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
import ModalMetafields from './modal';
import SortableFaqList from './sortable-list';
import CsvImportModal from './csv-import';

const { Title, Paragraph, Text } = Typography;

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

  const headerTitle = useMemo(() => {
    if (resourceType === 'shop') return 'Câu hỏi & câu trả lời của shop';
    const target = resourceTitle || `#${objectid}`;
    return `Câu hỏi cho ${RESOURCE_TYPES[resourceType].label}: ${target}`;
  }, [resourceType, resourceTitle, objectid]);

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

  if (!hasTarget) {
    return (
      <div className='p-6 text-center'>
        <Title level={3} className='text-gray-500'>
          Chưa chọn {resourceConfig?.label}
        </Title>
        <Paragraph>
          Dùng thanh tìm kiếm phía trên để chọn {resourceConfig?.label} cần quản lý
          câu hỏi.
        </Paragraph>
      </div>
    );
  }

  return (
    <div className='space-y-2!'>
      <div className='sticky top-0 h-min-content bg-white p-4 shadow-md z-10'>
        <Flex justify='space-between' align='center' gap={16} wrap>
          <h2 className='text-lg text-red-600 font-semibold mb-0!'>
            ⁉ {headerTitle}
          </h2>
          <Space wrap>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={openCreate}
              disabled={!canWrite}
            >
              Thêm câu hỏi mới
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={entries.length === 0}
            >
              Xuất CSV
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setIsCsvOpen(true)}
              disabled={!canWrite}
            >
              Nhập CSV
            </Button>
            {orderEntries ? (
              <>
                <Button
                  type='primary'
                  loading={reorderFaqMutation.isPending}
                  onClick={handleSaveOrder}
                  disabled={!canWrite}
                >
                  Lưu thứ tự
                </Button>
                <Button onClick={() => setOrderEntries(null)}>Hủy</Button>
              </>
            ) : (
              <Button
                icon={<OrderedListOutlined />}
                onClick={() => setOrderEntries(entries)}
                disabled={!canWrite || entries.length < 2}
              >
                Sắp xếp
              </Button>
            )}
          </Space>
        </Flex>
        <div className='mt-2'>
          <Text className='text-gray-500'>
            {entries.length > 0
              ? `${entries.length} câu hỏi`
              : 'Chưa có câu hỏi nào'}
          </Text>
        </div>
      </div>

      <div className='p-4'>
        {isLoading && (
          <div className='text-center py-8'>
            <Spin />
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className='text-center py-8'>
            <Text className='text-gray-500'>
              Chưa có câu hỏi nào. Hãy thêm câu hỏi mới để bắt đầu!
            </Text>
          </div>
        )}

        {!isLoading && orderEntries && (
          <div className='space-y-3'>
            <Text type='secondary'>
              Kéo thả để đổi thứ tự hiển thị trên website, sau đó bấm "Lưu thứ tự".
            </Text>
            <SortableFaqList entries={orderEntries} onChange={setOrderEntries} />
          </div>
        )}

        {!isLoading && !orderEntries && groups.length > 0 && (
          <Collapse
            key={groups.map((group) => group.category).join('|')}
            defaultActiveKey={groups.map((group) => group.category)}
            ghost
            size='large'
            items={groups.map((group) => ({
              key: group.category,
              label: (
                <Flex justify='space-between' align='center'>
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    📁 {group.category}
                  </span>
                  <Tag color='blue'>{group.items.length} câu hỏi</Tag>
                </Flex>
              ),
              children: (
                <List
                  itemLayout='horizontal'
                  dataSource={group.items}
                  renderItem={(item) => {
                    const value = item.parsedValue ?? {};
                    const category = value.categories || DEFAULT_CATEGORY;
                    return (
                      <List.Item
                        className='bg-gray-50 border border-gray-200 shadow mb-4! px-4! py-2! rounded'
                        actions={[
                          value.schema ? (
                            <Tag color='green' key='schema'>
                              Schema Markup
                            </Tag>
                          ) : null,
                          <Button
                            key='duplicate'
                            type='text'
                            icon={<CopyOutlined />}
                            onClick={() => handleDuplicate(item)}
                            disabled={!canWrite}
                          >
                            Nhân bản
                          </Button>,
                          <Button
                            key='edit'
                            type='text'
                            icon={<SettingOutlined />}
                            onClick={() => openEdit(item)}
                            disabled={!canWrite}
                          >
                            Chỉnh sửa
                          </Button>,
                          <Popconfirm
                            key='delete'
                            title='Xóa câu hỏi'
                            description='Bạn có chắc muốn xóa câu hỏi này không?'
                            onConfirm={() =>
                              deleteFaqMutation.mutate({ type: resourceType, objectid, metafieldid: item.id })
                            }
                            okText='Có'
                            cancelText='Không'
                            disabled={!canWrite}
                          >
                            <Button danger disabled={!canWrite}>
                              Xóa
                            </Button>
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Typography.Title className='mb-0!' level={5}>
                              {value.question}
                            </Typography.Title>
                          }
                          description={
                            <span className='text-xs text-gray-500'>
                              {category}
                              {item.position ? ` · Vị trí ${item.position}` : ''}
                            </span>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              ),
            }))}
          />
        )}
      </div>

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
    </div>
  );
};

export default Metafields;
