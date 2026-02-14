const Transaction = require('../models/transaction.model');
const cacheService = require('../utils/cache');

// Cache TTL: 60 seconds (summary data is cached for 1 minute)
const CACHE_TTL_SECONDS = 60;

async function getSummary(userId, { month, year } = {}) {
  // Generate cache key based on userId and optional filters
  const cacheKey = cacheService.generateKey('summary', { userId, month, year });

  // Try to get from cache first
  const cached = cacheService.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch from database
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

  const summary = {
    totalIncome,
    totalExpense,
    balance,
    byCategory,
    monthlyGoal,
    savingsTarget,
    goalStatus
  };

  // Store in cache with TTL
  cacheService.set(cacheKey, summary, CACHE_TTL_SECONDS);

  return summary;
}

/**
 * Invalidate cache for a specific user's summary
 * Call this when transactions are created/updated/deleted
 */
function invalidateUserSummaryCache(userId) {
  // Invalidate all summary cache entries for this user
  // Since we can't easily list all keys, we'll rely on TTL expiry
  // For a more robust solution, you could maintain a list of active keys per user
  // For now, the cache will expire naturally after TTL
}

module.exports = { getSummary, invalidateUserSummaryCache };


