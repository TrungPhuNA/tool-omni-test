# Roadmap — OmniTest

> Lộ trình phát triển tổng thể. Cập nhật sau mỗi Sprint.

---

## Giai đoạn 1: MVP (DONE ✅)

- [x] Dựng khung React + Express + MySQL
- [x] Request Builder UI (Method, URL, Headers, Params, Body)
- [x] Backend Proxy Engine (CORS fix, đo response time)
- [x] Collection & Folder CRUD
- [x] Environment Variables
- [x] Pre/Post Request Script (Sandbox vm)
- [x] Export/Import Collection JSON

---

## Giai đoạn 2: Load Testing (DONE ✅)

- [x] Tích hợp k6 binary
- [x] Generate k6 script động từ config
- [x] Socket.io realtime metrics (RPS, P95, P99, Error Rate)
- [x] Biểu đồ Recharts realtime trên Frontend
- [x] Cấu hình CCU, duration, ramp-up/down

---

## Giai đoạn 3: Advanced Testing (IN PROGRESS 🚧)

- [ ] **Scenario Runner** — Chạy nhiều API tuần tự, truyền biến giữa steps
- [ ] **Parallel Runner** — Gọi nhiều API cùng lúc (Promise.allSettled)
- [ ] **Data-driven Testing** — Test 1 API với nhiều bộ dữ liệu

---

## Giai đoạn 4: Reports & DevOps (TODO ⬜)

- [ ] Export báo cáo PDF/HTML (Puppeteer)
- [ ] Dashboard phân tích hiệu năng (so sánh giữa các lần chạy)
- [ ] Dockerfile cho Backend + Frontend
- [ ] docker-compose.yml (fe + be + mysql)
- [ ] Hướng dẫn triển khai Docker

---

## Tính năng đề xuất (Backlog)

- [ ] Authentication cho multi-user (team dùng chung)
- [ ] Hệ thống Alert khi vượt ngưỡng (Threshold alerts)
- [ ] GraphQL support
- [ ] WebSocket testing
- [ ] CI/CD integration (chạy test tự động khi push code)
