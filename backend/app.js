require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true, // Cho phép origin hiện tại
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Import Routes
const authRoutes = require('./src/routes/auth.route');
const proxyRoutes = require('./src/routes/proxy.route');
const collectionRoutes = require('./src/routes/collection.route');
const folderRoutes = require('./src/routes/folder.route');
const requestRoutes = require('./src/routes/request.route');
const environmentRoutes = require('./src/routes/environment.route');
const scenarioRoutes = require('./src/routes/scenario.route');
const historyRoutes = require('./src/routes/history.route');
const loadtestRoutes = require('./src/routes/loadtest.route');
const exampleRoutes = require('./src/routes/example.route');

// Import Middleware
const authMiddleware = require('./src/middlewares/auth.middleware');

app.use('/api/v1/auth', authRoutes);

// Protected Routes
app.use('/api/v1/proxy', authMiddleware, proxyRoutes);
app.use('/api/v1/collections', authMiddleware, collectionRoutes);
app.use('/api/v1/folders', authMiddleware, folderRoutes);
app.use('/api/v1/requests', authMiddleware, requestRoutes);
app.use('/api/v1/environments', authMiddleware, environmentRoutes);
app.use('/api/v1/scenarios', authMiddleware, scenarioRoutes);
app.use('/api/v1/history', authMiddleware, historyRoutes);
app.use('/api/v1/loadtest', authMiddleware, loadtestRoutes);
app.use('/api/v1/examples', authMiddleware, exampleRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5005;
const { sequelize } = require('./src/models');

sequelize.sync().then(() => {
    console.log('Database synced');
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

module.exports = { app, io };
