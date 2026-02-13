const { registerUser, loginUser } = require('../services/user.service');
const { asyncHandler } = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const result = await registerUser({ email, password, name });
  return res.status(201).json({
    message: 'User registered successfully',
    ...result
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });
  return res.status(200).json({
    message: 'Login successful',
    ...result
  });
});

module.exports = {
  register,
  login
};


