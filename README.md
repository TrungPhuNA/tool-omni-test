# OmniTest - Advanced API Testing Tool

OmniTest là một công cụ kiểm thử API mạnh mẽ, linh hoạt và hiện đại, được thiết kế để giúp các nhà phát triển và tester quản lý, thực thi và tự động hóa các yêu cầu HTTP một cách chuyên nghiệp.

## 🚀 Tính năng chính

- **Quản lý Collection thông minh**: Tổ chức API theo Collections và Folders. Hỗ trợ kéo thả để sắp xếp lại cấu trúc.
- **Tìm kiếm API mạnh mẽ**: Tìm kiếm nhanh chóng theo tên API hoặc Endpoint (URL) ngay tại Sidebar.
- **Biến môi trường (Environments)**: Quản lý linh hoạt các bộ biến môi trường (Staging, Production, Local) và tự động thay thế trong URL, Headers, Body.
- **Scripting (OmniScript)**:
    - **Pre-request Script**: Xử lý dữ liệu, tính toán signature (HMAC-SHA256, v.v.) trước khi gửi request.
    - **Post-response Script**: Tự động trích xuất token, lưu biến môi trường hoặc viết các đoạn script kiểm tra kết quả ngay sau khi nhận phản hồi.
- **Export & Import**: Sao lưu và phục hồi toàn bộ Collection dưới dạng file JSON, giúp chia sẻ dự án cực kỳ dễ dàng.
- **Load Testing (Performance)**: Tích hợp k6 để thực hiện các bài kiểm tra hiệu năng, đo lường khả năng chịu tải của API.
- **Giao diện hiện đại**: Thiết kế Dark Mode chuyên nghiệp, giao diện linh hoạt (Resizable panels) và phản hồi tức thì.
- **Lịch sử & Logs**: Lưu trữ lịch sử các lần gọi API và log chi tiết từ script.

## 🛠 Công nghệ sử dụng

### Frontend
- **React**: Thư viện UI chính.
- **Zustand**: Quản lý State tập trung và hiệu quả.
- **TailwindCSS**: CSS framework cho giao diện hiện đại và tùy biến cao.
- **Lucide Icons**: Bộ icon tinh tế và đồng bộ.

### Backend
- **Node.js & Express**: Nền tảng server-side.
- **Sequelize (ORM)**: Quản lý database MySQL một cách chuyên nghiệp.
- **Socket.io**: Cập nhật dữ liệu thời gian thực.
- **VM2 / VM**: Chạy script người dùng trong môi trường sandbox an toàn.

## 📦 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js (v16 trở lên)
- MySQL Database

### Các bước cài đặt

1. **Clone dự án**:
   ```bash
   git clone [url-du-an]
   cd tool-omni-test
   ```

2. **Cài đặt Backend**:
   ```bash
   cd backend
   npm install
   ```
   - Tạo file `.env` dựa trên cấu hình database của bạn:
     ```env
     PORT=5005
     DB_HOST=127.0.0.1
     DB_USER=root
     DB_PASS=your_password
     DB_NAME=api_test_tool
     JWT_SECRET=your_secret_key
     ```

3. **Cài đặt Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```
   - Tạo file `.env`:
     ```env
     VITE_API_URL=http://localhost:5005/api/v1
     ```

## 🏃 Chạy ứng dụng

### Chạy Backend
```bash
cd backend
npm run dev
```

### Chạy Frontend
```bash
cd frontend
npm run dev
```

Ứng dụng sẽ khả dụng tại địa chỉ: `http://localhost:5173` (mặc định của Vite).

## 📝 Ghi chú cho lập trình viên
- Mọi truy vấn SQL hiện đang được hiển thị trong terminal backend để hỗ trợ debug.
- Log chi tiết JSON payload đã được ẩn để dọn dẹp không gian terminal.
- Các script chạy trong môi trường Sandbox với quyền truy cập vào object `omni` hoặc `pm`.

---
© 2026 OmniTest Team. Built for developers by developers.
