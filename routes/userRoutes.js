const express = require('express');
const { getUserDetails, updateUserDetails, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get User Details (Protected Route)
router.get('/profile', authMiddleware, getUserDetails);

// Update User Details (Protected Route)
router.put('/profile', authMiddleware, updateUserDetails);

// Delete User (Protected Route)
router.delete('/profile', authMiddleware, deleteUser);

module.exports = router;
