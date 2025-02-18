const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(cors({ origin: '*', credentials: true })); // Allow all origins and credentials

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware (Optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
