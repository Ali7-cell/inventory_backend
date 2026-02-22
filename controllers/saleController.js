/**
 * Sale Controller - HTTP handlers for sales (checkout/billing)
 */
const SaleService = require('../services/saleService');

class SaleController {
    static async getAll(req, res, next) {
        try {
            const sales = await SaleService.findAll();
            res.json(sales);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const sale = await SaleService.findById(req.params.id);
            if (!sale) {
                return res.status(404).json({ error: 'Sale record not found' });
            }
            res.json(sale);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create sale (checkout/billing endpoint)
     * Expects: { total_amount, net_amount, discount?, payment_method?, items[], customer_name? }
     */
    static async create(req, res, next) {
        try {
            const { total_amount, net_amount, items, discount, payment_method, customer_name } = req.body;

            // Validation
            if (!total_amount || typeof total_amount !== 'number' || total_amount < 0) {
                return res.status(400).json({ error: 'Invalid total_amount' });
            }

            if (!net_amount || typeof net_amount !== 'number' || net_amount < 0) {
                return res.status(400).json({ error: 'Invalid net_amount' });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Items array is required and cannot be empty' });
            }

            // Validate each item
            for (const item of items) {
                if (!item.batch_id || !item.quantity || !item.unit_price || !item.subtotal) {
                    return res.status(400).json({ 
                        error: 'Each item must have batch_id, quantity, unit_price, and subtotal' 
                    });
                }
            }

            const result = await SaleService.create({
                total_amount,
                net_amount,
                discount: discount || 0,
                payment_method: payment_method || 'Cash',
                customer_name: customer_name || null,
                items,
            });

            res.status(201).json({
                message: 'Sale completed successfully',
                saleId: result.id,
                sale: {
                    id: result.id,
                    total_amount: result.total_amount,
                    discount: result.discount,
                    net_amount: result.net_amount,
                    payment_method: result.payment_method,
                    sale_date: result.sale_date,
                },
            });
        } catch (error) {
            // Pass to error handler for consistent error formatting
            next(error);
        }
    }
}

module.exports = SaleController;
