const AuthenticationError = require('../exceptions/authenticationError');
const InvariantError = require('../exceptions/invariantError');
const NotFoundError = require('../exceptions/notFoundError');
const constant = require('../helpers/constant');
const {
  auth: authMessage,
  user: userMessage,
  role: roleMessage,
} = require('../helpers/responseMessage');
const { encryptPassword, validatePassword } = require('../helpers/encryption');
const { generateUsername, generateOTP } = require('../helpers/generator');
const { sendEmail } = require('../email/sendMail');

const getPublicUserProperties = (user) => {
  const { password, updatedAt, createdAt, updatedBy, ...publicUserProperties } =
    user;

  return publicUserProperties;
};

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

    if (user.isRegisterUsing !== constant.auth.registerType.STANDARD)
      throw new AuthenticationError(authMessage.login.differentRegisterType);

    if (!user.isVerify)
      throw new AuthenticationError(authMessage.verify.notVerified);

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

  async registerEmail(body) {
    const existingUser = await this.userUsecase.findByEmail(
      body.email.toLowerCase(),
    );

    if (
      existingUser &&
      existingUser.isRegisterUsing !== constant.auth.registerType.STANDARD
    )
      throw new InvariantError(authMessage.login.differentRegisterType);

    if (existingUser) throw new InvariantError(authMessage.register.emailExist);

    const createdUser = await this.register(
      body,
      constant.auth.registerType.STANDARD,
    );

    sendEmail('verification', body.email, {
      otp: createdUser.otp,
    });

    return getPublicUserProperties(createdUser);
  }

  async verifyUser(user) {
    const existingUser = await this.userUsecase.findByEmail(user.email);

    if (!existingUser) throw new NotFoundError(userMessage.notFound);

    if (existingUser.isVerify)
      throw new InvariantError(authMessage.verify.alreadyVerified);

    const isOTPValid = existingUser.otp === user.otp;

    if (!isOTPValid) throw new InvariantError(authMessage.verify.invalid);

    const verifiedUser = await this.userUsecase.updateVerificationStatus(
      user.email,
    );
    const { id, username, email, isVerify } = verifiedUser[1][0];
    return {
      id,
      username,
      email,
      isVerify,
    };
  }

  async register(user, registerType) {
    const { registerType: registerTypeEnum } = constant.auth;
    const { role: roleEnum } = constant;

    const isRegisterTypeValid =
      Object.values(registerTypeEnum).includes(registerType);

    if (!isRegisterTypeValid)
      throw new Error(authMessage.register.invalidRegisterType);

    const role = await this.roleUseCase.findByRoleName(roleEnum.USER.VALUE);

    if (!role) throw new Error(roleMessage.notFound);

    const encryptedPassword = user.password
      ? await encryptPassword(user.password)
      : null;

    const userOTP =
      registerType === registerTypeEnum.STANDARD ? generateOTP() : null;

    const defaultVerifyStatus = registerType !== registerTypeEnum.STANDARD;

    let userPhoto = null;

    if (user.photo !== '' && user.photo !== null) {
      const { pathname } = new URL(user.photo);
      userPhoto = pathname;
    }

    const newUser = {
      email: user.email,
      password: encryptedPassword,
      username: generateUsername(),
      roleId: role.id,
      isRegisterUsing: registerType,
      isVerify: defaultVerifyStatus,
      photo: userPhoto,
      otp: userOTP,
    };

    const createdUser = await this.userUsecase.create(newUser);

    return createdUser;
  }

  async resendVerification(req) {
    const newOtp = generateOTP();
    const user = await this.userUsecase.findByEmail(req.body.email);

    if (user === null) throw new NotFoundError(userMessage.notFound);

    await this.userUsecase.updateOTP(user.id, {
      email: req.body.email,
      newOtp,
    });

    sendEmail('verification', req.body.email, { otp: newOtp });

    const updatedUser = await this.userUsecase.findByEmail(req.body.email);

    return getPublicUserProperties(updatedUser);
  }

  async logout(userId) {
    return this.sessionUsecase.deleteByUserId(userId);
  }
}

module.exports = AuthUsecase;
