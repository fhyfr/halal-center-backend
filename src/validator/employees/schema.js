const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const FindByIdOrDeleteEmployeeSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllEmployeesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  positionId: Joi.number().positive(),
  departmentId: Joi.number().positive(),
});

const CreateEmployeeSchema = Joi.object({
  positionId: Joi.number().positive().required(),
  departmentId: Joi.number().positive().required(),
  nik: Joi.string().required(),
  fullName: Joi.string().required(),
  address: Joi.string().required(),
  phoneNumber: myCustomJoi
    .string()
    .phoneNumber({ defaultCountry: 'ID', strict: true }),
  gender: Joi.string().valid('MALE', 'FEMALE').required(),
  joinDate: Joi.date().required(),
  salary: Joi.number().positive().allow(0).required(),
});

const UpdateEmployeeSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
    nik: Joi.string(),
    fullName: Joi.string(),
    address: Joi.string(),
    phoneNumber: myCustomJoi
      .string()
      .phoneNumber({ defaultCountry: 'ID', strict: true }),
    gender: Joi.string().valid('MALE', 'FEMALE'),
    joinDate: Joi.date(),
    salary: Joi.number().positive().allow(0),
  },
});

const MutationEmployeeSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
    positionId: Joi.number().positive().required(),
    departmentId: Joi.number().positive().required(),
  },
});

module.exports = {
  FindByIdOrDeleteEmployeeSchema,
  FindAllEmployeesSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  MutationEmployeeSchema,
};
