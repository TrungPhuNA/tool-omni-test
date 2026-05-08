# API Contracts — Chuẩn Request/Response

> Mọi API trong dự án PHẢI tuân theo format này.

---

## Response Format chuẩn

### Success Response

```json
{
  "status": "success",
  "message": "Thành công",
  "data": { "id": 1, "name": "Example" }
}
```

### Success với Pagination

```json
{
  "status": "success",
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response (4xx — Lỗi client)

```json
{
  "status": "fail",
  "message": "Mô tả lỗi rõ ràng cho người dùng",
  "code": "COLLECTION_NOT_FOUND"
}
```

### Validation Error (422)

```json
{
  "status": "fail",
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    "Tên không được để trống",
    "Method phải là GET, POST, PUT, PATCH hoặc DELETE"
  ]
}
```

### Server Error (5xx)

```json
{
  "status": "error",
  "message": "Đã có lỗi xảy ra, vui lòng thử lại sau"
}
```

---

## HTTP Status Code quy ước

| Code | Khi nào dùng |
|---|---|
| 200 | GET/PUT/PATCH thành công |
| 201 | POST tạo mới thành công |
| 204 | DELETE thành công (không trả body) |
| 400 | Bad Request — format sai, thiếu required field |
| 401 | Unauthorized — chưa đăng nhập |
| 403 | Forbidden — không có quyền |
| 404 | Not Found — resource không tồn tại |
| 409 | Conflict — trùng lặp dữ liệu |
| 422 | Validation Error — dữ liệu không hợp lệ |
| 500 | Internal Server Error |

---

## API Endpoint Format

```
Base URL: http://localhost:5005
Prefix:   /api/v1/

Ví dụ:    POST http://localhost:5005/api/v1/collections
```

---

## Template tài liệu cho mỗi API mới

Khi thêm API mới, tạo hoặc cập nhật file trong `docs/05-api-docs/modules/` theo template:

```markdown
## [METHOD] /api/v1/endpoint

**Mô tả**: Mô tả ngắn gọn chức năng

### Request

Headers:
| Key | Value |
|---|---|
| Content-Type | application/json |

Body:
| Field | Type | Required | Mô tả |
|---|---|---|---|
| name | string | Yes | Tên hiển thị |

### Response Success (200/201)
​```json
{ "status": "success", "data": { ... } }
​```

### Response Error
| Code | Trường hợp |
|---|---|
| 404 | Không tìm thấy |
| 422 | Validation fail |
```
