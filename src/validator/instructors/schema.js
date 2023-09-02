const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const FindByIdOrDeleteInstructorSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllInstructorsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  courseId: Joi.number().positive(),
});

const CreateInstructorSchema = Joi.object({
  courseIds: Joi.array().items(Joi.number()),
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  profilePicture: Joi.string().required(),
  provinceId: Joi.number().positive().required(),
  cityId: Joi.number().positive().required(),
  address: Joi.string().required(),
  phoneNumber: myCustomJoi
    .string()
    .phoneNumber({ defaultCountry: 'ID', strict: true }),
  facebook: Joi.string().required(),
  linkedin: Joi.string().required(),
});

const UpdateInstructorSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
    email: Joi.string().email(),
    courseIds: Joi.array().items(Joi.number()).min(1),
    fullName: Joi.string(),
    username: Joi.string(),
    password: Joi.string(),
    profilePicture: Joi.string(),
    provinceId: Joi.number().positive(),
    cityId: Joi.number().positive(),
    address: Joi.string(),
    phoneNumber: myCustomJoi
      .string()
      .phoneNumber({ defaultCountry: 'ID', strict: true }),
    facebook: Joi.string(),
    linkedin: Joi.string(),
  },
});

module.exports = {
  FindByIdOrDeleteInstructorSchema,
  FindAllInstructorsSchema,
  CreateInstructorSchema,
  UpdateInstructorSchema,
};
