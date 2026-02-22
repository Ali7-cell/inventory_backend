/**
 * Supplier Service - Business logic for supplier operations
 */
const { query, get, run } = require('../db/pool');

class SupplierService {
    static async findAll() {
        const sql = 'SELECT * FROM suppliers ORDER BY supplier_name ASC';
        return await query(sql);
    }

    static async findById(id) {
        const sql = 'SELECT * FROM suppliers WHERE id = $1';
        return await get(sql, [id]);
    }

    static async create(data) {
        const { supplier_name, company_name, contact_number, address } = data;
        const sql = `
            INSERT INTO suppliers (supplier_name, company_name, contact_number, address)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const result = await run(sql, [supplier_name, company_name, contact_number, address]);
        return { id: result.id, ...data };
    }

    static async update(id, data) {
        const { supplier_name, company_name, contact_number, address } = data;
        const sql = `
            UPDATE suppliers
            SET supplier_name = COALESCE($1, supplier_name),
                company_name = COALESCE($2, company_name),
                contact_number = COALESCE($3, contact_number),
                address = COALESCE($4, address),
                "updatedAt" = CURRENT_TIMESTAMP
            WHERE id = $5
        `;
        const { rowCount } = await run(sql, [supplier_name, company_name, contact_number, address, id]);
        return rowCount > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM suppliers WHERE id = $1';
        const { rowCount } = await run(sql, [id]);
        return rowCount > 0;
    }
}

module.exports = SupplierService;
