const { nanoid } = require('nanoid');
const Models = require('./models');

class SessionRepository {
  constructor(cacheService) {
    this.sessionModel = Models.Session;
    this.cacheService = cacheService;
  }

  async findByAccessToken(accessToken) {
    const cacheKey = this.constructor.cacheKeyByAccessToken(accessToken);

    try {
      const session = await this.cacheService.get(cacheKey);

      return JSON.parse(session);
    } catch (error) {
      const session = await this.sessionModel.findOne({
        where: { accessToken },
        raw: true,
      });

      if (session === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(session));
      return session;
    }
  }

  async findByRefreshToken(refreshToken) {
    const cacheKey = this.constructor.cacheKeyByRefreshToken(refreshToken);

    try {
      const session = await this.cacheService.get(cacheKey);

      return JSON.parse(session);
    } catch (error) {
      const session = await this.sessionModel.findOne({
        where: { refreshToken },
        raw: true,
      });

      if (session === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(session));
      return session;
    }
  }

  async findBySessionId(sessionId) {
    const cacheKey = this.constructor.cacheKeyBySessionId(sessionId);

    try {
      const session = await this.cacheService.get(cacheKey);

      return JSON.parse(session);
    } catch (error) {
      const session = await this.sessionModel.findOne({
        where: { sessionId },
        raw: true,
      });
      if (session === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(session));
      return session;
    }
  }

  async findByUserId(userId) {
    const cacheKey = this.constructor.cacheKeyByUserId(userId);

    try {
      const session = await this.cacheService.get(cacheKey);

      return JSON.parse(session);
    } catch (error) {
      const session = await this.sessionModel.findAll({
        where: { userId },
        attributes: ['sessionId'],
        raw: true,
      });

      if (session === null) return null;

      const ids = session.map((x) => x.sessionId);

      await this.cacheService.set(cacheKey, JSON.stringify(ids));
      return ids;
    }
  }

  async create(token) {
    const result = await this.sessionModel.create({
      sessionId: `session-${nanoid(16)}`,
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      userId: token.userId,
    });
    if (result === null) return null;

    const cacheKeyBySessionId = this.constructor.cacheKeyBySessionId(
      result.sessionId,
    );
    await this.cacheService.set(cacheKeyBySessionId, JSON.stringify(result));

    return result;
  }

  async updateAccessToken(refreshToken, newData) {
    const { accessToken, accessTokenExpiresAt } = newData;

    const result = await this.sessionModel.update(
      {
        accessToken,
        accessTokenExpiresAt,
      },
      { where: { refreshToken }, raw: true, returning: true },
    );

    if (result[0] === 0) return null;

    const cacheKeyBySessionId = this.constructor.cacheKeyBySessionId(
      result[1][0].sessionId,
    );
    await this.cacheService.delete(cacheKeyBySessionId);

    return result[1][0];
  }

  async deleteByUserId(userId) {
    const ids = await this.findByUserId(userId);

    if (!ids.length) return null;

    await this.sessionModel.destroy({
      where: { userId },
      raw: true,
    });

    ids.map((sessionId) =>
      this.cacheService.delete(this.constructor.cacheKeyBySessionId(sessionId)),
    );

    ids.push(
      this.cacheService.delete(this.constructor.cacheKeyByUserId(userId)),
    );

    await Promise.all(ids);

    return { userId };
  }

  async deleteByRefreshToken(refreshToken) {
    const existingToken = await this.findByRefreshToken(refreshToken);

    if (!existingToken) return;

    await this.sessionModel.destroy({
      where: { refreshToken },
    });

    const cacheKeys = [
      this.constructor.cacheKeyBySessionId(existingToken.sessionId),
      this.constructor.cacheKeyByRefreshToken(refreshToken),
      this.constructor.cacheKeyByAccessToken(existingToken.accessToken),
    ];

    return this.cacheService.delete(cacheKeys);
  }

  static cacheKeyBySessionId(sessionId) {
    return `session:${sessionId}`;
  }

  static cacheKeyByAccessToken(accessToken) {
    return `session:accessToken:${accessToken}`;
  }

  static cacheKeyByRefreshToken(refreshToken) {
    return `session:refreshToken:${refreshToken}`;
  }

  static cacheKeyByUserId(userId) {
    return `session:userId:${userId}`;
  }
}

module.exports = SessionRepository;
