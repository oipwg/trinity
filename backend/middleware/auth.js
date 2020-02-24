require('dotenv').config();
const JWT = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

function auth(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res
            .status(401)
            .json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = JWT.verify(token, JWT_SECRET);
        // Add user from payload

        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token is not valid' });
    }
}

module.exports = auth;
