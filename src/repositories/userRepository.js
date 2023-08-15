const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class UserRepository {
  constructor(cacheService) {
    this.userModel = Models.User;
    this.cacheService = cacheService;
  }

  async findByUserId(userId) {
    const cacheKey = this.constructor.cacheKeyByUserId(userId);

    try {
      const user = await this.cacheService.get(cacheKey);

      return JSON.parse(user);
    } catch (error) {
      const user = await this.userModel.findOne({
        where: { userId },
        raw: true,
      });
      if (user === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(user));

      return user;
    }
  }

  async findAll(offset, limit, query, roleId) {
    const whereConditions = {};

    if (query && query !== '') {
      Object.assign(whereConditions, {
        username: {
          [Models.Sequelize.Op.iLike]: `%${query}%`,
        },
      });
    }

    if (roleId) {
      Object.assign(whereConditions, {
        roleId,
      });
    }

    const userIds = await this.userModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['userId'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: userIds.count,
      rows: userIds.rows.map((userIds.rows, (user) => user.userId)),
    };
  }

  async findByUsername(username) {
    const cacheKey = this.constructor.cacheKeyByUsername(username);

    try {
      const user = await this.cacheService.get(cacheKey);

      return JSON.parse(user);
    } catch (error) {
      const user = await this.userModel.findOne({
        where: {
          username,
        },
        paranoid: false,
        raw: true,
      });
      if (user === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(user));

      return user;
    }
  }

  async findByEmail(email) {
    const cacheKey = this.constructor.cacheKeyByEmail(email);

    try {
      const user = await this.cacheService.get(cacheKey);

      return JSON.parse(user);
    } catch (error) {
      const user = await this.userModel.findOne({
        where: { email },
        raw: true,
      });

      if (user === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(user));
      return user;
    }
  }

  async create(user) {
    Object.assign(user, {
      userId: `user-${nanoid(16)}`,
    });

    const result = await this.userModel.create(user);
    if (result === null) {
      logger.error('create user failed');
      throw new Error('create user failed');
    }

    const cacheKey = this.constructor.cacheKeyByUserId(result.userId);
    await this.cacheService.set(cacheKey, JSON.stringify(result));
    return result.dataValues;
  }

  async forgotPassword(userId, email, username, otp) {
    const result = await this.userModel.update(
      { otp, updatedBy: userId, isOtpVerified: false },
      { where: { userId } },
    );

    const cacheKeys = [
      this.constructor.cacheKeyByUserId(userId),
      this.constructor.cacheKeyByEmail(email),
      this.constructor.cacheKeyByUsername(username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result;
  }

  async updatePassword(userId, password) {
    const result = await this.userModel.update(
      { password, isOtpVerified: false, updatedBy: userId },
      { where: { userId }, returning: true, raw: true },
    );
    if (result[0] === 0) return null;

    const cacheKeys = [
      this.constructor.cacheKeyByUserId(userId),
      this.constructor.cacheKeyByEmail(result[1][0].email),
      this.constructor.cacheKeyByUsername(result[1][0].username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async updatePasswordByAdmin(userId, updaterId, password) {
    const result = await this.userModel.update(
      { password, updatedBy: updaterId },
      { where: { userId }, returning: true, raw: true },
    );
    if (result[0] === 0) return null;

    const cacheKeys = [
      this.constructor.cacheKeyByUserId(userId),
      this.constructor.cacheKeyByEmail(result[1][0].email),
      this.constructor.cacheKeyByUsername(result[1][0].username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async update(userId, user) {
    const result = await this.userModel.update(user, {
      where: { userId },
      returning: true,
      raw: true,
    });
    if (result[0] === 0) {
      throw new Error('failed update user');
    }

    const cacheKeys = [
      this.constructor.cacheKeyByUserId(userId),
      this.constructor.cacheKeyByUsername(result[1][0].username),
      this.constructor.cacheKeyByEmail(result[1][0].email),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async updateRole(userId, roleId) {
    const result = await this.userModel.update(
      { roleId },
      { where: { userId }, returning: true, raw: true },
    );
    if (result[0] === 0) return null;

    const cacheKey = this.constructor.cacheKeyByUserId(userId);
    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteByUserId(userId, username, email, updaterId) {
    const result = await this.userModel.destroy({
      where: { userId },
    });

    await this.userModel.update(
      { deletedBy: updaterId },
      {
        where: { userId },
        paranoid: false,
      },
    );

    const cacheKeys = [
      this.constructor.cacheKeyByUserId(userId),
      this.constructor.cacheKeyByEmail(email),
      this.constructor.cacheKeyByUsername(username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result;
  }

  async updateVerificationStatus(userId, email, username) {
    const result = await this.userModel.update(
      { otp: null, isOtpVerified: true },
      {
        where: { email },
        returning: true,
      },
    );

    if (result[0] === 0) return null;

    const cacheKeys = [
      this.constructor.cacheKeyByUserId(userId),
      this.constructor.cacheKeyByEmail(email),
      this.constructor.cacheKeyByUsername(username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async updateOTP(userId, email, username, newOtp) {
    const result = await this.userModel.update(
      { otp: newOtp, isOtpVerified: false },
      { where: { email } },
    );

    const cacheKeys = [
      this.constructor.cacheKeyByUserId(userId),
      this.constructor.cacheKeyByEmail(email),
      this.constructor.cacheKeyByUsername(username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result;
  }

  static cacheKeyByUserId(userId) {
    return `user:${userId}`;
  }

  static cacheKeyByEmail(email) {
    return `user:email:${email}`;
  }

  static cacheKeyByUsername(username) {
    return `user:username:${username}`;
  }
}

module.exports = UserRepository;
