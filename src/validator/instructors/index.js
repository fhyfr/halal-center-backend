const {
  FindByIdOrDeleteInstructorSchema,
  FindAllInstructorsSchema,
  CreateInstructorSchema,
  UpdateInstructorSchema,
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

const InstructorValidator = {
  validateFindByIdOrDeleteInstructorPayload: (payload) => {
    const validationResult = FindByIdOrDeleteInstructorSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllInstructorsPayload: (payload) => {
    const validationResult = FindAllInstructorsSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreateInstructorPayload: (payload) => {
    const validationResult = CreateInstructorSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdateInstructorPayload: (payload) => {
    const validationResult = UpdateInstructorSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = InstructorValidator;
