# Đặc tả: Load Testing (k6 Integration)

---

## Mô tả

Tích hợp công cụ k6 để thực hiện performance/load test. Kết quả được stream realtime qua Socket.io.

---

## Tính năng

### Đã hoàn thành ✅
- Cấu hình Virtual Users (VU), duration, ramp-up/down
- Generate k6 script động từ config
- Spawn k6 process từ backend (child_process)
- Parse stdout k6 → emit qua Socket.io
- Biểu đồ realtime: RPS, P95, P99, Error Rate
- Kết quả summary sau khi kết thúc

### Chưa làm ⬜
- Dừng load test giữa chừng (POST /api/v1/loadtest/stop)
- Lưu kết quả vào test_histories
- Scenario Load Test (nhiều API tuần tự)

---

## Cấu hình Load Test

```json
{
  "requestId": 5,
  "virtualUsers": 50,
  "duration": "1m",
  "stages": [
    { "duration": "30s", "target": 50 },
    { "duration": "1m",  "target": 50 },
    { "duration": "10s", "target": 0  }
  ]
}
```

---

## Socket.io Events

```javascript
// Server → Client
socket.emit('k6:progress', { rps, p95, p99, errorRate, timestamp });
socket.emit('k6:done',     { summary: { requests, errors, duration } });
socket.emit('k6:error',    { message: 'k6 binary not found' });
```

---

## API liên quan

- `POST /api/v1/loadtest/start` — Bắt đầu load test
- `POST /api/v1/loadtest/stop`  — Dừng load test

---

## Files liên quan

**Backend:**
- `src/controllers/loadtest.controller.js`
- `src/services/k6.service.js` — Generate script, spawn process
- `src/socket/k6.socket.js` — Emit realtime events

**Frontend:**
- `src/pages/LoadTestPage.jsx`
- `src/hooks/useSocket.js`
- `src/components/features/load-test/RealtimeChart.jsx`
