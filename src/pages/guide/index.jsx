import { Typography, Card, Steps, Space, Divider, Alert, Tag } from 'antd';
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  OrderedListOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

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
          description="Để sử dụng ứng dụng, bạn cần cài đặt và kết nối với cửa hàng Haravan của mình. Phiên làm việc có hiệu lực trong 12 giờ; khi hết hạn, ứng dụng sẽ đưa bạn về trang đăng nhập. Khi hết hạn dùng thử, các thao tác thêm, sửa, xóa, sắp xếp, nhập CSV và cài snippet sẽ bị khóa cho đến khi F1GENZ kích hoạt."
          type="info"
          showIcon
          className='mb-4'
        />

        <Card className='shadow-md'>
          <Title level={2} className='text-green-600! mb-4!'>
            Bước 1: Chọn phạm vi quản lý FAQ
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <Paragraph className='text-base leading-relaxed'>
              Menu bên trái có bốn phạm vi: <Text strong>Shop</Text>,{' '}
              <Text strong>Sản phẩm</Text>, <Text strong>Danh mục</Text> và{' '}
              <Text strong>Trang</Text>. Mỗi phạm vi có bộ câu hỏi riêng.
            </Paragraph>
            <ol className='list-decimal list-inside space-y-2 ml-4'>
              <li>Chọn loại phạm vi ở menu bên trái</li>
              <li>Dùng thanh tìm kiếm ở đầu trang để tìm theo loại đã chọn</li>
              <li>Chọn một kết quả trong danh sách gợi ý để mở trang FAQ tương ứng</li>
              <li>Tiêu đề trang hiển thị tên sản phẩm, danh mục hoặc trang đang chỉnh sửa</li>
            </ol>
            <Alert
              message="Lưu ý"
              description="FAQ được quản lý riêng cho từng shop, sản phẩm, danh mục và trang. Riêng shop, danh sách hiển thị ngay tại mục Shop."
              type="info"
              showIcon
            />
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-blue-600! mb-4!'>
            <PlusOutlined className='mr-2' />
            Bước 2: Thêm câu hỏi mới
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
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
                  description: 'Nhập phân loại (category) cho câu hỏi. Hệ thống gợi ý các phân loại đã có để bạn chọn hoặc nhập phân loại mới',
                  status: 'finish',
                },
                {
                  title: 'Soạn thảo câu trả lời',
                  description: 'Sử dụng trình soạn thảo để định dạng văn bản, tạo liên kết, danh sách và bảng',
                  status: 'finish',
                },
                {
                  title: 'Bật Schema Markup (Tùy chọn)',
                  description: 'Khi bật, câu hỏi được đưa vào JSON-LD FAQPage để Google đọc được',
                  status: 'finish',
                },
                {
                  title: 'Lưu câu hỏi',
                  description: 'Nhấn nút "Lưu". Câu hỏi mới được xếp vào cuối danh sách',
                  status: 'finish',
                },
              ]}
            />
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-orange-600! mb-4!'>
            <EditOutlined className='mr-2' />
            Bước 3: Chỉnh sửa, nhân bản và xóa câu hỏi
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <ol className='list-decimal list-inside space-y-2 ml-4'>
              <li>Nhấn <strong>"Chỉnh sửa"</strong> để sửa câu hỏi, câu trả lời, phân loại hoặc Schema Markup</li>
              <li>Nhấn <strong>"Nhân bản"</strong> để tạo bản sao có câu hỏi kèm hậu tố "(bản sao)", giữ nguyên câu trả lời, phân loại và Schema Markup</li>
              <li>Nhấn <strong>"Xóa"</strong> và xác nhận để xóa câu hỏi khỏi danh sách</li>
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
          <Title level={2} className='text-cyan-700! mb-4!'>
            <OrderedListOutlined className='mr-2' />
            Bước 4: Sắp xếp thứ tự hiển thị
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <Paragraph className='text-base leading-relaxed'>
              Danh sách thường được nhóm theo phân loại. Chế độ sắp xếp hiển thị toàn bộ
              câu hỏi thành một danh sách phẳng theo đúng thứ tự hiển thị trên website.
            </Paragraph>
            <ol className='list-decimal list-inside space-y-2 ml-4'>
              <li>Nhấn nút <strong>"Sắp xếp"</strong></li>
              <li>Kéo thả các câu hỏi đến vị trí mong muốn</li>
              <li>Nhấn <strong>"Lưu thứ tự"</strong> để áp dụng; nhấn <strong>"Hủy"</strong> để bỏ thay đổi</li>
            </ol>
            <Alert
              message="Lưu ý"
              description="Thứ tự này cũng là thứ tự hiển thị của snippet trên website."
              type="info"
              showIcon
            />
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-purple-600! mb-4!'>
            📄 Xuất và nhập CSV
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <Paragraph className='text-base leading-relaxed'>
              Nút <strong>"Xuất CSV"</strong> tải toàn bộ câu hỏi của phạm vi đang chọn
              thành file UTF-8 (có BOM). Nút <strong>"Nhập CSV"</strong> tạo câu hỏi hàng
              loạt từ file CSV.
            </Paragraph>
            <Paragraph className='mb-0!'>
              File CSV phải có dòng tiêu đề theo đúng thứ tự:{' '}
              <Tag>question</Tag>
              <Tag>answer</Tag>
              <Tag>categories</Tag>
              <Tag>schema</Tag>
              <Tag>position</Tag>
            </Paragraph>
            <ul className='list-disc list-inside space-y-1 ml-4'>
              <li><Text code>answer</Text> có thể chứa HTML, dấu phẩy, dấu ngoặc kép và xuống dòng</li>
              <li><Text code>schema</Text> nhận <Text code>true</Text> hoặc <Text code>false</Text></li>
              <li><Text code>position</Text> có thể để trống để hệ thống tự xếp vào cuối danh sách</li>
            </ul>
            <Paragraph>
              Quá trình nhập diễn ra tuần tự và có thanh tiến trình; các dòng lỗi được
              liệt kê kèm số dòng sau khi hoàn tất.
            </Paragraph>
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-indigo-600! mb-4!'>
            <CloudUploadOutlined className='mr-2' />
            Bước 5: Hiển thị FAQ trên website
          </Title>
          <Space direction="vertical" size="middle" className='w-full'>
            <Paragraph className='text-base leading-relaxed'>
              Mở mục <strong>Hiển thị trên website</strong>, bấm <strong>"Cài vào theme"</strong>{' '}
              (hoặc <strong>"Cập nhật"</strong> khi snippet đã có) để ghi snippet vào theme
              đang xuất bản, sau đó sao chép một trong hai dòng include và dán vào template
              cần hiển thị.
            </Paragraph>
            <ol className='list-decimal list-inside space-y-2 ml-4'>
              <li><Text code>{"{% include 'f1genz-faq' %}"}</Text>: snippet tự chọn nguồn FAQ theo template (sản phẩm, danh mục, trang hoặc shop)</li>
              <li><Text code>{"{% assign faq_source = 'shop' %}{% include 'f1genz-faq' %}"}</Text>: luôn hiển thị FAQ của shop</li>
            </ol>
            <Alert
              message="Snippet hoạt động không cần JavaScript"
              description="FAQ hiển thị dạng <details>, và JSON-LD FAQPage chỉ chứa các câu hỏi có bật Schema Markup. Snippet không hiển thị gì khi danh sách trống."
              type="info"
              showIcon
            />
          </Space>
        </Card>

        <Card className='shadow-md'>
          <Title level={2} className='text-emerald-600! mb-4!'>
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
              Cung cấp câu trả lời đầy đủ. Sử dụng định dạng văn bản, danh sách để làm cho
              câu trả lời dễ đọc và dễ hiểu hơn.
            </Paragraph>

            <Title level={4} className='mb-2!'>🔍 Tối ưu SEO</Title>
            <Paragraph>
              Bật Schema Markup cho các câu hỏi quan trọng để Google có thể hiển thị FAQ
              dưới dạng rich snippets.
            </Paragraph>

            <Title level={4} className='mb-2!'>🔄 Cập nhật thường xuyên</Title>
            <Paragraph>
              Thường xuyên xem xét và cập nhật các FAQ để đảm bảo thông tin luôn chính xác
              và phù hợp với các thay đổi trong chính sách hoặc dịch vụ của bạn.
            </Paragraph>

            <Title level={4} className='mb-2!'>📊 Phân loại câu hỏi</Title>
            <Paragraph>
              Tổ chức các câu hỏi theo chủ đề để khách hàng dễ dàng tìm thấy thông tin.
              Hệ thống nhóm câu hỏi theo phân loại trong các panel có thể mở rộng; dùng
              phân loại nhất quán để dễ quản lý.
            </Paragraph>

            <Title level={4} className='mb-2!'>📥 Chuẩn bị nội dung hàng loạt</Title>
            <Paragraph>
              Với danh sách dài, soạn nội dung trong bảng tính rồi xuất CSV theo đúng tiêu đề
              cột để nhập vào ứng dụng nhanh hơn.
            </Paragraph>
          </Space>
        </Card>

        <Card className='shadow-md bg-gradient-to-r from-green-50 to-blue-50'>
          <Title level={3} className='text-center mb-4!'>
            ❓ Cần hỗ trợ thêm?
          </Title>
          <Paragraph className='text-center text-base'>
            Nếu bạn gặp bất kỳ vấn đề nào hoặc có câu hỏi về cách sử dụng hệ thống,
            vui lòng liên hệ với đội ngũ hỗ trợ F1GENZ.
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
};

export default Guide;
