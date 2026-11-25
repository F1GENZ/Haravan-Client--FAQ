# F1GENZ FAQ — giao diện quản trị

Ứng dụng quản trị câu hỏi thường gặp cho cửa hàng Haravan: soạn, phân loại, sắp xếp và hiển thị FAQ cho toàn shop hoặc cho từng sản phẩm, danh mục, trang nội dung. Câu hỏi lưu trong metafield của chính shop; SPA này gọi Worker API của F1GENZ để đọc và ghi.

## Công nghệ

React 19, Ant Design 5, TanStack Query 5, React Router 7, Tailwind 4 (preflight), Vite 6, Vitest.

## Biến môi trường

| Biến | Ý nghĩa |
| --- | --- |
| `VITE_APP_API_URL` | Base URL của Worker API. Production: `https://api-faq.f1genz.dev/`. Để trống thì axios gọi chính origin đang mở cửa sổ. |

CI và bản build production luôn set biến này (xem `.github/workflows/ci.yml`). Cần Node 22.

## Lệnh

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Vite dev server ở cổng 5173 |
| `npm run lint` | ESLint toàn repo |
| `npm test` | Vitest chạy một lần (môi trường node) |
| `npm run build` | Build production vào `dist/` |
| `npm run preview` | Xem thử bản build |

## Triển khai

Merge vào `main` là đủ: Cloudflare Pages project `haravan-client--faq` build `npm ci && npm run build` với `VITE_APP_API_URL=https://api-faq.f1genz.dev/`. Merchant mở `https://faq.f1genz.dev`, host này do Worker `f1genz-faq` proxy sang Pages. Không cần deploy tay; PR chỉ cần lint, test và build xanh.

## Route

| Route | Trang |
| --- | --- |
| `/`, `/products`, `/collections`, `/pages`, `*` | Quản lý câu hỏi theo phạm vi shop, sản phẩm, danh mục, trang |
| `/storefront` | Trạng thái snippet và các dòng include |
| `/introduction`, `/guide`, `/contact` | Giới thiệu, hướng dẫn, liên hệ |
| `/install/login`, `/install/grandservice` | Đăng nhập Haravan OAuth, không có layout quản trị |

Mọi trang nạp bằng `React.lazy`; khung chờ là `Spin` của antd. Trình soạn thảo TinyMCE chỉ tải khi mở hộp thoại câu hỏi.

## Phiên đăng nhập

Worker ký token và trả về qua URL cài đặt; SPA lưu `faq_session` cùng `orgid` trong `sessionStorage` (không dùng cookie) và gửi `Authorization: Bearer` ở mỗi request. Phiên có hiệu lực 12 giờ; response 401 xóa token và đưa về `/install/login`, trừ hai route `/install/*`.

## Kiểm thử

Vitest chạy môi trường node. `src/lib/__tests__` phủ logic thuần: thứ tự và nhóm câu hỏi, CSV, phiên, và danh sách chờ sau khi tạo (Haravan chỉ liệt kê metafield mới sau 60-90 giây). `src/common/__tests__` phủ lớp chuẩn hóa envelope API.
