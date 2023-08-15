const Joi = require('joi');

const { user: userMessage } = require('../../helpers/responseMessage');

const ForgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const ResetPasswordSchema = Joi.object({
  params: {
    userId: Joi.string().required(),
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

const FindByIdOrDeleteSchema = Joi.object({
  userId: Joi.string().required(),
});

const FindAllUsersSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  roleId: Joi.string(),
});

const UpdateUserRoleSchema = Joi.object({
  userId: Joi.string().required(),
  roleId: Joi.string().required(),
});

const CreateNewUserSchema = Joi.object({
  roleId: Joi.string().required(),
  username: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const UpdateUserSchema = Joi.object({
  params: {
    userId: Joi.string(),
  },
  body: {
    roleId: Joi.string(),
    username: Joi.string().min(2),
    email: Joi.string().email(),
  },
});

module.exports = {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  FindByIdOrDeleteSchema,
  FindAllUsersSchema,
  UpdateUserRoleSchema,
  CreateNewUserSchema,
  UpdateUserSchema,
};
