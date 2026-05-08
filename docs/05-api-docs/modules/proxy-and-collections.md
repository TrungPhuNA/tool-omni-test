# API: Proxy & Collections

---

## POST /api/v1/proxy/execute

**Mô tả**: Thực thi 1 HTTP request bất kỳ qua backend proxy (giải quyết CORS)

### Request Body

```json
{
  "method": "POST",
  "url": "https://api.example.com/auth/login",
  "headers": { "Content-Type": "application/json" },
  "body": { "email": "test@example.com", "password": "123456" },
  "bodyType": "raw",
  "environmentId": 1,
  "preRequestScript": "omni.environment.set('timestamp', Date.now())",
  "postResponseScript": "const token = pm.response.json().data.token; pm.environment.set('token', token);",
  "assertions": [
    { "type": "status", "op": "eq", "expected": 200 }
  ]
}
```

### Response Success (200)

```json
{
  "status": "success",
  "data": {
    "statusCode": 200,
    "headers": { "content-type": "application/json" },
    "body": { "data": { "token": "eyJhbGc..." } },
    "responseTime": 123,
    "assertResults": [
      { "type": "status", "op": "eq", "expected": 200, "actual": 200, "pass": true }
    ],
    "scriptLogs": ["Pre-script: timestamp set to 1234567890"]
  }
}
```

---

## GET /api/v1/collections

**Mô tả**: Lấy toàn bộ collections kèm folders và requests (tree structure)

### Response

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Auth Module",
      "description": "API xác thực người dùng",
      "folders": [
        {
          "id": 1,
          "name": "Login Flow",
          "requests": [
            { "id": 5, "name": "Login", "method": "POST", "url": "{{BASE_URL}}/auth/login" }
          ]
        }
      ],
      "requests": []
    }
  ]
}
```

---

## POST /api/v1/collections

### Request Body

```json
{ "name": "Product API", "description": "Quản lý sản phẩm" }
```

### Response (201)

```json
{ "status": "success", "data": { "id": 2, "name": "Product API", ... } }
```

---

## PUT /api/v1/requests/:id

**Mô tả**: Lưu toàn bộ config của 1 request (sau khi user chỉnh sửa)

### Request Body

```json
{
  "name": "Login API",
  "method": "POST",
  "url": "{{BASE_URL}}/auth/login",
  "headers": { "Content-Type": "application/json" },
  "params": {},
  "body": { "mode": "raw", "raw": "{\"email\":\"{{TEST_EMAIL}}\"}" },
  "preRequestScript": "",
  "postResponseScript": "pm.environment.set('token', pm.response.json().data.token);",
  "docs": "## Login API\nDùng để đăng nhập và lấy access token."
}
```
