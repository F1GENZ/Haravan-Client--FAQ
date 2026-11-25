import { Alert, Card, Flex, Steps, Tag, Typography } from 'antd';
import {
  AppstoreOutlined,
  BulbOutlined,
  CloudUploadOutlined,
  EditOutlined,
  FileExcelOutlined,
  OrderedListOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/page-header';

const { Paragraph, Text } = Typography;

const Section = ({ icon, color, title, children }) => (
  <Card>
    <Flex align='center' gap={10} style={{ marginBottom: 14 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${color}14`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 16,
        }}
      >
        {icon}
      </div>
      <Text strong style={{ fontSize: 15 }}>
        {title}
      </Text>
    </Flex>
    <Flex vertical gap={12}>
      {children}
    </Flex>
  </Card>
);

const OrderedSteps = ({ items }) => (
  <ol style={{ margin: 0, paddingLeft: 20, listStyle: 'decimal', display: 'grid', gap: 6 }}>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ol>
);

const TIPS = [
  ['Viết câu hỏi rõ ràng', 'Câu hỏi ngắn, đúng cách khách hàng thường hỏi; tránh thuật ngữ kỹ thuật.'],
  ['Trả lời đầy đủ', 'Dùng danh sách, liên kết và định dạng để câu trả lời dễ đọc.'],
  ['Bật Schema Markup có chọn lọc', 'Bật cho các câu hỏi quan trọng để cặp hỏi đáp vào JSON-LD FAQPage cho công cụ tìm kiếm và trợ lý AI đọc; ứng dụng không đảm bảo hiển thị đặc biệt.'],
  ['Phân loại nhất quán', 'Dùng cùng một tên phân loại cho cùng chủ đề để danh sách gọn và dễ quản lý.'],
  ['Cập nhật thường xuyên', 'Rà lại FAQ mỗi khi chính sách giao hàng, đổi trả hay bảo hành thay đổi.'],
  ['Chuẩn bị nội dung hàng loạt', 'Với danh sách dài, soạn trong bảng tính rồi nhập CSV theo đúng tiêu đề cột.'],
];

const Guide = () => (
  <>
    <PageHeader
      title='Hướng dẫn sử dụng'
      subtitle='Các bước tạo, sắp xếp và hiển thị câu hỏi thường gặp trên website.'
      crumbs={['Hướng dẫn']}
    />

    <Flex vertical gap={16}>
      <Alert
        type='info'
        showIcon
        message='Trước khi bắt đầu'
        description='Mở ứng dụng từ trang quản trị Haravan để đăng nhập. Phiên làm việc có hiệu lực 12 giờ; khi hết hạn, ứng dụng đưa bạn về trang đăng nhập. Khi hết hạn dùng thử, các thao tác thêm, sửa, xóa, sắp xếp, nhập CSV và cài snippet bị khóa cho đến khi F1GENZ kích hoạt.'
      />

      <Section icon={<AppstoreOutlined />} color='#1677ff' title='Bước 1: Chọn phạm vi quản lý'>
        <Paragraph style={{ margin: 0 }}>
          Menu bên trái có bốn phạm vi: <Text strong>Câu hỏi của shop</Text>, <Text strong>Sản phẩm</Text>,{' '}
          <Text strong>Danh mục</Text> và <Text strong>Trang</Text>. Mỗi phạm vi có bộ câu hỏi riêng.
        </Paragraph>
        <OrderedSteps
          items={[
            'Chọn phạm vi ở menu bên trái. Câu hỏi của shop hiển thị ngay.',
            'Với sản phẩm, danh mục hoặc trang: gõ ít nhất 2 ký tự vào ô tìm kiếm ở đầu trang.',
            'Chọn một kết quả gợi ý để mở danh sách câu hỏi của mục đó.',
            'Tên mục đang chỉnh sửa hiện trên đường dẫn phía trên tiêu đề và ở đầu danh sách.',
          ]}
        />
      </Section>

      <Section icon={<PlusOutlined />} color='#13c2c2' title='Bước 2: Thêm câu hỏi mới'>
        <Steps
          direction='vertical'
          size='small'
          items={[
            { title: 'Bấm "Thêm câu hỏi mới"', description: 'Nút nằm ở góc phải phía trên danh sách câu hỏi.', status: 'finish' },
            { title: 'Nhập câu hỏi', description: 'Đây là tiêu đề hiển thị trong danh sách FAQ trên website.', status: 'finish' },
            { title: 'Chọn phân loại', description: 'Chọn phân loại đã có trong gợi ý hoặc nhập phân loại mới.', status: 'finish' },
            { title: 'Soạn câu trả lời', description: 'Định dạng chữ, tạo liên kết, danh sách và bảng trong trình soạn thảo.', status: 'finish' },
            { title: 'Bật Schema Markup (tùy chọn)', description: 'Đưa câu hỏi vào JSON-LD FAQPage để công cụ tìm kiếm và trợ lý AI đọc cặp hỏi đáp dưới dạng dữ liệu có cấu trúc.', status: 'finish' },
            { title: 'Lưu', description: 'Câu hỏi mới được xếp vào cuối danh sách.', status: 'finish' },
          ]}
        />
      </Section>

      <Section icon={<EditOutlined />} color='#fa8c16' title='Bước 3: Chỉnh sửa, nhân bản và xóa'>
        <OrderedSteps
          items={[
            <>Bấm <Text strong>Chỉnh sửa</Text> để sửa câu hỏi, câu trả lời, phân loại hoặc Schema Markup.</>,
            <>Bấm <Text strong>Nhân bản</Text> để tạo bản sao có hậu tố "(bản sao)", giữ nguyên câu trả lời, phân loại và Schema Markup.</>,
            <>Bấm <Text strong>Xóa</Text> rồi xác nhận để xóa câu hỏi.</>,
          ]}
        />
        <Alert type='warning' showIcon message='Xóa câu hỏi không thể hoàn tác.' />
      </Section>

      <Section icon={<OrderedListOutlined />} color='#722ed1' title='Bước 4: Sắp xếp thứ tự hiển thị'>
        <Paragraph style={{ margin: 0 }}>
          Danh sách thường được nhóm theo phân loại. Chế độ sắp xếp hiển thị mọi câu hỏi thành một danh sách
          phẳng theo đúng thứ tự trên website.
        </Paragraph>
        <OrderedSteps
          items={[
            <>Bấm <Text strong>Sắp xếp</Text>.</>,
            'Giữ biểu tượng kéo ở đầu mỗi dòng và kéo câu hỏi đến vị trí mong muốn.',
            <>Bấm <Text strong>Lưu thứ tự</Text> để áp dụng, hoặc <Text strong>Hủy</Text> để bỏ thay đổi.</>,
          ]}
        />
      </Section>

      <Section icon={<FileExcelOutlined />} color='#52c41a' title='Xuất và nhập CSV'>
        <Paragraph style={{ margin: 0 }}>
          <Text strong>Xuất CSV</Text> tải mọi câu hỏi của mục đang chọn thành file UTF-8.{' '}
          <Text strong>Nhập CSV</Text> tạo câu hỏi hàng loạt từ file CSV.
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          Dòng đầu tiên là tiêu đề theo đúng thứ tự: <Tag>question</Tag>
          <Tag>answer</Tag>
          <Tag>categories</Tag>
          <Tag>schema</Tag>
          <Tag>position</Tag>
        </Paragraph>
        <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc', display: 'grid', gap: 4 }}>
          <li><Text code>answer</Text> có thể chứa HTML, dấu phẩy, dấu ngoặc kép và xuống dòng.</li>
          <li><Text code>schema</Text> nhận <Text code>true</Text> hoặc <Text code>false</Text>.</li>
          <li><Text code>position</Text> có thể để trống để tự xếp vào cuối danh sách.</li>
        </ul>
        <Paragraph type='secondary' style={{ margin: 0 }}>
          Quá trình nhập chạy tuần tự với thanh tiến trình; dòng lỗi được liệt kê kèm số dòng sau khi hoàn tất.
        </Paragraph>
      </Section>

      <Section icon={<CloudUploadOutlined />} color='#eb2f96' title='Bước 5: Hiển thị FAQ trên website'>
        <Paragraph style={{ margin: 0 }}>
          Mở <Link to='/storefront'>Hiển thị trên website</Link>, bấm <Text strong>Cài vào theme</Text> (hoặc{' '}
          <Text strong>Cập nhật</Text> khi snippet đã cài) để ghi snippet vào theme đang xuất bản. Sau đó dùng
          mục <Text strong>Chèn tự động vào template</Text>; chỉ dán tay khi bạn muốn tự kiểm soát vị trí.
        </Paragraph>
        <OrderedSteps
          items={[
            <>Trong thẻ <Text strong>Chèn tự động vào template</Text>, tích các template cần hiển thị FAQ. Ứng dụng chọn sẵn sản phẩm, danh mục và trang khi các template đó chưa có FAQ.</>,
            <>Nhập <Text strong>Tiêu đề hiển thị</Text> nếu muốn (tối đa 80 ký tự); để trống nếu không cần tiêu đề phía trên danh sách.</>,
            <>Bấm <Text strong>Chèn vào template đã chọn</Text> rồi xác nhận. Ứng dụng sao lưu từng template trước khi ghi; storefront có thể mất khoảng 1 phút để cập nhật.</>,
            <>Dùng <Text strong>Gỡ</Text> để chỉ xoá phần FAQ, hoặc <Text strong>Khôi phục bản gốc</Text> để trả template về nội dung trước khi chèn (chỉ khi template chưa bị sửa sau đó).</>,
          ]}
        />
        <Paragraph style={{ margin: 0 }}>
          <Text strong>Cách thủ công (dự phòng):</Text> dán một trong hai dòng include dưới đây vào template cần
          hiển thị. Snippet tự chọn FAQ của sản phẩm, danh mục hoặc trang theo template và không hiển thị gì
          khi chưa có câu hỏi.
        </Paragraph>
        <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc', display: 'grid', gap: 6 }}>
          <li><Text code style={{ wordBreak: 'break-all' }}>{"{% assign faq_title = 'Câu hỏi thường gặp' %}{% include 'f1genz-faq' %}"}</Text>: đặt tiêu đề rồi tự chọn FAQ theo template (sản phẩm, danh mục, trang hoặc shop).</li>
          <li><Text code style={{ wordBreak: 'break-all' }}>{"{% assign faq_title = 'Câu hỏi thường gặp' %}{% assign faq_source = 'shop' %}{% include 'f1genz-faq' %}"}</Text>: đặt tiêu đề và luôn hiển thị FAQ của shop.</li>
        </ul>
        <Paragraph style={{ margin: 0 }}>
          Bỏ dòng <Text code>assign faq_title</Text> nếu không muốn hiện tiêu đề. Khi bộ câu hỏi có từ 2
          phân loại trở lên, snippet nhóm câu hỏi theo <Text strong>Phân loại</Text>.
        </Paragraph>
        <Alert
          type='info'
          showIcon
          message='FAQ hiển thị dạng mở rộng/thu gọn, không cần JavaScript. JSON-LD FAQPage chỉ chứa câu hỏi có bật Schema Markup, và snippet không hiển thị gì khi danh sách trống.'
        />
      </Section>

      <Section icon={<BulbOutlined />} color='#faad14' title='Mẹo sử dụng'>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {TIPS.map(([title, text]) => (
            <div key={title} style={{ background: '#fafbfc', border: '1px solid #f0f0f0', borderRadius: 10, padding: '12px 14px' }}>
              <Text strong style={{ display: 'block', marginBottom: 4 }}>
                {title}
              </Text>
              <Text type='secondary' style={{ fontSize: 13 }}>
                {text}
              </Text>
            </div>
          ))}
        </div>
        <Paragraph type='secondary' style={{ margin: 0 }}>
          Cần hỗ trợ thêm? Xem mục <Link to='/contact'>Liên hệ</Link>.
        </Paragraph>
      </Section>
    </Flex>
  </>
);

export default Guide;
