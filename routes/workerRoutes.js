const express = require('express');
const {
    getWorkers,
    getWorker,
    getWorkersByCategory,
    searchWorkers,
    updateWorker,
    deleteWorker,
    uploadWorkerImage,
    addToGallery,
    removeFromGallery,
    createReview,
    getCategories
} = require('../App/controllers/workerController');

const { protect, protectOptional } = require('../App/middlewares/authMiddleware');
const upload = require('../App/middlewares/uploadMiddleware');

const router = express.Router();

router.get('/categories', getCategories);

// 1. Specific Search/Filter routes
router.get('/search/filter', searchWorkers);
router.get('/category/:type', getWorkersByCategory);

// 2. Collection root
router.get('/', getWorkers);

// 3. Sub-resource specific routes
router.post('/:id/reviews', protectOptional, createReview);

router
    .route('/:id/photo')
    .put(protect, upload.single('image'), uploadWorkerImage);

router
    .route('/:id/gallery')
    .post(protect, upload.single('image'), addToGallery)
    .delete(protect, removeFromGallery);

// 5. Generic ID routes
router
    .route('/:id')
    .get(getWorker)
    .put(protect, updateWorker)
    .delete(deleteWorker);

module.exports = router;
