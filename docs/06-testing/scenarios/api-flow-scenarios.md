# Kịch bản Test: API Flows

> Di chuyển từ `Scenario_Testing_Plan.md` ngoài root. File gốc giữ lại để tham khảo.

---

## Kịch bản 1: Luồng Authentication → Sử dụng API

**Mục tiêu**: Test luồng đăng nhập lấy token, sau đó dùng token gọi các API tiếp theo.

```
Step 1: POST /auth/login
  Body:     { email: "{{TEST_EMAIL}}", password: "{{TEST_PASS}}" }
  Extract:  token = response.data.access_token
  Assert:   status == 200

Step 2: GET /users/me
  Header:   Authorization: Bearer {{token}}
  Assert:   status == 200, response.data.id exists

Step 3: GET /products
  Header:   Authorization: Bearer {{token}}
  Assert:   status == 200, response.data is array

Step 4: GET /products/:id
  Header:   Authorization: Bearer {{token}}
  Extract:  productId = response.data.id (from step 3)
  Assert:   status == 200

Step 5: POST /cart/add
  Header:   Authorization: Bearer {{token}}
  Body:     { product_id: {{productId}}, quantity: 1 }
  Assert:   status == 201
```

---

## Kịch bản 2: CRUD Collection & Request

```
Step 1: POST /api/v1/collections     → Tạo collection, extract: collectionId
Step 2: POST /api/v1/requests        → Tạo request trong collection
Step 3: GET  /api/v1/collections     → Verify collection xuất hiện trong list
Step 4: PUT  /api/v1/requests/:id    → Cập nhật request
Step 5: DELETE /api/v1/collections/:id → Xóa collection
Step 6: GET  /api/v1/collections     → Verify đã xóa
```

---

## Kịch bản 3: Environment Variables

```
Step 1: POST /api/v1/environments    → Tạo env với BASE_URL
Step 2: POST /api/v1/proxy/execute   → Gửi request dùng {{BASE_URL}}
         Verify: URL được inject đúng giá trị
Step 3: PUT  /api/v1/environments/:id → Thêm biến token
Step 4: POST /api/v1/proxy/execute   → Gửi request dùng {{token}}
         Verify: Header được inject đúng
```

---

## Load Test: OmniTest Self-Test

**Mục tiêu**: Test chính OmniTest dưới tải (dùng k6 để test GET /api/v1/collections)

**Config đề xuất:**
```json
{
  "virtualUsers": 20,
  "duration": "30s",
  "stages": [
    { "duration": "10s", "target": 20 },
    { "duration": "20s", "target": 20 },
    { "duration": "5s",  "target": 0  }
  ]
}
```

**Expected results:**
- P95 < 200ms
- Error rate < 1%
- RPS > 50
