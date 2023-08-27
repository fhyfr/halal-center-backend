const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeleteOperationalPaymentSchema,
  FindAllOperationalPaymentsSchema,
  CreateOperationalPaymentSchema,
  UpdateOperationalPaymentSchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const OperationalPaymentValidator = {
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeleteOperationalPaymentSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllOperationalPaymentsPayload: (payload) => {
    const validationResult = FindAllOperationalPaymentsSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreateOperationalPaymentSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePayload: (payload) => {
    const validationResult = UpdateOperationalPaymentSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = OperationalPaymentValidator;
