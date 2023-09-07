const logger = require('../helpers/logger');
const Models = require('./models');

class MemberRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.memberModel = Models.Member;
    this.userModel = Models.User;
  }

  async findByUserId(userId) {
    const cacheKey = this.constructor.cacheKeyByUserId(userId);

    try {
      const member = await this.cacheService.get(cacheKey);

      return JSON.parse(member);
    } catch (error) {
      const member = await this.memberModel.findOne({
        where: { userId },
        include: {
          model: this.userModel,
          where: {
            id: userId,
          },
          requried: true,
          attributes: [],
        },
        raw: true,
      });

      if (member === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(member));
      return member;
    }
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
