const Transaction = require('../models/transaction.model');

async function getSummary(userId, { month, year } = {}) {
  const match = { userId };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    match.date = { $gte: start, $lte: end };
  }

  const transactions = await Transaction.find(match);

  let totalIncome = 0;
  let totalExpense = 0;
  const byCategory = {};

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
    }

    if (!byCategory[tx.category]) {
      byCategory[tx.category] = 0;
    }
    byCategory[tx.category] += tx.amount;
  }

  const balance = totalIncome - totalExpense;

  // TODO: Students should integrate Budget model or user preferences to compute:
  const monthlyGoal = null;
  const savingsTarget = null;
  const goalStatus = null; // e.g., "on_track" | "over_budget"

  return {
    totalIncome,
    totalExpense,
    balance,
    byCategory,
    monthlyGoal,
    savingsTarget,
    goalStatus
  };
}

module.exports = { getSummary };


