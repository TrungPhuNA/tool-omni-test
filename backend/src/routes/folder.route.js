const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');

const { checkEditorPermission } = require('../middlewares/permission.middleware');

router.post('/', checkEditorPermission('folder'), folderController.create);
router.put('/reorder', checkEditorPermission('folder'), folderController.reorder);
router.put('/:id', checkEditorPermission('folder'), folderController.update);
router.delete('/:id', checkEditorPermission('folder'), folderController.delete);

module.exports = router;
