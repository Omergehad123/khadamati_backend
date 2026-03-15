const express = require('express');
const { getAllReviews, deleteReview } = require('../App/controllers/reviewController');

const router = express.Router();

// Note: In a real app, you'd add admin protect middleware here
router.get('/', getAllReviews);
router.delete('/:workerId/:reviewId', deleteReview);

module.exports = router;
