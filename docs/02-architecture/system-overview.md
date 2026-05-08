# Kiến trúc hệ thống — OmniTest

> Dành cho AI Agent: Đọc file này để hiểu toàn bộ kiến trúc trước khi thiết kế tính năng mới.

---

## Sơ đồ kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (React App :5173)                     │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  Request Builder │  │  Load Test Config│  │   Sidebar     │  │
│  │  (tab panel)     │  │  + Realtime Chart│  │   Collections │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘  │
│           │ Axios (REST)        │ socket.io-client    │ Axios    │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
┌───────────▼─────────────────────▼─────────────────────▼──────────┐
│                    BACKEND (Express.js :5005)                     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Proxy Engine │  │  k6 Spawner  │  │  Collection/Req/Env  │   │
│  │ (axios call) │  │ + Socket.io  │  │  CRUD API            │   │
│  └──────────────┘  └──────┬───────┘  └──────────┬───────────┘   │
│                            │                     │               │
│  ┌─────────────────────────┼─────────────────────▼───────────┐  │
│  │  Script Sandbox (vm)    │      MySQL via Sequelize ORM     │  │
│  │  Pre/Post request script│      collections, requests,      │  │
│  └─────────────────────────┘      environments, history       │  │
└─────────────────────────────────────────────────────────────────-┘
                              │ stdin/stdout
            ┌─────────────────▼───────────────┐
            │         k6 Process (binary)      │
            │  Chạy load test, emit metrics    │
            └─────────────────────────────────┘
```

---

## Luồng dữ liệu chính

### Luồng 1: Gửi API request (Functional Test)

```
1. User nhập URL/Method/Headers/Body trong Request Builder
2. Click "Send" → FE gọi POST /api/v1/proxy/execute
3. Backend: injectVariables() → thay thế {{VAR}} bằng giá trị thực
4. Backend: chạy Pre-request Script trong sandbox (nếu có)
5. Backend: axios gọi target API → nhận response
6. Backend: chạy Post-response Script (nếu có) → lưu biến môi trường
7. Backend: tính response time, chạy assertions
8. Backend: lưu vào test_histories
9. FE nhận response → hiển thị status, body, time, assert results
```

### Luồng 2: Load Test (k6)

```
1. User cấu hình VU count, duration, ramp-up/down
2. Click "Start" → FE gọi POST /api/v1/loadtest/start
3. Backend: generate k6 script động từ config
4. Backend: spawn k6 process (child_process)
5. k6: chạy load test, ghi kết quả ra stdout
6. Backend: parse stdout → emit qua Socket.io
7. FE: nhận event qua socket → cập nhật Recharts realtime
8. k6 kết thúc → Backend emit 'k6:done' → FE hiển thị summary
```

### Luồng 3: Variable Injection

```
Template:  "Authorization: Bearer {{token}}"
Env vars:  { token: "eyJhbGc..." }

→ Inject: "Authorization: Bearer eyJhbGc..."

Priority (cao → thấp):
1. Request-level override (nhập tay cho request này)
2. Active environment variables
3. Giữ nguyên {{VAR}} nếu không tìm thấy
```

---

## Stack & Port

| Service | Port | Công nghệ |
|---|---|---|
| Frontend | 5173 | Vite Dev Server |
| Backend API | 5005 | Express.js |
| MySQL | 3306 | MySQL 8 |

---

## Pattern phân lớp Backend

```
HTTP Request
    ↓
[Route] — Định nghĩa endpoint, gắn middleware validate
    ↓
[Middleware Validate] — Joi schema validation
    ↓
[Controller] — Nhận req, gọi service, trả res
    ↓
[Service] — Logic nghiệp vụ (không biết DB)
    ↓
[Repository] — Tương tác DB qua Sequelize
    ↓
[Model] — Định nghĩa bảng
    ↓
MySQL Database
```

---

## Các thành phần đặc biệt

### Script Sandbox (vm)
- Chạy Pre-request Script và Post-response Script trong môi trường cô lập
- Có sẵn object `omni` / `pm` (tương thích Postman)
- Không được import module ngoài, không có quyền filesystem

### Socket.io Events
```javascript
// Server emit
socket.emit('k6:progress', { rps, p95, p99, errorRate, timestamp });
socket.emit('k6:done',     { summary });
socket.emit('k6:error',    { message });

// Client listen
socket.on('k6:progress', (data) => updateChart(data));
```

### Variable Injection Pattern
```javascript
// Regex thay thế {{VAR_NAME}} trong string
const inject = (template, vars) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
```
