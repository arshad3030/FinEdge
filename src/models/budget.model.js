const mongoose = require('mongoose');

// Optional model: students can extend or replace with user-level fields.
const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    month: {
      type: Number, // 1-12
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    monthlyGoal: {
      type: Number,
      required: true
    },
    savingsTarget: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Budget', budgetSchema);


