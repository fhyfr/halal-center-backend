const { nanoid } = require('nanoid');
const Models = require('./models');
const logger = require('../helpers/logger');

class ModuleRepository {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.moduleModel = Models.Module;
  }

  async findByModuleId(moduleId) {
    const cacheKey = this.constructor.cacheKeyByModuleId(moduleId);

    try {
      const module = await this.cacheService.get(cacheKey);

      return JSON.parse(module);
    } catch (error) {
      const module = await this.moduleModel.findOne({
        where: { moduleId },
        raw: true,
      });

      if (module === null) return null;

      await this.cacheService.set(cacheKey, JSON.stringify(module));

      return module;
    }
  }

  async findAll(offset, limit, courseId) {
    const whereConditions = {};

    if (courseId && courseId !== null && courseId !== '') {
      Object.assign(whereConditions, { courseId });
    }

    const moduleIds = await this.moduleModel.findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: ['moduleId'],
      where: whereConditions,
      limit,
      offset,
      raw: true,
    });

    return {
      count: moduleIds.count,
      rows: moduleIds.rows.map((moduleIds.rows, (module) => module.moduleId)),
    };
  }

  async create(module) {
    Object.assign(module, {
      moduleId: `module-${nanoid(16)}`,
    });

    const result = await this.moduleModel.create(module);

    if (result === null) {
      logger.error('create module failed');
      throw new Error('create module failed');
    }

    const cacheKeyId = this.constructor.cacheKeyByModuleId(result.moduleId);

    await this.cacheService.set(cacheKeyId, JSON.stringify(result));
    return result.dataValues;
  }

  async deleteByModuleId(moduleId, userId) {
    const result = await this.moduleModel.destroy({ where: { moduleId } });

    await this.moduleModel.update(
      { deletedBy: userId },
      {
        where: { moduleId },
        paranoid: false,
      },
    );

    const cacheKey = this.constructor.cacheKeyByModuleId(moduleId);

    await this.cacheService.delete(cacheKey);
    return result;
  }

  static cacheKeyByModuleId(moduleId) {
    return `module:${moduleId}`;
  }
}

module.exports = ModuleRepository;
