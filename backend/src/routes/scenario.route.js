const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenario.controller');

const { checkEditorPermission } = require('../middlewares/permission.middleware');

router.get('/', scenarioController.getAll);
router.get('/collection/:collectionId', scenarioController.getByCollection);
router.post('/', checkEditorPermission('scenario'), scenarioController.create);
router.put('/:id', checkEditorPermission('scenario'), scenarioController.update);
router.delete('/:id', checkEditorPermission('scenario'), scenarioController.delete);
router.post('/:id/run', scenarioController.run);

module.exports = router;
