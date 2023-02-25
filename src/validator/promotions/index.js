const InvariantError = require('../../exceptions/invariantError');
const {
  FindByIdOrResendOrDeletePromotionSchema,
  FindAllPromotionsSchema,
  CreatePromotionSchema,
} = require('./schema');

// remove double quotes characters on validation result
const options = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

const PromotionValidator = {
  validateFindByIdResendDeletePayload: (payload) => {
    const validationResult = FindByIdOrResendOrDeletePromotionSchema.validate(
      payload,
      options,
    );
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateFindAllPromotionsPayload: (payload) => {
    const validationResult = FindAllPromotionsSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateCreatePayload: (payload) => {
    const validationResult = CreatePromotionSchema.validate(payload, options);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PromotionValidator;
