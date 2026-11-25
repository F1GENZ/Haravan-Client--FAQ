import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AutoComplete, Button, Flex, Form, Input, Modal, Spin, Switch } from 'antd';
import { useCreateFaq, useUpdateFaq } from '../../common/MetafieldsServices';
import {
  buildFaqPayload,
  createFaqKey,
  faqFormValues,
  isCompliantFaqKey,
  isFaqFormDirty,
} from '../../lib/faq';
import { editorHeightFor } from '../../lib/editor';
import { useCompactViewport } from '../../lib/useCompactViewport';

// TinyMCE is only needed once the answer field renders, so the dialog shell stays light.
const TinyEditor = lazy(() => import('../../components/editor'));

const SCHEMA_TOOLTIP =
  'Đưa câu hỏi này vào JSON-LD FAQPage để công cụ tìm kiếm và trợ lý AI đọc dưới dạng dữ liệu có cấu trúc.';

// Leaves room for the header, the fields above the answer and the footer button row.
const DESKTOP_BODY_MAX_HEIGHT = 'calc(100dvh - 240px)';

const ModalMetafields = ({
  open,
  onClose,
  editing,
  type,
  objectid,
  nextPosition,
  entries,
  canWrite,
}) => {
  const [form] = Form.useForm();
  const [dirty, setDirty] = useState(false);
  const initialValuesRef = useRef(null);
  if (initialValuesRef.current === null) initialValuesRef.current = faqFormValues(null);
  const compact = useCompactViewport();
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const submitting = createFaqMutation.isPending || updateFaqMutation.isPending;
  const isEditing = Boolean(editing);
  const editorHeight = editorHeightFor(
    typeof window === 'undefined' ? 0 : window.innerHeight,
    compact
  );

  const categorySuggestions = useMemo(() => {
    const categories = new Set();
    (entries ?? []).forEach((entry) => {
      const category = String(entry.parsedValue?.categories ?? '').trim();
      if (category) categories.add(category);
    });
    return [...categories].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [entries]);

  useEffect(() => {
    if (!open) return;
    const initial = faqFormValues(editing);
    initialValuesRef.current = initial;
    form.setFieldsValue(initial);
    setDirty(false);
  }, [open, editing, form]);

  const syncDirty = (values) => setDirty(isFaqFormDirty(initialValuesRef.current, values));

  const requestClose = () => {
    if (submitting) return;
    if (!dirty) {
      onClose();
      return;
    }
    Modal.confirm({
      title: 'Bỏ các thay đổi chưa lưu?',
      content: 'Câu hỏi, câu trả lời và phân loại vừa nhập sẽ không được lưu.',
      okText: 'Bỏ thay đổi',
      cancelText: 'Tiếp tục chỉnh sửa',
      okButtonProps: { danger: true },
      onOk: onClose,
    });
  };

  const handleSubmit = async (values) => {
    const payload = buildFaqPayload({
      type,
      objectid,
      metafieldid: isEditing ? editing.id : undefined,
      key:
        isEditing && isCompliantFaqKey(editing.key)
          ? editing.key
          : createFaqKey(),
      question: values.question,
      answer: values.answer ?? '',
      categories: values.categories,
      schema: values.schema,
      position: isEditing ? editing.position : nextPosition,
    });

    try {
      if (isEditing) {
        await updateFaqMutation.mutateAsync(payload);
      } else {
        await createFaqMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      // The mutation hook already showed the error message.
    }
  };

  return (
    <Modal
      width={compact ? '100vw' : 960}
      style={compact ? { top: 0, margin: 0, paddingBottom: 0, maxWidth: '100vw' } : undefined}
      styles={{
        content: compact
          ? {
              height: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
              padding: 0,
            }
          : undefined,
        header: compact ? { marginBottom: 0, padding: '12px 48px 8px 16px' } : undefined,
        body: compact
          ? { flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px' }
          : { maxHeight: DESKTOP_BODY_MAX_HEIGHT, overflowY: 'auto' },
        footer: compact
          ? { margin: 0, padding: '12px 16px', borderTop: '1px solid #edf1f7' }
          : undefined,
      }}
      centered={!compact}
      title={isEditing ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
      open={open}
      onCancel={requestClose}
      maskClosable={false}
      destroyOnHidden
      footer={
        <Flex justify='flex-end' gap={8}>
          <Button onClick={requestClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            type='primary'
            onClick={() => form.submit()}
            loading={submitting}
            disabled={!canWrite}
          >
            Lưu
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout='vertical'
        className='w-full'
        onFinish={handleSubmit}
        onValuesChange={(_, allValues) => syncDirty(allValues)}
      >
        <Form.Item
          label='Câu hỏi'
          name='question'
          rules={[
            { required: true, message: 'Vui lòng nhập nội dung câu hỏi!' },
            { min: 5, message: 'Câu hỏi không được ngắn hơn 5 ký tự!' },
            { max: 100, message: 'Câu hỏi không được vượt quá 100 ký tự!' },
          ]}
        >
          <Input placeholder='Nhập câu hỏi...' required />
        </Form.Item>
        <Form.Item
          label='Phân loại câu hỏi'
          name='categories'
          rules={[
            { required: true, message: 'Vui lòng nhập phân loại câu hỏi!' },
            { min: 5, message: 'Phân loại không được ngắn hơn 5 ký tự!' },
            { max: 100, message: 'Phân loại không được vượt quá 100 ký tự!' },
          ]}
          extra={
            categorySuggestions.length > 0
              ? `Gợi ý: ${categorySuggestions.length} phân loại đã có sẵn`
              : null
          }
        >
          <AutoComplete
            placeholder={
              categorySuggestions.length > 0
                ? 'Nhập phân loại hoặc chọn từ danh sách gợi ý...'
                : 'Nhập phân loại câu hỏi...'
            }
            options={categorySuggestions.map((category) => ({
              value: category,
              label: category,
            }))}
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().includes(inputValue.toLowerCase())
            }
            allowClear
            showSearch
            style={{ width: '100%' }}
            notFoundContent={
              categorySuggestions.length === 0
                ? 'Chưa có phân loại nào'
                : 'Không tìm thấy'
            }
          />
        </Form.Item>
        <Form.Item label='Câu trả lời' name='answer'>
          <Suspense
            fallback={
              <Flex justify='center' align='center' style={{ height: editorHeight }}>
                <Spin />
              </Flex>
            }
          >
            <TinyEditor
              key={editing?.id ?? 'new'}
              initialValue={editing?.parsedValue?.answer ?? ''}
              height={editorHeight}
              compact={compact}
              onEditorChange={(content) => {
                form.setFieldsValue({ answer: content });
                syncDirty(form.getFieldsValue(true));
              }}
            />
          </Suspense>
        </Form.Item>
        <Form.Item
          label='Bật Schema FAQ cho Google'
          name='schema'
          valuePropName='checked'
          tooltip={SCHEMA_TOOLTIP}
          style={{ marginBottom: 0 }}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalMetafields;
