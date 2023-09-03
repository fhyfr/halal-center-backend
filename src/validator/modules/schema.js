const Joi = require('joi');

const FindByIdOrDeleteModuleSchema = Joi.object({
  id: Joi.number().positive().required(),
});

const FindAllModulesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.number().positive(),
});

const CreateModuleSchema = Joi.object({
  courseId: Joi.number().positive().required(),
  url: Joi.string().required(),
});

module.exports = {
  FindByIdOrDeleteModuleSchema,
  FindAllModulesSchema,
  CreateModuleSchema,
};
