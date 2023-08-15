const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class CourseRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.courseModel = Models.Course;
    this.registrationModel = Models.Registration;
  }

  async findByCourseId(courseId) {
    const cacheKey = this.constructor.cacheKeyByCourseId(courseId);

    try {
      const course = await this.cacheService.get(cacheKey);

      return JSON.parse(course);
    } catch (error) {
      const course = await this.courseModel.findOne({
        where: { courseId },
        raw: true,
      });

      if (course === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(course));

      return course;
    }
  }

  async countCourseByCategoryId(categoryId) {
    return this.courseModel.count({ where: { categoryId } });
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
      const registration = await this.registrationModel.findOne({
        where: { userId, courseId },
        raw: true,
      });

      if (registration === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(registration));

      return registration;
    }
  }

  async countTotalParticipantsByCourseId(courseId) {
    const totalParticipants = await this.registrationModel.count({
      where: { courseId },
      raw: true,
    });

    return totalParticipants;
  }

  async findAll(offset, limit, query, categoryId, userId) {
    const whereConditions = {};

    if (query && query !== '') {
      Object.assign(whereConditions, {
        title: {
          [Models.Sequelize.Op.iLike]: `%${query}%`,
        },
      });
    }

    if (categoryId && categoryId > 0) {
      Object.assign(whereConditions, {
        categoryId,
      });
    }

    let courseIds = await this.courseModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['courseId'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    if (userId && userId !== '') {
      const whereConditionsUser = { userId };

      if (query && query !== '') {
        Object.assign(whereConditionsUser, {
          '$Course.title$': {
            [Models.Sequelize.Op.iLike]: `%${query}%`,
          },
        });
      }

      courseIds = await this.registrationModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['courseId'],
        include: {
          model: this.courseModel,
          required: true,
          attributes: ['courseId', 'title'],
        },
        where: whereConditionsUser,
        limit,
        offset,
        raw: true,
      });

      return {
        count: courseIds.count,
        rows: courseIds.rows.map((courseIds.rows, (course) => course.courseId)),
      };
    }

    return {
      count: courseIds.count,
      rows: courseIds.rows.map((courseIds.rows, (course) => course.courseId)),
    };
  }

  async create(course) {
    Object.assign(course, {
      courseId: `course-${nanoid(16)}`,
    });

    const result = await this.courseModel.create(course);

    if (result === null) {
      logger.error('create course failed');
      throw new Error('create course failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByCourseId(result.courseId);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async update(course) {
    const result = await this.courseModel.update(course, {
      where: { courseId: course.courseId },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update course failed');
    }

    const cacheKey = this.constructor.cacheKeyByCourseId(result[1][0].courseId);

    await this.cacheService.delete(cacheKey);
    return result[1][0];
  }

  async registerCourse(courseId, userId) {
    const result = await this.registrationModel.create({
      registrationId: `registration-${nanoid(16)}`,
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
        where: { courseId },
      },
    );

    const cacheKey = this.constructor.cacheKeyByCourseId(courseId);
    await this.cacheService.delete(cacheKey);

    const cacheKeyByUserIdAndCourseId =
      this.constructor.cacheKeyByUserIdAndCourseId(userId, courseId);

    await this.cacheService.set(
      cacheKeyByUserIdAndCourseId,
      JSON.stringify(result.dataValues),
    );

    return result.dataValues;
  }

  async deleteByCourseId(courseId, userId) {
    const result = await this.courseModel.destroy({ where: { courseId } });

    await this.courseModel.update(
      { deletedBy: userId },
      {
        where: { courseId },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByCourseId(courseId);

    await this.cacheService.delete(cacheKey);
    return result;
  }

  static cacheKeyByCourseId(courseId) {
    return `course:${courseId}`;
  }

  static cacheKeyByUserIdAndCourseId(userId, courseId) {
    return `course:userId:${userId}:courseId:${courseId}`;
  }
}

module.exports = CourseRepository;
