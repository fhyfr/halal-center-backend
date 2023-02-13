const { RolePayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/invariantError');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const RoleValidator = {
  validateCreateRolePayload: (payload) => {
    const validationResult = RolePayloadSchema.validate(payload, options);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = RoleValidator;
