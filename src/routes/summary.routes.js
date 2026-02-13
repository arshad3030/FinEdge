const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { get } = require('../controllers/summary.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', get);

module.exports = router;


