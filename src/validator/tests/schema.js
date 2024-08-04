const Joi = require('joi');

const FindByIdOrDeleteTestSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllTestsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.number().positive(),
  type: Joi.string().valid('PRE_TEST', 'POST_TEST'),
  active: Joi.boolean(),
});

const CreateTestSchema = Joi.object({
  courseId: Joi.number().positive().required(),
  type: Joi.string().valid('PRE_TEST', 'POST_TEST').required(),
  url: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  active: Joi.boolean().required(),
});

const UpdateTestSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
    courseId: Joi.number().positive(),
    type: Joi.string().valid('PRE_TEST', 'POST_TEST'),
    url: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    active: Joi.boolean(),
  },
});

module.exports = {
  FindByIdOrDeleteTestSchema,
  FindAllTestsSchema,
  CreateTestSchema,
  UpdateTestSchema,
};
