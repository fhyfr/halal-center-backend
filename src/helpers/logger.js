require('dotenv').config();
const { createLogger, format, transports } = require('winston');

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const logger = createLogger({
  level: process.env.LOG_LEVEL,
  levels: logLevels,
  defaultMeta: { service: process.env.APP_NAME },
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
  exceptionHandlers: [new transports.File({ filename: 'exceptions.log' })],
  rejectionHandlers: [new transports.File({ filename: 'rejections.log' })],
});

module.exports = logger;
