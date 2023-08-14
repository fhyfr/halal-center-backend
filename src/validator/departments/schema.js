const Joi = require('joi');

const FindByIdOrDeleteDepartmentSchema = Joi.object({
  departmentId: Joi.number().positive(),
});

const FindAllDepartmentsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
});

const CreateDepartmentSchema = Joi.object({
  departmentName: Joi.string().required(),
});

const UpdateDepartmentSchema = Joi.object({
  params: {
    departmentId: Joi.number().positive(),
  },
  body: {
    departmentName: Joi.string().required(),
  },
});

module.exports = {
  FindByIdOrDeleteDepartmentSchema,
  FindAllDepartmentsSchema,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
};
