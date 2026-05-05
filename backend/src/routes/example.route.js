const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/example.controller');

router.get('/request/:requestId', exampleController.getByRequest);
router.post('/', exampleController.create);
router.put('/:id', exampleController.update);
router.delete('/:id', exampleController.delete);

module.exports = router;
