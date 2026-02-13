const mongoose = require('mongoose');

// TODO: Students should add more user fields (preferences, etc.) as needed.
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
      // NOTE: Store only hashed passwords.
    },
    name: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);


