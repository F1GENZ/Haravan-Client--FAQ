import { useEffect, useState } from 'react';
import { Alert, Button, Flex, Modal, Progress, Typography, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { createFaq, registerCreatedFaq } from '../../common/MetafieldsServices';
import { toResultError } from '../../common/apiResult';
import { parseFaqCsv } from '../../lib/csv';
import { buildFaqPayload, createFaqKey, nextFaqPosition } from '../../lib/faq';

const { Paragraph, Text } = Typography;

const CsvImportModal = ({ open, onClose, type, objectid, entries, canWrite }) => {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [failures, setFailures] = useState([]);
  const [finished, setFinished] = useState(false);

  const resetState = () => {
    setRows([]);
    setFileName('');
    setParseError('');
    setProgress({ processed: 0, total: 0 });
    setFailures([]);
    setFinished(false);
  };

  useEffect(() => {
    if (!open && !running) resetState();
  }, [open, running]);

  const handleClose = () => {
    if (running) return;
    resetState();
    onClose();
  };

  const handleFile = async (file) => {
    resetState();
    setFileName(file.name);
    try {
      const text = await file.text();
      setRows(parseFaqCsv(text));
    } catch (error) {
      setParseError(error.message);
    }
    return false;
  };

  const validRows = rows.filter((row) => row.value);
  const invalidRows = rows.filter((row) => row.error);

  const handleImport = async () => {
    if (!canWrite || running || validRows.length === 0) return;

    const basePosition = nextFaqPosition(entries);
    const collectedFailures = invalidRows.map((row) => ({
      line: row.line,
      message: row.error,
    }));

    setRunning(true);
    setFinished(false);
    setFailures([]);
    setProgress({ processed: 0, total: validRows.length });

    let processed = 0;
    let created = 0;

    for (let index = 0; index < validRows.length; index += 1) {
      const row = validRows[index];
      const payload = buildFaqPayload({
        type,
        objectid,
        key: createFaqKey(),
        ...row.value,
        position: row.value.position ?? basePosition + index,
      });

      try {
        const metafield = await createFaq(payload);
        registerCreatedFaq(queryClient, payload, metafield);
        created += 1;
      } catch (error) {
        const result = toResultError(error);
        collectedFailures.push({
          line: row.line,
          message: result.errorMessage || 'Không tạo được câu hỏi.',
        });
        if (result.status === 402) {
          queryClient.invalidateQueries({ queryKey: ['trial'] });
        }
        processed += 1;
        setProgress({ processed, total: validRows.length });
        if (result.status === 402) break;
        continue;
      }

      processed += 1;
      setProgress({ processed, total: validRows.length });
    }

    setFailures(collectedFailures);
    setRunning(false);
    setFinished(true);
    queryClient.invalidateQueries({ queryKey: ['faqs'] });

    if (created > 0) {
      message.success(`Đã nhập ${created} câu hỏi.`);
    }
  };

  const percent =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  return (
    <Modal
      open={open}
      title='Nhập câu hỏi từ CSV'
      onCancel={handleClose}
      centered
      styles={{ body: { maxHeight: 'calc(100dvh - 240px)', overflowY: 'auto' } }}
      destroyOnHidden
      footer={[
        <Button key='close' onClick={handleClose} disabled={running}>
          Đóng
        </Button>,
        <Button
          key='import'
          type='primary'
          loading={running}
          disabled={!canWrite || validRows.length === 0 || running}
          onClick={handleImport}
        >
          Bắt đầu nhập
        </Button>,
      ]}
    >
      <Flex vertical gap={12}>
        <Alert
          type='info'
          showIcon
          message='Định dạng file'
          description={
            <Paragraph className='mb-0!'>
              File UTF-8, dòng đầu là tiêu đề:{' '}
              <Text code>question,answer,categories,position</Text>. Cột{' '}
              <Text code>position</Text> có thể để trống để hệ thống tự nối vào cuối danh sách.
            </Paragraph>
          }
        />

        {!canWrite && (
          <Alert type='warning' showIcon message='Bạn cần kích hoạt ứng dụng để nhập câu hỏi.' />
        )}

        <Upload.Dragger
          accept='.csv,text/csv'
          maxCount={1}
          showUploadList={false}
          beforeUpload={handleFile}
          disabled={running}
        >
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>Chọn hoặc kéo thả file CSV vào đây</p>
          {fileName && <p className='ant-upload-hint'>Đã chọn: {fileName}</p>}
        </Upload.Dragger>

        {parseError && <Alert type='error' showIcon message={parseError} />}

        {rows.length > 0 && !parseError && (
          <Alert
            type={invalidRows.length > 0 ? 'warning' : 'success'}
            showIcon
            message={`${validRows.length} dòng hợp lệ, ${invalidRows.length} dòng lỗi.`}
            description={
              invalidRows.length > 0 ? (
                <ul className='list-disc list-inside space-y-1 mb-0'>
                  {invalidRows.map((row) => (
                    <li key={`invalid-${row.line}`}>
                      Dòng {row.line}: {row.error}
                    </li>
                  ))}
                </ul>
              ) : null
            }
          />
        )}

        {progress.total > 0 && (
          <div>
            <Progress percent={percent} status={running ? 'active' : undefined} />
            <Text type='secondary'>
              Đã xử lý {progress.processed}/{progress.total} dòng.
            </Text>
          </div>
        )}

        {finished && failures.length > 0 && (
          <Alert
            type='error'
            showIcon
            message='Một số dòng không nhập được'
            description={
              <ul className='list-disc list-inside space-y-1 mb-0'>
                {failures.map((failure) => (
                  <li key={`${failure.line}-${failure.message}`}>
                    Dòng {failure.line}: {failure.message}
                  </li>
                ))}
              </ul>
            }
          />
        )}
      </Flex>
    </Modal>
  );
};

export default CsvImportModal;
