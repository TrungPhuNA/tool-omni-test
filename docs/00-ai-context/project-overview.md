# Tổng quan dự án: OmniTest

> **Dành cho AI Agent**: Đọc file này để hiểu bức tranh tổng thể của dự án trước khi làm bất kỳ task nào.

---

## 🎯 Dự án là gì?

**OmniTest** là công cụ kiểm thử API nội bộ dành cho team lập trình viên.
Tương tự **Postman** (test chức năng) kết hợp với **k6** (test hiệu năng/tải).

**Mục tiêu**: Giúp developer và tester quản lý, thực thi và tự động hóa các HTTP request một cách chuyên nghiệp, ngay trong môi trường nội bộ của team.

---

## 🛠️ Tech Stack

### Backend
| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Runtime | Node.js (v16+) | Không dùng TypeScript, thuần JS |
| Framework | Express.js | REST API server |
| ORM | Sequelize + sequelize-cli | Migration tự động |
| Database | MySQL 8 | Lưu collections, requests, environments |
| Realtime | Socket.io | Đẩy dữ liệu k6 load test lên FE |
| Load Engine | k6 (Grafana) | Spawn process từ Node.js |
| Sandbox | Node.js `vm` | Chạy pre/post script an toàn |

### Frontend
| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Framework | React 18 + Vite | Fast HMR |
| Styling | TailwindCSS | Utility-first CSS |
| State | Zustand | Global state management |
| HTTP | Axios | Gọi backend API |
| Realtime | socket.io-client | Nhận data từ backend |
| Charts | Recharts | Biểu đồ load test realtime |

---

## 📁 Cấu trúc thư mục gốc

```
tool-omni-test/
├── backend/          # Node.js Express Server (port 5005)
├── frontend/         # React App (port 5173)
├── docs/             # TÀI LIỆU DỰ ÁN (đây)
└── README.md         # Hướng dẫn tổng quan + cài đặt
```

Chi tiết cấu trúc từng folder → [`../03-development/folder-structure.md`](../03-development/folder-structure.md)

---

## 🚀 Tính năng chính

| # | Tính năng | Trạng thái |
|---|---|---|
| 1 | Request Builder (Postman-like) | ✅ Hoàn thành |
| 2 | Collection & Folder Management | ✅ Hoàn thành |
| 3 | Environment Variables | ✅ Hoàn thành |
| 4 | Pre/Post Request Scripts (OmniScript) | ✅ Hoàn thành |
| 5 | Export/Import Collection (JSON) | ✅ Hoàn thành |
| 6 | Load Testing (k6 integration) | ✅ Hoàn thành |
| 7 | Scenario Runner (API flow tuần tự) | 🚧 Đang làm |
| 8 | Parallel Runner | ⬜ Todo |
| 9 | Data-driven Testing | ⬜ Todo |
| 10 | Export Report (PDF/HTML) | ⬜ Todo |

Lộ trình chi tiết → [`../04-features/roadmap.md`](../04-features/roadmap.md)
Sprint hiện tại → [`../04-features/current-sprint.md`](../04-features/current-sprint.md)

---

## 🌐 Môi trường

| Môi trường | Backend URL | Frontend URL |
|---|---|---|
| Local | `http://localhost:5005` | `http://localhost:5173` |
| Production | TBD | TBD |

Biến môi trường chi tiết → [`../03-development/env-variables.md`](../03-development/env-variables.md)

---

## 👥 Đối tượng sử dụng

- **Developer**: Test API trong quá trình phát triển
- **Tester**: Kiểm thử chức năng và hiệu năng hệ thống
- **Team Lead**: Theo dõi kết quả test qua Dashboard

---

## 📌 Điểm đặc biệt cần AI chú ý

1. **Không có Auth** — Tool này dùng nội bộ, không có hệ thống đăng nhập
2. **Sandbox Script** — Pre/Post request script chạy trong `vm` của Node.js, có object `omni` và `pm` (tương thích Postman)
3. **Variable injection** — Biến dạng `{{VARIABLE_NAME}}` được replace vào URL/Headers/Body trước khi gửi request
4. **Socket.io** — Backend và Frontend kết nối realtime để nhận dữ liệu k6 load test
5. **Folder là logical group** — Folder trong Collection chỉ để tổ chức, không ảnh hưởng đến URL của request
