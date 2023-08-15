const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const FindByIdOrDeleteInstructorSchema = Joi.object({
  instructorId: Joi.string().required(),
});

const FindAllInstructorsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  courseId: Joi.string(),
});

const CreateInstructorSchema = Joi.object({
  courseIds: Joi.array().items(Joi.string()),
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  profilePicture: Joi.string().required(),
  provinceId: Joi.string().required(),
  cityId: Joi.string().required(),
  address: Joi.string().required(),
  phoneNumber: myCustomJoi
    .string()
    .phoneNumber({ defaultCountry: 'ID', strict: true }),
  facebook: Joi.string().required(),
  linkedin: Joi.string().required(),
});

const UpdateInstructorSchema = Joi.object({
  params: {
    instructorId: Joi.string().required(),
  },
  body: {
    email: Joi.string().email(),
    courseIds: Joi.array().items(Joi.string()).min(1),
    fullName: Joi.string(),
    username: Joi.string(),
    password: Joi.string(),
    profilePicture: Joi.string(),
    provinceId: Joi.string(),
    cityId: Joi.string(),
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
