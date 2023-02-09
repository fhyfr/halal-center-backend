const {
  RegisterPayloadSchema,
  LoginPayloadSchema,
  VerifyUserPayloadSchema,
  ResendVerificationCodePayloadSchmea,
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

const AuthValidator = {
  validateRegisterPayload: (payload) => {
    const validationResult = RegisterPayloadSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateLoginPayload: (payload) => {
    const validationResult = LoginPayloadSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateVerifyUserPayload: (payload) => {
    const validationResult = VerifyUserPayloadSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateResendVerificationCodePayload: (payload) => {
    const validationResult = ResendVerificationCodePayloadSchmea.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthValidator;
