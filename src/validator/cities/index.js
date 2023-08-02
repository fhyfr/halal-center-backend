const InvariantError = require('../../exceptions/invariantError');
const { FindByIdSchema, FindAllCitiesSchema } = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const CityValidator = {
  validateFindByIdPayload: (payload) => {
    const validationResult = FindByIdSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllCitiesPayload: (payload) => {
    const validationResult = FindAllCitiesSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CityValidator;
