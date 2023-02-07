const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes);
const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = process.env;

class SessionUsecase {
  constructor(sessionRepo, userRepo) {
    this.sessionRepo = sessionRepo;
    this.userRepo = userRepo;
    this.accessTokenTTL = ACCESS_TOKEN_EXPIRY || 86400;
    this.refreshTokenTTL = REFRESH_TOKEN_EXPIRY || 604800;
  }

  static async generateToken() {
    const buffer = await randomBytes(256);
    return crypto.createHash('sha1').update(buffer).digest('hex');
  }

  static generateExpiresTime(lifetimeInSecond) {
    return new Date(Date.now() + lifetimeInSecond * 1000);
  }

  static isTokenExpired(tokenExpiresAt) {
    const now = new Date().getTime();
    const tokenExpiresDate = new Date(tokenExpiresAt).getTime();
    return now > tokenExpiresDate;
  }

  async getToken() {
    const accessTokenAndExpiresAt = await this.getAccessToken();
    const refreshTokenAndExpiresAt = await this.getRefreshToken();
    return {
      ...accessTokenAndExpiresAt,
      ...refreshTokenAndExpiresAt,
    };
  }

  async getAccessToken() {
    return {
      accessToken: await this.constructor.generateToken(),
      accessTokenExpiresAt: this.constructor.generateExpiresTime(
        this.accessTokenTTL,
      ),
    };
  }

  async getRefreshToken() {
    return {
      refreshToken: await this.constructor.generateToken(),
      refreshTokenExpiresAt: this.constructor.generateExpiresTime(
        this.refreshTokenTTL,
      ),
    };
  }

  async isAccessTokenValid(accessToken) {
    const existingToken = await this.sessionRepo.findByAccessToken(accessToken);
    if (!existingToken) return false;
    if (this.constructor.isTokenExpired(existingToken.accessTokenExpiresAt))
      return false;

    const userId = existingToken.user
      ? existingToken.user.username
      : existingToken.userId;

    return this.getUserData(userId);
  }

  async isRefreshTokenValid(refreshToken) {
    const existingToken = await this.sessionRepo.findByRefreshToken(
      refreshToken,
    );
    if (!existingToken) return false;
    return !this.constructor.isTokenExpired(
      existingToken.refreshTokenExpiresAt,
    );
  }

  async getUserData(userId) {
    const userData = await this.userRepo.findById(userId);

    if (!userData) return null;

    const { id, email, roleId, username } = userData;

    return {
      id,
      email,
      roleId,
      username,
    };
  }

  async saveToken(token, userId) {
    return this.sessionRepo.create({
      ...token,
      userId,
    });
  }

  async updateAccessToken(refreshToken) {
    const newAccessToken = await this.getAccessToken();
    const result = await this.sessionRepo.updateAccessToken(
      refreshToken,
      newAccessToken,
    );
    const { createdAt, updatedAt, ...value } = result[1][0];
    return value;
  }

  async deleteByUserId(userId) {
    return this.sessionRepo.deleteByUserId(userId);
  }
}

module.exports = SessionUsecase;
