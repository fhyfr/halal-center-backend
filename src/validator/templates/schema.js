const Joi = require('joi');

const CertificatePayloadSchema = Joi.object({
  courseId: Joi.number().positive().required(),
});

const ScorePayloadSchema = Joi.object({
  testId: Joi.number().positive().required(),
});

module.exports = { CertificatePayloadSchema, ScorePayloadSchema };
