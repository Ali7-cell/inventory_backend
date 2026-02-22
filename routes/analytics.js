/**
 * Analytics Routes
 */
const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

router.get('/dashboard-stats', AnalyticsController.getDashboardStats);
router.get('/low-stock', AnalyticsController.getLowStock);
router.get('/sales-trend', AnalyticsController.getSalesTrend);
router.get('/top-products', AnalyticsController.getTopProducts);
router.get('/daily-sales', AnalyticsController.getDailySales);

module.exports = router;
