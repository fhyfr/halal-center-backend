const Models = require('./models');
const logger = require('../helpers/logger');

class TestRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.testModel = Models.Test;
  }

  async findByTestId(id) {
    const cacheKey = this.constructor.cacheKeyById(id);

    try {
      const test = await this.cacheService.get(cacheKey);
      return JSON.parse(test);
    } catch (error) {
      const test = await this.testModel.findOne({
        where: { id },
        raw: true,
      });

      if (test === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(test));
      return test;
    }
  }

  async findAll(offset, limit, courseId, type, active) {
    const whereConditions = {};

    if (courseId && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    if (type && type !== '') {
      Object.assign(whereConditions, { type });
    }

    if (active !== undefined) {
      Object.assign(whereConditions, { active });
    }

    const tests = await this.testModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      offset,
      limit,
      raw: true,
    });

    return {
      count: tests.count,
      rows: tests.rows.map((tests.rows, (test) => test.id)),
    };
  }

  async create(newTest) {
    const result = await this.testModel.create(newTest);

    if (result === null) {
      logger.error('failed to create test');
      throw new Error('failed to create test');
    }

    const cacheKeyId = this.constructor.cacheKeyById(result.id);
    await this.cacheService.set(cacheKeyId, JSON.stringify(result));

    return result.dataValues;
  }

  async update(test) {
    const result = await this.testModel.update(test, {
      where: { id: test.id },
      returning: true,
      raw: true,
    });

    if (result[0] === 0) {
      logger.error('failed to update test');
      throw new Error('failed to update test');
    }

    const cacheKey = this.constructor.cacheKeyById(test.id);
    await this.cacheService.delete(cacheKey);

    return result[1][0];
  }

  async deleteById(id, deleterId) {
    const result = await this.testModel.destroy({
      where: { id },
    });

    if (result === 0) {
      logger.error('failed to delete test');
      throw new Error('failed to delete test');
    }

    await this.testModel.update(
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
    return `test:${id}`;
  }
}

module.exports = TestRepository;
