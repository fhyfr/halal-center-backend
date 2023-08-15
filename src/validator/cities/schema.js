const Joi = require('joi');

const FindByIdSchema = Joi.object({
  cityId: Joi.string().required(),
});

const FindAllCitiesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  provinceId: Joi.string(),
});

module.exports = {
  FindByIdSchema,
  FindAllCitiesSchema,
};
