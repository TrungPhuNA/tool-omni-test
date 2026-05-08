# API: Environments

---

## GET /api/v1/environments

### Response

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Local",
      "variables": { "BASE_URL": "http://localhost:3000", "TEST_EMAIL": "test@example.com" }
    },
    {
      "id": 2,
      "name": "Staging",
      "variables": { "BASE_URL": "https://staging-api.example.com" }
    }
  ]
}
```

---

## POST /api/v1/environments

### Request Body

```json
{
  "name": "Production",
  "variables": {
    "BASE_URL": "https://api.example.com",
    "API_KEY": "prod_key_here"
  }
}
```

---

## PUT /api/v1/environments/:id

**Mô tả**: Cập nhật toàn bộ variables của environment (replace, không merge)

### Request Body

```json
{
  "name": "Production",
  "variables": {
    "BASE_URL": "https://api.example.com",
    "API_KEY": "new_key_here",
    "TIMEOUT": "30000"
  }
}
```

---

## Cách dùng biến trong request

Sau khi chọn Environment, các biến `{{VAR}}` sẽ được inject tự động:

```
URL:     {{BASE_URL}}/users/{{USER_ID}}
Header:  Authorization: Bearer {{token}}
Body:    { "email": "{{TEST_EMAIL}}", "password": "{{TEST_PASS}}" }
```

**Script set biến (post-response):**
```javascript
// Lưu token sau khi login thành công
const token = pm.response.json().data.access_token;
pm.environment.set('token', token);
```
