const Worker = require('../models/Worker');
const User = require('../models/User');
const asyncWrapper = require('../middlewares/asyncWrapper');
const httpStatusText = require('../../utils/httpStatusText');

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private/Admin
exports.getStats = asyncWrapper(async (req, res, next) => {
    const totalWorkers = await Worker.countDocuments();
    const totalUsers = await User.countDocuments();

    // Latest 5 workers
    const recentWorkers = await Worker.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email jobType images createdAt');

    // Latest 5 users
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');

    // Category Distribution (Job Type Stats)
    const jobTypeStats = await Worker.aggregate([
        { $group: { _id: '$jobType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    // Regional Distribution (City Stats)
    const cityStats = await Worker.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    // Total reviews across all workers
    const reviewAgg = await Worker.aggregate([
        { $group: { _id: null, totalReviews: { $sum: '$numOfReviews' }, totalRatingSum: { $sum: { $multiply: ['$averageRating', '$numOfReviews'] } } } }
    ]);
    const totalReviews = reviewAgg[0]?.totalReviews || 0;
    const averageRating = totalReviews > 0
        ? parseFloat((reviewAgg[0].totalRatingSum / totalReviews).toFixed(1))
        : 0;

    // Total unique cities
    const totalCities = cityStats.length;

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            totalWorkers,
            totalUsers,
            totalReviews,
            averageRating,
            totalCities,
            recentWorkers,
            recentUsers,
            jobTypeStats,
            cityStats
        }
    });
});
