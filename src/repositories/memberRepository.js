const logger = require('../helpers/logger');
const Models = require('./models');

class MemberRepository {
  constructor(cacheService) {
    this.memberModel = Models.Member;
    this.cacheService = cacheService;
  }

  async create(userId, fullName) {
    const result = await this.memberModel.create({
      userId,
      fullName,
    });

    if (result === null) {
      logger.error('create member failed');
      throw new Error('create member failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);
    const cacheKeyUserId = this.constructor.cacheKeyByUserId(userId);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeyUserId, JSON.stringify(result));

    return result.dataValues;
  }

  async updateByUserId(userId, newMember) {
    const result = await this.memberModel.update(newMember, {
      where: { userId },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('failed update member');
    }

    const cacheKeys = [
      this.constructor.cacheKeyById(result[1][0].id),
      this.constructor.cacheKeyByUserId(userId),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  static cacheKeyById(id) {
    return `member:${id}`;
  }

  static cacheKeyByUserId(userId) {
    return `member:userId:${userId}`;
  }
}

module.exports = MemberRepository;
