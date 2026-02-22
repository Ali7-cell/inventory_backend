/**
 * Product Controller - HTTP handlers for products
 */
const ProductService = require('../services/productService');

class ProductController {
    static async getAll(req, res, next) {
        try {
            const products = await ProductService.findAll();
            res.json(products);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const product = await ProductService.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { name, generic_name, dosage_form, strength, pack_size, base_unit, units_per_pack, low_stock_threshold } = req.body;

            if (!name || !generic_name || !dosage_form || !strength || !pack_size) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newProduct = await ProductService.create(req.body);
            res.status(201).json(newProduct);
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const updated = await ProductService.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Product not found or no changes made' });
            }
            res.json({ message: 'Product updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const deleted = await ProductService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductController;
