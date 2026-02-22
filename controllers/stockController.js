/**
 * Stock Controller - HTTP handlers for stock
 */
const StockService = require('../services/stockService');

class StockController {
    static async getAll(req, res, next) {
        try {
            const stocks = await StockService.findAll();
            res.json(stocks);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const stock = await StockService.findById(req.params.id);
            if (!stock) {
                return res.status(404).json({ error: 'Stock record not found' });
            }
            res.json(stock);
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { batch_id } = req.body;
            if (!batch_id) {
                return res.status(400).json({ error: 'batch_id is required' });
            }

            const newStock = await StockService.create(req.body);
            res.status(201).json(newStock);
        } catch (error) {
            // Pass to error handler for consistent, production-safe error formatting
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const updated = await StockService.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Stock record not found or no changes made' });
            }
            res.json({ message: 'Stock updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const deleted = await StockService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Stock record not found' });
            }
            res.json({ message: 'Stock deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = StockController;
