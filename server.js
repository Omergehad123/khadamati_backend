const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/workers/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/users/auth', require('./routes/userAuthRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// 404 Logger
const AppError = require('./utils/appError');
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);

    err.statusCode = err.statusCode || 500;
    err.statusText = err.statusText || 'error';

    // Handle Mongoose duplicate key
    if (err.code === 11000) {
        err.message = 'Duplicate field value entered';
        err.statusCode = 400;
        err.statusText = 'fail';
    }

    res.status(err.statusCode).json({
        status: err.statusText,
        message: err.message,
        code: err.statusCode,
        data: null
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
