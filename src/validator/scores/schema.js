const Joi = require('joi');

const FindByIdOrDeleteScoreSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllScoresSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  testId: Joi.number().positive(),
  userId: Joi.number().positive(),
});

const CreateScoreSchema = Joi.object({
  testId: Joi.number().positive().required(),
  userId: Joi.number().positive().required(),
  score: Joi.number().min(0).max(100).required(),
});

const UpdateScoreSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
    testId: Joi.number().positive(),
    userId: Joi.number().positive(),
    score: Joi.number().min(0).max(100),
  },
});

module.exports = {
  FindByIdOrDeleteScoreSchema,
  FindAllScoresSchema,
  CreateScoreSchema,
  UpdateScoreSchema,
};
