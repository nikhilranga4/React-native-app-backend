const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user from DB and attach it to req.user (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid token', error: error.message });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = authMiddleware;
