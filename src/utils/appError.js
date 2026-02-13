class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation error', details) {
    super(message, 400, details);
  }
}

class AuthError extends AppError {
  constructor(message = 'Authentication error', statusCode = 401, details) {
    super(message, statusCode, details);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details) {
    super(message, 404, details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError
};


