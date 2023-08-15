const Joi = require('joi');

const FindByIdOrDeleteCategorySchema = Joi.object({
  categoryId: Joi.string().required(),
});

const FindBySlugSchema = Joi.object({
  slug: Joi.string(),
});

const FindAllCategoriesSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  query: Joi.string(),
});

const CreateCategorySchema = Joi.object({
  categoryName: Joi.string().required(),
});

const UpdateCategorySchema = Joi.object({
  params: {
    categoryId: Joi.string().required(),
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
