# Cấu trúc thư mục dự án — OmniTest

---

## Tổng quan

```
tool-omni-test/
├── backend/          # Node.js Express Server
├── frontend/         # React.js App
├── docs/             # Tài liệu dự án (bạn đang ở đây)
├── README.md         # Hướng dẫn tổng quan
└── .git/
```

---

## Backend (`/backend`)

```
backend/
├── src/
│   ├── routes/                     # Lớp 1: Định nghĩa endpoint + gắn middleware
│   │   ├── collection.route.js     # CRUD /api/v1/collections
│   │   ├── request.route.js        # CRUD /api/v1/requests
│   │   ├── folder.route.js         # CRUD /api/v1/folders
│   │   ├── environment.route.js    # CRUD /api/v1/environments
│   │   ├── proxy.route.js          # POST /api/v1/proxy/execute
│   │   ├── loadtest.route.js       # POST /api/v1/loadtest/start|stop
│   │   ├── history.route.js        # GET /api/v1/history
│   │   └── scenario.route.js       # CRUD + run /api/v1/scenarios
│   │
│   ├── controllers/                # Lớp 2: Nhận request → gọi service → trả response
│   │   ├── collection.controller.js
│   │   ├── request.controller.js
│   │   ├── folder.controller.js
│   │   ├── environment.controller.js
│   │   ├── proxy.controller.js
│   │   ├── loadtest.controller.js
│   │   ├── history.controller.js
│   │   └── scenario.controller.js
│   │
│   ├── services/                   # Lớp 3: Logic nghiệp vụ
│   │   ├── proxy.service.js        # Gọi target API qua axios, đo response time
│   │   ├── env.service.js          # Inject {{VAR}} vào URL/Headers/Body
│   │   ├── k6.service.js           # Generate k6 script, spawn process, parse output
│   │   ├── sandbox.service.js      # Chạy pre/post script trong vm sandbox
│   │   ├── scenario.service.js     # Chạy nhiều request tuần tự, truyền biến
│   │   └── auth.service.js         # Auto-login, extract token
│   │
│   ├── repositories/               # Lớp 4: Tương tác DB qua Sequelize
│   │   ├── collection.repository.js
│   │   ├── request.repository.js
│   │   ├── folder.repository.js
│   │   ├── environment.repository.js
│   │   └── history.repository.js
│   │
│   ├── models/                     # Lớp 5: Định nghĩa Sequelize model + comment cột
│   │   ├── index.js                # Load tất cả model, khởi tạo Sequelize
│   │   ├── Collection.js
│   │   ├── Request.js
│   │   ├── Folder.js
│   │   ├── Environment.js
│   │   ├── TestHistory.js
│   │   └── Scenario.js
│   │
│   ├── migrations/                 # DB migration files
│   │   └── YYYYMMDD-verb-description.js
│   │
│   ├── middlewares/
│   │   ├── errorHandler.middleware.js  # Global error handler
│   │   └── validate.middleware.js      # Joi validation factory
│   │
│   ├── socket/
│   │   └── k6.socket.js            # Socket.io events cho load test
│   │
│   ├── config/
│   │   ├── database.js             # Sequelize connection config
│   │   └── env.js                  # Load và validate .env variables
│   │
│   ├── scripts/                    # One-time scripts (migration data, seed)
│   │   └── *.js
│   │
│   └── app.js                      # Express app khởi tạo + middleware global
│
├── scratch/                        # File tạm để test/debug (không commit)
├── .env                            # Biến môi trường (không commit)
├── .env.example                    # Template .env cho developer mới
└── package.json
```

---

## Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                     # Atomic components tái sử dụng
│   │   │   ├── Modal.jsx           # Modal dialog tùy chỉnh
│   │   │   ├── Toast.jsx           # Toast notification
│   │   │   ├── Button.jsx          # Button với variants
│   │   │   └── Spinner.jsx         # Loading indicator
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx         # Sidebar chứa collection tree
│   │   │   └── Header.jsx          # Header với environment selector
│   │   │
│   │   └── features/               # Feature-specific components
│   │       ├── collections/        # CollectionTree, CollectionItem
│   │       ├── folders/            # FolderModal, FolderItem
│   │       ├── request-builder/    # RequestBuilder, MethodSelector, TabPanel
│   │       ├── response-viewer/    # ResponseViewer, StatusBadge
│   │       ├── environments/       # EnvManager, EnvSelector
│   │       └── load-test/          # LoadTestConfig, RealtimeChart
│   │
│   ├── pages/                      # Trang đầy đủ
│   │   ├── MainPage.jsx            # Trang chính (Request Builder)
│   │   ├── LoadTestPage.jsx        # Trang Load Testing
│   │   └── HistoryPage.jsx         # Lịch sử test
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useSocket.js            # Kết nối Socket.io, listen events
│   │   ├── useToast.js             # Toast notification system
│   │   └── useRequestBuilder.js    # Logic Request Builder
│   │
│   ├── store/                      # Zustand global state
│   │   ├── collection.store.js     # Collections, folders, requests
│   │   ├── environment.store.js    # Environments, active env
│   │   └── request.store.js        # Active request being edited
│   │
│   ├── utils/                      # Helper functions (không có React code)
│   │   ├── api.js                  # Axios instance + API client methods
│   │   ├── variable-inject.js      # Inject {{VAR}} helper
│   │   └── format.js               # Format date, size, duration...
│   │
│   ├── App.jsx                     # Root component + routing
│   ├── main.jsx                    # Entry point, render App
│   ├── index.css                   # Global styles + Tailwind imports
│   └── App.css                     # App-level styles
│
├── .env                            # Biến môi trường FE (không commit)
├── .env.example
├── vite.config.js                  # Vite configuration
└── package.json
```

---

## Quy tắc đặt tên file

| Loại | Convention | Ví dụ |
|---|---|---|
| React Component | PascalCase.jsx | `RequestBuilder.jsx` |
| Hook | camelCase.js, bắt đầu `use` | `useSocket.js` |
| Store | camelCase.store.js | `collection.store.js` |
| Backend file | camelCase.type.js | `collection.service.js` |
| Migration | YYYYMMDD-verb-noun.js | `20260508-add-docs-to-requests.js` |

---

## Không được commit

```
.env (cả backend và frontend)
backend/scratch/
node_modules/
*.log
k6-scripts/generated/   # Script k6 tự động tạo khi chạy load test
```
