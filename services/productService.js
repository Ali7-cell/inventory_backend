/**
 * Product Service - Business logic for product operations
 */
const { query, get, run } = require('../db/pool');

class ProductService {
    static async findAll() {
        const sql = 'SELECT * FROM products ORDER BY "createdAt" DESC';
        return await query(sql);
    }

    static async findById(id) {
        const sql = 'SELECT * FROM products WHERE id = $1';
        return await get(sql, [id]);
    }

    static async create(data) {
        const { name, generic_name, dosage_form, strength, pack_size, base_unit, units_per_pack, low_stock_threshold } = data;
        const sql = `
            INSERT INTO products (name, generic_name, dosage_form, strength, pack_size, base_unit, units_per_pack, low_stock_threshold)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;
        const result = await run(sql, [
            name,
            generic_name,
            dosage_form,
            strength,
            pack_size,
            base_unit || 'Tablet',
            units_per_pack || 1,
            low_stock_threshold || 10
        ]);
        return { id: result.id, ...data };
    }

    static async update(id, data) {
        const { name, generic_name, dosage_form, strength, pack_size, base_unit, units_per_pack, low_stock_threshold } = data;
        const sql = `
            UPDATE products
            SET name = $1, generic_name = $2, dosage_form = $3, strength = $4, pack_size = $5,
                base_unit = $6, units_per_pack = $7, low_stock_threshold = $8, "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = $9
        `;
        const { rowCount } = await run(sql, [
            name,
            generic_name,
            dosage_form,
            strength,
            pack_size,
            base_unit,
            units_per_pack,
            low_stock_threshold,
            id
        ]);
        return rowCount > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM products WHERE id = $1';
        const { rowCount } = await run(sql, [id]);
        return rowCount > 0;
    }
}

module.exports = ProductService;
