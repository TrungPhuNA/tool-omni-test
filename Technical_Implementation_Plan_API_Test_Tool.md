# 🛠️ TECHNICAL IMPLEMENTATION PLAN — API TEST TOOL

## Tổng quan

Xây dựng một công cụ kiểm thử API nội bộ (tương tự Postman + k6) dành cho team, gồm 3 lớp chính:
- **Frontend (React)** – UI Request Builder, Dashboard giám sát realtime
- **Backend (Node.js / Express)** – Proxy Server, Auth Automator, Load Engine wrapper
- **Load Engine (k6)** – Chạy performance test, đẩy kết quả về qua Socket.io

---

## Kiến trúc hệ thống tổng thể

```
┌────────────────────────────────────────────────────────┐
│                  BROWSER (React App)                   │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────┐  │
│  │ Request      │  │  Load Test    │  │  Report    │  │
│  │ Builder UI   │  │  Config + Chart│  │  Viewer    │  │
│  └──────┬───────┘  └──────┬────────┘  └─────┬──────┘  │
└─────────┼────────────────┼─────────────────┼──────────┘
          │ REST/Axios      │ WebSocket       │ REST
┌─────────▼────────────────▼─────────────────▼──────────┐
│                  BACKEND (Express.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Proxy Engine │  │ k6 Spawner   │  │ Collection  │  │
│  │ (CORS fix)   │  │ + Socket.io  │  │ / History   │  │
│  └──────────────┘  └──────────────┘  └──────┬──────┘  │
│                                             │          │
│  ┌──────────────────────────────────────────▼──────┐   │
│  │               MySQL (via Sequelize ORM)            │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
          │ stdin/stdout
┌─────────▼──────────────┐
│    k6 Process (binary) │
│  Chạy script test tải  │
└────────────────────────┘
```

---

## Tech Stack Chi Tiết

| Layer | Công nghệ | Lý do chọn |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast HMR, không overkill |
| **Styling** | TailwindCSS + shadcn/ui | Đẹp, nhất quán, có sẵn component |
| **HTTP Client** | Axios | Quen thuộc, dễ cấu hình interceptors |
| **Chart** | Recharts | Nhẹ, dễ dùng với React |
| **WebSocket Client** | socket.io-client | Realtime log/chart từ k6 |
| **Backend** | Node.js + Express.js | Nhanh setup, dễ mở rộng |
| **WebSocket Server** | Socket.io | Đẩy kết quả k6 realtime lên FE |
| **Load Engine** | k6 (Grafana) | Industry standard, script bằng JS |
| **ORM** | Sequelize + sequelize-cli | Migration tự động, hỗ trợ MySQL tốt |
| **Database** | MySQL 8 | Phổ biến, phù hợp production, team quen dùng |
| **Process Manager** | child_process (Node built-in) | Spawn k6 process từ backend |
| **Container** | Docker + docker-compose | Đóng gói cho cả team dùng chung |

---

## Cấu trúc thư mục dự án

```
tool-omni-test/
├── frontend/                   # React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── RequestBuilder/     # Giao diện nhập API request
│   │   │   ├── AssertEditor/       # Cấu hình assertion rules
│   │   │   ├── EnvManager/         # Quản lý biến môi trường
│   │   │   ├── LoadTestConfig/     # Cấu hình CCU, ramp-up
│   │   │   ├── RealtimeChart/      # Biểu đồ RPS/Latency via Socket
│   │   │   ├── CollectionTree/     # Sidebar danh sách collection
│   │   │   └── ReportExport/       # Xuất PDF/HTML
│   │   ├── pages/
│   │   │   ├── FunctionalTest.tsx  # Trang test chức năng
│   │   │   ├── LoadTest.tsx        # Trang test tải
│   │   │   ├── History.tsx         # Lịch sử chạy
│   │   │   └── Collections.tsx     # Quản lý collection
│   │   ├── hooks/
│   │   │   ├── useSocket.ts        # Hook kết nối Socket.io
│   │   │   └── useEnvVars.ts       # Hook quản lý env vars
│   │   ├── store/                  # Zustand state management
│   │   └── lib/
│   │       └── axios.ts            # Axios instance config
│   └── package.json
│
├── backend/                    # Express.js Server
│   ├── src/
│   │   ├── routes/                     # Lớp 1: Định nghĩa endpoint, gắn middleware
│   │   │   ├── proxy.route.js          # Route: POST /api/v1/proxy/execute
│   │   │   ├── collection.route.js     # Route: CRUD /api/v1/collections
│   │   │   ├── request.route.js        # Route: CRUD /api/v1/requests
│   │   │   ├── history.route.js        # Route: GET /api/v1/history
│   │   │   ├── loadtest.route.js       # Route: POST /api/v1/loadtest/start
│   │   │   └── environment.route.js    # Route: CRUD /api/v1/environments
│   │   │
│   │   ├── controllers/                # Lớp 2: Nhận request, validate, gọi service, trả response
│   │   │   ├── proxy.controller.js     # Xử lý request proxy, trả về response chuẩn
│   │   │   ├── collection.controller.js
│   │   │   ├── request.controller.js
│   │   │   ├── history.controller.js
│   │   │   ├── loadtest.controller.js
│   │   │   └── environment.controller.js
│   │   │
│   │   ├── services/                   # Lớp 3: Logic nghiệp vụ, không biết DB
│   │   │   ├── proxy.service.js        # Gọi target API bằng axios, đo response time
│   │   │   ├── auth.service.js         # Auth Automator: login, extract token
│   │   │   ├── k6.service.js           # Spawn k6 process, parse stdout
│   │   │   ├── report.service.js       # Tạo PDF/HTML báo cáo
│   │   │   └── env.service.js          # Inject biến môi trường vào request
│   │   │
│   │   ├── repositories/               # Lớp 4: Tương tác DB, thuần SQL/Sequelize
│   │   │   ├── collection.repository.js
│   │   │   ├── request.repository.js
│   │   │   ├── history.repository.js
│   │   │   └── environment.repository.js
│   │   │
│   │   ├── models/                     # Lớp 5: Định nghĩa bảng Sequelize + comment cột
│   │   │   ├── Collection.js
│   │   │   ├── Request.js
│   │   │   ├── TestHistory.js
│   │   │   └── Environment.js
│   │   │
│   │   ├── migrations/                 # Auto-generated bởi sequelize-cli
│   │   │   └── YYYYMMDD-create-*.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── validate.middleware.js  # Validate request body (dùng Joi/Zod)
│   │   │   └── errorHandler.middleware.js  # Global error handler → response chuẩn
│   │   │
│   │   ├── socket/
│   │   │   └── k6.socket.js            # Emit realtime data lên FE
│   │   │
│   │   ├── config/
│   │   │   ├── database.js             # Sequelize connection config
│   │   │   └── env.js                  # Load .env variables
│   │   └── app.js
│   └── package.json
│
├── k6-scripts/                 # Template k6 scripts
│   └── load-template.js
│
├── docker-compose.yml
└── README.md
```

---

## Database Schema (MySQL via Sequelize)

> [!NOTE]
> **Auto Migrate:** Dùng `sequelize-cli` để quản lý migration. Khi thêm cột mới, chỉ cần tạo file migration mới (`npx sequelize-cli migration:generate --name add-xxx-to-yyy`) — **không đụng đến production data**. Migration tự chạy khi deploy qua lệnh `npx sequelize-cli db:migrate`.

```javascript
// models/Environment.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Environment', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:      { type: DataTypes.STRING,  allowNull: false, comment: 'Tên môi trường: Dev / Staging / Production' },
    variables: { type: DataTypes.JSON,    allowNull: true,  comment: 'Key-value biến môi trường, VD: { BASE_URL: "...", TOKEN: "..." }' },
    createdAt: { type: DataTypes.DATE,    comment: 'Thời điểm tạo bản ghi' },
    updatedAt: { type: DataTypes.DATE,    comment: 'Thời điểm cập nhật gần nhất' },
  }, { tableName: 'environments', comment: 'Lưu các môi trường test (Dev/Staging/Prod) và biến tương ứng' });
};

// models/Collection.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Collection', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING,  allowNull: false, comment: 'Tên nhóm API, VD: "Auth Module", "Product API"' },
    description: { type: DataTypes.TEXT,    allowNull: true,  comment: 'Mô tả mục đích của collection' },
    createdAt:   { type: DataTypes.DATE,    comment: 'Thời điểm tạo' },
    updatedAt:   { type: DataTypes.DATE,    comment: 'Thời điểm cập nhật' },
  }, { tableName: 'collections', comment: 'Nhóm các API request theo project/module' });
};

// models/Request.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Request', {
    id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    collection_id: { type: DataTypes.INTEGER, allowNull: false, comment: 'FK → collections.id' },
    name:          { type: DataTypes.STRING,  allowNull: false, comment: 'Tên request, VD: "Login API", "Get User Profile"' },
    method:        { type: DataTypes.ENUM('GET','POST','PUT','PATCH','DELETE'), allowNull: false, comment: 'HTTP method' },
    url:           { type: DataTypes.TEXT,    allowNull: false, comment: 'URL đầy đủ hoặc có biến {{BASE_URL}}/path' },
    headers:       { type: DataTypes.JSON,    allowNull: true,  comment: 'Object chứa các header, VD: { Authorization: "Bearer {{token}}" }' },
    params:        { type: DataTypes.JSON,    allowNull: true,  comment: 'Query params dạng key-value' },
    body:          { type: DataTypes.JSON,    allowNull: true,  comment: 'Request body (chỉ dùng cho POST/PUT/PATCH)' },
    auth_config:   { type: DataTypes.JSON,    allowNull: true,  comment: 'Cấu hình Auth Automator: { type, loginUrl, loginBody, tokenPath }' },
    assertions:    { type: DataTypes.JSON,    allowNull: true,  comment: 'Danh sách assertion rules: [{ type, op, expected }]' },
    createdAt:     { type: DataTypes.DATE,    comment: 'Thời điểm tạo' },
    updatedAt:     { type: DataTypes.DATE,    comment: 'Thời điểm cập nhật' },
  }, { tableName: 'requests', comment: 'Lưu từng API request đã cấu hình' });
};

// models/TestHistory.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TestHistory', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    request_id:   { type: DataTypes.INTEGER, allowNull: true,  comment: 'FK → requests.id. NULL nếu là load test standalone' },
    type:         { type: DataTypes.ENUM('functional','load'), allowNull: false, comment: 'Loại test: functional (kiểm thử chức năng) | load (kiểm thử tải)' },
    status:       { type: DataTypes.ENUM('pass','fail','error'), allowNull: false, comment: 'Kết quả tổng: pass / fail / error (lỗi hệ thống)' },
    duration:     { type: DataTypes.INTEGER, allowNull: false, comment: 'Thời gian phản hồi tính bằng ms' },
    status_code:  { type: DataTypes.INTEGER, allowNull: true,  comment: 'HTTP status code trả về từ target API' },
    response:     { type: DataTypes.JSON,    allowNull: true,  comment: 'Raw response body (cắt bớt nếu > 100KB)' },
    assert_result:{ type: DataTypes.JSON,    allowNull: true,  comment: 'Kết quả chi tiết từng assertion: [{ rule, pass, actual }]' },
    load_summary: { type: DataTypes.JSON,    allowNull: true,  comment: 'Tổng hợp load test: { rps, p95, p99, errorRate }' },
    createdAt:    { type: DataTypes.DATE,    comment: 'Thời điểm chạy test' },
    updatedAt:    { type: DataTypes.DATE,    comment: 'Thời điểm cập nhật' },
  }, { tableName: 'test_histories', comment: 'Lịch sử các lần chạy test để so sánh hiệu năng qua từng Sprint' });
};
```

---

## Chi tiết từng Module

### Module 1: Request Builder + Proxy

**Vấn đề cần giải quyết:** Browser không thể gọi thẳng sang API khác do CORS. Solution: tất cả request đi qua backend proxy.

**Flow:**
```
FE gửi config request → POST /api/proxy/execute
Backend gọi target API bằng axios → Trả response về FE
FE hiển thị status code, headers, body, response time
```

**API Contract:**
```
POST /api/proxy/execute
Body: {
  method: "POST",
  url: "https://api.example.com/login",
  headers: { "Content-Type": "application/json" },
  body: { "email": "...", "password": "..." },
  envId: 1   // Để inject biến môi trường
}

Response: {
  statusCode: 200,
  headers: { ... },
  body: { ... },
  responseTime: 123,  // ms
  assertResults: [{ rule: "status==200", pass: true }]
}
```

---

### Module 2: Auth Automator

**Mục đích:** Tự động login trước khi chạy request chính, inject token vào header.

**Config lưu trong `authConfig` của Request:**
```json
{
  "type": "bearer",
  "loginUrl": "https://api.example.com/auth/login",
  "loginBody": { "email": "{{TEST_EMAIL}}", "password": "{{TEST_PASS}}" },
  "tokenPath": "data.access_token"   // JSONPath để lấy token từ response
}
```

**Flow xử lý trong `auth.service.js`:**
1. Đọc `authConfig` từ request
2. Gọi `loginUrl` với `loginBody` (sau khi inject env vars)
3. Extract token theo `tokenPath` (dùng lodash `_.get`)
4. Tự động thêm `Authorization: Bearer <token>` vào request chính

---

### Module 3: Assert Engine

**Các loại assertion hỗ trợ:**

| Type | Mô tả | Ví dụ config |
|---|---|---|
| `status` | So sánh HTTP status code | `{ type: "status", op: "eq", expected: 200 }` |
| `responseTime` | Kiểm tra thời gian phản hồi | `{ type: "responseTime", op: "lt", expected: 500 }` |
| `jsonPath` | Kiểm tra giá trị trong body | `{ type: "jsonPath", path: "$.data.id", op: "exists" }` |
| `schema` | Validate JSON Schema | `{ type: "schema", schema: { ... } }` |

---

### Module 4: Load Testing (k6 Integration)

**Flow:**
```
FE gửi cấu hình CCU → POST /api/loadtest/start
Backend tạo k6 script động → Spawn k6 process
k6 chạy → stdout output → parse → emit qua Socket.io
FE nhận data qua socket → Cập nhật chart realtime
```

**k6 Script Template được generate động:**
```javascript
// k6-scripts/generated/<testId>.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: {{VU_COUNT}} },   // Ramp-up
    { duration: '1m',  target: {{VU_COUNT}} },   // Sustained
    { duration: '10s', target: 0 },              // Ramp-down
  ],
};

export default function () {
  const res = http.{{METHOD}}('{{URL}}', {{BODY}}, {
    headers: {{HEADERS}},
  });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

**Socket events:**
```
// Server → Client
socket.emit('k6:progress', { rps, p95, p99, errorRate, timestamp })
socket.emit('k6:done', { summary })
socket.emit('k6:error', { message })
```

---

### Module 5: Environment Manager

**Hỗ trợ variable substitution:**
- Biến dạng `{{VARIABLE_NAME}}` được inject vào URL, Headers, Body trước khi gửi
- Ưu tiên: Request-level override > Environment variables

**Ví dụ:**
```
URL: {{BASE_URL}}/users/{{USER_ID}}
→ Sau inject: https://api.dev.example.com/users/42
```

---

### Module 6: Export Report

**Sử dụng thư viện:**
- **PDF:** `puppeteer` (render HTML → PDF)
- **HTML:** Template handlebars với biểu đồ embedded (base64 PNG từ Recharts)

**Nội dung báo cáo:**
- Thông tin request, môi trường, ngày chạy
- Bảng kết quả từng assertion
- Biểu đồ RPS/Latency (nếu là load test)
- So sánh với lần chạy trước (từ History)

---

### Module 7: Scenario / Flow Runner *(Bài toán mới)*

> **Bài toán:** Đăng ký tài khoản → Đăng nhập lấy token → Dùng token gọi API tiếp theo — tất cả chạy tự động tuần tự trong 1 lần bấm Run.

**Khái niệm:**
- **Scenario** = tập hợp nhiều **Step** chạy tuần tự
- Mỗi Step là 1 Request đã lưu trong Collection
- Kết quả (response) của Step trước có thể **extract ra biến** và inject vào Step sau

**Ví dụ thực tế:**
```
Step 1: POST /auth/register  → body: { email, password }
Step 2: POST /auth/login     → body: { email, password }
                               extract: token = response.data.access_token
Step 3: GET  /users/me       → header: Authorization = "Bearer {{token}}"
Step 4: PUT  /users/profile  → header: Authorization = "Bearer {{token}}"
                               body: { name: "Test User" }
```

**Cấu hình Step (lưu trong DB):**
```json
{
  "stepName": "Login",
  "requestId": 5,
  "extractors": [
    {
      "variableName": "token",
      "source": "body",
      "path": "data.access_token"
    },
    {
      "variableName": "userId",
      "source": "body",
      "path": "data.user.id"
    }
  ],
  "assertions": [
    { "type": "status", "op": "eq", "expected": 200 }
  ]
}
```

**Flow xử lý trong `scenario.service.js`:**
1. Load danh sách Steps theo thứ tự `order`
2. Khởi tạo `scenarioContext = {}` — kho chứa biến dùng chung
3. Với mỗi Step:
   - Inject biến từ `scenarioContext` vào URL/Headers/Body
   - Gọi proxy service thực thi request
   - Chạy assertions, ghi kết quả
   - Chạy extractors: lấy giá trị từ response → lưu vào `scenarioContext`
   - Nếu Step fail + `stopOnError: true` → dừng toàn bộ scenario
4. Trả về kết quả từng Step + tổng kết

**API Contract:**
```
POST /api/v1/scenarios/:id/run
Response: {
  scenarioId: 1,
  status: "pass" | "fail",
  steps: [
    { stepName: "Register", status: "pass", duration: 120, statusCode: 201 },
    { stepName: "Login",    status: "pass", duration: 89,  statusCode: 200,
      extractedVars: { token: "eyJhbGc...", userId: 42 } },
    { stepName: "Get Profile", status: "pass", duration: 56, statusCode: 200 }
  ],
  totalDuration: 265
}
```

**DB Model bổ sung:**
```javascript
// models/Scenario.js
// Bảng lưu kịch bản test gồm nhiều bước tuần tự
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Scenario', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    collection_id:{ type: DataTypes.INTEGER, allowNull: false, comment: 'FK → collections.id' },
    name:         { type: DataTypes.STRING,  allowNull: false, comment: 'Tên kịch bản, VD: "Luồng đăng ký → đăng nhập"' },
    stop_on_error:{ type: DataTypes.BOOLEAN, defaultValue: true, comment: 'Dừng toàn bộ scenario nếu 1 step bị lỗi' },
    steps:        { type: DataTypes.JSON,    allowNull: false, comment: 'Mảng các bước: [{ order, requestId, extractors, assertions }]' },
    createdAt:    { type: DataTypes.DATE,    comment: 'Thời điểm tạo' },
    updatedAt:    { type: DataTypes.DATE,    comment: 'Thời điểm cập nhật' },
  }, { tableName: 'scenarios', comment: 'Kịch bản test nhiều API tuần tự, hỗ trợ truyền biến giữa các bước' });
};
```

---

### Module 8: Parallel Runner *(Bài toán mới)*

> **Bài toán:** Gọi 3-4 API cùng lúc (song song) và xem kết quả từng cái — giả lập nhiều client gọi đồng thời, hoặc test các API độc lập nhanh hơn.

**2 mode chạy:**

| Mode | Mô tả | Use case |
|---|---|---|
| **Parallel** | Gọi tất cả API cùng lúc (`Promise.all`) | Test các API độc lập nhau |
| **Race** | Gọi cùng lúc, lấy kết quả API nào về trước | So sánh tốc độ các endpoint |

**Flow xử lý trong `parallel.service.js`:**
```javascript
// Chạy song song - Promise.all, không cancel nếu 1 cái fail
const results = await Promise.allSettled(
  requests.map(req => proxyService.execute(req))
);
// Trả về kết quả từng request kèm thứ tự hoàn thành
```

**API Contract:**
```
POST /api/v1/parallel/run
Body: {
  mode: "parallel" | "race",
  requestIds: [1, 5, 12, 7]
}
Response: {
  mode: "parallel",
  results: [
    { requestId: 1, name: "Get Products",  status: "pass", statusCode: 200, duration: 120 },
    { requestId: 5, name: "Get Categories",status: "pass", statusCode: 200, duration: 89  },
    { requestId: 12,name: "Get Banners",   status: "fail", statusCode: 500, duration: 340 },
    { requestId: 7, name: "Get Config",    status: "pass", statusCode: 200, duration: 67  }
  ],
  completedOrder: [7, 5, 1, 12]  // Thứ tự về đích
}
```

---

### Module 9: Data-driven Testing *(Bài toán mới)*

> **Bài toán:** Test 1 API (thêm/sửa/xóa) với nhiều bộ dữ liệu khác nhau. Mỗi bộ data có thể là case hợp lệ hoặc case lỗi (kiểu sai, thiếu field bắt buộc, giá trị âm...).

**Cách hoạt động:**
- Người dùng định nghĩa 1 **Test Matrix** cho API (ví dụ: POST /products)
- Mỗi hàng trong matrix = 1 bộ body/params khác nhau + expected result
- Hệ thống chạy lần lượt từng hàng và so sánh kết quả thực tế vs expected

**Ví dụ Test Matrix cho POST /products:**

| # | Tên case | body.name | body.price | body.category_id | Expected Status | Expected Error |
|---|---|---|---|---|---|---|
| 1 | Thêm sản phẩm hợp lệ | "Áo thun" | 150000 | 1 | 201 | — |
| 2 | Thiếu tên (bắt buộc) | *(bỏ trống)* | 150000 | 1 | 422 | `name: required` |
| 3 | Giá âm (không hợp lệ) | "Quần" | -1 | 1 | 422 | `price: min 0` |
| 4 | Sai kiểu (price là string) | "Giày" | "abc" | 1 | 422 | `price: must be number` |
| 5 | category_id không tồn tại | "Túi" | 200000 | 9999 | 404 | — |

**Validate kiểu dữ liệu phía tool (pre-check trước khi gửi):**
```javascript
// Dùng Joi để validate body trước khi gửi request
// Tool có thể phát hiện lỗi format TRƯỚC KHI gọi API
const schema = Joi.object({
  name:        Joi.string().required(),      // string, bắt buộc
  price:       Joi.number().min(0).required(), // number >= 0, bắt buộc
  category_id: Joi.number().integer().required(), // integer, bắt buộc
});
const { error } = schema.validate(rowData);
// error → hiển thị "Pre-check FAIL" mà không cần gọi API
```

**Cấu hình Test Matrix lưu trong DB:**
```javascript
// models/DataDrivenTest.js
// Bảng lưu bộ test data nhiều case cho 1 API
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('DataDrivenTest', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    request_id:  { type: DataTypes.INTEGER, allowNull: false, comment: 'FK → requests.id — API cần test' },
    name:        { type: DataTypes.STRING,  allowNull: false, comment: 'Tên bộ test, VD: "Test thêm sản phẩm"' },
    joi_schema:  { type: DataTypes.JSON,    allowNull: true,  comment: 'Schema Joi để pre-validate body trước khi gửi' },
    test_cases:  { type: DataTypes.JSON,    allowNull: false, comment: 'Mảng các case: [{ caseName, body, params, expectedStatus, expectedCode }]' },
    createdAt:   { type: DataTypes.DATE,    comment: 'Thời điểm tạo' },
    updatedAt:   { type: DataTypes.DATE,    comment: 'Thời điểm cập nhật' },
  }, { tableName: 'data_driven_tests', comment: 'Test 1 API với nhiều bộ dữ liệu khác nhau, hỗ trợ validate kiểu trước khi gửi' });
};
```

**Kết quả hiển thị dạng bảng:**
```
┌───┬──────────────────────────┬───────────┬──────────┬────────────┬────────┐
│ # │ Tên case                 │ Pre-check │ Status   │ Assert     │ Result │
├───┼──────────────────────────┼───────────┼──────────┼────────────┼────────┤
│ 1 │ Thêm sản phẩm hợp lệ    │ ✅ PASS   │ 201      │ ✅ PASS    │ ✅ PASS│
│ 2 │ Thiếu tên (bắt buộc)    │ ❌ FAIL   │ —        │ —          │ ❌ FAIL│
│ 3 │ Giá âm (không hợp lệ)   │ ❌ FAIL   │ —        │ —          │ ❌ FAIL│
│ 4 │ Sai kiểu price=string    │ ❌ FAIL   │ —        │ —          │ ❌ FAIL│
│ 5 │ category_id không tồn tại│ ✅ PASS   │ 404      │ ✅ PASS    │ ✅ PASS│
└───┴──────────────────────────┴───────────┴──────────┴────────────┴────────┘
```

**API Contract:**
```
POST /api/v1/data-driven/:id/run
Response: {
  testName: "Test thêm sản phẩm",
  total: 5, pass: 2, fail: 3,
  results: [
    { case: 1, caseName: "Hợp lệ",  preCheck: "pass", statusCode: 201, assertPass: true,  result: "pass" },
    { case: 2, caseName: "Thiếu name", preCheck: "fail", error: "name is required", result: "fail" },
    ...
  ]
}
```

---

## Chuẩn tài liệu API

> [!NOTE]
> **Mọi API trong project đều phải document theo template dưới đây.** File lưu tại `docs/api/<module-name>.md`.

```markdown
# [TÊN API]

## 📝 Thông tin chung
- **Domain**: `{{BASE_URL}}` (Ví dụ: `http://localhost:5000`)
- **Endpoint**: `/api/v1/resource`
- **Method**: `GET | POST | PUT | DELETE`
- **Auth Required**: `Yes | No` (Bearer Token)

---

## 📥 Request

### 1. Header
| Key | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer {{token}}` | JWT Token (nếu Auth=Yes) |
| `Content-Type` | `application/json` | Định dạng dữ liệu |

### 2. Params (Query Parameters)
| Tham số | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `page` | `number` | Không | Trang hiện tại (mặc định 1) |
| `limit` | `number` | Không | Số bản ghi trên mỗi trang |

### 3. Body (JSON)
| Trường | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Có | Tên hiển thị |
| `category_id` | `number` | Có | ID của danh mục |

---

## 📤 Response

### 1. Success (200 OK / 201 Created)
​```json
{
  "status": "success",
  "code": "SUCCESS",
  "message": "Thành công",
  "data": { "id": 1, "name": "Example" },
  "trace_id": "550e8400-e29b-41d4-a716-446655440000"
}
​```

### 2. Error Cases

#### 400 Bad Request
​```json
{ "status": "fail", "code": "BAD_REQUEST", "message": "Tham số không hợp lệ" }
​```

#### 401 Unauthorized
​```json
{ "status": "fail", "code": "UNAUTHORIZED", "message": "Vui lòng đăng nhập để thực hiện tác vụ này" }
​```

#### 422 Unprocessable Entity
​```json
{
  "status": "fail",
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không vượt qua vòng kiểm tra",
  "data": { "email": ["Email không đúng định dạng"] }
}
​```

#### 500 Internal Server Error
​```json
{
  "status": "error",
  "message": "Đã có lỗi xảy ra, vui lòng thử lại sau",
  "trace_id": "550e8400-e29b-41d4-a716-446655440000"
}
​```
```

---

## API Endpoints Backend

> [!NOTE]
> Tất cả endpoints theo prefix `/api/v1/`. Mỗi endpoint có file doc riêng tại `docs/api/`.

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/v1/proxy/execute` | No | Thực thi 1 request qua proxy |
| GET | `/api/v1/collections` | No | Lấy danh sách collection |
| POST | `/api/v1/collections` | No | Tạo collection mới |
| PUT | `/api/v1/collections/:id` | No | Cập nhật collection |
| DELETE | `/api/v1/collections/:id` | No | Xoá collection |
| GET | `/api/v1/collections/:id/requests` | No | Lấy requests trong collection |
| POST | `/api/v1/requests` | No | Tạo/lưu request |
| PUT | `/api/v1/requests/:id` | No | Cập nhật request |
| DELETE | `/api/v1/requests/:id` | No | Xoá request |
| GET | `/api/v1/environments` | No | Lấy danh sách môi trường |
| POST | `/api/v1/environments` | No | Tạo môi trường |
| PUT | `/api/v1/environments/:id` | No | Cập nhật môi trường |
| DELETE | `/api/v1/environments/:id` | No | Xoá môi trường |
| GET | `/api/v1/history` | No | Lấy lịch sử test (filter: type, date, status) |
| POST | `/api/v1/loadtest/start` | No | Khởi chạy k6 load test |
| POST | `/api/v1/loadtest/stop` | No | Dừng k6 |
| GET | `/api/v1/report/:historyId` | No | Xuất báo cáo PDF/HTML |
| GET | `/api/v1/scenarios` | No | Danh sách Scenario |
| POST | `/api/v1/scenarios` | No | Tạo Scenario mới |
| PUT | `/api/v1/scenarios/:id` | No | Cập nhật Scenario |
| POST | `/api/v1/scenarios/:id/run` | No | Chạy Scenario (flow tuần tự) |
| POST | `/api/v1/parallel/run` | No | Chạy nhiều API song song |
| GET | `/api/v1/data-driven` | No | Danh sách Data-driven Test |
| POST | `/api/v1/data-driven` | No | Tạo bộ test data mới |
| POST | `/api/v1/data-driven/:id/run` | No | Chạy Data-driven Test |

---

## Lộ trình triển khai chi tiết

### 🗓️ Tuần 1: MVP — Request Builder hoạt động [DONE]

**Backend:**
- [x] Init project Express + Sequelize + MySQL
- [x] Tạo Models + Migration files (có comment đầy đủ từng cột)
- [x] Implement `proxy.service.js` (gọi target API, đo response time)
- [x] Route `POST /api/proxy/execute`
- [x] Route CRUD Collection + Request

**Frontend:**
- [x] Init Vite + React + TailwindCSS + shadcn/ui
- [x] Layout 3 cột: Sidebar Collections | Request Builder | Response Viewer
- [x] Component `RequestBuilder`: Method selector, URL input, Headers/Params/Body tabs
- [x] Gọi proxy và hiển thị response (status, body, time)

---

### 🗓️ Tuần 2: Auth Automator + Environment + Scenario Runner [IN PROGRESS]

**Backend:**
- [x] Implement `auth_automator.service.js` (tự động login, extract token)
- [x] Integrate auth vào proxy flow
- [ ] Route CRUD Environment
- [x] Model + Migration `Scenario`
- [x] Implement `scenario.service.js` (chạy tuần tự, inject biến qua `scenarioContext`, extractor)
- [ ] Route `POST /api/v1/scenarios/:id/run`
- [ ] Route `POST /api/v1/scenarios/:id/run`

**Frontend:**
- [ ] Component `EnvManager`: Create/Edit môi trường, nhập key-value pairs
- [ ] Dropdown chọn active environment
- [ ] Component `AuthConfig`: UI cấu hình Auth Automator (login URL, token path)
- [ ] Component `AssertEditor`: UI thêm/xoá assertion rules
- [ ] Hiển thị kết quả assert (pass/fail badge) trong Response Viewer
- [ ] Trang `ScenarioBuilder`: Kéo thả/sắp xếp thứ tự Steps, cấu hình extractor cho từng Step
- [ ] Hiển thị kết quả từng Step: status badge, extracted vars, timeline

---

### 🗓️ Tuần 3: Load Testing + Parallel Runner + Data-driven Testing

**Backend:**
- [ ] Install k6 binary (hoặc trong Docker)
- [ ] Implement `k6.service.js`: generate script, spawn process, parse stdout
- [ ] Setup Socket.io server + emit realtime: rps, p95, p99, errorRate
- [ ] Implement `parallel.service.js` (Promise.allSettled, trả thứ tự về đích)
- [ ] Route `POST /api/v1/parallel/run`
- [ ] Model + Migration `DataDrivenTest`
- [ ] Implement `dataDriven.service.js` (Joi pre-validate từng case, gọi proxy, so sánh expected)
- [ ] Route CRUD + run `/api/v1/data-driven`

**Frontend:**
- [ ] Trang `LoadTest.tsx`: Form cấu hình VU, duration, ramp-up
- [ ] Hook `useSocket.ts` kết nối Socket.io
- [ ] Component `RealtimeChart`: Line chart RPS + Latency dùng Recharts
- [ ] Trang `ParallelRunner`: Chọn nhiều request từ collection, chọn mode Parallel/Race, hiển thị waterfall chart kết quả
- [ ] Trang `DataDrivenTest`: Bảng nhập test cases (spreadsheet-like UI), định nghĩa Joi schema, hiển thị kết quả từng row với badge Pre-check / Status / Assert

---

### 🗓️ Tuần 4: Hoàn thiện + Docker

**Backend:**
- [ ] Implement `report.service.js` (PDF/HTML export)
- [ ] Lưu `TestHistory` sau mỗi lần chạy
- [ ] Route GET /api/history với filter (loại test, ngày, status)

**Frontend:**
- [ ] Trang `History.tsx`: Bảng lịch sử, so sánh 2 lần chạy
- [ ] Nút Export Report (download PDF/HTML)
- [ ] Polish UI, responsive, dark mode

**DevOps:**
- [ ] Viết `Dockerfile` cho Frontend + Backend
- [ ] Viết `docker-compose.yml` (fe, be, mysql service + volumes)
- [ ] Viết README hướng dẫn chạy bằng Docker

---

## Open Questions

> [!IMPORTANT]
> **Bạn cần confirm các điểm sau trước khi bắt đầu code:**

1. **Load Engine:** Plan đề xuất k6 — bạn có muốn dùng `autocannon` thay thế không? (`autocannon` chạy thuần Node.js, không cần cài binary riêng, nhưng ít tính năng hơn k6).

2. **State Management:** Dùng **Zustand** hay **React Context** cho FE? (Zustand nhẹ và phù hợp với quy mô tool này).

3. **Auth Automator scope:** Hiện plan là hỗ trợ Bearer Token. Có cần thêm **Cookie-based auth** (session) không?

4. **Multi-user:** Tool này chỉ dùng **single-user** (chạy local) hay cần auth/login để nhiều người dùng chung?

5. **Bắt đầu từ Tuần nào?** Bạn muốn bắt tay vào **Tuần 1 (MVP)** ngay bây giờ không?

---

## 🎨 Nguyên tắc thiết kế UX/UI (Bắt buộc)

Dự án cam kết mang lại trải nghiệm Premium, vì vậy cần tuân thủ tuyệt đối các quy tắc sau:

1. **Tuyệt đối không dùng UI mặc định**: Không sử dụng `alert()`, `confirm()`, `prompt()` của trình duyệt. 
2. **Custom Modal System**: Sử dụng component `Modal.jsx` cho mọi hộp thoại nhập liệu và xác nhận.
3. **Toast Notification**: Sử dụng hệ thống Toast tùy chỉnh (Success/Error/Warning) với animation mượt mà.
4. **Animation**: Tận dụng **Framer Motion** cho các tương tác để tạo cảm giác ứng dụng "sống".
5. **Glassmorphism**: Sử dụng hiệu ứng mờ nền (backdrop-blur) và bo góc lớn cho các khối nổi.
