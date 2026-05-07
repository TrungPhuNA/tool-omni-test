const express = require('express');
const router = express.Router();
const shareController = require('../controllers/share.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public route - No auth required
router.get('/public/:token', shareController.getPublicCollection);

// Protected routes - Auth required
router.post('/', authMiddleware, shareController.createShare);
router.get('/folder/:folderId', authMiddleware, shareController.getSharesByFolder);
router.get('/:collectionId', authMiddleware, shareController.getShares);
router.delete('/:id', authMiddleware, shareController.deleteShare);

module.exports = router;
