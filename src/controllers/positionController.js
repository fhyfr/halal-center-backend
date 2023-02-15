const { position: positionMessage } = require('../helpers/responseMessage');

class CategoryController {
  constructor(positionUsecase, validator) {
    this.positionUsecase = positionUsecase;
    this.validator = validator;

    this.findById = this.findById.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const position = await this.positionUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(position);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllPositionsPayload(req.query);

      const positions = await this.positionUsecase.findAll(req);

      return res.respond(positions);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const position = await this.positionUsecase.create(req);

      return res.respond(
        { message: positionMessage.create, data: position },
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

      const position = await this.positionUsecase.update(req);

      return res.respond({
        message: positionMessage.update,
        data: position,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.positionUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: positionMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = CategoryController;
