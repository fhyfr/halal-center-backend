const Joi = require('joi');

const RegisterPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().required(),
  fullName: Joi.string().required(),
});

const LoginPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const VerifyUserPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().unsafe().required().strict(),
});

const ResendVerificationCodePayloadSchmea = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  RegisterPayloadSchema,
  LoginPayloadSchema,
  VerifyUserPayloadSchema,
  ResendVerificationCodePayloadSchmea,
};
