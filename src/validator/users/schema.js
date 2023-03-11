const Joi = require('joi');

const { user: userMessage } = require('../../helpers/responseMessage');

const ForgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const ResetPasswordSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
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
  id: Joi.number().positive(),
});

const FindAllUsersSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  roleId: Joi.number().positive(),
});

const UpdateUserRoleSchema = Joi.object({
  userId: Joi.number().positive().required(),
  roleId: Joi.number().positive().required(),
});

const CreateNewUserSchema = Joi.object({
  roleId: Joi.number().positive().required(),
  username: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const UpdateUserSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
    roleId: Joi.number().positive(),
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
