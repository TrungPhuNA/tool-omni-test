# Đặc tả: Export Report

---

## Mô tả

Xuất kết quả test thành báo cáo PDF hoặc HTML chuyên nghiệp, có biểu đồ hiệu năng để share với team hoặc lưu trữ.

---

## Trạng thái

⬜ **Chưa bắt đầu** (Giai đoạn 4 theo roadmap)

---

## Tính năng cần làm

### Backend
- [ ] `report.service.js`:
  - Load dữ liệu từ `test_histories`
  - Render HTML template (Handlebars/EJS)
  - Convert HTML → PDF bằng Puppeteer
- [ ] Route `GET /api/v1/report/:historyId?format=pdf|html`

### Frontend
- [ ] Nút "Export Report" trong trang History
- [ ] Chọn format: PDF hoặc HTML
- [ ] Download file trực tiếp

---

## Nội dung báo cáo

1. **Header**: Tên request, môi trường, ngày chạy, người chạy
2. **Kết quả tổng quan**: Status (Pass/Fail), response time, status code
3. **Assert results**: Bảng từng rule với pass/fail badge
4. **Load test chart** (nếu là load test): Biểu đồ RPS/Latency embedded dạng base64 PNG
5. **So sánh với lần trước**: Thay đổi so với lần chạy trước cùng request

---

## Tech đề xuất

| Việc | Công nghệ |
|---|---|
| Render HTML → PDF | Puppeteer |
| HTML template | Handlebars hoặc EJS |
| Biểu đồ trong báo cáo | Chart.js (render server-side thành PNG) |

---

## Files cần tạo

**Backend:**
- `src/services/report.service.js`
- `src/controllers/report.controller.js`
- `src/routes/report.route.js`
- `src/templates/report.html` — HTML template báo cáo

**Frontend:**
- Nút Export trong `src/pages/HistoryPage.jsx`
