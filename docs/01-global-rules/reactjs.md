# React.js Coding Rules — Chi tiết

> Tóm tắt nhanh → xem [`MASTER.md`](./MASTER.md) phần React.js.

---

## Môi trường & Version

| Thứ | Phiên bản |
|---|---|
| React | 18.x |
| Build tool | Vite 5.x |
| Styling | TailwindCSS 3.x |
| State (Global) | Zustand 4.x |
| State (Server) | React Query (TanStack Query) |
| HTTP | Axios |
| Icons | Lucide React |

---

## Cấu trúc thư mục Frontend

```
frontend/src/
├── components/       # UI components tái sử dụng
│   ├── ui/           # Atomic: Button, Input, Modal, Toast
│   ├── layout/       # Layout: Sidebar, Header
│   └── features/     # Feature-specific: RequestBuilder, CollectionTree
├── pages/            # Trang đầy đủ (kết hợp nhiều components)
├── hooks/            # Custom hooks (tên bắt đầu bằng `use`)
├── store/            # Zustand stores
├── utils/            # Helper functions thuần (không có React code)
└── assets/           # Hình ảnh, fonts
```

---

## Component — Quy tắc

```jsx
// components/features/RequestBuilder/MethodSelector.jsx
// Mục đích: Dropdown chọn HTTP method (GET/POST/PUT/PATCH/DELETE)
// Logic: Đổi màu theo method, emit onChange lên parent

import { useRequestStore } from '../../../store/request.store';

// Màu badge cho từng HTTP method
const METHOD_COLORS = {
  GET:    'text-green-400',
  POST:   'text-blue-400',
  PUT:    'text-yellow-400',
  PATCH:  'text-orange-400',
  DELETE: 'text-red-400',
};

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// Component chọn method — nhận value và onChange từ parent
function MethodSelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`font-mono font-bold text-sm px-3 py-2 rounded bg-gray-800 border border-gray-700 ${METHOD_COLORS[value]}`}
    >
      {METHODS.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  );
}

export default MethodSelector;
```

**Quy tắc Component:**
- Tối đa **200 dòng** — nếu vượt, tách component con
- 1 file = 1 component chính (có thể có sub-components nhỏ cùng file)
- Không mix logic phức tạp với JSX — tách ra custom hook
- File name: **PascalCase** (`MethodSelector.jsx`)

---

## Custom Hook — Quy tắc

```javascript
// hooks/useRequestBuilder.js
// Mục đích: Quản lý toàn bộ state và logic của Request Builder
// Tách ra khỏi component để test và tái sử dụng dễ hơn

import { useState, useCallback } from 'react';
import { useRequestStore } from '../store/request.store';
import { proxyApi } from '../utils/api';

export function useRequestBuilder() {
  const { activeRequest, updateActiveRequest } = useRequestStore();
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Cập nhật một field trong request (tối ưu, không re-render toàn bộ)
  const updateField = useCallback((field, value) => {
    updateActiveRequest({ [field]: value });
  }, [updateActiveRequest]);

  // Gửi request qua backend proxy
  const sendRequest = useCallback(async () => {
    if (!activeRequest.url) return;
    setIsLoading(true);
    try {
      const result = await proxyApi.execute(activeRequest);
      setResponse(result);
    } catch (err) {
      console.error('[useRequestBuilder] Lỗi gửi request:', err);
      setResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [activeRequest]);

  return { activeRequest, response, isLoading, updateField, sendRequest };
}
```

---

## Zustand Store — Quy tắc

```javascript
// store/collection.store.js
// Mục đích: Quản lý state Collections, Folders, và Requests trong sidebar
// Đây là global state — chỉ đặt những gì cần dùng ở nhiều nơi

import { create } from 'zustand';
import { collectionApi } from '../utils/api';

export const useCollectionStore = create((set, get) => ({
  // State
  collections: [],
  isLoading: false,

  // Action: Tải danh sách collections từ API
  fetchCollections: async () => {
    set({ isLoading: true });
    try {
      const data = await collectionApi.getAll();
      set({ collections: data });
    } catch (err) {
      console.error('[collectionStore] Lỗi tải collections:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Action: Thêm collection mới vào state local (sau khi API tạo thành công)
  addCollection: (newCollection) => {
    set((state) => ({
      collections: [...state.collections, newCollection],
    }));
  },
}));
```

---

## Phân loại State — Khi nào dùng gì?

| Loại State | Dùng khi | Tool |
|---|---|---|
| UI local | Modal open/close, input tạm thời | `useState` |
| Global app | Collections, active request, environments | **Zustand** |
| Server data | Danh sách từ API, có cache | **React Query** |
| URL state | Filter, pagination, active tab | URL params |

---

## Styling với TailwindCSS

```jsx
{/* ✅ ĐÚNG: Dùng Tailwind utility classes */}
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
  Gửi Request
</button>

{/* ❌ SAI: Inline style (trừ giá trị dynamic) */}
<button style={{ padding: '8px 16px', backgroundColor: '#2563EB' }}>
  Gửi Request
</button>

{/* ✅ OK: Dynamic value dùng inline style */}
<div style={{ width: `${progress}%` }} className="h-2 bg-blue-500 rounded" />
```

---

## UI Components bắt buộc

```jsx
// ✅ ĐÚNG: Dùng Modal component
import Modal from '../ui/Modal';
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Xác nhận xóa">
  <p>Bạn có chắc muốn xóa collection này?</p>
</Modal>

// ❌ SAI: Dùng confirm() của trình duyệt
if (window.confirm('Bạn có chắc?')) { deleteCollection(); }

// ✅ ĐÚNG: Dùng Toast
import { useToast } from '../hooks/useToast';
const { showToast } = useToast();
showToast({ type: 'success', message: 'Đã tạo collection thành công!' });

// ❌ SAI: Dùng alert()
alert('Đã tạo thành công!');
```

---

## Lưu ý quan trọng

1. **`useCallback` và `useMemo`**: Chỉ dùng khi có performance issue thực sự, không dùng trước khi cần
2. **Key trong list**: Dùng ID từ DB, không dùng index — `key={item.id}` không phải `key={index}`
3. **Error boundary**: Bọc các feature lớn trong ErrorBoundary để tránh crash toàn trang
4. **Lazy loading**: Import page bằng `React.lazy()` để giảm bundle size ban đầu
