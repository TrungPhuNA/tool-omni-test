# Đặc tả: Data-driven Testing

---

## Mô tả

Test 1 API với nhiều bộ dữ liệu khác nhau. Mỗi bộ dữ liệu là 1 test case với expected result riêng.

**Use case:** Test API thêm sản phẩm với các case: hợp lệ, thiếu field, sai kiểu, giá trị âm...

---

## Trạng thái

⬜ **Chưa bắt đầu**

---

## Tính năng cần làm

### Backend
- [ ] Model + Migration `DataDrivenTest`
- [ ] `dataDriven.service.js`:
  - Validate từng case với Joi schema (pre-check)
  - Gọi proxy API cho từng case
  - So sánh actual vs expected
- [ ] Routes CRUD + run `/api/v1/data-driven`

### Frontend
- [ ] UI bảng nhập test cases (spreadsheet-like)
- [ ] Định nghĩa Joi schema qua UI
- [ ] Hiển thị kết quả: Pre-check badge, Status code, Assert badge

---

## Ví dụ Test Matrix

| # | Case | body.name | body.price | Expected Status |
|---|---|---|---|---|
| 1 | Hợp lệ | "Áo thun" | 150000 | 201 |
| 2 | Thiếu tên | *(rỗng)* | 150000 | 422 |
| 3 | Giá âm | "Quần" | -1 | 422 |
| 4 | Sai kiểu price | "Giày" | "abc" | 422 |

---

## API Response

```json
{
  "testName": "Test thêm sản phẩm",
  "total": 4, "pass": 2, "fail": 2,
  "results": [
    { "case": 1, "caseName": "Hợp lệ",  "preCheck": "pass", "statusCode": 201, "result": "pass" },
    { "case": 2, "caseName": "Thiếu tên","preCheck": "fail", "error": "name is required", "result": "fail" }
  ]
}
```
