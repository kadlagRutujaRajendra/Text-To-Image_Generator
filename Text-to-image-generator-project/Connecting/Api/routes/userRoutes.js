const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// /api/user/me
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
