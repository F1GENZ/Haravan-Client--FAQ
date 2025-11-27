import { Typography, Card, Space, Divider } from 'antd';
import { InfoCircleOutlined, TeamOutlined, RocketOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Introduction = () => {
  return (
    <div className='p-6'>
      <Space direction="vertical" size="large" className='w-full'>
        <div className='text-center mb-6'>
          <Title level={1} className='text-red-600! mb-2!'>
            <InfoCircleOutlined className='mr-2' />
            Giới thiệu về F1GENZ FAQ
          </Title>
          <Paragraph className='text-lg text-gray-600'>
            Hệ thống quản lý Câu hỏi thường gặp (FAQ) chuyên nghiệp cho cửa hàng Haravan
          </Paragraph>
        </div>

        <Divider />

        <Card className='shadow-md'>
          <Title level={2} className='text-blue-600! mb-4!'>
            <RocketOutlined className='mr-2' />
            Tổng quan
          </Title>
          <Paragraph className='text-base leading-relaxed'>
            <strong>F1GENZ FAQ</strong> là một ứng dụng mạnh mẽ được thiết kế đặc biệt để giúp các chủ cửa hàng trên nền tảng Haravan 
            quản lý và hiển thị các câu hỏi thường gặp một cách hiệu quả. Với giao diện thân thiện và dễ sử dụng, bạn có thể dễ dàng 
            tạo, chỉnh sửa và quản lý các FAQ cho cửa hàng của mình.
          </Paragraph>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-green-600! mb-4!'>
            <CheckCircleOutlined className='mr-2' />
            Tính năng chính
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <div>
              <Title level={4} className='mb-2!'>📝 Quản lý FAQ dễ dàng</Title>
              <Paragraph>
                Tạo, chỉnh sửa và xóa các câu hỏi thường gặp một cách nhanh chóng và thuận tiện. 
                Giao diện trực quan giúp bạn quản lý nội dung một cách hiệu quả.
              </Paragraph>
            </div>
            <div>
              <Title level={4} className='mb-2!'>🎨 Trình soạn thảo phong phú</Title>
              <Paragraph>
                Sử dụng trình soạn thảo TinyMCE với đầy đủ các công cụ định dạng văn bản, 
                giúp bạn tạo ra những câu trả lời đẹp mắt và chuyên nghiệp.
              </Paragraph>
            </div>
            <div>
              <Title level={4} className='mb-2!'>🔍 Schema Markup hỗ trợ SEO</Title>
              <Paragraph>
                Tích hợp Schema Markup tự động để tối ưu hóa SEO, giúp các câu hỏi của bạn 
                xuất hiện trong kết quả tìm kiếm của Google một cách nổi bật.
              </Paragraph>
            </div>
            <div>
              <Title level={4} className='mb-2!'>🔍 Tìm kiếm sản phẩm thông minh</Title>
              <Paragraph>
                Thanh tìm kiếm thông minh giúp bạn nhanh chóng tìm và quản lý FAQ cho từng sản phẩm cụ thể. 
                Chỉ cần nhập tên sản phẩm, hệ thống sẽ tự động gợi ý và điều hướng đến trang quản lý FAQ của sản phẩm đó.
              </Paragraph>
            </div>
            <div>
              <Title level={4} className='mb-2!'>📁 Phân loại câu hỏi theo chủ đề</Title>
              <Paragraph>
                Tổ chức các câu hỏi theo từng phân loại (category) để dễ dàng quản lý và tìm kiếm. 
                Hệ thống tự động gợi ý các phân loại đã có sẵn để tránh nhập trùng lặp.
              </Paragraph>
            </div>
            <div>
              <Title level={4} className='mb-2!'>🔗 Tích hợp Haravan</Title>
              <Paragraph>
                Kết nối trực tiếp với cửa hàng Haravan của bạn, đồng bộ dữ liệu tự động và 
                quản lý FAQ cho từng sản phẩm, collection hoặc shop một cách dễ dàng.
              </Paragraph>
            </div>
            <div>
              <Title level={4} className='mb-2!'>📱 Giao diện responsive</Title>
              <Paragraph>
                Thiết kế đáp ứng mọi thiết bị, từ máy tính để bàn đến điện thoại di động, 
                đảm bảo trải nghiệm tốt nhất cho người dùng.
              </Paragraph>
            </div>
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-purple-600! mb-4!'>
            <TeamOutlined className='mr-2' />
            Lợi ích khi sử dụng
          </Title>
          <Space direction="vertical" size="small" className='w-full'>
            <Paragraph className='mb-2!'>
              ✅ <strong>Tiết kiệm thời gian:</strong> Giảm thiểu số lượng câu hỏi lặp lại từ khách hàng
            </Paragraph>
            <Paragraph className='mb-2!'>
              ✅ <strong>Tăng trải nghiệm khách hàng:</strong> Khách hàng có thể tự tìm câu trả lời nhanh chóng
            </Paragraph>
            <Paragraph className='mb-2!'>
              ✅ <strong>Cải thiện SEO:</strong> Schema Markup giúp website của bạn xuất hiện nhiều hơn trên Google
            </Paragraph>
            <Paragraph className='mb-2!'>
              ✅ <strong>Quản lý tập trung:</strong> Tất cả FAQ được quản lý tại một nơi duy nhất
            </Paragraph>
            <Paragraph className='mb-2!'>
              ✅ <strong>Dễ dàng cập nhật:</strong> Chỉnh sửa và cập nhật nội dung FAQ bất cứ lúc nào
            </Paragraph>
            <Paragraph className='mb-2!'>
              ✅ <strong>Tổ chức theo sản phẩm:</strong> Quản lý FAQ riêng biệt cho từng sản phẩm, giúp khách hàng tìm thông tin chính xác hơn
            </Paragraph>
            <Paragraph className='mb-2!'>
              ✅ <strong>Tìm kiếm nhanh chóng:</strong> Tìm kiếm sản phẩm và điều hướng đến trang FAQ chỉ trong vài giây
            </Paragraph>
          </Space>
        </Card>

        <Card className='shadow-md bg-gradient-to-r from-blue-50 to-purple-50'>
          <Title level={3} className='text-center mb-4!'>
            🚀 Bắt đầu ngay hôm nay!
          </Title>
          <Paragraph className='text-center text-base'>
            Hãy khám phá các tính năng của F1GENZ FAQ và tạo ra những FAQ chuyên nghiệp cho cửa hàng của bạn. 
            Nếu bạn cần hỗ trợ, vui lòng xem phần <strong>Hướng dẫn sử dụng</strong> hoặc liên hệ với đội ngũ của chúng tôi.
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
};

export default Introduction;

