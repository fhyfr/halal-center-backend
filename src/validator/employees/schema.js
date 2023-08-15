const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const FindByIdOrDeleteEmployeeSchema = Joi.object({
  employeeId: Joi.string().required(),
});

const FindAllEmployeesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  positionId: Joi.string(),
  departmentId: Joi.string(),
});

const CreateEmployeeSchema = Joi.object({
  positionId: Joi.string().required().required(),
  departmentId: Joi.string().required().required(),
  nik: Joi.string().required(),
  fullName: Joi.string().required(),
  provinceId: Joi.string().required().required(),
  cityId: Joi.string().required().required(),
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
    employeeId: Joi.string().required(),
  },
  body: {
    nik: Joi.string(),
    fullName: Joi.string(),
    provinceId: Joi.string(),
    cityId: Joi.string(),
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
    employeeId: Joi.string().required(),
  },
  body: {
    positionId: Joi.string().required(),
    departmentId: Joi.string().required(),
  },
});

module.exports = {
  FindByIdOrDeleteEmployeeSchema,
  FindAllEmployeesSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  MutationEmployeeSchema,
};
