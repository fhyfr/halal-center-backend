const { RolePayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/invariantError');

const RoleValidator = {
  validateCreateRolePayload: (payload) => {
    const validationResult = RolePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = RoleValidator;
