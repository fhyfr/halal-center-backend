const { FindAllMembersSchema, UpdateProfileSchema } = require('./schema');
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
  validateFindAllMembersPayload: (payload) => {
    const validationResult = FindAllMembersSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdateProfilePayload: (payload) => {
    const validationResult = UpdateProfileSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = MemberValidator;
