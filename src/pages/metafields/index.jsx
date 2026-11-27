import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  Empty,
  Flex,
  Input,
  Popconfirm,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  BulbOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  OrderedListOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  deleteFaq,
  useCreateFaq,
  useDeleteFaq,
  useFaqs,
  useReorderFaqs,
} from '../../common/MetafieldsServices';
import { toResultError } from '../../common/apiResult';
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
import {
  BULK_ACTIONS,
  describeBulkResult,
  faqCategories,
  faqPreviewText,
  filterFaqEntries,
  hasActiveFilters,
  listErrorCopy,
  planBulkAction,
} from '../../lib/faqList';
import { faqEntryToCsvRow, serializeCsv } from '../../lib/csv';
import {
  isBulkLocked,
  releaseBulkLock,
  tryAcquireBulkLock,
  useBulkLocked,
} from '../../lib/bulkLock';
import { hasPendingFaq } from '../../lib/pendingFaqs';
import PageHeader from '../../components/page-header';
import LoginRequired from '../../components/login-required';
import ResourceSearch from '../../components/resource-search';
import ModalMetafields from './modal';
import SortableFaqList from './sortable-list';
import CsvImportModal from './csv-import';
import AiSuggestModal from './ai-suggest';

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

const EMPTY_BULK = {
  action: null,
  processed: 0,
  total: 0,
  failures: [],
  result: null,
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

  const { data: entries = [], isLoading, error, refetch, isFetching } = useFaqs({
    type: resourceType,
    objectid,
  });
  const createFaqMutation = useCreateFaq();
  const deleteFaqMutation = useDeleteFaq();
  const reorderFaqMutation = useReorderFaqs();
  const canWrite = useCanWrite();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [orderEntries, setOrderEntries] = useState(null);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulk, setBulk] = useState(EMPTY_BULK);
  // One module-level lock for the whole bulk run (it survives a remount of this page);
  // every write entry point is disabled from it and re-checks it when it fires.
  const busy = useBulkLocked();
  const latestEntriesRef = useRef(entries);
  const aiButtonRef = useRef(null);

  const targetKey = `${resourceType}:${objectid}`;

  useEffect(() => {
    latestEntriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    setOrderEntries(null);
    setEditing(null);
    setIsModalOpen(false);
    setIsCsvOpen(false);
    setIsAiOpen(false);
    setQuery('');
    setCategory('');
    setSelectedIds([]);
    setBulk(EMPTY_BULK);
  }, [targetKey]);

  const categories = useMemo(() => faqCategories(entries), [entries]);
  const filteredEntries = useMemo(
    () => filterFaqEntries(entries, { query, category }),
    [entries, query, category]
  );
  const groups = useMemo(() => groupFaqs(filteredEntries), [filteredEntries]);
  const filtersActive = hasActiveFilters({ query, category });
  const selectableRows = useMemo(
    () => filteredEntries.filter((entry) => entry.pending !== true),
    [filteredEntries]
  );
  const selectedSet = useMemo(
    () => new Set(selectedIds.map((id) => String(id))),
    [selectedIds]
  );
  const allSelected =
    selectableRows.length > 0 &&
    selectableRows.every((entry) => selectedSet.has(String(entry.id)));

  // A row hidden by a filter must not stay in the selection the bulk bar acts on.
  useEffect(() => {
    setSelectedIds((current) => {
      if (current.length === 0) return current;
      const selectable = new Set(selectableRows.map((entry) => String(entry.id)));
      const next = current.filter((id) => selectable.has(String(id)));
      return next.length === current.length ? current : next;
    });
  }, [selectableRows]);

  const nextPosition = useMemo(() => nextFaqPosition(entries), [entries]);
  const hasPending = hasPendingFaq(entries);
  const targetName = resourceType === 'shop' ? '' : resourceTitle || `#${objectid}`;
  const listErrorResult = error ? toResultError(error) : null;
  const listError = listErrorResult
    ? listErrorCopy({
        hasEntries: entries.length > 0,
        status: listErrorResult.status,
        message: listErrorResult.errorMessage,
      })
    : null;

  const openCreate = () => {
    if (isBulkLocked()) return;
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (entry) => {
    if (isBulkLocked()) return;
    setEditing(entry);
    setIsModalOpen(true);
  };

  const handleDuplicate = (entry) => {
    if (isBulkLocked()) return;
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
    if (!orderEntries || isBulkLocked()) return;
    reorderFaqMutation.mutate(
      {
        type: resourceType,
        objectid: objectid || '0',
        order: orderEntries.map((entry) => entry.id),
      },
      { onSuccess: () => setOrderEntries(null) }
    );
  };

  const openSortMode = () => {
    if (isBulkLocked()) return;
    setSelectedIds([]);
    setBulk(EMPTY_BULK);
    setOrderEntries(entries);
  };

  const toggleRow = (id, checked) => {
    const key = String(id);
    setSelectedIds((current) =>
      checked ? [...current.filter((item) => item !== key), key] : current.filter((item) => item !== key)
    );
  };

  const toggleAllFiltered = (checked) => {
    setSelectedIds(checked ? selectableRows.map((entry) => String(entry.id)) : []);
  };

  const runBulk = async (action) => {
    if (!canWrite || isBulkLocked()) return;
    const plan = planBulkAction(action, entries, selectedIds);
    if (plan.runnable.length === 0) {
      setBulk({
        ...EMPTY_BULK,
        action,
        result: describeBulkResult({ action, skipped: plan.skipped.length }),
      });
      return;
    }

    const failures = [];
    const succeeded = [];
    let processed = 0;
    let skipped = plan.skipped.length;
    let stopped = false;

    if (!tryAcquireBulkLock()) return;
    setBulk({ ...EMPTY_BULK, action, total: plan.runnable.length });

    try {
      for (const entry of plan.runnable) {
        // Re-read the row before writing: an edit or a reorder may have landed since the plan was built.
        const latest = latestEntriesRef.current.find(
          (item) => String(item.id) === String(entry.id)
        );
        if (!latest || latest.pending === true) {
          skipped += 1;
        } else {
          try {
            await deleteFaq({
              type: resourceType,
              objectid: objectid || '0',
              metafieldid: latest.id,
            });
            succeeded.push(String(latest.id));
          } catch (bulkError) {
            const result = toResultError(bulkError);
            failures.push({
              question: latest.parsedValue?.question || `#${latest.id}`,
              message: result.errorMessage || 'Không xử lý được câu hỏi.',
            });
            if (result.status === 402) {
              queryClient.invalidateQueries({ queryKey: ['trial'] });
              stopped = true;
            }
          }
        }

        processed += 1;
        setBulk((current) => ({
          ...current,
          processed,
          failures: [...failures],
        }));
        if (stopped) break;
      }
    } finally {
      releaseBulkLock();

      if (action === BULK_ACTIONS.delete && succeeded.length > 0) {
        const removed = new Set(succeeded);
        setSelectedIds((current) => current.filter((id) => !removed.has(String(id))));
      }

      setBulk({
        action,
        processed,
        total: plan.runnable.length,
        failures,
        result: describeBulkResult({
          action,
          succeeded: succeeded.length,
          failures,
          skipped,
          stopped,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    }
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
        <Card>
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

  const bulkPercent =
    bulk.total > 0 ? Math.round((bulk.processed / bulk.total) * 100) : 0;

  return (
    <>
      {header}
      <Card>
        <Flex justify='space-between' align='center' gap={12} wrap='wrap' style={{ marginBottom: 16 }}>
          <Flex align='center' gap={8} wrap='wrap' style={{ minWidth: 0 }}>
            <Text strong style={{ fontSize: 15 }}>
              {resourceType === 'shop' ? 'Danh sách câu hỏi' : targetName}
            </Text>
            <Tag color={entries.length > 0 ? 'blue' : 'default'} style={{ margin: 0 }}>
              {filtersActive
                ? `${filteredEntries.length}/${entries.length} câu hỏi`
                : `${entries.length} câu hỏi`}
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
                  disabled={!canWrite || busy}
                >
                  Lưu thứ tự
                </Button>
              </>
            ) : (
              <>
                <Button
                  icon={<OrderedListOutlined />}
                  onClick={openSortMode}
                  disabled={!canWrite || entries.length < 2 || hasPending || busy}
                >
                  Sắp xếp
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={entries.length === 0}>
                  Xuất CSV
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setIsCsvOpen(true)}
                  disabled={!canWrite || busy}
                >
                  Nhập CSV
                </Button>
                <Button
                  ref={aiButtonRef}
                  icon={<BulbOutlined />}
                  onClick={() => setIsAiOpen(true)}
                  disabled={busy}
                >
                  Gợi ý bằng AI
                </Button>
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={openCreate}
                  disabled={!canWrite || busy}
                >
                  Thêm câu hỏi mới
                </Button>
              </>
            )}
          </Space>
        </Flex>

        {hasPending ? (
          <Alert
            type='info'
            showIcon
            style={{ marginBottom: 12 }}
            message='Câu hỏi vừa tạo đang chờ Haravan đồng bộ (khoảng 1 phút). Chỉnh sửa, xóa và sắp xếp sẽ dùng được sau khi đồng bộ xong.'
          />
        ) : null}

        {error ? (
          <Alert
            type='error'
            showIcon
            style={{ marginBottom: 12 }}
            message={listError.title}
            description={listError.description}
            action={
              <Button size='small' loading={isFetching} onClick={() => refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : null}

        {!orderEntries && entries.length > 0 ? (
          <Flex align='center' gap={8} wrap='wrap' style={{ marginBottom: 12 }}>
            <Input
              allowClear
              prefix={<SearchOutlined style={{ color: '#64748b' }} />}
              placeholder='Tìm trong câu hỏi và câu trả lời'
              aria-label='Tìm câu hỏi'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ flex: '1 1 280px', maxWidth: 420 }}
            />
            <Select
              value={category}
              onChange={setCategory}
              aria-label='Lọc theo phân loại'
              style={{ minWidth: 200 }}
              options={[
                { value: '', label: 'Tất cả phân loại' },
                ...categories.map((item) => ({ value: item, label: item })),
              ]}
            />
            {filtersActive ? (
              <Button
                type='link'
                onClick={() => {
                  setQuery('');
                  setCategory('');
                }}
              >
                Xóa bộ lọc
              </Button>
            ) : null}
            <Checkbox
              checked={allSelected}
              indeterminate={selectedIds.length > 0 && !allSelected}
              disabled={!canWrite || selectableRows.length === 0 || busy}
              onChange={(event) => toggleAllFiltered(event.target.checked)}
              style={{ marginInlineStart: 'auto' }}
            >
              Chọn tất cả ({selectableRows.length})
            </Checkbox>
          </Flex>
        ) : null}

        {!orderEntries && selectedIds.length > 0 ? (
          <Flex
            className='f1g-faq-bulk-bar'
            justify='space-between'
            align='center'
            gap={8}
            wrap='wrap'
            style={{ marginBottom: 12 }}
          >
            <Text strong>Đã chọn {selectedIds.length} câu hỏi</Text>
            <Space wrap>
              <Button size='small' onClick={() => setSelectedIds([])} disabled={busy}>
                Bỏ chọn
              </Button>
              <Popconfirm
                title={`Xóa ${selectedIds.length} câu hỏi?`}
                description={`${selectedIds.length} câu hỏi đã chọn sẽ bị xóa khỏi Haravan. Thao tác này không hoàn tác được.`}
                okText='Xóa'
                cancelText='Không'
                okButtonProps={{ danger: true }}
                disabled={!canWrite || busy}
                onConfirm={() => runBulk(BULK_ACTIONS.delete)}
              >
                <Button size='small' danger disabled={!canWrite || busy}>
                  Xóa ({selectedIds.length})
                </Button>
              </Popconfirm>
            </Space>
          </Flex>
        ) : null}

        {busy || bulk.failures.length > 0 || bulk.result ? (
          <Flex vertical gap={8} style={{ marginBottom: 12 }}>
            {busy ? (
              <div>
                <Progress percent={bulkPercent} size='small' status='active' />
                <Text type='secondary' style={{ fontSize: 12 }}>
                  Đang xử lý {bulk.processed}/{bulk.total} câu…
                </Text>
              </div>
            ) : null}
            {bulk.failures.length > 0 ? (
              <Alert
                type='error'
                showIcon
                message={`${bulk.failures.length} câu không xử lý được`}
                description={
                  <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc', display: 'grid', gap: 4 }}>
                    {bulk.failures.map((failure, index) => (
                      <li key={`bulk-failure-${index}`}>
                        {failure.question}: {failure.message}
                      </li>
                    ))}
                  </ul>
                }
              />
            ) : null}
            {!busy && bulk.result ? (
              <Alert
                type={bulk.result.type}
                showIcon
                closable
                message={bulk.result.summary}
                onClose={() => setBulk(EMPTY_BULK)}
              />
            ) : null}
          </Flex>
        ) : null}

        {isLoading ? (
          <Flex justify='center' style={{ padding: '32px 0' }}>
            <Spin />
          </Flex>
        ) : null}

        {!isLoading && !error && entries.length === 0 ? (
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

        {!isLoading && !orderEntries && entries.length > 0 && groups.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='Không có câu hỏi khớp'
          >
            <Button
              onClick={() => {
                setQuery('');
                setCategory('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Empty>
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
                    const itemCategory = value.categories || DEFAULT_CATEGORY;
                    const preview = faqPreviewText(item);
                    return (
                      <Flex
                        key={item.id}
                        align='flex-start'
                        justify='space-between'
                        gap={8}
                        wrap='wrap'
                        style={ITEM_STYLE}
                      >
                        <Flex align='flex-start' gap={8} style={{ flex: '1 1 280px', minWidth: 0 }}>
                          <Checkbox
                            checked={selectedSet.has(String(item.id))}
                            disabled={!canWrite || item.pending || busy}
                            onChange={(event) => toggleRow(item.id, event.target.checked)}
                            aria-label={`Chọn câu hỏi ${value.question ?? ''}`}
                          />
                          <div style={{ minWidth: 0 }}>
                            <Text strong style={{ display: 'block' }}>
                              {value.question}
                            </Text>
                            {preview ? (
                              <Text
                                type='secondary'
                                className='f1g-faq-answer-preview'
                                style={{ fontSize: 13, marginTop: 2 }}
                              >
                                {preview}
                              </Text>
                            ) : null}
                            <Text type='secondary' style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
                              {itemCategory}
                              {item.position ? ` · Vị trí ${item.position}` : ''}
                            </Text>
                          </div>
                        </Flex>
                        <Flex align='center' gap={4} wrap='wrap'>
                          {item.pending ? (
                            <Tag color='gold' style={{ marginInlineEnd: 4 }}>
                              Đang chờ đồng bộ
                            </Tag>
                          ) : null}
                          <Button
                            type='text'
                            icon={<CopyOutlined />}
                            onClick={() => handleDuplicate(item)}
                            disabled={!canWrite || busy}
                          >
                            Nhân bản
                          </Button>
                          <Button
                            type='text'
                            icon={<EditOutlined />}
                            onClick={() => openEdit(item)}
                            disabled={!canWrite || item.pending || busy}
                          >
                            Chỉnh sửa
                          </Button>
                          <Popconfirm
                            title='Xóa câu hỏi'
                            description='Bạn có chắc muốn xóa câu hỏi này không?'
                            onConfirm={() => {
                              if (isBulkLocked()) return;
                              deleteFaqMutation.mutate({ type: resourceType, objectid, metafieldid: item.id });
                            }}
                            okText='Có'
                            cancelText='Không'
                            disabled={!canWrite || item.pending || busy}
                          >
                            <Button
                              danger
                              type='text'
                              icon={<DeleteOutlined />}
                              disabled={!canWrite || item.pending || busy}
                            >
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

      <AiSuggestModal
        key={targetKey}
        open={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        type={resourceType}
        objectid={objectid || '0'}
        entries={entries}
        canWrite={canWrite}
        returnFocusRef={aiButtonRef}
      />
    </>
  );
};

export default Metafields;
