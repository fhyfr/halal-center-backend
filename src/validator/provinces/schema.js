const Joi = require('joi');

const FindByIdSchema = Joi.object({
  provinceId: Joi.string().required(),
});

const FindAllProvincesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
});

module.exports = {
  FindByIdSchema,
  FindAllProvincesSchema,
};
