const Models = require('./models');
const logger = require('../helpers/logger');

class UserRepository {
  constructor(cacheService) {
    this.userModel = Models.User;
    this.cacheService = cacheService;
  }

  async findAll(offset, limit) {
    const userIds = await this.userModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    if (userIds.count === 0) {
      return {
        count: 0,
        rows: [],
      };
    }

    return {
      count: userIds.count,
      rows: userIds.rows.map((userIds.rows, (user) => user.id)),
    };
  }

  async findById(userId) {
    const cacheKey = this.constructor.cacheKeyById(userId);

    try {
      const user = await this.cacheService.get(cacheKey);

      return JSON.parse(user);
    } catch (error) {
      const user = await this.userModel.findOne({
        where: { id: userId },
        raw: true,
      });

      if (user === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(user));

      return user;
    }
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
        attributes: ['id'],
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
    const result = await this.userModel.create(user);

    if (result === null) {
      logger.error('create user failed');
      throw new Error('create user failed');
    }

    const cacheKey = this.constructor.cacheKeyById(result.id);
    await this.cacheService.set(cacheKey, JSON.stringify(result));
    return result.dataValues;
  }

  async forgotPassword(id, email) {
    const result = await this.userModel.update({ where: { email } });

    const cacheKeys = [
      this.constructor.cacheKeyByEmail(email),
      this.constructor.cacheKeyById(id),
    ];

    await this.cacheService.delete(cacheKeys);
    return result;
  }

  async updatePassword(id, password) {
    const result = await this.userModel.update(
      { password },
      { where: { id }, returning: true, raw: true },
    );

    if (result === null) return null;

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
      this.constructor.cacheKeyByEmail(result[1][0].email),
    ];

    await this.cacheService.delete(cacheKeys);
    return result;
  }

  async update(id, user) {
    const cacheKeyId = this.constructor.cacheKeyById(id);
    const { username, email } = await this.findById(id);

    const result = await this.userModel.update(user, {
      where: {
        id,
      },
      raw: true,
    });

    if (result === null) return null;

    const cacheKeys = [
      cacheKeyId,
      this.constructor.cacheKeyByUsername(username),
      this.constructor.cacheKeyByEmail(email),
    ];

    await this.cacheService.delete(cacheKeys);
    return result;
  }

  async updateRole(id, roleId) {
    const result = await this.userModel.update(
      {
        roleId,
      },
      { where: { id }, returning: true, raw: true },
    );

    if (result && result[0] < 1) return null;

    const cacheKey = this.constructor.cacheKeyById(id);
    await this.cacheService.delete(cacheKey);
    return result;
  }

  async deleteById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    const user = await this.findById(id);
    const result = await this.userModel.destroy({
      where: { id: user.id },
    });

    await this.cacheService.delete(cacheKey);
    return result;
  }

  static cacheKeyById(id) {
    return `user:${id}`;
  }

  static cacheKeyByEmail(email) {
    return `user:email:${email}`;
  }

  static cacheKeyByUsername(username) {
    return `user:username:${username}`;
  }
}

module.exports = UserRepository;
