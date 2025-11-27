import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Button, Input, Switch, Typography, Divider, Spin, AutoComplete } from 'antd';
import { metafieldsService } from '../../common/MetafieldsServices';
import TinyEditor from '../../components/editor';

const ModalMetafields = ({ isModalOpen, setIsModalOpen, isLoading, setIsLoading, fields }) => {
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  // Extract unique categories from field_data
  const categorySuggestions = useMemo(() => {
    if (!fields?.field_data || !Array.isArray(fields.field_data)) return [];
    
    const categoriesSet = new Set();
    fields.field_data.forEach((item) => {
      try {
        const value = item.value ? JSON.parse(item.value) : {};
        if (value.categories && value.categories.trim()) {
          categoriesSet.add(value.categories.trim());
        }
      } catch (e) {
        console.error('Error parsing metafield value:', e);
      }
    });
    
    return Array.from(categoriesSet).sort();
  }, [fields?.field_data]);

  useEffect(() => {
    let content = fields?.answer || "";
    setEditorContent(content);
    form.setFieldsValue({
      metafieldid: fields?.metafieldid || "0",
      objectid: fields?.objectid || "0",
      type: fields?.type || "shop",
      schema: fields?.schema === undefined ? true : !!fields.schema,
      key: fields?.key || `store.faqs.data.${fields?.field_data ? fields?.field_data.length + 1 : new Date().getTime()}`,
      categories: fields?.categories || "",
      question: fields?.question || "",
      answer: fields?.answer,
    });
    setIsDirty(false);
  }, [fields, form]);

  const createFieldMutation = metafieldsService.useCreateField();
  const updateFieldMutation = metafieldsService.useUpdateField();

  const onFormSubmit = () => {
    setIsLoading(true);
    form.validateFields()
      .then(async (values) => {
        if (values.metafieldid == 0) {
          await createFieldMutation.mutateAsync(values);
        } else {
          await updateFieldMutation.mutateAsync(values);
        }
        setIsModalOpen(false);
      })
      .catch((errorInfo) => {
        console.error('Validation Failed:', errorInfo);
      });
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      width={'75vw'}
      title={<Typography.Title className='text-center uppercase' level={4}>{fields ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</Typography.Title>}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[]}
    >
      <Divider />
      <Form form={form}
            layout="vertical" className="w-full"
            onFinish={onFormSubmit}>
        <Form.Item hidden name="objectid" layout="horizontal">
          <Input />
        </Form.Item>
        <Form.Item hidden name="metafieldid" layout="horizontal">
          <Input />
        </Form.Item>
        <Form.Item hidden name="key" layout="horizontal">
          <Input />
        </Form.Item>
        <Form.Item hidden name="type" layout="horizontal">
          <Input />
        </Form.Item>
        <Form.Item name="schema" label={<b>Nội dung này sẽ được Google đọc dưới dạng Schema</b>} layout="horizontal" valuePropName="checked">
          <Switch className="float-right" />
        </Form.Item>
        <Form.Item label="❓Câu hỏi" name="question" rules={[
          { required: true, message: "Vui lòng nhập nội dung câu hỏi!" },
          { min: 5, message: "Câu hỏi không được ngắn hơn 5 ký tự!" },
          { max: 100, message: "Câu hỏi không được vượt quá 100 ký tự!" }
        ]}>
          <Input placeholder='Nhập câu hỏi...' required />
        </Form.Item>
        <Form.Item 
          label="🔑 Phân loại câu hỏi" 
          name="categories" 
          rules={[
            { required: true, message: "Vui lòng nhập phân loại câu hỏi!" },
            { min: 5, message: "Phân loại không được ngắn hơn 5 ký tự!" },
            { max: 100, message: "Phân loại không được vượt quá 100 ký tự!" }
          ]}
          extra={categorySuggestions.length > 0 ? `Gợi ý: ${categorySuggestions.length} phân loại đã có sẵn` : null}
        >
          <AutoComplete
            placeholder={categorySuggestions.length > 0 
              ? 'Nhập phân loại hoặc chọn từ danh sách gợi ý...' 
              : 'Nhập phân loại câu hỏi...'}
            options={categorySuggestions.map(cat => ({ value: cat, label: cat }))}
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().includes(inputValue.toLowerCase())
            }
            allowClear
            showSearch
            style={{ width: '100%' }}
            notFoundContent={categorySuggestions.length === 0 ? 'Chưa có phân loại nào' : 'Không tìm thấy'}
          />
        </Form.Item>
        <Form.Item label="✅ Câu trả lời" name="answer">
          <TinyEditor initialValue={editorContent}
            onEditorChange={(content) => {
              form.setFieldsValue({ answer: content });
              setIsDirty(true);
            }} />
        </Form.Item>
        <Form.Item className="text-right mb-0!">
          <Button htmlType="submit" type="primary" loading={isLoading}>
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalMetafields;
