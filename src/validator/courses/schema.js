const Joi = require('joi');

const FindByIdOrDeleteCourseSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllCoursesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
  categoryId: Joi.number().positive(),
  userId: Joi.number().positive(),
});

const FindAllCoursesOfInstructorSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  query: {
    page: Joi.number().positive(),
    size: Joi.number().positive(),
  },
});

const CreateCourseSchema = Joi.object({
  categoryId: Joi.number().positive().required(),
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
    id: Joi.number().positive(),
  },
  body: {
    categoryId: Joi.number().positive(),
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
  courseId: Joi.number().positive().required(),
});

module.exports = {
  FindByIdOrDeleteCourseSchema,
  FindAllCoursesSchema,
  FindAllCoursesOfInstructorSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  RegisterCourseSchema,
};
