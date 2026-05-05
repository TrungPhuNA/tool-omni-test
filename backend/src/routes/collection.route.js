const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collection.controller');

router.get('/', collectionController.getAll);
router.post('/', collectionController.create);
router.put('/:id', collectionController.update);
router.delete('/:id', collectionController.delete);

module.exports = router;
