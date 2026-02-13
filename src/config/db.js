const mongoose = require('mongoose');

async function connectDB(config) {
  const { dbConnection, dbName } = config;

  if (!dbConnection) {
    throw new Error('DB_CONNECTION is required to connect to MongoDB');
  }

  // TODO: Students can extract options or add retries/backoff logic.
  await mongoose.connect(dbConnection, {
    dbName
  });

  console.log('Connected to MongoDB:', dbName);
}

module.exports = { connectDB };


