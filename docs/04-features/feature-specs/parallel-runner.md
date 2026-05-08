# Đặc tả: Parallel Runner

---

## Mô tả

Gọi nhiều API cùng lúc (song song) và xem kết quả từng cái — giúp test các API độc lập nhanh hơn, hoặc so sánh tốc độ giữa các endpoint.

---

## Trạng thái

⬜ **Chưa bắt đầu**

---

## 2 Mode chạy

| Mode | Mô tả | Use case |
|---|---|---|
| **Parallel** | Gọi tất cả API cùng lúc (`Promise.allSettled`) — chờ tất cả xong | Test các API độc lập nhau |
| **Race** | Gọi cùng lúc, lấy kết quả API nào về trước — cancel phần còn lại | So sánh tốc độ các endpoint |

---

## Tính năng cần làm

### Backend
- [ ] `parallel.service.js` — Xử lý 2 mode:
  - `parallel`: Dùng `Promise.allSettled()` — không dừng nếu 1 API fail
  - `race`: Dùng `Promise.race()` — lấy kết quả đầu tiên về đích
- [ ] Trả về kèm `completedOrder` — thứ tự các API về đích (waterfall)
- [ ] Route `POST /api/v1/parallel/run`

### Frontend
- [ ] Trang `ParallelRunner`:
  - Chọn nhiều request từ collection
  - Chọn mode: Parallel / Race
  - Hiển thị kết quả dạng waterfall chart (Gantt-like)
  - Badge status cho từng request

---

## Flow xử lý trong `parallel.service.js`

```javascript
// services/parallel.service.js
// Chạy song song - Promise.allSettled, không cancel nếu 1 cái fail
// Ghi lại timestamp để tính completedOrder

const runParallel = async (requestIds) => {
  const startTime = Date.now();
  const completedOrder = [];

  const results = await Promise.allSettled(
    requestIds.map(async (requestId) => {
      const req = await requestRepository.findById(requestId);
      const result = await proxyService.execute(req);
      // Ghi thứ tự về đích (track theo requestId)
      completedOrder.push(requestId);
      return { requestId, ...result };
    })
  );

  return {
    mode: 'parallel',
    results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason),
    completedOrder,
    totalDuration: Date.now() - startTime,
  };
};
```

---

## API Contract

```
POST /api/v1/parallel/run

Body:
{
  "mode": "parallel",    // hoặc "race"
  "requestIds": [1, 5, 12, 7]
}

Response:
{
  "mode": "parallel",
  "results": [
    { "requestId": 1, "name": "Get Products",   "status": "pass", "statusCode": 200, "duration": 120 },
    { "requestId": 5, "name": "Get Categories", "status": "pass", "statusCode": 200, "duration": 89  },
    { "requestId": 12,"name": "Get Banners",    "status": "fail", "statusCode": 500, "duration": 340 },
    { "requestId": 7, "name": "Get Config",     "status": "pass", "statusCode": 200, "duration": 67  }
  ],
  "completedOrder": [7, 5, 1, 12],
  "totalDuration": 340
}
```

---

## Files cần tạo

**Backend:**
- `src/services/parallel.service.js`
- `src/controllers/parallel.controller.js`
- `src/routes/parallel.route.js`

**Frontend:**
- `src/pages/ParallelRunnerPage.jsx`
- `src/components/features/parallel/WaterfallChart.jsx`
