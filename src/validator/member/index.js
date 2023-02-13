const { UpdateProfileSchema } = require('./schema');
const InvariantError = require('../../exceptions/invariantError');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const MemberValidator = {
  validateUpdateProfilePayload: (payload) => {
    const validationResult = UpdateProfileSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = MemberValidator;
