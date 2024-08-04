const Models = require('./models');
const logger = require('../helpers/logger');
const { role } = require('../helpers/constant');

class UserRepository {
  constructor(cacheService) {
    this.userModel = Models.User;
    this.cacheService = cacheService;
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
      attributes: ['id'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

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

  // TODO: implement caching for count method

  async countTotalMembers() {
    return this.userModel.count({
      where: { roleId: role.MEMBER.ID },
    });
  }

  async countTotalInstructors() {
    return this.userModel.count({
      where: { roleId: role.INSTRUCTOR.ID },
    });
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

  async forgotPassword(id, email, username, otp) {
    const result = await this.userModel.update(
      { otp, updatedBy: id, isOtpVerified: false },
      { where: { id } },
    );

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
      this.constructor.cacheKeyByEmail(email),
      this.constructor.cacheKeyByUsername(username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result;
  }

  async updatePassword(id, password) {
    const result = await this.userModel.update(
      { password, isOtpVerified: false, updatedBy: id },
      { where: { id }, returning: true, raw: true },
    );

    if (result[0] === 0) return null;

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
      this.constructor.cacheKeyByEmail(result[1][0].email),
      this.constructor.cacheKeyByUsername(result[1][0].username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async updatePasswordByAdmin(id, userId, password) {
    const result = await this.userModel.update(
      { password, updatedBy: userId },
      { where: { id }, returning: true, raw: true },
    );

    if (result[0] === 0) return null;

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
      this.constructor.cacheKeyByEmail(result[1][0].email),
      this.constructor.cacheKeyByUsername(result[1][0].username),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async update(id, user) {
    const result = await this.userModel.update(user, {
      where: {
        id,
      },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('failed update user');
    }

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
      this.constructor.cacheKeyByUsername(result[1][0].username),
      this.constructor.cacheKeyByEmail(result[1][0].email),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async updateRole(id, roleId) {
    const result = await this.userModel.update(
      {
        roleId,
      },
      { where: { id }, returning: true, raw: true },
    );

    if (result[0] === 0) return null;

    const cacheKey = this.constructor.cacheKeyById(id);
    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async deleteById(id, username, email, deleterId) {
    const result = await this.userModel.destroy({
      where: { id },
    });

    await this.userModel.update(
      { deletedBy: deleterId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
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
      this.constructor.cacheKeyById(userId),
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
      this.constructor.cacheKeyById(userId),
      this.constructor.cacheKeyByEmail(email),
      this.constructor.cacheKeyByUsername(username),
    ];

    await this.cacheService.delete(cacheKeys);
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
