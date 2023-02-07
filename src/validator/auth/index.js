const { RegisterPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/invariantError');

const AuthValidator = {
  validateRegisterPayload: (payload) => {
    const validationResult = RegisterPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthValidator;
