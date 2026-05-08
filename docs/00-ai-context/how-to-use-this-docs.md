# Hướng dẫn: Cách điều hướng trong bộ tài liệu này

> Dành cho AI Agent và Developer mới vào dự án.

---

## Cấu trúc docs/ và ý nghĩa từng thư mục

```
docs/
├── 00-ai-context/       ← Bạn đang ở đây. Entry point, định hướng chung.
├── 01-global-rules/     ← Quy tắc code bắt buộc theo từng ngôn ngữ/stack
├── 02-architecture/     ← Kiến trúc hệ thống, schema DB, chuẩn API
├── 03-development/      ← Hướng dẫn phát triển: cài đặt, folder, patterns
├── 04-features/         ← Đặc tả tính năng, roadmap, sprint hiện tại
├── 05-api-docs/         ← Tài liệu API chi tiết từng endpoint
└── 06-testing/          ← Chiến lược test, kịch bản test
```

---

## Nguyên tắc đọc docs

### 📌 Nguyên tắc 1: Bắt đầu từ MASTER
File [`../01-global-rules/MASTER.md`](../01-global-rules/MASTER.md) là file tổng hợp.
AI chỉ cần đọc file này để biết toàn bộ quy tắc của dự án mà không cần đọc từng file con.
File con (`nodejs.md`, `laravel.md`, etc.) dùng khi cần đọc chi tiết hơn cho 1 stack cụ thể.

### 📌 Nguyên tắc 2: Đọc theo context của task
Không cần đọc toàn bộ docs. Chỉ đọc những file liên quan đến task hiện tại.
Xem bảng điều hướng tại [`README.md`](./README.md).

### 📌 Nguyên tắc 3: Ưu tiên file theo thứ tự số
Folder được đánh số để thể hiện độ ưu tiên:
- `00-ai-context` → Đọc trước nhất
- `01-global-rules` → Đọc thứ hai
- `02-architecture` → Đọc khi cần hiểu hệ thống
- Tiếp theo đọc theo nhu cầu task

---

## Quy ước viết docs trong dự án này

Khi **thêm tài liệu mới**, tuân thủ:

1. **Đặt đúng folder** theo loại nội dung (xem bảng trên)
2. **Không viết trùng** — Nếu đã có thông tin ở file khác, dùng link thay vì copy
3. **Cập nhật entry point** — Nếu thêm file quan trọng, cập nhật bảng điều hướng trong `README.md`
4. **Ngôn ngữ**: Viết bằng tiếng Việt, thuật ngữ kỹ thuật giữ nguyên tiếng Anh

---

## Khi copy docs/ sang dự án khác

### Bước 1: Sửa thông tin dự án
```
docs/00-ai-context/project-overview.md
→ Cập nhật: tên dự án, tech stack, tính năng, URLs
```

### Bước 2: Bật/tắt rules theo stack
```
docs/01-global-rules/MASTER.md
→ Xóa bỏ phần rules của stack không dùng trong dự án mới
→ Giữ lại phần rules của stack đang dùng
```

### Bước 3: Cập nhật kiến trúc
```
docs/02-architecture/system-overview.md     → Vẽ lại sơ đồ
docs/02-architecture/database-schema.md     → Cập nhật schema DB mới
docs/02-architecture/api-contracts.md       → Giữ nguyên nếu format không đổi
```

### Bước 4: Cập nhật môi trường
```
docs/03-development/setup-guide.md          → Cập nhật lệnh cài đặt
docs/03-development/env-variables.md        → Cập nhật danh sách env vars mới
```

### Bước 5: Viết lại tính năng
```
docs/04-features/roadmap.md                 → Roadmap mới
docs/04-features/current-sprint.md          → Sprint hiện tại
docs/04-features/feature-specs/             → Xóa và viết lại tất cả
```

### Bước 6: Cập nhật API docs
```
docs/05-api-docs/api-list.md                → Danh sách API mới
docs/05-api-docs/modules/                   → Xóa và viết lại
```

> Sau 6 bước trên, bộ docs đã sẵn sàng cho AI hiểu dự án mới!
