const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeleteDocumentSchema,
  FindAllDocumentsSchema,
  CreateDocumentSchema,
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
    const validationResult = FindByIdOrDeleteDocumentSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllDocumentsPayload: (payload) => {
    const validationResult = FindAllDocumentsSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreateDocumentSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = DocumentValidator;
