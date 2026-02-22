/**
 * Supplier Controller - HTTP handlers for suppliers
 */
const SupplierService = require('../services/supplierService');

class SupplierController {
    static async getAll(req, res, next) {
        try {
            const suppliers = await SupplierService.findAll();
            res.json(suppliers);
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const supplier = await SupplierService.findById(req.params.id);
            if (!supplier) {
                return res.status(404).json({ error: 'Supplier not found' });
            }
            res.json(supplier);
        } catch (error) {
            next(error);
        }
    }

    static async create(req, res, next) {
        try {
            const { supplier_name, company_name, contact_number } = req.body;
            if (!supplier_name || !company_name || !contact_number) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newSupplier = await SupplierService.create(req.body);
            res.status(201).json(newSupplier);
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const updated = await SupplierService.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Supplier not found or no changes made' });
            }
            res.json({ message: 'Supplier updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req, res, next) {
        try {
            const deleted = await SupplierService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Supplier not found' });
            }
            res.json({ message: 'Supplier deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = SupplierController;
