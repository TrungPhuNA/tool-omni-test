# Sprint hiện tại

> Cập nhật khi bắt đầu / hoàn thành task. AI đọc file này để biết đang làm gì.

---

## Sprint đang chạy

**Mục tiêu Sprint**: Hoàn thiện Scenario Runner (Giai đoạn 3)

---

## Tasks

### Backend
- [ ] Route `POST /api/v1/scenarios/:id/run`
- [ ] Route CRUD `GET/POST/PUT/DELETE /api/v1/scenarios`
- [ ] Hoàn thiện `scenario.service.js` (chạy tuần tự + inject biến qua scenarioContext)
- [ ] Hoàn thiện `scenario.controller.js`

### Frontend
- [ ] Trang `ScenarioBuilder` — Chọn requests từ collection, sắp xếp thứ tự
- [ ] UI cấu hình Extractor cho từng Step (VD: token = step1.response.data.token)
- [ ] Hiển thị kết quả từng Step với status badge, extracted vars, timeline
- [ ] Tích hợp Socket để hiển thị log theo từng bước real-time

---

## Done (Sprint này)

*(Chưa có item nào hoàn thành)*

---

## Blocked / Cần xem xét

*(Ghi lại các điểm đang bị chặn hoặc cần quyết định)*
