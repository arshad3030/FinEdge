const express = require('express');
const { register, login } = require('../controllers/user.controller');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

// Apply stricter rate limiting to auth endpoints
router.use(authLimiter);

// POST /users - register
router.post('/', register);

// POST /users/login - login (alternative to /login)
router.post('/login', login);

module.exports = router;


