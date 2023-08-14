const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class InstructorRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.instructorModel = Models.Instructor;
  }

  async findByInstructorId(instructorId) {
    const cacheKey = this.constructor.cacheKeyByInstructorId(instructorId);

    try {
      const instructor = await this.cacheService.get(cacheKey);

      return JSON.parse(instructor);
    } catch (error) {
      const instructor = await this.instructorModel.findOne({
        where: { instructorId },
        raw: true,
      });

      if (instructor === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(instructor));
      return instructor;
    }
  }

  async findByUserId(userId) {
    const cacheKey = this.constructor.cacheKeyByUserId(userId);

    try {
      const instructor = await this.cacheService.get(cacheKey);

      return JSON.parse(instructor);
    } catch (error) {
      const instructor = await this.instructorModel.findOne({
        where: { userId },
        raw: true,
      });

      if (instructor === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(instructor));
      return instructor;
    }
  }

  async findByEmail(email) {
    const cacheKey = this.constructor.cacheKeyByEmail(email);

    try {
      const instructor = await this.cacheService.get(cacheKey);

      return JSON.parse(instructor);
    } catch (error) {
      const instructor = await this.instructorModel.findOne({
        where: { email },
        raw: true,
      });

      if (instructor === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(instructor));
      return instructor;
    }
  }

  async findAll(offset, limit, query, courseId) {
    if (query && query !== '' && courseId && parseInt(courseId, 10)) {
      const queries =
        'SELECT * FROM "instructors" WHERE ( :courseId =ANY("course_ids") AND "deleted_at" IS NULL AND "full_name" ILIKE :fullName ) ORDER BY "created_at" DESC LIMIT :limit OFFSET :offset;';

      const instructorIds = await Models.sequelize.query(queries, {
        replacements: {
          courseId: parseInt(courseId, 10),
          fullName: `%${query}%`,
          limit,
          offset,
        },
        type: Models.Sequelize.QueryTypes.SELECT,
        raw: true,
      });

      return {
        count: instructorIds.length,
        rows: instructorIds.map(
          (instructorIds.rows, (instructor) => instructor.instructorId),
        ),
      };
    }

    if (query && query !== '') {
      const queries =
        'SELECT * FROM "instructors" WHERE ( "deleted_at" IS NULL AND "full_name" ILIKE :fullName ) ORDER BY "created_at" DESC LIMIT :limit OFFSET :offset;';

      const instructorIds = await Models.sequelize.query(queries, {
        replacements: {
          fullName: `%${query}%`,
          limit,
          offset,
        },
        type: Models.Sequelize.QueryTypes.SELECT,
        raw: true,
      });

      return {
        count: instructorIds.length,
        rows: instructorIds.map(
          (instructorIds.rows, (instructor) => instructor.instructorId),
        ),
      };
    }

    if (courseId && parseInt(courseId, 10) > 0) {
      const queries =
        'SELECT * FROM "instructors" WHERE ( :courseId =ANY("course_ids") AND "deleted_at" IS NULL ) ORDER BY "created_at" DESC LIMIT :limit OFFSET :offset;';

      const instructorIds = await Models.sequelize.query(queries, {
        replacements: { courseId: parseInt(courseId, 10), limit, offset },
        type: Models.Sequelize.QueryTypes.SELECT,
        raw: true,
      });

      return {
        count: instructorIds.length,
        rows: instructorIds.map(
          (instructorIds.rows, (instructor) => instructor.instructorId),
        ),
      };
    }

    const instructorIds = await this.instructorModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['instructorId'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: instructorIds.count,
      rows: instructorIds.rows.map(
        (instructorIds.rows, (employee) => employee.instructorId),
      ),
    };
  }

  async create(instructor) {
    Object.assign(instructor, {
      instructorId: `instructor-${nanoid(16)}`,
    });

    const result = await this.instructorModel.create(instructor);

    if (result === null) {
      logger.error('create instructor failed');
      throw new Error('create instructor failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByInstructorId(
      result.instructorId,
    );
    const cacheKeyEmail = this.constructor.cacheKeyByEmail(result.nik);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeyEmail, JSON.stringify(result));

    return result.dataValues;
  }

  async update(instructor) {
    const result = await this.instructorModel.update(instructor, {
      where: { instructorId: instructor.instructorId },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update instructor failed');
    }

    const cacheKeys = [
      this.constructor.cacheKeyByInstructorId(result[1][0].instructorId),
      this.constructor.cacheKeyByEmail(result[1][0].email),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async deleteByInstructorId(instructorId, userId, email) {
    const result = await this.instructorModel.destroy({
      where: { instructorId },
    });

    await this.instructorModel.update(
      { deletedBy: userId },
      {
        where: { instructorId },
        paranoid: false,
      },
    );

    const cacheKeys = [
      this.constructor.cacheKeyByInstructorId(instructorId),
      this.constructor.cacheKeyByEmail(email),
    ];
    await this.cacheService.delete(cacheKeys);

    return result;
  }

  static cacheKeyByInstructorId(instructorId) {
    return `instructor:${instructorId}`;
  }

  static cacheKeyByEmail(email) {
    return `instructor:email:${email}`;
  }

  static cacheKeyByUserId(userId) {
    return `instructor:userId:${userId}`;
  }
}

module.exports = InstructorRepository;
