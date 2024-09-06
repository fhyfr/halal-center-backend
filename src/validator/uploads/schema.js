const Joi = require('joi');

const ProxyImageSchema = Joi.object({
  imageUrl: Joi.string().uri().required(),
});

module.exports = { ProxyImageSchema };
