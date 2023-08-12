const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeleteModuleSchema,
  FindAllModulesSchema,
  CreateModuleSchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const DocumentValidator = {
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeleteModuleSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllModulesPayload: (payload) => {
    const validationResult = FindAllModulesSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreateModuleSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = DocumentValidator;
