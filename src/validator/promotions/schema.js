const Joi = require('joi');

const FindByIdOrResendOrDeletePromotionSchema = Joi.object({
  promotionId: Joi.number().positive(),
});

const FindAllPromotionsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
});

const CreatePromotionSchema = Joi.object({
  courseIds: Joi.array().items(Joi.number().positive()),
  subject: Joi.string().required(),
  receiverId: Joi.number().required(),
  type: Joi.string().valid('SPESIFIC_USER').required(),
});

module.exports = {
  FindByIdOrResendOrDeletePromotionSchema,
  FindAllPromotionsSchema,
  CreatePromotionSchema,
};
