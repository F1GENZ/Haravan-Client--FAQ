import { useState } from 'react';
import { Button, List, Flex, Skeleton, Spin, Typography } from 'antd';
import { SettingOutlined, EyeOutlined } from '@ant-design/icons';
import { metafieldsService } from '../../common/MetafieldsServices';
import ModalMetafields from './modal';


const Metafields = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataForModal, setDataForModal] = useState(null);

  const { isLoading: field_loading, data: field_data } = metafieldsService.useGetMetafields({ type: 'shop', namespace: 'store.faqs.data' });
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  if (field_loading) return <Spin fullscreen />;
  return (
    <div className='space-y-2!'>
      <div className='sticky top-0 h-min-content bg-white p-4 shadow-md z-10'>
        <Flex justify='space-between' align='center' gap={16}>
          <h2 className='text-lg text-red-600 font-semibold mb-0!'>⁉ Danh sách các câu hỏi & câu trả lời</h2>
          <Button type='primary' onClick={() => setIsModalOpen(true)}>
            Thêm câu hỏi mới
          </Button>
        </Flex>
        <ModalMetafields isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} dataForModal={dataForModal} />
      </div>
      <div className='p-4'>
        <List
          itemLayout="horizontal"
          dataSource={field_data}
          renderItem={(item, index) => {
            const value = item.value ? JSON.parse(item.value) : {};
            return (
              <List.Item className='bg-gray-50 border border-gray-200 shadow mb-4! px-4! py-2! rounded'
                actions={[
                  <Button type="text" icon={<EyeOutlined />} size="medium"
                    onClick={(e) => {
                      setDataForModal(value);
                      setIsModalOpen(true); // Open modal when settings button is clicked
                    }}
                  >Xem</Button>,
                  <Button type="text" danger icon={<SettingOutlined />} size="medium"
                    onClick={(e) => {
                      setDataForModal(value);
                      setIsModalOpen(true); // Open modal when settings button is clicked
                    }}
                  >Chỉnh sửa</Button>
                ]}
              >
                <Typography.Title className='mb-0!' level={5}>{value.question}</Typography.Title>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
};

export default Metafields;
