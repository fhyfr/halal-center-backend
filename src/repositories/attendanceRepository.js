const Models = require('./models');
const logger = require('../helpers/logger');

class AttendanceRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.attendanceModel = Models.Attendance;
  }

  async findByAttendanceId(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const attendance = await this.cacheService.get(cacheKey);
      return JSON.parse(attendance);
    } catch (error) {
      const attendance = await this.attendanceModel.findOne({
        where: { id },
        raw: true,
      });

      if (attendance === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(attendance));
      return attendance;
    }
  }

  async findAll(offset, limit, courseId, active) {
    const whereConditions = {};

    if (courseId && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    if (active !== undefined) {
      Object.assign(whereConditions, { active });
    }

    const attendances = await this.attendanceModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      offset,
      limit,
      raw: true,
    });

    return {
      count: attendances.count,
      rows: attendances.rows.map(
        (attendances.rows, (attendance) => attendance.id),
      ),
    };
  }

  async create(newAttendance) {
    const result = await this.attendanceModel.create(newAttendance);

    if (result == null) {
      logger.error('failed to create attendance');
      throw new Error('failed to create attendance');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);
    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async update(attendance) {
    const result = await this.attendanceModel.update(attendance, {
      where: { id: attendance.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      logger.error('failed to update attendance');
      throw new Error('failed to update attendance');
    }

    const cacheKey = this.constructor.cacheKeyById(attendance.id);
    await this.cacheService.delete(cacheKey);

    return result[1][0];
  }

  async deleteById(id, deleterId) {
    const result = await this.attendanceModel.destroy({
      where: { id },
    });

    if (result === 0) {
      logger.error('failed to delete attendance');
      throw new Error('failed to delete attendance');
    }

    await this.attendanceModel.update(
      { deletedBy: deleterId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyById(id);
    await this.cacheService.delete(cacheKey);

    return result;
  }

  static cacheKeyById(id) {
    return `attendance:${id}`;
  }
}

module.exports = AttendanceRepository;
