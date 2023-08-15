const Joi = require('joi');

const FindByIdOrDeleteCertificateSchema = Joi.object({
  certificateId: Joi.string(),
});

const FindAllCertificatesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.string(),
  userId: Joi.string(),
  instructorId: Joi.string(),
  type: Joi.string().valid('CERTIFICATE_MEMBER', 'CERTIFICATE_INSTRUCTOR'),
});

const CreateCertificateSchema = Joi.object({
  courseId: Joi.string().required(),
  userId: Joi.string(),
  instructorId: Joi.string(),
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
