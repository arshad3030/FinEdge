const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget
} = require('../services/budget.service');
const { asyncHandler } = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const budget = await createBudget(userId, req.body);
  return res.status(201).json(budget);
});

const list = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { month, year } = req.query;
  const budgets = await getBudgets(userId, { month, year });
  return res.status(200).json(budgets);
});

const getOne = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const budget = await getBudgetById(userId, id);
  return res.status(200).json(budget);
});

const update = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const budget = await updateBudget(userId, id, req.body);
  return res.status(200).json(budget);
});

const remove = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  await deleteBudget(userId, id);
  return res.status(204).send();
});

module.exports = {
  create,
  list,
  getOne,
  update,
  remove
};

