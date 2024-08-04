const Joi = require('joi');

const FindByIdSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllCitiesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  provinceId: Joi.number().positive(),
});

module.exports = {
  FindByIdSchema,
  FindAllCitiesSchema,
};
