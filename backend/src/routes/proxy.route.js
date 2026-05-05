const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxy.controller');

// POST /api/v1/proxy/execute
router.post('/execute', proxyController.execute);

module.exports = router;
