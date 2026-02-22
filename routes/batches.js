/**
 * Batch Routes
 */
const express = require('express');
const router = express.Router();
const BatchController = require('../controllers/batchController');

router.get('/', BatchController.getAll);
router.get('/:id', BatchController.getById);
router.post('/', BatchController.create);
router.put('/:id', BatchController.update);
router.delete('/:id', BatchController.delete);

module.exports = router;
