import { Typography, Card, Steps, Space, Divider, Alert } from 'antd';
import { BookOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Guide = () => {
  return (
    <div className='p-6'>
      <Space direction="vertical" size="large" className='w-full'>
        <div className='text-center mb-6'>
          <Title level={1} className='text-blue-600! mb-2!'>
            <BookOutlined className='mr-2' />
            Hướng dẫn sử dụng F1GENZ FAQ
          </Title>
          <Paragraph className='text-lg text-gray-600'>
            Hướng dẫn chi tiết từng bước để sử dụng hệ thống quản lý FAQ hiệu quả
          </Paragraph>
        </div>

        <Divider />

        <Alert
          message="Lưu ý quan trọng"
          description="Để sử dụng ứng dụng, bạn cần đã cài đặt và kết nối với cửa hàng Haravan của mình. Nếu chưa cài đặt, vui lòng liên hệ với đội ngũ hỗ trợ."
          type="info"
          showIcon
          className='mb-4'
        />

        <Card className='shadow-md'>
          <Title level={2} className='text-green-600! mb-4!'>
            Bước 1: Truy cập trang quản lý FAQ
          </Title>
          <Paragraph className='text-base leading-relaxed'>
            Sau khi đăng nhập vào hệ thống, bạn sẽ được chuyển đến trang tổng quan. 
            Tại đây bạn có thể xem danh sách tất cả các câu hỏi thường gặp đã được tạo.
          </Paragraph>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-blue-600! mb-4!'>
            <PlusOutlined className='mr-2' />
            Bước 2: Thêm câu hỏi mới
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <Paragraph className='text-base leading-relaxed'>
              Để thêm một câu hỏi mới, làm theo các bước sau:
            </Paragraph>
            <Steps
              direction="vertical"
              items={[
                {
                  title: 'Nhấn nút "Thêm câu hỏi mới"',
                  description: 'Nút này nằm ở góc trên bên phải của trang quản lý FAQ',
                  status: 'finish',
                },
                {
                  title: 'Điền thông tin câu hỏi',
                  description: 'Nhập câu hỏi vào trường "Câu hỏi". Đây là tiêu đề sẽ hiển thị trong danh sách FAQ',
                  status: 'finish',
                },
                {
                  title: 'Chọn phân loại câu hỏi',
                  description: 'Nhập phân loại (category) cho câu hỏi. Hệ thống sẽ gợi ý các phân loại đã có sẵn để bạn chọn, hoặc bạn có thể nhập phân loại mới',
                  status: 'finish',
                },
                {
                  title: 'Soạn thảo câu trả lời',
                  description: 'Sử dụng trình soạn thảo để viết câu trả lời chi tiết. Bạn có thể định dạng văn bản, thêm hình ảnh, liên kết, danh sách, v.v.',
                  status: 'finish',
                },
                {
                  title: 'Bật Schema Markup (Tùy chọn)',
                  description: 'Nếu muốn tối ưu SEO, hãy bật tùy chọn Schema Markup. Điều này giúp Google hiểu rõ hơn về nội dung FAQ của bạn',
                  status: 'finish',
                },
                {
                  title: 'Lưu câu hỏi',
                  description: 'Nhấn nút "Lưu" để hoàn tất việc tạo câu hỏi mới',
                  status: 'finish',
                },
              ]}
            />
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-orange-600! mb-4!'>
            <EditOutlined className='mr-2' />
            Bước 3: Chỉnh sửa câu hỏi
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <Paragraph className='text-base leading-relaxed'>
              Để chỉnh sửa một câu hỏi đã có:
            </Paragraph>
            <ol className='list-decimal list-inside space-y-2 ml-4'>
              <li>Tìm câu hỏi bạn muốn chỉnh sửa trong danh sách</li>
              <li>Nhấn nút <strong>"Chỉnh sửa"</strong> ở bên phải câu hỏi</li>
              <li>Thực hiện các thay đổi cần thiết trong cửa sổ chỉnh sửa</li>
              <li>Nhấn <strong>"Lưu"</strong> để áp dụng các thay đổi</li>
            </ol>
            <Alert
              message="Mẹo"
              description="Bạn có thể chỉnh sửa cả câu hỏi và câu trả lời, cũng như bật/tắt Schema Markup bất cứ lúc nào."
              type="info"
              showIcon
            />
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-red-600! mb-4!'>
            <DeleteOutlined className='mr-2' />
            Bước 4: Xóa câu hỏi
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <Paragraph className='text-base leading-relaxed'>
              Nếu một câu hỏi không còn cần thiết, bạn có thể xóa nó:
            </Paragraph>
            <ol className='list-decimal list-inside space-y-2 ml-4'>
              <li>Tìm câu hỏi bạn muốn xóa trong danh sách</li>
              <li>Nhấn nút <strong>"Xóa"</strong> màu đỏ ở bên phải câu hỏi</li>
              <li>Xác nhận việc xóa trong hộp thoại xác nhận</li>
            </ol>
            <Alert
              message="Cảnh báo"
              description="Hành động xóa không thể hoàn tác. Hãy chắc chắn trước khi xóa một câu hỏi."
              type="warning"
              showIcon
            />
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-indigo-600! mb-4!'>
            🔍 Tìm kiếm và quản lý FAQ theo sản phẩm
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <Paragraph className='text-base leading-relaxed'>
              Bạn có thể quản lý FAQ cho từng sản phẩm cụ thể:
            </Paragraph>
            <ol className='list-decimal list-inside space-y-2 ml-4'>
              <li>Sử dụng thanh tìm kiếm ở đầu trang để tìm sản phẩm</li>
              <li>Nhập tên sản phẩm, hệ thống sẽ tự động gợi ý các sản phẩm phù hợp</li>
              <li>Chọn sản phẩm từ danh sách gợi ý hoặc nhấn Enter để tìm kiếm</li>
              <li>Bạn sẽ được chuyển đến trang quản lý FAQ của sản phẩm đó</li>
              <li>Tại đây bạn có thể thêm, sửa, xóa FAQ riêng cho sản phẩm đó</li>
            </ol>
            <Alert
              message="Lưu ý"
              description="FAQ được quản lý riêng biệt cho từng sản phẩm, collection hoặc shop. Mỗi sản phẩm có thể có bộ FAQ riêng của mình."
              type="info"
              showIcon
            />
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-purple-600! mb-4!'>
            <CheckCircleOutlined className='mr-2' />
            Mẹo và thực hành tốt nhất
          </Title>
          <Space direction="vertical" size="small" className='w-full'>
            <Title level={4} className='mb-2!'>📝 Viết câu hỏi rõ ràng</Title>
            <Paragraph>
              Câu hỏi nên ngắn gọn, rõ ràng và phản ánh đúng những gì khách hàng thường hỏi. 
              Tránh sử dụng thuật ngữ kỹ thuật phức tạp.
            </Paragraph>

            <Title level={4} className='mb-2!'>💡 Câu trả lời chi tiết</Title>
            <Paragraph>
              Cung cấp câu trả lời đầy đủ và chi tiết. Sử dụng định dạng văn bản, danh sách, 
              và hình ảnh để làm cho câu trả lời dễ đọc và dễ hiểu hơn.
            </Paragraph>

            <Title level={4} className='mb-2!'>🔍 Tối ưu SEO</Title>
            <Paragraph>
              Luôn bật Schema Markup cho các câu hỏi quan trọng. Điều này giúp Google hiển thị 
              FAQ của bạn trong kết quả tìm kiếm dạng rich snippets.
            </Paragraph>

            <Title level={4} className='mb-2!'>🔄 Cập nhật thường xuyên</Title>
            <Paragraph>
              Thường xuyên xem xét và cập nhật các FAQ để đảm bảo thông tin luôn chính xác và 
              phù hợp với các thay đổi trong chính sách hoặc dịch vụ của bạn.
            </Paragraph>

            <Title level={4} className='mb-2!'>📊 Phân loại câu hỏi</Title>
            <Paragraph>
              Tổ chức các câu hỏi theo chủ đề hoặc mức độ quan trọng để khách hàng dễ dàng tìm 
              thấy thông tin họ cần. Hệ thống sẽ tự động nhóm các câu hỏi theo phân loại và hiển thị 
              trong các panel có thể mở rộng. Sử dụng các phân loại nhất quán để dễ quản lý.
            </Paragraph>

            <Title level={4} className='mb-2!'>🔍 Sử dụng tìm kiếm sản phẩm</Title>
            <Paragraph>
              Thanh tìm kiếm ở đầu trang giúp bạn nhanh chóng điều hướng đến trang quản lý FAQ của 
              bất kỳ sản phẩm nào. Chỉ cần nhập ít nhất 2 ký tự, hệ thống sẽ tự động gợi ý các sản phẩm phù hợp.
            </Paragraph>
          </Space>
        </Card>

        <Card className='shadow-md bg-gradient-to-r from-green-50 to-blue-50'>
          <Title level={3} className='text-center mb-4!'>
            ❓ Cần hỗ trợ thêm?
          </Title>
          <Paragraph className='text-center text-base'>
            Nếu bạn gặp bất kỳ vấn đề nào hoặc có câu hỏi về cách sử dụng hệ thống, 
            vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi. Chúng tôi luôn sẵn sàng giúp đỡ bạn!
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
};

export default Guide;

