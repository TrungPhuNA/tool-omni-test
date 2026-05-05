const express = require('express');
const router = express.Router();
const environmentController = require('../controllers/environment.controller');

router.get('/', environmentController.getAll);
router.post('/', environmentController.create);
router.put('/:id', environmentController.update);
router.delete('/:id', environmentController.delete);

module.exports = router;
