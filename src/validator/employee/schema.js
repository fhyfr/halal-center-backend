const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const FindByIdOrDeleteEmployeeSchema = Joi.object({
  id: Joi.number().unsafe(),
});

const FindAllEmployeesSchema = Joi.object({
  page: Joi.number(),
  size: Joi.number(),
  query: Joi.string(),
});

const CreateEmployeeSchema = Joi.object({
  positionId: Joi.number().required(),
  nik: Joi.string().required(),
  fullName: Joi.string().required(),
  address: Joi.string().required(),
  phoneNumber: myCustomJoi
    .string()
    .phoneNumber({ defaultCountry: 'ID', strict: true }),
});

const UpdateEmployeeSchema = Joi.object({
  params: {
    id: Joi.number().unsafe(),
  },
  body: {
    positionId: Joi.number(),
    nik: Joi.string(),
    fullName: Joi.string(),
    address: Joi.string(),
    phoneNumber: myCustomJoi
      .string()
      .phoneNumber({ defaultCountry: 'ID', strict: true }),
  },
});

const MutationEmployeeSchema = Joi.object({
  params: {
    id: Joi.number().unsafe(),
  },
  body: {
    positionId: Joi.number(),
  },
});

module.exports = {
  FindByIdOrDeleteEmployeeSchema,
  FindAllEmployeesSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  MutationEmployeeSchema,
};
