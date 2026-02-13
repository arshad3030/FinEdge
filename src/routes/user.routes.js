const express = require('express');
const { register, login } = require('../controllers/user.controller');

const router = express.Router();

// POST /users - register
router.post('/', register);

// POST /users/login - login (alternative to /login)
router.post('/login', login);

module.exports = router;


