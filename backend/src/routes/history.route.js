const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Bảo vệ bằng authMiddleware nếu cần, hiện tại tool đang để mở cho team
router.use(authMiddleware);

router.get('/', historyController.getAll);
router.get('/:id', historyController.getById);
router.delete('/:id', historyController.delete);

module.exports = router;
