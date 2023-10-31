const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const FindAllMembersSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.number().positive(),
});

const UpdateProfileSchema = myCustomJoi.object({
  username: myCustomJoi.string().min(2),
  fullName: myCustomJoi.string(),
  profilePicture: myCustomJoi.string(),
  provinceId: myCustomJoi.number().positive(),
  cityId: myCustomJoi.number().positive(),
  address: myCustomJoi.string(),
  phoneNumber: myCustomJoi
    .string()
    .phoneNumber({ defaultCountry: 'ID', strict: true }),
  dateOfBirth: myCustomJoi.date(),
  education: myCustomJoi
    .string()
    .valid('SLTA', 'D1', 'D2', 'D3', 'S1_OR_D4', 'S2', 'S3'),
  workExperience: myCustomJoi.number().positive(),
  facebook: myCustomJoi.string(),
  linkedin: myCustomJoi.string(),
});

module.exports = { FindAllMembersSchema, UpdateProfileSchema };
