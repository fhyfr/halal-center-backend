const Models = require('./models');
const logger = require('../helpers/logger');

class ModuleRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.moduleModel = Models.Module;
  }

  async findByModuleId(id) {
    const cacheKey = this.constructor.cacheKeyByModuleId(id);

    try {
      const module = await this.cacheService.get(cacheKey);

      return JSON.parse(module);
    } catch (error) {
      const module = await this.moduleModel.findOne({
        where: { id },
        raw: true,
      });

      if (module === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(module));

      return module;
    }
  }

  async findAll(offset, limit, courseId) {
    const whereConditions = {};

    if (courseId && courseId !== null && courseId > 0) {
      Object.assign(whereConditions, { courseId });
    }

    const moduleIds = await this.moduleModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: moduleIds.count,
      rows: moduleIds.rows.map((moduleIds.rows, (module) => module.id)),
    };
  }

  async create(module) {
    const result = await this.moduleModel.create(module);

    if (result === null) {
      logger.error('create module failed');
      throw new Error('create module failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByModuleId(result.id);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async deleteByModuleId(id, userId) {
    const result = await this.moduleModel.destroy({ where: { id } });

    await this.moduleModel.update(
      { deletedBy: userId },
      {
        where: { id },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByModuleId(id);

    await this.cacheService.delete(cacheKey);
    return result;
  }

  static cacheKeyByModuleId(id) {
    return `module:${id}`;
  }
}

module.exports = ModuleRepository;
