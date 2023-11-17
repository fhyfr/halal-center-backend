const { CertificatePayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/invariantError');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const TemplateValidator = {
  validateCertificatePayload: (payload) => {
    const validationResult = CertificatePayloadSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = TemplateValidator;
