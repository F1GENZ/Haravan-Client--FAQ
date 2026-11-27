import { Card, Flex, Typography } from 'antd';
import {
  AppstoreOutlined,
  CheckCircleFilled,
  CloudUploadOutlined,
  EditOutlined,
  FileExcelOutlined,
  OrderedListOutlined,
  RocketOutlined,
  SearchOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/page-header';

const { Paragraph, Text } = Typography;

const FEATURES = [
  {
    icon: <AppstoreOutlined style={{ color: '#1677ff', fontSize: 18 }} />,
    title: 'Bốn phạm vi câu hỏi',
    text: 'Mỗi shop, sản phẩm, danh mục và trang nội dung có bộ câu hỏi riêng; snippet tự chọn đúng bộ theo template đang hiển thị.',
  },
  {
    icon: <EditOutlined style={{ color: '#13c2c2', fontSize: 18 }} />,
    title: 'Trình soạn thảo đầy đủ',
    text: 'Soạn câu trả lời với định dạng chữ, liên kết, danh sách và bảng; phân loại câu hỏi theo chủ đề có gợi ý sẵn.',
  },
  {
    icon: <StarOutlined style={{ color: '#faad14', fontSize: 18 }} />,
    title: 'Schema Markup cho dữ liệu có cấu trúc',
    text: 'Mọi câu hỏi hiển thị đều tự động đi vào JSON-LD FAQPage để công cụ tìm kiếm và trợ lý AI đọc cặp hỏi đáp dưới dạng dữ liệu có cấu trúc; ứng dụng không đảm bảo hiển thị đặc biệt nào trên kết quả tìm kiếm.',
  },
  {
    icon: <OrderedListOutlined style={{ color: '#722ed1', fontSize: 18 }} />,
    title: 'Sắp xếp bằng kéo thả',
    text: 'Đổi thứ tự hiển thị bằng kéo thả; website hiển thị đúng thứ tự đã lưu, kể cả sau khi xóa bớt câu hỏi.',
  },
  {
    icon: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
    title: 'Nhân bản, xuất và nhập CSV',
    text: 'Nhân bản một câu hỏi trong một cú bấm, xuất toàn bộ ra CSV rồi nhập sang sản phẩm hoặc danh mục khác.',
  },
  {
    icon: <CloudUploadOutlined style={{ color: '#eb2f96', fontSize: 18 }} />,
    title: 'Cài lên website một chạm',
    text: 'Ứng dụng tự ghi snippet vào theme đang xuất bản; FAQ hiển thị dạng mở rộng/thu gọn, không cần JavaScript.',
  },
  {
    icon: <SearchOutlined style={{ color: '#2f54eb', fontSize: 18 }} />,
    title: 'Tìm nhanh sản phẩm, danh mục, trang',
    text: 'Gõ vài ký tự để tìm và mở ngay trang quản lý câu hỏi của sản phẩm, danh mục hoặc trang cần sửa.',
  },
];

const BENEFITS = [
  'Giảm câu hỏi lặp lại gửi tới đội chăm sóc khách hàng.',
  'Khách hàng tự tìm được câu trả lời ngay trên trang sản phẩm.',
  'Câu hỏi và câu trả lời có dữ liệu có cấu trúc để công cụ tìm kiếm và trợ lý AI đọc đúng nội dung.',
  'Quản lý tập trung mọi FAQ của cửa hàng ở một nơi.',
];

const Introduction = () => (
  <>
    <PageHeader
      title='Giới thiệu F1GENZ FAQ'
      subtitle='Quản lý và hiển thị câu hỏi thường gặp cho cửa hàng Haravan.'
      crumbs={['Giới thiệu']}
    />

    <Flex vertical gap={16}>
      <Card>
        <Flex align='center' gap={8} style={{ marginBottom: 8 }}>
          <RocketOutlined style={{ color: '#1677ff', fontSize: 16 }} />
          <Text strong>Tổng quan</Text>
        </Flex>
        <Paragraph style={{ margin: 0 }}>
          <Text strong>F1GENZ FAQ</Text> giúp chủ cửa hàng Haravan soạn, sắp xếp và hiển thị câu hỏi thường gặp
          cho toàn shop hoặc cho từng sản phẩm, danh mục, trang nội dung. Dữ liệu lưu trong metafield của chính
          cửa hàng, nên website đọc trực tiếp mà không phụ thuộc máy chủ bên ngoài.
        </Paragraph>
      </Card>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {FEATURES.map((feature) => (
          <Card key={feature.title} size='small' styles={{ body: { padding: 16 } }}>
            <Flex gap={12} align='flex-start'>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#f6f8fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {feature.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  {feature.title}
                </Text>
                <Text type='secondary' style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {feature.text}
                </Text>
              </div>
            </Flex>
          </Card>
        ))}
      </div>

      <Card>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>
          Lợi ích
        </Text>
        <Flex vertical gap={8}>
          {BENEFITS.map((benefit) => (
            <Flex key={benefit} gap={8} align='flex-start'>
              <CheckCircleFilled style={{ color: '#52c41a', marginTop: 4 }} />
              <Text>{benefit}</Text>
            </Flex>
          ))}
        </Flex>
        <Paragraph type='secondary' style={{ margin: '16px 0 0' }}>
          Bắt đầu với <Link to='/guide'>Hướng dẫn</Link> hoặc gửi câu hỏi cho đội F1GENZ ở mục{' '}
          <Link to='/contact'>Liên hệ</Link>.
        </Paragraph>
      </Card>
    </Flex>
  </>
);

export default Introduction;
