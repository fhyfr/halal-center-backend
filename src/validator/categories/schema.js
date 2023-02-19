const Joi = require('joi');

const FindByIdOrDeleteCategorySchema = Joi.object({
  id: Joi.number().positive().unsafe(),
});

const FindBySlugSchema = Joi.object({
  slug: Joi.string(),
});

const FindAllCategoriesSchema = Joi.object({
  page: Joi.number(),
  size: Joi.number(),
  query: Joi.string(),
});

const CreateCategorySchema = Joi.object({
  categoryName: Joi.string().required(),
});

const UpdateCategorySchema = Joi.object({
  params: {
    id: Joi.number().positive().unsafe(),
  },
  body: {
    categoryName: Joi.string().required(),
  },
});

module.exports = {
  FindByIdOrDeleteCategorySchema,
  FindBySlugSchema,
  FindAllCategoriesSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
};
