/**
 * User Service - Business logic for user operations
 */
const { get, run } = require('../db/pool');

class UserService {
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = $1';
        return await get(sql, [email]);
    }

    static async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = $1';
        return await get(sql, [username]);
    }

    static async create(data) {
        const { username, email, password } = data;
        const sql = `
            INSERT INTO users (username, email, password, role)
            VALUES ($1, $2, $3, 'admin')
            RETURNING id, username, email, role, "createdAt"
        `;
        const result = await run(sql, [username, email, password]);
        return { id: result.id, username, email, role: 'admin' };
    }
}

module.exports = UserService;
