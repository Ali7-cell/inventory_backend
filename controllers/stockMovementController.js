/**
 * Stock Movement Controller - HTTP handlers for stock movements
 */
const StockMovementService = require('../services/stockMovementService');

class StockMovementController {
    static async getAll(req, res, next) {
        try {
            const movements = await StockMovementService.findAll();
            res.json(movements);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const movement = await StockMovementService.findById(req.params.id);
            if (!movement) {
                return res.status(404).json({ error: 'Movement not found' });
            }
            res.json(movement);
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { batch_id, movement_type, quantity, reason, location } = req.body;
            if (!batch_id || !movement_type || !quantity || !reason || !location) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newMovement = await StockMovementService.create(req.body);
            res.status(201).json(newMovement);
        } catch (error) {
            // Pass to error handler for consistent, production-safe error formatting
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const updated = await StockMovementService.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Movement not found or no changes' });
            }
            res.json({ message: 'Movement updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const deleted = await StockMovementService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Movement not found' });
            }
            res.json({ message: 'Movement deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = StockMovementController;
