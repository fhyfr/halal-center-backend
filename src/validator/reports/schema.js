const Joi = require('joi');

const FindByIdSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllCoursesForReportSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.number().positive(),
});

module.exports = {
  FindByIdSchema,
  FindAllCoursesForReportSchema,
};
