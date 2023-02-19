const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeleteEmployeeSchema,
  FindAllEmployeesSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  MutationEmployeeSchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const EmployeeValidator = {
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeleteEmployeeSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllEmployeesPayload: (payload) => {
    const validationResult = FindAllEmployeesSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreateEmployeeSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePayload: (payload) => {
    const validationResult = UpdateEmployeeSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateMutationPayload: (payload) => {
    const validationResult = MutationEmployeeSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = EmployeeValidator;
