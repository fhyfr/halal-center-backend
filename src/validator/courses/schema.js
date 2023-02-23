const Joi = require('joi');

const FindByIdOrDeleteCourseSchema = Joi.object({
  id: Joi.number().positive().positive().unsafe(),
});

const FindAllCoursesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  categoryId: Joi.number().positive(),
});

const CreateCourseSchema = Joi.object({
  categoryId: Joi.number().positive().required(),
  title: Joi.string().required(),
  subTitle: Joi.string().required(),
  descriptions: Joi.string().required(),
  type: Joi.string().valid('FREE', 'PAID').required(),
  price: Joi.number().positive().required(),
  level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCE').required(),
  banner: Joi.string().required(),
  quota: Joi.number().positive().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
});

const UpdateCourseSchema = Joi.object({
  params: {
    id: Joi.number().positive().unsafe(),
  },
  body: {
    categoryId: Joi.number().positive(),
    title: Joi.string(),
    subTitle: Joi.string(),
    descriptions: Joi.string(),
    type: Joi.string().valid('FREE', 'PAID'),
    price: Joi.number().positive(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCE'),
    banner: Joi.string(),
    quota: Joi.number().positive(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
  },
});

const RegisterCourseSchema = Joi.object({
  courseId: Joi.number().positive().required(),
});

module.exports = {
  FindByIdOrDeleteCourseSchema,
  FindAllCoursesSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  RegisterCourseSchema,
};