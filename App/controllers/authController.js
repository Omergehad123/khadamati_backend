const Worker = require('../models/Worker');
const asyncWrapper = require('../middlewares/asyncWrapper');
const AppError = require('../../utils/appError');
const httpStatusText = require('../../utils/httpStatusText');

// @desc    Register worker
// @route   POST /api/workers/auth/register
// @access  Public
exports.register = asyncWrapper(async (req, res, next) => {
    console.log('Worker Register Request:', req.body);
    const { name, email, password, jobType, category, phone, city, area, address, description, experienceYears, services } = req.body;

    // Create worker
    const worker = await Worker.create({
        name,
        email,
        password,
        jobType,
        category,
        phone,
        city,
        area,
        address,
        description,
        experienceYears,
        services
    });

    console.log('Worker Created Successfully:', worker._id);
    sendTokenResponse(worker, 201, res);
});

// @desc    Login worker
// @route   POST /api/workers/auth/login
// @access  Public
exports.login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new AppError('Please provide an email and password', 400));
    }

    // Check for worker
    const worker = await Worker.findOne({ email }).select('+password');

    if (!worker) {
        return next(new AppError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await worker.matchPassword(password);

    if (!isMatch) {
        return next(new AppError('Invalid credentials', 401));
    }

    sendTokenResponse(worker, 200, res);
});

// @desc    Get current logged in worker
// @route   GET /api/workers/auth/me
// @access  Private
exports.getMe = asyncWrapper(async (req, res, next) => {
    const worker = await Worker.findById(req.user.id);
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { worker }
    });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (worker, statusCode, res) => {
    const token = worker.getSignedJwtToken();

    res.status(statusCode).json({
        status: httpStatusText.SUCCESS,
        data: {
            token,
            id: worker._id,
            worker: {
                _id: worker._id,
                name: worker.name,
                email: worker.email,
                role: 'worker',
                category: worker.category,
                jobType: worker.jobType,
                phone: worker.phone,           // ← was missing
                city: worker.city,
                area: worker.area,
                address: worker.address,       // ← was missing
                description: worker.description, // ← was missing
                experienceYears: worker.experienceYears, // ← was missing (THE BUG)
                services: worker.services,     // ← was missing
                images: worker.images,
            }
        }
    });
};
