/**
 * Stock Movement Service - Business logic for stock movement operations
 */
const { query, get, run } = require('../db/pool');

class StockMovementService {
    static async findAll() {
        const sql = `
            SELECT sm.*, b.batch_number, p.name AS product_name
            FROM stock_movements sm
            JOIN batches b ON sm.batch_id = b.id
            JOIN products p ON b.product_id = p.id
            ORDER BY sm.date DESC
        `;
        return await query(sql);
    }

    static async findById(id) {
        const sql = 'SELECT * FROM stock_movements WHERE id = $1';
        return await get(sql, [id]);
    }

    static async create(data) {
        const { batch_id, movement_type, quantity, reason, location, notes } = data;

        const batch = await get('SELECT id FROM batches WHERE id = $1', [batch_id]);
        if (!batch) {
            throw new Error(`Batch with ID ${batch_id} does not exist.`);
        }

        const movSql = `
            INSERT INTO stock_movements (batch_id, movement_type, quantity, reason, location, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const movResult = await run(movSql, [batch_id, movement_type, quantity, reason, location, notes]);

        const stock = await get('SELECT id, quantity FROM stocks WHERE batch_id = $1 AND location = $2', [batch_id, location]);

        if (movement_type === 'IN') {
            if (stock) {
                await run('UPDATE stocks SET quantity = quantity + $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2', [quantity, stock.id]);
            } else {
                await run('INSERT INTO stocks (batch_id, quantity, location) VALUES ($1, $2, $3)', [batch_id, quantity, location]);
            }
        } else if (movement_type === 'OUT') {
            if (!stock || stock.quantity < quantity) {
                throw new Error('Insufficient stock for this movement.');
            }
            await run('UPDATE stocks SET quantity = quantity - $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2', [quantity, stock.id]);
        }

        return { id: movResult.id, ...data };
    }

    static async update(id, data) {
        const { movement_type, quantity, reason, location, notes } = data;
        const sql = `
            UPDATE stock_movements
            SET movement_type = COALESCE($1, movement_type),
                quantity = COALESCE($2, quantity),
                reason = COALESCE($3, reason),
                location = COALESCE($4, location),
                notes = COALESCE($5, notes),
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = $6
        `;
        const { rowCount } = await run(sql, [movement_type, quantity, reason, location, notes, id]);
        return rowCount > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM stock_movements WHERE id = $1';
        const { rowCount } = await run(sql, [id]);
        return rowCount > 0;
    }
}

module.exports = StockMovementService;
