const Joi = require('joi');

const FindByIdOrDeleteCourseSchema = Joi.object({
  courseId: Joi.string().required(),
});

const FindAllCoursesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  categoryId: Joi.string(),
  userId: Joi.string(),
});

const CreateCourseSchema = Joi.object({
  categoryId: Joi.string().required(),
  batchNumber: Joi.number().positive().required(),
  title: Joi.string().required(),
  subTitle: Joi.string().required(),
  descriptions: Joi.string().required(),
  type: Joi.string().valid('FREE', 'PAID').required(),
  price: Joi.number().positive().allow(0).required(),
  level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCE').required(),
  banner: Joi.string().required(),
  quota: Joi.number().positive().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
});

const UpdateCourseSchema = Joi.object({
  params: {
    courseId: Joi.string().required(),
  },
  body: {
    categoryId: Joi.string(),
    batchNumber: Joi.number().positive(),
    title: Joi.string(),
    subTitle: Joi.string(),
    descriptions: Joi.string(),
    type: Joi.string().valid('FREE', 'PAID'),
    price: Joi.number().positive().allow(0),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCE'),
    banner: Joi.string(),
    quota: Joi.number().positive(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
  },
});

const RegisterCourseSchema = Joi.object({
  courseId: Joi.string().required(),
});

module.exports = {
  FindByIdOrDeleteCourseSchema,
  FindAllCoursesSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  RegisterCourseSchema,
};
