const Joi = require('joi');

const RolePayloadSchema = Joi.object({
  roleName: Joi.string().required(),
});

const FindAllRolesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
});

module.exports = { RolePayloadSchema, FindAllRolesSchema };
