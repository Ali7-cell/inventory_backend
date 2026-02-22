/**
 * Analytics Service - Business logic for analytics queries
 */
const { query, get } = require('../db/pool');

class AnalyticsService {
    static async getDashboardStats() {
        const stats = await get(`
            SELECT
                (SELECT COUNT(*)::int FROM products) AS "totalProducts",
                (
                    SELECT COUNT(*)::int FROM (
                        SELECT p.id
                        FROM products p
                        JOIN batches b ON b.product_id = p.id
                        JOIN stocks s ON s.batch_id = b.id
                        GROUP BY p.id
                        HAVING SUM(s.quantity) < MAX(p.low_stock_threshold)
                    ) sub
                ) AS "lowStockCount",
                (SELECT COALESCE(SUM(net_amount), 0) FROM sales WHERE (sale_date AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date) AS "todayRevenue",
                (SELECT COALESCE(SUM(net_amount), 0) FROM sales) AS "totalRevenue",
                (SELECT COALESCE(SUM(s.quantity * b.selling_price), 0) FROM stocks s JOIN batches b ON s.batch_id = b.id) AS "inventoryValue"
        `);

        return {
            totalProducts: Number(stats?.totalProducts ?? 0),
            lowStockItems: Number(stats?.lowStockCount ?? 0),
            inventoryValue: Number(stats?.inventoryValue ?? 0),
            todayRevenue: Number(stats?.todayRevenue ?? 0),
            totalRevenue: Number(stats?.totalRevenue ?? 0),
        };
    }

    static async getLowStock() {
        const sql = `
            SELECT p.id, p.name, p.base_unit, p.units_per_pack, p.low_stock_threshold,
                   SUM(s.quantity)::int AS total_base_units,
                   (SUM(s.quantity) / NULLIF(p.units_per_pack, 0))::int AS packs,
                   (SUM(s.quantity) % NULLIF(p.units_per_pack, 0))::int AS loose_units
            FROM products p
            JOIN batches b ON b.product_id = p.id
            JOIN stocks s ON s.batch_id = b.id
            GROUP BY p.id, p.name, p.base_unit, p.units_per_pack, p.low_stock_threshold
            HAVING SUM(s.quantity) < p.low_stock_threshold
            ORDER BY total_base_units ASC
        `;
        return await query(sql);
    }

    static async getSalesTrend() {
        const sql = `
            SELECT
                to_char(sale_date, 'YYYY-MM') AS month,
                SUM(net_amount) AS revenue
            FROM sales
            WHERE EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY to_char(sale_date, 'YYYY-MM')
            ORDER BY month ASC
        `;
        return await query(sql);
    }

    static async getTopProducts() {
        const sql = `
            SELECT p.name, SUM(si.quantity_in_base_units)::int AS total_sold
            FROM sale_items si
            JOIN batches b ON si.batch_id = b.id
            JOIN products p ON b.product_id = p.id
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC
            LIMIT 5
        `;
        return await query(sql);
    }

    static async getDailySales() {
        const sql = `
            SELECT
                (sale_date AT TIME ZONE 'UTC')::date AS day,
                SUM(net_amount) AS revenue
            FROM sales
            WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY (sale_date AT TIME ZONE 'UTC')::date
            ORDER BY day ASC
        `;
        return await query(sql);
    }
}

module.exports = AnalyticsService;
