const Joi = require('joi');

const FindByIdOrDeleteCourseSchema = Joi.object({
  id: Joi.number().unsafe(),
});

const FindAllCoursesSchema = Joi.object({
  page: Joi.number(),
  size: Joi.number(),
  query: Joi.string(),
  categoryId: Joi.number(),
});

const CreateCourseSchema = Joi.object({
  categoryId: Joi.number().required(),
  title: Joi.string().required(),
  subTitle: Joi.string().required(),
  descriptions: Joi.string().required(),
  type: Joi.string().valid('FREE', 'PAID').required(),
  price: Joi.number().required(),
  level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCE').required(),
  banner: Joi.string().required(),
  quota: Joi.number().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
});

const UpdateCourseSchema = Joi.object({
  params: {
    id: Joi.number().unsafe(),
  },
  body: {
    categoryId: Joi.number(),
    title: Joi.string(),
    subTitle: Joi.string(),
    descriptions: Joi.string(),
    type: Joi.string().valid('FREE', 'PAID'),
    price: Joi.number(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCE'),
    banner: Joi.string(),
    quota: Joi.number(),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
  },
});

const RegisterCourseSchema = Joi.object({
  courseId: Joi.number().required(),
});

module.exports = {
  FindByIdOrDeleteCourseSchema,
  FindAllCoursesSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  RegisterCourseSchema,
};
