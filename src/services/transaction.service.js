const Transaction = require('../models/transaction.model');
const { NotFoundError } = require('../utils/appError');

async function createTransaction(userId, data) {
  const payload = {
    ...data,
    userId
  };
  const tx = await Transaction.create(payload);
  return tx;
}

async function getTransactions(userId, filters = {}) {
  const query = { userId };

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  const txs = await Transaction.find(query).sort({ date: -1 });
  return txs;
}

async function getTransactionById(userId, id) {
  const tx = await Transaction.findOne({ _id: id, userId });
  if (!tx) {
    throw new NotFoundError('Transaction not found');
  }
  return tx;
}

async function updateTransaction(userId, id, updates) {
  const tx = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { new: true }
  );

  if (!tx) {
    throw new NotFoundError('Transaction not found');
  }

  return tx;
}

async function deleteTransaction(userId, id) {
  const result = await Transaction.findOneAndDelete({ _id: id, userId });
  if (!result) {
    throw new NotFoundError('Transaction not found');
  }
  return result;
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};


