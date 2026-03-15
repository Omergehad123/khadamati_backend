const User = require('../models/User');
const asyncWrapper = require('../middlewares/asyncWrapper');
const AppError = require('../../utils/appError');
const httpStatusText = require('../../utils/httpStatusText');

// @desc    Register user
// @route   POST /api/users/auth/register
// @access  Public
exports.register = asyncWrapper(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password
    });

    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/users/auth/login
// @access  Public
exports.login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide an email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        return next(new AppError('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/users/auth/me
// @access  Private
exports.getMe = asyncWrapper(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { user }
    });
});

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        status: httpStatusText.SUCCESS,
        data: {
            token,
            id: user._id,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
};
