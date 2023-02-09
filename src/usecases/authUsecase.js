const AuthenticationError = require('../exceptions/authenticationError');
const InvariantError = require('../exceptions/invariantError');
const constant = require('../helpers/constant');
const {
  auth: authMessage,
  getPublicUserProperties,
} = require('../helpers/responseMessage');
const { encryptPassword, validatePassword } = require('../helpers/encryption');
const { generateOTP } = require('../helpers/generator');
const { sendEmail } = require('../email/sendMail');

class AuthUsecase {
  constructor(userUsecase, sessionUsecase, roleUseCase) {
    this.userUsecase = userUsecase;
    this.sessionUsecase = sessionUsecase;
    this.roleUseCase = roleUseCase;
  }

  async login(body) {
    const user = await this.userUsecase.findByEmail(body.email);

    if (!user)
      throw new AuthenticationError(authMessage.login.invalidCredential);

    const isPasswordValid = await validatePassword(
      body.password,
      user.password,
    );

    if (!isPasswordValid)
      throw new AuthenticationError(authMessage.login.invalidCredential);

    const token = await this.getNewToken(user.id);

    return token;
  }

  async getNewToken(userId) {
    const newToken = await this.sessionUsecase.getToken();
    await this.sessionUsecase.saveToken(newToken, userId);
    return newToken;
  }

  async refreshToken(refreshToken) {
    return this.sessionUsecase.updateAccessToken(refreshToken);
  }

  async verifyUser(email, otp) {
    const existingUser = await this.userUsecase.findByEmail(email);

    // if user not found just return
    // for security reason
    if (!existingUser) {
      return;
    }

    if (existingUser.isOtpVerified)
      throw new InvariantError(authMessage.verify.alreadyVerified);

    const isOTPValid = existingUser.otp === otp;

    if (!isOTPValid) throw new InvariantError(authMessage.verify.invalid);

    const result = await this.userUsecase.updateOTPVerificationStatus(
      existingUser.id,
      email,
      existingUser.username,
    );

    const { id, username, isOtpVerified } = result[1][0];
    return {
      id,
      username,
      email,
      isOtpVerified,
    };
  }

  async register(user) {
    const { role: roleEnum } = constant;

    const role = await this.roleUseCase.findByRoleName(roleEnum.MEMBER.VALUE);

    const isUsernameExist = await this.userUsecase.checkUsername(user.username);
    if (isUsernameExist) {
      throw new InvariantError(authMessage.register.usernameExist);
    }

    const isEmailExist = await this.userUsecase.checkEmail(user.email);
    if (isEmailExist) {
      throw new InvariantError(authMessage.register.emailExist);
    }

    const encryptedPassword = user.password
      ? await encryptPassword(user.password)
      : null;

    const newUser = {
      email: user.email.toLowerCase(),
      password: encryptedPassword,
      username: user.username.toLowerCase(),
      fullName: user.fullName,
      roleId: role.id,
    };

    const result = await this.userUsecase.create(newUser);
    return getPublicUserProperties(result);
  }

  async resendVerificationCode(email) {
    const newOtp = generateOTP();
    const user = await this.userUsecase.findByEmail(email);

    // if user not found just return
    // for security reason
    if (user === null) {
      return;
    }

    await this.userUsecase.updateOTP(user.id, email, user.username, newOtp);

    sendEmail('forgot-password', email, { otp: newOtp });

    return getPublicUserProperties(user);
  }

  async logout(userId) {
    return this.sessionUsecase.deleteByUserId(userId);
  }
}

module.exports = AuthUsecase;
