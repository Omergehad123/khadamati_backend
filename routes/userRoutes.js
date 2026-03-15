const express = require('express');
const {
    getUsers,
    deleteUser
} = require('../App/controllers/userController');

const router = express.Router();

// Public for now to facilitate dashboard development, should be protected in production
router.route('/').get(getUsers);
router.route('/:id').delete(deleteUser);

module.exports = router;
