const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');

router.post('/', folderController.create);
router.put('/:id', folderController.update);
router.delete('/:id', folderController.delete);

module.exports = router;
