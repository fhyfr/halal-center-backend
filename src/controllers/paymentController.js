const { payment: paymentMessage } = require('../helpers/responseMessage');

class PaymentController {
  constructor(paymentUsecase, validator) {
    this.paymentUsecase = paymentUsecase;
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

      const payment = await this.paymentUsecase.findById(
        req.ability,
        req.params.id,
      );

      return res.respond(payment);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllPaymentsPayload(req.query);

      const payments = await this.paymentUsecase.findAll(req);

      return res.respond(payments);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const payment = await this.paymentUsecase.create(req);

      return res.respond(
        { message: paymentMessage.create, data: payment },
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

      const payment = await this.paymentUsecase.update(req);

      return res.respond({
        message: paymentMessage.update,
        data: payment,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.paymentUsecase.delete(req.ability, req.params.id, req.user.id);

      return res.respond({ message: paymentMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = PaymentController;
