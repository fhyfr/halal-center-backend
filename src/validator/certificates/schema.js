const Joi = require('joi');

const FindByIdOrDeleteCertificateSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllCertificatesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.number().positive(),
  userId: Joi.number().positive(),
  type: Joi.string().valid('CERTIFICATE_MEMBER', 'CERTIFICATE_INSTRUCTOR'),
});

const CreateCertificateSchema = Joi.object({
  courseId: Joi.number().positive().required(),
  userId: Joi.number().positive(),
  url: Joi.string().required(),
  type: Joi.string()
    .valid('CERTIFICATE_MEMBER', 'CERTIFICATE_INSTRUCTOR')
    .required(),
});

module.exports = {
  FindByIdOrDeleteCertificateSchema,
  FindAllCertificatesSchema,
  CreateCertificateSchema,
};
