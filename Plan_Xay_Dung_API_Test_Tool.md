# KẾ HOẠCH XÂY DỰNG API TEST TOOL

**Tech Stack Đề Xuất:**
- **Frontend:** React.js, TailwindCSS, Axios, Recharts (Biểu đồ).
- **Backend:** Node.js (Express/NestJS), Socket.io (Real-time logs).
- **Load Engine:** k6 (Grafana) hoặc Autocannon.
- **Database:** SQLite hoặc MongoDB (Lưu trữ script/history).

## PHẦN 1: CHECKLIST TÍNH NĂNG (FEATURE LIST)

### 1. Kiểm thử chức năng (Functional Test)
- [ ] **Request Builder:** Hỗ trợ Method (GET, POST, PUT, DELETE), Headers, Params, Body (JSON/Form-data).
- [ ] **Auth Automator:** Tự động login lấy Bearer Token/Cookie và inject vào các request tiếp theo.
- [ ] **Assert Engine:** So sánh Status Code, Response Time, Json Schema.
- [ ] **Environment Manager:** Quản lý biến môi trường (Dev, Staging, Production).

### 2. Kiểm thử tải (Load/Performance Test)
- [ ] **CCU Simulator:** Cấu hình số lượng User ảo (Virtual Users), thời gian test.
- [ ] **Ramp-up/Down:** Giả lập tăng/giảm tải theo thời gian để tránh crash server đột ngột.
- [ ] **Real-time Monitor:** Theo dõi RPS (Request per second), Latency (P95, P99) qua biểu đồ.

### 3. Hệ thống & Báo cáo
- [ ] **Collections:** Lưu trữ nhóm API theo dự án/module.
- [ ] **History:** Lưu lịch sử các lần chạy test để so sánh hiệu năng qua từng Sprint.
- [ ] **Export Report:** Xuất báo cáo dạng PDF/HTML có biểu đồ chuyên nghiệp.

## PHẦN 2: LỘ TRÌNH TRIỂN KHAI (ROADMAP)

### Tuần 1: MVP - Chạy được Request cơ bản
- [ ] Dựng khung dự án React & Express.
- [ ] Xây dựng UI Request Builder giống Postman.
- [ ] Backend xử lý Proxy Request để tránh lỗi CORS khi test API khác.

### Tuần 2: Quản lý & Automation
- [ ] Tích hợp Database lưu Collection.
- [ ] Xây dựng logic Pre-request Script (ví dụ: tự động lấy token trước khi gọi API chính).
- [ ] Thêm tính năng Environment Variables.

### Tuần 3: Load Testing & Visualization
- [ ] Tích hợp thư viện **k6** vào Backend Node.js.
- [ ] Frontend xây dựng màn hình cấu hình CCU.
- [ ] Dùng Socket.io để đẩy dữ liệu test tải từ k6 lên React vẽ biểu đồ realtime.

### Tuần 4: Hoàn thiện & Đóng gói
- [ ] Xử lý Export báo cáo.
- [ ] Viết tài liệu hướng dẫn sử dụng cho Tester.
- [ ] Triển khai lên Docker cho cả Team dùng chung.
