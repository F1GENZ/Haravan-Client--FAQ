import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  Popconfirm,
  Segmented,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  EyeOutlined,
  MinusCircleOutlined,
  QuestionOutlined,
} from '@ant-design/icons';
import { useDismissQuestion, useQuestions } from '../../common/QuestionServices';
import { useCanWrite } from '../../common/TrialService';
import { hasCredentials } from '../../lib/session';
import { TRIAL_EXPIRED_MESSAGE } from '../../lib/messages';
import { ownerFaqPath, ownerLabel, timeAgo } from '../../lib/questions';
import PageHeader from '../../components/page-header';
import LoginRequired from '../../components/login-required';
import AnswerModal from './answer-modal';

const { Text, Link } = Typography;

const TABS = [
  { value: 'pending', label: 'Chờ trả lời' },
  { value: 'answered', label: 'Đã đăng FAQ' },
  { value: 'dismissed', label: 'Đã bỏ qua' },
];

const ITEM_STYLE = {
  background: '#fafbfc',
  border: '1px solid #f0f0f0',
  borderRadius: 10,
  padding: '12px 16px',
};

const STATE_TAG = {
  answered: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã đăng FAQ' },
  dismissed: { color: 'default', icon: <MinusCircleOutlined />, text: 'Đã bỏ qua' },
};

const QuestionsPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState('pending');
  const [answering, setAnswering] = useState(null);
  const canWrite = useCanWrite();
  const { data, isLoading, error } = useQuestions(state);
  const dismissMutation = useDismissQuestion();

  if (!hasCredentials()) return <LoginRequired />;

  const questions = data?.questions ?? [];
  const pending = data?.pending ?? 0;

  const renderActions = (question) => {
    if (question.state !== 'pending') {
      const faqPath = ownerFaqPath(question);
      return (
        <Flex gap={8} wrap='wrap'>
          {faqPath ? (
            <Button size='small' icon={<EyeOutlined />} onClick={() => navigate(faqPath)}>
              Mở FAQ của trang này
            </Button>
          ) : null}
          {question.page_url ? (
            <Link href={question.page_url} target='_blank' rel='noopener noreferrer'>
              Xem trang gốc
            </Link>
          ) : null}
        </Flex>
      );
    }
    return (
      <Flex gap={8} wrap='wrap'>
        <Button
          size='small'
          type='primary'
          icon={<QuestionOutlined />}
          disabled={!canWrite}
          onClick={() => setAnswering(question)}
        >
          Trả lời
        </Button>
        <Popconfirm
          title='Bỏ qua câu hỏi này?'
          description='Câu hỏi sẽ chuyển sang mục “Đã bỏ qua” và không hiển thị trên website.'
          okText='Bỏ qua'
          cancelText='Hủy'
          onConfirm={() => dismissMutation.mutate(question.id)}
        >
          <Button size='small' disabled={!canWrite || dismissMutation.isPending}>
            Bỏ qua
          </Button>
        </Popconfirm>
      </Flex>
    );
  };

  return (
    <div>
      <PageHeader
        title='Câu hỏi từ khách'
        subtitle='Khách đặt câu hỏi ngay trên website. Trả lời một câu hỏi sẽ đăng nó lên FAQ của trang tương ứng.'
        crumbs={['Câu hỏi từ khách']}
      />

      {!canWrite ? (
        <Alert type='warning' showIcon message={TRIAL_EXPIRED_MESSAGE} style={{ marginBottom: 16 }} />
      ) : null}

      <Card styles={{ body: { padding: 20 } }}>
        <Flex justify='space-between' align='center' wrap='wrap' gap={12} style={{ marginBottom: 16 }}>
          <Segmented
            options={TABS.map((tab) =>
              tab.value === 'pending'
                ? { ...tab, label: <span>Chờ trả lời {pending > 0 ? <Badge count={pending} size='small' offset={[4, -2]} /> : null}</span> }
                : tab
            )}
            value={state}
            onChange={(value) => setState(value)}
          />
        </Flex>

        {isLoading ? (
          <Flex justify='center' style={{ padding: 48 }}>
            <Spin />
          </Flex>
        ) : error ? (
          <Alert
            type='error'
            showIcon
            message='Không tải được danh sách câu hỏi.'
            description={error?.response?.data?.errorMessage ?? 'Vui lòng thử lại.'}
          />
        ) : questions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              state === 'pending'
                ? 'Chưa có câu hỏi nào chờ trả lời.'
                : state === 'answered'
                  ? 'Chưa có câu hỏi nào được đăng lên FAQ.'
                  : 'Chưa có câu hỏi nào bị bỏ qua.'
            }
          />
        ) : (
          <Flex vertical gap={10}>
            {questions.map((question) => {
              const tag = STATE_TAG[question.state];
              return (
                <div key={question.id} style={ITEM_STYLE}>
                  <Flex justify='space-between' align='flex-start' gap={12} wrap='wrap'>
                    <div style={{ minWidth: 0, flex: '1 1 320px' }}>
                      <Text strong style={{ fontSize: 14 }}>
                        {question.question}
                      </Text>
                      <Flex gap={8} wrap='wrap' style={{ marginTop: 6 }}>
                        <Tag style={{ marginInlineEnd: 0 }}>{ownerLabel(question)}</Tag>
                        {tag ? (
                          <Tag icon={tag.icon} color={tag.color} style={{ marginInlineEnd: 0 }}>
                            {tag.text}
                          </Tag>
                        ) : null}
                        <Text type='secondary' style={{ fontSize: 12 }}>
                          {timeAgo(question.created_at)}
                        </Text>
                        {question.author ? (
                          <Text type='secondary' style={{ fontSize: 12 }}>
                            Khách: {question.author}
                          </Text>
                        ) : null}
                      </Flex>
                    </div>
                    {renderActions(question)}
                  </Flex>
                </div>
              );
            })}
          </Flex>
        )}
      </Card>

      <AnswerModal open={Boolean(answering)} question={answering} onClose={() => setAnswering(null)} />
    </div>
  );
};

export default QuestionsPage;
