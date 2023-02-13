const ClientError = require('./clientError');

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message || 'unauthorized', 401);
    this.name = 'AuthenticationsError';
  }
}

module.exports = AuthenticationError;
