/**
 * Batch Controller - HTTP handlers for batches
 */
const BatchService = require('../services/batchService');

class BatchController {
    static async getAll(req, res, next) {
        try {
            const batches = await BatchService.findAll();
            res.json(batches);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const batch = await BatchService.findById(req.params.id);
            if (!batch) {
                return res.status(404).json({ error: 'Batch not found' });
            }
            res.json(batch);
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { product_id, batch_number, expiry_date, cost_price, selling_price } = req.body;

            if (!product_id || !batch_number || !expiry_date || !cost_price || !selling_price) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newBatch = await BatchService.create(req.body);
            res.status(201).json(newBatch);
        } catch (error) {
            // Pass to error handler for consistent, production-safe error formatting
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const updated = await BatchService.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Batch not found or no changes made' });
            }
            res.json({ message: 'Batch updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const deleted = await BatchService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Batch not found' });
            }
            res.json({ message: 'Batch deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BatchController;
