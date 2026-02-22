/**
 * Stock Movement Routes
 */
const express = require('express');
const router = express.Router();
const StockMovementController = require('../controllers/stockMovementController');

router.get('/', StockMovementController.getAll);
router.get('/:id', StockMovementController.getById);
router.post('/', StockMovementController.create);
router.put('/:id', StockMovementController.update);
router.delete('/:id', StockMovementController.delete);

module.exports = router;
