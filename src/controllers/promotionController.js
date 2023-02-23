const { promotion: promotionMessage } = require('../helpers/responseMessage');

class PromotionController {
  constructor(promotionUsecase, validator) {
    this.promotionUsecase = promotionUsecase;
    this.validator = validator;

    this.findById = this.findById.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.resend = this.resend.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdResendDeletePayload(req.params);

      const promotion = await this.promotionUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(promotion);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllPromotionsPayload(req.query);

      const promotions = await this.promotionUsecase.findAll(req);

      return res.respond(promotions);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const promotion = await this.promotionUsecase.create(req);

      return res.respond(
        { message: promotionMessage.create, data: promotion },
        201,
      );
    } catch (error) {
      return next(error);
    }
  }

  async resend(req, res, next) {
    try {
      this.validator.validateFindByIdResendDeletePayload(req.params);

      await this.promotionUsecase.resend(req);

      return res.respond({
        message: promotionMessage.resend,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdResendDeletePayload(req.params);

      await this.promotionUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({
        message: promotionMessage.delete,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = PromotionController;
