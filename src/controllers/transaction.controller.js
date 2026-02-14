const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} = require('../services/transaction.service');
const { asyncHandler } = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tx = await createTransaction(userId, req.body);
  return res.status(201).json(tx);
});

const list = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type, startDate, endDate } = req.query;
  const txs = await getTransactions(userId, { type, startDate, endDate });
  return res.status(200).json(txs);
});

const getOne = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const tx = await getTransactionById(userId, id);
  return res.status(200).json(tx);
});

const update = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  console.log(req.body);
  const tx = await updateTransaction(userId, id, req.body);
  return res.status(200).json(tx);
});

const remove = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  await deleteTransaction(userId, id);
  return res.status(204).send();
});

module.exports = {
  create,
  list,
  getOne,
  update,
  remove
};


