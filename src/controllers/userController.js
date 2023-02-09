const Joi = require('joi');
const InvariantError = require('../exceptions/invariantError');
const {
  user: userMessage,
  role: roleMessage,
} = require('../helpers/responseMessage');
const logger = require('../helpers/logger');

class UserController {
  constructor(userUsecase, validator) {
    this.userUsecase = userUsecase;
    this.validator = validator;

    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.findByUsername = this.findByUsername.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.updateUserRole = this.updateUserRole.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.findCurrentUser = this.findCurrentUser.bind(this);
  }

  async findAll(req, res, next) {
    const schema = Joi.object().keys({
      page: Joi.number(),
      size: Joi.number(),
      query: Joi.string(),
      roleId: Joi.number(),
    });

    try {
      await schema.validateAsync(req.query).catch((joiError) => {
        throw new InvariantError(joiError.details.map((x) => x.message));
      });

      const users = await this.userUsecase.findAll(req);

      return res.respond(users);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async findById(req, res, next) {
    const schema = Joi.object().keys({
      id: Joi.number().unsafe(),
    });

    try {
      await schema.validateAsync(req.params).catch((joiError) => {
        throw new InvariantError(joiError.details.map((x) => x.message));
      });

      const user = await this.userUsecase.findUserById(req.params.id);

      return res.respond(user);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async findByUsername(req, res, next) {
    try {
      const user = await this.userUsecase.findByUsername(req.params.username);

      return res.respond(user);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      this.validator.validateForgotPasswordPayload(req.body);

      await this.userUsecase.forgotPassword(req.body.email.toLowerCase());

      res.respond({
        message: userMessage.password.forgotSent,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updatePassword(req, res, next) {
    const { id } = req.user;

    const joiSchema = Joi.object().keys({
      password: Joi.string().min(8).required(),
      newPassword: Joi.string().min(8).required(),
      confirmNewPassword: Joi.ref('newPassword'),
    });

    try {
      await joiSchema.validateAsync(req.body).catch((joiError) => {
        throw new InvariantError(joiError.details.map((x) => x.message));
      });

      const result = await this.userUsecase.updatePassword(
        req.ability,
        req.body,
        id,
      );
      return res.respond({
        message: userMessage.password.updated,
        data: result,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      this.validator.validateResetPasswordPayload({
        params: req.params,
        body: req.body,
      });

      const result = await this.userUsecase.resetPassword(
        req.params.id,
        req.body.newPassword,
      );

      return res.respond({
        message: userMessage.password.updated,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateUser(req, res, next) {
    const schema = Joi.object().keys({
      username: Joi.string().min(4).max(20).allow(''),
      biodata: Joi.string().allow(''),
      photo: Joi.string().allow(''),
      phone: Joi.string().allow(''),
      email: Joi.string().allow(''),
    });

    try {
      await schema.validateAsync(req.body).catch((joiError) => {
        throw new InvariantError(joiError.details.map((x) => x.message));
      });

      const user = await this.userUsecase.updateUser(
        req.ability,
        req.user.id,
        req.body,
      );

      return res.respond({
        message: userMessage.update,
        data: user,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    const joiSchema = Joi.object().keys({
      userId: Joi.number().unsafe().required(),
      roleId: Joi.number().unsafe().required(),
    });

    try {
      await joiSchema.validateAsync(req.body).catch((joiError) => {
        throw new InvariantError(joiError.details.map((x) => x.message));
      });

      const result = await this.userUsecase.updateUserRole(
        req.ability,
        req.body,
      );

      return res.respond({
        message: roleMessage.update,
        data: result,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    const joiSchema = Joi.object().keys({
      userId: Joi.number().unsafe().required(),
    });

    try {
      await joiSchema.validateAsync(req.body).catch((joiError) => {
        throw new InvariantError(joiError.details.map((x) => x.message));
      });

      const result = await this.userUsecase.deleteById(
        req.ability,
        req.body.userId,
      );

      return res.respond({
        message: userMessage.delete,
        data: result,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  }

  async findCurrentUser(req, res, next) {
    try {
      const user = await this.userUsecase.findCurrentUser(req);

      return res.respond(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
