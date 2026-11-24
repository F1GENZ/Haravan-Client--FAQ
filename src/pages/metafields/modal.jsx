import { useEffect, useMemo } from 'react';
import { AutoComplete, Button, Divider, Form, Input, Modal, Switch, Typography } from 'antd';
import TinyEditor from '../../components/editor';
import { useCreateFaq, useUpdateFaq } from '../../common/MetafieldsServices';
import { buildFaqPayload, createFaqKey, isCompliantFaqKey } from '../../lib/faq';

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
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const submitting = createFaqMutation.isPending || updateFaqMutation.isPending;
  const isEditing = Boolean(editing);

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
    form.setFieldsValue({
      schema: editing ? Boolean(editing.parsedValue?.schema) : true,
      categories: editing?.parsedValue?.categories ?? '',
      question: editing?.parsedValue?.question ?? '',
      answer: editing?.parsedValue?.answer ?? '',
    });
  }, [open, editing, form]);

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
      width={'75vw'}
      title={
        <Typography.Title className='text-center uppercase' level={4}>
          {isEditing ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        </Typography.Title>
      }
      open={open}
      onCancel={onClose}
      destroyOnHidden
      footer={[]}
    >
      <Divider />
      <Form
        form={form}
        layout='vertical'
        className='w-full'
        onFinish={handleSubmit}
      >
        <Form.Item
          name='schema'
          label={<b>Nội dung này sẽ được Google đọc dưới dạng Schema</b>}
          layout='horizontal'
          valuePropName='checked'
        >
          <Switch className='float-right' />
        </Form.Item>
        <Form.Item
          label='❓Câu hỏi'
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
          label='🔑 Phân loại câu hỏi'
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
        <Form.Item label='✅ Câu trả lời' name='answer'>
          <TinyEditor
            key={editing?.id ?? 'new'}
            initialValue={editing?.parsedValue?.answer ?? ''}
            onEditorChange={(content) => form.setFieldsValue({ answer: content })}
          />
        </Form.Item>
        <Form.Item className='text-right mb-0!'>
          <Button
            htmlType='submit'
            type='primary'
            loading={submitting}
            disabled={!canWrite}
          >
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalMetafields;
