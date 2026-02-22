/**
 * Stock Service - Business logic for stock operations
 */
const { query, get, run } = require('../db/pool');

class StockService {
    static async findAll() {
        const sql = `
            SELECT s.*, b.batch_number, b.expiry_date, b.selling_price,
                   p.name AS product_name, p.base_unit, p.units_per_pack, p.low_stock_threshold
            FROM stocks s
            JOIN batches b ON s.batch_id = b.id
            JOIN products p ON b.product_id = p.id
        `;
        return await query(sql);
    }

    static async findById(id) {
        const sql = 'SELECT * FROM stocks WHERE id = $1';
        return await get(sql, [id]);
    }

    static async create(data) {
        const { batch_id, quantity, location } = data;
        const batch = await get('SELECT id FROM batches WHERE id = $1', [batch_id]);
        if (!batch) {
            throw new Error(`Batch with ID ${batch_id} does not exist.`);
        }

        const sql = `
            INSERT INTO stocks (batch_id, quantity, location)
            VALUES ($1, $2, $3)
            RETURNING id
        `;
        const result = await run(sql, [batch_id, quantity || 0, location || 'shop']);
        return { id: result.id, ...data };
    }

    static async update(id, data) {
        const { quantity, location } = data;
        const sql = `
            UPDATE stocks
            SET quantity = COALESCE($1, quantity),
                location = COALESCE($2, location),
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = $3
        `;
        const { rowCount } = await run(sql, [quantity, location, id]);
        return rowCount > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM stocks WHERE id = $1';
        const { rowCount } = await run(sql, [id]);
        return rowCount > 0;
    }
}

module.exports = StockService;
