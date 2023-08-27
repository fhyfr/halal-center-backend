const {
  registrationPayment: registrationPaymentMessage,
} = require('../helpers/responseMessage');

class RegistrationPaymentController {
  constructor(registrationPaymentUsecase, validator) {
    this.registrationPaymentUsecase = registrationPaymentUsecase;
    this.validator = validator;

    this.findByRegistrationPaymentId =
      this.findByRegistrationPaymentId.bind(this);
    this.findAll = this.findAll.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async findByRegistrationPaymentId(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const registrationPayment =
        await this.registrationPaymentUsecase.findByRegistrationPaymentId(
          req.ability,
          req.params.id,
        );

      return res.respond(registrationPayment);
    } catch (error) {
      return next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllRegistrationPaymentsPayload(req.query);

      const registrationPayments =
        await this.registrationPaymentUsecase.findAll(req);

      return res.respond(registrationPayments);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      this.validator.validateCreatePayload(req.body);

      const registrationPayment = await this.registrationPaymentUsecase.create(
        req,
      );

      return res.respond(
        {
          message: registrationPaymentMessage.create,
          data: registrationPayment,
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

      const registrationPayment = await this.registrationPaymentUsecase.update(
        req,
      );

      return res.respond({
        message: registrationPaymentMessage.update,
        data: registrationPayment,
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.registrationPaymentUsecase.delete(
        req.ability,
        req.params.id,
        req.user.userId,
      );

      return res.respond({ message: registrationPaymentMessage.delete });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = RegistrationPaymentController;
