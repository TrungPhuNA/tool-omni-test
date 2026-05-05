const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');

router.get('/collection/:collectionId', requestController.getByCollectionId);
router.post('/', requestController.create);
router.put('/:id', requestController.update);
router.delete('/:id', requestController.delete);

module.exports = router;
