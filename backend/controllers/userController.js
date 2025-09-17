import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Added missing import

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// API to register user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const user = await User.create({ name, email, password });
        return res.status(201).json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// API to login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            return res.status(200).json({
                success: true,
                token: generateToken(user._id),
                user: { id: user._id, name: user.name, email: user.email },
            });
        }
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// API to get user data
export const getUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};