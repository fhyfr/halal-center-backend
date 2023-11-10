const Models = require('./models');
const logger = require('../helpers/logger');

class PresenceRepostiory {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.presenceModel = Models.Presence;
  }

  async findByPresenceId(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const presence = await this.cacheService.get(cacheKey);

      return JSON.parse(presence);
    } catch (error) {
      const presence = await this.presenceModel.findOne({
        where: { id },
        raw: true,
      });
      if (presence === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(presence));
      return presence;
    }
  }

  async findAll(offset, limit, attendanceId, registrationId) {
    const whereConditions = {};

    if (attendanceId && attendanceId > 0) {
      Object.assign(whereConditions, { attendanceId });
    }

    if (registrationId && registrationId > 0) {
      Object.assign(whereConditions, { registrationId });
    }

    const presences = await this.presenceModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      offset,
      limit,
      raw: true,
    });

    return {
      count: presences.count,
      rows: presences.rows.map((presence) => presence.id),
    };
  }

  async findByAttendanceIdAndRegistrationId(attendanceId, registrationId) {
    // TODO: implement caching for this method
    // create new cache key by attendanceId and registrationId
    const presence = await this.presenceModel.findOne({
      where: { attendanceId, registrationId },
      raw: true,
    });

    if (presence === null) return null;

    return presence;
  }

  // TODO: caching for count method

  async countTotalPresenceByAttendanceId(attendanceId) {
    return this.presenceModel.count({ where: { attendanceId } });
  }

  async countTotalPresenceByRegistrationId(registrationId) {
    return this.presenceModel.count({ where: { registrationId } });
  }

  async create(newPresence) {
    const result = await this.presenceModel.create(newPresence);

    if (result === null) {
      logger.error('failed to create new presence');
      throw new Error('failed to create new presence');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);
    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async deleteById(id, deleterId) {
    const result = await this.presenceModel.destroy({
      where: { id },
    });

    if (result === 0) {
      logger.error('failed to delete presence');
      throw new Error('failed to delete presence');
    }

    await this.presenceModel.update(
      { deletedBy: deleterId },
      { where: { id }, paranoid: true },
    );

    const cacheKey = this.constructor.cacheKeyById(id);
    await this.cacheService.delete(cacheKey);

    return result;
  }

  static cacheKeyById(id) {
    return `presence:${id}`;
  }
}

module.exports = PresenceRepostiory;
