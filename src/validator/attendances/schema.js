const Joi = require('joi');

const FindByIdOrDeleteAttendanceSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllAttendancesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.number().positive(),
  active: Joi.boolean(),
});

const CreateAttendanceSchema = Joi.object({
  courseId: Joi.number().positive().required(),
  title: Joi.string().required(),
  endDate: Joi.date().required(),
  active: Joi.boolean().required(),
});

const UpdateAttendanceSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
    courseId: Joi.number().positive(),
    title: Joi.string(),
    endDate: Joi.date(),
    active: Joi.boolean(),
  },
});

module.exports = {
  FindByIdOrDeleteAttendanceSchema,
  FindAllAttendancesSchema,
  CreateAttendanceSchema,
  UpdateAttendanceSchema,
};
