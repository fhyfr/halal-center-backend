const Joi = require('joi');

const FindByIdOrDeleteModuleSchema = Joi.object({
  moduleId: Joi.string().required(),
});

const FindAllModulesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.string(),
});

const CreateModuleSchema = Joi.object({
  courseId: Joi.string().required(),
  url: Joi.string().required(),
});

module.exports = {
  FindByIdOrDeleteModuleSchema,
  FindAllModulesSchema,
  CreateModuleSchema,
};
