/* eslint-disable import/no-extraneous-dependencies */
const { auth: authMessage } = require('../helpers/responseMessage');
const AuthenticationError = require('../exceptions/authenticationError');

class AuthController {
  constructor(authUsecase, validator) {
    this.authUsecase = authUsecase;
    this.validator = validator;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyUser = this.verifyUser.bind(this);
    this.resendVerificationCode = this.resendVerificationCode.bind(this);
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
      return next(error);
    }
  }

  async login(req, res, next) {
    try {
      this.validator.validateLoginPayload(req.body);

      const result = await this.authUsecase.login(req.body);
      return res.respond({
        message: authMessage.login.success,
        data: result,
      });
    } catch (error) {
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
      return next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const result = await this.authUsecase.logout(req.user.id);
      if (!result) {
        throw new AuthenticationError();
      }

      return res.respond({
        message: authMessage.logout.success,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async verifyUser(req, res, next) {
    try {
      this.validator.validateVerifyUserPayload(req.body);

      const { email, otp } = req.body;

      const result = await this.authUsecase.verifyUser(email, otp);
      return res.respond({
        message: authMessage.verify.success,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async resendVerificationCode(req, res, next) {
    try {
      this.validator.validateResendVerificationCodePayload(req.body);

      const result = await this.authUsecase.resendVerificationCode(
        req.body.email.toLowerCase(),
      );

      return res.respond({
        message: authMessage.verify.send,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = AuthController;
