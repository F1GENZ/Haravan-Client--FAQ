import { useState, useMemo } from 'react';
import { useSearchParams } from "react-router";
import { useLocation } from "react-router-dom";
import { Popconfirm, Button, Tag, List, Flex, Spin, Typography, Collapse } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { metafieldsService } from '../../common/MetafieldsServices';
import ModalMetafields from './modal';

const { Title, Paragraph, Text } = Typography;


const Metafields = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const type = location.pathname.replace('/', '') || "shop";
  const objectid = searchParams.get("id") || "0";

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataForModal, setDataForModal] = useState(null);

  const orgid = sessionStorage.getItem("orgid");
  const hasOrgid = orgid && orgid !== 'null' && orgid !== 'undefined' && orgid.trim() !== '';
  
  const { isLoading: field_loading, data: field_data, error } = metafieldsService.useGetMetafields({ type, namespace: 'store.faqs.data', objectid });
  const deleteMetafieldMutation = metafieldsService.useDeleteField();

  // Group FAQs by category - MUST be called before any early returns (Rules of Hooks)
  const groupedFAQs = useMemo(() => {
    if (!field_data || field_data.length === 0) return {};
    
    const grouped = {};
    
    field_data.forEach((item) => {
      try {
        const value = item.value ? JSON.parse(item.value) : {};
        const category = value.categories?.trim() || 'Không phân loại';
        
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push({ ...item, parsedValue: value });
      } catch (e) {
        console.error('Error parsing FAQ:', e);
        const category = 'Không phân loại';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push({ ...item, parsedValue: {} });
      }
    });
    
    // Sort categories alphabetically
    const sortedCategories = Object.keys(grouped).sort();
    const sortedGrouped = {};
    sortedCategories.forEach(cat => {
      sortedGrouped[cat] = grouped[cat];
    });
    
    return sortedGrouped;
  }, [field_data]);

  const categories = Object.keys(groupedFAQs);
  const displayData = field_data || [];

  // Early returns AFTER all hooks
  if (field_loading || isLoading) return <Spin fullscreen />;

  // Show message if no orgid instead of error
  if (!hasOrgid) {
    return (
      <div className='p-6 text-center'>
        <Title level={3} className='text-gray-500'>
          Vui lòng đăng nhập để sử dụng tính năng này
        </Title>
        <Paragraph>
          Bạn cần đăng nhập với tài khoản Haravan để quản lý FAQ.
        </Paragraph>
      </div>
    );
  }

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
        {displayData.length === 0 && !field_loading && (
          <div className='text-center py-8'>
            <Text className='text-gray-500'>
              Chưa có câu hỏi nào. Hãy thêm câu hỏi mới để bắt đầu!
            </Text>
          </div>
        )}
        
        {categories.length > 0 && (
          <Collapse 
            defaultActiveKey={categories.length > 0 ? categories : undefined}
            ghost
            size="large"
            items={categories.map((category) => ({
              key: category,
              label: (
                <Flex justify='space-between' align='center'>
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    📁 {category}
                  </span>
                  <Tag color="blue">{groupedFAQs[category].length} câu hỏi</Tag>
                </Flex>
              ),
              children: (
                <List
                  itemLayout="horizontal"
                  dataSource={groupedFAQs[category]}
                  renderItem={(item) => {
                    const value = item.parsedValue || {};
                    const metafieldid = item.id;
                    return (
                      <List.Item 
                        className='bg-gray-50 border border-gray-200 shadow mb-4! px-4! py-2! rounded'
                        actions={[
                          value?.schema ? <Tag color="green">Schema Markup</Tag> : null,
                          <Button 
                            type="text" 
                            icon={<SettingOutlined />} 
                            size="medium"
                            onClick={() => {
                              setDataForModal({ ...value, objectid, metafieldid, type, field_data });
                              setIsModalOpen(true);
                            }}
                          >
                            Chỉnh sửa
                          </Button>,
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
              ),
            }))}
          />
        )}
      </div>
    </div>
  );
};

export default Metafields;
