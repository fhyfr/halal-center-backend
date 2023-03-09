const AuthenticationError = require('../exceptions/authenticationError');
const InvariantError = require('../exceptions/invariantError');
const constant = require('../helpers/constant');
const {
  auth: authMessage,
  getPublicUserProperties,
} = require('../helpers/responseMessage');
const { encryptPassword, validatePassword } = require('../helpers/encryption');
const { generateOTP } = require('../helpers/generator');
const { sendEmail } = require('../email/sendEmail');

const { ROOT_URL } = process.env;

class AuthUsecase {
  constructor(userUsecase, sessionUsecase, roleUseCase, memberUsecase) {
    this.userUsecase = userUsecase;
    this.sessionUsecase = sessionUsecase;
    this.roleUseCase = roleUseCase;
    this.memberUsecase = memberUsecase;
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

    const { id, username, isOtpVerified } = result;
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
      roleId: role.id,
    };

    const resultUser = await this.userUsecase.create(newUser);
    const resultMember = await this.memberUsecase.create(
      resultUser.id,
      user.fullName,
    );

    return getPublicUserProperties(resultUser, resultMember);
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

    sendEmail('forgot-password', email, {
      username: user.username,
      otp: newOtp,
      action_url: `${ROOT_URL}/auth/forgot-password?email=${email}`,
    });

    return getPublicUserProperties(user);
  }

  async logout(userId) {
    return this.sessionUsecase.deleteByUserId(userId);
  }
}

module.exports = AuthUsecase;
