const Joi = require('joi');

const FindByIdOrDeletePositionSchema = Joi.object({
  positionId: Joi.string().required(),
});

const FindAllPositionsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
});

const CreatePositionSchema = Joi.object({
  positionName: Joi.string().required(),
});

const UpdatePositionSchema = Joi.object({
  params: {
    positionId: Joi.string().required(),
  },
  body: {
    positionName: Joi.string().required(),
  },
});

module.exports = {
  FindByIdOrDeletePositionSchema,
  FindAllPositionsSchema,
  CreatePositionSchema,
  UpdatePositionSchema,
};
