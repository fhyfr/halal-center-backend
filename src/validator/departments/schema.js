const Joi = require('joi');

const FindByIdOrDeleteDepartmentSchema = Joi.object({
  id: Joi.number().positive().unsafe(),
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
    id: Joi.number().positive().unsafe(),
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
