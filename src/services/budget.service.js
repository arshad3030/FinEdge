const Budget = require('../models/budget.model');
const { NotFoundError } = require('../utils/appError');

async function createBudget(userId, data) {
  const payload = {
    ...data,
    userId
  };
  const budget = await Budget.create(payload);
  return budget;
}

async function getBudgets(userId, filters = {}) {
  const query = { userId };

  if (filters.month) {
    query.month = Number(filters.month);
  }

  if (filters.year) {
    query.year = Number(filters.year);
  }

  const budgets = await Budget.find(query).sort({ year: -1, month: -1 });
  return budgets;
}

async function getBudgetById(userId, id) {
  const budget = await Budget.findOne({ _id: id, userId });
  if (!budget) {
    throw new NotFoundError('Budget not found');
  }
  return budget;
}

async function updateBudget(userId, id, updates) {
  const budget = await Budget.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { new: true }
  );

  if (!budget) {
    throw new NotFoundError('Budget not found');
  }

  return budget;
}

async function deleteBudget(userId, id) {
  const result = await Budget.findOneAndDelete({ _id: id, userId });
  if (!result) {
    throw new NotFoundError('Budget not found');
  }
  return result;
}

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget
};

