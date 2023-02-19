const Joi = require('joi');

const { user: userMessage } = require('../../helpers/responseMessage');

const ForgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const ResetPasswordSchema = Joi.object({
  params: {
    id: Joi.number().positive().unsafe(),
  },
  body: {
    newPassword: Joi.string().min(8).required(),
    confirmNewPassword: Joi.any()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': userMessage.password.mustMatch,
      }),
  },
});

const UpdatePasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
  newPassword: Joi.string().min(8).required(),
  confirmNewPassword: Joi.any()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': userMessage.password.mustMatch,
    }),
});

module.exports = {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
};
