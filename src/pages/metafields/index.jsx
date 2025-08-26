import { useState } from 'react';
import { useSearchParams } from "react-router";
import { useLocation } from "react-router-dom";
import { Popconfirm, Button, Tag, List, Flex, Spin, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { metafieldsService } from '../../common/MetafieldsServices';
import ModalMetafields from './modal';


const Metafields = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const type = location.pathname.replace('/', '') || "shop";
  const objectid = searchParams.get("id") || "0";

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataForModal, setDataForModal] = useState(null);

  const { isLoading: field_loading, data: field_data } = metafieldsService.useGetMetafields({ type, namespace: 'store.faqs.data', objectid });
  const deleteMetafieldMutation = metafieldsService.useDeleteField();

  if (field_loading || isLoading) return <Spin fullscreen />;
  return (
    <div className='space-y-2!'>
      <div className='sticky top-0 h-min-content bg-white p-4 shadow-md z-10'>
        <Flex justify='space-between' align='center' gap={16}>
          <h2 className='text-lg text-red-600 font-semibold mb-0!'>⁉ Danh sách các câu hỏi & câu trả lời</h2>
          <Button type='primary' onClick={() => {
            setDataForModal({ type, objectid, field_data });
            setIsModalOpen(true);
          }}>
            Thêm câu hỏi mới
          </Button>
        </Flex>
        <ModalMetafields isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} isLoading={isLoading} setIsLoading={setIsLoading} fields={dataForModal} />
      </div>
      <div className='p-4'>
        <List
          itemLayout="horizontal"
          dataSource={field_data}
          renderItem={(item, index) => {
            const value = item.value ? JSON.parse(item.value) : {};
            const metafieldid = item.id;
            return (
              <List.Item className='bg-gray-50 border border-gray-200 shadow mb-4! px-4! py-2! rounded'
                actions={[
                  value?.schema ? <Tag color="green">Schema Markup</Tag> : null,
                  <Button type="text" icon={<SettingOutlined />} size="medium"
                    onClick={() => {
                      setDataForModal({ ...value, objectid, metafieldid, type });
                      setIsModalOpen(true); // Open modal when settings button is clicked
                    }}
                  >Chỉnh sửa</Button>,
                  <Popconfirm
                    title="Xóa câu hỏi"
                    description="Bạn có chắc muốn xóa câu hỏi này không?"
                    onConfirm={async () => await deleteMetafieldMutation.mutateAsync({ ...value, objectid, metafieldid, type })}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button danger>Xóa</Button>
                  </Popconfirm>
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
