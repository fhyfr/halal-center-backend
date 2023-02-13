const {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
} = require('./schema');
const InvariantError = require('../../exceptions/invariantError');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const UserValidator = {
  validateForgotPasswordPayload: (payload) => {
    const validationResult = ForgotPasswordSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateResetPasswordPayload: (payload) => {
    const validationResult = ResetPasswordSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePasswordPayload: (payload) => {
    const validationResult = UpdatePasswordSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserValidator;
