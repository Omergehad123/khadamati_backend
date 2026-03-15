const express = require('express');
const { getStats } = require('../App/controllers/statsController');

const router = express.Router();

router.get('/', getStats);

module.exports = router;
