const express = require('express');
const router = express.Router();
const loadtestController = require('../controllers/loadtest.controller');

router.post('/start', loadtestController.start);
router.post('/stop', loadtestController.stop);

module.exports = router;
