const {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  FindByIdOrDeleteSchema,
  FindAllUsersSchema,
  UpdateUserRoleSchema,
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
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeleteSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllUsersPayload: (payload) => {
    const validationResult = FindAllUsersSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdateUserRolePayload: (payload) => {
    const validationResult = UpdateUserRoleSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserValidator;
