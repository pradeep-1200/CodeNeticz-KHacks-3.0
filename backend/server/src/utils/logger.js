const { createLogger, format, transports } = require('winston');

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  format.errors({ stack: true }),
  format.json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'aclc-api' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, category, userId, action, code, error }) => {
          let line = `[${timestamp}] ${level}`;
          if (category) line += ` [${category}]`;
          if (action)   line += ` [${action}]`;
          if (userId)   line += ` user:${userId}`;
          line += ` ${message}`;
          if (code)     line += ` code:${code}`;
          if (error)    line += ` error:${error}`;
          return line;
        })
      )
    })
  ]
});

module.exports = logger;
