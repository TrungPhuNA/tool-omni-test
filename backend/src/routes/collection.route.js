const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collection.controller');

const { checkEditorPermission } = require('../middlewares/permission.middleware');

router.get('/', collectionController.getAll);
router.post('/', collectionController.create);
router.put('/:id', checkEditorPermission('collection'), collectionController.update);
router.delete('/:id', checkEditorPermission('collection'), collectionController.delete);

module.exports = router;
