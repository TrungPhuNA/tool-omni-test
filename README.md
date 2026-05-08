# OmniTest — Advanced API Testing Tool

OmniTest là công cụ kiểm thử API nội bộ mạnh mẽ, linh hoạt và hiện đại — tương tự **Postman** kết hợp với **k6** — giúp team developer và tester quản lý, thực thi và tự động hóa các HTTP request một cách chuyên nghiệp.

---

## 🤖 Dành cho AI Agent

> **Bắt đầu tại đây**: [`docs/00-ai-context/README.md`](./docs/00-ai-context/README.md)
> File đó sẽ hướng dẫn bạn đọc tài liệu nào tùy theo loại task.

**Đọc nhanh trong 2 phút:**
- Tổng quan dự án → [`docs/00-ai-context/project-overview.md`](./docs/00-ai-context/project-overview.md)
- Toàn bộ quy tắc code → [`docs/01-global-rules/MASTER.md`](./docs/01-global-rules/MASTER.md)
- Sprint đang làm → [`docs/04-features/current-sprint.md`](./docs/04-features/current-sprint.md)

---

## 🚀 Tính năng chính

| # | Tính năng | Trạng thái |
|---|---|---|
| 1 | Request Builder (Postman-like) | ✅ |
| 2 | Collection & Folder Management | ✅ |
| 3 | Environment Variables + `{{VAR}}` injection | ✅ |
| 4 | Pre/Post Request Scripts (OmniScript) | ✅ |
| 5 | Export/Import Collection (JSON) | ✅ |
| 6 | Load Testing (k6 integration) | ✅ |
| 7 | Scenario Runner (API flow tuần tự) | 🚧 |
| 8 | Parallel Runner | ⬜ |
| 9 | Data-driven Testing | ⬜ |

---

## 🛠 Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + Zustand |
| Backend | Node.js + Express.js + Sequelize |
| Database | MySQL 8 |
| Realtime | Socket.io |
| Load Engine | k6 (Grafana) |

---

## 📦 Cài đặt

### Yêu cầu
- Node.js v16+
- MySQL 8
- k6 (cho load testing)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Điền thông tin DB và JWT secret
npx sequelize-cli db:migrate
npm run dev            # Chạy tại http://localhost:5005
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # Điền VITE_API_URL
npm run dev            # Chạy tại http://localhost:5173
```

Chi tiết → [`docs/03-development/setup-guide.md`](./docs/03-development/setup-guide.md)

---

## 📁 Cấu trúc thư mục

```
tool-omni-test/
├── backend/      # Node.js Express Server (port 5005)
├── frontend/     # React App (port 5173)
└── docs/         # Tài liệu dự án (Multi-Agent ready)
    ├── 00-ai-context/    ← Entry point cho AI
    ├── 01-global-rules/  ← Rules cho Node.js, Laravel, React, Angular
    ├── 02-architecture/  ← Kiến trúc, schema DB, API contracts
    ├── 03-development/   ← Setup, folder structure, patterns
    ├── 04-features/      ← Roadmap, sprint, đặc tả tính năng
    ├── 05-api-docs/      ← Tài liệu API chi tiết
    └── 06-testing/       ← Chiến lược test, kịch bản test
```

---

## 📝 Ghi chú

- SQL queries được log trong terminal backend để hỗ trợ debug (dev mode)
- Scripts chạy trong Sandbox với object `omni` / `pm` (Postman-compatible)
- Biến `{{VAR}}` được inject vào URL/Headers/Body trước khi gửi request
- docker exec -it omni-backend node src/scripts/migrate.js

---

*© 2026 OmniTest Team. Built for developers by developers.*
