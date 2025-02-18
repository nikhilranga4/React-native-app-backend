const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// User Registration
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            fullName,
            email,
            password: hashedPassword,
            provider: "local",
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Google & GitHub OAuth Login/Register
exports.oauthLogin = async (req, res) => {
    const { email, fullName, provider } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                fullName,
                email,
                isOAuth: true,
                provider,
            });

            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
