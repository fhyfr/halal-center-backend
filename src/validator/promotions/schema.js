const Joi = require('joi');

const FindByIdOrResendOrDeletePromotionSchema = Joi.object({
  id: Joi.number().positive().unsafe(),
});

const FindAllPromotionsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
});

const CreatePromotionSchema = Joi.object({
  courseIds: Joi.array().items(Joi.number().positive()),
  receiverId: Joi.number().required(),
  rawBody: Joi.string().required(),
  htmlBody: Joi.string().required(),
  type: Joi.string().valid('SPESIFIC_USER').required(),
});

module.exports = {
  FindByIdOrResendOrDeletePromotionSchema,
  FindAllPromotionsSchema,
  CreatePromotionSchema,
};
