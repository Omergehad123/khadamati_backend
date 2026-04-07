const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/workers/auth', require('./routes/authRoutes'));
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/users/auth', require('./routes/userAuthRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

const AppError = require('./utils/appError');

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);

    err.statusCode = err.statusCode || 500;
    err.statusText = err.statusText || 'error';

    if (err.code === 11000) {
        err.message = 'Duplicate field value entered';
        err.statusCode = 400;
        err.statusText = 'fail';
    }

    res.status(err.statusCode).json({
        status: err.statusText,
        message: err.message,
        code: err.statusCode,
        data: null,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});