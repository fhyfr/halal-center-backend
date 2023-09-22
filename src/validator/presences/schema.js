const Joi = require('joi');

const FindByIdOrDeletePresenceSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllPresencesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  attendanceId: Joi.number().positive(),
  userId: Joi.number().positive(),
});

const CreatePresenceSchema = Joi.object({
  attendanceId: Joi.number().positive().required(),
  userId: Joi.number().positive().required(),
  summary: Joi.string().required(),
});

module.exports = {
  FindByIdOrDeletePresenceSchema,
  FindAllPresencesSchema,
  CreatePresenceSchema,
};
