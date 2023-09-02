const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const UpdateProfileSchema = myCustomJoi.object({
  username: myCustomJoi.string().min(2),
  fullName: myCustomJoi.string(),
  profilePicture: myCustomJoi.string(),
  provinceId: Joi.number().positive(),
  cityId: Joi.number().positive(),
  address: myCustomJoi.string(),
  phoneNumber: myCustomJoi
    .string()
    .phoneNumber({ defaultCountry: 'ID', strict: true }),
  facebook: myCustomJoi.string(),
  linkedin: myCustomJoi.string(),
});

module.exports = { UpdateProfileSchema };
