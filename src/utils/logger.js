const fs = require('fs/promises');
const path = require('path');
const { loadConfig } = require('../config/env');

const config = loadConfig();
const logFilePath = config.logFilePath;

async function appendLog(line) {
  try {
    const dir = path.dirname(logFilePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(logFilePath, line + '\n', { encoding: 'utf8' });
  } catch (err) {
    // In a real app, we might report this elsewhere; for assignment, we just log.
    console.error('Failed to write log file', err);
  }
}

module.exports = { appendLog };


