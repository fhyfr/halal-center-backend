const Models = require('./models');
const logger = require('../helpers/logger');

class CourseRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.courseModel = Models.Course;
    this.userCourseModel = Models.UserCourse;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const course = await this.cacheService.get(cacheKey);

      return JSON.parse(course);
    } catch (error) {
      const course = await this.courseModel.findOne({
        where: { id },
        raw: true,
      });

      if (course === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(course));

      return course;
    }
  }

  async findRegistrationByUserIdAndCourseId(userId, courseId) {
    const cacheKey = this.constructor.cacheKeyByUserIdAndCourseId(
      userId,
      courseId,
    );

    try {
      const course = await this.cacheService.get(cacheKey);

      return JSON.parse(course);
    } catch (error) {
      const registration = await this.userCourseModel.findOne({
        where: { userId, courseId },
        raw: true,
      });

      if (registration === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(registration));

      return registration;
    }
  }

  async countTotalParticipantsByCourseId(courseId) {
    const totalParticipants = await this.userCourseModel.count({
      where: { courseId },
      raw: true,
    });

    return totalParticipants;
  }

  async findAll(offset, limit, query, categoryId) {
    const whereConditions = {};

    if (query && query !== '') {
      Object.assign(whereConditions, {
        title: {
          [Models.Sequelize.Op.iLike]: `%${query}%`,
        },
      });
    }

    if (categoryId) {
      Object.assign(whereConditions, {
        categoryId,
      });
    }

    const courseIds = await this.courseModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: courseIds.count,
      rows: courseIds.rows.map((courseIds.rows, (course) => course.id)),
    };
  }

  async create(course) {
    const result = await this.courseModel.create(course);

    if (result === null) {
      logger.error('create course failed');
      throw new Error('create course failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async update(course) {
    const result = await this.courseModel.update(course, {
      where: { id: course.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('failed update course');
    }

    const cacheKey = this.constructor.cacheKeyById(result[1][0].id);

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async registerCourse(courseId, userId) {
    const result = await this.userCourseModel.create({
      userId,
      courseId,
    });

    if (result === null) {
      logger.error('register course failed');
      throw new Error('register course failed');
    }

    // if success then increase total registered
    const totalRegistered = await this.countTotalParticipantsByCourseId(
      courseId,
    );
    await this.courseModel.update(
      { totalRegistered },
      {
        where: { id: courseId },
      },
    );

    const cacheKey = this.constructor.cacheKeyById(courseId);
    await this.cacheService.delete(cacheKey);

    const cacheKeyByUserIdAndCourseId =
      this.constructor.cacheKeyByUserIdAndCourseId(userId, courseId);

    await this.cacheService.set(
      cacheKeyByUserIdAndCourseId,
      JSON.stringify(result.dataValues),
    );

    return result.dataValues;
  }

  async deleteById(id, userId) {
    const result = await this.courseModel.destroy({ where: { id } });

    await this.courseModel.update(
      { deletedBy: userId },
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
    return `course:${id}`;
  }

  static cacheKeyByUserIdAndCourseId(userId, courseId) {
    return `course:user_id:${userId}:course_id:${courseId}`;
  }
}

module.exports = CourseRepository;
