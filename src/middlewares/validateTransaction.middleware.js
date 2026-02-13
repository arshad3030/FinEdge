const { ValidationError } = require('../utils/appError');

function validateTransaction(req, res, next) {
  const { type, amount, date } = req.body;

  const errors = [];

  if (type && !['income', 'expense'].includes(type)) {
    errors.push('type must be either "income" or "expense"');
  }

  if (amount != null && (typeof amount !== 'number' || amount < 0)) {
    errors.push('amount must be a positive number');
  }

  if (date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      errors.push('date must be a valid date string');
    }
  }

  if (errors.length > 0) {
    return next(new ValidationError('Invalid transaction input', errors));
  }

  return next();
}

module.exports = { validateTransaction };


