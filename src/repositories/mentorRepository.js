const Models = require('./models');
const logger = require('../helpers/logger');

class InstructorCourseRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.mentorModel = Models.Mentor;
  }

  async findAllByInstructorId(instructorId) {
    const whereConditions = {};

    if (instructorId && instructorId > 0) {
      Object.assign(whereConditions, { instructorId });
    }

    const mentors = await this.mentorModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'courseId'],
      where: whereConditions,
      raw: true,
    });

    return {
      count: mentors.count,
      rows: mentors.rows.map((mentors.rows, (mentor) => mentor.courseId)),
    };
  }

  async findAllByCourseId(courseId) {
    const whereConditions = {};

    if (courseId && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    const mentors = await this.mentorModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'instructorId'],
      where: whereConditions,
      raw: true,
    });

    return {
      count: mentors.count,
      rows: mentors.rows.map((mentors.rows, (mentor) => mentor.instructorId)),
    };
  }

  async create(mentor) {
    const result = await this.mentorModel.create(mentor);

    if (result === null) {
      logger.error('create mentor failed');
      throw new Error('create mentor failed');
    }

    const cacheKeyInstructorId = this.constructor.cacheKeyByInstructorId(
      result.instructorId,
    );
    const cacheKeyCourseId = this.constructor.cacheKeyByCourseId(
      result.courseId,
    );

    await this.cacheService.set(cacheKeyInstructorId, JSON.stringify(result));
    await this.cacheService.set(cacheKeyCourseId, JSON.stringify(result));

    return result.dataValues;
  }

  async deleteByInstructorIdOrCourseId(instructorId, courseId) {
    const whereConditions = {};
    if (instructorId && instructorId > 0) {
      Object.assign(whereConditions, { instructorId });
    }

    if (courseId && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    const result = await this.mentorModel.destroy({
      where: whereConditions,
    });

    const cacheKeys = [
      this.constructor.cacheKeyByInstructorId(result.instructorId),
      this.constructor.cacheKeyByCourseId(result.courseId),
    ];
    await this.cacheService.delete(cacheKeys);

    return result;
  }

  static cacheKeyByInstructorId(instructorId) {
    return `mentor:instructorId:${instructorId}`;
  }

  static cacheKeyByCourseId(courseId) {
    return `mentor:courseId:${courseId}`;
  }
}

module.exports = InstructorCourseRepository;
