import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AutoComplete,
  Button,
  Checkbox,
  Empty,
  Flex,
  Input,
  Modal,
  Progress,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { createFaq, registerCreatedFaq } from '../../common/MetafieldsServices';
import { useAiQuota, useAiSuggest } from '../../common/AiServices';
import { toResultError } from '../../common/apiResult';
import { nextFaqPosition } from '../../lib/faq';
import {
  selectedSuggestionDrafts,
  suggestionToPayload,
  toSuggestionDrafts,
  validateAnswer,
  validateQuestion,
} from '../../lib/aiSuggest';

const { Paragraph, Text } = Typography;

const ITEM_STYLE = {
  background: '#fafbfc',
  border: '1px solid #f0f0f0',
  borderRadius: 10,
  padding: '12px 14px',
};

const AiSuggestModal = ({ open, onClose, type, objectid, entries, canWrite, returnFocusRef }) => {
  const queryClient = useQueryClient();
  const suggestMutation = useAiSuggest();
  const { data: quota, isError: quotaError } = useAiQuota({ enabled: open });
  const primaryActionRef = useRef(null);

  const [drafts, setDrafts] = useState([]);
  const [runError, setRunError] = useState('');
  const [generateSource, setGenerateSource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [saveFailures, setSaveFailures] = useState([]);

  const generating = suggestMutation.isPending;

  const resetState = () => {
    setDrafts([]);
    setRunError('');
    setGenerateSource(null);
    setSavedCount(0);
    setProgress({ processed: 0, total: 0 });
    setSaveFailures([]);
  };

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => primaryActionRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open && !saving && !generating) resetState();
  }, [open, saving, generating]);

  const categorySuggestions = useMemo(() => {
    const categories = new Set();
    (entries ?? []).forEach((entry) => {
      const category = String(entry.parsedValue?.categories ?? '').trim();
      if (category) categories.add(category);
    });
    return [...categories].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [entries]);

  const draftErrors = useMemo(() => {
    const map = new Map();
    drafts.forEach((draft) => {
      map.set(draft.id, {
        question: validateQuestion(draft.question),
        answer: validateAnswer(draft.answer),
      });
    });
    return map;
  }, [drafts]);

  const selectedDrafts = useMemo(
    () => selectedSuggestionDrafts(drafts),
    [drafts]
  );
  const invalidSelected = useMemo(
    () =>
      selectedDrafts.filter((draft) => {
        const errors = draftErrors.get(draft.id);
        return Boolean(errors?.question || errors?.answer);
      }),
    [selectedDrafts, draftErrors]
  );

  const canSave =
    canWrite && !generating && !saving && selectedDrafts.length > 0 && invalidSelected.length === 0;

  const handleClose = () => {
    if (saving || generating) return;
    resetState();
    onClose();
  };

  const updateDraft = (id, patch) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );
  };

  const handleGenerate = async () => {
    if (generating || saving) return;
    setRunError('');
    setSavedCount(0);
    setSaveFailures([]);
    setProgress({ processed: 0, total: 0 });
    try {
      const data = await suggestMutation.mutateAsync({ type, objectid });
      setDrafts(toSuggestionDrafts(data?.suggestions));
      setGenerateSource(data?.source ?? null);
    } catch (error) {
      const result = toResultError(error);
      // A failed re-run keeps the previous suggestions so paid quota is not thrown away.
      setRunError(result.errorMessage || 'Không tạo được gợi ý, vui lòng thử lại.');
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    const basePosition = nextFaqPosition(entries);
    const items = selectedDrafts;
    const saved = new Set();
    const failures = [];

    setSaving(true);
    setSaveFailures([]);
    setSavedCount(0);
    setProgress({ processed: 0, total: items.length });

    let processed = 0;

    for (let index = 0; index < items.length; index += 1) {
      const draft = items[index];
      const payload = suggestionToPayload({
        type,
        objectid,
        draft,
        position: basePosition + index,
      });

      try {
        const metafield = await createFaq(payload);
        registerCreatedFaq(queryClient, payload, metafield);
        saved.add(draft.id);
      } catch (error) {
        const result = toResultError(error);
        failures.push({
          question: draft.question,
          message: result.errorMessage || 'Không lưu được câu hỏi.',
        });
        if (result.status === 402) {
          queryClient.invalidateQueries({ queryKey: ['trial'] });
        }
        processed += 1;
        setProgress({ processed, total: items.length });
        if (result.status === 402) break;
        continue;
      }

      processed += 1;
      setProgress({ processed, total: items.length });
    }

    setDrafts((current) => current.filter((draft) => !saved.has(draft.id)));
    setSaveFailures(failures);
    setSavedCount(saved.size);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['faqs'] });

    if (saved.size > 0) {
      message.success(`Đã thêm ${saved.size} câu hỏi.`);
    }
  };

  const percent =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  const quotaLimit = quota?.limit;
  const quotaHint = quotaLimit
    ? `Mỗi lần tạo gợi ý dùng 1/${quotaLimit} lượt trong ngày.`
    : 'Mỗi lần tạo gợi ý dùng 1 lượt trong ngày.';

  return (
    <Modal
      open={open}
      width={960}
      title='Gợi ý câu hỏi bằng AI'
      onCancel={handleClose}
      afterClose={() => returnFocusRef?.current?.focus?.()}
      focusTriggerAfterClose={false}
      centered
      styles={{ body: { maxHeight: 'calc(100dvh - 240px)', overflowY: 'auto' } }}
      destroyOnHidden
      footer={
        <Flex justify='space-between' align='center' gap={8} wrap='wrap'>
          <Text type='secondary' style={{ fontSize: 12 }}>
            {quotaHint}
          </Text>
          <Flex gap={8} wrap='wrap'>
            <Button onClick={handleClose} disabled={saving || generating}>
              Đóng
            </Button>
            {drafts.length > 0 ? (
              <>
                <Button
                  icon={<BulbOutlined />}
                  loading={generating}
                  disabled={saving}
                  onClick={handleGenerate}
                >
                  Tạo lại gợi ý
                </Button>
                <Button
                  ref={primaryActionRef}
                  type='primary'
                  loading={saving}
                  disabled={!canSave}
                  onClick={handleSave}
                >
                  Thêm {selectedDrafts.length} câu đã chọn
                </Button>
              </>
            ) : (
              <Button
                ref={primaryActionRef}
                type='primary'
                icon={<BulbOutlined />}
                loading={generating}
                disabled={saving}
                onClick={handleGenerate}
              >
                Tạo gợi ý
              </Button>
            )}
          </Flex>
        </Flex>
      }
    >
      <Flex vertical gap={12}>
        <Flex align='center' justify='space-between' gap={8} wrap='wrap'>
          <Tag color={quota && quota.remaining <= 0 ? 'default' : 'blue'} style={{ margin: 0 }}>
            {quota
              ? `Còn ${quota.remaining}/${quota.limit} lượt hôm nay`
              : quotaError
                ? 'Chưa tải được số lượt còn lại'
                : 'Đang tải lượt gợi ý…'}
          </Tag>
          {generateSource?.title ? (
            <Text type='secondary' style={{ fontSize: 12 }}>
              Nguồn: {generateSource.title}
            </Text>
          ) : null}
        </Flex>

        <Alert
          type='info'
          showIcon
          message='Gợi ý do AI tạo từ nội dung của bạn. Kiểm tra lại trước khi lưu.'
        />

        {!canWrite && (
          <Alert
            type='warning'
            showIcon
            message='Bạn cần kích hoạt ứng dụng để lưu câu hỏi.'
            description='Vẫn tạo được gợi ý, nhưng chỉ lưu được khi ứng dụng đã kích hoạt.'
          />
        )}

        {runError && <Alert type='error' showIcon message={runError} />}

        {generating && (
          <Flex align='center' justify='center' gap={12} style={{ padding: '32px 0' }}>
            <Spin />
            <Text type='secondary'>AI đang đọc nội dung, khoảng 15 giây…</Text>
          </Flex>
        )}

        {!generating && drafts.length === 0 && !runError && savedCount === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='Chưa có gợi ý. Bấm "Tạo gợi ý" để AI đọc nội dung và đề xuất câu hỏi.'
          />
        )}

        {savedCount > 0 && (
          <Alert
            type='success'
            showIcon
            message={`Đã thêm ${savedCount} câu hỏi vào danh sách.`}
          />
        )}

        {progress.total > 0 && (
          <div>
            <Progress percent={percent} status={saving ? 'active' : undefined} />
            <Text type='secondary'>
              Đã xử lý {progress.processed}/{progress.total} câu.
            </Text>
          </div>
        )}

        {saveFailures.length > 0 && (
          <Alert
            type='error'
            showIcon
            message={`Không lưu được ${saveFailures.length} câu hỏi.`}
            description={
              <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc', display: 'grid', gap: 4 }}>
                {saveFailures.map((failure, index) => (
                  <li key={`failed-${index}`}>
                    {failure.question}: {failure.message}
                  </li>
                ))}
              </ul>
            }
          />
        )}

        {drafts.length > 0 && (
          <Flex vertical gap={10}>
            <Paragraph type='secondary' style={{ margin: 0, fontSize: 12 }}>
              Câu hỏi đã chọn cần từ 5 đến 100 ký tự và câu trả lời không được để trống.
            </Paragraph>
            {drafts.map((draft) => {
              const errors = draftErrors.get(draft.id) ?? {};
              return (
                <Flex key={draft.id} vertical gap={8} style={ITEM_STYLE}>
                  <Flex align='flex-start' gap={8} wrap='wrap'>
                    <Checkbox
                      checked={draft.selected}
                      disabled={saving}
                      onChange={(event) =>
                        updateDraft(draft.id, { selected: event.target.checked })
                      }
                    />
                    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                      <Input
                        value={draft.question}
                        maxLength={100}
                        showCount
                        status={errors.question ? 'error' : undefined}
                        disabled={saving}
                        onChange={(event) =>
                          updateDraft(draft.id, { question: event.target.value })
                        }
                      />
                      {errors.question ? (
                        <Text type='danger' style={{ fontSize: 12 }}>
                          {errors.question}
                        </Text>
                      ) : null}
                    </div>
                  </Flex>
                  <AutoComplete
                    value={draft.category}
                    options={categorySuggestions.map((category) => ({
                      value: category,
                      label: category,
                    }))}
                    filterOption={(inputValue, option) =>
                      option.value.toLowerCase().includes(inputValue.toLowerCase())
                    }
                    disabled={saving}
                    placeholder='Phân loại (để trống sẽ dùng "Không phân loại")'
                    style={{ width: '100%' }}
                    onChange={(value) => updateDraft(draft.id, { category: value })}
                  />
                  <Input.TextArea
                    value={draft.answer}
                    autoSize={{ minRows: 3, maxRows: 8 }}
                    status={errors.answer ? 'error' : undefined}
                    disabled={saving}
                    placeholder='Câu trả lời'
                    onChange={(event) =>
                      updateDraft(draft.id, { answer: event.target.value })
                    }
                  />
                  {errors.answer ? (
                    <Text type='danger' style={{ fontSize: 12 }}>
                      {errors.answer}
                    </Text>
                  ) : null}
                </Flex>
              );
            })}
          </Flex>
        )}
      </Flex>
    </Modal>
  );
};

export default AiSuggestModal;
