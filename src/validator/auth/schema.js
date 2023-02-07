const Joi = require('joi');

const RegisterPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().required(),
  fullName: Joi.string().required(),
});

module.exports = { RegisterPayloadSchema };
