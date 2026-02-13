const { getSummary } = require('../services/summary.service');
const { asyncHandler } = require('../utils/asyncHandler');

const get = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { month, year } = req.query;

  const summary = await getSummary(userId, {
    month: month ? Number(month) : undefined,
    year: year ? Number(year) : undefined
  });

  return res.status(200).json(summary);
});

module.exports = {
  get
};


