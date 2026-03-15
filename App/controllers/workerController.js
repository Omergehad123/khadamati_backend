const Worker = require('../models/Worker');
const asyncWrapper = require('../middlewares/asyncWrapper');
const AppError = require('../../utils/appError');
const httpStatusText = require('../../utils/httpStatusText');

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
exports.getWorkers = asyncWrapper(async (req, res, next) => {
    const workers = await Worker.find();
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { workers }
    });
});

// @desc    Get single worker
// @route   GET /api/workers/:id
// @access  Public
exports.getWorker = asyncWrapper(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
        return next(new AppError('Worker not found', 404));
    }
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { worker }
    });
});

// @desc    Get workers by category
// @route   GET /api/workers/category/:type
// @access  Public
exports.getWorkersByCategory = asyncWrapper(async (req, res, next) => {
    const workers = await Worker.find({ jobType: { $regex: new RegExp(req.params.type, 'i') } });
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { workers }
    });
});

// @desc    Search workers
// @route   GET /api/workers/search/filter
// @access  Public
exports.searchWorkers = asyncWrapper(async (req, res, next) => {
    const { jobType, location } = req.query;
    let query = {};

    if (jobType) {
        query.jobType = { $regex: new RegExp(jobType, 'i') };
    }

    if (location) {
        // Search in city or area
        query.$or = [
            { city: { $regex: new RegExp(location, 'i') } },
            { area: { $regex: new RegExp(location, 'i') } }
        ];
    }

    const workers = await Worker.find(query);
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { workers }
    });
});

// @desc    Update worker profile
// @route   PUT /api/workers/:id
// @access  Private (Worker only)
exports.updateWorker = asyncWrapper(async (req, res, next) => {
    let worker = await Worker.findById(req.params.id);

    if (!worker) {
        return next(new AppError('Worker not found', 404));
    }

    // Make sure user is worker owner
    if (worker._id.toString() !== req.user.id) {
        return next(new AppError('Not authorized to update this worker profile', 401));
    }

    worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { worker }
    });
});

// @desc    Delete worker profile
// @route   DELETE /api/workers/:id
// @access  Private (Worker only)
exports.deleteWorker = asyncWrapper(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
        return next(new AppError('Worker not found', 404));
    }

    // Role check disabled for dashboard development
    // if (worker._id.toString() !== req.user.id) {
    //     return next(new AppError('Not authorized to delete this worker profile', 401));
    // }

    await worker.deleteOne();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null
    });
});

// @desc    Upload photo for worker
// @route   PUT /api/workers/:id/photo
// @access  Private
exports.uploadWorkerImage = asyncWrapper(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
        return next(new AppError('Worker not found', 404));
    }

    // Make sure user is worker owner
    if (worker._id.toString() !== req.user.id) {
        return next(new AppError('Not authorized to update this worker profile', 401));
    }

    if (!req.file) {
        return next(new AppError('Please upload a file', 400));
    }

    // Construct the URL to access the image
    const imagePath = `/uploads/${req.file.filename}`;

    // Replace the first image (profile picture) but keep the rest (gallery)
    if (worker.images && worker.images.length > 0) {
        worker.images[0] = imagePath;
    } else {
        worker.images = [imagePath];
    }

    await worker.save({ validateBeforeSave: false });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { images: worker.images }
    });
});

// @desc    Add photo to gallery
// @route   POST /api/workers/:id/gallery
// @access  Private
exports.addToGallery = asyncWrapper(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
        return next(new AppError('Worker not found', 404));
    }

    // Make sure user is worker owner
    if (worker._id.toString() !== req.user.id) {
        return next(new AppError('Not authorized to update this worker profile', 401));
    }

    if (!req.file) {
        return next(new AppError('Please upload a file', 400));
    }

    const imagePath = `/uploads/${req.file.filename}`;

    // Add to images array
    worker.images.push(imagePath);
    await worker.save({ validateBeforeSave: false });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { images: worker.images }
    });
});

// @desc    Remove photo from gallery
// @route   DELETE /api/workers/:id/gallery
// @access  Private
exports.removeFromGallery = asyncWrapper(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
        return next(new AppError('Worker not found', 404));
    }

    // Make sure user is worker owner
    if (worker._id.toString() !== req.user.id) {
        return next(new AppError('Not authorized to update this worker profile', 401));
    }

    const { imagePath } = req.body;

    if (!imagePath) {
        return next(new AppError('Please provide an image path', 400));
    }

    // Remove from images array
    worker.images = worker.images.filter(img => img !== imagePath);
    await worker.save({ validateBeforeSave: false });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { images: worker.images }
    });
});
// @desc    Add review to worker
// @route   POST /api/workers/:id/reviews
// @access  Public
exports.createReview = asyncWrapper(async (req, res, next) => {
    const { reviewerName, reviewerEmail, rating, comment } = req.body;
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
        return next(new AppError('Worker not found', 404));
    }

    // Use req.user if authenticated, otherwise use provided body data
    const finalName = req.user ? req.user.name : reviewerName;
    const finalEmail = req.user ? req.user.email : reviewerEmail;

    if (!finalName || !finalEmail) {
        return next(new AppError('Please provide your name and email', 400));
    }

    const review = {
        reviewerName: finalName,
        reviewerEmail: finalEmail,
        rating: Number(rating),
        comment
    };

    worker.reviews.push(review);
    worker.numOfReviews = worker.reviews.length;

    // Calculate average rating
    worker.averageRating = worker.reviews.reduce((acc, item) => item.rating + acc, 0) / worker.reviews.length;

    await worker.save({ validateBeforeSave: false });

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { worker }
    });
});
// @desc    Get unique categories (job types)
// @route   GET /api/workers/categories
// @access  Public
exports.getCategories = asyncWrapper(async (req, res, next) => {
    console.log('HIT getCategories');
    const categories = await Worker.distinct('jobType');
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { categories }
    });
});
