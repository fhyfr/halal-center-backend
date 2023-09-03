const {
  operationalPayment: operationalPaymentMessage,
} = require('../helpers/responseMessage');

class OperationalPaymentController {
  constructor(operationalPaymentUsecase, validator) {
    this.operationalPaymentUsecase = operationalPaymentUsecase;
    this.validator = validator;

    this.findByOperationalPaymentId =
      this.findByOperationalPaymentId.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findByOperationalPaymentId(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const operationalPayment =
        await this.operationalPaymentUsecase.findByOperationalPaymentId(
          req.ability,
          req.params.id,
        );

      return res.respond(operationalPayment);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllOperationalPaymentsPayload(req.query);

      const operationalPayment = await this.operationalPaymentUsecase.findAll(
        req,
      );

      return res.respond(operationalPayment);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const operationalPayment = await this.operationalPaymentUsecase.create(
        req,
      );

      return res.respond(
        {
          message: operationalPaymentMessage.create,
          data: operationalPayment,
        },
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

      const operationalPayment = await this.operationalPaymentUsecase.update(
        req,
      );

      return res.respond({
        message: operationalPaymentMessage.update,
        data: operationalPayment,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.operationalPaymentUsecase.delete(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({ message: operationalPaymentMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = OperationalPaymentController;
