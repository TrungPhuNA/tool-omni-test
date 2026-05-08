# Biến môi trường — OmniTest

---

## Backend (`/backend/.env`)

```env
# =============================================
# SERVER CONFIG
# =============================================
PORT=5005
NODE_ENV=development          # development | production

# =============================================
# DATABASE (MySQL)
# =============================================
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_password_here
DB_NAME=api_test_tool

# =============================================
# AUTHENTICATION
# =============================================
JWT_SECRET=your_jwt_secret_here_min_32_chars

# =============================================
# K6 LOAD TESTING
# =============================================
# Đường dẫn đến binary k6 (để trống nếu k6 đã trong PATH)
K6_BINARY_PATH=k6
# Thư mục lưu script k6 được tạo tự động
K6_SCRIPTS_DIR=./k6-scripts/generated
```

## Frontend (`/frontend/.env`)

```env
# =============================================
# API CONNECTION
# =============================================
VITE_API_URL=http://localhost:5005/api/v1
VITE_SOCKET_URL=http://localhost:5005
```

---

## Lưu ý quan trọng

1. **Không commit `.env`** vào git — đã có trong `.gitignore`
2. Tạo `.env.example` để developer mới biết cần set những gì
3. Trong production, set env vars qua server config (không dùng file `.env`)
4. `VITE_` prefix bắt buộc cho biến môi trường Vite (frontend) — không có prefix thì frontend không đọc được

---

## Tạo .env từ example

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```
