/**
 * Auth Controller - HTTP handlers for authentication
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const UserService = require('../services/userService');

class AuthController {
    static async register(req, res, next) {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Please provide all fields' });
            }

            const existingUser = await UserService.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await UserService.create({
                username,
                email,
                password: hashedPassword,
            });

            res.status(201).json({
                message: 'User registered successfully',
                user: { id: newUser.id, username: newUser.username, email: newUser.email },
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Please provide email and password' });
            }

            const user = await UserService.findByEmail(email);
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                config.jwtSecret,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: { id: user.id, username: user.username, email: user.email, role: user.role },
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
