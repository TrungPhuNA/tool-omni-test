# Danh sách API Endpoints — OmniTest

> Prefix: `/api/v1/` | Base URL: `http://localhost:5005`

---

## Collections

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/collections` | Lấy toàn bộ collections (kèm folders và requests) |
| POST | `/api/v1/collections` | Tạo collection mới |
| PUT | `/api/v1/collections/:id` | Cập nhật collection |
| DELETE | `/api/v1/collections/:id` | Xóa collection (cascade xóa requests) |

---

## Folders

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/v1/folders` | Tạo folder trong collection |
| PUT | `/api/v1/folders/:id` | Đổi tên folder |
| DELETE | `/api/v1/folders/:id` | Xóa folder |

---

## Requests

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/v1/requests` | Tạo/lưu request mới |
| PUT | `/api/v1/requests/:id` | Cập nhật request |
| DELETE | `/api/v1/requests/:id` | Xóa request |
| PATCH | `/api/v1/requests/:id/move` | Di chuyển request sang folder khác |

---

## Environments

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/environments` | Danh sách environments |
| POST | `/api/v1/environments` | Tạo environment mới |
| PUT | `/api/v1/environments/:id` | Cập nhật (thêm/sửa biến) |
| DELETE | `/api/v1/environments/:id` | Xóa environment |

---

## Proxy (Gửi request)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/v1/proxy/execute` | Thực thi request qua proxy |

---

## Load Testing

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/v1/loadtest/start` | Bắt đầu k6 load test |
| POST | `/api/v1/loadtest/stop` | Dừng load test đang chạy |

---

## History

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/history` | Lấy lịch sử test (filter: type, date, status) |
| GET | `/api/v1/history/:id` | Chi tiết 1 lần chạy |
| DELETE | `/api/v1/history/:id` | Xóa 1 bản ghi lịch sử |

---

## Scenarios (đang phát triển)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/scenarios` | Danh sách scenarios |
| POST | `/api/v1/scenarios` | Tạo scenario mới |
| PUT | `/api/v1/scenarios/:id` | Cập nhật scenario |
| DELETE | `/api/v1/scenarios/:id` | Xóa scenario |
| POST | `/api/v1/scenarios/:id/run` | Chạy scenario (nhiều API tuần tự) |

---

## Import/Export

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/collections/:id/export` | Export collection thành JSON |
| POST | `/api/v1/collections/import` | Import collection từ JSON |

---

## Socket.io Events

| Event | Direction | Dữ liệu |
|---|---|---|
| `k6:progress` | Server → Client | `{ rps, p95, p99, errorRate, timestamp }` |
| `k6:done` | Server → Client | `{ summary }` |
| `k6:error` | Server → Client | `{ message }` |

---

## Parallel Runner (chưa làm)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/v1/parallel/run` | Gọi nhiều API cùng lúc (parallel/race mode) |

---

## Data-driven Testing (chưa làm)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/data-driven` | Danh sách bộ test data |
| POST | `/api/v1/data-driven` | Tạo bộ test data mới |
| PUT | `/api/v1/data-driven/:id` | Cập nhật bộ test |
| DELETE | `/api/v1/data-driven/:id` | Xóa bộ test |
| POST | `/api/v1/data-driven/:id/run` | Chạy Data-driven Test |

---

## Export Report (chưa làm)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/v1/report/:historyId` | Xuất báo cáo PDF/HTML từ test history |
