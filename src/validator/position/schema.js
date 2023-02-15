const Joi = require('joi');

const FindByIdOrDeletePositionSchema = Joi.object({
  id: Joi.number().unsafe(),
});

const FindAllPositionsSchema = Joi.object({
  page: Joi.number(),
  size: Joi.number(),
  query: Joi.string(),
});

const CreatePositionSchema = Joi.object({
  positionName: Joi.string().required(),
});

const UpdatePositionSchema = Joi.object({
  params: {
    id: Joi.number().unsafe(),
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
