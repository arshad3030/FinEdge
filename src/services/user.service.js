const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { ValidationError, AuthError } = require('../utils/appError');
const { loadConfig } = require('../config/env');

const config = loadConfig();

async function registerUser({ email, password, name }) {
  if (!email || !password) {
    throw new ValidationError('email and password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ValidationError('User with this email already exists');
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashed,
    name
  });

  const token = signToken(user._id);

  // Do not return password
  const safeUser = {
    id: user._id,
    email: user.email,
    name: user.name
  };

  return { user: safeUser, token };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new ValidationError('email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AuthError('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthError('Invalid credentials');
  }

  const token = signToken(user._id);

  const safeUser = {
    id: user._id,
    email: user.email,
    name: user.name
  };

  return { user: safeUser, token };
}

function signToken(userId) {
  const payload = { userId };
  // TODO: Students can add jti, expiry, roles, etc.
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
}

module.exports = {
  registerUser,
  loginUser
};


