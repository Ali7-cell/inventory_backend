/**
 * Sale Service - Business logic for sale operations
 */
const { query, get, getClient } = require('../db/pool');

class SaleService {
    static async create(saleData) {
        const { customer_name, total_amount, discount, net_amount, payment_method, items } = saleData;

        const client = await getClient();
        try {
            await client.query('BEGIN');

            const saleRes = await client.query(
                `INSERT INTO sales (customer_name, total_amount, discount, net_amount, payment_method)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [customer_name || null, total_amount, discount || 0, net_amount, payment_method || 'Cash']
            );
            const saleId = saleRes.rows[0].id;

            for (const item of items) {
                const { batch_id, quantity, unit_price, subtotal, sold_as } = item;

                const productInfo = await client.query(
                    `SELECT p.units_per_pack, p.name FROM products p JOIN batches b ON b.product_id = p.id WHERE b.id = $1`,
                    [batch_id]
                ).then(r => r.rows[0]);

                if (!productInfo) {
                    throw new Error(`Product not found for batch ID ${batch_id}`);
                }

                const qtyInBaseUnits = sold_as === 'pack' ? quantity * productInfo.units_per_pack : quantity;

                const stockRow = await client.query(
                    'SELECT id, quantity FROM stocks WHERE batch_id = $1 AND location = $2',
                    [batch_id, 'shop']
                ).then(r => r.rows[0]);

                if (!stockRow || stockRow.quantity < qtyInBaseUnits) {
                    throw new Error(`Insufficient stock for ${productInfo.name}. Available: ${stockRow ? stockRow.quantity : 0}, Requested: ${qtyInBaseUnits}`);
                }

                await client.query(
                    `INSERT INTO sale_items (sale_id, batch_id, quantity, unit_price, subtotal, sold_as, quantity_in_base_units)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [saleId, batch_id, quantity, unit_price, subtotal, sold_as || 'unit', qtyInBaseUnits]
                );

                await client.query(
                    'UPDATE stocks SET quantity = quantity - $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
                    [qtyInBaseUnits, stockRow.id]
                );

                await client.query(
                    `INSERT INTO stock_movements (batch_id, movement_type, quantity, reason, location, notes)
                     VALUES ($1, 'OUT', $2, 'sale', 'shop', $3)`,
                    [batch_id, qtyInBaseUnits, `Sale ID: ${saleId} (${sold_as || 'unit'})`]
                );
            }

            await client.query('COMMIT');
            return { id: saleId, ...saleData, sale_date: new Date() };
        } catch (err) {
            await client.query('ROLLBACK').catch(() => {});
            throw err;
        } finally {
            client.release();
        }
    }

    static async findAll() {
        const sql = 'SELECT * FROM sales ORDER BY sale_date DESC';
        return await query(sql);
    }

    static async findById(id) {
        const sale = await get('SELECT * FROM sales WHERE id = $1', [id]);
        if (!sale) return null;

        const itemsSql = `
            SELECT si.*, b.batch_number, p.name AS product_name
            FROM sale_items si
            JOIN batches b ON si.batch_id = b.id
            JOIN products p ON b.product_id = p.id
            WHERE si.sale_id = $1
        `;
        const items = await query(itemsSql, [id]);
        return { ...sale, items };
    }
}

module.exports = SaleService;
