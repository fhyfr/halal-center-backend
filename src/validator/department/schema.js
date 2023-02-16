const Joi = require('joi');

const FindByIdOrDeleteDepartmentSchema = Joi.object({
  id: Joi.number().unsafe(),
});

const FindAllDepartmentsSchema = Joi.object({
  page: Joi.number(),
  size: Joi.number(),
  query: Joi.string(),
});

const CreateDepartmentSchema = Joi.object({
  departmentName: Joi.string().required(),
});

const UpdateDepartmentSchema = Joi.object({
  params: {
    id: Joi.number().unsafe(),
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
