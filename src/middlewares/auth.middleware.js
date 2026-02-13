const jwt = require('jsonwebtoken');
const { loadConfig } = require('../config/env');
const { AuthError } = require('../utils/appError');

const config = loadConfig();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AuthError('Missing Authorization header'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.userId, ...payload };
    return next();
  } catch (err) {
    return next(new AuthError('Invalid or expired token'));
  }
}

module.exports = { authMiddleware };


