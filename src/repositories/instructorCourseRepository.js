const Models = require('./models');
const logger = require('../helpers/logger');

class InstructorCourseRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.instructorCourseModel = Models.InstructorCourse;
  }

  async findAllByInstructorId(instructorId) {
    const whereConditions = {};

    if (instructorId && instructorId > 0) {
      Object.assign(whereConditions, { instructorId });
    }

    const instructorCourses = await this.instructorCourseModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'courseId'],
      where: whereConditions,
      raw: true,
    });

    return {
      count: instructorCourses.count,
      rows: instructorCourses.rows.map(
        (instructorCourses.rows,
        (instructorCourse) => instructorCourse.courseId),
      ),
    };
  }

  async findAllByCourseId(courseId) {
    const whereConditions = {};

    if (courseId && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    const instructorCourses = await this.instructorCourseModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'instructorId'],
      where: whereConditions,
      raw: true,
    });

    return {
      count: instructorCourses.count,
      rows: instructorCourses.rows.map(
        (instructorCourses.rows,
        (instructorCourse) => instructorCourse.instructorId),
      ),
    };
  }

  async create(instructorCourse) {
    const result = await this.instructorCourseModel.create(instructorCourse);

    if (result === null) {
      logger.error('create instructor course failed');
      throw new Error('create instructor course failed');
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
    const whereConditions = [];
    if (instructorId && instructorId > 0) {
      Object.assign(whereConditions, { instructorId });
    }

    if (courseId && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    const result = await this.instructorCourseModel.destroy({
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
    return `course-instructor:${instructorId}`;
  }

  static cacheKeyByCourseId(courseId) {
    return `instructor-course:${courseId}`;
  }
}

module.exports = InstructorCourseRepository;
