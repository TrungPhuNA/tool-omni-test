# Hướng dẫn cài đặt và chạy local — OmniTest

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản |
|---|---|
| Node.js | v16+ (LTS) |
| npm | v8+ |
| MySQL | 8.x |
| k6 | Latest (cho load testing) |

---

## Bước 1: Clone dự án

```bash
git clone [url-du-an]
cd tool-omni-test
```

---

## Bước 2: Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` (copy từ `.env.example` nếu có):

```env
# Server
PORT=5005
NODE_ENV=development

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=api_test_tool

# Auth
JWT_SECRET=your_secret_key_here

# k6 (đường dẫn binary nếu không có trong PATH)
K6_BINARY_PATH=k6
```

Chạy database migration:

```bash
# Tạo database trước (nếu chưa có)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS api_test_tool;"

# Chạy tất cả migration
npx sequelize-cli db:migrate
```

---

## Bước 3: Cài đặt Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:5005/api/v1
VITE_SOCKET_URL=http://localhost:5005
```

---

## Bước 4: Chạy ứng dụng

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server chạy tại http://localhost:5005
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App chạy tại http://localhost:5173
```

---

## Cài đặt k6 (cho Load Testing)

### macOS
```bash
brew install k6
```

### Windows
```bash
choco install k6
```

### Linux
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

Kiểm tra:
```bash
k6 version
```

---

## Troubleshooting thường gặp

### Lỗi: Port 5005 already in use
```bash
# Tìm process đang dùng port
lsof -i :5005
# Kill process đó
kill -9 <PID>
```

### Lỗi: Cannot connect to MySQL
- Kiểm tra MySQL đang chạy: `mysql.server status`
- Kiểm tra DB_USER, DB_PASS trong `.env`
- Kiểm tra database tồn tại: `SHOW DATABASES;`

### Lỗi: Sequelize migration failed
```bash
# Xem trạng thái các migration
npx sequelize-cli db:migrate:status
# Rollback và chạy lại
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate
```

### Frontend không kết nối được Backend
- Kiểm tra `VITE_API_URL` trong `.env` của frontend
- Đảm bảo backend đang chạy tại đúng port
- Kiểm tra CORS config trong `backend/src/app.js`
