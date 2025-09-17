import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    try {
        token = token.split(' ')[1]; // Remove "Bearer" prefix
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        req.user = user; // Attach user to request object
        next(); // Proceed to next middleware or route handler
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};