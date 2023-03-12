const { user: userMessage } = require('../helpers/responseMessage');

class UserController {
  constructor(userUsecase, validator) {
    this.userUsecase = userUsecase;
    this.validator = validator;

    this.findAll = this.findAll.bind(this);
    this.findById = this.findById.bind(this);
    this.findByUsername = this.findByUsername.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.findCurrentUser = this.findCurrentUser.bind(this);
    this.createNewUser = this.createNewUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.resetPasswordByAdmin = this.resetPasswordByAdmin.bind(this);
  }

  async findAll(req, res, next) {
    try {
      this.validator.validateFindAllUsersPayload(req.query);

      const users = await this.userUsecase.findAll(req);

      return res.respond(users);
    } catch (error) {
      return next(error);
    }
  }

  async findById(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      const user = await this.userUsecase.findUserById(
        req.params.id,
        req.ability,
      );

      return res.respond(user);
    } catch (error) {
      return next(error);
    }
  }

  async findByUsername(req, res, next) {
    try {
      const user = await this.userUsecase.findByUsername(req.params.username);

      return res.respond(user);
    } catch (error) {
      return next(error);
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

    try {
      this.validator.validateUpdatePasswordPayload(req.body);

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
      return next(error);
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

  async resetPasswordByAdmin(req, res, next) {
    try {
      this.validator.validateResetPasswordPayload({
        params: req.params,
        body: req.body,
      });

      const result = await this.userUsecase.resetPasswordByAdmin(req);

      return res.respond({
        message: userMessage.password.updated,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      this.validator.validateFindByIdOrDeletePayload(req.params);

      await this.userUsecase.deleteById(
        req.ability,
        req.params.id,
        req.user.id,
      );

      return res.respond({
        message: userMessage.delete,
      });
    } catch (error) {
      return next(error);
    }
  }

  async findCurrentUser(req, res, next) {
    try {
      const user = await this.userUsecase.findCurrentUser(req);

      return res.respond(user);
    } catch (error) {
      return next(error);
    }
  }

  async createNewUser(req, res, next) {
    try {
      this.validator.validateCreateNewUserPayload(req.body);

      const result = await this.userUsecase.createNewUser(
        req.ability,
        req.body,
      );
      return res.respond(
        {
          message: userMessage.created,
          data: result,
        },
        201,
      );
    } catch (error) {
      return next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      this.validator.validateUpdateUserPayload({
        params: req.params,
        body: req.body,
      });

      const result = await this.userUsecase.updateUser(req);

      return res.respond({
        message: userMessage.updated,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = UserController;
