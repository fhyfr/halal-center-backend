const Models = require('./models');
const logger = require('../helpers/logger');

class InstructorRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.instructorModel = Models.Instructor;
  }

  async findById(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const instructor = await this.cacheService.get(cacheKey);

      return JSON.parse(instructor);
    } catch (error) {
      const instructor = await this.instructorModel.findOne({
        where: { id },
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
          (instructorIds.rows, (instructor) => instructor.id),
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
          (instructorIds.rows, (instructor) => instructor.id),
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
          (instructorIds.rows, (instructor) => instructor.id),
        ),
      };
    }

    const instructorIds = await this.instructorModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      limit,
      offset,
      raw: true,
    });

    return {
      count: instructorIds.count,
      rows: instructorIds.rows.map(
        (instructorIds.rows, (employee) => employee.id),
      ),
    };
  }

  async create(instructor) {
    const result = await this.instructorModel.create(instructor);

    if (result === null) {
      logger.error('create instructor failed');
      throw new Error('create instructor failed');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);
    const cacheKeyEmail = this.constructor.cacheKeyByEmail(result.nik);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    await this.cacheService.set(cacheKeyEmail, JSON.stringify(result));

    return result.dataValues;
  }

  async update(instructor) {
    const result = await this.instructorModel.update(instructor, {
      where: { id: instructor.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      throw new Error('update instructor failed');
    }

    const cacheKeys = [
      this.constructor.cacheKeyById(result[1][0].id),
      this.constructor.cacheKeyByEmail(result[1][0].email),
    ];

    await this.cacheService.delete(cacheKeys);
    return result[1][0];
  }

  async deleteById(id, userId, email) {
    const result = await this.instructorModel.destroy({ where: { id } });

    await this.instructorModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKeys = [
      this.constructor.cacheKeyById(id),
      this.constructor.cacheKeyByEmail(email),
    ];
    await this.cacheService.delete(cacheKeys);

    return result;
  }

  static cacheKeyById(id) {
    return `instructor:${id}`;
  }

  static cacheKeyByEmail(email) {
    return `instructor:email:${email}`;
  }
}

module.exports = InstructorRepository;
