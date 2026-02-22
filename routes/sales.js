/**
 * Sale Routes
 */
const express = require('express');
const router = express.Router();
const SaleController = require('../controllers/saleController');

router.get('/', SaleController.getAll);
router.get('/:id', SaleController.getById);
router.post('/', SaleController.create);

module.exports = router;
