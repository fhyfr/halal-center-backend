const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeleteRegistrationPaymentSchema,
  FindAllRegistrationPaymentsSchema,
  CreateRegistrationPaymentSchema,
  UpdateRegistrationPaymentSchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const RegistrationPaymentValidator = {
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeleteRegistrationPaymentSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllRegistrationPaymentsPayload: (payload) => {
    const validationResult = FindAllRegistrationPaymentsSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreateRegistrationPaymentSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePayload: (payload) => {
    const validationResult = UpdateRegistrationPaymentSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = RegistrationPaymentValidator;
