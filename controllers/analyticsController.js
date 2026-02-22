/**
 * Analytics Controller - HTTP handlers for analytics
 */
const AnalyticsService = require('../services/analyticsService');

class AnalyticsController {
    static async getDashboardStats(req, res, next) {
        try {
            const stats = await AnalyticsService.getDashboardStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    static async getLowStock(req, res, next) {
        try {
            const items = await AnalyticsService.getLowStock();
            res.json(items);
        } catch (error) {
            next(error);
        }
    }

    static async getSalesTrend(req, res, next) {
        try {
            const trend = await AnalyticsService.getSalesTrend();
            res.json(trend);
        } catch (error) {
            next(error);
        }
    }

    static async getTopProducts(req, res, next) {
        try {
            const products = await AnalyticsService.getTopProducts();
            res.json(products);
        } catch (error) {
            next(error);
        }
    }

    static async getDailySales(req, res, next) {
        try {
            const sales = await AnalyticsService.getDailySales();
            res.json(sales);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AnalyticsController;
