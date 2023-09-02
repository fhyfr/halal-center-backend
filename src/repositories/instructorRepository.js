const Models = require('./models');
const logger = require('../helpers/logger');

class InstructorRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.instructorModel = Models.Instructor;
    this.mentorModel = Models.Mentor;
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
    if (query && query !== '' && courseId && courseId > 0) {
      const instructorIds = await this.mentorModel.findAll({
        attributes: ['instructorId'],
        where: {
          courseId,
        },
        include: [
          {
            model: this.instructorModel,
            as: 'instructor',
            where: {
              fullName: {
                [Models.Sequelize.Op.iLike]: `%${query}%`,
              },
            },
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        raw: true,
      });

      return {
        count: instructorIds.length,
        rows: instructorIds.map((instructor) => ({
          instructorId: instructor.instructorId,
        })),
      };
    }

    if (query && query !== '') {
      const instructorIds = await this.instructorModel.findAndCountAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id'],
        where: {
          fullName: {
            [Models.Sequelize.Op.iLike]: `%${query}%`,
          },
        },
        limit,
        offset,
        raw: true,
      });

      return {
        count: instructorIds.count,
        rows: instructorIds.rows.map(
          (instructorIds.rows, (instructor) => instructor.id),
        ),
      };
    }

    if (courseId && courseId > 0) {
      const instructorIds = await this.mentorModel.findAndCountAll({
        attributes: ['instructorId'],
        where: {
          courseId,
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        raw: true,
      });

      return {
        count: instructorIds.count,
        rows: instructorIds.rows.map(
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
        (instructorIds.rows, (instructor) => instructor.id),
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
