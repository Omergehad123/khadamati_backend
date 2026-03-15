const User = require('../models/User');
const asyncWrapper = require('../middlewares/asyncWrapper');
const AppError = require('../../utils/appError');
const httpStatusText = require('../../utils/httpStatusText');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncWrapper(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { users }
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncWrapper(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    await user.deleteOne();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null
    });
});
