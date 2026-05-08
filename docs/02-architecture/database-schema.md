# Database Schema — OmniTest

> Dành cho AI Agent: Đọc file này trước khi làm bất kỳ task liên quan đến DB.

---

## Quy tắc chung

- Mọi thay đổi schema **BẮT BUỘC qua Migration** (xem [`../01-global-rules/git-and-db.md`](../01-global-rules/git-and-db.md))
- Mỗi cột phải có `comment` mô tả trong Sequelize Model
- Tên bảng: **snake_case, số nhiều** (`collections`, `test_histories`)

---

## Sơ đồ quan hệ

```
collections
    │
    ├── folders (collection_id FK)
    │       │
    │       └── requests (folder_id FK, nullable)
    │
    └── requests (collection_id FK)
            │
            ├── test_histories (request_id FK)
            └── scenarios (collection_id FK)
                    └── steps (JSON trong scenarios.steps)

environments (độc lập — chọn khi gửi request)
```

---

## Bảng: `collections`

Nhóm các API request theo dự án/module.

| Cột | Kiểu | Nullable | Mô tả |
|---|---|---|---|
| id | INT PK AI | No | Auto increment |
| name | VARCHAR(255) | No | Tên collection |
| description | TEXT | Yes | Mô tả mục đích |
| created_at | DATETIME | No | Thời điểm tạo |
| updated_at | DATETIME | No | Thời điểm cập nhật |

---

## Bảng: `folders`

Thư mục con trong collection để tổ chức request.

| Cột | Kiểu | Nullable | Mô tả |
|---|---|---|---|
| id | INT PK AI | No | Auto increment |
| collection_id | INT FK | No | FK → collections.id |
| parent_id | INT FK | Yes | FK → folders.id (folder lồng nhau) |
| name | VARCHAR(255) | No | Tên folder |
| order | INT | No | Thứ tự hiển thị (default 0) |
| created_at | DATETIME | No | Thời điểm tạo |
| updated_at | DATETIME | No | Thời điểm cập nhật |

---

## Bảng: `requests`

Lưu từng API request đã cấu hình.

| Cột | Kiểu | Nullable | Mô tả |
|---|---|---|---|
| id | INT PK AI | No | Auto increment |
| collection_id | INT FK | No | FK → collections.id |
| folder_id | INT FK | Yes | FK → folders.id (null = ở gốc collection) |
| name | VARCHAR(255) | No | Tên request (VD: "Login API") |
| method | ENUM | No | GET/POST/PUT/PATCH/DELETE |
| url | TEXT | No | URL đầy đủ hoặc có biến {{BASE_URL}}/path |
| headers | JSON | Yes | Object headers: { "Authorization": "Bearer {{token}}" } |
| params | JSON | Yes | Query params dạng key-value |
| body | JSON | Yes | Request body (POST/PUT/PATCH) |
| body_type | ENUM | Yes | none/raw/form-data/urlencoded |
| auth_config | JSON | Yes | Cấu hình Auth Automator |
| assertions | JSON | Yes | Danh sách assertion rules |
| pre_request_script | TEXT | Yes | Script chạy trước khi gửi request |
| post_response_script | TEXT | Yes | Script chạy sau khi nhận response |
| docs | TEXT | Yes | Ghi chú / mô tả request, hỗ trợ Markdown |
| order | INT | No | Thứ tự trong folder/collection (default 0) |
| created_at | DATETIME | No | Thời điểm tạo |
| updated_at | DATETIME | No | Thời điểm cập nhật |

---

## Bảng: `environments`

Bộ biến môi trường (Dev/Staging/Production).

| Cột | Kiểu | Nullable | Mô tả |
|---|---|---|---|
| id | INT PK AI | No | Auto increment |
| name | VARCHAR(255) | No | Tên môi trường (Dev/Staging/Production) |
| variables | JSON | Yes | Key-value: { BASE_URL: "...", TOKEN: "..." } |
| created_at | DATETIME | No | Thời điểm tạo |
| updated_at | DATETIME | No | Thời điểm cập nhật |

---

## Bảng: `test_histories`

Lịch sử các lần chạy test.

| Cột | Kiểu | Nullable | Mô tả |
|---|---|---|---|
| id | INT PK AI | No | Auto increment |
| request_id | INT FK | Yes | FK → requests.id (null nếu là standalone load test) |
| type | ENUM | No | functional / load |
| status | ENUM | No | pass / fail / error |
| duration | INT | No | Thời gian phản hồi (ms) |
| status_code | INT | Yes | HTTP status code trả về |
| response | JSON | Yes | Raw response body (giới hạn 100KB) |
| assert_result | JSON | Yes | Kết quả từng assertion: [{rule, pass, actual}] |
| load_summary | JSON | Yes | Tổng hợp load test: {rps, p95, p99, errorRate} |
| created_at | DATETIME | No | Thời điểm chạy test |
| updated_at | DATETIME | No | Thời điểm cập nhật |

---

## Bảng: `scenarios` (đang phát triển)

Kịch bản test nhiều API tuần tự.

| Cột | Kiểu | Nullable | Mô tả |
|---|---|---|---|
| id | INT PK AI | No | Auto increment |
| collection_id | INT FK | No | FK → collections.id |
| name | VARCHAR(255) | No | Tên kịch bản (VD: "Login → Get Profile") |
| stop_on_error | BOOLEAN | No | Dừng nếu 1 step thất bại (default: true) |
| steps | JSON | No | Mảng steps: [{order, requestId, extractors, assertions}] |
| created_at | DATETIME | No | Thời điểm tạo |
| updated_at | DATETIME | No | Thời điểm cập nhật |

**Cấu trúc `steps` JSON:**
```json
[
  {
    "order": 1,
    "stepName": "Login",
    "requestId": 5,
    "extractors": [
      { "variableName": "token", "source": "body", "path": "data.access_token" }
    ],
    "assertions": [
      { "type": "status", "op": "eq", "expected": 200 }
    ]
  }
]
```

---

## Lệnh Migration thường dùng

```bash
# Tạo migration mới
npx sequelize-cli migration:generate --name add-xxx-to-yyy

# Chạy tất cả migration chưa chạy
npx sequelize-cli db:migrate

# Xem trạng thái migration
npx sequelize-cli db:migrate:status

# Rollback 1 bước
npx sequelize-cli db:migrate:undo
```
