# Đặc tả: Request Builder

---

## Mô tả

Giao diện chính để xây dựng và gửi HTTP request. Tương tự tab request trong Postman.

---

## Tính năng

### Đã hoàn thành ✅
- Method selector: GET/POST/PUT/PATCH/DELETE (đổi màu theo method)
- URL input với hỗ trợ biến `{{VAR_NAME}}`
- Tabs: Headers, Params, Body, Auth, Pre-script, Post-script, Docs
- Body modes: None, Raw (JSON), Form-Data, URL-Encoded
- Gửi request qua backend proxy (tránh CORS)
- Hiển thị response: Status code, Time, Size, Body (syntax highlight)
- Lưu/Cập nhật request vào Collection

### Chưa làm ⬜
- Assertions UI (thêm rule kiểm tra response)
- History của từng request

---

## Luồng xử lý

```
1. User điền URL/Method/Headers/Body
2. Chọn Environment (để inject biến)
3. Click Send
4. Frontend gọi POST /api/v1/proxy/execute
5. Backend:
   a. Inject biến từ environment vào URL/Headers/Body
   b. Chạy Pre-request Script (nếu có)
   c. Gọi target API bằng axios
   d. Chạy Post-response Script (nếu có)
   e. Lưu vào test_histories
6. Frontend nhận và hiển thị response
```

---

## API liên quan

- `POST /api/v1/proxy/execute` — Gửi request
- `GET /api/v1/requests/:id` — Load request đã lưu
- `PUT /api/v1/requests/:id` — Lưu/Cập nhật request

---

## Files liên quan

**Backend:**
- `src/controllers/proxy.controller.js`
- `src/services/proxy.service.js`
- `src/services/env.service.js` — Variable injection
- `src/services/sandbox.service.js` — Script execution

**Frontend:**
- `src/components/features/request-builder/`
- `src/hooks/useRequestBuilder.js`
- `src/store/request.store.js`
