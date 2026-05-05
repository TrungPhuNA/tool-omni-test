const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenario.controller');

router.get('/', scenarioController.getAll);
router.get('/collection/:collectionId', scenarioController.getByCollection);
router.post('/', scenarioController.create);
router.put('/:id', scenarioController.update);
router.delete('/:id', scenarioController.delete);
router.post('/:id/run', scenarioController.run);

module.exports = router;
