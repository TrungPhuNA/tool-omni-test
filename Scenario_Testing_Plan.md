# 🚀 KẾ HOẠCH PHÁT TRIỂN: SCENARIO TESTING (LUỒNG API)

## 🎯 Mục tiêu
Cho phép người dùng thiết lập và kiểm thử tải cho một luồng công việc hoàn chỉnh (Workflow) thay vì chỉ test một API đơn lẻ. 
**Ví dụ:** Login (Lấy Token) -> Get Profile -> List Products -> View Detail Product.

---

## 🛠️ Danh sách công việc (Checklist)

### 1. Backend: Nâng cấp k6 Engine [DONE]
- [x] **Data Structure**: Thiết kế cấu hình nhận diện một luồng (Scenario config).
- [x] **Variable Extraction**: Phát triển logic tự động trích xuất dữ liệu từ Response của bước trước (ví dụ: `access_token`) để dùng cho bước sau.
- [x] **Dynamic Script Generation**: Nâng cấp `k6.service.js` để tạo script k6 có nhiều `group` và xử lý `setup()` cho phần Login.
- [x] **Multi-metric emission**: Đẩy log và metrics theo từng bước (Step-by-step) về Frontend qua Socket.io.

### 2. Frontend: Scenario Builder UI [TODO]
- [ ] **Step Management**: Giao diện thêm/bớt và sắp xếp thứ tự các API trong luồng (Drag & Drop).
- [ ] **Variable Mapping**: UI cấu hình truyền biến (Ví dụ: Định nghĩa `token = step1.response.data.token`).
- [ ] **Flow Configuration**: Thiết lập VUs và thời gian chạy cho toàn bộ Scenario.
- [ ] **Step-by-Step Monitor**: Biểu đồ hiển thị thời gian phản hồi của từng bước trong luồng để tìm ra "nút thắt cổ chai" (Bottleneck).

### 3. Database & Lưu trữ [TODO]
- [ ] **Scenario Model**: Tạo bảng lưu trữ các kịch bản đã thiết kế.
- [ ] **Scenario History**: Lưu kết quả chạy test theo luồng để so sánh.

---

## 📅 Lộ trình thực hiện (Roadmap)

### Giai đoạn 1: Backend core (1-2 ngày)
*   Hoàn thiện việc sinh script k6 cho nhiều API.
*   Xử lý logic truyền Token tự động.

### Giai đoạn 2: UI Scenario Builder (2-3 ngày)
*   Xây dựng màn hình chọn các API từ Collection để tạo thành luồng.
*   Tích hợp Socket để hiển thị log theo từng bước API.

### Giai đoạn 3: Kiểm thử & Hoàn thiện
*   Chạy thử kịch bản 5 API của bạn (Login -> 4 API App -> Chi tiết sản phẩm).
*   Tối ưu hóa báo cáo kết quả luồng.

---

## 📝 Ghi chú bài toán của bạn (5 API Flow)
1. **Bước 1**: Login (POST) -> Lưu `token`.
2. **Bước 2-5**: App Calls (GET/POST) -> Sử dụng `token` ở Header.
3. **Bước 6**: Chi tiết sản phẩm (GET) -> Sử dụng `token`.
4. **Bước 7**: Trang chủ.

> [!IMPORTANT]
> **Điểm mấu chốt**: Hệ thống phải đảm bảo bước Login chỉ chạy 1 lần (trong `setup`) hoặc chạy theo mỗi VU tùy vào kịch bản test.
