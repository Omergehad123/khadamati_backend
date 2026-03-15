const express = require('express');
const { register, login, getMe } = require('../App/controllers/authController');
const { protect } = require('../App/middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
