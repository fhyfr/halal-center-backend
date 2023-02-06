const { ForbiddenError } = require('@casl/ability');
const ClientError = require('./clientError');

const errorHandler = (err, res) => {
  const { statusCode, message, status } = err;

  // handle casl ability thrown
  if (err instanceof ForbiddenError) {
    res.status(403).json({
      message: err.message,
    });
  } else if (err instanceof ClientError) {
    res.status(statusCode).json({
      status,
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
      status,
      message: errorMessage,
    });
  }
};

module.exports = { errorHandler };
