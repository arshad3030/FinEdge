const express = require('express');

const { errorHandler } = require('./middlewares/error.middleware');
const { requestLogger } = require('./middlewares/logger.middleware');
const corsMiddleware = require('./middlewares/cors.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const budgetRoutes = require('./routes/budget.routes');
const summaryRoutes = require('./routes/summary.routes');

const app = express();

// CORS middleware - must be before routes
app.use(corsMiddleware);

// Core middlewares
app.use(express.json());

// Global rate limiter (applies to all routes)
app.use(apiLimiter);

// Custom request logger middleware (file + console)
app.use(requestLogger);

// Health check route
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);
app.use('/summary', summaryRoutes);

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;


