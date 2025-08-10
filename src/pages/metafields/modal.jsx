import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, Divider } from 'antd';
import { metafieldsService } from '../../common/MetafieldsServices';
import TinyEditor from '../../components/editor';

const ModalMetafields = ({ isModalOpen, setIsModalOpen }) => {
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    console.log(fields)
    let content = fields?.value ? JSON.parse(fields?.value)?.content : "";
    setEditorContent(content);
    form.setFieldsValue({
      type: fields?.type || "shop",
      key: fields?.key || "",
      active: fields?.value ? JSON.parse(fields?.value)?.active : false,
      question: fields?.question || "",
      answer: fields?.answer,
    });
    setIsDirty(false);
  }, [fields, form]);

  const createFieldMutation = metafieldsService.useCreateField();
  const updateFieldMutation = metafieldsService.useUpdateField();
  
  const handleOk = () => {
    setIsLoading(true);
    form.validateFields()
      .then(async (values) => {
        await createFieldMutation.mutateAsync(JSON.stringify(values));
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
      title={<Typography.Title className='text-center uppercase' level={4}>Thêm câu hỏi mới</Typography.Title>}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Divider />
      <Form form={form} layout="vertical">
        <Form.Item hidden name="id" layout="horizontal">
          <Input />
        </Form.Item>
        <Form.Item hidden name="type" layout="horizontal">
          <Input />
        </Form.Item>
        <Form.Item label="❓Câu hỏi" name="question" rules={[
          { required: true, message: "Vui lòng nhập nội dung câu hỏi!" },
          { max: 100, message: "Tiêu đề không được vượt quá 100 ký tự!" }
        ]}>
          <Input placeholder='Nhập câu hỏi...' required />
        </Form.Item>
        <Form.Item label="🔑 Phân loại câu hỏi" name="key" rules={[
          { required: true, message: "Vui lòng nhập phân loại câu hỏi!" },
          { max: 100, message: "Tiêu đề không được vượt quá 100 ký tự!" }
        ]}>
          <Input placeholder='Nhập phân loại câu hỏi...' />
        </Form.Item>
        <Form.Item label="✅ Câu trả lời" name="answer">
          <TinyEditor initialValue="" onEditorChange={(content) => form.setFieldsValue({ answer: content })} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalMetafields;
