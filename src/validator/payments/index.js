const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeletePaymentSchema,
  FindAllPaymentsSchema,
  CreatePaymentSchema,
  UpdatePaymentSchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const PaymentValidator = {
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeletePaymentSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllPaymentsPayload: (payload) => {
    const validationResult = FindAllPaymentsSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreatePaymentSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePayload: (payload) => {
    const validationResult = UpdatePaymentSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PaymentValidator;
