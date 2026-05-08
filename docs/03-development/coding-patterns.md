# Coding Patterns — OmniTest

> Các pattern đang được áp dụng trong dự án. AI cần nắm rõ để viết code nhất quán.

---

## 1. Pattern Backend: Route → Controller → Service → Repository → Model

Xem chi tiết với ví dụ code → [`../01-global-rules/nodejs.md`](../01-global-rules/nodejs.md)

**Tóm tắt nhanh:**
```
Route:       Định nghĩa endpoint, gắn middleware validate
Controller:  try/catch → gọi service → res.json()
Service:     Logic nghiệp vụ, throw AppError nếu lỗi có chủ đích
Repository:  Sequelize queries thuần
Model:       Khai báo bảng + comment từng cột
```

---

## 2. Pattern Variable Injection

Thay thế `{{VAR_NAME}}` trong URL/Headers/Body trước khi gửi request.

```javascript
// utils/variable-inject.js (backend: env.service.js)
// Inject biến từ environment vào template string
// Edge case: nếu biến không tồn tại, giữ nguyên {{VAR}} (không throw error)

const injectVariables = (template, variables = {}) => {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    // Trả về giá trị nếu có, giữ nguyên placeholder nếu không
    return variables[key] !== undefined ? variables[key] : match;
  });
};

// Inject vào object (headers, body)
const injectObjectVariables = (obj, variables) => {
  const json = JSON.stringify(obj);
  return JSON.parse(injectVariables(json, variables));
};
```

---

## 3. Pattern Sandbox Script (Pre/Post request)

```javascript
// services/sandbox.service.js
// Chạy script người dùng trong Node.js vm — môi trường cô lập
// Object `omni` và `pm` đều hỗ trợ để tương thích với Postman scripts

const vm = require('vm');

const runScript = (scriptCode, context) => {
  // Tạo sandbox context: chỉ expose những gì cần thiết
  const sandbox = {
    omni: context.omni,   // OmniTest API
    pm: context.pm,        // Postman-compatible API
    console: {
      log: (...args) => context.logs.push(args.join(' ')),
    },
    // Không expose require, process, fs, etc.
  };

  const script = new vm.Script(scriptCode, { timeout: 5000 });
  vm.createContext(sandbox);
  script.runInContext(sandbox);
};
```

---

## 4. Pattern Global Error Handler (Backend)

```javascript
// middlewares/errorHandler.middleware.js
// Tất cả lỗi đều được xử lý tập trung tại đây
// Controller chỉ cần gọi next(err)

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) console.error('[SERVER ERROR]', err);

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message: err.message || 'Lỗi không xác định',
  });
};
```

---

## 5. Pattern Zustand Store (Frontend)

```javascript
// store/collection.store.js
// Global state cho collections — chia nhỏ theo domain

import { create } from 'zustand';

export const useCollectionStore = create((set, get) => ({
  collections: [],
  isLoading: false,

  // Fetch từ API và cập nhật state
  fetchCollections: async () => {
    set({ isLoading: true });
    try {
      const data = await collectionApi.getAll();
      set({ collections: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Cập nhật optimistic (cập nhật UI trước, rollback nếu API fail)
  updateCollectionLocal: (id, changes) => {
    set(state => ({
      collections: state.collections.map(c =>
        c.id === id ? { ...c, ...changes } : c
      ),
    }));
  },
}));
```

---

## 6. Pattern API Client (Frontend)

```javascript
// utils/api.js
// Tất cả HTTP calls tập trung ở đây — component không dùng axios trực tiếp

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// Request interceptor: log request (dev only)
apiClient.interceptors.request.use((config) => {
  if (import.meta.env.DEV) console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor: chuẩn hóa error
apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Lỗi kết nối';
    throw new Error(message);
  }
);

// Export theo domain
export const collectionApi = {
  getAll: () => apiClient.get('/collections'),
  create: (data) => apiClient.post('/collections', data),
  update: (id, data) => apiClient.put(`/collections/${id}`, data),
  delete: (id) => apiClient.delete(`/collections/${id}`),
};
```

---

## 7. Pattern Toast Notification (Frontend)

```javascript
// hooks/useToast.js — Dùng thay cho alert()/confirm()

const { showToast } = useToast();

// Sử dụng
showToast({ type: 'success', message: 'Đã lưu thành công!' });
showToast({ type: 'error',   message: 'Không thể kết nối server' });
showToast({ type: 'warning', message: 'Biến môi trường chưa được chọn' });
```
