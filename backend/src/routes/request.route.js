const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');

const { checkEditorPermission } = require('../middlewares/permission.middleware');

router.get('/collection/:collectionId', requestController.getByCollectionId);
router.put('/reorder', checkEditorPermission('request'), requestController.reorder);
router.post('/', checkEditorPermission('request'), requestController.create);
router.put('/:id', checkEditorPermission('request'), requestController.update);
router.delete('/:id', checkEditorPermission('request'), requestController.delete);

module.exports = router;
