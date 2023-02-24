const Joi = require('joi');

const FindByIdOrDeletePositionSchema = Joi.object({
  id: Joi.number().positive(),
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
    id: Joi.number().positive(),
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
