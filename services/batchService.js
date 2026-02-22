/**
 * Batch Service - Business logic for batch operations
 */
const { query, get, run, getClient } = require('../db/pool');

class BatchService {
    static async findAll() {
        const sql = `
            SELECT b.*, p.name AS product_name
            FROM batches b
            JOIN products p ON b.product_id = p.id
            ORDER BY b.expiry_date ASC
        `;
        return await query(sql);
    }

    static async findById(id) {
        const sql = 'SELECT * FROM batches WHERE id = $1';
        return await get(sql, [id]);
    }

    static async create(data) {
        const { product_id, batch_number, expiry_date, cost_price, selling_price, initial_quantity, location } = data;

        const product = await get('SELECT id FROM products WHERE id = $1', [product_id]);
        if (!product) {
            throw new Error(`Product with ID ${product_id} does not exist.`);
        }

        const client = await getClient();
        try {
            await client.query('BEGIN');

            const batchRes = await client.query(
                `INSERT INTO batches (product_id, batch_number, expiry_date, cost_price, selling_price)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [product_id, batch_number, expiry_date, cost_price, selling_price]
            );
            const batchId = batchRes.rows[0].id;
            const qty = parseInt(initial_quantity, 10) || 0;
            const loc = location || 'shop';

            await client.query(
                `INSERT INTO stocks (batch_id, quantity, location) VALUES ($1, $2, $3)`,
                [batchId, qty, loc]
            );

            await client.query(
                `INSERT INTO stock_movements (batch_id, movement_type, quantity, reason, location, notes)
                 VALUES ($1, 'IN', $2, 'purchase', $3, 'Initial Batch Registration')`,
                [batchId, qty, loc]
            );

            await client.query('COMMIT');
            return { id: batchId, ...data };
        } catch (err) {
            await client.query('ROLLBACK').catch(() => {});
            throw err;
        } finally {
            client.release();
        }
    }

    static async update(id, data) {
        const { product_id, batch_number, expiry_date, cost_price, selling_price } = data;

        if (product_id) {
            const product = await get('SELECT id FROM products WHERE id = $1', [product_id]);
            if (!product) {
                throw new Error(`Product with ID ${product_id} does not exist.`);
            }
        }

        const sql = `
            UPDATE batches
            SET product_id = COALESCE($1, product_id),
                batch_number = COALESCE($2, batch_number),
                expiry_date = COALESCE($3, expiry_date),
                cost_price = COALESCE($4, cost_price),
                selling_price = COALESCE($5, selling_price),
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = $6
        `;
        const { rowCount } = await run(sql, [product_id, batch_number, expiry_date, cost_price, selling_price, id]);
        return rowCount > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM batches WHERE id = $1';
        const { rowCount } = await run(sql, [id]);
        return rowCount > 0;
    }
}

module.exports = BatchService;
