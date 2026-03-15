const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const User = require('../models/User');
const AppError = require('../../utils/appError');
const asyncWrapper = require('./asyncWrapper');

exports.protect = asyncWrapper(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check both models
    req.user = (await Worker.findById(decoded.id)) || (await User.findById(decoded.id));

    if (!req.user) {
        return next(new AppError('User not found with this id', 401));
    }

    next();
});

exports.protectOptional = asyncWrapper(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = (await Worker.findById(decoded.id)) || (await User.findById(decoded.id));
        } catch (err) {
            // If token is invalid, just proceed without req.user
        }
    }

    next();
});
