import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Alert, Flex, Form, Input, Modal, Spin, Typography, message } from 'antd';
import { usePublishQuestion } from '../../common/QuestionServices';
import { hasAnswerText, ownerLabel, timeAgo } from '../../lib/questions';
import { editorHeightFor } from '../../lib/editor';
import { useCompactViewport } from '../../lib/useCompactViewport';

const { Text } = Typography;

// TinyMCE is only needed once the answer field renders, so the dialog shell stays light.
const TinyEditor = lazy(() => import('../../components/editor'));

const MIN_QUESTION_LENGTH = 3;

const AnswerModal = ({ open, question, onClose }) => {
  const [form] = Form.useForm();
  const [ready, setReady] = useState(false);
  const compact = useCompactViewport();
  const editorMode = compact ? 'compact' : 'wide';
  const publishMutation = usePublishQuestion();
  const editorHeight = editorHeightFor(
    typeof window === 'undefined' ? 0 : window.innerHeight,
    compact
  );
  const meta = useMemo(
    () =>
      question
        ? [
            ownerLabel(question),
            question.author ? `Khách: ${question.author}` : null,
            timeAgo(question.created_at),
          ]
            .filter(Boolean)
            .join(' · ')
        : '',
    [question]
  );

  useEffect(() => {
    if (!open || !question) return;
    setReady(false);
    form.setFieldsValue({ question: question.question ?? '', categories: '', answer: '' });
    setReady(true);
  }, [open, question, form]);

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (!hasAnswerText(values.answer)) {
      message.warning('Câu trả lời chưa có nội dung.');
      return;
    }
    try {
      await publishMutation.mutateAsync({
        id: question.id,
        question: String(values.question ?? '').trim(),
        answer: values.answer,
        categories: String(values.categories ?? '').trim(),
      });
      onClose();
    } catch {
      // usePublishQuestion already surfaces the server message; keep the draft open.
    }
  };

  return (
    <Modal
      title='Trả lời khách hàng'
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText='Đăng lên FAQ'
      cancelText='Hủy'
      confirmLoading={publishMutation.isPending}
      destroyOnHidden
      width={compact ? '94vw' : 720}
    >
      {question ? (
        <>
          <Flex vertical gap={4} style={{ marginBottom: 12 }}>
            <Text strong style={{ fontSize: 15 }}>
              {question.question}
            </Text>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {meta}
            </Text>
          </Flex>
          <Form form={form} layout='vertical' requiredMark='optional'>
            <Form.Item
              label='Câu hỏi hiển thị trên FAQ'
              name='question'
              rules={[
                {
                  validator: (_rule, value) =>
                    String(value ?? '').trim().length >= MIN_QUESTION_LENGTH
                      ? Promise.resolve()
                      : Promise.reject(new Error('Câu hỏi cần ít nhất 3 ký tự.')),
                },
              ]}
            >
              <Input.TextArea rows={3} maxLength={500} showCount />
            </Form.Item>
            <Form.Item label='Nhóm câu hỏi (không bắt buộc)' name='categories'>
              <Input placeholder='Ví dụ: Vận chuyển' maxLength={80} allowClear />
            </Form.Item>
            <Form.Item label='Câu trả lời' name='answer'>
              <Suspense
                fallback={
                  <Flex justify='center' align='center' style={{ height: editorHeight }}>
                    <Spin />
                  </Flex>
                }
              >
                {ready ? (
                  <TinyEditor
                    key={`${question.id}:${editorMode}`}
                    initialValue=''
                    height={editorHeight}
                    compact={compact}
                    onReady={(content) => form.setFieldsValue({ answer: content })}
                    onEditorChange={(content) => form.setFieldsValue({ answer: content })}
                  />
                ) : (
                  <Flex justify='center' align='center' style={{ height: editorHeight }}>
                    <Spin />
                  </Flex>
                )}
              </Suspense>
            </Form.Item>
          </Form>
        </>
      ) : (
        <Alert type='warning' showIcon message='Câu hỏi không còn ở danh sách chờ.' />
      )}
    </Modal>
  );
};

export default AnswerModal;
