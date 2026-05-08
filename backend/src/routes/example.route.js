const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/example.controller');

const { checkEditorPermission } = require('../middlewares/permission.middleware');

router.get('/request/:requestId', exampleController.getByRequest);
router.post('/', checkEditorPermission('example'), exampleController.create);
router.put('/:id', checkEditorPermission('example'), exampleController.update);
router.delete('/:id', checkEditorPermission('example'), exampleController.delete);

module.exports = router;
