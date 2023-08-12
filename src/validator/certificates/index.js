const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeleteCertificateSchema,
  FindAllCertificatesSchema,
  CreateCertificateSchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const CertificateValidator = {
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeleteCertificateSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllCertificatesPayload: (payload) => {
    const validationResult = FindAllCertificatesSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreateCertificateSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CertificateValidator;
