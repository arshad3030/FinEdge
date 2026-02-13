const dotenv = require('dotenv');

let cachedConfig = null;

function loadConfig() {
  if (cachedConfig) return cachedConfig;

  dotenv.config();

  const config = {
    port: process.env.PORT,
    dbConnection: process.env.DB_CONNECTION,
    dbName: process.env.DB_NAME || 'test',
    jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
    logFilePath: process.env.LOG_FILE_PATH || 'logs/requests.log'
  };

  // TODO: Students should add stricter validation and throw if critical vars are missing.
  if (!config.dbConnection) {
    console.warn('Warning: DB_CONNECTION is not set. Using default/mocked setup may be required.');
  }

  cachedConfig = config;
  return config;
}

module.exports = { loadConfig };


