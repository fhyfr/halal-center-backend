const InvariantError = require('../../exceptions/invariantError');
const { ProxyImageSchema } = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const UploadValidator = {
  validateProxyImagePayload: (payload) => {
    const validationResult = ProxyImageSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadValidator;
