# 🤖 AI AGENT — ĐIỂM VÀO DUY NHẤT (ENTRY POINT)

> **Bắt buộc đọc file này đầu tiên trước khi làm bất kỳ task nào.**
> File này sẽ chỉ dẫn bạn đọc đúng tài liệu theo từng loại công việc.

---

## 🏗️ Dự án là gì?

**OmniTest** — Công cụ kiểm thử API nội bộ (tương tự Postman + k6).
- **Backend**: Node.js + Express + Sequelize + MySQL
- **Frontend**: React.js + Vite + TailwindCSS + Zustand

Chi tiết → [`project-overview.md`](./project-overview.md)

---

## 📖 Đọc gì khi làm task nào?

### Khi nhận task BẤT KỲ — Đọc trước
1. [`../01-global-rules/MASTER.md`](../01-global-rules/MASTER.md) — Toàn bộ quy tắc code (BẮT BUỘC)
2. [`../03-development/folder-structure.md`](../03-development/folder-structure.md) — Cấu trúc thư mục

---

### Khi làm task Backend (Node.js)
| Việc cần làm | File cần đọc |
|---|---|
| Tạo API mới | [`../01-global-rules/nodejs.md`](../01-global-rules/nodejs.md) |
| Thiết kế DB | [`../02-architecture/database-schema.md`](../02-architecture/database-schema.md) |
| Chuẩn hóa response | [`../02-architecture/api-contracts.md`](../02-architecture/api-contracts.md) |
| Hiểu luồng code | [`../03-development/coding-patterns.md`](../03-development/coding-patterns.md) |
| Xem danh sách API | [`../05-api-docs/api-list.md`](../05-api-docs/api-list.md) |

### Khi làm task Frontend (React)
| Việc cần làm | File cần đọc |
|---|---|
| Tạo component | [`../01-global-rules/reactjs.md`](../01-global-rules/reactjs.md) |
| Hiểu state management | [`../03-development/coding-patterns.md`](../03-development/coding-patterns.md) |
| Xem API để gọi | [`../05-api-docs/api-list.md`](../05-api-docs/api-list.md) |

### Khi cần hiểu tính năng đang làm
| Tính năng | File đặc tả |
|---|---|
| Request Builder | [`../04-features/feature-specs/request-builder.md`](../04-features/feature-specs/request-builder.md) |
| Load Testing | [`../04-features/feature-specs/load-testing.md`](../04-features/feature-specs/load-testing.md) |
| Scenario Runner | [`../04-features/feature-specs/scenario-runner.md`](../04-features/feature-specs/scenario-runner.md) |
| Data-driven Testing | [`../04-features/feature-specs/data-driven-testing.md`](../04-features/feature-specs/data-driven-testing.md) |
| Sprint hiện tại | [`../04-features/current-sprint.md`](../04-features/current-sprint.md) |

### Khi làm Git / DB Migration
→ [`../01-global-rules/git-and-db.md`](../01-global-rules/git-and-db.md)

### Khi cài đặt môi trường lần đầu
→ [`../03-development/setup-guide.md`](../03-development/setup-guide.md)

---

## ⚠️ Quy tắc tối thượng (AI phải nhớ)

```
1. KHÔNG tự ý refactor, đổi cấu trúc, hay tối ưu ngoài yêu cầu
2. KHÔNG xóa comment có sẵn trong code
3. Luôn hỏi lại nếu có điểm chưa rõ
4. Mọi DB change phải qua Migration — cấm sửa DB trực tiếp
5. Pattern: Route → Controller → Service → Repository → Model
```

---

## 🔄 Cách sử dụng lại cho dự án khác

Khi copy folder `docs/` này sang project mới:
1. Sửa [`project-overview.md`](./project-overview.md) — cập nhật tên dự án, stack, mục tiêu
2. Sửa [`../01-global-rules/MASTER.md`](../01-global-rules/MASTER.md) — bật/tắt rules theo stack của dự án mới
3. Sửa [`../02-architecture/database-schema.md`](../02-architecture/database-schema.md) — cập nhật schema mới
4. Sửa [`../04-features/current-sprint.md`](../04-features/current-sprint.md) — cập nhật task hiện tại
5. Xóa `docs/04-features/feature-specs/` và viết lại theo tính năng của dự án mới
