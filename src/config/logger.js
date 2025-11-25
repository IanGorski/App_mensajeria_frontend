const logger = {
  log: (level, message) => {
    const sanitizedMessage = logger.sanitize(message);
    console[level](sanitizedMessage);

    if (process.env.LOGGING_SERVICE_URL) {
      fetch(process.env.LOGGING_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level,
          message: sanitizedMessage,
          timestamp: new Date().toISOString()
        })
      }).catch((error) => console.error('Failed to send log:', error));
    }
  },

  sanitize: (message) => {
    // Datos sensibles
    return message.replace(/([\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,})/g, '[REDACTED_EMAIL]')
                  .replace(/(Bearer\s+[a-zA-Z0-9-_.]+)/g, '[REDACTED_TOKEN]');
  },

  info: (message) => logger.log('info', message),
  warn: (message) => logger.log('warn', message),
  error: (message) => logger.log('error', message)
};

export default logger;