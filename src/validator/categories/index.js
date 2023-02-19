const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrDeleteCategorySchema,
  FindBySlugSchema,
  FindAllCategoriesSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const CategoryValidator = {
  validateFindByIdOrDeletePayload: (payload) => {
    const validationResult = FindByIdOrDeleteCategorySchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindBySlugPayload: (payload) => {
    const validationResult = FindBySlugSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllCategoriesPayload: (payload) => {
    const validationResult = FindAllCategoriesSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreateCategorySchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUpdatePayload: (payload) => {
    const validationResult = UpdateCategorySchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CategoryValidator;
