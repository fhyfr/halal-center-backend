/* eslint-disable import/no-extraneous-dependencies */
const Joi = require('joi');
const InvariantError = require('../exceptions/invariantError');
const { auth: authMessage } = require('../helpers/responseMessage');
const logger = require('../helpers/logger');

class AuthController {
  constructor(authUsecase, validator) {
    this.authUsecase = authUsecase;
    this.validator = validator;

    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.register = this.register.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login(req, res, next) {
    const joiSchema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    try {
      await joiSchema.validateAsync(req.body).catch((joiError) => {
        throw new InvariantError(joiError.details.map((x) => x.message));
      });

      const result = await this.authUsecase.login(req.body);
      return res.respond({
        message: authMessage.login.success,
        data: result,
      });
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const token = await this.authUsecase.refreshToken(req.user.refreshToken);
      return res.respond({
        message: authMessage.refreshToken,
        data: token,
      });
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  }

  async register(req, res, next) {
    try {
      this.validator.validateRegisterPayload(req.body);

      const result = await this.authUsecase.register(req.body);
      return res.respond(
        {
          message: authMessage.register.success,
          data: result,
        },
        201,
      );
    } catch (error) {
      logger.error(error);
      return next(error);
    }
  }

  async logout(req, res, next) {
    this.authUsecase
      .logout(req.user.id)
      .then((result) =>
        res.respond({
          message: authMessage.logout.success,
          data: result,
        }),
      )
      .catch((error) => {
        next(error);
      });
  }
}

module.exports = AuthController;
