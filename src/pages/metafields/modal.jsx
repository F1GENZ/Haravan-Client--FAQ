import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Input, Switch, Typography, Divider, Spin } from 'antd';
import { metafieldsService } from '../../common/MetafieldsServices';
import TinyEditor from '../../components/editor';

const ModalMetafields = ({ isModalOpen, setIsModalOpen, isLoading, setIsLoading, fields }) => {
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const [editorContent, setEditorContent] = useState("");

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
        <Form.Item label="🔑 Phân loại câu hỏi" name="categories" rules={[
          { required: true, message: "Vui lòng nhập phân loại câu hỏi!" },
          { min: 5, message: "Phân loại không được ngắn hơn 5 ký tự!" },
          { max: 100, message: "Phân loại không được vượt quá 100 ký tự!" }
        ]}>
          <Input placeholder='Nhập phân loại câu hỏi...' />
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
