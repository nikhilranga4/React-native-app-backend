const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailUtils');
require('dotenv').config();

// Ensure backend URL is available
const BACKEND_URL = process.env.BACKEND_URL || 'https://react-native-app-backend-ozmx.onrender.com';

// Function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
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

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate email verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create a new user
        user = new User({
            fullName,
            email,
            password: hashedPassword,
            provider: "local",
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
        });

        await user.save();

        // Generate verification URL
        const verificationUrl = `/api/auth/verify-email?token=${verificationToken}`;
        
        // Send verification email
        await sendVerificationEmail(user, verificationUrl);

        res.status(201).json({
            message: "User registered successfully. Please check your email for verification.",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                provider: user.provider,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() },
            isEmailVerified: false,
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token",
            });
        }

        // Update user verification status
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(user);

        // Return success response with HTML and deep link to app
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Email Verification Success</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background-color: #f8f8f8;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        max-width: 90%;
                        width: 400px;
                    }
                    h1 {
                        color: #000;
                        margin-bottom: 1rem;
                    }
                    p {
                        color: #666;
                        margin-bottom: 2rem;
                    }
                    .success-icon {
                        font-size: 4rem;
                        color: #22c55e;
                        margin-bottom: 1rem;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #000;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        margin: 8px;
                    }
                    .button:hover {
                        opacity: 0.9;
                    }
                    .button-container {
                        margin-top: 20px;
                    }
                    .note {
                        font-size: 14px;
                        color: #666;
                        margin-top: 20px;
                    }
                </style>
                <script>
                    // Function to detect mobile device
                    function isMobile() {
                        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    }

                    // Function to open app or store
                    function openApp() {
                        if (isMobile()) {
                            // Try to open the app using custom scheme
                            window.location.href = 'zonnecta://login';
                            
                            // If app is not installed, redirect to store after a delay
                            setTimeout(() => {
                                if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
                                    window.location.href = 'https://apps.apple.com/app/your-app-id';
                                } else {
                                    window.location.href = 'https://play.google.com/store/apps/details?id=your.app.id';
                                }
                            }, 2500);
                        } else {
                            // On desktop, show a message
                            alert('Please open this link on your mobile device to access the app.');
                        }
                    }
                </script>
            </head>
            <body>
                <div class="container">
                    <div class="success-icon">✓</div>
                    <h1>Email Verified Successfully!</h1>
                    <p>Your email has been verified. You can now log in to your account.</p>
                    <div class="button-container">
                        <a href="#" onclick="openApp(); return false;" class="button">Open App</a>
                        <p class="note">If you're on desktop, please open the app on your mobile device to continue.</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check if email is verified for non-OAuth users
        if (!user.isOAuth && !user.isEmailVerified) {
            return res.status(401).json({
                message: "Please verify your email before logging in",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                provider: user.provider,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email, isEmailVerified: false });

        if (!user) {
            return res.status(400).json({
                message: "User not found or already verified",
            });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user verification token
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = verificationExpires;
        await user.save();

        // Generate verification URL
        const verificationUrl = `/api/auth/verify-email?token=${verificationToken}`;
        
        // Send verification email
        await sendVerificationEmail(user, verificationUrl);

        res.json({
            message: "Verification email sent successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    OAuth Login (Google/GitHub)
// @route   POST /api/auth/oauth-login
// @access  Public
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
                isEmailVerified: true, // OAuth users are automatically verified
            });

            await user.save();
            await sendWelcomeEmail(user);
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: "OAuth login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                provider: user.provider,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
