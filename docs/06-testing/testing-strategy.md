# Chiến lược Testing — OmniTest

---

## Loại test đang áp dụng

### 1. Manual Testing (Chính)
Hiện tại dự án chủ yếu dùng manual testing — dùng chính công cụ OmniTest để test OmniTest.

**Checklist manual test khi có thay đổi:**
- [ ] Tạo/sửa/xóa Collection hoạt động đúng
- [ ] Gửi request GET/POST/PUT/DELETE thành công
- [ ] Variable injection hoạt động với `{{VAR}}`
- [ ] Pre/Post script chạy trong sandbox an toàn
- [ ] Load test k6 khởi động và stream data về FE
- [ ] Export/Import JSON giữ nguyên cấu trúc

### 2. Integration Testing (Kế hoạch)
- [ ] Test API endpoints bằng chính OmniTest Scenario Runner
- Tạo Scenario "Smoke Test" — chạy tất cả endpoints cơ bản

---

## Môi trường Test

| Môi trường | Mục đích |
|---|---|
| Local | Phát triển + test thủ công hàng ngày |
| Staging | Test trước khi merge vào main |

---

## Checklist trước khi merge vào main

```
□ Backend không có console.error mới (ngoài intentional logging)
□ Tất cả routes mới đã có middleware validate
□ Migration mới có cả up() và down()
□ Frontend không có broken import
□ Chạy npm run dev cả backend và frontend — không có lỗi khởi động
□ Test manual các API liên quan đến thay đổi
```
