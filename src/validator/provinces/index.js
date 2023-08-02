const InvariantError = require('../../exceptions/invariantError');

const { FindByIdSchema, FindAllProvincesSchema } = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const ProvinceValidator = {
  validateFindByIdPayload: (payload) => {
    const validationResult = FindByIdSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllProvincesPayload: (payload) => {
    const validationResult = FindAllProvincesSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ProvinceValidator;
