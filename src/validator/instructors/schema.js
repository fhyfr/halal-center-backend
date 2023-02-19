const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const FindByIdOrDeleteInstructorSchema = Joi.object({
  id: Joi.number().positive().unsafe(),
});

const FindAllInstructorsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  courseId: Joi.number().positive(),
});

const CreateInstructorSchema = Joi.object({
  email: Joi.string().email().required(),
  courseIds: Joi.array().items(Joi.number().positive()),
  fullName: Joi.string().required(),
  profilePicture: Joi.string().required(),
  address: Joi.string().required(),
  phoneNumber: myCustomJoi
    .string()
    .phoneNumber({ defaultCountry: 'ID', strict: true }),
  facebook: Joi.string().required(),
  linkedin: Joi.string().required(),
});

const UpdateInstructorSchema = Joi.object({
  params: {
    id: Joi.number().positive().unsafe(),
  },
  body: {
    email: Joi.string().email(),
    courseIds: Joi.array().items(Joi.number().positive()).min(1),
    fullName: Joi.string(),
    profilePicture: Joi.string(),
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
