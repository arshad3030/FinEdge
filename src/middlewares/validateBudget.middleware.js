const { ValidationError } = require('../utils/appError');

function validateBudget(req, res, next) {
  const { month, year, monthlyGoal, savingsTarget } = req.body;

  const errors = [];

  if (month != null && (typeof month !== 'number' || month < 1 || month > 12)) {
    errors.push('month must be a number between 1 and 12');
  }

  if (year != null && (typeof year !== 'number' || year <= 0)) {
    errors.push('year must be a positive number');
  }

  if (monthlyGoal != null && (typeof monthlyGoal !== 'number' || monthlyGoal < 0)) {
    errors.push('monthlyGoal must be a non-negative number');
  }

  if (savingsTarget != null && (typeof savingsTarget !== 'number' || savingsTarget < 0)) {
    errors.push('savingsTarget must be a non-negative number');
  }

  if (errors.length > 0) {
    return next(new ValidationError('Invalid budget input', errors));
  }

  return next();
}

module.exports = { validateBudget };

