const { AppError } = require('../utils/appError');

// Global error-handling middleware
// Signature with 4 args is required for Express to treat it as error handler.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (!(err instanceof AppError)) {
    // Wrap unknown errors
    // In a real app, we might log the stack trace in detail.
    // For the assignment, this encourages using custom error classes.
    // eslint-disable-next-line no-console
    console.error('Unexpected error:', err);
    err = new AppError('Internal Server Error');
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    error: {
      name: err.name,
      message: err.message,
      details: err.details || null
    }
  });
}

module.exports = { errorHandler };


