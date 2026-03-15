const Worker = require('../models/Worker');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpStatusText = require('../../utils/httpStatusText');
const AppError = require('../../utils/appError');

// @desc    Get all reviews across all workers
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = asyncWrapper(async (req, res, next) => {
    // We use aggregation to flatten the reviews from all workers
    const reviewsData = await Worker.aggregate([
        { $unwind: '$reviews' },
        {
            $project: {
                _id: '$reviews._id',
                workerId: '$_id',
                workerName: '$name',
                reviewerName: '$reviews.reviewerName',
                reviewerEmail: '$reviews.reviewerEmail',
                rating: '$reviews.rating',
                comment: '$reviews.comment',
                createdAt: '$reviews.createdAt'
            }
        },
        { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            reviews: reviewsData
        }
    });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:workerId/:reviewId
// @access  Private/Admin
exports.deleteReview = asyncWrapper(async (req, res, next) => {
    const { workerId, reviewId } = req.params;

    const worker = await Worker.findById(workerId);

    if (!worker) {
        return next(new AppError('Worker not found', 404));
    }

    // Remove the review from the array
    worker.reviews = worker.reviews.filter(rev => rev._id.toString() !== reviewId);

    // Update stats
    worker.numOfReviews = worker.reviews.length;
    worker.averageRating = worker.reviews.length > 0
        ? worker.reviews.reduce((acc, item) => item.rating + acc, 0) / worker.reviews.length
        : 0;

    await worker.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null
    });
});
