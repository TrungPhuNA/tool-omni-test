# Đặc tả: Scenario Runner

---

## Mô tả

Cho phép chạy nhiều API tuần tự trong 1 kịch bản. Kết quả (response) của step trước có thể được extract ra biến để dùng cho step sau.

**Ví dụ thực tế:**
```
Step 1: POST /auth/login       → Extract: token = response.data.access_token
Step 2: GET  /users/me         → Header: Authorization = "Bearer {{token}}"
Step 3: PUT  /users/profile    → Header: Authorization = "Bearer {{token}}"
Step 4: POST /posts            → Header: Authorization = "Bearer {{token}}"
```

---

## Trạng thái

🚧 **Đang phát triển** — Backend model đã có, service đang hoàn thiện

---

## Tính năng cần làm

### Backend — k6 Engine (DONE ✅)
- [x] **Data Structure**: Thiết kế cấu hình nhận diện một luồng (Scenario config)
- [x] **Variable Extraction**: Logic tự động trích xuất dữ liệu từ Response của bước trước
- [x] **Dynamic Script Generation**: `k6.service.js` tạo script k6 có nhiều `group` + `setup()` cho Login
- [x] **Multi-metric emission**: Đẩy log và metrics theo từng bước (step-by-step) về FE qua Socket.io

### Backend — API Routes (TODO)
- [ ] Route CRUD `GET/POST/PUT/DELETE /api/v1/scenarios`
- [ ] Route `POST /api/v1/scenarios/:id/run` — Thực thi kịch bản
- [ ] `scenario.service.js`:
  - Load steps theo thứ tự `order`
  - Khởi tạo `scenarioContext = {}` — kho biến dùng chung giữa steps
  - Với mỗi step: inject biến → gọi proxy → chạy extractors → lưu vào context
  - Nếu step fail + `stopOnError=true` → dừng toàn bộ
- [ ] **Scenario History**: Lưu kết quả chạy scenario vào `test_histories`

### Frontend — Scenario Builder UI (TODO)
- [ ] **Step Management**: Giao diện thêm/bớt và sắp xếp thứ tự các API (Drag & Drop)
- [ ] **Variable Mapping**: UI cấu hình truyền biến (VD: `token = step1.response.data.token`)
- [ ] **Flow Configuration**: Thiết lập VU và thời gian chạy cho toàn bộ Scenario (load mode)
- [ ] **Step-by-Step Monitor**: Biểu đồ thời gian phản hồi từng bước để tìm "nút thắt cổ chai"
- [ ] Hiển thị kết quả từng step: status badge, duration, extracted vars, timeline

---

## Cấu trúc Step (JSON trong DB)

```json
{
  "order": 1,
  "stepName": "Login",
  "requestId": 5,
  "extractors": [
    {
      "variableName": "token",
      "source": "body",
      "path": "data.access_token"
    }
  ],
  "assertions": [
    { "type": "status", "op": "eq", "expected": 200 }
  ]
}
```

---

## API Response khi chạy Scenario

```json
{
  "scenarioId": 1,
  "status": "pass",
  "steps": [
    {
      "stepName": "Login",
      "status": "pass",
      "duration": 89,
      "statusCode": 200,
      "extractedVars": { "token": "eyJhbGc..." }
    },
    {
      "stepName": "Get Profile",
      "status": "pass",
      "duration": 56,
      "statusCode": 200
    }
  ],
  "totalDuration": 145
}
```

---

## Files liên quan

**Backend:**
- `src/models/Scenario.js`
- `src/services/scenario.service.js`
- `src/controllers/scenario.controller.js`
- `src/routes/scenario.route.js`

**Frontend:**
- `src/pages/ScenarioBuilderPage.jsx` *(chưa tạo)*
- `src/components/features/scenario/` *(chưa tạo)*
