const express = require('express');
const {
    registerUser,
    loginUser,
    oauthLogin,
    verifyEmail,
    resendVerificationEmail
} = require('../controllers/authController');
const { check } = require('express-validator');

const router = express.Router();

// User Registration
router.post(
    '/register',
    [
        check('fullName', 'Full Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    registerUser
);

// User Login
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    loginUser
);

// Email Verification
router.get('/verify-email', verifyEmail);

// Resend Verification Email
router.post(
    '/resend-verification',
    [
        check('email', 'Please include a valid email').isEmail(),
    ],
    resendVerificationEmail
);

// OAuth Login (Google, GitHub)
router.post('/oauth-login', oauthLogin);

module.exports = router;
