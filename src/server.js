const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { loadConfig } = require('./config/env');
const { connectDB } = require('./config/db');

const config = loadConfig();
const PORT = config.port;

async function startServer() {
  try {
    await connectDB(config);

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();


