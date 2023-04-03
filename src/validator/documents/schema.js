const Joi = require('joi');

const FindByIdOrDeleteDocumentSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllDocumentsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.number().positive(),
  userId: Joi.number().positive(),
  type: Joi.string().valid('MODULE', 'CURRICULUM', 'CERTIFICATE'),
});

const CreateDocumentSchema = Joi.object({
  courseId: Joi.number().positive().required(),
  userId: Joi.number().positive(),
  url: Joi.string().required(),
  type: Joi.string().valid('MODULE', 'CURRICULUM', 'CERTIFICATE').required(),
});

module.exports = {
  FindByIdOrDeleteDocumentSchema,
  FindAllDocumentsSchema,
  CreateDocumentSchema,
};
