const User = require('../models/userModel');

// Get User Details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update User Details
exports.updateUserDetails = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
