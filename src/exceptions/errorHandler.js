const { ForbiddenError } = require('@casl/ability');
const logger = require('../helpers/logger');
const ClientError = require('./clientError');

const errorHandler = (err, res) => {
  const { statusCode, message } = err;

  logger.error(err.message);

  // handle casl ability thrown
  if (err instanceof ForbiddenError) {
    res.status(403).json({
      message: err.message,
    });
  } else if (err instanceof ClientError) {
    res.status(statusCode).json({
      message,
    });
  } else {
    // server error
    let errorMessage;

    if (message) {
      errorMessage = message;
    } else {
      errorMessage = 'internal server error';
    }

    res.status(500).json({
      message: errorMessage,
    });
  }
};

module.exports = { errorHandler };
