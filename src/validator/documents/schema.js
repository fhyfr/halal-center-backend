const Joi = require('joi');

const FindByIdOrDeleteDocumentSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllDocumentsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.number().positive(),
  instructorId: Joi.number().positive(),
  userId: Joi.number().positive(),
  type: Joi.string().valid(
    'MODULE',
    'CURRICULUM',
    'CERTIFICATE_MEMBER',
    'CERTIFICATE_INSTRUCTOR',
  ),
});

const CreateDocumentSchema = Joi.object({
  courseId: Joi.number().positive().required(),
  userId: Joi.number().positive(),
  instructorId: Joi.number().positive(),
  url: Joi.string().required(),
  type: Joi.string()
    .valid(
      'MODULE',
      'CURRICULUM',
      'CERTIFICATE_MEMBER',
      'CERTIFICATE_INSTRUCTOR',
    )
    .required(),
});

module.exports = {
  FindByIdOrDeleteDocumentSchema,
  FindAllDocumentsSchema,
  CreateDocumentSchema,
};
