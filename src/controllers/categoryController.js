const { category: categoryMessage } = require('../helpers/responseMessage');

class CategoryController {
  constructor(categoryUsecase, validator) {
    this.categoryUsecase = categoryUsecase;
    this.validator = validator;

    this.findById = this.findById.bind(this);
    this.findBySlug = this.findBySlug.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const category = await this.categoryUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(category);
    } catch (error) {
      return next(error);
    }
  }

  async findBySlug(req, res, next) {
    try {
      this.validator.validateFindBySlugPayload(req.params);

      const category = await this.categoryUsecase.findBySlug(req.params.slug);

      return res.respond(category);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllCategoriesPayload(req.query);

      const categories = await this.categoryUsecase.findAll(req);

      return res.respond(categories);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const category = await this.categoryUsecase.create(req);

      return res.respond(
        { message: categoryMessage.create, data: category },
        201,
      );
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      this.validator.validateUpdatePayload({
        params: req.params,
        body: req.body,
      });

      const category = await this.categoryUsecase.update(req);

      return res.respond({
        message: categoryMessage.update,
        data: category,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.categoryUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: categoryMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = CategoryController;
