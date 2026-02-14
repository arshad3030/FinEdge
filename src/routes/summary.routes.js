const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { summaryLimiter } = require('../middlewares/rateLimiter.middleware');
const { get } = require('../controllers/summary.controller');

const router = express.Router();

router.use(authMiddleware);
router.use(summaryLimiter); // Apply rate limiter for summary endpoint

router.get('/', get);

module.exports = router;


