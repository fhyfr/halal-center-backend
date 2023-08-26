const Joi = require('joi');

const FindByIdSchema = Joi.object({
  provinceId: Joi.number().positive(),
});

const FindAllProvincesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
});

module.exports = {
  FindByIdSchema,
  FindAllProvincesSchema,
};
