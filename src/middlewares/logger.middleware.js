const { appendLog } = require('../utils/logger');

async function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user ? req.user.id || req.user._id : null;
    const logLine = JSON.stringify({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      userId,
      timestamp: new Date().toISOString()
    });

    // Fire and forget; we don't await here to not block response
    appendLog(logLine);
    console.log(logLine);
  });

  next();
}

module.exports = { requestLogger };


