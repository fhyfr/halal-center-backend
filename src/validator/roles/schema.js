const Joi = require('joi');

const RolePayloadSchema = Joi.object({
  roleName: Joi.string().required(),
});

module.exports = { RolePayloadSchema };
